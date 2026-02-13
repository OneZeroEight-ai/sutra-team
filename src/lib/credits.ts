import { clerkClient } from "@clerk/nextjs/server";

// ============================================
// CREDIT CONSTANTS
// ============================================
export const FREE_TRIAL_CREDITS = 3; // New users get 3 free deliberations
export const PILOT_CREDITS = 10; // $20 pilot purchase = 10 deliberations

// ============================================
// CREDIT OPERATIONS
// ============================================

export async function getCredits(userId: string): Promise<number> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = user.publicMetadata as Record<string, unknown>;
    const credits = meta?.credits;

    // First-time user: initialize with free trial
    if (credits === undefined || credits === null) {
      await setCredits(userId, FREE_TRIAL_CREDITS);
      return FREE_TRIAL_CREDITS;
    }

    return Number(credits);
  } catch (error) {
    console.error("[credits] Failed to get credits:", error);
    return 0;
  }
}

export async function setCredits(
  userId: string,
  credits: number,
): Promise<void> {
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        credits: Math.max(0, Math.floor(credits)),
        lastCreditUpdate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[credits] Failed to set credits:", error);
    throw error;
  }
}

export async function deductCredit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  message?: string;
}> {
  const credits = await getCredits(userId);

  if (credits <= 0) {
    return {
      allowed: false,
      remaining: 0,
      message: "No credits remaining. Purchase more at /pricing.",
    };
  }

  const remaining = credits - 1;
  await setCredits(userId, remaining);
  return { allowed: true, remaining };
}

export async function addCredits(
  userId: string,
  amount: number,
): Promise<number> {
  const current = await getCredits(userId);
  const updated = current + amount;
  await setCredits(userId, updated);
  return updated;
}

export async function getUserCreditInfo(
  userId: string,
): Promise<{ credits: number; tier: string }> {
  const credits = await getCredits(userId);
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const tier =
    (user.publicMetadata as Record<string, unknown>)?.tier as string || "free";
  return { credits, tier };
}
