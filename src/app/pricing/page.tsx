"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    if (!isSignedIn) {
      window.location.href = "/sign-up";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Try the Council</h1>
          <p className="text-zinc-400">
            8 AI agents grounded in the Noble Eightfold Path deliberate on your
            question. One synthesis. Decisions you can live with.
          </p>
        </div>

        {/* Pilot Offer */}
        <div className="bg-zinc-900 border border-violet-500/30 rounded-xl p-6 mb-6">
          <div className="text-xs text-violet-400 uppercase tracking-wider mb-2">
            Pilot Access
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold">$20</span>
            <span className="text-zinc-500">one-time</span>
          </div>
          <ul className="space-y-2 mb-6 text-sm text-zinc-300">
            <li className="flex items-center gap-2">
              <span className="text-violet-400">&#10003;</span> 10 council
              deliberations
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-400">&#10003;</span> All 8 Rights
              agents + Sutra synthesis
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-400">&#10003;</span> Full perspective
              reports
            </li>
            <li className="flex items-center gap-2">
              <span className="text-zinc-600">&mdash;</span>
              <span className="text-zinc-500">No subscription required</span>
            </li>
          </ul>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-lg transition cursor-pointer disabled:cursor-wait"
          >
            {loading
              ? "Loading..."
              : isSignedIn
                ? "Purchase Pilot Access"
                : "Sign Up & Purchase"}
          </button>
        </div>

        {/* Free trial note */}
        <div className="text-center text-sm text-zinc-500">
          <p>New accounts include 3 free deliberations to try the council.</p>
          <p className="mt-1">
            Questions?{" "}
            <a
              href="mailto:jbwagoner@gmail.com"
              className="text-violet-400 hover:text-violet-300"
            >
              jbwagoner@gmail.com
            </a>
          </p>
        </div>

        {/* Future tiers (greyed out) */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 text-center mb-4">Coming soon</p>
          <div className="grid grid-cols-2 gap-4 opacity-40">
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="text-sm font-semibold">Creator</div>
              <div className="text-lg font-bold">
                $49<span className="text-xs text-zinc-500">/mo</span>
              </div>
              <div className="text-xs text-zinc-500">30 deliberations/mo</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="text-sm font-semibold">Professional</div>
              <div className="text-lg font-bold">
                $149<span className="text-xs text-zinc-500">/mo</span>
              </div>
              <div className="text-xs text-zinc-500">75 deliberations/mo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
