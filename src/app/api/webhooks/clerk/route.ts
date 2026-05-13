/**
 * Clerk webhook handler — processes user.created events.
 * auth_op_001: signature verification via Svix.
 * auth_op_003: PII isolation in logs (only log user_id, event type).
 */

import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
const SAMMASUIT_API_URL = process.env.SAMMA_API_URL!;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET!;

export async function POST(req: Request) {
  // auth_op_001: signature verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("[clerk-webhook] Signature verification failed");
    return new Response("Signature verification failed", { status: 401 });
  }

  // auth_op_003: only log non-PII fields
  console.log(`[clerk-webhook] ${evt.type}, user_id: ${(evt.data as any).id}`);

  // Handle user.created events (sign-ups)
  if (evt.type === "user.created" || evt.type === "user.updated") {
    const user = evt.data as any;
    const email = user.email_addresses?.[0]?.email_address;
    if (!email) {
      return new Response("User has no email", { status: 400 });
    }

    try {
      const res = await fetch(`${SAMMASUIT_API_URL}/internal/customers/upsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-API-Key": INTERNAL_API_SECRET,
        },
        body: JSON.stringify({
          clerk_user_id: user.id,
          email,
          first_name: user.first_name,
          last_name: user.last_name,
        }),
      });

      if (!res.ok) {
        console.error(`[clerk-webhook] Customer upsert failed: ${res.status}`);
        return new Response("Customer upsert failed", { status: 500 });
      }
    } catch (error) {
      console.error("[clerk-webhook] Backend call failed:", error);
      return new Response("Backend call failed", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}
