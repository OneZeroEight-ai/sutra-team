import { getCouncilStatus, setupCouncil } from "@/lib/api";

/**
 * POST /api/council/ensure
 *
 * Checks if the current user has a council set up.
 * If not, seeds a combined council (8 Rights + 6 Experts + Sutra synthesis)
 * under their customer record. Returns the current council status either way.
 *
 * Auth handled by sammaApiFetch → getCustomerHeaders(). Falls back to
 * service-key-only when Clerk session is missing.
 */
export async function POST() {
  try {
    // Check current council status (scoped to this user via X-Customer-Id)
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
