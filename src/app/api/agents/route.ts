import { auth } from "@clerk/nextjs/server";
import { getAgents } from "@/lib/api";

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
