import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PricingTable } from "@/components/pricing/PricingTable";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Sutra.team credit-based pricing — pay for deliverables, not deliberations. From free Explorer to Enterprise.",
};

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-sutra-text">
            Pay for Deliverables, Not Meetings
          </h1>
          <p className="mt-4 text-lg text-sutra-muted max-w-2xl mx-auto">
            Credits are consumed when the council produces something of value.
            Chat all you want — you only pay when it ships.
          </p>
        </div>
      </section>

      {/* Pricing Table + Deliverable Menu */}
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
                    feature: "Credits/month",
                    values: ["5", "30", "75", "Custom", "Usage-based"],
                  },
                  {
                    feature: "Overage Rate",
                    values: ["—", "$5/credit", "$4/credit", "Custom", "$5/credit"],
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
                    feature: "Skill Deliverables",
                    values: ["—", "Yes", "Yes", "Yes", "Yes"],
                  },
                  {
                    feature: "Premium Deliverables",
                    values: ["—", "—", "Yes", "Yes", "Yes"],
                  },
                  {
                    feature: "Connect Modes",
                    values: ["Text", "Voice/Phone", "Video/Voice/Phone", "Video/Voice/Phone", "All"],
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
                    feature: "Credit Rollover",
                    values: ["No", "No", "No", "Custom", "N/A"],
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
                q: "What are credits?",
                a: "Credits are consumed when the council produces a deliverable — a document, analysis, or structured output. Conversational sessions cost 1 credit. Council deliberations cost 3-5 credits. Skill deliverables like press releases or business plans cost 3-50 credits depending on complexity.",
              },
              {
                q: "Do unused credits roll over?",
                a: "No. Monthly credits expire at the end of each billing cycle. If you need more, purchase a credit pack — those credits never expire.",
              },
              {
                q: "What happens if I run out of credits?",
                a: "Creator and Professional plans support overage billing. Additional credits are charged at your tier's overage rate ($5 or $4 per credit). Explorer users cannot purchase overage — upgrade to continue.",
              },
              {
                q: "Can I change plans?",
                a: "Yes, upgrade or downgrade anytime. Changes take effect at your next billing cycle.",
              },
              {
                q: "What about Expert Sessions?",
                a: "Human expert sessions ($79 for 30 minutes) are purchased separately and do not consume credits. They include an AI-generated prep packet.",
              },
              {
                q: "Is there a free trial?",
                a: "The Explorer plan is permanently free with 5 credits/month. Paid plans include a 14-day free trial.",
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
