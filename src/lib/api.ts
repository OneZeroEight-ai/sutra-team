/**
 * Server-side helper for calling the Samma Suit API.
 *
 * All calls forward the Clerk JWT so the backend authenticates the user
 * the same way the dashboard does.
 */

const SAMMA_API_URL =
  process.env.SAMMA_API_URL || process.env.NEXT_PUBLIC_SUTRA_API_URL || "";

export interface SammaApiOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
}

/**
 * Call a Samma Suit API endpoint with the given Clerk JWT.
 */
export async function sammaApiFetch(
  path: string,
  token: string,
  options: SammaApiOptions = {},
): Promise<Response> {
  const url = `${SAMMA_API_URL}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

/**
 * GET /api/council/status — check which councils the user has set up.
 */
export async function getCouncilStatus(token: string) {
  const res = await sammaApiFetch("/api/council/status", token);
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
 * POST /api/council/setup — seed a council for the user.
 */
export async function setupCouncil(
  token: string,
  councilType: "rights" | "experts" | "combined" = "combined",
) {
  const res = await sammaApiFetch("/api/council/setup", token, {
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
 * GET /api/council/agents — list council agents (with their IDs).
 */
export async function listCouncilAgents(token: string, councilType?: string) {
  const qs = councilType ? `?council_type=${councilType}` : "";
  const res = await sammaApiFetch(`/api/council/agents${qs}`, token);
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
