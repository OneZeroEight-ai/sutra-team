import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Image from "next/image";
import { ArrowRight, Shield } from "lucide-react";
import { RIGHTS_AGENTS, AGENT_AVATARS } from "@/lib/constants";

const AGENT_CARDS = [
  {
    icon: "\u{1F4CB}",
    title: "Research Analyst",
    desc: "Monitors your industry, summarizes trends, flags opportunities.",
    bullets: [
      "Track competitor announcements",
      "Summarize weekly news",
      "Alert on regulatory changes",
    ],
  },
  {
    icon: "\u{1F4E7}",
    title: "Email Manager",
    desc: "Reads, triages, drafts, and responds to your email.",
    bullets: [
      "Triage inbox by priority",
      "Draft responses for review",
      "Forward important items with summary",
    ],
  },
  {
    icon: "\u{1F4C8}",
    title: "Growth Strategist",
    desc: "Drafts content, monitors engagement, tracks your brand.",
    bullets: [
      "Write social posts for 4 platforms",
      "Monitor Reddit and HN for mentions",
      "Weekly engagement report",
    ],
  },
  {
    icon: "\u{2696}\u{FE0F}",
    title: "Legal Reviewer",
    desc: "Reviews contracts, flags risks, tracks compliance.",
    bullets: [
      "Highlight risky clauses",
      "Compare against standard terms",
      "Track renewal dates",
    ],
  },
  {
    icon: "\u{1F4B0}",
    title: "Financial Watchdog",
    desc: "Monitors spending, tracks budgets, alerts on anomalies.",
    bullets: [
      "Daily spend summary",
      "Flag unusual charges",
      "Monthly budget report",
    ],
  },
  {
    icon: "\u{1F6E0}\u{FE0F}",
    title: "Build Your Own",
    desc: "Start from scratch. Define the role. Write the prompt. Pick the model. Assign the skills.",
    bullets: [
      "Your system prompt",
      "Your skill selection",
      "Your channel configuration",
    ],
  },
];

const CHANNELS = [
  {
    icon: "\u{1F4AC}",
    title: "Dashboard",
    desc: "Web-based chat with full agent management",
  },
  {
    icon: "\u{2708}\u{FE0F}",
    title: "Telegram",
    desc: "Message your agents from your phone",
  },
  {
    icon: "\u{1F4BC}",
    title: "Slack",
    desc: "Integrate agents into your workspace",
  },
  {
    icon: "\u{1F4E7}",
    title: "Email",
    desc: "Agents read, reply, and forward \u2014 governed",
  },
  {
    icon: "\u{1F493}",
    title: "Heartbeat",
    desc: "Agents work while you sleep. Budget-capped.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Create an agent",
    desc: "Name it. Give it a role. Write its system prompt. Choose its model \u2014 Claude, GPT, or Gemini.",
  },
  {
    num: "02",
    title: "Give it skills and channels",
    desc: "Select from 30+ governed skills. Connect Telegram, Slack, or email. Set a budget ceiling.",
  },
  {
    num: "03",
    title: "Let it work",
    desc: "Chat with it. Set a heartbeat schedule. Watch the audit trail. Kill it if anything goes wrong.",
  },
];

const SECURITY_LAYERS = [
  "SUTRA",
  "DHARMA",
  "SANGHA",
  "KARMA",
  "BODHI",
  "METTA",
  "SILA",
  "NIRVANA",
];

const COUNCIL_AGENTS = [
  { key: "wisdom-judge", name: "The Wisdom Judge", role: "Strategic analysis, evidence evaluation" },
  { key: "purpose", name: "The Purpose", role: "Motivation clarity, values-action alignment" },
  { key: "communicator", name: "The Communicator", role: "Message evaluation, communication design" },
  { key: "ethics-judge", name: "The Ethics Judge", role: "Ethical impact, consequence modeling" },
  { key: "sustainer", name: "The Sustainer", role: "Sustainability, value creation assessment" },
  { key: "determined", name: "The Determined", role: "Energy allocation, priority management" },
  { key: "aware", name: "The Aware", role: "Pattern surfacing, blind spot detection" },
  { key: "focused", name: "The Focused", role: "Deep analysis, single-problem immersion" },
];

const PUBLISHED_LINKS = [
  { label: "Medium", href: "https://medium.com/@jbwagoner" },
  { label: "Dev.to", href: "https://dev.to/jbwagoner" },
  { label: "GitHub", href: "https://github.com/OneZeroEight-ai" },
];

export default function HomePage() {
  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-sutra-text leading-[1.05]">
            Your AI{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#00D4FF]">
              Agency
            </span>
            .
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-sutra-muted max-w-xl mx-auto leading-relaxed">
            Build agents. Assign roles. Command them anywhere.
            <br className="hidden sm:block" />
            Every action governed, audited, signed.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/sign-up" className="text-base px-7 py-3">
              Create Your First Agent <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="secondary" href="#how-it-works" className="text-base px-7 py-3">
              See How It Works
            </Button>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 text-sm text-sutra-muted">
            <Shield className="h-4 w-4 text-[#7C3AED]" />
            Protected by{" "}
            <a
              href="https://sammasuit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sutra-accent hover:text-sutra-text transition-colors"
            >
              Samm&#x0101; Suit
            </a>{" "}
            &mdash; 8 security layers on every interaction
          </div>

          <div className="mt-12 mx-auto max-w-xl">
            <Image
              src="/images/council-meditation.png"
              alt="AI agents in council"
              width={600}
              height={400}
              className="w-full h-auto rounded-2xl shadow-2xl shadow-[#7C3AED]/20 border border-sutra-border"
              priority
            />
          </div>
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF ═══════════ */}
      <section className="py-20 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-mono uppercase tracking-[3px] text-[#7C3AED] mb-12">
            Built for production. Running in production.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { num: "30+", label: "Governed agents in production" },
              { num: "5", label: "Channel adapters live" },
              { num: "30", label: "First-party skills" },
              { num: "8", label: "Security layers enforced" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-sutra-text">
                  {stat.num}
                </div>
                <div className="mt-2 text-sm text-sutra-muted">{stat.label}</div>
              </div>
            ))}
          </div>

          <blockquote className="max-w-3xl mx-auto border-l-2 border-[#7C3AED] pl-6 sm:pl-8">
            <p className="text-base sm:text-lg text-sutra-muted leading-relaxed italic">
              &ldquo;We don&rsquo;t just sell agent governance &mdash; we run our entire
              operation on it. Our DevRel agent drafts content, monitors forums,
              and sends reports on an 8-hour heartbeat cycle. Every action
              budget-capped, audited, and cryptographically signed.&rdquo;
            </p>
            <footer className="mt-4 text-sm text-sutra-text font-medium">
              &mdash; JB Wagoner, Founder
            </footer>
          </blockquote>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-sutra-muted">
            {PUBLISHED_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sutra-text transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHAT YOU CAN BUILD ═══════════ */}
      <section className="py-20 border-t border-sutra-border" id="agents">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-mono uppercase tracking-[3px] text-[#7C3AED] mb-4 text-center">
            What you can build
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sutra-text text-center">
            5 ready-made agents. Yours to customize.
          </h2>
          <p className="mt-4 text-lg text-sutra-muted max-w-2xl mx-auto text-center mb-12">
            Each comes with a tuned system prompt, relevant skills, and sensible
            defaults. Use them as-is or make them your own.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AGENT_CARDS.map((agent) => (
              <Card key={agent.title} hover>
                <div className="text-3xl mb-3">{agent.icon}</div>
                <h3 className="text-lg font-bold text-sutra-text">
                  {agent.title}
                </h3>
                <p className="mt-1 text-sm text-sutra-muted">{agent.desc}</p>
                <ul className="mt-4 space-y-1">
                  {agent.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-xs text-sutra-muted/70 flex items-center gap-2"
                    >
                      <span className="text-[#7C3AED] text-[10px]">&rarr;</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <a
                  href="/sign-up"
                  className="mt-4 inline-flex items-center gap-1 text-xs text-[#7C3AED] hover:text-[#8B5CF6] transition-colors font-medium"
                >
                  Customize <span>&rarr;</span>
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CHANNELS ═══════════ */}
      <section className="py-20 border-t border-sutra-border bg-sutra-surface/30" id="channels">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-mono uppercase tracking-[3px] text-[#7C3AED] mb-4 text-center">
            Channels
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sutra-text text-center">
            Command them anywhere.
          </h2>
          <p className="mt-4 text-lg text-sutra-muted max-w-2xl mx-auto text-center mb-12">
            One agent. Every channel. Same governance.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {CHANNELS.map((ch) => (
              <Card key={ch.title} hover className="text-center">
                <div className="text-3xl mb-2">{ch.icon}</div>
                <h4 className="text-sm font-bold text-sutra-text">{ch.title}</h4>
                <p className="mt-1 text-xs text-sutra-muted leading-relaxed">
                  {ch.desc}
                </p>
              </Card>
            ))}
          </div>

          <p className="text-sm text-sutra-muted max-w-2xl leading-relaxed">
            Every message &mdash; regardless of channel &mdash; routes through 8
            security layers. Budget checks. Audit logs. Kill switches. On every
            single interaction.
          </p>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-20 border-t border-sutra-border" id="how-it-works">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-mono uppercase tracking-[3px] text-[#7C3AED] mb-4 text-center">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sutra-text text-center mb-12">
            Three steps. Your agency is live.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <Card key={step.num} className="relative overflow-hidden">
                <span className="absolute top-4 right-5 text-5xl font-extrabold text-[#7C3AED]/[0.07] font-mono leading-none select-none">
                  {step.num}
                </span>
                <h3 className="text-lg font-bold text-sutra-text relative">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-sutra-muted leading-relaxed relative">
                  {step.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PLATFORM SCREENSHOTS ═══════════ */}
      <section className="py-20 border-t border-sutra-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-mono uppercase tracking-[3px] text-[#7C3AED] mb-4 text-center">
            The platform
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sutra-text text-center mb-12">
            See the platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { src: "/images/screenshots/dashboard-overview.png", alt: "Dashboard overview", caption: "Your agents at a glance" },
              { src: "/images/screenshots/heartbeat-channels.png", alt: "Heartbeat and channels", caption: "Autonomous operation, governed" },
              { src: "/images/screenshots/cost-dashboard.png", alt: "Cost dashboard", caption: "Every dollar tracked" },
            ].map((img) => (
              <div key={img.src} className="text-center">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-xl border border-[#7C3AED]/15 shadow-[0_0_30px_rgba(124,58,237,0.2)]"
                />
                <p className="mt-3 text-sm text-sutra-muted">{img.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ COUNCIL MODE ═══════════ */}
      <section className="py-20 border-t border-sutra-border bg-sutra-surface/30" id="council">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-mono uppercase tracking-[3px] text-[#7C3AED] mb-4 text-center">
            Council mode
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sutra-text text-center">
            When one agent isn&rsquo;t enough.
          </h2>
          <p className="mt-4 text-lg text-sutra-muted max-w-2xl mx-auto text-center mb-12">
            Assemble your agents into councils. They deliberate.
            <br className="hidden sm:block" />
            You get unified guidance.
          </p>

          {/* Council agent arc */}
          <div className="relative max-w-3xl mx-auto mb-12">
            {/* Center Sutra avatar */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#7C3AED]/40 shadow-lg shadow-[#7C3AED]/20">
                <Image
                  src="/images/agents/sutra.png"
                  alt="Sutra — Synthesis Agent"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
            </div>

            {/* 8 Rights agents */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {COUNCIL_AGENTS.map((agent) => {
                const agentData = RIGHTS_AGENTS.find(
                  (r) => r.name === agent.name
                );
                const color = agentData?.accent_color || "#a78bfa";
                return (
                  <div key={agent.key} className="text-center group">
                    <div
                      className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 transition-all duration-200 group-hover:scale-110"
                      style={{ borderColor: `${color}60` }}
                    >
                      <Image
                        src={AGENT_AVATARS[agent.key]}
                        alt={agent.name}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-sutra-text">
                      {agent.name}
                    </p>
                    <p className="text-[11px] text-sutra-muted leading-snug">
                      {agent.role}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Council descriptions */}
          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <h3 className="text-base font-bold text-sutra-text mb-2">
                Council of Experts
              </h3>
              <p className="text-sm text-sutra-muted leading-relaxed">
                Legal, Financial, Technical, Market, Risk, Growth. Configure
                which experts join based on your question.
              </p>
            </Card>

            <div className="rounded-xl border-l-[3px] border-[#7C3AED] bg-sutra-surface border border-sutra-border p-6">
              <p className="text-sm text-sutra-muted leading-relaxed">
                <strong className="text-sutra-text">Combined Council:</strong>{" "}
                Both councils deliberate simultaneously. Not just &ldquo;what
                should I do&rdquo; &mdash; but &ldquo;what should I do and can I
                live with it.&rdquo;
              </p>
            </div>

            <p className="text-xs text-sutra-muted/70 italic text-center">
              Available on Professional and Enterprise plans.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ GOVERNANCE ═══════════ */}
      <section className="py-20 border-t border-sutra-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-mono uppercase tracking-[3px] text-[#7C3AED] mb-4">
            Governance
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sutra-text">
            Every agent. Every action. Governed.
          </h2>
          <p className="mt-4 text-lg text-sutra-muted max-w-2xl mx-auto mb-10">
            Powered by Samm&#x0101; Suit &mdash; the open-source security
            framework.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {SECURITY_LAYERS.map((layer) => (
              <span
                key={layer}
                className="font-mono text-xs font-bold tracking-wider px-4 py-2 rounded-lg bg-[#7C3AED]/[0.08] border border-[#7C3AED]/15 text-[#8B5CF6]"
              >
                {layer}
              </span>
            ))}
          </div>

          <p className="text-sm text-sutra-muted max-w-xl mx-auto leading-relaxed mb-6">
            Budget enforcement. Kill switches. Cryptographic identity. Audit
            trails. Skill vetting. Model permissions. Process isolation. Gateway
            protection. All on by default.
          </p>

          <a
            href="https://sammasuit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#7C3AED] hover:text-[#8B5CF6] transition-colors"
          >
            Learn more at sammasuit.com
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ═══════════ FOUNDER STORY ═══════════ */}
      <section className="py-20 border-t border-sutra-border bg-sutra-surface/20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#00D4FF] flex items-center justify-center text-white text-xl font-bold shrink-0">
              JB
            </div>
            <div>
              <div className="text-sm font-semibold text-sutra-text">
                JB Wagoner, Founder
              </div>
              <div className="text-xs text-sutra-muted">
                OneZeroEight.ai
              </div>
            </div>
          </div>

          <div className="text-sm text-sutra-muted leading-relaxed space-y-4">
            <p>
              I&rsquo;ve spent 13 years building technology products.
            </p>
            <p>
              I built Sutra because I needed an AI agency I could actually trust.
              Not a chatbot &mdash; a team of governed agents that work across
              every channel, stay within budget, and leave an audit trail on
              everything.
            </p>
            <p>
              We run 30+ agents in production today. Our DevRel agent monitors
              Reddit and Hacker News, drafts content for 4 social accounts, and
              emails me a report every 8 hours &mdash; all under enforced budget
              caps and cryptographic signing.
            </p>
            <p>
              Every feature on this page exists because we use it ourselves.
              Every security layer is enforced because we need it ourselves.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-sutra-muted">
            <a
              href="https://x.com/jbwagoner"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sutra-accent transition-colors"
            >
              @jbwagoner
            </a>
            <a
              href="https://x.com/sammasuit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sutra-accent transition-colors"
            >
              @sammasuit
            </a>
            <a
              href="https://x.com/sutra_ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sutra-accent transition-colors"
            >
              @sutra_ai
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section className="py-20 border-t border-sutra-border" id="pricing">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-mono uppercase tracking-[3px] text-[#7C3AED] mb-4 text-center">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sutra-text text-center mb-12">
            Start free. Scale when you&rsquo;re ready.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Free */}
            <Card className="flex flex-col">
              <p className="text-xs font-mono tracking-wider text-sutra-muted mb-3">
                FREE
              </p>
              <p className="text-4xl font-extrabold text-sutra-text">$0</p>
              <p className="text-xs text-sutra-muted/60 mb-6">forever</p>
              <ul className="space-y-2 flex-1">
                {[
                  "2 agents",
                  "Dashboard chat only",
                  "10 skills",
                  "Community support",
                  "BYOK (bring your own key)",
                ].map((f) => (
                  <li
                    key={f}
                    className="text-sm text-sutra-muted flex items-start gap-2"
                  >
                    <span className="text-[#7C3AED] text-xs mt-0.5">&rarr;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button variant="secondary" href="/sign-up" className="w-full">
                  Get Started Free
                </Button>
              </div>
            </Card>

            {/* Creator */}
            <Card className="flex flex-col">
              <p className="text-xs font-mono tracking-wider text-sutra-muted mb-3">
                CREATOR
              </p>
              <p className="text-4xl font-extrabold text-sutra-text">
                $29<span className="text-base font-normal text-sutra-muted">/mo</span>
              </p>
              <p className="text-xs text-sutra-muted/60 mb-6">per workspace</p>
              <ul className="space-y-2 flex-1">
                {[
                  "10 agents",
                  "All channels (Telegram, Slack, Email)",
                  "30+ skills",
                  "Heartbeat scheduling",
                  "BYOK multi-provider (Claude, GPT, Gemini)",
                  "Email support",
                ].map((f) => (
                  <li
                    key={f}
                    className="text-sm text-sutra-muted flex items-start gap-2"
                  >
                    <span className="text-[#7C3AED] text-xs mt-0.5">&rarr;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button href="/sign-up" className="w-full">
                  Start Creating
                </Button>
              </div>
            </Card>

            {/* Professional — featured */}
            <Card className="flex flex-col relative border-[#7C3AED] shadow-lg shadow-[#7C3AED]/20">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-[10px] font-mono font-bold tracking-widest px-4 py-1 rounded-full">
                RECOMMENDED
              </span>
              <p className="text-xs font-mono tracking-wider text-sutra-muted mb-3">
                PROFESSIONAL
              </p>
              <p className="text-4xl font-extrabold text-sutra-text">
                $99<span className="text-base font-normal text-sutra-muted">/mo</span>
              </p>
              <p className="text-xs text-sutra-muted/60 mb-6">per workspace</p>
              <ul className="space-y-2 flex-1">
                {[
                  "Unlimited agents",
                  "All channels + heartbeat",
                  "All skills",
                  "Council mode (Rights + Experts + Combined)",
                  "Persistent cross-session memory",
                  "Priority support",
                  "Advanced audit & compliance",
                ].map((f) => (
                  <li
                    key={f}
                    className="text-sm text-sutra-muted flex items-start gap-2"
                  >
                    <span className="text-[#7C3AED] text-xs mt-0.5">&rarr;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button href="/sign-up" className="w-full">
                  Go Professional
                </Button>
              </div>
            </Card>

            {/* Enterprise */}
            <Card className="flex flex-col">
              <p className="text-xs font-mono tracking-wider text-sutra-muted mb-3">
                ENTERPRISE
              </p>
              <p className="text-4xl font-extrabold text-sutra-text">Custom</p>
              <p className="text-xs text-sutra-muted/60 mb-6">talk to us</p>
              <ul className="space-y-2 flex-1">
                {[
                  "Everything in Professional",
                  "SSO / SAML",
                  "Custom agents & skills",
                  "Compliance reporting (SOC2, ISO)",
                  "Dedicated SLA",
                  "Human expert integration (roadmap)",
                ].map((f) => (
                  <li
                    key={f}
                    className="text-sm text-sutra-muted flex items-start gap-2"
                  >
                    <span className="text-[#7C3AED] text-xs mt-0.5">&rarr;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button
                  variant="secondary"
                  href="mailto:info@sammasuit.com?subject=Sutra%20Enterprise%20Inquiry"
                  className="w-full"
                >
                  Talk to Sales
                </Button>
              </div>
            </Card>
          </div>

          <p className="mt-8 text-center text-sm text-sutra-muted">
            All plans include Samm&#x0101; Suit&rsquo;s 8 security layers.{" "}
            <span className="text-[#00D4FF] font-medium">BYOK</span> &mdash;
            bring your own Anthropic, OpenAI, or Google API key. You control your
            spend.
          </p>
        </div>
      </section>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-transparent via-[#7C3AED]/[0.04] to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-sutra-text">
            Build your agency today.
          </h2>
          <p className="mt-4 text-lg text-sutra-muted">
            Start with 2 free agents. No credit card required.
          </p>
          <div className="mt-8">
            <Button href="/sign-up" className="text-base px-8 py-3.5">
              Create Your First Agent <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
