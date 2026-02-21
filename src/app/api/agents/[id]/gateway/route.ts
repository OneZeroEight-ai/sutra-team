import { auth } from "@clerk/nextjs/server";
import { sendGatewayMessage } from "@/lib/api";
import { NextRequest } from "next/server";

/**
 * POST /api/agents/[id]/gateway
 *
 * Proxy to Samma Suit API — send a message to an agent via the gateway.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { messages, model_override, conversation_id } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "messages array is required" },
        { status: 400 },
      );
    }

    const res = await sendGatewayMessage(id, messages, {
      model_override,
      conversation_id,
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (error: unknown) {
    console.error("[agents/gateway] Error:", error);
    return Response.json(
      { error: "Gateway request failed" },
      { status: 500 },
    );
  }
}
