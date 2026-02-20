import { auth } from "@clerk/nextjs/server";
import { runDeliberation } from "@/lib/api";

export async function POST(request: Request) {
  // 1. Authenticate (Clerk — sutra.team session)
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  // 2. Parse request
  const body = await request.json();

  try {
    // 3. Forward to Samma Suit API (service key auth)
    const response = await runDeliberation({
      query: body.query,
      council_type: body.councilMode || body.council_type || "rights",
      model_override: body.model_override,
      conversation_id: body.conversation_id,
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

    // 4. Return result
    const data = await response.json();
    return Response.json(data);
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
