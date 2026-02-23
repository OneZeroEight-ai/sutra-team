import { listCouncilAgents } from "@/lib/api";
import { NextRequest } from "next/server";

/**
 * GET /api/council/agents?council_type=rights
 *
 * Proxy to Samma Suit API — list council agents (service key auth).
 */
export async function GET(request: NextRequest) {
  const councilType = request.nextUrl.searchParams.get("council_type") || undefined;

  try {
    const data = await listCouncilAgents(councilType);
    return Response.json(data);
  } catch (error: unknown) {
    console.error("[council/agents] Error:", error);
    return Response.json(
      { error: "Failed to fetch agents", agents: [], total: 0 },
      { status: 500 },
    );
  }
}
