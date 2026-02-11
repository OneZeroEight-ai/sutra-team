"use client";

import { motion } from "framer-motion";
import { DIFFERENTIATION_METRICS } from "@/lib/constants";

export function DiffScore() {
  return (
    <div className="space-y-5">
      {DIFFERENTIATION_METRICS.map((metric, i) => (
        <motion.div
          key={metric.name}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-medium text-sutra-text">
                {metric.name}
              </span>
              <span className="text-xs text-sutra-muted ml-2">
                {metric.description}
              </span>
            </div>
            <span className="text-sm font-mono text-sutra-accent">
              {metric.unit}
            </span>
          </div>
          <div className="h-2 rounded-full bg-sutra-bg overflow-hidden border border-sutra-border">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sutra-accent to-sutra-lotus"
              initial={{ width: 0 }}
              whileInView={{ width: `${metric.target * 100}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 + 0.3, duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
