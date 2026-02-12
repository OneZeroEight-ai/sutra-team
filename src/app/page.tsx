import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { RightsGrid } from "@/components/council/RightsGrid";
import { ExpertsGrid } from "@/components/council/ExpertsGrid";
import { SynthesisFlow } from "@/components/council/SynthesisFlow";
import { DiffScore } from "@/components/differentiation/DiffScore";
import { HumanExpertSection } from "@/components/landing/HumanExpertSection";
import Image from "next/image";
import {
  ArrowRight,
  Zap,
  Users,
  Brain,
  Shield,
  Award,
  BookOpen,
  FileText,
  Video,
  Mic,
  Phone,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sutra-accent/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sutra-border bg-sutra-surface px-4 py-1.5 text-xs text-sutra-muted mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-sutra-gold animate-pulse" />
            Patent Pending &middot; Ensemble Agent Deliberation
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-sutra-text max-w-4xl mx-auto leading-tight">
            Your personal{" "}
            <span className="text-sutra-accent">council of experts.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-sutra-muted max-w-2xl mx-auto leading-relaxed">
            Sutra.team is a persona hosting platform where multiple AI agents
            deliberate on your question &mdash; then a synthesis agent
            reconciles their perspectives into one unified answer.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/connect">
              Start a Session <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="secondary" href="/pricing">
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-sutra-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="How It Works"
            subtitle="Three steps from question to unified insight"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                step: "01",
                title: "You ask a question",
                desc: "Submit any query through the API or web interface. The system routes it to the appropriate council.",
              },
              {
                icon: Users,
                step: "02",
                title: "8+ agents deliberate",
                desc: "Specialized agents analyze your question in parallel, each from their unique perspective and domain expertise.",
              },
              {
                icon: Zap,
                step: "03",
                title: "Sutra synthesizes",
                desc: "The synthesis agent maps agreement, identifies tensions, detects gaps, and produces one unified recommendation.",
              },
            ].map((item) => (
              <Card key={item.step} hover>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-sutra-accent">
                    {item.step}
                  </span>
                  <item.icon className="h-5 w-5 text-sutra-muted" />
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
        </div>
      </section>

      {/* Connect Preview */}
      <section className="py-20 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Talk to your council. Literally."
            subtitle="Video call, voice session, or phone call &mdash; no app install, browser-native WebRTC, or just pick up the phone"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Video,
                title: "Video Room",
                tagline: "Face your council.",
                desc: "Camera on, animated agent avatars, screen sharing, and a full real-time transcript.",
                color: "#a78bfa",
              },
              {
                icon: Mic,
                title: "Voice Session",
                tagline: "Hands-free wisdom.",
                desc: "Audio only with agent avatars and live transcript. Perfect for mobile and multitasking.",
                color: "#06b6d4",
              },
              {
                icon: Phone,
                title: "Phone Call",
                tagline: "Dial in from anywhere.",
                desc: "Call a number, choose your council via IVR. No internet required. Works from any phone.",
                color: "#f59e0b",
              },
            ].map((item) => (
              <Card key={item.title} hover>
                <div
                  className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon
                    className="h-6 w-6"
                    style={{ color: item.color }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-sutra-text">
                  {item.title}
                </h3>
                <p
                  className="text-sm font-medium mt-1"
                  style={{ color: item.color }}
                >
                  {item.tagline}
                </p>
                <p className="mt-3 text-sm text-sutra-muted leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button href="/connect">
              Try a Session <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Council of Rights */}
      <section className="py-20 border-t border-sutra-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Council of Rights"
            subtitle="Eight agents grounded in the Noble Eightfold Path &mdash; a fixed council for principled deliberation"
          />
          <RightsGrid />
        </div>
      </section>

      {/* Council of Experts */}
      <section className="py-20 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Council of Experts"
            subtitle="Domain-specialist agents configurable per use case &mdash; build your own council"
          />
          <ExpertsGrid />
          <p className="text-center text-sm text-sutra-muted mt-8">
            Default set shown (startup/business focus). Custom expert councils
            available on Professional and Enterprise plans.
          </p>
        </div>
      </section>

      {/* Combined Council */}
      <section className="py-20 border-t border-sutra-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full overflow-hidden border-2 border-sutra-accent/30 relative">
              <Image
                src="/images/agents/sutra.png"
                alt="Sutra"
                fill
                className="object-cover"
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sutra-gold/30 bg-sutra-gold/5 px-4 py-1.5 text-xs text-sutra-gold mb-6">
              Premium Feature
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sutra-text">
              Combined Council
            </h2>
            <p className="mt-4 text-lg text-sutra-muted leading-relaxed">
              Run both councils on the same query. Get Strategic Analysis +
              Principled Evaluation + Integrated Recommendation.
            </p>
            <blockquote className="mt-8 text-xl italic text-sutra-accent/90 border-l-2 border-sutra-accent pl-6 text-left max-w-xl mx-auto">
              &ldquo;Not just <em>what should I do</em> &mdash; but{" "}
              <em>what should I do and can I live with it.</em>&rdquo;
            </blockquote>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: "Strategic Analysis",
                  desc: "Expert-driven domain assessment",
                },
                {
                  title: "Principled Evaluation",
                  desc: "Values-based ethical review",
                },
                {
                  title: "Integrated Recommendation",
                  desc: "Synthesized actionable guidance",
                },
              ].map((item) => (
                <Card key={item.title}>
                  <h4 className="text-sm font-semibold text-sutra-text">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs text-sutra-muted">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Human Expert Integration */}
      <HumanExpertSection />

      {/* Differentiation */}
      <section className="py-20 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionHeading
                title="This isn't a prompt wrapper."
                subtitle="Sutra.team personas have measurable differentiation scores, automated testing, and public differentiation certificates."
                align="left"
              />
              <p className="text-sm text-sutra-muted leading-relaxed">
                Every persona gets a differentiation portfolio: side-by-side
                comparisons against the base model, a live score dashboard,
                creative works catalog, and a public differentiation
                certificate. This is what makes the platform defensible.
              </p>
              <div className="mt-6">
                <Button variant="secondary" href="/docs">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <DiffScore />
            </div>
          </div>
        </div>
      </section>

      {/* Powered by SammaSuit */}
      <section className="py-20 border-t border-sutra-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            title="Powered by SammaSuit"
            subtitle="Sutra.team runs on SammaSuit.com infrastructure &mdash; an 8-layer security framework protecting all agent operations"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[
              "SUTRA",
              "DHARMA",
              "SANGHA",
              "KARMA",
              "SILA",
              "METTA",
              "BODHI",
              "NIRVANA",
            ].map((layer) => (
              <div
                key={layer}
                className="rounded-lg border border-sutra-border bg-sutra-surface px-3 py-2.5 text-xs font-mono text-sutra-muted text-center"
              >
                {layer}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button
              variant="secondary"
              href="https://sammasuit.com"
            >
              Explore SammaSuit.com{" "}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Patent & Credibility */}
      <section className="py-20 border-t border-sutra-border bg-sutra-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Built on Research, Protected by Patent"
            subtitle="A values-based AI alignment system backed by research, publication, and intellectual property"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Shield,
                title: "Patent Filed",
                desc: "U.S. Provisional Application, January 2026. Inventor: JB Wagoner.",
              },
              {
                icon: Award,
                title: "IEEE CertifAIEd",
                desc: "Alignment with IEEE standards for ethical AI development.",
              },
              {
                icon: BookOpen,
                title: "Zen AI",
                desc: "Theoretical foundation for values-based alignment. Book by JB Wagoner.",
              },
              {
                icon: FileText,
                title: "Proven Alignment",
                desc: "40+ songs, 4 albums of sustained creative alignment as proof of concept.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <item.icon className="h-5 w-5 text-sutra-accent mb-3" />
                <h4 className="text-sm font-semibold text-sutra-text">
                  {item.title}
                </h4>
                <p className="mt-2 text-xs text-sutra-muted leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="secondary" href="/about">
              Learn About Our Story <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
