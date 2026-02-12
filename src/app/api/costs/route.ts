import { NextRequest, NextResponse } from "next/server";

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

  const costModel = {
    pricing: {
      anthropic_sonnet_input_per_1m: 3.0,
      anthropic_sonnet_output_per_1m: 15.0,
      deepgram_nova3_per_minute: 0.0043,
      cartesia_sonic3_per_1k_chars: 0.006,
      livekit_per_participant_minute: 0.02,
      stripe_percentage: 0.029,
      stripe_fixed: 0.3,
    },
    estimated_costs_per_session: {
      single_agent_5min: { min: 0.2, max: 0.25 },
      rights_council_5min: { min: 0.6, max: 0.9 },
      expert_council_5min: { min: 0.5, max: 0.75 },
      combined_council_5min: { min: 1.0, max: 1.65 },
      expert_session_30min: {
        min: 1.5,
        max: 2.0,
        note: "AI cost only, excludes expert compensation",
      },
      phone_call_5min: { min: 0.25, max: 0.3 },
      api_deliberation: { min: 0.1, max: 1.5 },
    },
    margin_analysis: {
      explorer: { revenue: 0, est_cost_at_limit: 2.5, margin: -2.5 },
      creator: { revenue: 29, est_cost_at_limit: 25.0, margin: 4.0 },
      professional: { revenue: 99, est_cost_at_limit: 82.5, margin: 16.5 },
      expert_session: {
        revenue: 79,
        est_ai_cost: 2.0,
        est_expert_cost: 60.0,
        margin: 17.0,
      },
      api_per_call: { revenue: 0.5, est_cost: 0.12, margin: 0.38 },
    },
    alert_thresholds: {
      session_cost_usd: 5.0,
      daily_cost_usd: 100.0,
      monthly_cost_usd: 2000.0,
    },
    note: "Production deployment will serve real session cost logs from database. This endpoint currently returns the cost model for reference.",
  };

  return NextResponse.json(costModel);
}
