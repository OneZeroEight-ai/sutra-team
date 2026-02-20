import { auth } from "@clerk/nextjs/server";
import { getCouncilStatus, setupCouncil } from "@/lib/api";

/**
 * POST /api/council/ensure
 *
 * Checks if the authenticated user has a council set up.
 * If not, auto-seeds a combined council (8 Rights + 6 Experts + Sutra synthesis).
 * Returns the current council status either way.
 */
export async function POST() {
  const { userId, getToken } = await auth();
  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const token = await getToken();
  if (!token) {
    return Response.json({ error: "Failed to get auth token" }, { status: 401 });
  }

  try {
    // Check current council status
    const status = await getCouncilStatus(token);
    const totalAgents =
      status.councils.rights.agent_count + status.councils.experts.agent_count;

    if (totalAgents > 0) {
      // Council already exists
      return Response.json({
        action: "existing",
        ...status,
      });
    }

    // No council — auto-seed combined (Rights + Experts + Sutra synthesis)
    const setupResult = await setupCouncil(token, "combined");

    // Fetch updated status
    const updatedStatus = await getCouncilStatus(token);

    return Response.json({
      action: "created",
      setup: setupResult,
      ...updatedStatus,
    });
  } catch (error: unknown) {
    console.error("[council/ensure] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
