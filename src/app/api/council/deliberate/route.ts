import { auth } from "@clerk/nextjs/server";
import { deductCredit, getCredits } from "@/lib/credits";

export async function POST(request: Request) {
  // 1. Authenticate
  const { userId } = await auth();
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

  // 4. Forward to agent server
  const agentUrl = process.env.AGENT_SERVER_URL;
  if (!agentUrl) {
    return Response.json(
      { error: "Agent server not configured" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${agentUrl}/deliberate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DELIBERATION_API_KEY || ""}`,
        "X-User-Id": userId,
      },
      body: JSON.stringify({ ...body, userId }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[deliberate] Agent server error:",
        response.status,
        errorText,
      );
      return Response.json(
        { error: "Deliberation failed", detail: errorText },
        { status: response.status },
      );
    }

    // 5. Deduct credit AFTER successful deliberation (not before)
    const { remaining } = await deductCredit(userId);

    // 6. Return result with credit info
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
