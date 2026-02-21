import Image from "next/image";
import Link from "next/link";
import { Shield } from "lucide-react";
import { RIGHTS_AGENTS, EXPERT_AGENTS, AGENT_AVATARS } from "@/lib/constants";

const RIGHTS_ROSTER = [
  { key: "wisdom-judge", short: "Wisdom Judge", initials: "WJ", color: "#a78bfa" },
  { key: "purpose", short: "Purpose", initials: "P", color: "#818cf8" },
  { key: "communicator", short: "Communicator", initials: "C", color: "#6366f1" },
  { key: "ethics-judge", short: "Ethics Judge", initials: "EJ", color: "#f59e0b" },
  { key: "sustainer", short: "Sustainer", initials: "S", color: "#10b981" },
  { key: "determined", short: "Determined", initials: "D", color: "#ef4444" },
  { key: "aware", short: "Aware", initials: "A", color: "#ec4899" },
  { key: "focused", short: "Focused", initials: "F", color: "#06b6d4" },
];

const EXPERTS_ROSTER = [
  { key: "legal-analyst", short: "Legal Analyst", initials: "LA", color: "#6366f1", designation: "Contract Law, IP, Compliance" },
  { key: "financial-strategist", short: "Financial Strategist", initials: "FS", color: "#10b981", designation: "Valuation, Fundraising, Unit Economics" },
  { key: "technical-architect", short: "Tech Architect", initials: "TA", color: "#06b6d4", designation: "System Design, Architecture, Security" },
  { key: "market-analyst", short: "Market Analyst", initials: "MA", color: "#f59e0b", designation: "Industry Analysis, Competitive Intel" },
  { key: "risk-assessor", short: "Risk Assessor", initials: "RA", color: "#ef4444", designation: "Risk Frameworks, Probability Modeling" },
  { key: "growth-strategist", short: "Growth Strategist", initials: "GS", color: "#ec4899", designation: "GTM, Growth Loops, Scaling" },
];

const CUSTOM_AGENTS = [
  {
    name: "Content Writer",
    desc: "Writes blog posts, confers with Market Analyst for positioning",
    confers: ["Market Analyst", "Growth Strategist"],
    skills: ["web-search", "email-sender"],
  },
  {
    name: "Deal Analyst",
    desc: "Reviews contracts, confers with Legal Analyst and Risk Assessor",
    confers: ["Legal Analyst", "Risk Assessor"],
    skills: ["document-reader", "web-search"],
  },
  {
    name: "Ops Bot",
    desc: "Schedules meetings, sends emails, tracks costs",
    confers: ["Financial Strategist"],
    skills: ["email-sender", "zoom-scheduler", "web-search"],
  },
  {
    name: "Security Auditor",
    desc: "Scans code, monitors threats, reports to the council",
    confers: ["Tech Architect", "Risk Assessor"],
    skills: ["code-executor", "web-search"],
  },
];

const MOCK_PERSPECTIVES = [
  { agent: "Wisdom Judge", color: "#a78bfa", text: "Open-sourcing builds trust and community, but we need to assess what we're giving away versus what we keep proprietary." },
  { agent: "Legal Analyst", color: "#6366f1", text: "Patent protection covers the framework. SDK is safe to open-source under Apache 2.0 with a CLA." },
  { agent: "Risk Assessor", color: "#ef4444", text: "Low risk if core IP stays closed. Moderate competitive risk — competitors could fork. Mitigate with strong community and fast iteration." },
  { agent: "Ethics Judge", color: "#f59e0b", text: "Open-sourcing security tooling aligns with industry responsibility. Keeping it proprietary when it governs AI safety is harder to justify." },
  { agent: "Growth Strategist", color: "#ec4899", text: "Open-source SDKs drive 3-5x faster adoption. Developer trust is the moat, not the code." },
];

export default function HomePage() {
  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(124,58,237,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-10 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-2 border-[#7C3AED]/30 shadow-2xl shadow-[#7C3AED]/20">
            <Image
              src="/images/oracle.gif"
              alt="Sutra"
              width={192}
              height={192}
              className="w-full h-full object-cover"
              priority
              unoptimized
            />
          </div>

          <h1 className="font-[family-name:var(--font-outfit)] text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-sutra-text leading-none">
            SUTRA
          </h1>

          <p className="mt-6 font-[family-name:var(--font-outfit)] text-xl sm:text-2xl font-light text-sutra-muted tracking-wide">
            Where strategy meets principle.
          </p>

          <p className="mt-4 text-base sm:text-lg text-sutra-muted/80 max-w-lg mx-auto leading-relaxed">
            Start with a team of 15 AI specialists.
            <br />
            Add your own agents to do what you want.
          </p>

          <div className="mt-10">
            <Link
              href="/dashboard.html"
              className="inline-flex items-center justify-center rounded-lg px-8 py-3.5 text-base font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-lg shadow-[#7C3AED]/25 transition-all duration-200"
            >
              Meet Your Team
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ YOUR TEAM ═══════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-sutra-text text-center leading-tight">
            15 specialists. Day one.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-sutra-muted text-center max-w-2xl mx-auto leading-relaxed">
            An ethics council, domain experts, and an analyst who synthesizes
            every perspective before answering.
          </p>

          {/* Row 1: Council of Rights */}
          <div className="mt-16">
            <p className="text-xs font-mono uppercase tracking-[3px] text-[#7C3AED]/70 mb-6 text-center">
              Council of Rights
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 sm:gap-6">
              {RIGHTS_ROSTER.map((agent) => {
                const data = RIGHTS_AGENTS.find((r) => r.name === `The ${agent.short}`);
                return (
                  <div key={agent.key} className="text-center group">
                    <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 transition-transform duration-200 group-hover:scale-110"
                      style={{ borderColor: `${agent.color}50` }}>
                      <Image
                        src={AGENT_AVATARS[agent.key]}
                        alt={agent.short}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="mt-2 text-[11px] sm:text-xs font-medium text-sutra-text/80">
                      {agent.short}
                    </p>
                    <p className="text-[10px] text-sutra-muted/60 leading-tight hidden group-hover:block">
                      {data?.path_aspect}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 2: Domain Experts */}
          <div className="mt-12">
            <p className="text-xs font-mono uppercase tracking-[3px] text-[#7C3AED]/70 mb-6 text-center">
              Domain Experts
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6">
              {EXPERTS_ROSTER.map((expert) => (
                <div key={expert.key} className="text-center group">
                  <div
                    className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: `${expert.color}20`, color: expert.color, border: `2px solid ${expert.color}40` }}
                  >
                    {expert.initials}
                  </div>
                  <p className="mt-2 text-[11px] sm:text-xs font-medium text-sutra-text/80">
                    {expert.short}
                  </p>
                  <p className="text-[10px] text-sutra-muted/60 leading-tight hidden group-hover:block">
                    {expert.designation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Synthesis — Sutra */}
          <div className="mt-12 text-center">
            <p className="text-xs font-mono uppercase tracking-[3px] text-[#f59e0b]/70 mb-6">
              Synthesis
            </p>
            <div className="inline-block group">
              <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#f59e0b]/40 shadow-lg shadow-[#f59e0b]/20 transition-transform duration-200 group-hover:scale-110">
                <Image
                  src="/images/agents/sutra.png"
                  alt="Sutra"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-[#f59e0b]">Sutra</p>
              <p className="text-xs text-sutra-muted/70">
                Ethics analyst. Confers with all 15 before answering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ BUILD YOUR OWN ═══════════ */}
      <section className="py-24 sm:py-32 border-t border-sutra-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-sutra-text text-center leading-tight">
            Then add your own.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-sutra-muted text-center max-w-xl mx-auto leading-relaxed">
            Create agents that take action. Connect skills.
            Confer with your team. Deploy anywhere.
          </p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CUSTOM_AGENTS.map((agent) => (
              <div
                key={agent.name}
                className="rounded-xl border border-sutra-border bg-sutra-surface/50 p-6 hover:border-[#7C3AED]/30 transition-colors"
              >
                <h3 className="text-base font-semibold text-sutra-text">
                  {agent.name}
                </h3>
                <p className="mt-1 text-sm text-sutra-muted leading-relaxed">
                  {agent.desc}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {agent.confers.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#7C3AED]/10 text-[#a78bfa] border border-[#7C3AED]/20"
                    >
                      confers: {c}
                    </span>
                  ))}
                  {agent.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-sutra-muted/60 text-center max-w-lg mx-auto leading-relaxed">
            Every agent is governed by 8 security layers. Budget limits.
            Audit trails. Kill switches. Cryptographic identity.
          </p>

          <div className="mt-8 text-center">
            <Link
              href="/dashboard.html"
              className="inline-flex items-center justify-center rounded-lg px-7 py-3 text-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-lg shadow-[#7C3AED]/25 transition-all duration-200"
            >
              Create Your First Agent
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ DELIBERATION DEMO ═══════════ */}
      <section className="py-24 sm:py-32 border-t border-sutra-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-sutra-text text-center leading-tight">
            Ask once. Hear everything.
          </h2>

          <div className="mt-14 space-y-3">
            {/* User question */}
            <div className="rounded-xl border border-sutra-border bg-sutra-surface p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-sutra-muted/60 mb-2">
                You ask
              </p>
              <p className="text-base text-sutra-text font-medium">
                &ldquo;Should we open-source our SDK?&rdquo;
              </p>
            </div>

            {/* Perspectives */}
            <div className="grid grid-cols-1 gap-2">
              {MOCK_PERSPECTIVES.map((p) => (
                <div
                  key={p.agent}
                  className="rounded-lg border border-sutra-border/60 bg-sutra-bg p-4 flex gap-3"
                >
                  <div
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: `${p.color}15`, color: p.color, border: `1px solid ${p.color}30` }}
                  >
                    {p.agent.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: p.color }}>
                      {p.agent}
                    </p>
                    <p className="mt-0.5 text-sm text-sutra-muted leading-relaxed">
                      {p.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Synthesis */}
            <div className="rounded-xl border-2 border-[#f59e0b]/30 bg-[#f59e0b]/[0.03] p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src="/images/agents/sutra.png"
                    alt="Sutra"
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-semibold text-[#f59e0b]">
                  Sutra &mdash; Synthesis
                </p>
              </div>
              <p className="text-sm text-sutra-text leading-relaxed">
                <strong>Consensus:</strong> Open-source the SDK. Legal confirms patent protection
                covers the core framework. Ethics and Growth align on trust-building.
              </p>
              <p className="mt-2 text-sm text-sutra-text leading-relaxed">
                <strong>Tension:</strong> Risk Assessor flags competitive forking.
                Mitigation: fast iteration cadence + strong community ownership.
              </p>
              <p className="mt-2 text-sm text-sutra-text leading-relaxed">
                <strong>Recommendation:</strong> Proceed with Apache 2.0 + CLA.
                Ship within 30 days to capture developer mindshare.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CAPABILITIES ═══════════ */}
      <section className="py-16 border-t border-sutra-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-sutra-muted">
            {[
              "Voice Sessions",
              "Text Chat",
              "32 Skills",
              "8 Security Layers",
              "Audit Trail",
              "Budget Control",
            ].map((cap) => (
              <span key={cap} className="whitespace-nowrap">
                {cap}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-24 sm:py-32 border-t border-sutra-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              "&ldquo;It&rsquo;s like OpenClaw with teeth.&rdquo;",
              "&ldquo;Asked one question. Got 15 perspectives. Knew exactly what to do.&rdquo;",
              "&ldquo;Our CISO asked how we govern our AI agents. I showed him the audit trail. Meeting over.&rdquo;",
            ].map((quote, i) => (
              <div
                key={i}
                className="rounded-xl border border-sutra-border bg-sutra-surface/30 p-6"
              >
                <p
                  className="text-sm text-sutra-muted leading-relaxed italic"
                  dangerouslySetInnerHTML={{ __html: quote }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section className="py-24 sm:py-32 border-t border-sutra-border" id="pricing">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl font-extrabold text-sutra-text">
            Simple pricing.
          </h2>
          <p className="mt-3 text-base text-sutra-muted">
            Start with the full team. Scale when you need to.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Explorer */}
            <div className="rounded-xl border border-sutra-border bg-sutra-surface p-8 text-left">
              <p className="text-xs font-mono uppercase tracking-wider text-sutra-muted mb-1">
                Explorer
              </p>
              <p className="font-[family-name:var(--font-outfit)] text-4xl font-extrabold text-sutra-text">
                $9<span className="text-base font-normal text-sutra-muted">/mo</span>
              </p>
              <p className="mt-3 text-sm text-sutra-muted leading-relaxed">
                Start with 15 specialists. Create up to 5 custom agents.
              </p>
              <ul className="mt-5 space-y-2">
                {[
                  "15 pre-built specialists",
                  "5 custom agents",
                  "Dashboard chat",
                  "All 32 skills",
                  "Audit trail",
                ].map((f) => (
                  <li key={f} className="text-sm text-sutra-muted/80 flex items-start gap-2">
                    <span className="text-[#7C3AED] mt-0.5 text-xs">&#x2192;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  href="/dashboard.html"
                  className="block text-center rounded-lg px-5 py-2.5 text-sm font-medium border border-sutra-border text-sutra-text hover:bg-sutra-surface hover:border-sutra-muted transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="rounded-xl border-2 border-[#7C3AED]/40 bg-sutra-surface p-8 text-left shadow-lg shadow-[#7C3AED]/10">
              <p className="text-xs font-mono uppercase tracking-wider text-[#7C3AED] mb-1">
                Pro
              </p>
              <p className="font-[family-name:var(--font-outfit)] text-4xl font-extrabold text-sutra-text">
                $29<span className="text-base font-normal text-sutra-muted">/mo</span>
              </p>
              <p className="mt-3 text-sm text-sutra-muted leading-relaxed">
                Unlimited agents. Voice sessions. Full skill access.
              </p>
              <ul className="mt-5 space-y-2">
                {[
                  "Everything in Explorer",
                  "Unlimited agents",
                  "Voice sessions",
                  "All channels (Telegram, Slack, Email)",
                  "Heartbeat scheduling",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="text-sm text-sutra-muted/80 flex items-start gap-2">
                    <span className="text-[#7C3AED] mt-0.5 text-xs">&#x2192;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  href="/dashboard.html"
                  className="block text-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-lg shadow-[#7C3AED]/25 transition-all"
                >
                  Go Pro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-sutra-text leading-tight">
            Your team is waiting.
          </h2>
          <p className="mt-4 text-base text-sutra-muted">
            15 specialists. Ready to deliberate. Ready to act.
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard.html"
              className="inline-flex items-center justify-center rounded-lg px-8 py-3.5 text-base font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-lg shadow-[#7C3AED]/25 transition-all duration-200"
            >
              Meet Your Team
            </Link>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-xs text-sutra-muted/60">
            <Shield className="h-3.5 w-3.5 text-[#7C3AED]/60" />
            Protected by{" "}
            <a
              href="https://sammasuit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sutra-muted/80 hover:text-sutra-text transition-colors"
            >
              Samm&#x0101; Suit
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
