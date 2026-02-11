"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { SynthesisResult } from "@/lib/types";

interface SynthesisOverlayProps {
  result: SynthesisResult;
  onClose: () => void;
}

export function SynthesisOverlay({ result, onClose }: SynthesisOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-sutra-accent/30 bg-sutra-surface shadow-2xl shadow-sutra-accent/10"
    >
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sutra-accent" />
            <h3 className="text-base font-semibold text-sutra-accent">
              Sutra Synthesis
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-sutra-muted hover:text-sutra-text transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-sutra-text leading-relaxed mb-6">
          {result.unified_response}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {result.agreements.length > 0 && (
            <div className="rounded-lg border border-sutra-border bg-sutra-bg p-4">
              <h4 className="text-xs font-semibold text-emerald-400 mb-2">
                Agreements
              </h4>
              <ul className="space-y-1">
                {result.agreements.map((a, i) => (
                  <li key={i} className="text-xs text-sutra-muted">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.tensions.length > 0 && (
            <div className="rounded-lg border border-sutra-border bg-sutra-bg p-4">
              <h4 className="text-xs font-semibold text-amber-400 mb-2">
                Tensions
              </h4>
              <ul className="space-y-1">
                {result.tensions.map((t, i) => (
                  <li key={i} className="text-xs text-sutra-muted">
                    {t.description}
                    <span className="text-[10px] text-sutra-border ml-1">
                      ({t.agents.join(", ")})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.gaps.length > 0 && (
            <div className="rounded-lg border border-sutra-border bg-sutra-bg p-4">
              <h4 className="text-xs font-semibold text-rose-400 mb-2">
                Gaps
              </h4>
              <ul className="space-y-1">
                {result.gaps.map((g, i) => (
                  <li key={i} className="text-xs text-sutra-muted">
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-sutra-border flex items-center justify-between">
          <span className="text-[10px] text-sutra-muted font-mono">
            Confidence: {(result.confidence * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-sutra-muted font-mono">
            {result.deliberation_id}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
