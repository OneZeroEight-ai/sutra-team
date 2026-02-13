"""
Sutra.team Council Agent Server

Registers with LiveKit Cloud and dispatches council agents
based on room metadata (council_mode: rights | experts | combined).

Usage:
    python council_agent.py dev      # Development mode
    python council_agent.py start    # Production mode
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

from livekit.agents import Agent, AgentSession, AgentServer, JobContext
from livekit.agents.utils.audio import audio_frames_from_file
from livekit.plugins import silero, deepgram, cartesia

from livekit.plugins import anthropic as anthropic_plugin

from prompts.rights import RIGHTS_AGENTS
from prompts.experts import EXPERT_AGENTS
from prompts.sutra import SUTRA_SYNTHESIS_PROMPT

from cost_tracker import (
    SessionCostRecord, ServiceUsage,
    calculate_anthropic_cost, calculate_livekit_cost,
    log_session_cost, check_alerts
)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sutra-council")


def get_council_config(room_metadata: str) -> dict:
    """Parse room metadata to determine council configuration."""
    try:
        meta = json.loads(room_metadata) if room_metadata else {}
    except json.JSONDecodeError:
        meta = {}

    council_mode = meta.get("councilMode", "rights")
    return {
        "mode": council_mode,
        "metadata": meta,
    }


def select_agent(council_config: dict) -> tuple[dict, str]:
    """Select which agent to run based on council config.

    For MVP, we run a single agent per room (Sutra as the primary voice).
    Multi-agent deliberation (spawning all 8/6/14 agents) is Phase 2.

    Returns:
        Tuple of (agent_config dict, cartesia voice_id)
    """
    mode = council_config["mode"]

    # MVP: Run a representative agent based on council mode.
    # Full multi-agent deliberation (parallel agents in one room) comes in Phase 2.

    if mode == "rights":
        # Use The Communicator as the default Rights voice
        agent_config = RIGHTS_AGENTS["communicator"]
    elif mode == "experts":
        # Use Financial Strategist as the default Experts voice
        agent_config = EXPERT_AGENTS["financial_strategist"]
    else:
        # Combined mode or default: use Sutra synthesis
        agent_config = {
            "name": "Sutra",
            "system_prompt": SUTRA_SYNTHESIS_PROMPT,
            "voice_id": "71a7ad14-091c-4e8e-a314-022ece01c121",  # Charlotte — synthesizing clarity
        }

    return agent_config, agent_config["voice_id"]


# --- Agent Server ---

server = AgentServer()


@server.rtc_session()
async def entrypoint(ctx: JobContext):
    """Called when a new room needs an agent."""
    logger.info(f"Agent dispatched to room: {ctx.room.name}")

    # Parse room metadata for council configuration
    council_config = get_council_config(ctx.room.metadata or "")
    agent_config, voice_id = select_agent(council_config)

    logger.info(
        f"Council mode: {council_config['mode']}, "
        f"Agent: {agent_config['name']}"
    )

    # Initialize cost record
    cost_record = SessionCostRecord(
        session_id=ctx.room.name,
        room_name=ctx.room.name,
        council_mode=council_config["mode"],
        agent_name=agent_config["name"],
        started_at=datetime.now(timezone.utc).isoformat(),
    )

    # Create the agent
    council_agent = Agent(
        instructions=agent_config["system_prompt"],
    )

    # Create session with the voice pipeline
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm=anthropic_plugin.LLM(model="claude-sonnet-4-20250514"),
        tts=cartesia.TTS(model="sonic-3", voice=voice_id),
    )

    # Track LLM usage via session events
    @session.on("agent_speech_committed")
    def on_speech(event):
        # Estimate tokens from response length (rough: 1 token ~ 4 chars)
        output_chars = len(event.content) if hasattr(event, "content") else 0
        est_output_tokens = output_chars // 4
        est_input_tokens = 8000  # System prompt baseline

        cost = calculate_anthropic_cost(
            "claude-sonnet-4-20250514", est_input_tokens, est_output_tokens
        )
        cost_record.add_usage(ServiceUsage(
            service="anthropic",
            operation="llm_completion",
            input_tokens=est_input_tokens,
            output_tokens=est_output_tokens,
            estimated_cost_usd=cost,
            timestamp=datetime.now(timezone.utc).isoformat(),
            metadata={"model": "claude-sonnet-4-20250514"},
        ))

    # Start the session
    await session.start(
        agent=council_agent,
        room=ctx.room,
    )

    # Play intro audio: chime + spoken "Welcome to Sutra"
    await _play_intro(session)

    # Greet the user
    greeting = _get_greeting(agent_config, council_config["mode"])
    await session.generate_reply(instructions=greeting)

    # When session ends, finalize and log
    @session.on("close")
    def on_close():
        # Add LiveKit room cost (2 participants: agent + user)
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

        # Check alerts
        alerts = check_alerts(cost_record)
        for alert in alerts:
            logger.warning(alert)

        logger.info(
            f"Session {cost_record.session_id} cost: ${cost_record.total_cost_usd:.4f} "
            f"({cost_record.duration_seconds:.0f}s, {cost_record.council_mode})"
        )


INTRO_WAV = Path(__file__).parent / "assets" / "intro.wav"


async def _play_intro(session: AgentSession):
    """Play a brief audio intro at the start of every session.

    Plays a soft chime WAV followed by TTS-spoken "Welcome to Sutra."
    Total duration: ~3-4 seconds. Non-interruptible so the user hears the
    full intro even if they speak immediately.
    """
    # Step 1: Play the chime WAV (2.5s soft arpeggio)
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

    # Step 2: TTS-spoken intro (uses the session's Cartesia voice)
    try:
        handle = session.say(
            text="Welcome to Sutra.",
            allow_interruptions=False,
            add_to_chat_ctx=False,
        )
        await handle
    except Exception as e:
        logger.warning(f"Failed to speak intro: {e}")


def _get_greeting(agent_config: dict, mode: str) -> str:
    """Generate a context-appropriate greeting."""
    name = agent_config["name"]

    if mode == "rights":
        return (
            f"Greet the user briefly. You are {name} from the Council of Rights. "
            f"Let them know you're here to offer your perspective and ask what they'd like to explore."
        )
    elif mode == "experts":
        return (
            f"Greet the user briefly. You are {name} from the Council of Experts. "
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