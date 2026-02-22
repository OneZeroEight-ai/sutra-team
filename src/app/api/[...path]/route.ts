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
const SERVICE_KEY = process.env.SAMMA_SERVICE_KEY || "";

async function handleAuthMe() {
  const user = await currentUser();
  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }
  const email = user.emailAddresses[0]?.emailAddress || "";
  const name = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : email;

  // Fetch real customer data from backend (triggers auto-creation on first visit)
  let backendCustomer: Record<string, unknown> | null = null;
  if (SERVICE_KEY) {
    try {
      const res = await fetch(`${SAMMA_API_URL}/api/billing/status`, {
        headers: {
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          "X-Customer-Id": user.id,
          "X-Customer-Email": email,
          "X-Customer-Name": name,
        },
      });
      if (res.ok) {
        backendCustomer = await res.json();
      }
    } catch {
      // Backend unavailable — return Clerk-only data
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
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

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
    "X-Customer-Id": userId,
  };

  // Get email + name for auto-provisioning (first visit)
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

  try {
    const res = await fetch(url.toString(), fetchOptions);
    const data = await res.text();

    return new Response(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("[proxy]", request.method, apiPath, error);
    return Response.json({ error: "Proxy request failed" }, { status: 502 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(request, path);
}
