import { sammaApiFetch } from "@/lib/api";
import { NextRequest } from "next/server";

/**
 * GET /api/agents/[id]
 * PUT /api/agents/[id]
 * DELETE /api/agents/[id]
 *
 * Proxy to Samma Suit API — single agent operations.
 */

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const qs = request.nextUrl.search; // includes leading "?"

  try {
    const body =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.text().catch(() => undefined)
        : undefined;

    const res = await sammaApiFetch(`/api/agents/${id}${qs}`, {
      method: request.method,
      ...(body ? { body } : {}),
    });

    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error: unknown) {
    console.error(`[agents/${id}] proxy error:`, error);
    const message =
      error instanceof Error ? error.message : "Backend unavailable";
    return Response.json({ detail: message }, { status: 502 });
  }
}

export const GET = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
