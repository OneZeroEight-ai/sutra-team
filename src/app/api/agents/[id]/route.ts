import { getAgent, updateAgent, sammaApiFetch } from "@/lib/api";
import { NextRequest } from "next/server";

/**
 * GET /api/agents/[id]
 *
 * Proxy to Samma Suit API — get a single agent.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const data = await getAgent(id);
    return Response.json(data);
  } catch (error: unknown) {
    console.error("[agents/get] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch agent";
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/agents/[id]
 *
 * Proxy to Samma Suit API — update an agent.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const data = await updateAgent(id, body);
    return Response.json(data);
  } catch (error: unknown) {
    console.error("[agents/update] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update agent";
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/agents/[id]
 *
 * Proxy to Samma Suit API — delete an agent (with optional ?purge=true).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const qs = request.nextUrl.search;

  try {
    const res = await sammaApiFetch(`/api/agents/${id}${qs}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (error: unknown) {
    console.error("[agents/delete] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete agent";
    return Response.json({ error: message }, { status: 500 });
  }
}
