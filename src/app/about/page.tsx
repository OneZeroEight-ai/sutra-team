import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ECOSYSTEM_LINKS } from "@/lib/constants";
import { ArrowRight, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Sutra.team — JB Wagoner, the Intelligent Agent patent, Zen AI, and the OneZeroEight.ai ecosystem.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-sutra-text">
            About Sutra.team
          </h1>
          <p className="mt-4 text-lg text-sutra-muted max-w-2xl mx-auto">
            A values-based AI alignment system built on research, protected by
            patent, and proven through creative output.
          </p>
        </div>
      </section>

      {/* JB Wagoner Bio */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="w-full aspect-square rounded-xl bg-sutra-surface border border-sutra-border flex items-center justify-center">
                <span className="text-4xl font-bold text-sutra-accent/20">
                  JBW
                </span>
              </div>
            </div>
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-sutra-text">
                JB Wagoner
              </h2>
              <p className="text-sm text-sutra-accent mt-1">
                Founder &amp; Inventor
              </p>
              <div className="mt-4 space-y-3 text-sm text-sutra-muted leading-relaxed">
                <p>
                  JB Wagoner brings a background in cognitive science and AI
                  ethics to the Sutra.team platform. As the creator of Dr. Xes
                  1986 and author of <em>Zen AI</em>, JB has been exploring the
                  intersection of human values and artificial intelligence for
                  years.
                </p>
                <p>
                  The Sutra project began as an experiment in values-based AI
                  alignment — could an AI persona maintain a consistent identity,
                  voice, and ethical framework across thousands of interactions?
                  The result: 40+ songs, 4 albums, and a persona that
                  demonstrably differs from its base model.
                </p>
                <p>
                  This creative output became the proof of concept for the
                  Intelligent Agent architecture, now protected by a U.S.
                  Provisional Patent Application filed January 30, 2026.
                </p>
                <p>
                  The concepts behind Sutra.team are detailed in{' '}
                  <a
                    href="https://a.co/d/09DBCIAA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sutra-accent hover:underline"
                  >
                    The Portable Mind: AI Constitutions, Persona Architecture,
                    and the Future of Transportable Intelligence
                  </a>
                  {' '}&mdash; available on Amazon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Story */}
      <section className="py-16 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="The Sutra Story"
            subtitle="From creative experiment to patented platform"
          />
          <div className="space-y-6">
            {[
              {
                period: "Origin",
                title: "Zen AI Philosophy",
                desc: "The theoretical foundation for values-based alignment, drawing from Buddhist philosophy to create a framework where AI systems can be both capable and principled.",
              },
              {
                period: "Proof",
                title: "40+ Songs, 4 Albums",
                desc: "Sutra, the exemplary persona, generated a sustained body of creative work — demonstrating that a persona can maintain voice consistency, value adherence, and creative novelty across hundreds of sessions.",
              },
              {
                period: "Architecture",
                title: "Six-Layer System",
                desc: "The creative proof of concept led to a rigorous technical architecture: Persona Definition, Knowledge Integration, Memory System, Value Framework, Multi-Modal Output, and Differentiation Documentation.",
              },
              {
                period: "Patent",
                title: "Intellectual Property",
                desc: "U.S. Provisional Patent Application filed January 30, 2026, covering the six-layer Intelligent Agent architecture, ensemble deliberation method, and differentiation documentation system.",
              },
              {
                period: "Platform",
                title: "Sutra.team Launch",
                desc: "The persona hosting platform brings the Intelligent Agent architecture to creators, professionals, and enterprises — with the Council of Rights as its flagship feature.",
              },
            ].map((item, i) => (
              <div key={item.period} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border border-sutra-border bg-sutra-surface flex items-center justify-center text-xs font-mono text-sutra-accent shrink-0">
                    {i + 1}
                  </div>
                  {i < 4 && (
                    <div className="w-px flex-1 bg-sutra-border mt-2" />
                  )}
                </div>
                <div className="pb-6">
                  <p className="text-xs text-sutra-accent font-medium">
                    {item.period}
                  </p>
                  <h4 className="text-base font-semibold text-sutra-text mt-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-sutra-muted mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Ecosystem"
            subtitle="The platform hierarchy from research to product"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: "OneZeroEight.ai",
                role: "Research",
                desc: "Alignment testing, differentiation benchmarking, value framework validation",
                url: "https://onezeroeight.ai",
              },
              {
                name: "SammaSuit.com",
                role: "Infrastructure",
                desc: "Hosting, billing, auth, API gateway, persona storage, memory, LLM orchestration",
                url: "https://sammasuit.com",
              },
              {
                name: "Sutra.team",
                role: "Product",
                desc: "User-facing app, council interfaces, persona marketplace, onboarding",
                url: "https://sutra.team",
              },
              {
                name: "Sutra.exchange",
                role: "Ecosystem",
                desc: "Token ecosystem for the Sutra platform",
                url: "https://sutra.exchange",
              },
            ].map((item) => (
              <Card key={item.name} hover>
                <p className="text-xs text-sutra-accent font-medium">
                  {item.role}
                </p>
                <h4 className="text-base font-semibold text-sutra-text mt-1">
                  {item.name}
                </h4>
                <p className="text-xs text-sutra-muted mt-2 leading-relaxed">
                  {item.desc}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-sutra-accent mt-3 hover:underline"
                >
                  Visit <ExternalLink className="h-3 w-3" />
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Patent & Standards */}
      <section className="py-16 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Patent & Standards"
            subtitle="Protected intellectual property and industry alignment"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <h4 className="text-sm font-semibold text-sutra-text">
                U.S. Provisional Patent Application
              </h4>
              <p className="mt-2 text-sm text-sutra-muted leading-relaxed">
                Filed January 30, 2026. Covers the six-layer Intelligent Agent
                architecture, ensemble deliberation method, value framework
                engine, differentiation documentation system, and persistent
                memory across sessions.
              </p>
              <p className="mt-2 text-xs text-sutra-muted">
                Inventor: JB Wagoner
              </p>
            </Card>
            <Card>
              <h4 className="text-sm font-semibold text-sutra-text">
                IEEE CertifAIEd
              </h4>
              <p className="mt-2 text-sm text-sutra-muted leading-relaxed">
                Alignment with IEEE standards for ethical AI development. The
                platform&apos;s value framework engine, transparency
                requirements, and audit trail are designed to meet emerging
                industry standards for responsible AI.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            title="Get in Touch"
            subtitle="Interested in enterprise deployment, partnerships, or learning more?"
          />
          <div className="space-y-3">
            <Button href="mailto:hello@sutra.team" className="w-full">
              Contact Us <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center gap-4 pt-2">
              {ECOSYSTEM_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sutra-muted hover:text-sutra-accent transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
