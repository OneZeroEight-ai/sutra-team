"""
Sutra.team Deliberation Engine — FastAPI Endpoint

Multi-agent council deliberation via the Anthropic API.
Runs alongside the LiveKit council_agent.py on the agent server (Railway).

POST /deliberate  — run a full council deliberation
GET  /health      — health check
"""

import asyncio
import json
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


# --- Expert PDF personas ---

def _flatten_knowledge(data: object, parts: list[str], depth: int = 0) -> None:
    """Recursively flatten nested knowledge dicts into readable text."""
    indent = "  " * depth
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, dict):
                parts.append(f"{indent}**{key.replace('_', ' ').title()}:**")
                _flatten_knowledge(value, parts, depth + 1)
            elif isinstance(value, list):
                parts.append(
                    f"{indent}**{key.replace('_', ' ').title()}:** "
                    + "; ".join(str(v) for v in value)
                )
            else:
                parts.append(f"{indent}**{key.replace('_', ' ').title()}:** {value}")
    elif isinstance(data, str):
        parts.append(f"{indent}{data}")


def _build_expert_prompt(json_path: str) -> str:
    """Build a system prompt from an expert persona JSON file."""
    with open(json_path, "r") as f:
        data = json.load(f)

    parts: list[str] = []

    # Identity
    identity = data.get("identity", {})
    parts.append(f"# {data.get('name', 'Expert Agent')}")
    parts.append(f"## Role\n{identity.get('role', '')}")
    parts.append(f"## Approach\n{identity.get('approach', '')}")

    # Voice
    voice = data.get("voice", {})
    if voice.get("style"):
        parts.append(f"## Communication Style\n{voice['style']}")
    if voice.get("avoidance_patterns"):
        parts.append(
            "## Avoidance Patterns\n"
            + "\n".join(f"- {p}" for p in voice["avoidance_patterns"])
        )
    if voice.get("closing_signature"):
        parts.append(f"## Closing\n{voice['closing_signature']}")

    # Value framework
    vf = data.get("value_framework", {})
    if vf.get("primary"):
        parts.append(f"## Core Principle\n{vf['primary']}")
    if vf.get("principles"):
        parts.append(
            "## Guiding Principles\n"
            + "\n".join(f"- {p}" for p in vf["principles"])
        )

    # Knowledge base
    kb = data.get("knowledge_base", {})

    frameworks = kb.get("analytical_frameworks", {})
    if frameworks:
        parts.append("## Analytical Frameworks")
        for name, details in frameworks.items():
            parts.append(f"### {name}")
            if isinstance(details, dict):
                for k, v in details.items():
                    parts.append(f"**{k}:** {v}")
            else:
                parts.append(str(details))

    domains = kb.get("core_domains", {})
    if domains:
        parts.append("## Domain Knowledge")
        for domain_name, domain_data in domains.items():
            parts.append(f"### {domain_name.replace('_', ' ').title()}")
            _flatten_knowledge(domain_data, parts, depth=0)

    disclaimers = kb.get("disclaimers", {})
    if disclaimers:
        parts.append("## Important Disclaimers")
        for _k, v in disclaimers.items():
            parts.append(f"- {v}")

    # Behavioral constraints
    bc = data.get("behavioral_constraints", {})
    if bc.get("hardcoded"):
        parts.append(
            "## Absolute Constraints\n"
            + "\n".join(f"- {c}" for c in bc["hardcoded"])
        )

    # Response patterns
    rp = data.get("response_patterns", {})
    if rp.get("for_council_deliberation"):
        parts.append(
            f"## Council Deliberation Response Format\n{rp['for_council_deliberation']}"
        )

    return "\n\n".join(parts)


_EXPERT_PDF_PROMPTS: dict[str, str] = {}
_EXPERT_PDF_KEY_TO_META: dict[str, dict] = {
    "legal_analyst": {"name": "The Legal Analyst", "domain": "Legal Strategy & Risk Assessment"},
    "market_analyst": {"name": "The Market Analyst", "domain": "Competitive Intelligence & Market Strategy"},
    # Future experts:
    # "financial_strategist": {"name": "The Financial Strategist", "domain": "Financial Analysis"},
    # "technical_architect": {"name": "The Technical Architect", "domain": "Systems & Architecture"},
    # "risk_assessor": {"name": "The Risk Assessor", "domain": "Threat Modeling & Contingency"},
    # "growth_strategist": {"name": "The Growth Strategist", "domain": "Go-to-Market & Scaling"},
}

try:
    _EXPERTS_DIR = Path(__file__).parent / "personas" / "experts"
    for _json_path in sorted(_EXPERTS_DIR.glob("*.json")):
        _agent_key = _json_path.stem
        _EXPERT_PDF_PROMPTS[_agent_key] = _build_expert_prompt(str(_json_path))
        logger.info(
            f"[PDF] Loaded expert {_agent_key}: "
            f"{len(_EXPERT_PDF_PROMPTS[_agent_key].split())} words"
        )
    if _EXPERT_PDF_PROMPTS:
        logger.info(
            f"[PDF] Expert persona system active: {len(_EXPERT_PDF_PROMPTS)} experts loaded"
        )
except Exception as e:
    logger.info(f"[PDF] Expert persona system not available: {e}")

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

    When PDF personas are active, agents use PDF-rendered system prompts.
    Falls back to hardcoded prompts from prompts/ modules.
    """
    agents: list[dict] = []

    if council_mode in ("rights", "combined"):
        if _USE_PDF_PERSONAS and _PDF_PROMPTS:
            for key, prompt in _PDF_PROMPTS.items():
                meta = _PDF_KEY_TO_META.get(key, {})
                agents.append({
                    "name": meta.get("name", key),
                    "path_aspect": meta.get("aspect", ""),
                    "system_prompt": prompt,
                })
        else:
            agents.extend(RIGHTS_AGENTS.values())

    if council_mode in ("experts", "combined"):
        if _EXPERT_PDF_PROMPTS:
            for key, prompt in _EXPERT_PDF_PROMPTS.items():
                meta = _EXPERT_PDF_KEY_TO_META.get(key, {})
                agents.append({
                    "name": meta.get("name", key),
                    "domain": meta.get("domain", ""),
                    "system_prompt": prompt,
                })
        else:
            agents.extend(EXPERT_AGENTS.values())

    return agents


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
