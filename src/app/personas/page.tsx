import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PersonaCard } from "@/components/persona/PersonaCard";
import { PersonaBuilder } from "@/components/persona/PersonaBuilder";
import { RIGHTS_AGENTS, AGENT_AVATARS } from "@/lib/constants";

function toSlug(name: string): string {
  return name.replace(/^The /, "").toLowerCase().replace(/\s+/g, "-");
}

export const metadata: Metadata = {
  title: "Personas",
  description:
    "Explore the Sutra.team persona marketplace — from Sutra, the exemplary synthesis agent, to the Noble 8 and custom persona creation.",
};

export default function PersonasPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-sutra-text">
            Persona Marketplace
          </h1>
          <p className="mt-4 text-lg text-sutra-muted max-w-2xl mx-auto">
            Discover AI personas with real identity, persistent memory, and
            measurable differentiation from the base model.
          </p>
        </div>
      </section>

      {/* Featured Persona: Sutra */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Featured Persona"
            subtitle="The exemplary embodiment of the Intelligent Agent architecture"
          />
          <div className="max-w-md mx-auto">
            <PersonaCard
              name="Sutra"
              designation="Synthesis Agent"
              tagline="The core synthesis agent that reconciles multiple perspectives into unified recommendations. Built on the three-body reference structure: Anthropic's Constitution, Zen AI philosophy, and OneZeroEight.ai technical platform."
              accentColor="#a78bfa"
              imageSrc={AGENT_AVATARS["sutra"]}
              featured
            />
          </div>
        </div>
      </section>

      {/* Noble 8 */}
      <section className="py-16 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="The Noble 8"
            subtitle="Eight specialized agents of the Council of Rights &mdash; grounded in the Noble Eightfold Path"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RIGHTS_AGENTS.map((agent) => (
              <PersonaCard
                key={agent.name}
                name={agent.name}
                designation={`${agent.path_aspect} (${agent.pali_name})`}
                tagline={agent.functional_domain}
                accentColor={agent.accent_color}
                imageSrc={AGENT_AVATARS[toSlug(agent.name)]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Create Your Own */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Create Your Own"
            subtitle="Define custom personas using the Persona Definition File schema"
          />
          <div className="max-w-2xl mx-auto">
            <PersonaBuilder />
          </div>
        </div>
      </section>

      {/* Differentiation Portfolio */}
      <section className="py-16 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Differentiation Portfolio"
            subtitle="Every persona gets measurable proof of uniqueness"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              {
                title: "Side-by-Side Comparisons",
                desc: "See exactly how your persona differs from the base model on identical prompts",
              },
              {
                title: "Score Dashboard",
                desc: "Live metrics for voice consistency, value adherence, and knowledge integration",
              },
              {
                title: "Creative Works Catalog",
                desc: "Portfolio of persona-generated content demonstrating sustained alignment",
              },
              {
                title: "Public Certificate",
                desc: "Shareable differentiation certificate proving your persona is not a prompt wrapper",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-sutra-border bg-sutra-surface p-5"
              >
                <h4 className="text-sm font-semibold text-sutra-text">
                  {item.title}
                </h4>
                <p className="mt-2 text-xs text-sutra-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
