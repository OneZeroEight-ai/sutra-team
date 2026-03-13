"use client";
import { useState, Suspense } from "react";
import { useReferralContext } from "@/hooks/useReferralContext";

type Step = 1 | 2 | 3 | 4;

const FEATURED_AGENTS = [
  { id: "assistant", name: "Assistant", role: "General purpose help, daily tasks", icon: "\uD83E\uDD1D" },
  { id: "market-analyst", name: "Market Analyst", role: "Competitive intelligence", icon: "\uD83D\uDCCA" },
  { id: "growth-strategist", name: "Growth Strategist", role: "Go-to-market & scaling", icon: "\uD83D\uDE80" },
  { id: "financial-strategist", name: "Financial Strategist", role: "Valuation & fundraising", icon: "\uD83D\uDCB9" },
  { id: "communicator", name: "The Communicator", role: "Message & PR strategy", icon: "\uD83D\uDCAC" },
  { id: "legal-analyst", name: "Legal Analyst", role: "Contract & compliance", icon: "\uD83D\uDCCB" },
];

const FEATURED_SKILLS = [
  { id: "web-search", name: "Web Search", description: "Research anything in real time" },
  { id: "email-sender", name: "Email", description: "Read, draft, and send email" },
  { id: "telegram", name: "Telegram", description: "Deploy your agent to your phone" },
  { id: "calendar", name: "Calendar", description: "Schedule and manage your time" },
];

function QuickStartFlow() {
  const [step, setStep] = useState<Step>(1);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const context = useReferralContext();

  const headlines: Record<Step, Record<string, string>> = {
    1: {
      book: "Step 1: Pick your first specialist",
      ad: "Step 1: Choose your first team member",
      organic: "Step 1: Choose your first AI specialist",
    },
    2: {
      book: "Step 2: Give them a skill",
      ad: "Step 2: Add a skill",
      organic: "Step 2: Attach a skill",
    },
    3: {
      book: "Step 3: Create your free account",
      ad: "Step 3: Start for $9/month",
      organic: "Step 3: Create your account",
    },
    4: {
      book: "Your agent is deployed. Welcome to the team.",
      ad: "Done. Your AI agency is live.",
      organic: "Your agent is live.",
    },
  };

  return (
    <div className="max-w-[680px] mx-auto px-6 py-12 pt-28">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-[3px] flex-1 rounded-sm transition-colors duration-300 ${
              s <= step ? "bg-sutra-accent" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <h1
        className="text-[28px] font-semibold text-sutra-text mb-2"
        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
      >
        {headlines[step][context]}
      </h1>

      {/* STEP 1: Agent picker */}
      {step === 1 && (
        <div>
          <p className="text-sutra-muted mb-6">
            You can add more later. Start with the specialist you need most.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {FEATURED_AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedAgent === agent.id
                    ? "border-sutra-accent bg-sutra-accent/10"
                    : "border-sutra-border bg-transparent hover:border-sutra-border-hover"
                }`}
              >
                <div className="text-2xl mb-1.5">{agent.icon}</div>
                <div className="font-semibold text-sm text-sutra-text">
                  {agent.name}
                </div>
                <div className="text-xs text-sutra-muted mt-0.5">
                  {agent.role}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => selectedAgent && setStep(2)}
            disabled={!selectedAgent}
            className={`w-full py-3.5 rounded-lg font-semibold text-[15px] transition-all ${
              selectedAgent
                ? "bg-sutra-accent text-sutra-bg cursor-pointer"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            Next: Add a skill →
          </button>
        </div>
      )}

      {/* STEP 2: Skill picker */}
      {step === 2 && (
        <div>
          <p className="text-sutra-muted mb-6">
            Skills are what make your agent autonomous. Pick one to start.
          </p>
          <div className="flex flex-col gap-2.5 mb-8">
            {FEATURED_SKILLS.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkill(skill.id)}
                className={`py-4 px-5 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                  selectedSkill === skill.id
                    ? "border-sutra-accent bg-sutra-accent/10"
                    : "border-sutra-border bg-transparent hover:border-sutra-border-hover"
                }`}
              >
                <div>
                  <div className="font-semibold text-sm text-sutra-text">
                    {skill.name}
                  </div>
                  <div className="text-xs text-sutra-muted mt-0.5">
                    {skill.description}
                  </div>
                </div>
                {selectedSkill === skill.id && (
                  <span className="text-sutra-accent text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => setStep(1)}
              className="py-3.5 px-5 rounded-lg bg-transparent border border-sutra-border text-sutra-muted cursor-pointer text-sm hover:border-sutra-border-hover transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => selectedSkill && setStep(3)}
              disabled={!selectedSkill}
              className={`flex-1 py-3.5 rounded-lg font-semibold text-[15px] transition-all ${
                selectedSkill
                  ? "bg-sutra-accent text-sutra-bg cursor-pointer"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              Next: Create account →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Clerk signup */}
      {step === 3 && (
        <div>
          <p className="text-sutra-muted mb-6">
            {context === "book"
              ? "Create your free account. Your selections are saved."
              : "Start your Explorer plan — $9/month. Cancel anytime."}
          </p>

          {/* Summary of selections */}
          <div className="bg-white/5 border border-sutra-border rounded-xl py-4 px-5 mb-6">
            <div className="text-[13px] text-sutra-muted mb-2">Your setup:</div>
            <div className="text-sm text-sutra-text">
              Agent: {FEATURED_AGENTS.find((a) => a.id === selectedAgent)?.name}
            </div>
            <div className="text-sm text-sutra-text mt-1">
              Skill: {FEATURED_SKILLS.find((s) => s.id === selectedSkill)?.name}
            </div>
          </div>

          {/* Clerk sign-up redirect */}
          <a
            href={`/sign-up?redirect_url=/dashboard?agent=${selectedAgent}&skill=${selectedSkill}&ref=${context}`}
            className="block w-full py-3.5 rounded-lg bg-sutra-accent text-sutra-bg text-center no-underline font-bold text-[15px] mb-3"
          >
            {context === "book" ? "Deploy my team →" : "Start for $9/month →"}
          </a>

          <p className="text-xs text-sutra-muted text-center">
            No credit card required to start. Explorer plan is $9/month.
          </p>

          <button
            onClick={() => setStep(2)}
            className="block w-full mt-3 py-2.5 bg-transparent border-none text-sutra-muted cursor-pointer text-[13px]"
          >
            ← Back
          </button>
        </div>
      )}

      {/* STEP 4: Confirmation */}
      {step === 4 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-6">✓</div>
          <p className="text-sutra-muted text-lg">
            Head to your dashboard to start working with your new agent.
          </p>
          <a
            href="/dashboard.html"
            className="inline-block mt-8 bg-sutra-accent text-sutra-bg px-10 py-3.5 rounded-lg font-semibold no-underline"
          >
            Open Dashboard →
          </a>
        </div>
      )}
    </div>
  );
}

export default function QuickStartPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[680px] mx-auto px-6 py-12 pt-28">
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="h-[3px] flex-1 rounded-sm bg-white/10" />
            ))}
          </div>
          <div className="h-8 w-64 bg-white/10 rounded animate-pulse" />
        </div>
      }
    >
      <QuickStartFlow />
    </Suspense>
  );
}
