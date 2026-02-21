import { auth } from "@clerk/nextjs/server";
import { killAgent } from "@/lib/api";
import { NextRequest } from "next/server";

/**
 * POST /api/agents/[id]/kill
 *
 * Proxy to Samma Suit API — terminate an agent.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await killAgent(id);
    return Response.json(data);
  } catch (error: unknown) {
    console.error("[agents/kill] Error:", error);
    return Response.json(
      { error: "Failed to terminate agent" },
      { status: 500 },
    );
  }
}
