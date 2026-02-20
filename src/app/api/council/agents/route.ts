import { auth } from "@clerk/nextjs/server";
import { listCouncilAgents } from "@/lib/api";
import { NextRequest } from "next/server";

/**
 * GET /api/council/agents?council_type=rights
 *
 * Proxy to Samma Suit API — list council agents with their IDs.
 */
export async function GET(request: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const token = await getToken();
  if (!token) {
    return Response.json({ error: "Failed to get auth token" }, { status: 401 });
  }

  const councilType = request.nextUrl.searchParams.get("council_type") || undefined;

  try {
    const data = await listCouncilAgents(token, councilType);
    return Response.json(data);
  } catch (error: unknown) {
    console.error("[council/agents] Error:", error);
    return Response.json(
      { error: "Failed to fetch agents", agents: [], total: 0 },
      { status: 500 },
    );
  }
}
