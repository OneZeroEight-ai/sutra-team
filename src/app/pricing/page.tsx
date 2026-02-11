import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PricingTable } from "@/components/pricing/PricingTable";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Sutra.team pricing plans — from free Explorer to Enterprise. Persona hosting, council deliberation, and API access.",
};

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-sutra-text">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-sutra-muted max-w-2xl mx-auto">
            Start free. Scale as you grow. Every plan includes the
            differentiation engine and memory system.
          </p>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="pb-20 border-t border-sutra-border pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PricingTable />
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Feature Comparison"
            subtitle="Detailed breakdown across all plans"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sutra-border">
                  <th className="text-left py-3 px-4 text-sutra-muted font-medium">
                    Feature
                  </th>
                  {["Explorer", "Creator", "Professional", "Enterprise", "API"].map(
                    (tier) => (
                      <th
                        key={tier}
                        className="text-center py-3 px-4 text-sutra-muted font-medium"
                      >
                        {tier}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: "Personas",
                    values: ["1", "3", "10", "Unlimited", "Unlimited"],
                  },
                  {
                    feature: "Deliberations/mo",
                    values: ["10", "100", "500", "Custom", "Usage-based"],
                  },
                  {
                    feature: "Council of Rights",
                    values: ["—", "Yes", "Yes", "Yes", "Yes"],
                  },
                  {
                    feature: "Council of Experts",
                    values: ["—", "—", "Yes", "Yes", "Yes"],
                  },
                  {
                    feature: "Combined Council",
                    values: ["—", "—", "Yes", "Yes", "Yes"],
                  },
                  {
                    feature: "Connect Modes",
                    values: ["Text", "Voice", "Video/Voice/Phone", "Video/Voice/Phone", "Video/Voice/Phone"],
                  },
                  {
                    feature: "Memory System",
                    values: [
                      "Session",
                      "Interaction",
                      "Full",
                      "Full",
                      "Full",
                    ],
                  },
                  {
                    feature: "Knowledge Base",
                    values: ["—", "1GB", "10GB", "Custom", "Custom"],
                  },
                  {
                    feature: "API Access",
                    values: ["—", "—", "Yes", "Yes", "Yes"],
                  },
                  {
                    feature: "SSO / SAML",
                    values: ["—", "—", "—", "Yes", "—"],
                  },
                  {
                    feature: "White-labeling",
                    values: ["—", "—", "—", "Yes", "—"],
                  },
                  {
                    feature: "SLA",
                    values: ["—", "—", "—", "Yes", "—"],
                  },
                  {
                    feature: "Differentiation Score",
                    values: ["Basic", "Full", "Full", "Full", "Full"],
                  },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-sutra-border">
                    <td className="py-3 px-4 text-sutra-text">
                      {row.feature}
                    </td>
                    {row.values.map((val, i) => (
                      <td
                        key={i}
                        className={`text-center py-3 px-4 ${
                          val === "Yes"
                            ? "text-sutra-accent"
                            : val === "—"
                              ? "text-sutra-border"
                              : "text-sutra-muted"
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Questions?" />
          <div className="space-y-4">
            {[
              {
                q: "What counts as a deliberation?",
                a: "One deliberation = one query submitted to a council. Each agent's processing within that deliberation is included in the count.",
              },
              {
                q: "Can I change plans?",
                a: "Yes, upgrade or downgrade anytime. Changes take effect at your next billing cycle.",
              },
              {
                q: "What's the API pricing?",
                a: "API Developer pricing is usage-based with per-deliberation rates. Contact us for volume pricing details.",
              },
              {
                q: "Is there a free trial of paid plans?",
                a: "The Explorer plan is permanently free. Paid plans include a 14-day free trial.",
              },
            ].map((item) => (
              <Card key={item.q}>
                <h4 className="text-sm font-semibold text-sutra-text">
                  {item.q}
                </h4>
                <p className="mt-2 text-sm text-sutra-muted">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
