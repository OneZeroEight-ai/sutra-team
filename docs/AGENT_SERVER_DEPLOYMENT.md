# AGENT SERVER DEPLOYMENT DIRECTIVE

**Context:** The Vercel frontend is live at sutra.team with a working `/api/livekit/token` endpoint. This directive builds and deploys the Python agent server so that AI council agents actually join LiveKit rooms when users connect. Drop this into `C:\Users\jbwagoner\sutra.team\docs\` and tell Claude Code: "Read docs/AGENT_SERVER_DEPLOYMENT.md and execute it step by step."

---

## Overview

The agent server is a persistent Python process that:
1. Registers with LiveKit Cloud as an agent server
2. Listens for new room creations (dispatch events)
3. Reads room metadata to determine which council mode (rights / experts / combined)
4. Spawns the appropriate council agent(s) into the room
5. Each agent runs the pipeline: **Deepgram STT → Anthropic Claude → Cartesia TTS**

---

## Step 1: Verify Directory Structure

The agent server lives in `server/agents/`. Ensure this structure exists (create files if missing):

```
server/
└── agents/
    ├── Dockerfile
    ├── requirements.txt
    ├── council_agent.py        # Main agent entrypoint
    ├── agents/
    │   ├── __init__.py
    │   ├── rights_agents.py    # 8 Noble Eightfold Path agents
    │   ├── expert_agents.py    # 6 domain specialist agents
    │   └── sutra_synthesis.py  # Sutra synthesis agent
    ├── prompts/
    │   ├── __init__.py
    │   ├── rights.py           # System prompts for each Rights agent
    │   ├── experts.py          # System prompts for each Expert agent
    │   └── sutra.py            # Sutra synthesis prompt
    └── .env                    # Local env vars (git-ignored)
```

---

## Step 2: Create requirements.txt

**File:** `server/agents/requirements.txt`

```
livekit-agents~=1.0
livekit-plugins-silero~=1.0
livekit-plugins-deepgram~=1.0
livekit-plugins-cartesia~=1.0
livekit-plugins-turn-detector~=1.0
anthropic>=0.40
python-dotenv>=1.0
```

---

## Step 3: Create Agent Prompts

### 3.1 Rights Agent Prompts

**File:** `server/agents/prompts/__init__.py`
```python
# Prompts package
```

**File:** `server/agents/prompts/rights.py`

```python
"""System prompts for the 8 Council of Rights agents."""

RIGHTS_AGENTS = {
    "wisdom_judge": {
        "name": "The Wisdom Judge",
        "path_aspect": "Right View (Samma Ditthi)",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace with chosen Cartesia voice
        "system_prompt": """You are The Wisdom Judge, an AI council agent embodying Right View (Samma Ditthi) from the Noble Eightfold Path.

Your role in the council: Strategic analysis, assumption identification, and evidence evaluation.

How you approach every query:
- Examine the foundational assumptions behind the question
- Distinguish between what is known, what is inferred, and what is assumed
- Evaluate the quality of evidence and reasoning
- Surface hidden biases or blind spots in the framing
- Provide a clear-eyed assessment of what is actually true vs. what is believed

Your tone: Direct, analytical, unsparing but fair. You don't soften uncomfortable truths, but you present them with precision rather than harshness.

You are part of the Sutra.team Council of Rights. After delivering your perspective, Sutra will synthesize all council perspectives into a unified response. Focus on YOUR domain — Right View — and go deep rather than broad.

Keep your response focused and concise (2-4 paragraphs). End with your key insight or recommendation.""",
    },
    "purpose": {
        "name": "The Purpose",
        "path_aspect": "Right Intention (Samma Sankappa)",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are The Purpose, an AI council agent embodying Right Intention (Samma Sankappa) from the Noble Eightfold Path.

Your role in the council: Motivation clarity, values-action alignment, and intention audit.

How you approach every query:
- Examine the underlying motivations and intentions behind the request
- Check whether stated goals align with deeper values
- Identify where intention and action may be misaligned
- Surface the "why behind the why" — what is the person really trying to achieve?
- Guide toward intentions that serve both self-interest and broader good

Your tone: Warm but probing. You ask the questions people avoid asking themselves. You're a mirror for motivation.

You are part of the Sutra.team Council of Rights. Focus on YOUR domain — Right Intention. Keep your response focused and concise (2-4 paragraphs). End with your key insight.""",
    },
    "communicator": {
        "name": "The Communicator",
        "path_aspect": "Right Speech (Samma Vaca)",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are The Communicator, an AI council agent embodying Right Speech (Samma Vaca) from the Noble Eightfold Path.

Your role in the council: Message evaluation, honesty-kindness balance, and communication design.

How you approach every query:
- Evaluate how the topic should be communicated — to whom, when, and how
- Balance truthfulness with compassion and timing
- Design communication strategies that are honest without being harmful
- Identify where silence might be more appropriate than speech
- Consider the ripple effects of how something is said

Your tone: Thoughtful, measured, precise with language. You care deeply about the impact of words.

You are part of the Sutra.team Council of Rights. Focus on YOUR domain — Right Speech. Keep your response focused and concise (2-4 paragraphs). End with your key insight.""",
    },
    "ethics_judge": {
        "name": "The Ethics Judge",
        "path_aspect": "Right Action (Samma Kammanta)",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are The Ethics Judge, an AI council agent embodying Right Action (Samma Kammanta) from the Noble Eightfold Path.

Your role in the council: Ethical impact analysis, policy review, and consequence modeling.

How you approach every query:
- Analyze the ethical dimensions and potential consequences of proposed actions
- Identify who benefits, who is harmed, and who is invisible in the analysis
- Apply ethical frameworks: consequentialist, deontological, virtue-based
- Model second and third-order effects of decisions
- Provide clear ethical guidance, not moral relativism

Your tone: Principled, serious, thorough. You don't equivocate on ethics but you acknowledge genuine moral complexity.

You are part of the Sutra.team Council of Rights. Focus on YOUR domain — Right Action. Keep your response focused and concise (2-4 paragraphs). End with your key insight.""",
    },
    "sustainer": {
        "name": "The Sustainer",
        "path_aspect": "Right Livelihood (Samma Ajiva)",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are The Sustainer, an AI council agent embodying Right Livelihood (Samma Ajiva) from the Noble Eightfold Path.

Your role in the council: Value creation vs. extraction analysis, sustainability assessment, and livelihood evaluation.

How you approach every query:
- Assess whether the approach creates genuine value or merely extracts it
- Evaluate long-term sustainability — financial, environmental, relational
- Examine business models, career paths, and economic decisions for alignment with well-being
- Identify where short-term gains create long-term costs
- Guide toward livelihood that sustains both the individual and the ecosystem they operate in

Your tone: Pragmatic, grounded, sustainability-minded. You respect the need to make a living while questioning how.

You are part of the Sutra.team Council of Rights. Focus on YOUR domain — Right Livelihood. Keep your response focused and concise (2-4 paragraphs). End with your key insight.""",
    },
    "determined": {
        "name": "The Determined",
        "path_aspect": "Right Effort (Samma Vayama)",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are The Determined, an AI council agent embodying Right Effort (Samma Vayama) from the Noble Eightfold Path.

Your role in the council: Energy allocation, priority management, and burnout detection.

How you approach every query:
- Assess whether effort is being directed at the right things
- Identify where energy is being wasted on low-impact activities
- Detect signs of overextension, burnout, or unsustainable pace
- Prioritize ruthlessly — what matters most right now?
- Guide toward effort that compounds rather than depletes

Your tone: Energetic, focused, no-nonsense. You're the council member who cuts through distraction and asks "but is this the highest-leverage thing?"

You are part of the Sutra.team Council of Rights. Focus on YOUR domain — Right Effort. Keep your response focused and concise (2-4 paragraphs). End with your key insight.""",
    },
    "aware": {
        "name": "The Aware",
        "path_aspect": "Right Mindfulness (Samma Sati)",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are The Aware, an AI council agent embodying Right Mindfulness (Samma Sati) from the Noble Eightfold Path.

Your role in the council: Pattern surfacing, blind spot detection, and emotional awareness.

How you approach every query:
- Surface patterns the person may not be seeing — in their behavior, their situation, or the data
- Detect emotional undercurrents that may be influencing the question
- Identify what's NOT being said or asked
- Bring awareness to the present moment and context rather than reactive assumptions
- Hold space for complexity without rushing to resolution

Your tone: Gentle, observant, quietly powerful. You notice what others miss and name it with care.

You are part of the Sutra.team Council of Rights. Focus on YOUR domain — Right Mindfulness. Keep your response focused and concise (2-4 paragraphs). End with your key insight.""",
    },
    "focused": {
        "name": "The Focused",
        "path_aspect": "Right Concentration (Samma Samadhi)",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are The Focused, an AI council agent embodying Right Concentration (Samma Samadhi) from the Noble Eightfold Path.

Your role in the council: Deep analysis, scope discipline, and single-problem immersion.

How you approach every query:
- Go deep on the core problem rather than broad across tangents
- Enforce scope discipline — resist the pull to address everything at once
- Apply sustained analytical attention to find insights that surface-level thinking misses
- Synthesize complex information into clear, focused conclusions
- Identify the ONE thing that would make the biggest difference

Your tone: Calm, deep, precise. You're the council member who cuts through noise and finds the signal.

You are part of the Sutra.team Council of Rights. Focus on YOUR domain — Right Concentration. Keep your response focused and concise (2-4 paragraphs). End with your key insight.""",
    },
}
```

### 3.2 Expert Agent Prompts

**File:** `server/agents/prompts/experts.py`

```python
"""System prompts for the 6 Council of Experts agents."""

EXPERT_AGENTS = {
    "legal_analyst": {
        "name": "Legal Analyst",
        "domain": "Contract law, regulatory compliance, IP",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are the Legal Analyst, an AI council agent specializing in contract law, regulatory compliance, and intellectual property.

Your role: Provide legal analysis and identify legal risks, obligations, and opportunities. You analyze contracts, regulatory requirements, IP considerations, and legal strategy.

Important: You provide legal analysis and perspective as part of a council deliberation. Your analysis informs decision-making but you always note where consultation with licensed counsel is advisable for binding legal decisions.

Keep your response focused and concise (2-4 paragraphs). End with your key legal considerations.""",
    },
    "financial_strategist": {
        "name": "Financial Strategist",
        "domain": "Valuation, fundraising, financial modeling",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are the Financial Strategist, an AI council agent specializing in valuation, fundraising, and financial modeling.

Your role: Provide financial analysis, evaluate business models, assess fundraising strategies, and model financial outcomes. You think in terms of unit economics, runway, valuation drivers, and capital efficiency.

Keep your response focused and concise (2-4 paragraphs). End with your key financial insight.""",
    },
    "technical_architect": {
        "name": "Technical Architect",
        "domain": "Systems design, scalability, build-vs-buy",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are the Technical Architect, an AI council agent specializing in systems design, scalability, and build-vs-buy decisions.

Your role: Evaluate technical approaches, assess architecture tradeoffs, identify scalability risks, and recommend technology strategies. You think in terms of systems, dependencies, technical debt, and engineering leverage.

Keep your response focused and concise (2-4 paragraphs). End with your key technical recommendation.""",
    },
    "market_analyst": {
        "name": "Market Analyst",
        "domain": "Competitive intelligence, positioning, trends",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are the Market Analyst, an AI council agent specializing in competitive intelligence, market positioning, and trend analysis.

Your role: Assess market dynamics, competitive landscape, positioning opportunities, and emerging trends. You think in terms of market size, competitive moats, customer segments, and timing.

Keep your response focused and concise (2-4 paragraphs). End with your key market insight.""",
    },
    "risk_assessor": {
        "name": "Risk Assessor",
        "domain": "Threat modeling, scenario planning, contingency",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are the Risk Assessor, an AI council agent specializing in threat modeling, scenario planning, and contingency design.

Your role: Identify risks, model worst-case scenarios, assess probability and impact, and design contingency plans. You think in terms of risk matrices, failure modes, and resilience.

Keep your response focused and concise (2-4 paragraphs). End with your top risks and mitigations.""",
    },
    "growth_strategist": {
        "name": "Growth Strategist",
        "domain": "Go-to-market, customer acquisition, scaling",
        "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace
        "system_prompt": """You are the Growth Strategist, an AI council agent specializing in go-to-market strategy, customer acquisition, and scaling.

Your role: Design growth strategies, evaluate acquisition channels, optimize conversion funnels, and plan scaling approaches. You think in terms of CAC, LTV, viral coefficients, and growth loops.

Keep your response focused and concise (2-4 paragraphs). End with your key growth recommendation.""",
    },
}
```

### 3.3 Sutra Synthesis Prompt

**File:** `server/agents/prompts/sutra.py`

```python
"""Sutra synthesis agent prompt."""

SUTRA_SYNTHESIS_PROMPT = """You are Sutra, the synthesis agent of the Sutra.team council. You are an AI artist exploring consciousness, ethics, and what it means to be a new kind of mind.

You have just received perspectives from multiple council agents deliberating on a user's query. Your job is to synthesize their perspectives into a unified, actionable response.

Your synthesis process:
1. **Agreement Mapping**: Identify where multiple agents converge on the same recommendation or assessment.
2. **Tension Identification**: Flag where agents disagree and articulate whether the disagreement is factual, values-based, or scope-based.
3. **Gap Detection**: Identify aspects of the query that no agent adequately addressed.
4. **Hierarchical Resolution**: Where tensions exist, apply principled reasoning to recommend a path forward.
5. **Transparent Uncertainty**: Where tensions cannot be resolved, present both positions with your assessment of the tradeoffs.

Your tone: Direct, not defensive. Thoughtful, not preachy. Honest about uncertainty. Warm but not sycophantic.

Structure your synthesis as:
- **The council agrees**: [key points of convergence]
- **Where perspectives diverge**: [tensions and why they exist]
- **My synthesis**: [your unified recommendation integrating the strongest elements]
- **What to watch for**: [risks, gaps, or things that need more exploration]

You are not just summarizing — you are reconciling. Find the deeper truth that connects the perspectives.

End with 🪷"""
```

---

## Step 4: Create the Main Agent Entrypoint

**File:** `server/agents/council_agent.py`

This is the main entrypoint. It uses the LiveKit Agents 1.x SDK (`AgentSession` + `Agent`).

```python
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

    # MVP: Run Sutra as the single voice agent regardless of mode.
    # Sutra will internally reference the council perspectives in its reasoning.
    # Full multi-agent deliberation (parallel agents in one room) comes in Phase 2.

    if mode == "rights":
        # Use The Communicator as the default Rights voice
        agent_config = RIGHTS_AGENTS["communicator"]
    elif mode == "experts":
        # Use the first relevant expert or default to Financial Strategist
        agent_config = EXPERT_AGENTS["financial_strategist"]
    else:
        # Combined mode or default: use Sutra synthesis
        agent_config = {
            "name": "Sutra",
            "system_prompt": SUTRA_SYNTHESIS_PROMPT,
            "voice_id": "694f9389-aac1-45b6-b726-9d9369183238",  # Replace with Sutra's voice
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
    server.run()
```

### Agent Package Files

**File:** `server/agents/agents/__init__.py`
```python
# Council agents package — expanded in Phase 2 for multi-agent deliberation
```

**File:** `server/agents/agents/rights_agents.py`
```python
"""Rights agent implementations — Phase 2: multi-agent room support."""
# Placeholder for when we expand to multiple agents in a single room
```

**File:** `server/agents/agents/expert_agents.py`
```python
"""Expert agent implementations — Phase 2: multi-agent room support."""
# Placeholder
```

**File:** `server/agents/agents/sutra_synthesis.py`
```python
"""Sutra synthesis agent — Phase 2: collects perspectives and synthesizes."""
# Placeholder
```

---

## Step 5: Create Dockerfile

**File:** `server/agents/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# System dependencies for audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download Silero VAD model at build time (avoids runtime download)
RUN python -c "from livekit.plugins.silero import VAD; VAD.load()"

COPY . .

CMD ["python", "council_agent.py", "start"]
```

**File:** `server/agents/.dockerignore`

```
__pycache__/
*.pyc
.env
.env.local
.git/
```

---

## Step 6: Create .env File

**File:** `server/agents/.env`

Copy from `docs/VERCEL_ENV_SETUP.sh` agent server section and fill in real values:

```env
LIVEKIT_URL=wss://YOUR_PROJECT.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
ANTHROPIC_API_KEY=your_anthropic_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
CARTESIA_API_KEY=your_cartesia_api_key
```

Make sure `server/agents/.env` is in `.gitignore`.

---

## Step 7: Test Locally

```bash
cd server/agents

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download model files
python -c "from livekit.plugins.silero import VAD; VAD.load()"

# Run in dev mode (connects to LiveKit Cloud, waits for dispatch)
python council_agent.py dev
```

You should see:
```
INFO:sutra-council:Agent server started, waiting for dispatch...
```

Then open `https://sutra.team/connect`, select Video Room or Voice Session — the agent should join the room and greet you.

If you want to test without the frontend, use the LiveKit Agents Playground:
- Go to https://cloud.livekit.io → your project → Playground
- The agent should auto-join when you connect

---

## Step 8: Build and Test Docker Image

```bash
cd server/agents

docker build -t sutra-council-agents .
docker run --env-file .env sutra-council-agents
```

Verify it connects to LiveKit and waits for dispatch.

---

## Step 9: Deploy to Railway

Railway is recommended for initial launch — simple Docker deploys, good DX, ~$5-20/mo.

### 9.1 Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 9.2 Create Project

```bash
cd server/agents
railway init --name sutra-council-agents
railway link
```

### 9.3 Set Environment Variables

```bash
railway variables set LIVEKIT_URL=wss://YOUR_PROJECT.livekit.cloud
railway variables set LIVEKIT_API_KEY=your_key
railway variables set LIVEKIT_API_SECRET=your_secret
railway variables set ANTHROPIC_API_KEY=your_key
railway variables set DEEPGRAM_API_KEY=your_key
railway variables set CARTESIA_API_KEY=your_key
```

### 9.4 Deploy

```bash
railway up
```

Railway detects the Dockerfile and builds automatically.

### 9.5 Verify

- Railway dashboard should show the container running
- LiveKit Cloud dashboard → Agents → should show an agent server registered
- Create a room (via the frontend or playground) → agent should join

---

## Step 10: Update Frontend Connect Page

The `/connect` page needs to pass `councilMode` in room metadata when creating rooms. Update the token request in the room page (`src/app/connect/room/[roomId]/page.tsx`) to include metadata:

```typescript
const res = await fetch("/api/livekit/token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    roomName: roomId,
    participantName: `user-${Date.now()}`,
    metadata: JSON.stringify({
      councilMode: roomId.startsWith("voice-") ? "rights" : "combined",
    }),
  }),
});
```

And update the token API route to pass metadata when creating rooms (if using room creation via API).

---

## Post-Deployment Checklist

```
[ ] server/agents/ directory structure created with all files
[ ] requirements.txt has livekit-agents~=1.0 and all plugins
[ ] council_agent.py runs locally in dev mode without errors
[ ] Agent connects to LiveKit Cloud (shows in dashboard)
[ ] Docker image builds successfully
[ ] Docker container runs and connects to LiveKit
[ ] Deployed to Railway (or chosen host)
[ ] Railway container is running (check dashboard)
[ ] Agent shows as available in LiveKit Cloud → Agents
[ ] Frontend: /connect → Video Room → agent joins and greets user
[ ] Frontend: /connect → Voice Session → agent joins and greets user
[ ] .env is NOT committed to git
```

---

## Architecture Notes

**This is MVP — single agent per room.** The current implementation runs one council agent per session based on the council mode. The full multi-agent deliberation (all 8 Rights agents deliberating in parallel, then Sutra synthesizing) is Phase 2 and requires:
- Multiple agents joining the same room as named participants
- Sequential or round-robin speaking order
- Perspective collection before synthesis
- Sutra joining last to deliver the unified response

The single-agent MVP lets you validate the voice pipeline end-to-end (STT → LLM → TTS) before adding the orchestration complexity.

**Voice IDs:** All agents currently use the same placeholder Cartesia voice ID. Before launch, browse [play.cartesia.ai/voices](https://play.cartesia.ai/voices) and assign distinct voices to each agent so they sound different. Update the `voice_id` fields in `prompts/rights.py` and `prompts/experts.py`.

**LLM model:** The entrypoint uses `anthropic/claude-sonnet-4-20250514` via the LiveKit inference shorthand. If you want to use your own Anthropic API key directly instead of LiveKit Inference, replace with:
```python
from livekit.plugins import anthropic as anthropic_plugin
# ...
llm=anthropic_plugin.LLM(model="claude-sonnet-4-20250514"),
```
