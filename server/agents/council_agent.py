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
from dotenv import load_dotenv

from livekit.agents import Agent, AgentSession, AgentServer, JobContext
from livekit.plugins import silero, deepgram, cartesia

from prompts.rights import RIGHTS_AGENTS
from prompts.experts import EXPERT_AGENTS
from prompts.sutra import SUTRA_SYNTHESIS_PROMPT

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

    # Create the agent
    council_agent = Agent(
        instructions=agent_config["system_prompt"],
    )

    # Create session with the voice pipeline
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm="anthropic/claude-sonnet-4-20250514",
        tts=cartesia.TTS(model="sonic-3", voice=voice_id),
    )

    # Start the session
    await session.start(
        agent=council_agent,
        room=ctx.room,
    )

    # Greet the user
    greeting = _get_greeting(agent_config, council_config["mode"])
    await session.generate_reply(instructions=greeting)


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