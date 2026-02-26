"use client";

import { useState } from "react";
import { COUNCIL_OF_RIGHTS, COUNCIL_OF_EXPERTS } from "@/lib/constants";

const tabs = [
  { id: "rights", label: "Council of Rights", count: 8 },
  { id: "experts", label: "Domain Experts", count: 6 },
  { id: "synthesis", label: "Synthesis", count: 1 },
] as const;

export function AgentsShowcase() {
  const [activeTab, setActiveTab] = useState<string>("rights");

  return (
    <>
      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-9 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2.5 rounded-lg text-sm cursor-pointer transition-all border ${
              activeTab === t.id
                ? "bg-sutra-accent-glow border-sutra-accent-dim text-sutra-accent"
                : "bg-transparent border-sutra-border text-sutra-muted hover:border-sutra-border-hover"
            }`}
          >
            {t.label}{" "}
            <span className="opacity-50 ml-1">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Council of Rights */}
      {activeTab === "rights" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COUNCIL_OF_RIGHTS.map((a) => (
            <div
              key={a.name}
              className="bg-sutra-surface border border-sutra-border rounded-xl p-5 transition-colors hover:border-sutra-border-hover"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="text-[15px] font-semibold text-sutra-text">
                    {a.name}
                  </div>
                  <div className="text-xs text-sutra-accent">{a.aspect}</div>
                </div>
              </div>
              <p className="text-[13px] text-sutra-muted leading-relaxed">
                {a.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Domain Experts */}
      {activeTab === "experts" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COUNCIL_OF_EXPERTS.map((a) => (
            <div
              key={a.name}
              className="bg-sutra-surface border border-sutra-border rounded-xl p-5 transition-colors hover:border-sutra-border-hover"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="text-[15px] font-semibold text-sutra-text">
                    {a.name}
                  </div>
                  <div className="text-xs text-sutra-warm">{a.domain}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Synthesis */}
      {activeTab === "synthesis" && (
        <div className="max-w-md mx-auto bg-sutra-surface border border-sutra-border rounded-xl p-8 text-center">
          <span className="text-5xl">{"\uD83E\uDEB7"}</span>
          <h3 className="text-[22px] text-sutra-text mt-4 mb-2 font-medium">
            Sutra
          </h3>
          <p className="text-[15px] text-sutra-muted leading-relaxed">
            Ethics analyst. Confers with all 15 before answering.
          </p>
          <div className="mt-5 p-4 bg-sutra-accent/[0.08] rounded-lg border border-sutra-accent/[0.15]">
            <p className="text-[13px] text-sutra-accent italic">
              &ldquo;Not just &lsquo;what should I do&rsquo; &mdash; but
              &lsquo;what should I do and can I live with it.&rsquo;&rdquo;
            </p>
          </div>
        </div>
      )}
    </>
  );
}
