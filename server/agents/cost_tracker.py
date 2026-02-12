"""
Per-session cost tracking for all provisioned services.

Logs token usage, audio minutes, and computed costs to a structured format.
Designed to be lightweight — writes JSON logs that can be ingested into
any analytics system (PostgreSQL, BigQuery, Datadog, etc.)
"""

import json
import os
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


@dataclass
class ServiceUsage:
    """Usage record for a single service within a session."""
    service: str                    # anthropic, deepgram, cartesia, livekit
    operation: str                  # e.g., "llm_completion", "stt_transcribe", "tts_synthesize"
    input_tokens: int = 0           # For LLM
    output_tokens: int = 0          # For LLM
    audio_seconds: float = 0.0      # For STT/TTS/LiveKit
    characters: int = 0             # For TTS
    estimated_cost_usd: float = 0.0
    timestamp: str = ""
    metadata: dict = field(default_factory=dict)  # model name, voice_id, etc.


@dataclass
class SessionCostRecord:
    """Complete cost record for one session/deliberation."""
    session_id: str
    room_name: str
    council_mode: str               # rights, experts, combined, single
    agent_name: str
    user_id: Optional[str] = None
    tier: Optional[str] = None      # explorer, creator, professional, enterprise, api
    started_at: str = ""
    ended_at: str = ""
    duration_seconds: float = 0.0
    usages: list = field(default_factory=list)
    total_cost_usd: float = 0.0
    credits_consumed: int = 0
    deliverable_type: Optional[str] = None  # skill ID or deliberation type
    user_tier: Optional[str] = None
    credits_remaining: Optional[int] = None  # after this session

    def add_usage(self, usage: ServiceUsage):
        self.usages.append(asdict(usage))
        self.total_cost_usd += usage.estimated_cost_usd

    def finalize(self):
        self.ended_at = datetime.now(timezone.utc).isoformat()
        if self.started_at:
            start = datetime.fromisoformat(self.started_at)
            end = datetime.fromisoformat(self.ended_at)
            self.duration_seconds = (end - start).total_seconds()


# --- Cost Calculation Helpers ---

# Pricing constants (update when provider pricing changes)
PRICING = {
    "anthropic": {
        "claude-sonnet-4-20250514": {
            "input_per_1m_tokens": 3.00,
            "output_per_1m_tokens": 15.00,
        },
        "claude-opus-4-20250514": {
            "input_per_1m_tokens": 15.00,
            "output_per_1m_tokens": 75.00,
        },
        "claude-haiku-4-20250514": {
            "input_per_1m_tokens": 0.25,
            "output_per_1m_tokens": 1.25,
        },
    },
    "deepgram": {
        "nova-3": {
            "per_minute": 0.0043,
        },
    },
    "cartesia": {
        "sonic-3": {
            "per_1k_characters": 0.006,
        },
    },
    "livekit": {
        "cloud": {
            "per_participant_minute": 0.02,
        },
    },
    "stripe": {
        "percentage": 0.029,
        "fixed": 0.30,
    },
}


def calculate_anthropic_cost(
    model: str, input_tokens: int, output_tokens: int
) -> float:
    """Calculate cost for an Anthropic API call."""
    pricing = PRICING["anthropic"].get(model, PRICING["anthropic"]["claude-sonnet-4-20250514"])
    input_cost = (input_tokens / 1_000_000) * pricing["input_per_1m_tokens"]
    output_cost = (output_tokens / 1_000_000) * pricing["output_per_1m_tokens"]
    return round(input_cost + output_cost, 6)


def calculate_deepgram_cost(audio_seconds: float, model: str = "nova-3") -> float:
    """Calculate cost for Deepgram STT."""
    minutes = audio_seconds / 60.0
    pricing = PRICING["deepgram"].get(model, PRICING["deepgram"]["nova-3"])
    return round(minutes * pricing["per_minute"], 6)


def calculate_cartesia_cost(characters: int, model: str = "sonic-3") -> float:
    """Calculate cost for Cartesia TTS."""
    pricing = PRICING["cartesia"].get(model, PRICING["cartesia"]["sonic-3"])
    return round((characters / 1000) * pricing["per_1k_characters"], 6)


def calculate_livekit_cost(participant_minutes: float) -> float:
    """Calculate cost for LiveKit room usage."""
    return round(participant_minutes * PRICING["livekit"]["cloud"]["per_participant_minute"], 6)


def calculate_stripe_fee(amount_usd: float) -> float:
    """Calculate Stripe processing fee."""
    return round(amount_usd * PRICING["stripe"]["percentage"] + PRICING["stripe"]["fixed"], 2)


# --- Logging ---

LOG_DIR = os.environ.get("COST_LOG_DIR", "/tmp/sutra-costs")


def log_session_cost(record: SessionCostRecord):
    """Write session cost record to JSON log file."""
    Path(LOG_DIR).mkdir(parents=True, exist_ok=True)

    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    log_file = Path(LOG_DIR) / f"costs-{date_str}.jsonl"

    with open(log_file, "a") as f:
        f.write(json.dumps(asdict(record)) + "\n")


# --- Alerts ---

# Thresholds (configurable via env vars)
ALERT_THRESHOLDS = {
    "session_cost_usd": float(os.environ.get("ALERT_SESSION_COST", "5.00")),
    "daily_cost_usd": float(os.environ.get("ALERT_DAILY_COST", "100.00")),
    "monthly_cost_usd": float(os.environ.get("ALERT_MONTHLY_COST", "2000.00")),
    "daily_credits_consumed": int(os.environ.get("ALERT_DAILY_CREDITS", "50")),
    "free_tier_daily_credits": int(os.environ.get("ALERT_FREE_DAILY_CREDITS", "3")),
}


# Credit costs per deliverable type (mirrors STRIPE_CONFIG.creditCosts)
CREDIT_COSTS = {
    # Tier 1: Conversational
    "quick_question": 1,
    "voice_session": 1,
    "phone_call": 1,
    # Tier 2: Council Deliberations
    "rights_council": 3,
    "expert_council": 3,
    "combined_council": 5,
    # Tier 3: Skill Deliverables
    "press-release": 5,
    "investor-update": 5,
    "social-media-launch": 5,
    "blog-post": 5,
    "email-outreach": 3,
    "pitch-deck-talking-points": 8,
    "growth-playbook": 10,
    "financial-model": 8,
    "architecture-doc": 8,
    "comparison-page": 5,
    "explainer-script": 3,
    "faq-content": 3,
    "terms-of-service": 8,
    "privacy-policy": 8,
    # Tier 4: Premium Deliverables
    "business-plan": 20,
    "due-diligence-report": 20,
    "strategic-audit": 15,
    "book-publication": 50,
}


def check_alerts(record: SessionCostRecord) -> list[str]:
    """Check if any cost thresholds are exceeded. Returns list of alert messages."""
    alerts = []

    if record.total_cost_usd > ALERT_THRESHOLDS["session_cost_usd"]:
        alerts.append(
            f"HIGH SESSION COST: {record.session_id} cost ${record.total_cost_usd:.2f} "
            f"(threshold: ${ALERT_THRESHOLDS['session_cost_usd']:.2f}). "
            f"Agent: {record.agent_name}, Mode: {record.council_mode}, "
            f"Duration: {record.duration_seconds:.0f}s"
        )

    # Daily aggregate check
    try:
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        log_file = Path(LOG_DIR) / f"costs-{date_str}.jsonl"
        if log_file.exists():
            daily_total = 0.0
            with open(log_file) as f:
                for line in f:
                    entry = json.loads(line)
                    daily_total += entry.get("total_cost_usd", 0)
            daily_total += record.total_cost_usd

            if daily_total > ALERT_THRESHOLDS["daily_cost_usd"]:
                alerts.append(
                    f"DAILY COST ALERT: Total today ${daily_total:.2f} "
                    f"(threshold: ${ALERT_THRESHOLDS['daily_cost_usd']:.2f})"
                )
    except Exception:
        pass  # Don't let alert checking break the session

    return alerts
