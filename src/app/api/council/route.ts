import { NextRequest, NextResponse } from "next/server";

const AGENT_SERVER_URL = process.env.AGENT_SERVER_URL;
const DELIBERATION_API_KEY = process.env.DELIBERATION_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!AGENT_SERVER_URL) {
      // If agent server isn't provisioned yet, return a stub response
      return NextResponse.json({
        deliberation_id: `stub-${Date.now()}`,
        status: "backend_not_configured",
        message:
          "Council deliberation backend is not yet provisioned. Set AGENT_SERVER_URL to enable.",
        query: body.query,
        council_mode: body.councilMode || "rights",
      });
    }

    // Proxy to agent server deliberation endpoint
    const response = await fetch(`${AGENT_SERVER_URL}/deliberate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(DELIBERATION_API_KEY
          ? { Authorization: `Bearer ${DELIBERATION_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Council proxy error:", error);
    return NextResponse.json(
      { error: "Failed to process council request" },
      { status: 500 },
    );
  }
}
