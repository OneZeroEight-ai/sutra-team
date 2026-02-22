import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

/**
 * POST /api/agents/[id]/gateway
 *
 * Proxy to Samma Suit API — streams agent responses back to the client.
 * Passes through SSE streams transparently for real-time chat.
 */

const SAMMA_API_URL =
  process.env.SAMMA_API_URL || process.env.NEXT_PUBLIC_SUTRA_API_URL || "";
const SERVICE_KEY = process.env.SAMMA_SERVICE_KEY || "";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    "X-Customer-Id": userId,
  };

  try {
    const user = await currentUser();
    if (user?.emailAddresses?.[0]?.emailAddress) {
      headers["X-Customer-Email"] = user.emailAddresses[0].emailAddress;
    }
    const name = user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : "";
    if (name) headers["X-Customer-Name"] = name;
  } catch {
    // Proceed with just userId
  }

  try {
    const body = await request.text();

    const res = await fetch(`${SAMMA_API_URL}/api/agents/${id}/gateway`, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(120_000),
    });

    // Pass through the response (including SSE streams) transparently
    return new Response(res.body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("[agents/gateway] Error:", error);
    if (error instanceof Error && error.name === "TimeoutError") {
      return Response.json({ error: "Gateway request timed out" }, { status: 504 });
    }
    return Response.json({ error: "Gateway request failed" }, { status: 500 });
  }
}
