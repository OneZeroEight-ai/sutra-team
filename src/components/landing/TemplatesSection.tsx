"use client";

import { useState } from "react";
import { ChevronDown, Bot, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";

export function TemplatesSection() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded
    ? TEMPLATE_CATEGORIES
    : TEMPLATE_CATEGORIES.slice(0, 6);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {visible.map((cat) => (
          <div
            key={cat.category}
            className="bg-sutra-surface border border-sutra-border rounded-xl p-5 transition-colors hover:border-sutra-border-hover"
          >
            <div className="text-sm font-semibold text-sutra-text mb-2.5">
              {cat.category}
            </div>
            {cat.templates.map((t) => (
              <div
                key={t}
                className="text-[13px] text-sutra-muted py-1 flex items-center gap-1.5"
              >
                <Bot size={12} className="text-sutra-dim" /> {t}
              </div>
            ))}
          </div>
        ))}
      </div>

      {!expanded && (
        <div className="text-center mt-6">
          <button
            onClick={() => setExpanded(true)}
            className="bg-transparent border border-sutra-border text-sutra-muted px-6 py-2.5 rounded-lg cursor-pointer text-sm inline-flex items-center gap-1.5 hover:border-sutra-border-hover transition-colors"
          >
            Show all {TEMPLATE_CATEGORIES.length} categories{" "}
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {/* PMF Explainer */}
      <div className="mt-12 bg-sutra-surface border border-sutra-border rounded-xl p-8 flex gap-8 items-start flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg text-sutra-text mb-3 font-semibold">
            Portable Mind Format
          </h3>
          <p className="text-sm text-sutra-muted leading-relaxed">
            Every agent is a structured JSON file &mdash; identity, voice,
            values, knowledge, behavioral constraints. It runs on Claude today.
            It runs on GPT tomorrow. The persona rides the model. Your agents
            are never locked to a single provider.
          </p>
          <Link
            href="/book"
            className="text-sutra-accent text-[13px] no-underline inline-flex items-center gap-1 mt-3 hover:underline"
          >
            Read The Portable Mind <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex-1 min-w-[300px] bg-sutra-bg rounded-lg p-4 font-mono text-xs text-sutra-muted leading-[1.8] overflow-auto">
          <span className="text-sutra-dim">{"{"}</span>
          <br />
          &nbsp;&nbsp;
          <span className="text-sutra-accent">&quot;persona_id&quot;</span>:{" "}
          <span className="text-sutra-warm">
            &quot;sutra-wisdom-judge&quot;
          </span>
          ,
          <br />
          &nbsp;&nbsp;
          <span className="text-sutra-accent">&quot;name&quot;</span>:{" "}
          <span className="text-sutra-warm">&quot;Wisdom Judge&quot;</span>,
          <br />
          &nbsp;&nbsp;
          <span className="text-sutra-accent">&quot;framework&quot;</span>:{" "}
          <span className="text-sutra-warm">
            &quot;noble_eightfold_path&quot;
          </span>
          ,
          <br />
          &nbsp;&nbsp;
          <span className="text-sutra-accent">&quot;aspect&quot;</span>:{" "}
          <span className="text-sutra-warm">&quot;right_view&quot;</span>,
          <br />
          &nbsp;&nbsp;
          <span className="text-sutra-accent">&quot;voice&quot;</span>:{" "}
          {"{ "}
          <span className="text-sutra-warm">&quot;tone&quot;</span>: [
          <span className="text-sutra-warm">&quot;analytical&quot;</span>,{" "}
          <span className="text-sutra-warm">&quot;direct&quot;</span>] {"}"}
          ,
          <br />
          &nbsp;&nbsp;
          <span className="text-sutra-accent">&quot;model&quot;</span>:{" "}
          <span className="text-sutra-warm">
            &quot;provider_agnostic&quot;
          </span>
          ,
          <br />
          &nbsp;&nbsp;
          <span className="text-sutra-accent">&quot;skills&quot;</span>: [
          <span className="text-sutra-warm">&quot;web-search&quot;</span>,{" "}
          <span className="text-sutra-warm">
            &quot;document-reader&quot;
          </span>
          ],
          <br />
          &nbsp;&nbsp;
          <span className="text-sutra-accent">&quot;security&quot;</span>:{" "}
          <span className="text-sutra-warm">
            &quot;sammasuit_8_layer&quot;
          </span>
          <br />
          <span className="text-sutra-dim">{"}"}</span>
        </div>
      </div>
    </>
  );
}
