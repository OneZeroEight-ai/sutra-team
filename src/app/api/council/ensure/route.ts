import { auth } from "@clerk/nextjs/server";
import { getCouncilStatus, setupCouncil } from "@/lib/api";

/**
 * POST /api/council/ensure
 *
 * Checks if the shared council is set up (under the service account).
 * If not, seeds a combined council (8 Rights + 6 Experts + Sutra synthesis).
 * Returns the current council status either way.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    // Check current council status (service key auth)
    const status = await getCouncilStatus();
    const totalAgents =
      status.councils.rights.agent_count + status.councils.experts.agent_count;

    if (totalAgents > 0) {
      return Response.json({
        action: "existing",
        ...status,
      });
    }

    // No council — seed combined (Rights + Experts + Sutra synthesis)
    const setupResult = await setupCouncil("combined");
    const updatedStatus = await getCouncilStatus();

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
