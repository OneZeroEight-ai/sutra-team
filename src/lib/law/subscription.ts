/**
 * Law subscription status helper.
 * Calls FastAPI internal endpoint to check subscription state.
 * auth_op_007: server-side enforcement.
 */

const SAMMASUIT_API_URL = process.env.SAMMA_API_URL!;
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET!;

export interface LawSubscription {
  customer_id: string;
  product: string;
  tier: string;
  status: string;
  current_period_end: string | null;
}

export async function fetchLawSubscriptionStatus(
  clerkUserId: string
): Promise<LawSubscription | null> {
  try {
    const res = await fetch(
      `${SAMMASUIT_API_URL}/internal/subscriptions/lookup?clerk_user_id=${encodeURIComponent(clerkUserId)}&product=law`,
      {
        headers: { "X-Internal-API-Key": INTERNAL_API_SECRET },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.customer_id ? data : null;
  } catch (error) {
    console.error("[law/subscription] Lookup failed:", error);
    return null;
  }
}
