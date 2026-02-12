# COST TRACKING & PROVISIONING DASHBOARD DIRECTIVE

**Context:** Sutra.team uses multiple paid APIs per session. We need real-time cost tracking per deliberation, per user, and per service — with alerts when costs exceed thresholds. This is critical for pricing sustainability and margin visibility.

---

## Cost Model

### Per-Service Pricing (as of February 2026)

| Service | Unit | Cost | Source |
|---------|------|------|--------|
| **Anthropic Claude Sonnet** (input) | per 1M tokens | $3.00 | api.anthropic.com |
| **Anthropic Claude Sonnet** (output) | per 1M tokens | $15.00 | api.anthropic.com |
| **Deepgram Nova-3** (STT) | per minute of audio | $0.0043 | deepgram.com |
| **Cartesia Sonic-3** (TTS) | per 1K characters | $0.006 | cartesia.ai |
| **LiveKit Cloud** | per participant-minute | ~$0.02 | livekit.io |
| **Railway** (agent server) | per month | ~$5-20 | railway.com |
| **Vercel** (frontend) | per month | $0-20 | vercel.com |
| **Stripe** | per transaction | 2.9% + $0.30 | stripe.com |

### Cost Per Session Type (Estimates)

| Session Type | Agents | Est. Duration | Est. Cost | Customer Pays |
|-------------|--------|---------------|-----------|---------------|
| Single agent voice (5 min) | 1 | 5 min | $0.20-0.25 | Included in tier |
| Rights Council deliberation | 8 | 5 min | $0.60-0.90 | Included in tier |
| Expert Council deliberation | 6 | 5 min | $0.50-0.75 | Included in tier |
| Combined Council deliberation | 14 + synthesis | 5 min | $1.00-1.65 | Included in tier |
| Expert Session (30 min) | 1 agent + human | 30 min | $1.50-2.00 (AI cost only) | $79.00 |
| Phone call (5 min) | 1 | 5 min | $0.25-0.30 | Included in tier |
| API deliberation | varies | N/A (text only) | $0.10-1.50 | $0.50/call |

### Margin Analysis

| Tier | Monthly Revenue | Est. Monthly Cost (at limit) | Margin |
|------|----------------|------------------------------|--------|
| Explorer (free) | $0 | $2.50 (10 deliberations) | -$2.50 |
| Creator ($29) | $29 | $25.00 (100 deliberations) | ~$4.00 |
| Professional ($99) | $99 | $82.50 (500 combined deliberations) | ~$16.50 |
| Expert Session ($79) | $79 | $2.00 (AI) + $60.00 (expert) | ~$17.00 |
| API ($0.50/call) | Variable | $0.10-1.50/call | $0.35-0.40 avg |

**⚠️ Creator tier margin is thin.** If users consistently hit 100 deliberations/month with Combined mode, it's break-even or negative. Monitor closely.

---

## Step 1: Create Cost Tracking Schema

**File:** `server/agents/cost_tracker.py`

```python
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
}


def check_alerts(record: SessionCostRecord) -> list[str]:
    """Check if any cost thresholds are exceeded. Returns list of alert messages."""
    alerts = []
    
    if record.total_cost_usd > ALERT_THRESHOLDS["session_cost_usd"]:
        alerts.append(
            f"⚠️ HIGH SESSION COST: {record.session_id} cost ${record.total_cost_usd:.2f} "
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
                    f"🚨 DAILY COST ALERT: Total today ${daily_total:.2f} "
                    f"(threshold: ${ALERT_THRESHOLDS['daily_cost_usd']:.2f})"
                )
    except Exception:
        pass  # Don't let alert checking break the session
    
    return alerts
```

---

## Step 2: Integrate Cost Tracking into Agent Server

Update `server/agents/council_agent.py` to track costs per session.

Add after imports:

```python
from cost_tracker import (
    SessionCostRecord, ServiceUsage,
    calculate_anthropic_cost, calculate_deepgram_cost,
    calculate_cartesia_cost, calculate_livekit_cost,
    log_session_cost, check_alerts
)
import logging

logger = logging.getLogger("sutra-costs")
```

In the entrypoint, wrap the session lifecycle:

```python
@server.rtc_session()
async def entrypoint(ctx: JobContext):
    # ... existing council config and agent setup ...
    
    # Initialize cost record
    cost_record = SessionCostRecord(
        session_id=ctx.room.name,
        room_name=ctx.room.name,
        council_mode=council_config["mode"],
        agent_name=agent_config["name"],
        started_at=datetime.now(timezone.utc).isoformat(),
    )
    
    # Create session (existing code)
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm=anthropic_plugin.LLM(model="claude-sonnet-4-20250514"),
        tts=cartesia.TTS(model="sonic-3", voice=voice_id),
    )
    
    # Track LLM usage via session events
    @session.on("agent_speech_committed")
    def on_speech(event):
        # Estimate tokens from response length (rough: 1 token ≈ 4 chars)
        output_chars = len(event.content) if hasattr(event, 'content') else 0
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
    
    # Start session
    await session.start(agent=council_agent, room=ctx.room)
    await session.generate_reply(instructions=greeting)
    
    # When session ends, finalize and log
    @session.on("close")
    def on_close():
        # Add LiveKit room cost
        lk_cost = calculate_livekit_cost(cost_record.duration_seconds / 60.0 * 2)  # 2 participants
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
```

**Note:** The exact event names and data shapes depend on the LiveKit Agents SDK version. The agent server logs will show the actual event structure — adjust the event handlers accordingly. The key pattern is: intercept LLM completions to count tokens, intercept STT/TTS to count audio, and log everything on session close.

---

## Step 3: Create Cost Dashboard API Route

**File:** `src/app/api/costs/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";

// This reads from the agent server's cost logs
// In production, this would query a database instead of flat files
// For now, this is a local development tool

interface CostRecord {
  session_id: string;
  room_name: string;
  council_mode: string;
  agent_name: string;
  total_cost_usd: number;
  duration_seconds: number;
  started_at: string;
  ended_at: string;
  usages: Array<{
    service: string;
    operation: string;
    estimated_cost_usd: number;
  }>;
}

export async function GET(req: NextRequest) {
  // Simple auth check — only allow with admin key
  const authHeader = req.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;
  
  if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const searchParams = req.nextUrl.searchParams;
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const days = parseInt(searchParams.get("days") || "7");
  
  // This would be replaced with a database query in production
  // For now, return the cost model as reference data
  const costModel = {
    pricing: {
      anthropic_sonnet_input_per_1m: 3.00,
      anthropic_sonnet_output_per_1m: 15.00,
      deepgram_nova3_per_minute: 0.0043,
      cartesia_sonic3_per_1k_chars: 0.006,
      livekit_per_participant_minute: 0.02,
      stripe_percentage: 0.029,
      stripe_fixed: 0.30,
    },
    estimated_costs_per_session: {
      single_agent_5min: { min: 0.20, max: 0.25 },
      rights_council_5min: { min: 0.60, max: 0.90 },
      expert_council_5min: { min: 0.50, max: 0.75 },
      combined_council_5min: { min: 1.00, max: 1.65 },
      expert_session_30min: { min: 1.50, max: 2.00, note: "AI cost only, excludes expert compensation" },
      phone_call_5min: { min: 0.25, max: 0.30 },
      api_deliberation: { min: 0.10, max: 1.50 },
    },
    margin_analysis: {
      explorer: { revenue: 0, est_cost_at_limit: 2.50, margin: -2.50 },
      creator: { revenue: 29, est_cost_at_limit: 25.00, margin: 4.00 },
      professional: { revenue: 99, est_cost_at_limit: 82.50, margin: 16.50 },
      expert_session: { revenue: 79, est_ai_cost: 2.00, est_expert_cost: 60.00, margin: 17.00 },
      api_per_call: { revenue: 0.50, est_cost: 0.12, margin: 0.38 },
    },
    alert_thresholds: {
      session_cost_usd: 5.00,
      daily_cost_usd: 100.00,
      monthly_cost_usd: 2000.00,
    },
    note: "Production deployment will serve real session cost logs from database. This endpoint currently returns the cost model for reference.",
  };
  
  return NextResponse.json(costModel);
}
```

---

## Step 4: Create Cost Dashboard Page

**File:** `src/app/admin/costs/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";

interface CostModel {
  pricing: Record<string, number>;
  estimated_costs_per_session: Record<string, { min: number; max: number; note?: string }>;
  margin_analysis: Record<string, { revenue: number; margin: number; [key: string]: any }>;
  alert_thresholds: Record<string, number>;
}

export default function CostDashboard() {
  const [costModel, setCostModel] = useState<CostModel | null>(null);
  const [error, setError] = useState<string>("");
  const [adminKey, setAdminKey] = useState("");
  const [loaded, setLoaded] = useState(false);

  const loadCosts = async () => {
    try {
      const res = await fetch("/api/costs", {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error("Unauthorized — check admin key");
      const data = await res.json();
      setCostModel(data);
      setLoaded(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatCurrency = (n: number) => `$${n.toFixed(2)}`;
  const formatSmallCurrency = (n: number) => `$${n.toFixed(4)}`;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-2">Sutra.team Cost Dashboard</h1>
      <p className="text-white/60 mb-8">Internal provisioning cost tracking and margin analysis</p>

      {!loaded && (
        <div className="max-w-md">
          <label className="block text-sm text-white/60 mb-2">Admin API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              placeholder="Enter admin key"
            />
            <button
              onClick={loadCosts}
              className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-white/90"
            >
              Load
            </button>
          </div>
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        </div>
      )}

      {costModel && (
        <div className="space-y-8">
          {/* Service Pricing */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white/80">Service Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(costModel.pricing).map(([key, value]) => (
                <div key={key} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/50 font-mono">{key}</p>
                  <p className="text-2xl font-bold mt-1">{formatSmallCurrency(value)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Per-Session Costs */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white/80">Estimated Cost Per Session</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 text-white/60">Session Type</th>
                    <th className="py-2 text-white/60">Min Cost</th>
                    <th className="py-2 text-white/60">Max Cost</th>
                    <th className="py-2 text-white/60">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(costModel.estimated_costs_per_session).map(([key, val]) => (
                    <tr key={key} className="border-b border-white/5">
                      <td className="py-2 font-mono text-sm">{key}</td>
                      <td className="py-2">{formatCurrency(val.min)}</td>
                      <td className="py-2">{formatCurrency(val.max)}</td>
                      <td className="py-2 text-white/40 text-sm">{val.note || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Margin Analysis */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white/80">Margin Analysis by Tier</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(costModel.margin_analysis).map(([tier, data]) => (
                <div
                  key={tier}
                  className={`border rounded-lg p-4 ${
                    data.margin < 0
                      ? "bg-red-500/10 border-red-500/30"
                      : data.margin < 10
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-green-500/10 border-green-500/30"
                  }`}
                >
                  <p className="text-sm text-white/50 uppercase font-mono">{tier}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-white/60">Revenue</span>
                    <span className="font-bold">{formatCurrency(data.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Margin</span>
                    <span
                      className={`font-bold ${
                        data.margin < 0
                          ? "text-red-400"
                          : data.margin < 10
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {formatCurrency(data.margin)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Alert Thresholds */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white/80">Alert Thresholds</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(costModel.alert_thresholds).map(([key, value]) => (
                <div key={key} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/50 font-mono">{key}</p>
                  <p className="text-2xl font-bold mt-1 text-amber-400">{formatCurrency(value)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
```

---

## Step 5: Add Admin API Key Environment Variable

Add to Vercel:

| Variable | Value | Environments |
|----------|-------|-------------|
| `ADMIN_API_KEY` | (generate a random string) | Prod, Preview |

Add to Railway (agent server):

| Variable | Value |
|----------|-------|
| `COST_LOG_DIR` | `/app/logs/costs` |
| `ALERT_SESSION_COST` | `5.00` |
| `ALERT_DAILY_COST` | `100.00` |
| `ALERT_MONTHLY_COST` | `2000.00` |

---

## Step 6: Add Navigation Link (Admin Only)

The cost dashboard should NOT be linked from the public nav. Access it directly at `/admin/costs`. Optionally add it to a future admin sidebar.

---

## Step 7: Production Evolution Path

The current implementation logs to JSONL files on the agent server. For production:

1. **Phase 1 (now):** JSONL logs on Railway + reference cost model API endpoint
2. **Phase 2:** Pipe logs to PostgreSQL (SammaSuit backend) via a background worker
3. **Phase 3:** Real-time dashboard with Recharts/D3 charts showing:
   - Daily/weekly/monthly cost trends
   - Cost per session by council mode
   - Cost per user by tier
   - Margin per tier over time
   - Service cost breakdown (% Anthropic vs Deepgram vs Cartesia vs LiveKit)
4. **Phase 4:** Automated alerts via email/Slack when thresholds exceeded
5. **Phase 5:** Cost optimization recommendations (e.g., switch heavy users to Haiku, cache common prompts)

---

## Step 8: Verify and Build

```bash
npm run build
```

Confirm:
- [ ] `/api/costs` endpoint returns cost model JSON (with valid admin key)
- [ ] `/admin/costs` page renders dashboard with pricing, session costs, margins, alerts
- [ ] `server/agents/cost_tracker.py` loads without errors
- [ ] Build passes with no errors
- [ ] `/admin/costs` is NOT linked from public navigation

---

## File Summary

| File | Description |
|------|-------------|
| `server/agents/cost_tracker.py` | Cost tracking module — pricing constants, calculators, logging, alerts |
| `src/app/api/costs/route.ts` | API endpoint serving cost model (admin-only) |
| `src/app/admin/costs/page.tsx` | Cost dashboard page |
