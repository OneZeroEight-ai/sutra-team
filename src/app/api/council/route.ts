import { auth } from "@clerk/nextjs/server";
import { getCouncilStatus } from "@/lib/api";

/**
 * GET /api/council — proxy to Samma Suit council status.
 */
export async function GET() {
  const { userId, getToken } = await auth();
  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const token = await getToken();
  if (!token) {
    return Response.json({ error: "Failed to get auth token" }, { status: 401 });
  }

  try {
    const status = await getCouncilStatus(token);
    return Response.json(status);
  } catch (error: unknown) {
    console.error("[council/status] Error:", error);
    return Response.json(
      { error: "Failed to fetch council status" },
      { status: 500 },
    );
  }
}
