import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sutraApiUrl = process.env.NEXT_PUBLIC_SUTRA_API_URL;

    if (!sutraApiUrl) {
      // If SammaSuit backend isn't provisioned yet, return a stub response
      return NextResponse.json({
        deliberation_id: `stub-${Date.now()}`,
        status: "backend_not_configured",
        message:
          "Council deliberation backend is not yet provisioned. This endpoint will proxy to the SammaSuit API once configured.",
        query: body.query,
        council_mode: body.council_mode || "rights",
      });
    }

    // Proxy to SammaSuit backend
    const response = await fetch(`${sutraApiUrl}/v1/council/deliberate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("Authorization") || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Council proxy error:", error);
    return NextResponse.json(
      { error: "Failed to process council request" },
      { status: 500 }
    );
  }
}
