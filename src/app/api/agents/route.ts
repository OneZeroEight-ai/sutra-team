import { getAgents, createAgent } from "@/lib/api";
import { validatePMF, flattenPMF } from "@/lib/pmf-validator";
import { NextRequest } from "next/server";

/**
 * GET /api/agents
 *
 * Proxy to Samma Suit API — list all agents (service key auth).
 * Auth is handled by sammaApiFetch → getCustomerHeaders() which
 * gracefully falls back to service-key-only when Clerk session is missing.
 */
export async function GET() {
  try {
    const data = await getAgents();
    return Response.json(data);
  } catch (error: unknown) {
    console.error("[agents] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch agents";
    return Response.json(
      { error: message, detail: message, agents: [], total: 0 },
      { status: 500 },
    );
  }
}

/**
 * POST /api/agents
 *
 * Proxy to Samma Suit API — create a new agent (service key auth).
 * Accepts two modes:
 *   - Standard: { name, system_prompt, model, ... }
 *   - PMF import: { source: "pmf_import", pmf_raw: "<json string>" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle PMF import — validate and flatten before forwarding
    if (body.source === "pmf_import" && body.pmf_raw) {
      const validation = validatePMF(body.pmf_raw);
      if (!validation.valid) {
        return Response.json(
          { error: "Invalid PMF", details: validation.errors },
          { status: 400 },
        );
      }
      const flat = flattenPMF(validation.parsed!);
      const agentBody = {
        ...flat,
        name: flat.name as string,
        system_prompt: (flat.system_prompt as string) || "",
        pmf_raw: body.pmf_raw,
      };
      const data = await createAgent(agentBody);
      return Response.json(data);
    }

    const data = await createAgent(body);
    return Response.json(data);
  } catch (error: unknown) {
    console.error("[agents/create] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create agent";
    return Response.json({ error: message }, { status: 500 });
  }
}
