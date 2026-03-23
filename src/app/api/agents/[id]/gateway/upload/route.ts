import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

/**
 * POST /api/agents/[id]/gateway/upload
 *
 * Proxy for file-upload gateway endpoint. Forwards multipart/form-data
 * to the Samma backend with service key + user-scoping headers.
 */

const SAMMA_API_URL =
  process.env.SAMMA_API_URL || process.env.NEXT_PUBLIC_SUTRA_API_URL || "";
const SERVICE_KEY = process.env.SAMMA_SERVICE_KEY || "";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${SERVICE_KEY}`,
    "X-Agency-Id": "sutra.team",
    // Do NOT set Content-Type — fetch sets multipart boundary automatically
  };

  try {
    const { userId } = await auth();
    if (userId) {
      headers["X-Customer-Id"] = userId;
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
    }
  } catch {
    // auth() failed — proceed with service key only
  }

  try {
    const formData = await request.formData();

    const res = await fetch(
      `${SAMMA_API_URL}/api/agents/${id}/gateway/upload`,
      {
        method: "POST",
        headers,
        body: formData,
        signal: AbortSignal.timeout(120_000),
      },
    );

    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error: unknown) {
    console.error("[agents/gateway/upload] Error:", error);
    if (error instanceof Error && error.name === "TimeoutError") {
      return Response.json({ error: "Upload request timed out" }, { status: 504 });
    }
    return Response.json({ error: "Upload request failed" }, { status: 500 });
  }
}
