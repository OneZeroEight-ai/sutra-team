"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { RIGHTS_AGENTS } from "@/lib/constants";

const EXAMPLE_QUERY =
  "Should we pivot our B2B SaaS from annual contracts to usage-based pricing?";

const EXAMPLE_PERSPECTIVES = [
  {
    agent: "The Wisdom Judge",
    response:
      "Usage-based pricing aligns revenue with customer value realization. However, the evidence suggests hybrid models (base + usage) outperform pure consumption for B2B. Evaluate your unit economics carefully.",
  },
  {
    agent: "The Ethics Judge",
    response:
      "Consider the impact on existing annual customers. A sudden pivot could break trust. Transparent migration with grandfathered pricing shows ethical commitment.",
  },
  {
    agent: "The Sustainer",
    response:
      "Usage-based creates incentive alignment but introduces revenue volatility. Ensure the model sustains your team's livelihood through seasonal dips. Value creation should remain the focus.",
  },
  {
    agent: "The Aware",
    response:
      "Blind spot detected: this question assumes pricing model is the core issue. Pattern analysis suggests your churn might stem from onboarding friction, not pricing structure.",
  },
];

const SYNTHESIS =
  "Recommendation: Implement a hybrid pricing model (base platform fee + usage tiers) rather than a pure pivot. Migrate existing customers with a 12-month grandfathering period. However, investigate onboarding friction as a potential root cause of churn before attributing it solely to pricing structure. The council identified a tension between revenue predictability (Sustainer) and value alignment (Wisdom Judge) that the hybrid model resolves.";

type DemoStage = "query" | "deliberation" | "synthesis";

export function CouncilDemo() {
  const [stage, setStage] = useState<DemoStage>("query");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        {(["query", "deliberation", "synthesis"] as DemoStage[]).map(
          (s, i) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                stage === s
                  ? "bg-sutra-accent text-white"
                  : "bg-sutra-surface border border-sutra-border text-sutra-muted hover:text-sutra-text"
              }`}
            >
              <span className="font-mono text-xs">{i + 1}</span>
              <span className="capitalize">{s}</span>
            </button>
          )
        )}
      </div>

      <AnimatePresence mode="wait">
        {stage === "query" && (
          <motion.div
            key="query"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <p className="text-xs text-sutra-muted mb-2 font-mono">
                USER QUERY
              </p>
              <p className="text-lg text-sutra-text font-medium">
                {EXAMPLE_QUERY}
              </p>
              <p className="mt-4 text-sm text-sutra-muted">
                This query is routed to the Council of Rights. All 8 agents
                receive the question along with their specialized context
                packages.
              </p>
            </Card>
          </motion.div>
        )}

        {stage === "deliberation" && (
          <motion.div
            key="deliberation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {EXAMPLE_PERSPECTIVES.map((p, i) => {
              const agent = RIGHTS_AGENTS.find((a) => a.name === p.agent);
              return (
                <motion.div
                  key={p.agent}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: agent?.accent_color ?? "#a78bfa",
                        }}
                      />
                      <p className="text-sm font-semibold text-sutra-text">
                        {p.agent}
                      </p>
                    </div>
                    <p className="text-sm text-sutra-muted leading-relaxed">
                      {p.response}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
            <p className="col-span-full text-xs text-sutra-muted text-center mt-2">
              Showing 4 of 8 agent perspectives for brevity
            </p>
          </motion.div>
        )}

        {stage === "synthesis" && (
          <motion.div
            key="synthesis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-sutra-accent/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-sutra-accent" />
                <p className="text-sm font-semibold text-sutra-accent">
                  Sutra Synthesis
                </p>
              </div>
              <p className="text-sm text-sutra-text leading-relaxed">
                {SYNTHESIS}
              </p>
              <div className="mt-4 pt-4 border-t border-sutra-border">
                <p className="text-xs text-sutra-muted">
                  Method: Agreement mapping, tension identification, gap
                  detection, hierarchical resolution, transparent uncertainty
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
