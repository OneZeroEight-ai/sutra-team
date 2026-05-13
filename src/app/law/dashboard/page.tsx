export const dynamic = 'force-dynamic';

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchLawSubscriptionStatus } from "@/lib/law/subscription";

export default async function LawDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const sub = await fetchLawSubscriptionStatus(userId);
  if (!sub || sub.status !== "active") redirect("/subscription-required");

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-8">
      <h1 className="text-3xl font-bold mb-4">Legal Council Dashboard</h1>
      <p className="text-stone-400">
        Your subscription is active. The full dashboard ships in Build 3.
      </p>
      <div className="mt-8 p-4 bg-stone-900 rounded border border-stone-800">
        <p className="text-stone-500 text-sm">
          Customer ID: {sub.customer_id}
          <br />
          Product: {sub.product}
          <br />
          Tier: {sub.tier}
          <br />
          Status: {sub.status}
          <br />
          Period ends: {sub.current_period_end || "N/A"}
        </p>
      </div>
    </div>
  );
}
