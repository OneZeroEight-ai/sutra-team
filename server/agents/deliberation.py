"""
Sutra.team Deliberation Engine — FastAPI Endpoint

Multi-agent council deliberation via the Anthropic API.
Runs alongside the LiveKit council_agent.py on the agent server (Railway).

POST /deliberate  — run a full council deliberation
GET  /health      — health check
"""

import asyncio
import logging
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

import anthropic
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from cost_tracker import (
    SessionCostRecord,
    ServiceUsage,
    calculate_anthropic_cost,
    log_session_cost,
    check_alerts,
)
from prompts.experts import EXPERT_AGENTS
from prompts.rights import RIGHTS_AGENTS
from prompts.sutra import SUTRA_SYNTHESIS_PROMPT

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sutra-deliberation")

# --- PDF-based persona loading ---
# Falls back to hardcoded prompts if PDFs unavailable or disabled.

_PDF_PROMPTS: dict[str, str] = {}
_PDF_SUTRA_PROMPT: str | None = None
_USE_PDF_PERSONAS = False

_PDF_KEY_TO_META: dict[str, dict] = {
    "wisdom_judge": {"name": "The Wisdom Judge", "aspect": "Right View (Samma Ditthi)"},
    "purpose": {"name": "The Purpose", "aspect": "Right Intention (Samma Sankappa)"},
    "communicator": {"name": "The Communicator", "aspect": "Right Speech (Samma Vaca)"},
    "ethics_judge": {"name": "The Ethics Judge", "aspect": "Right Action (Samma Kammanta)"},
    "sustainer": {"name": "The Sustainer", "aspect": "Right Livelihood (Samma Ajiva)"},
    "determined": {"name": "The Determined", "aspect": "Right Effort (Samma Vayama)"},
    "aware": {"name": "The Aware", "aspect": "Right Mindfulness (Samma Sati)"},
    "focused": {"name": "The Focused", "aspect": "Right Concentration (Samma Samadhi)"},
}

try:
    from personas.prompt_assembler import PromptAssembler

    _PERSONAS_DIR = Path(__file__).parent / "personas"

    for pdf_path in sorted(_PERSONAS_DIR.glob("rights/*.json")):
        agent_key = pdf_path.stem
        assembler = PromptAssembler(str(pdf_path))
        _PDF_PROMPTS[agent_key] = assembler.render_for_anthropic(council_mode=True)
        logger.info(f"[PDF] Loaded {agent_key}: {len(_PDF_PROMPTS[agent_key].split())} words")

    sutra_pdf = _PERSONAS_DIR / "synthesis" / "sutra.json"
    if sutra_pdf.exists():
        _PDF_SUTRA_PROMPT = PromptAssembler(str(sutra_pdf)).render_for_anthropic(council_mode=True)
        logger.info(f"[PDF] Loaded sutra synthesis: {len(_PDF_SUTRA_PROMPT.split())} words")

    _USE_PDF_PERSONAS = True
    logger.info(f"[PDF] Persona system active: {len(_PDF_PROMPTS)} agents loaded")
except Exception as e:
    logger.info(f"[PDF] Persona system not available, using hardcoded prompts: {e}")

# Allow env var to disable PDFs even if they loaded successfully
_USE_PDF_PERSONAS = _USE_PDF_PERSONAS and os.getenv("USE_PERSONA_PDFS", "true").lower() == "true"

DELIBERATION_API_KEY = os.environ.get("DELIBERATION_API_KEY", "")
MODEL = "claude-sonnet-4-20250514"

app = FastAPI(title="Sutra Deliberation Engine")


# --- Request / Response Models ---


class DeliberateRequest(BaseModel):
    query: str
    councilMode: str = Field(
        default="rights", pattern=r"^(rights|experts|combined)$"
    )
    outputFormat: str = Field(
        default="structured", pattern=r"^(structured|narrative)$"
    )


class AgentResponse(BaseModel):
    name: str
    aspect: str
    response: str


class DeliberateResponse(BaseModel):
    deliberation_id: str
    query: str
    council_mode: str
    agents: list[AgentResponse]
    synthesis: str
    model: str
    token_usage: dict
    duration_seconds: float


# --- Auth ---


def _verify_auth(authorization: str | None):
    if not DELIBERATION_API_KEY:
        return  # No key configured — allow (dev mode)
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.removeprefix("Bearer ").strip()
    if token != DELIBERATION_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")


# --- Agent Execution ---


async def _call_agent(
    client: anthropic.AsyncAnthropic,
    system_prompt: str,
    query: str,
) -> tuple[str, anthropic.types.Usage]:
    """Call a single council agent and return (response_text, usage)."""
    message = await client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=system_prompt,
        messages=[{"role": "user", "content": query}],
    )
    text = message.content[0].text if message.content else ""
    return text, message.usage


def _select_agents(council_mode: str) -> list[dict]:
    """Return the list of agent configs for the given mode.

    When PDF personas are active, Rights agents use PDF-rendered system prompts.
    Expert agents always use hardcoded prompts (no PDFs yet).
    """
    rights: list[dict]

    if _USE_PDF_PERSONAS and _PDF_PROMPTS:
        rights = [
            {
                "name": _PDF_KEY_TO_META.get(key, {}).get("name", key),
                "path_aspect": _PDF_KEY_TO_META.get(key, {}).get("aspect", ""),
                "system_prompt": prompt,
            }
            for key, prompt in _PDF_PROMPTS.items()
        ]
    else:
        rights = list(RIGHTS_AGENTS.values())

    experts = list(EXPERT_AGENTS.values())

    if council_mode == "rights":
        return rights
    elif council_mode == "experts":
        return experts
    else:  # combined
        return rights + experts


def _format_perspectives(agent_results: list[dict], query: str) -> str:
    """Format all agent perspectives into a block for the synthesis prompt."""
    lines = [f"ORIGINAL QUERY: {query}\n"]
    for r in agent_results:
        label = r.get("aspect") or r.get("domain", "")
        lines.append(f"--- {r['name']} ({label}) ---")
        lines.append(r["response"])
        lines.append("")
    return "\n".join(lines)


# --- Endpoints ---


@app.post("/deliberate", response_model=DeliberateResponse)
async def deliberate(
    body: DeliberateRequest,
    authorization: str | None = Header(default=None),
):
    _verify_auth(authorization)

    start = time.monotonic()
    deliberation_id = f"dlb-{uuid.uuid4().hex[:12]}"
    client = anthropic.AsyncAnthropic()  # reads ANTHROPIC_API_KEY from env

    # Select agents
    agents = _select_agents(body.councilMode)
    logger.info(
        f"[{deliberation_id}] Starting {body.councilMode} deliberation "
        f"with {len(agents)} agents"
    )

    # Fire all agent calls in parallel
    tasks = [
        _call_agent(client, ag["system_prompt"], body.query) for ag in agents
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Collect responses and token usage
    total_input = 0
    total_output = 0
    agent_responses: list[dict] = []

    for ag, result in zip(agents, results):
        if isinstance(result, Exception):
            logger.error(f"Agent {ag['name']} failed: {result}")
            agent_responses.append({
                "name": ag["name"],
                "aspect": ag.get("path_aspect") or ag.get("domain", ""),
                "response": f"[Agent error: {result}]",
            })
            continue

        text, usage = result
        total_input += usage.input_tokens
        total_output += usage.output_tokens
        agent_responses.append({
            "name": ag["name"],
            "aspect": ag.get("path_aspect") or ag.get("domain", ""),
            "response": text,
        })

    # Sutra synthesis call
    synthesis_prompt = (
        _PDF_SUTRA_PROMPT
        if _USE_PDF_PERSONAS and _PDF_SUTRA_PROMPT
        else SUTRA_SYNTHESIS_PROMPT
    )
    synthesis_input = _format_perspectives(agent_responses, body.query)
    synthesis_msg = await client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=synthesis_prompt,
        messages=[{"role": "user", "content": synthesis_input}],
    )
    synthesis_text = (
        synthesis_msg.content[0].text if synthesis_msg.content else ""
    )
    total_input += synthesis_msg.usage.input_tokens
    total_output += synthesis_msg.usage.output_tokens

    duration = time.monotonic() - start

    # --- Cost tracking ---
    cost_record = SessionCostRecord(
        session_id=deliberation_id,
        room_name=deliberation_id,
        council_mode=body.councilMode,
        agent_name="deliberation-api",
        started_at=datetime.now(timezone.utc).isoformat(),
    )
    cost = calculate_anthropic_cost(MODEL, total_input, total_output)
    cost_record.add_usage(
        ServiceUsage(
            service="anthropic",
            operation="council_deliberation",
            input_tokens=total_input,
            output_tokens=total_output,
            estimated_cost_usd=cost,
            timestamp=datetime.now(timezone.utc).isoformat(),
            metadata={"model": MODEL, "council_mode": body.councilMode},
        )
    )
    cost_record.finalize()
    log_session_cost(cost_record)

    alerts = check_alerts(cost_record)
    for alert in alerts:
        logger.warning(alert)

    logger.info(
        f"[{deliberation_id}] Done in {duration:.1f}s — "
        f"${cost_record.total_cost_usd:.4f} "
        f"({total_input} in / {total_output} out tokens)"
    )

    return DeliberateResponse(
        deliberation_id=deliberation_id,
        query=body.query,
        council_mode=body.councilMode,
        agents=[AgentResponse(**r) for r in agent_responses],
        synthesis=synthesis_text,
        model=MODEL,
        token_usage={"total_input": total_input, "total_output": total_output},
        duration_seconds=round(duration, 2),
    )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "sutra-deliberation"}
