"use client";

import { motion } from "framer-motion";
import { DELIBERATION_STEPS } from "@/lib/constants";

export function SynthesisFlow() {
  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-px bg-sutra-border hidden sm:block" />
      <div className="space-y-6">
        {DELIBERATION_STEPS.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="relative flex items-start gap-4 sm:pl-16"
          >
            <div className="hidden sm:flex absolute left-0 w-12 h-12 rounded-full border border-sutra-border bg-sutra-surface items-center justify-center text-sm font-mono text-sutra-accent shrink-0">
              {step.step}
            </div>
            <div className="sm:hidden flex w-10 h-10 rounded-full border border-sutra-border bg-sutra-surface items-center justify-center text-sm font-mono text-sutra-accent shrink-0">
              {step.step}
            </div>
            <div className="pt-1.5">
              <h4 className="text-sm font-semibold text-sutra-text">
                {step.name}
              </h4>
              <p className="text-sm text-sutra-muted mt-1">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
