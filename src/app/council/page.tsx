import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { RightsGrid } from "@/components/council/RightsGrid";
import { ExpertsGrid } from "@/components/council/ExpertsGrid";
import { SynthesisFlow } from "@/components/council/SynthesisFlow";
import { CouncilDemo } from "@/components/council/CouncilDemo";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Council",
  description:
    "Explore how the ensemble agent deliberation system works — Council of Rights, Council of Experts, and Combined Council mode.",
};

export default function CouncilPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-8 pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-xl">
            <Image
              src="/images/council-hero.png"
              alt="The Council of Rights — AI agents and zen monks in deliberation"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                The Council
              </h1>
              <p className="text-lg text-white/80 max-w-2xl">
                Eight agents grounded in the Noble Eightfold Path. Six domain
                experts. One synthesis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deliberation Pipeline */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <SectionHeading
                title="Deliberation Pipeline"
                subtitle="8 steps from input to synthesized output"
                align="left"
              />
              <p className="text-sm text-sutra-muted leading-relaxed mb-8">
                Every query passes through a structured 8-step pipeline. Agents
                deliberate in parallel, then Sutra performs structured
                reconciliation &mdash; not simple concatenation or majority
                voting.
              </p>
            </div>
            <SynthesisFlow />
          </div>
        </div>
      </section>

      {/* Synthesis Method */}
      <section className="py-16 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Synthesis Method"
            subtitle="How Sutra reconciles multiple agent perspectives"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Agreement Mapping",
                desc: "Identify where agents converge",
              },
              {
                step: "2",
                title: "Tension Identification",
                desc: "Surface conflicts between perspectives",
              },
              {
                step: "3",
                title: "Gap Detection",
                desc: "Find what no agent addressed",
              },
              {
                step: "4",
                title: "Hierarchical Resolution",
                desc: "Apply principle hierarchy to resolve tensions",
              },
              {
                step: "5",
                title: "Transparent Uncertainty",
                desc: "Communicate remaining ambiguity honestly",
              },
            ].map((item) => (
              <Card key={item.step}>
                <span className="text-xs font-mono text-sutra-accent">
                  {item.step}
                </span>
                <h4 className="text-sm font-semibold text-sutra-text mt-2">
                  {item.title}
                </h4>
                <p className="text-xs text-sutra-muted mt-1">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Example Walkthrough */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Example Deliberation"
            subtitle="Walk through a real council deliberation step by step"
          />
          <div className="max-w-4xl mx-auto">
            <CouncilDemo />
          </div>
        </div>
      </section>

      {/* Council of Rights */}
      <section className="py-16 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Council of Rights"
            subtitle="Eight fixed agents grounded in the Noble Eightfold Path"
          />
          <RightsGrid />
        </div>
      </section>

      {/* Council of Experts */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Council of Experts"
            subtitle="Domain-specialist agents composable per use case"
          />
          <ExpertsGrid />
        </div>
      </section>

      {/* Mode Comparison */}
      <section className="py-16 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Council Modes"
            subtitle="Choose the right council for your query"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Council of Rights",
                agents: "8 fixed agents",
                focus: "Principled analysis through the Noble Eightfold Path",
                output: "Values-aligned recommendation",
                availability: "Creator plan and above",
              },
              {
                name: "Council of Experts",
                agents: "6 composable agents",
                focus: "Domain-specific strategic analysis",
                output: "Expert-driven recommendation",
                availability: "Professional plan and above",
              },
              {
                name: "Combined Council",
                agents: "14 agents (Rights + Experts)",
                focus: "Comprehensive strategic + principled analysis",
                output:
                  "Strategic Analysis + Principled Evaluation + Integrated Recommendation",
                availability: "Professional plan and above",
              },
            ].map((mode) => (
              <Card key={mode.name} hover>
                <h4 className="text-base font-semibold text-sutra-text">
                  {mode.name}
                </h4>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs text-sutra-muted">Agents</p>
                    <p className="text-sm text-sutra-text">{mode.agents}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sutra-muted">Focus</p>
                    <p className="text-sm text-sutra-text">{mode.focus}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sutra-muted">Output</p>
                    <p className="text-sm text-sutra-text">{mode.output}</p>
                  </div>
                  <div>
                    <p className="text-xs text-sutra-muted">Availability</p>
                    <p className="text-sm text-sutra-accent">
                      {mode.availability}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
