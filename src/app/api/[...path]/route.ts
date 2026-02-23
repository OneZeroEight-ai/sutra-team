import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

/**
 * Catch-all API proxy: forwards /api/* to api.sammasuit.com with service key
 * and user-scoping headers (X-Customer-Id, X-Customer-Email).
 *
 * The dashboard.html makes ~35 different API calls. Instead of creating
 * individual proxy routes for each, this catch-all handles them all.
 * Specific routes (e.g. /api/agents, /api/council/*) take priority over
 * this catch-all in Next.js App Router.
 *
 * Special cases:
 * - /api/auth/me → returns Clerk user info + backend customer (not proxied)
 * - /api/auth/logout → no-op (Clerk handles sign-out client-side)
 */

const SAMMA_API_URL =
  process.env.SAMMA_API_URL || process.env.NEXT_PUBLIC_SUTRA_API_URL || "";
const SAMMA_API_FALLBACK_URL = process.env.SAMMA_API_FALLBACK_URL || "";
const SERVICE_KEY = process.env.SAMMA_SERVICE_KEY || "";

/** Fetch with automatic fallback to direct Railway domain if primary fails */
async function fetchWithFallback(
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    const res = await fetch(url, init);
    if (res.ok || !SAMMA_API_FALLBACK_URL) return res;
    // 5xx from primary → try fallback
    if (res.status >= 500) {
      const fallbackUrl = url.replace(SAMMA_API_URL, SAMMA_API_FALLBACK_URL);
      return await fetch(fallbackUrl, init);
    }
    return res;
  } catch {
    if (!SAMMA_API_FALLBACK_URL) throw new Error("Backend unavailable");
    const fallbackUrl = url.replace(SAMMA_API_URL, SAMMA_API_FALLBACK_URL);
    return await fetch(fallbackUrl, init);
  }
}

async function handleAuthMe() {
  let user;
  try {
    user = await currentUser();
  } catch (e) {
    console.error("[auth/me] currentUser() threw:", e);
    return Response.json({ error: "Auth service error" }, { status: 503 });
  }

  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
  const email = user.emailAddresses[0]?.emailAddress || "";
  const name = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : email;

  // Fetch real customer data from backend (triggers auto-creation on first visit)
  let backendCustomer: Record<string, unknown> | null = null;
  if (SERVICE_KEY && SAMMA_API_URL) {
    try {
      const res = await fetchWithFallback(
        `${SAMMA_API_URL}/api/billing/status`,
        {
          headers: {
            Authorization: `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
            "X-Customer-Id": user.id,
            "X-Customer-Email": email,
            "X-Customer-Name": name,
          },
        },
      );
      if (res.ok) {
        backendCustomer = await res.json();
      }
    } catch {
      // Backend unavailable — return Clerk-only data with error flag
    }
  }

  return Response.json({
    customer: {
      id: (backendCustomer?.customer_id as string) || user.id,
      email,
      name,
      tier: (backendCustomer?.tier as string) || "free",
      max_agents: (backendCustomer?.max_agents as number) || 20,
      key_mode: (backendCustomer?.key_mode as string) || "credits",
      credit_balance: (backendCustomer?.credit_balance as number) || 100,
    },
  });
}

async function proxyToBackend(
  request: NextRequest,
  pathSegments: string[],
) {
  // Special: /api/auth/me — return Clerk user info
  if (pathSegments.join("/") === "auth/me") {
    return handleAuthMe();
  }

  // Special: /api/auth/logout — no-op (Clerk handles it)
  if (pathSegments.join("/") === "auth/logout") {
    return Response.json({ ok: true });
  }

  if (!SERVICE_KEY) {
    return Response.json(
      { error: "SAMMA_SERVICE_KEY is not configured" },
      { status: 500 },
    );
  }

  if (!SAMMA_API_URL) {
    return Response.json(
      { error: "SAMMA_API_URL is not configured" },
      { status: 500 },
    );
  }

  // Reconstruct the full API path: /api/auth/me → pathSegments = ["auth", "me"]
  const apiPath = "/api/" + pathSegments.join("/");
  const url = new URL(apiPath, SAMMA_API_URL);

  // Forward query params
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    "X-Agency-Id": "sutra.team",
  };

  // Try to resolve user identity for per-user scoping
  try {
    const { userId } = await auth();
    if (userId) {
      headers["X-Customer-Id"] = userId;
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
        // Proceed with just userId
      }
    }
  } catch {
    // auth() failed — proceed with service key only
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  // Forward body for non-GET requests
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    } catch {
      // No body
    }
  }

  const res = await fetchWithFallback(url.toString(), fetchOptions);
  const data = await res.text();

  return new Response(data, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/json",
    },
  });
}

async function handle(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    return await proxyToBackend(request, path);
  } catch (error) {
    console.error("[proxy] Unhandled error:", error);
    const message = error instanceof Error ? error.message : "Proxy error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
