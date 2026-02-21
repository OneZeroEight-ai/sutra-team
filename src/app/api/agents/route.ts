import { auth } from "@clerk/nextjs/server";
import { getAgents, createAgent } from "@/lib/api";
import { NextRequest } from "next/server";

/**
 * GET /api/agents
 *
 * Proxy to Samma Suit API — list all agents (service key auth).
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const data = await getAgents();
    return Response.json(data);
  } catch (error: unknown) {
    console.error("[agents] Error:", error);
    return Response.json(
      { error: "Failed to fetch agents", agents: [], total: 0 },
      { status: 500 },
    );
  }
}

/**
 * POST /api/agents
 *
 * Proxy to Samma Suit API — create a new agent (service key auth).
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = await createAgent(body);
    return Response.json(data);
  } catch (error: unknown) {
    console.error("[agents/create] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create agent";
    return Response.json({ error: message }, { status: 500 });
  }
}
