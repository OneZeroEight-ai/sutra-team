"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Check } from "lucide-react";
import { NEW_PRICING_TIERS } from "@/lib/constants";

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  async function handlePurchase(tierId: string) {
    if (!isSignedIn) {
      window.location.href = "/sign-up";
      return;
    }

    setLoadingTier(tierId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div className="min-h-screen bg-sutra-bg text-sutra-text px-6 py-20">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="text-[11px] tracking-[3px] text-sutra-accent uppercase font-mono mb-3">
            PRICING
          </div>
          <h1
            className="text-sutra-text mb-3"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(32px, 5vw, 42px)",
            }}
          >
            Start with 15 specialists. Build your team.
          </h1>
          <p className="text-[17px] text-sutra-muted max-w-[520px] mx-auto">
            Every tier includes 8-layer security enforcement, audit trails,
            cryptographic identity, and kill switches.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {NEW_PRICING_TIERS.map((tier) => {
            const tierId = tier.name.toLowerCase();
            const accentColor =
              tier.accent === "accent"
                ? "var(--sutra-accent)"
                : tier.accent === "warm"
                  ? "var(--sutra-warm)"
                  : tier.accent === "purple"
                    ? "var(--sutra-purple)"
                    : "var(--sutra-green)";

            return (
              <div
                key={tier.name}
                className={`bg-sutra-surface rounded-2xl p-8 relative flex flex-col ${
                  tier.popular
                    ? "border border-sutra-accent-dim shadow-[0_0_40px_rgba(79,209,197,0.1)]"
                    : tier.accent === "warm"
                      ? "border border-sutra-warm/20"
                      : "border border-sutra-border"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sutra-accent to-sutra-accent-dim text-sutra-bg px-3.5 py-1 rounded-full text-[10px] tracking-[2px] font-bold whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                {tier.flag && !tier.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sutra-warm to-[#e09548] text-sutra-bg px-3.5 py-1 rounded-full text-[10px] tracking-[2px] font-bold whitespace-nowrap">
                    {tier.flag} ICELAND
                  </div>
                )}

                {/* Tier name */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-sutra-text">
                    {tier.name}
                  </span>
                  {tier.flag && <span className="text-base">{tier.flag}</span>}
                </div>

                {/* Price */}
                <div className="mt-3 mb-1">
                  <span className="text-5xl font-bold text-sutra-text font-mono">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-base text-sutra-muted">{tier.period}</span>
                  )}
                </div>
                <p className="text-[13px] text-sutra-muted mb-6">
                  {tier.description}
                </p>

                {/* Features */}
                <div className="flex-1 mb-6">
                  {tier.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2.5 py-1.5 text-sm text-sutra-muted leading-relaxed"
                    >
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0"
                        style={{ color: accentColor }}
                      />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePurchase(tierId)}
                  disabled={loadingTier === tierId}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait ${
                    tier.popular
                      ? "bg-sutra-accent text-sutra-bg hover:bg-sutra-accent-dim border-none"
                      : tier.accent === "warm"
                        ? "bg-transparent border border-sutra-warm text-sutra-warm hover:bg-sutra-warm/10"
                        : "bg-transparent border border-sutra-border text-sutra-text hover:border-sutra-border-hover"
                  }`}
                >
                  {loadingTier === tierId
                    ? "Loading..."
                    : isSignedIn
                      ? tier.cta.label
                      : "Sign Up"}
                </button>

                {/* Payment methods */}
                {tier.paymentMethods && (
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-sutra-dim">
                    {tier.paymentMethods.join(" \u00B7 ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-[13px] text-sutra-dim mb-8">
          All tiers include 8-layer security enforcement, audit trails,
          cryptographic identity, and kill switches.
        </p>

        {/* Contact */}
        <div className="text-center text-sm text-sutra-muted">
          Questions?{" "}
          <a
            href="mailto:info@onezeroeight.ai"
            className="text-sutra-accent no-underline hover:underline"
          >
            info@onezeroeight.ai
          </a>
        </div>
      </div>
    </div>
  );
}
