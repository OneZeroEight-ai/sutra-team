import { headers } from "next/headers";
import Stripe from "stripe";
import { addCredits } from "@/lib/credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const LAW_FULL_COUNCIL_PRICE_ID = process.env.STRIPE_PRICE_ID_LAW_FULL_COUNCIL || "";
const SAMMASUIT_API_URL = process.env.SAMMA_API_URL || "";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Signature verification failed";
    console.error("[webhook] Signature verification failed:", message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // auth_op_003: log event type and id only
  console.log(`[stripe-webhook] ${event.type}, id: ${event.id}`);

  // ─── Existing sutra.team credit flow ───────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || "0", 10);

    if (userId && credits > 0) {
      try {
        const newTotal = await addCredits(userId, credits);
        console.log(
          `[webhook] Added ${credits} credits to ${userId}. Total: ${newTotal}`,
        );
      } catch (error) {
        console.error("[webhook] Failed to add credits:", error);
      }
    }

    // ─── Law subscription flow (Auth Bridge) ───────────────────────────
    // Check if this checkout is for a law product
    if (session.metadata?.product === "law" && session.subscription) {
      await handleLawSubscriptionEvent(session.subscription as string, session.metadata?.clerk_user_id);
    }
  }

  // Handle subscription lifecycle events for law product
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const isLawProduct =
      LAW_FULL_COUNCIL_PRICE_ID &&
      subscription.items.data.some(
        (item) => item.price.id === LAW_FULL_COUNCIL_PRICE_ID
      );

    if (isLawProduct) {
      await forwardLawSubscriptionUpdate(subscription);
    }
  }

  return Response.json({ received: true });
}

// ─── Law subscription helpers ──────────────────────────────────────────

async function handleLawSubscriptionEvent(
  subscriptionId: string,
  clerkUserId?: string
) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await forwardLawSubscriptionUpdate(subscription, clerkUserId);
  } catch (error) {
    console.error("[stripe-webhook] Law subscription retrieve failed:", error);
  }
}

async function forwardLawSubscriptionUpdate(
  subscription: Stripe.Subscription,
  clerkUserId?: string
) {
  if (!SAMMASUIT_API_URL || !INTERNAL_API_SECRET) {
    console.error("[stripe-webhook] Missing SAMMA_API_URL or INTERNAL_API_SECRET for law subscription");
    return;
  }

  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "cancelled",
    unpaid: "past_due",
    incomplete: "incomplete",
    incomplete_expired: "cancelled",
    trialing: "active",
    paused: "cancelled",
  };

  try {
    const res = await fetch(`${SAMMASUIT_API_URL}/internal/subscriptions/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-API-Key": INTERNAL_API_SECRET,
      },
      body: JSON.stringify({
        stripe_customer_id: subscription.customer,
        clerk_user_id: clerkUserId || undefined,
        product: "law",
        tier: "full_council",
        status: statusMap[subscription.status] ?? "pending",
        stripe_subscription_id: subscription.id,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }),
    });

    if (!res.ok) {
      console.error(`[stripe-webhook] Law subscription upsert failed: ${res.status}`);
    }
  } catch (error) {
    console.error("[stripe-webhook] Law subscription forward failed:", error);
  }
}
