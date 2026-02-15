import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight, X, Check, UserCheck, MessageSquare, Sparkles } from "lucide-react";

const BEFORE_ITEMS = [
  "AI generates answer in isolation",
  "No domain expert review",
  "Single-model blind spots",
  "User must validate alone",
];

const AFTER_ITEMS = [
  "Council deliberates from 8+ perspectives",
  "Human expert joins the session live",
  "Blind spots caught by ensemble + professional",
  "Validated, actionable guidance you can trust",
];

const FLOW_STEPS = [
  {
    icon: MessageSquare,
    step: "01",
    title: "AI deliberates",
    desc: "Your council analyzes the question from every angle — legal, financial, ethical, strategic.",
    color: "#a78bfa",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Human reviews",
    desc: "A domain expert joins the session to validate, challenge, and refine the council's analysis.",
    color: "#f59e0b",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Sutra synthesizes",
    desc: "The synthesis agent reconciles AI perspectives with human expertise into one unified recommendation.",
    color: "#06b6d4",
  },
];

const EXPERT_CATEGORIES = [
  "Corporate Law",
  "Tax Strategy",
  "M&A Advisory",
  "Clinical Psychology",
  "Behavioral Health",
  "Financial Planning",
  "Cybersecurity",
  "Data Privacy",
  "HR Compliance",
  "Estate Planning",
  "IP Law",
  "Executive Coaching",
  "Music Industry",
  "Medical Professionals",
];

export function HumanExpertSection() {
  return (
    <section className="py-20 border-t border-sutra-border bg-sutra-surface/30 opacity-60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-800/80 text-zinc-400 text-xs font-medium text-center py-2 rounded-t-xl mb-6">
          Coming Soon &mdash; Human Expert Network
        </div>
        {/* Tagline + Headline */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block font-mono text-xs uppercase tracking-widest text-sutra-gold mb-4">
            Human Expert Integration
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sutra-text">
            The professional is{" "}
            <em className="text-sutra-accent not-italic">already</em> in the
            room.
          </h2>
          <p className="mt-4 text-lg text-sutra-muted leading-relaxed">
            Other AI tools replace the expert. Sutra.team brings AI and human
            professionals together in one live session &mdash; so you get
            validated answers, not just generated ones.
          </p>
        </div>

        {/* Before / After Comparison */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Before — Every other AI */}
          <div className="rounded-xl border border-sutra-border bg-sutra-bg p-6">
            <p className="text-xs font-mono uppercase tracking-wider text-sutra-muted mb-4">
              Every other AI
            </p>
            <ul className="space-y-3">
              {BEFORE_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <X className="h-4 w-4 text-red-400/70 mt-0.5 shrink-0" />
                  <span className="text-sm text-sutra-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After — Sutra.team */}
          <div className="rounded-xl border border-sutra-accent/30 bg-sutra-accent/5 p-6">
            <p className="text-xs font-mono uppercase tracking-wider text-sutra-accent mb-4">
              Sutra.team
            </p>
            <ul className="space-y-3">
              {AFTER_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-sutra-accent mt-0.5 shrink-0" />
                  <span className="text-sm text-sutra-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3-Step Flow */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {FLOW_STEPS.map((item) => (
            <Card key={item.step} hover>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono" style={{ color: item.color }}>
                  {item.step}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-sutra-text">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-sutra-muted leading-relaxed">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>

        {/* Pricing Value Prop */}
        <div className="mt-14 max-w-3xl mx-auto rounded-xl border border-sutra-gold/20 bg-sutra-gold/5 p-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sutra-gold/30 bg-sutra-bg px-3 py-1 text-xs text-sutra-gold mb-4">
            Coming Soon &mdash; Premium Add-on
          </div>
          <p className="text-base text-sutra-text leading-relaxed">
            Human expert sessions are available at a fraction of typical
            consultation fees &mdash; because the AI does the heavy lifting
            first.{" "}
            <span className="text-sutra-accent font-medium">
              You arrive prepared. The expert validates, not educates.
            </span>
          </p>
          <p className="mt-3 text-xs text-sutra-muted">
            Available on Professional and Enterprise plans. Not included in base
            tiers.
          </p>
        </div>

        {/* Expert Network Banner */}
        <div className="mt-14 rounded-xl border border-sutra-border bg-sutra-bg p-8 text-center">
          <p className="text-xs font-mono uppercase tracking-wider text-sutra-gold mb-2">
            Expert Network
          </p>
          <p className="text-sm text-sutra-muted max-w-xl mx-auto">
            Licensed professionals across dozens of disciplines, available to
            join your council session on demand.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {EXPERT_CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-sutra-border bg-sutra-surface px-3 py-1 text-xs text-sutra-muted"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Button href="/connect">
            Start a Session <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
