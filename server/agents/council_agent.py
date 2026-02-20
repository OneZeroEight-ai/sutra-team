"""
Sutra.team Council Agent Server

Registers with LiveKit Cloud and dispatches council agents
based on room metadata (council_mode + agent_id).

Config source priority:
  1. Samma Suit API (voice-config + gateway) — if SAMMASUIT_API_URL/KEY set
  2. Hardcoded prompts (prompts/rights.py etc.) — fallback

Usage:
    python council_agent.py dev      # Development mode
    python council_agent.py start    # Production mode
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

from livekit.agents import Agent, AgentSession, AgentServer, JobContext
from livekit.agents.utils.audio import audio_frames_from_file
from livekit.plugins import silero, deepgram, cartesia

# Fallback: direct Anthropic plugin (used when API is unavailable)
from livekit.plugins import anthropic as anthropic_plugin

# Fallback: hardcoded agent prompts
from prompts.rights import RIGHTS_AGENTS
from prompts.experts import EXPERT_AGENTS
from prompts.sutra import SUTRA_SYNTHESIS_PROMPT

# Samma Suit API integration
from samma_client import SammaSuitClient
from samma_llm import SammaSuitLLM

from cost_tracker import (
    SessionCostRecord, ServiceUsage,
    calculate_anthropic_cost, calculate_livekit_cost,
    log_session_cost, check_alerts
)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sutra-council")


def get_council_config(room_metadata: str) -> dict:
    """Parse room metadata to determine council configuration.

    Expected metadata JSON:
        {
            "councilMode": "rights" | "experts" | "combined",
            "agentId": "<samma-agent-uuid>"   // optional, enables API path
        }
    """
    try:
        meta = json.loads(room_metadata) if room_metadata else {}
    except json.JSONDecodeError:
        meta = {}

    return {
        "mode": meta.get("councilMode", "rights"),
        "agent_id": meta.get("agentId"),
        "metadata": meta,
    }


def select_agent(council_config: dict) -> tuple[dict, str]:
    """Select which agent to run based on council config (fallback path).

    For MVP, we run a single agent per room.
    Multi-agent deliberation (spawning all 8/6/14 agents) is Phase 2.

    Returns:
        Tuple of (agent_config dict, cartesia voice_id)
    """
    mode = council_config["mode"]

    if mode == "rights":
        agent_config = RIGHTS_AGENTS["communicator"]
    elif mode == "experts":
        agent_config = EXPERT_AGENTS["financial_strategist"]
    else:
        agent_config = {
            "name": "Sutra",
            "system_prompt": SUTRA_SYNTHESIS_PROMPT,
            "voice_id": "71a7ad14-091c-4e8e-a314-022ece01c121",
        }

    return agent_config, agent_config["voice_id"]


# --- Agent Server ---

server = AgentServer()


@server.rtc_session()
async def entrypoint(ctx: JobContext):
    """Called when a new room needs an agent."""
    logger.info(f"Agent dispatched to room: {ctx.room.name}")

    council_config = get_council_config(ctx.room.metadata or "")
    agent_id_from_meta = council_config.get("agent_id")

    # ── Samma Suit API path ──
    samma_client = SammaSuitClient()
    using_api = False
    voice_config = None
    voice_session = None

    if samma_client.configured and agent_id_from_meta:
        try:
            # Fetch voice config from API
            voice_config = await samma_client.get_voice_config(agent_id_from_meta)
            logger.info(
                f"Loaded voice config from API: agent={voice_config.agent_name}, "
                f"voice={voice_config.tts_voice_id[:12]}..."
            )

            # Register voice session (KARMA budget check happens server-side)
            voice_session = await samma_client.start_voice_session(
                agent_id_from_meta, session_type="voice"
            )
            logger.info(
                f"Voice session started: {voice_session.session_id}, "
                f"budget_remaining=${voice_session.budget_remaining:.2f}"
            )

            using_api = True

        except Exception as e:
            logger.warning(f"Samma Suit API unavailable, falling back to hardcoded config: {e}")
            using_api = False

    # ── Determine agent configuration ──
    if using_api and voice_config:
        # API path: gateway provides enriched system prompt, so Agent gets
        # empty instructions to avoid double-injection.
        system_prompt = ""
        voice_id = voice_config.tts_voice_id
        tts_model = voice_config.tts_model
        stt_model = voice_config.stt_model
        llm_model = voice_config.model
        agent_name = voice_config.agent_name

        llm_plugin = SammaSuitLLM(
            client=samma_client,
            agent_id=agent_id_from_meta,
            model=llm_model,
            max_tokens=1024,
        )
    else:
        # Fallback path: hardcoded config + direct Anthropic
        agent_config, voice_id = select_agent(council_config)
        system_prompt = agent_config["system_prompt"]
        tts_model = "sonic-3"
        stt_model = "nova-3"
        llm_model = "claude-sonnet-4-20250514"
        agent_name = agent_config["name"]

        llm_plugin = anthropic_plugin.LLM(model=llm_model)

    logger.info(
        f"Council mode: {council_config['mode']}, "
        f"Agent: {agent_name}, API: {using_api}"
    )

    # ── Initialize local cost record (always runs, API or fallback) ──
    cost_record = SessionCostRecord(
        session_id=voice_session.session_id if voice_session else ctx.room.name,
        room_name=ctx.room.name,
        council_mode=council_config["mode"],
        agent_name=agent_name,
        started_at=datetime.now(timezone.utc).isoformat(),
    )

    # ── Create the agent ──
    council_agent = Agent(instructions=system_prompt or None)

    # ── Create session with voice pipeline ──
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(model=stt_model, language="multi"),
        llm=llm_plugin,
        tts=cartesia.TTS(model=tts_model, voice=voice_id),
    )

    # ── Track LLM usage via session events (local cost estimate) ──
    @session.on("agent_speech_committed")
    def on_speech(event):
        output_chars = len(event.content) if hasattr(event, "content") else 0
        est_output_tokens = output_chars // 4
        est_input_tokens = 8000

        cost = calculate_anthropic_cost(llm_model, est_input_tokens, est_output_tokens)
        cost_record.add_usage(ServiceUsage(
            service="anthropic",
            operation="llm_completion",
            input_tokens=est_input_tokens,
            output_tokens=est_output_tokens,
            estimated_cost_usd=cost,
            timestamp=datetime.now(timezone.utc).isoformat(),
            metadata={"model": llm_model, "via_gateway": using_api},
        ))

    # ── Start the session ──
    await session.start(agent=council_agent, room=ctx.room)

    # Play intro audio
    await _play_intro(session)

    # Greet the user
    greeting = _build_greeting(agent_name, council_config["mode"], voice_config)
    await session.generate_reply(instructions=greeting)

    # ── Session close handler ──
    @session.on("close")
    def on_close():
        # Local cost tracking (always runs)
        lk_cost = calculate_livekit_cost(cost_record.duration_seconds / 60.0 * 2)
        cost_record.add_usage(ServiceUsage(
            service="livekit",
            operation="room_usage",
            audio_seconds=cost_record.duration_seconds,
            estimated_cost_usd=lk_cost,
            timestamp=datetime.now(timezone.utc).isoformat(),
        ))

        cost_record.finalize()
        log_session_cost(cost_record)

        alerts = check_alerts(cost_record)
        for alert in alerts:
            logger.warning(alert)

        logger.info(
            f"Session {cost_record.session_id} cost: ${cost_record.total_cost_usd:.4f} "
            f"({cost_record.duration_seconds:.0f}s, {cost_record.council_mode}, api={using_api})"
        )

        # Report costs to Samma Suit API (fire-and-forget)
        if using_api and voice_session:
            asyncio.ensure_future(_report_session_end(
                samma_client=samma_client,
                agent_id=agent_id_from_meta,
                voice_session=voice_session,
                cost_record=cost_record,
            ))


async def _report_session_end(
    samma_client: SammaSuitClient,
    agent_id: str,
    voice_session,
    cost_record: SessionCostRecord,
):
    """Report session costs to Samma Suit API and clean up the client."""
    try:
        # Sum token usage from local tracking
        total_tokens = sum(
            u.get("input_tokens", 0) + u.get("output_tokens", 0)
            for u in cost_record.usages
            if u.get("service") == "anthropic"
        )
        total_tts_chars = sum(
            u.get("characters", 0)
            for u in cost_record.usages
            if u.get("service") == "cartesia"
        )

        await samma_client.end_voice_session(
            agent_id=agent_id,
            session_id=voice_session.session_id,
            duration_seconds=cost_record.duration_seconds,
            tokens_used=total_tokens,
            tts_characters=total_tts_chars,
            stt_minutes=cost_record.duration_seconds / 60.0,
            total_cost_usd=cost_record.total_cost_usd,
        )
        logger.info(f"Reported session costs to Samma Suit API: ${cost_record.total_cost_usd:.4f}")

    except Exception as e:
        logger.error(f"Failed to report session costs to API: {e}")

    finally:
        await samma_client.aclose()


# --- Intro & Greeting ---

INTRO_WAV = Path(__file__).parent / "assets" / "intro.wav"


async def _play_intro(session: AgentSession):
    """Play a brief audio intro at the start of every session.

    Plays a soft chime WAV followed by TTS-spoken "Welcome to Sutra."
    Total duration: ~3-4 seconds. Non-interruptible so the user hears the
    full intro even if they speak immediately.
    """
    if INTRO_WAV.exists():
        try:
            chime_frames = audio_frames_from_file(
                str(INTRO_WAV),
                sample_rate=48000,
                num_channels=1,
            )
            handle = session.say(
                text="",
                audio=chime_frames,
                allow_interruptions=False,
                add_to_chat_ctx=False,
            )
            await handle
        except Exception as e:
            logger.warning(f"Failed to play intro chime: {e}")
    else:
        logger.warning(f"Intro WAV not found at {INTRO_WAV}")

    try:
        handle = session.say(
            text="Welcome to Sutra.",
            allow_interruptions=False,
            add_to_chat_ctx=False,
        )
        await handle
    except Exception as e:
        logger.warning(f"Failed to speak intro: {e}")


def _build_greeting(agent_name: str, mode: str, voice_config=None) -> str:
    """Generate a context-appropriate greeting instruction."""
    if voice_config and voice_config.eightfold_path_aspect:
        aspect = voice_config.eightfold_path_aspect
        return (
            f"Greet the user briefly. You are {agent_name}, grounded in {aspect}. "
            f"Let them know your perspective and ask what they'd like to explore."
        )

    if voice_config and voice_config.council_type == "experts":
        return (
            f"Greet the user briefly. You are {agent_name} from the Council of Experts. "
            f"Let them know your area of expertise and ask how you can help."
        )

    if mode == "rights":
        return (
            f"Greet the user briefly. You are {agent_name} from the Council of Rights. "
            f"Let them know you're here to offer your perspective and ask what they'd like to explore."
        )
    elif mode == "experts":
        return (
            f"Greet the user briefly. You are {agent_name} from the Council of Experts. "
            f"Let them know your area of expertise and ask how you can help."
        )
    else:
        return (
            "Greet the user briefly. You are Sutra, the synthesis voice of the council. "
            "Let them know you're here to help them think through their question from multiple angles."
        )


if __name__ == "__main__":
    from livekit.agents import cli
    cli.run_app(server)
