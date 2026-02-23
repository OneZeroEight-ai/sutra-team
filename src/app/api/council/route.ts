import { getCouncilStatus } from "@/lib/api";

/**
 * GET /api/council — proxy to Samma Suit council status (service key auth).
 */
export async function GET() {
  try {
    const status = await getCouncilStatus();
    return Response.json(status);
  } catch (error: unknown) {
    console.error("[council/status] Error:", error);
    return Response.json(
      { error: "Failed to fetch council status" },
      { status: 500 },
    );
  }
}
