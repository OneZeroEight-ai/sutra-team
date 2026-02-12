"use client";

import { useState } from "react";
import { PRICING_TIERS } from "@/lib/constants";
import { TIER_PRICE_MAP, DELIVERABLE_MENU, STRIPE_CONFIG } from "@/lib/stripe";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

const SUBSCRIBABLE_TIERS = new Set(Object.keys(TIER_PRICE_MAP));

export function PricingTable() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(tierName: string) {
    setLoading(tierName);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierName }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  }

  function getButtonProps(tier: (typeof PRICING_TIERS)[number]) {
    if (SUBSCRIBABLE_TIERS.has(tier.name)) {
      return {
        onClick: () => handleSubscribe(tier.name),
        disabled: loading === tier.name,
        label: loading === tier.name ? "Redirecting..." : "Subscribe",
      };
    }
    if (tier.name === "Enterprise") {
      return { href: "/about#contact", label: "Contact Sales" };
    }
    if (tier.price === "Free") {
      return { href: "/connect", label: "Get Started Free" };
    }
    return { href: "/docs", label: "Get Started" };
  }

  return (
    <div className="space-y-16">
      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {PRICING_TIERS.map((tier) => {
          const bp = getButtonProps(tier);
          return (
            <Card
              key={tier.name}
              className={
                tier.highlighted
                  ? "border-sutra-accent/50 relative ring-1 ring-sutra-accent/20"
                  : ""
              }
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sutra-accent text-white text-xs font-medium whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-sutra-text">
                  {tier.name}
                </h3>
                <p className="text-xs text-sutra-muted mt-1">
                  {tier.target_user}
                </p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-sutra-text">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-sutra-muted">
                      {tier.period}
                    </span>
                  )}
                </div>
                {tier.credits && (
                  <p className="mt-1 text-sm text-sutra-accent font-medium">
                    {tier.credits} credits/month
                  </p>
                )}
              </div>
              <ul className="space-y-2.5 mb-6">
                {tier.includes.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-sutra-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-sutra-muted">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={tier.highlighted ? "primary" : "secondary"}
                className="w-full"
                href={"href" in bp ? bp.href : undefined}
                onClick={"onClick" in bp ? bp.onClick : undefined}
                disabled={"disabled" in bp ? bp.disabled : undefined}
              >
                {bp.label}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Credit Packs */}
      <div>
        <h3 className="text-xl font-semibold text-sutra-text mb-4">
          Need more credits?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
          {Object.values(STRIPE_CONFIG.creditPacks).map((pack) => (
            <Card key={pack.credits}>
              <p className="text-lg font-bold text-sutra-text">
                {pack.credits} Credits
              </p>
              <p className="text-2xl font-bold text-sutra-text mt-1">
                ${pack.price}
              </p>
              <p className="text-xs text-sutra-muted mt-1">
                ${pack.perCredit.toFixed(2)}/credit &middot; No expiration
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Deliverable Menu */}
      <div>
        <h3 className="text-xl font-semibold text-sutra-text mb-2">
          What Your Credits Buy
        </h3>
        <p className="text-sm text-sutra-muted mb-6">
          Credits are consumed when the council produces a deliverable — not when
          you chat.
        </p>
        <div className="space-y-8">
          {DELIVERABLE_MENU.map((category) => (
            <div key={category.category}>
              <h4 className="text-sm font-semibold text-sutra-muted uppercase tracking-wider mb-3">
                {category.category}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sutra-border">
                      <th className="text-left py-2 px-3 text-sutra-muted font-medium">
                        Deliverable
                      </th>
                      <th className="text-center py-2 px-3 text-sutra-muted font-medium w-24">
                        Credits
                      </th>
                      <th className="text-left py-2 px-3 text-sutra-muted font-medium">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map((item) => (
                      <tr
                        key={item.name}
                        className="border-b border-sutra-border/50"
                      >
                        <td className="py-2 px-3 text-sutra-text font-medium">
                          {item.name}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {item.credits !== null ? (
                            <span className="inline-block bg-sutra-accent/10 text-sutra-accent text-xs font-bold px-2 py-0.5 rounded-full">
                              {item.credits}
                            </span>
                          ) : (
                            <span className="text-sutra-text font-bold">
                              ${item.price}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-sutra-muted">
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
