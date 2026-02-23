import { reviveAgent } from "@/lib/api";
import { NextRequest } from "next/server";

/**
 * POST /api/agents/[id]/revive
 *
 * Proxy to Samma Suit API — revive a terminated agent.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const data = await reviveAgent(id);
    return Response.json(data);
  } catch (error: unknown) {
    console.error("[agents/revive] Error:", error);
    return Response.json(
      { error: "Failed to revive agent" },
      { status: 500 },
    );
  }
}
