import Link from "next/link";
import {
  Shield,
  Heart,
  Zap,
  Globe,
  Code,
  Key,
  Check,
  ArrowRight,
} from "lucide-react";
import {
  SECURITY_LAYERS,
  NEW_PRICING_TIERS,
} from "@/lib/constants";
import { AgentsShowcase } from "@/components/landing/AgentsShowcase";
import { TemplatesSection } from "@/components/landing/TemplatesSection";

const SKILLS_TAGS = [
  "web-search", "email-sender", "calendar", "browser", "code-executor",
  "slack", "discord", "file-manager", "zoom", "notion", "obsidian", "telegram",
];

const MOCK_PERSPECTIVES = [
  { name: "Wisdom Judge", text: "Open-sourcing builds trust and community, but assess what you're giving away vs. keeping proprietary." },
  { name: "Legal Analyst", text: "Patent protection covers the framework. SDK is safe to open-source under Apache 2.0 with a CLA." },
  { name: "Risk Assessor", text: "Low risk if core IP stays closed. Moderate competitive risk \u2014 mitigate with fast iteration." },
  { name: "Ethics Judge", text: "Open-sourcing security tooling aligns with industry responsibility." },
];

export default function HomePage() {
  return (
    <>
      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-28 pb-20 overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#4fd1c5 1px, transparent 1px), linear-gradient(90deg, #4fd1c5 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow */}
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(79,209,197,0.15)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

        <div className="relative max-w-[800px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-sutra-accent-glow border border-sutra-accent-dim/20 rounded-full px-4 py-1.5 mb-8 text-[13px] text-sutra-accent tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-sutra-accent animate-[pulse-dot_2s_infinite]" />
            Open Source &middot; OpenClaw Compatible &middot; Samm&#x0101; Suit Protected
          </div>

          <h1
            className="text-sutra-text leading-[1.1] mb-6"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(40px, 7vw, 72px)",
            }}
          >
            The first OS for
            <br />
            <span className="text-sutra-accent">Autonomous Agents</span>
          </h1>

          <p className="text-sutra-muted max-w-[600px] mx-auto mb-10 leading-relaxed" style={{ fontSize: "clamp(17px, 2.5vw, 21px)" }}>
            Create your own AI agency in minutes. 15 prebuilt agents. Open source.
            Easy enough for anyone. Powerful enough for Fortune 500.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/dashboard.html"
              className="bg-sutra-accent text-sutra-bg px-8 py-3.5 rounded-lg text-base font-semibold no-underline inline-flex items-center gap-2 shadow-[0_0_30px_rgba(79,209,197,0.15)] hover:shadow-[0_0_40px_rgba(79,209,197,0.25)] transition-shadow"
            >
              Start Building <ArrowRight size={18} />
            </Link>
            <a
              href="https://github.com/sutra-team"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent text-sutra-text px-8 py-3.5 rounded-lg text-base font-medium no-underline inline-flex items-center gap-2 border border-sutra-border hover:border-sutra-border-hover transition-colors"
            >
              <Code size={18} /> View Source
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-12 justify-center mt-14 flex-wrap">
            {[
              { val: "15", label: "PMF Agents" },
              { val: "12+", label: "Field Templates" },
              { val: "8", label: "Security Layers" },
              { val: "32+", label: "Skills" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[32px] font-bold text-sutra-accent font-mono">
                  {s.val}
                </div>
                <div className="text-[13px] text-sutra-muted mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ VALUE PROPS ══════════ */}
      <section className="py-20 px-6 max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-sutra-text mb-4"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 42px)",
            }}
          >
            Built for everyone
          </h2>
          <p className="text-sutra-muted text-[17px] max-w-[500px] mx-auto">
            From managing a household to launching an enterprise AI strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: <Heart size={22} />, color: "var(--sutra-warm)", title: "Easy", desc: "If you can describe what you need, you can build an agent. No code required. Visual dashboard. Templates for every field." },
            { icon: <Shield size={22} />, color: "var(--sutra-green)", title: "Secure", desc: "8 layers of Samm\u0101 Suit protection on every agent, every action, every message. Budget enforcement, audit trails, kill switches." },
            { icon: <Zap size={22} />, color: "var(--sutra-accent)", title: "Powerful", desc: "Multi-agent councils that deliberate in parallel. 15 specialists analyzing your question before Sutra synthesizes the answer." },
            { icon: <Globe size={22} />, color: "var(--sutra-purple)", title: "Affordable", desc: "BYOK (Bring Your Own Key) or use credits. Iceland servers: 100% renewable energy, 72% lower infrastructure costs. Savings passed to you." },
            { icon: <Code size={22} />, color: "var(--sutra-warm)", title: "Extendable", desc: "OpenClaw Skills Library compatible. Build custom skills. Connect any API. Every agent is a Portable Mind Format JSON \u2014 fork it, modify it, share it." },
            { icon: <Key size={22} />, color: "var(--sutra-danger)", title: "Your Choice", desc: "BYOK or credits. Claude, OpenAI, Google, DeepSeek, or local models. Your keys, your data, your agents. We never lock you in." },
          ].map((p) => (
            <div
              key={p.title}
              className="bg-sutra-surface border border-sutra-border rounded-xl p-7 transition-all hover:border-sutra-border-hover hover:-translate-y-0.5"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `color-mix(in srgb, ${p.color} 15%, transparent)`, color: p.color }}
              >
                {p.icon}
              </div>
              <h3 className="text-lg text-sutra-text mb-2.5 font-semibold">
                {p.title}
              </h3>
              <p className="text-sm text-sutra-muted leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ AGENTS SHOWCASE ══════════ */}
      <section id="agents" className="py-20 px-6 max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-sutra-text mb-4"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 42px)",
            }}
          >
            15 specialists. Day one.
          </h2>
          <p className="text-sutra-muted text-[17px] max-w-[560px] mx-auto">
            An ethics council grounded in the Noble Eightfold Path, domain
            experts for every business function, and Sutra &mdash; who confers
            with all of them.
          </p>
        </div>
        <AgentsShowcase />
      </section>

      {/* ══════════ TEMPLATES ══════════ */}
      <section className="py-20 px-6 max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-sutra-text mb-4"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 42px)",
            }}
          >
            Then build your own
          </h2>
          <p className="text-sutra-muted text-[17px] max-w-[560px] mx-auto">
            Portable Mind Format (PMF) templates for a dozen fields. Open
            source. Fork, customize, deploy.
          </p>
        </div>
        <TemplatesSection />
      </section>

      {/* ══════════ OPENCLAW COMPATIBILITY ══════════ */}
      <section className="py-16 px-6 max-w-[1200px] mx-auto">
        <div className="bg-sutra-surface border border-sutra-border rounded-2xl p-10 flex gap-10 items-center flex-wrap">
          <div className="flex-1 min-w-[340px]">
            <div className="text-xs text-sutra-accent tracking-[0.08em] uppercase mb-3 font-semibold">
              Ecosystem
            </div>
            <h3
              className="text-sutra-text mb-4"
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontWeight: 400,
                fontSize: 26,
              }}
            >
              OpenClaw Skills Compatible
            </h3>
            <p className="text-[15px] text-sutra-muted leading-relaxed mb-5">
              Every skill in the ClawHub library works on Sutra.team &mdash;
              browser control, email, calendar, file management, Slack, Discord,
              and hundreds more. Plus every skill goes through Samm&#x0101;
              Suit&apos;s SANGHA scanning before it touches your agents.
            </p>
            <div className="font-mono text-[13px] text-sutra-dim bg-sutra-bg p-3 rounded-md">
              <span className="text-sutra-accent">$</span> sutra skills install
              weather-lookup
              <br />
              <span className="text-sutra-green">
                &#x2713; Scanned by SANGHA &middot; Approved &middot; Installed
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-[200px] flex flex-wrap gap-2 justify-center">
            {SKILLS_TAGS.map((s) => (
              <span
                key={s}
                className="px-3 py-1.5 rounded-md bg-sutra-accent/10 border border-sutra-accent/20 text-xs text-sutra-accent"
              >
                {s}
              </span>
            ))}
            <span className="px-3 py-1.5 text-xs text-sutra-dim">
              + hundreds more
            </span>
          </div>
        </div>
      </section>

      {/* ══════════ SECURITY ══════════ */}
      <section id="security" className="py-20 px-6 max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-sutra-text mb-4"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 42px)",
            }}
          >
            8 layers of protection
          </h2>
          <p className="text-sutra-muted text-[17px] max-w-[600px] mx-auto">
            OpenClaw has 512 known vulnerabilities. Sutra.team has Samm&#x0101;
            Suit. Native platform gets all 8 layers. OpenClaw plugin gets 6.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {SECURITY_LAYERS.map((l) => (
            <div
              key={l.name}
              className="bg-sutra-surface border border-sutra-border rounded-xl p-5 transition-colors hover:border-sutra-border-hover"
            >
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <span className="font-mono text-[13px] text-sutra-accent font-semibold">
                    {l.name}
                  </span>
                  <span className="text-[13px] text-sutra-muted ml-2">
                    {l.label}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 mb-2.5">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    l.native
                      ? "bg-sutra-green/20 text-sutra-green"
                      : "bg-sutra-danger/15 text-sutra-danger"
                  }`}
                >
                  {l.native ? "\u2713" : "\u2717"} Native
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    l.plugin
                      ? "bg-sutra-green/20 text-sutra-green"
                      : "bg-sutra-warm/20 text-sutra-warm"
                  }`}
                >
                  {l.plugin ? "\u2713" : "\u2014"} Plugin
                </span>
              </div>
              <p className="text-[13px] text-sutra-muted leading-relaxed">
                {l.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-sutra-warm/[0.08] border border-sutra-warm/20 rounded-xl text-center">
          <p className="text-sm text-sutra-warm">
            <strong>Already using OpenClaw?</strong> Install the Samm&#x0101;
            Suit plugin for 6-layer protection.{" "}
            <a
              href="https://sammasuit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sutra-accent ml-2 underline"
            >
              sammasuit.com
            </a>
          </p>
        </div>
      </section>

      {/* ══════════ ICELAND ══════════ */}
      <section className="py-20 px-6 max-w-[1200px] mx-auto">
        <div className="bg-gradient-to-br from-sutra-surface to-[#0d1b2a] border border-sutra-border rounded-2xl p-12 flex gap-10 items-center flex-wrap">
          <div className="flex-1 min-w-[340px]">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-3xl">{"\uD83C\uDDEE\uD83C\uDDF8"}</span>
              <h3
                className="text-sutra-text"
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontWeight: 400,
                  fontSize: 24,
                }}
              >
                Powered by Iceland
              </h3>
            </div>
            <p className="text-[15px] text-sutra-muted leading-relaxed mb-5">
              Our infrastructure runs on 100% renewable geothermal and
              hydroelectric energy in Iceland &mdash; outside US surveillance
              jurisdiction, with the strongest privacy laws in Europe, and
              natural cooling that cuts costs by 72% compared to traditional US
              data centers. Those savings go directly to you.
            </p>
            <div className="flex gap-6 flex-wrap">
              {[
                { val: "100%", label: "Renewable energy" },
                { val: "72%", label: "Lower costs" },
                { val: "GDPR", label: "Aligned privacy" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-[22px] font-bold text-sutra-accent font-mono">
                    {s.val}
                  </div>
                  <div className="text-xs text-sutra-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[80px] opacity-15 select-none">{"\u2744\uFE0F"}</div>
        </div>
      </section>

      {/* ══════════ DELIBERATION DEMO ══════════ */}
      <section className="py-20 px-6 max-w-[900px] mx-auto">
        <div className="text-center mb-10">
          <h2
            className="text-sutra-text mb-4"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 36px)",
            }}
          >
            Ask once. Hear everything.
          </h2>
          <p className="text-sutra-muted text-base">
            Council deliberation is a skill your agents can invoke &mdash; or
            you can run it yourself from the dashboard.
          </p>
        </div>

        <div className="bg-sutra-surface border border-sutra-border rounded-xl overflow-hidden">
          {/* Query */}
          <div className="px-6 py-5 border-b border-sutra-border bg-sutra-accent/[0.05]">
            <div className="text-xs text-sutra-dim mb-1.5">YOU ASK</div>
            <div className="text-base text-sutra-text font-medium">
              &ldquo;Should we open-source our SDK?&rdquo;
            </div>
          </div>

          {/* Perspectives */}
          <div className="px-6 py-4 border-b border-sutra-border">
            <div className="text-[11px] text-sutra-dim mb-3 tracking-[0.06em] uppercase">
              Perspectives
            </div>
            {MOCK_PERSPECTIVES.map((p) => (
              <div key={p.name} className="flex gap-3 mb-3">
                <div className="w-7 h-7 rounded-full bg-sutra-accent-glow flex items-center justify-center text-[10px] text-sutra-accent font-bold shrink-0">
                  {p.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
                <div>
                  <span className="text-[13px] font-semibold text-sutra-text">
                    {p.name}
                  </span>
                  <p className="text-[13px] text-sutra-muted mt-1 leading-relaxed">
                    {p.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Synthesis */}
          <div className="px-6 py-5 bg-sutra-accent/[0.05]">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-lg">{"\uD83E\uDEB7"}</span>
              <span className="text-sm font-semibold text-sutra-accent">
                Sutra &mdash; Synthesis
              </span>
            </div>
            <p className="text-sm text-sutra-text leading-relaxed">
              <strong>Consensus:</strong> Open-source the SDK. Legal confirms
              patent protection. Ethics and Growth align on trust-building.
              <br />
              <strong className="text-sutra-warm">Tension:</strong> Risk
              Assessor flags competitive forking. Mitigation: fast iteration +
              community ownership.
              <br />
              <strong className="text-sutra-accent">Recommendation:</strong>{" "}
              Proceed with Apache 2.0 + CLA. Ship within 30 days.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ PRICING ══════════ */}
      <section id="pricing" className="py-20 px-6 max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-sutra-text mb-4"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 42px)",
            }}
          >
            Simple pricing
          </h2>
          <p className="text-sutra-muted text-[17px]">
            BYOK or credits. Start free, scale when ready.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {NEW_PRICING_TIERS.map((tier) => {
            const accentColor =
              tier.accent === "accent"
                ? "var(--sutra-accent)"
                : tier.accent === "warm"
                  ? "var(--sutra-warm)"
                  : tier.accent === "purple"
                    ? "var(--sutra-purple)"
                    : "var(--sutra-green)";

            return (
              <div
                key={tier.name}
                className={`bg-sutra-surface rounded-xl p-8 relative ${
                  tier.popular
                    ? "border border-sutra-accent-dim"
                    : "border border-sutra-border"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-2.5 right-4 bg-sutra-accent text-sutra-bg px-3 py-1 rounded text-[11px] font-bold">
                    POPULAR
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-sutra-text">
                    {tier.name}
                  </span>
                  {tier.flag && <span className="text-base">{tier.flag}</span>}
                </div>
                <div className="mt-3 mb-1 font-mono">
                  <span className="text-4xl font-bold text-sutra-text">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-base text-sutra-muted font-normal">
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-sutra-muted mb-6">
                  {tier.description}
                </p>
                {tier.features.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 py-1.5 text-[13px] text-sutra-muted"
                  >
                    <Check size={14} style={{ color: accentColor }} /> {f}
                  </div>
                ))}
                <Link
                  href={tier.cta.href}
                  className={`block text-center py-3 rounded-lg text-sm font-semibold mt-6 no-underline transition-colors ${
                    tier.popular
                      ? "bg-sutra-accent text-sutra-bg hover:bg-sutra-accent-dim"
                      : "border border-sutra-border text-sutra-text hover:border-sutra-border-hover"
                  }`}
                  style={
                    !tier.popular && tier.accent === "warm"
                      ? { borderColor: "var(--sutra-warm)", color: "var(--sutra-warm)" }
                      : undefined
                  }
                >
                  {tier.cta.label}
                </Link>
                {tier.paymentMethods && (
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-sutra-dim">
                    {tier.paymentMethods.join(" \u00B7 ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute bottom-[-30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(79,209,197,0.15)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
        <div className="relative max-w-[600px] mx-auto">
          <h2
            className="text-sutra-text mb-4"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(28px, 4vw, 40px)",
            }}
          >
            Your agency is waiting
          </h2>
          <p className="text-sutra-muted text-[17px] mb-8 leading-relaxed">
            15 specialists. 32+ skills. 8 security layers. Open source. Start
            in minutes.
          </p>
          <Link
            href="/dashboard.html"
            className="bg-sutra-accent text-sutra-bg px-10 py-4 rounded-lg text-[17px] font-semibold no-underline inline-flex items-center gap-2 shadow-[0_0_40px_rgba(79,209,197,0.15)] hover:shadow-[0_0_50px_rgba(79,209,197,0.25)] transition-shadow"
          >
            Launch Dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
