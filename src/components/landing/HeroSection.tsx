"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Code } from "lucide-react";
import { useReferralContext } from "@/hooks/useReferralContext";
import { heroVariants } from "@/lib/heroVariants";

export function HeroSection() {
  const context = useReferralContext();
  const searchParams = useSearchParams();
  const v = heroVariants[context];

  const quickStartHref = searchParams.toString()
    ? `/quick-start?${searchParams.toString()}`
    : "/quick-start";

  return (
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
        {"badge" in v && v.badge && (
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-1.5 mb-4 text-[13px] text-yellow-400 tracking-wide">
            {v.badge}
          </div>
        )}

        <div className="inline-flex items-center gap-2 bg-sutra-accent-glow border border-sutra-accent-dim/20 rounded-full px-4 py-1.5 mb-8 text-[13px] text-sutra-accent tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-sutra-accent animate-[pulse-dot_2s_infinite]" />
          {v.eyebrow}
        </div>

        <h1
          className="text-sutra-text leading-[1.1] mb-6 whitespace-pre-line"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontWeight: 400,
            fontSize: "clamp(40px, 7vw, 72px)",
          }}
        >
          {v.headline}
        </h1>

        <p
          className="text-sutra-muted max-w-[600px] mx-auto mb-10 leading-relaxed"
          style={{ fontSize: "clamp(17px, 2.5vw, 21px)" }}
        >
          {v.subhead}
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href={quickStartHref}
            className="bg-sutra-accent text-sutra-bg px-8 py-3.5 rounded-lg text-base font-semibold no-underline inline-flex items-center gap-2 shadow-[0_0_30px_rgba(79,209,197,0.15)] hover:shadow-[0_0_40px_rgba(79,209,197,0.25)] transition-shadow"
          >
            {v.primaryCTA} <ArrowRight size={18} />
          </Link>
          {context === "book" ? (
            <Link
              href="/quick-start?ref=book"
              className="bg-transparent text-sutra-text px-8 py-3.5 rounded-lg text-base font-medium no-underline inline-flex items-center gap-2 border border-sutra-border hover:border-sutra-border-hover transition-colors"
            >
              {v.secondaryCTA}
            </Link>
          ) : (
            <a
              href={context === "ad" ? "#agents" : "https://github.com/OneZeroEight-ai/sutra-team"}
              target={context === "ad" ? undefined : "_blank"}
              rel={context === "ad" ? undefined : "noopener noreferrer"}
              className="bg-transparent text-sutra-text px-8 py-3.5 rounded-lg text-base font-medium no-underline inline-flex items-center gap-2 border border-sutra-border hover:border-sutra-border-hover transition-colors"
            >
              {context === "organic" && <Code size={18} />}
              {v.secondaryCTA}
            </a>
          )}
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
  );
}
