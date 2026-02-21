import { auth } from "@clerk/nextjs/server";
import { getCouncilStatus, setupCouncil } from "@/lib/api";

/**
 * POST /api/council/ensure
 *
 * Checks if the shared council is set up (under the service account).
 * If not, seeds a combined council (8 Rights + 6 Experts + Sutra synthesis).
 * Returns the current council status either way.
 *
 * TODO: Per-user customer records
 * Currently all sutra.team users share the __service__ customer via the
 * service key proxy. For proper billing and agent ownership:
 * 1. Create a real samma_customer record per Clerk userId (upsert on first visit)
 * 2. User-created agents should belong to that customer, not __service__
 * 3. Council agents stay under __service__ but remain accessible to all users
 * 4. This endpoint (or a new /api/auth/init) should handle the upsert
 * See: Fix 3 in the persona-editor commit for context.
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
