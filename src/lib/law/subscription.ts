/**
 * Law subscription status helper.
 * Calls FastAPI internal endpoint to check subscription state.
 * auth_op_007: server-side enforcement.
 */

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
  const apiUrl = process.env.SAMMA_API_URL;
  const apiSecret = process.env.INTERNAL_API_SECRET;
  if (!apiUrl || !apiSecret) {
    console.error("[law/subscription] Missing SAMMA_API_URL or INTERNAL_API_SECRET");
    return null;
  }
  try {
    const res = await fetch(
      `${apiUrl}/internal/subscriptions/lookup?clerk_user_id=${encodeURIComponent(clerkUserId)}&product=law`,
      {
        headers: { "X-Internal-API-Key": apiSecret },
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
