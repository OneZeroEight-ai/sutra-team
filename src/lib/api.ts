/**
 * Server-side helper for calling the Samma Suit API.
 *
 * Authenticates with the service key (SAMMA_SERVICE_KEY) and scopes all
 * requests to the current Clerk user via X-Customer-Id / X-Customer-Email
 * headers.  The backend auto-creates a customer record on first visit.
 */

import { auth, currentUser } from "@clerk/nextjs/server";

const SAMMA_API_URL =
  process.env.SAMMA_API_URL || process.env.NEXT_PUBLIC_SUTRA_API_URL || "";
const SAMMA_API_FALLBACK_URL = process.env.SAMMA_API_FALLBACK_URL || "";
const SERVICE_KEY = process.env.SAMMA_SERVICE_KEY || "";

export interface SammaApiOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
}

/**
 * Build X-Customer-* headers from the current Clerk session.
 * auth() is cheap (reads cookie); currentUser() does a Clerk API call
 * but is needed for email on first-visit auto-provisioning.
 */
async function getCustomerHeaders(): Promise<Record<string, string>> {
  try {
    const { userId } = await auth();
    if (!userId) return {};
    const headers: Record<string, string> = {
      "X-Customer-Id": userId,
    };
    try {
      const user = await currentUser();
      if (user?.emailAddresses?.[0]?.emailAddress) {
        headers["X-Customer-Email"] = user.emailAddresses[0].emailAddress;
      }
      const name = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "";
      if (name) {
        headers["X-Customer-Name"] = name;
      }
    } catch {
      // currentUser() may fail in edge cases — proceed with just userId
    }
    return headers;
  } catch {
    // No request context (e.g. webhook) — proceed without customer scoping
    return {};
  }
}

/**
 * Call a Samma Suit API endpoint, authenticated with the service key
 * and scoped to the current Clerk user.
 */
export async function sammaApiFetch(
  path: string,
  options: SammaApiOptions = {},
): Promise<Response> {
  if (!SERVICE_KEY) {
    throw new Error("SAMMA_SERVICE_KEY is not configured");
  }
  const url = `${SAMMA_API_URL}${path}`;
  const customerHeaders = await getCustomerHeaders();
  const fetchOpts: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_KEY}`,
      "X-Agency-Id": "sutra.team",
      ...customerHeaders,
      ...options.headers,
    },
  };
  try {
    const res = await fetch(url, fetchOpts);
    if (res.ok || !SAMMA_API_FALLBACK_URL) return res;
    if (res.status >= 500) {
      return await fetch(`${SAMMA_API_FALLBACK_URL}${path}`, fetchOpts);
    }
    return res;
  } catch {
    if (!SAMMA_API_FALLBACK_URL) throw new Error("Backend unavailable");
    return await fetch(`${SAMMA_API_FALLBACK_URL}${path}`, fetchOpts);
  }
}

/**
 * GET /api/council/status — check which councils the current user has.
 */
export async function getCouncilStatus() {
  const res = await sammaApiFetch("/api/council/status");
  if (!res.ok) {
    throw new Error(`Council status check failed: ${res.status}`);
  }
  return res.json() as Promise<{
    councils: {
      rights: { active: boolean; agent_count: number };
      experts: { active: boolean; agent_count: number };
      combined: { active: boolean; agent_count: number };
    };
    has_synthesis_agent: boolean;
  }>;
}

/**
 * POST /api/council/setup — seed a council for the current user.
 */
export async function setupCouncil(
  councilType: "rights" | "experts" | "combined" = "combined",
) {
  const res = await sammaApiFetch("/api/council/setup", {
    method: "POST",
    body: JSON.stringify({ council_type: councilType }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Council setup failed (${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * POST /api/council/deliberate — run a council deliberation.
 */
export async function runDeliberation(body: {
  query: string;
  council_type: string;
  model_override?: string;
  conversation_id?: string;
}) {
  const res = await sammaApiFetch("/api/council/deliberate", {
    method: "POST",
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });
  return res;
}

/**
 * GET /api/council/agents — list council agents (with their IDs).
 */
export async function listCouncilAgents(councilType?: string) {
  const qs = councilType ? `?council_type=${councilType}` : "";
  const res = await sammaApiFetch(`/api/council/agents${qs}`);
  if (!res.ok) {
    throw new Error(`Council agents list failed: ${res.status}`);
  }
  return res.json() as Promise<{
    agents: Array<{
      id: string;
      name: string;
      persona_name: string;
      council_type: string;
      council_role: string;
      voice_enabled: boolean;
    }>;
    total: number;
  }>;
}

// ─── Agent API (all agents, not just council) ───

/**
 * GET /api/agents/{id} — get a single agent by ID.
 */
export async function getAgent(agentId: string) {
  const res = await sammaApiFetch(`/api/agents/${agentId}`);
  if (!res.ok) {
    throw new Error(`Agent fetch failed: ${res.status}`);
  }
  return res.json();
}

/**
 * PUT /api/agents/{id} — update an agent.
 */
export async function updateAgent(
  agentId: string,
  body: Record<string, unknown>,
) {
  const res = await sammaApiFetch(`/api/agents/${agentId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update agent failed (${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * GET /api/agents — list all agents for the current user.
 */
export async function getAgents() {
  const res = await sammaApiFetch("/api/agents");
  if (!res.ok) {
    throw new Error(`Agents list failed: ${res.status}`);
  }
  return res.json() as Promise<{
    agents: Array<Record<string, unknown>>;
    total: number;
  }>;
}

/**
 * POST /api/agents — create a new agent.
 * Accepts both simple form data and full PMF-flattened payloads.
 */
export async function createAgent(body: {
  name: string;
  system_prompt?: string;
  model?: string;
  monthly_budget_usd?: number;
  [key: string]: unknown;
}) {
  const res = await sammaApiFetch("/api/agents", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create agent failed (${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * POST /api/agents/{id}/gateway — send a message to an agent via the gateway.
 */
export async function sendGatewayMessage(
  agentId: string,
  messages: Array<{ role: string; content: string | Array<Record<string, unknown>> }>,
  options?: { model_override?: string; conversation_id?: string },
) {
  const res = await sammaApiFetch(`/api/agents/${agentId}/gateway`, {
    method: "POST",
    body: JSON.stringify({ messages, ...options }),
    signal: AbortSignal.timeout(120_000),
  });
  return res;
}

/**
 * POST /api/agents/{id}/kill — terminate an agent.
 */
export async function killAgent(agentId: string) {
  const res = await sammaApiFetch(`/api/agents/${agentId}/kill`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Kill agent failed: ${res.status}`);
  }
  return res.json();
}

/**
 * DELETE /api/agents/{id}?purge=true — permanently delete an agent.
 * Uses the Railway fallback URL directly since the primary VPS may not
 * have the purge endpoint yet.
 */
export async function purgeAgent(agentId: string) {
  const path = `/api/agents/${agentId}?purge=true`;
  const customerHeaders = await getCustomerHeaders();
  const fetchOpts: RequestInit = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_KEY}`,
      "X-Agency-Id": "sutra.team",
      ...customerHeaders,
    },
  };
  // Prefer Railway fallback (has purge endpoint), fall back to primary
  const baseUrl = SAMMA_API_FALLBACK_URL || SAMMA_API_URL;
  const res = await fetch(`${baseUrl}${path}`, fetchOpts);
  if (!res.ok) {
    throw new Error(`Delete agent failed: ${res.status}`);
  }
  return res.json();
}

/**
 * POST /api/agents/{id}/revive — revive a terminated agent.
 */
export async function reviveAgent(agentId: string) {
  const res = await sammaApiFetch(`/api/agents/${agentId}/revive`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Revive agent failed: ${res.status}`);
  }
  return res.json();
}
