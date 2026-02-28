import { purgeAgent } from "@/lib/api";
import { NextRequest } from "next/server";

/**
 * POST /api/agents/[id]/delete
 *
 * Permanently delete an agent and all its data.
 * Uses the Railway backend's purge endpoint.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const data = await purgeAgent(id);
    return Response.json(data);
  } catch (error: unknown) {
    console.error("[agents/delete] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete agent";
    return Response.json({ error: message }, { status: 500 });
  }
}
