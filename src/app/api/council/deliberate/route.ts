import { auth } from "@clerk/nextjs/server";
import { deductCredit, getCredits } from "@/lib/credits";
import { sammaApiFetch } from "@/lib/api";

export async function POST(request: Request) {
  // 1. Authenticate
  const { userId, getToken } = await auth();
  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  // 2. Check credits
  const credits = await getCredits(userId);
  if (credits <= 0) {
    return Response.json(
      {
        error: "No credits remaining",
        credits: 0,
        upgradeUrl: "/pricing",
      },
      { status: 402 },
    );
  }

  // 3. Parse request
  const body = await request.json();

  // 4. Get Clerk JWT for Samma Suit API auth
  const token = await getToken();
  if (!token) {
    return Response.json({ error: "Failed to get auth token" }, { status: 401 });
  }

  try {
    // 5. Forward to Samma Suit API
    const response = await sammaApiFetch("/api/council/deliberate", token, {
      method: "POST",
      body: JSON.stringify({
        query: body.query,
        council_type: body.councilMode || body.council_type || "rights",
        model_override: body.model_override,
        conversation_id: body.conversation_id,
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[deliberate] Samma API error:",
        response.status,
        errorText,
      );
      return Response.json(
        { error: "Deliberation failed", detail: errorText },
        { status: response.status },
      );
    }

    // 6. Deduct credit AFTER successful deliberation (not before)
    const { remaining } = await deductCredit(userId);

    // 7. Return result with credit info
    const data = await response.json();
    return Response.json({
      ...data,
      credits: { remaining, deducted: 1 },
    });
  } catch (error: unknown) {
    console.error("[deliberate] Error:", error);
    if (error instanceof Error && error.name === "TimeoutError") {
      return Response.json(
        { error: "Deliberation timed out" },
        { status: 504 },
      );
    }
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
