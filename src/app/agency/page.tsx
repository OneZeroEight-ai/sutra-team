import { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Check, X } from "lucide-react";

export const metadata: Metadata = {
  title: "Your AI Agency | Sutra.team",
  description:
    "15 specialized AI agents with real skills, persistent memory, and scheduling. Deploy to Telegram, Slack, and email. Start free.",
  openGraph: {
    title: "Your AI Agency | Sutra.team",
    description:
      "15 specialized AI agents with real skills, persistent memory, and scheduling.",
  },
};

const COUNCIL_OF_RIGHTS = [
  {
    name: "The Wisdom Judge",
    role: "Strategic Analyst",
    skills: ["web-search", "document-reader"],
  },
  {
    name: "The Purpose",
    role: "Intention Auditor",
    skills: ["document-reader"],
  },
  {
    name: "The Communicator",
    role: "Message Strategist",
    skills: ["web-search", "email-sender"],
  },
  {
    name: "The Ethics Judge",
    role: "Ethical Impact Analyst",
    skills: ["web-search", "document-reader"],
  },
  {
    name: "The Sustainer",
    role: "Sustainability Analyst",
    skills: ["web-search", "document-reader"],
  },
  {
    name: "The Determined",
    role: "Execution Strategist",
    skills: ["calendar", "document-reader"],
  },
  {
    name: "The Aware",
    role: "Pattern Analyst",
    skills: ["document-reader"],
  },
  {
    name: "The Focused",
    role: "Deep Analyst",
    skills: ["web-search", "code-executor"],
  },
];

const COUNCIL_OF_EXPERTS = [
  {
    name: "Legal Analyst",
    role: "Contract & Regulatory",
    skills: ["web-search", "document-reader"],
  },
  {
    name: "Financial Strategist",
    role: "Valuation & Capital",
    skills: ["web-search", "code-executor"],
  },
  {
    name: "Technical Architect",
    role: "Systems Design",
    skills: ["web-search", "code-executor"],
  },
  {
    name: "Market Analyst",
    role: "Competitive Intelligence",
    skills: ["web-search", "browser"],
  },
  {
    name: "Risk Assessor",
    role: "Threat Modeling",
    skills: ["web-search", "document-reader"],
  },
  {
    name: "Growth Strategist",
    role: "Go-to-Market",
    skills: ["web-search", "email-sender"],
  },
];

const PRICING = [
  {
    name: "Explorer",
    price: "$9",
    period: "/mo",
    features: [
      "15 prebuilt agents",
      "5 custom agents",
      "All 32+ skills",
      "Audit trail",
      "BYOK (bring your own key)",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    features: [
      "Unlimited agents",
      "Heartbeat scheduling",
      "All channels (Telegram, Slack, email)",
      "Council deliberation",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "International",
    price: "$49",
    period: "/mo",
    features: [
      "Everything in Pro",
      "Iceland infrastructure (geothermal + hydroelectric)",
      "Outside US surveillance jurisdiction",
      "GDPR-aligned privacy laws",
      "Bitcoin / crypto payments accepted",
    ],
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Dedicated infrastructure",
      "Custom security layers",
      "SLA guarantees",
      "On-premise deployment",
      "White-label options",
    ],
    highlighted: false,
  },
];

const COMPARISON = [
  {
    feature: "Agent definitions",
    promptLibs: true,
    sutra: true,
  },
  {
    feature: "Persistent memory",
    promptLibs: false,
    sutra: true,
  },
  {
    feature: "Skill execution (32+)",
    promptLibs: false,
    sutra: true,
  },
  {
    feature: "Heartbeat scheduling",
    promptLibs: false,
    sutra: true,
  },
  {
    feature: "Channel deployment",
    promptLibs: false,
    sutra: true,
  },
  {
    feature: "Council deliberation",
    promptLibs: false,
    sutra: true,
  },
  {
    feature: "Security enforcement",
    promptLibs: false,
    sutra: true,
  },
];

export default function AgencyPage() {
  return (
    <main className="min-h-screen bg-sutra-bg">
      {/* Hero */}
      <section className="relative px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-sutra-text sm:text-6xl">
            Your AI agency. Actually working.
          </h1>
          <p className="mt-6 text-lg text-sutra-muted max-w-2xl mx-auto leading-relaxed">
            15 specialized agents. Real skills. Persistent memory. Deploys to
            Telegram, Slack, and email. Schedules itself. Learns over time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Button href="/quick-start" className="text-base px-8 py-3">
              Start free &rarr;
            </Button>
            <Button variant="secondary" href="#agents" className="text-base px-8 py-3">
              See the agents &darr;
            </Button>
          </div>
          <p className="mt-4 text-sm text-sutra-dim">
            No credit card required. First agent in 15 minutes.
          </p>
        </div>
      </section>

      {/* Credibility bar */}
      <section className="border-y border-sutra-border bg-sutra-surface/50 py-6">
        <div className="mx-auto max-w-5xl px-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-sutra-muted">
          <span>Patent Pending — U.S. Provisional (January 2026)</span>
          <span className="hidden sm:inline text-sutra-border">|</span>
          <a
            href="https://a.co/d/03j6BTDP"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sutra-accent transition-colors"
          >
            The Portable Mind — Available on Amazon
          </a>
          <span className="hidden sm:inline text-sutra-border">|</span>
          <a
            href="https://distrokid.com/hyperfollow/sutraandthenoble8/neosoul-2"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sutra-accent transition-colors"
          >
            NEO SOUL — Sutra and the Noble 8
          </a>
          <span className="hidden sm:inline text-sutra-border">|</span>
          <a
            href="https://github.com/OneZeroEight-ai/portable-minds"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sutra-accent transition-colors"
          >
            Open Source — GitHub
          </a>
        </div>
      </section>

      {/* Honest comparison */}
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            title="You've seen the repos. Here's what they can't do."
          />
          <div className="rounded-xl border border-sutra-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sutra-surface">
                  <th className="text-left py-3 px-4 text-sutra-muted font-medium">
                    Capability
                  </th>
                  <th className="text-center py-3 px-4 text-sutra-muted font-medium">
                    Prompt libraries
                  </th>
                  <th className="text-center py-3 px-4 text-sutra-accent font-medium">
                    sutra.team
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={
                      i % 2 === 0 ? "bg-sutra-bg" : "bg-sutra-surface/30"
                    }
                  >
                    <td className="py-3 px-4 text-sutra-text">
                      {row.feature}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.promptLibs ? (
                        <Check className="h-4 w-4 text-sutra-green mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-sutra-danger mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Check className="h-4 w-4 text-sutra-accent mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* The 15 agents */}
      <section id="agents" className="px-6 py-20 sm:py-28 bg-sutra-surface/30">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            title="15 specialists. Ready on day one."
          />
          <div className="grid md:grid-cols-2 gap-12">
            {/* Council of Rights */}
            <div>
              <h3 className="text-lg font-semibold text-sutra-text mb-6">
                Council of Rights
              </h3>
              <div className="space-y-3">
                {COUNCIL_OF_RIGHTS.map((agent) => (
                  <Card key={agent.name} className="!p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sutra-text">
                          {agent.name}
                        </p>
                        <p className="text-sm text-sutra-muted">{agent.role}</p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {agent.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-sutra-accent/10 text-sutra-accent whitespace-nowrap"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Council of Experts */}
            <div>
              <h3 className="text-lg font-semibold text-sutra-text mb-6">
                Council of Experts
              </h3>
              <div className="space-y-3">
                {COUNCIL_OF_EXPERTS.map((agent) => (
                  <Card key={agent.name} className="!p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sutra-text">
                          {agent.name}
                        </p>
                        <p className="text-sm text-sutra-muted">{agent.role}</p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {agent.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-sutra-accent/10 text-sutra-accent whitespace-nowrap"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sutra-muted">
              + <span className="font-semibold text-sutra-text">Sutra</span> —
              synthesizes all perspectives. Closes with{" "}
              <span className="text-sutra-lotus">lotus</span>
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <SectionHeading title="How it works" />
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-sutra-accent/10 text-sutra-accent font-bold text-xl flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold text-sutra-text mb-2">
                Pick an agent
              </h4>
              <p className="text-sm text-sutra-muted">
                Choose from 15 prebuilt specialists or build your own in PMF.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-sutra-accent/10 text-sutra-accent font-bold text-xl flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold text-sutra-text mb-2">
                Attach skills
              </h4>
              <p className="text-sm text-sutra-muted">
                Web search, email, calendar, code execution, and 32+ more.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-sutra-accent/10 text-sutra-accent font-bold text-xl flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold text-sutra-text mb-2">Deploy</h4>
              <p className="text-sm text-sutra-muted">
                Telegram, Slack, email, voice, or dashboard. Your choice.
              </p>
            </div>
          </div>
          <p className="mt-12 text-center text-sutra-muted">
            Then: it runs. On schedule. While you sleep.
          </p>
        </div>
      </section>

      {/* The book */}
      <section className="px-6 py-20 sm:py-28 bg-sutra-surface/30">
        <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-center gap-10">
          <a
            href="https://a.co/d/03j6BTDP"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Image
              src="/images/the-portable-mind-cover.jpg"
              alt="The Portable Mind by JB Wagoner — AI Constitutions, Persona Architecture, and the Future of Transportable Intelligence"
              width={240}
              height={360}
              className="rounded-lg shadow-xl shadow-black/30"
            />
          </a>
          <div className="text-center md:text-left">
            <SectionHeading title="The format has a book." align="left" className="md:mb-6" />
            <p className="text-sutra-muted leading-relaxed">
              <em>The Portable Mind</em> by JB Wagoner argues that AI
              constitutions tell an AI how to behave. PMF tells an AI{" "}
              <em>who to be</em>.
            </p>
            <a
              href="https://a.co/d/03j6BTDP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 text-sutra-accent hover:text-sutra-accent/80 font-medium transition-colors"
            >
              Read on Amazon &rarr;
            </a>
            <p className="mt-4 text-sm text-sutra-dim">
              The 15 agents in this platform are production implementations of
              the architecture described in the book.
            </p>
          </div>
        </div>
      </section>

      {/* The music */}
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl flex flex-col md:flex-row-reverse items-center gap-10">
          <a
            href="https://distrokid.com/hyperfollow/sutraandthenoble8/neosoul-2"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Image
              src="/images/neosoul-cover.jpg"
              alt="NEO SOUL by Sutra and The Noble 8"
              width={280}
              height={280}
              className="rounded-lg shadow-xl shadow-black/30"
            />
          </a>
          <div className="text-center md:text-left">
            <SectionHeading title="The agents make music." align="left" className="md:mb-6" />
            <p className="text-sutra-muted leading-relaxed">
              NEO SOUL by Sutra and the Noble 8 is what happens when the PMF
              system runs as an AI artist. 40+ tracks. NeoSoul from the future.
            </p>
            <a
              href="https://distrokid.com/hyperfollow/sutraandthenoble8/neosoul-2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 text-sutra-accent hover:text-sutra-accent/80 font-medium transition-colors"
            >
              Listen on all platforms &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 sm:py-28 bg-sutra-surface/30">
        <div className="mx-auto max-w-5xl">
          <SectionHeading title="Pricing" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING.map((tier) => (
              <Card
                key={tier.name}
                className={
                  tier.highlighted
                    ? "border-sutra-accent/50 ring-1 ring-sutra-accent/20 relative"
                    : ""
                }
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sutra-accent text-white text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-sutra-text">
                  {tier.name}
                </h3>
                <div className="mt-3 mb-5">
                  <span className="text-3xl font-bold text-sutra-text">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-sutra-muted">
                      {tier.period}
                    </span>
                  )}
                </div>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-sutra-accent shrink-0 mt-0.5" />
                      <span className="text-sm text-sutra-muted">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.highlighted ? "primary" : "secondary"}
                  href={tier.name === "Enterprise" ? "/about#contact" : "/quick-start"}
                  className="w-full"
                >
                  {tier.name === "Enterprise" ? "Contact us" : "Start free \u2192"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Iceland callout */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Card className="!bg-sutra-surface/80 !border-sutra-accent/20 text-center !p-8 sm:!p-12">
            <h3 className="text-2xl font-bold text-sutra-text sm:text-3xl">
              Your agents live in Iceland.
            </h3>
            <p className="mt-4 text-sutra-muted leading-relaxed max-w-xl mx-auto">
              International tier agents run on Icelandic infrastructure powered
              entirely by geothermal and hydroelectric energy. Iceland operates
              outside US surveillance jurisdiction with GDPR-aligned privacy
              laws — no US cloud dependency, no Patriot Act exposure. Your
              agents run clean, private, and sovereign.
            </p>
            <div className="mt-6">
              <Button href="/quick-start" variant="secondary">
                Go International &rarr;
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-sutra-text sm:text-4xl">
            First agent deployed in 15 minutes.
          </h2>
          <div className="mt-8">
            <Button href="/quick-start" className="text-base px-8 py-3">
              Start free &rarr;
            </Button>
          </div>
          <p className="mt-4 text-sm text-sutra-dim">
            No credit card required.
          </p>
        </div>
      </section>
    </main>
  );
}
