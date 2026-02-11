"""
Council Agent — Main entrypoint for the LiveKit agent server.

Spawns council agents into LiveKit rooms based on the council_mode
set in room metadata. Each agent runs the pipeline:
    User Audio → Deepgram STT → Anthropic Claude LLM → Cartesia TTS → Audio

Usage:
    python council_agent.py dev
"""

import os
import logging

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
)
from livekit.plugins import silero, deepgram, cartesia

from rights_agents import RIGHTS_AGENT_CONFIGS
from expert_agents import EXPERT_AGENT_CONFIGS
from sutra_synthesis import SUTRA_SYNTHESIS_CONFIG

load_dotenv()
logger = logging.getLogger("council-agent")


class CouncilAgent(Agent):
    """A single council agent that joins a LiveKit room as a participant."""

    def __init__(self, agent_config: dict):
        super().__init__(
            instructions=agent_config["system_prompt"],
        )
        self.agent_name = agent_config["name"]
        self.agent_config = agent_config


def get_agents_for_mode(council_mode: str) -> list[dict]:
    """Return agent configs based on the council mode."""
    if council_mode == "rights":
        return RIGHTS_AGENT_CONFIGS
    elif council_mode == "experts":
        return EXPERT_AGENT_CONFIGS
    elif council_mode == "combined":
        return RIGHTS_AGENT_CONFIGS + EXPERT_AGENT_CONFIGS
    else:
        logger.warning(f"Unknown council mode: {council_mode}, defaulting to rights")
        return RIGHTS_AGENT_CONFIGS


def prewarm(proc: JobProcess):
    """Preload models for faster agent startup."""
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    """
    Main agent entrypoint — called when a user joins a room.

    Reads council_mode from room metadata, spawns the appropriate agents,
    and sets up the STT → LLM → TTS pipeline.
    """
    await ctx.connect()

    # Read council mode from room metadata (set by the token route)
    council_mode = ctx.room.metadata or "rights"
    logger.info(f"Room {ctx.room.name}: council_mode={council_mode}")

    agent_configs = get_agents_for_mode(council_mode)

    # For the initial implementation, spawn a single agent that represents
    # the first available council member. Full multi-agent dispatch will
    # use LiveKit's multi-agent rooms in a future phase.
    primary_config = agent_configs[0] if agent_configs else SUTRA_SYNTHESIS_CONFIG

    agent = CouncilAgent(agent_config=primary_config)

    session = AgentSession(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(model="nova-3"),
        tts=cartesia.TTS(),
    )

    await session.start(agent=agent, room=ctx.room)

    logger.info(f"Agent '{primary_config['name']}' active in room {ctx.room.name}")


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        )
    )
