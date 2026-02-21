"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

interface CouncilStatus {
  councils: {
    rights: { active: boolean; agent_count: number };
    experts: { active: boolean; agent_count: number };
    combined: { active: boolean; agent_count: number };
  };
  has_synthesis_agent: boolean;
}

interface CouncilAgent {
  id: string;
  name: string;
  persona_name: string;
  persona_designation: string;
  council_type: string | null;
  council_role: string | null;
  eightfold_path_aspect: string | null;
  status: string;
  monthly_budget_usd: number;
  current_month_spend: number;
  voice_enabled: boolean;
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const [councilStatus, setCouncilStatus] = useState<CouncilStatus | null>(
    null,
  );
  const [agents, setAgents] = useState<CouncilAgent[]>([]);
  const [setting, setSetting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMembers, setShowMembers] = useState(false);

  // Load council status + agents on mount
  useEffect(() => {
    if (!isSignedIn) return;

    async function load() {
      try {
        const [statusRes, agentsRes] = await Promise.all([
          fetch("/api/council/ensure", { method: "POST" }),
          fetch("/api/council/agents"),
        ]);

        if (statusRes.ok) {
          const data = await statusRes.json();
          if (data.councils) {
            setCouncilStatus({
              councils: data.councils,
              has_synthesis_agent: data.has_synthesis_agent,
            });
          }
        }

        if (agentsRes.ok) {
          const data = await agentsRes.json();
          setAgents(data.agents || []);
        }
      } catch (err) {
        console.error("[dashboard] Load failed:", err);
        setError("Failed to load council status");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isSignedIn]);

  async function handleSetup() {
    setSetting(true);
    setError("");
    try {
      const res = await fetch("/api/council/ensure", { method: "POST" });
      const data = await res.json();
      if (data.councils) {
        setCouncilStatus({
          councils: data.councils,
          has_synthesis_agent: data.has_synthesis_agent,
        });
      }
      // Reload agents
      const agentsRes = await fetch("/api/council/agents");
      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAgents(agentsData.agents || []);
      }
    } catch {
      setError("Failed to set up council. Please try again.");
    } finally {
      setSetting(false);
    }
  }

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Image
            src="/images/oracle.gif"
            alt="Sutra"
            width={96}
            height={96}
            className="rounded-full mx-auto mb-6 border-2 border-violet-500/30"
          />
          <h1 className="text-2xl font-bold text-sutra-text mb-2">
            Sign in to access your council
          </h1>
          <p className="text-sutra-muted mb-6">
            15 specialized agents. One principled answer.
          </p>
          <SignInButton mode="modal">
            <button className="bg-sutra-accent hover:bg-sutra-accent/90 text-white font-medium py-3 px-8 rounded-lg transition cursor-pointer">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const totalAgents = councilStatus
    ? councilStatus.councils.rights.agent_count +
      councilStatus.councils.experts.agent_count
    : 0;

  const hasCouncil = totalAgents > 0;

  const rightsAgents = agents.filter(
    (a) => a.council_type === "rights" && a.council_role !== "synthesis",
  );
  const expertsAgents = agents.filter((a) => a.council_type === "experts");
  const sutraAgent = agents.find((a) => a.council_role === "synthesis");

  // First visit — no council yet
  if (!loading && !hasCouncil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="relative inline-block mb-6">
            <Image
              src="/images/oracle.gif"
              alt="Sutra"
              width={120}
              height={120}
              className="rounded-full border-2 border-violet-500/30 shadow-lg shadow-violet-500/20"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-3">
            Meet Sutra
          </h1>
          <p className="text-lg text-sutra-muted mb-2">
            Your AI council of 15 specialized agents
          </p>
          <p className="text-sm text-zinc-500 mb-8">
            8 Rights agents grounded in the Noble Eightfold Path. 6 domain
            experts. Sutra — the ethics analyst who synthesizes every
            perspective into principled guidance.
          </p>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleSetup}
            disabled={setting}
            className="bg-sutra-accent hover:bg-sutra-accent/90 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium py-3 px-8 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
          >
            {setting ? "Setting up..." : "Set Up My Council"}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Image
            src="/images/oracle.gif"
            alt="Loading..."
            width={80}
            height={80}
            className="rounded-full mx-auto mb-4 animate-pulse"
          />
          <p className="text-sm text-sutra-muted">Loading your council...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sutra-bg">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Sutra Card */}
        <div className="bg-sutra-surface border border-sutra-border rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Image
                src="/images/oracle.gif"
                alt="Sutra"
                width={96}
                height={96}
                className="rounded-full border-2 border-violet-500/30 shadow-lg shadow-violet-500/20"
              />
              {/* Alive pulse */}
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-sutra-surface">
                <div className="w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-sutra-text">Sutra</h1>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-sutra-muted text-sm mb-3">
                Ethics Analyst — {totalAgents + 1}-member council
              </p>
              <p className="text-xs text-zinc-500">
                Contemplative ethics &middot; Values-based alignment &middot;
                Principled synthesis
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-6 mt-4">
                <div>
                  <div className="text-xs text-zinc-500">Voice</div>
                  <div className="text-sm text-sutra-text">
                    Charlotte{" "}
                    <span className="text-zinc-600">(Cartesia)</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Model</div>
                  <div className="text-sm text-sutra-text">
                    claude-sonnet-4-5
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Rights</div>
                  <div className="text-sm text-sutra-text">
                    {councilStatus?.councils.rights.agent_count || 0} agents
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Experts</div>
                  <div className="text-sm text-sutra-text">
                    {councilStatus?.councils.experts.agent_count || 0} agents
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link
            href="/council/deliberate"
            className="bg-sutra-surface border border-sutra-border rounded-xl p-6 text-center hover:border-sutra-accent/40 transition group"
          >
            <div className="text-2xl mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-sutra-accent"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-sutra-text group-hover:text-sutra-accent transition">
              Chat
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Text deliberation
            </div>
          </Link>

          <Link
            href="/connect"
            className="bg-sutra-surface border border-sutra-border rounded-xl p-6 text-center hover:border-sutra-accent/40 transition group"
          >
            <div className="text-2xl mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-sutra-accent"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div>
            <div className="text-sm font-medium text-sutra-text group-hover:text-sutra-accent transition">
              Voice
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Voice session
            </div>
          </Link>

          <div className="bg-sutra-surface border border-sutra-border rounded-xl p-6 text-center opacity-60 cursor-not-allowed">
            <div className="text-2xl mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-zinc-600"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-zinc-600">Phone</div>
            <div className="text-xs text-zinc-600 mt-1">Coming Soon</div>
          </div>
        </div>

        {/* Council Members — Expandable */}
        <div className="bg-sutra-surface border border-sutra-border rounded-xl mb-8">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
          >
            <div>
              <span className="text-sm font-medium text-sutra-text">
                Council Members
              </span>
              <span className="text-xs text-zinc-500 ml-2">
                Sutra consults {totalAgents} specialists on every question
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-zinc-500 transition-transform ${showMembers ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {showMembers && (
            <div className="px-4 pb-4 space-y-4">
              {/* Rights Agents */}
              {rightsAgents.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-violet-400 uppercase tracking-wider mb-2">
                    Rights Council
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rightsAgents.map((a) => (
                      <div
                        key={a.id}
                        className="bg-violet-500/5 border border-violet-500/20 rounded-lg px-3 py-1.5 text-xs"
                      >
                        <span className="text-sutra-text font-medium">
                          {a.persona_name}
                        </span>
                        {a.eightfold_path_aspect && (
                          <span className="text-violet-400/60 ml-1">
                            &middot; {a.eightfold_path_aspect}
                          </span>
                        )}
                      </div>
                    ))}
                    {/* Sutra badge */}
                    {sutraAgent && (
                      <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-lg px-3 py-1.5 text-xs">
                        <span className="text-sutra-text font-medium">
                          Sutra
                        </span>
                        <span className="text-fuchsia-400/60 ml-1">
                          &middot; Ethics &amp; Synthesis
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Experts Agents */}
              {expertsAgents.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">
                    Experts Council
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {expertsAgents.map((a) => (
                      <div
                        key={a.id}
                        className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs"
                      >
                        <span className="text-sutra-text font-medium">
                          {a.persona_name}
                        </span>
                        {a.persona_designation && (
                          <span className="text-amber-400/60 ml-1">
                            &middot; {a.persona_designation.split(" — ")[0]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div className="text-center text-xs text-zinc-600">
          All 8 security layers enforced &middot; Ed25519 signed &middot;
          Every action audited
        </div>
      </div>
    </div>
  );
}
