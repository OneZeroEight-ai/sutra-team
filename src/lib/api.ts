/**
 * Server-side helper for calling the Samma Suit API.
 *
 * Authenticates with the service key (SAMMA_SERVICE_KEY) since sutra.team
 * uses a different Clerk instance than sammasuit.com.  The service key
 * bypasses Clerk JWT validation on the backend.
 */

const SAMMA_API_URL =
  process.env.SAMMA_API_URL || process.env.NEXT_PUBLIC_SUTRA_API_URL || "";

const SERVICE_KEY = process.env.SAMMA_SERVICE_KEY || "";

export interface SammaApiOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
}

/**
 * Call a Samma Suit API endpoint, authenticated with the service key.
 */
export async function sammaApiFetch(
  path: string,
  options: SammaApiOptions = {},
): Promise<Response> {
  if (!SERVICE_KEY) {
    throw new Error("SAMMA_SERVICE_KEY is not configured");
  }
  const url = `${SAMMA_API_URL}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_KEY}`,
      ...options.headers,
    },
  });
}

/**
 * GET /api/council/status — check which councils the service account has.
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
 * POST /api/council/setup — seed a council under the service account.
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
 * GET /api/agents — list all agents for the service account.
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
 */
export async function createAgent(body: {
  name: string;
  system_prompt: string;
  model?: string;
  monthly_budget_usd?: number;
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
