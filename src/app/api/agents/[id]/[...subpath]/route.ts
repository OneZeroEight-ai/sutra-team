import { sammaApiFetch } from "@/lib/api";
import { NextRequest } from "next/server";

/**
 * Catch-all proxy for /api/agents/[id]/* sub-paths not handled by
 * specific routes (gateway, kill, delete, revive).
 *
 * Covers: audit, heartbeat, memory, context, fork, rfc, conversations,
 * sleep, wake, pause, resume, snapshot, rollback, budget, permissions, etc.
 */

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subpath: string[] }> },
) {
  const { id, subpath } = await params;
  const sub = subpath.join("/");
  const qs = request.nextUrl.search;

  try {
    const body =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.text().catch(() => undefined)
        : undefined;

    const res = await sammaApiFetch(`/api/agents/${id}/${sub}${qs}`, {
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
    console.error(`[agents/${id}/${sub}] proxy error:`, error);
    const message =
      error instanceof Error ? error.message : "Backend unavailable";
    return Response.json({ detail: message }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
