"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Types ───

interface Agent {
  id: string;
  name: string;
  persona_name: string | null;
  persona_designation: string | null;
  origin_narrative: string | null;
  voice_tone: string | null;
  council_type: string | null;
  council_role: string | null;
  eightfold_path_aspect: string | null;
  synthesis_weight: number | null;
  conference_group: string[] | null;
  value_framework_primary: string | null;
  differentiation_statement: string | null;
  tts_voice_name: string | null;
  tts_provider: string | null;
  voice_speed: number | null;
  status: string;
  monthly_budget_usd: number;
  current_month_spend: number;
  installed_skills: string[];
  description: string | null;
  model: string | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Agent visual config ───

const AGENT_COLORS: Record<string, string> = {
  "The Wisdom Judge": "#a78bfa",
  "The Purpose": "#818cf8",
  "The Communicator": "#6366f1",
  "The Ethics Judge": "#f59e0b",
  "The Sustainer": "#10b981",
  "The Determined": "#ef4444",
  "The Aware": "#ec4899",
  "The Focused": "#06b6d4",
  "Legal Analyst": "#6366f1",
  "Financial Strategist": "#10b981",
  "Technical Architect": "#06b6d4",
  "Market Analyst": "#f59e0b",
  "Risk Assessor": "#ef4444",
  "Growth Strategist": "#ec4899",
  Sutra: "#d946ef",
};

const AGENT_INITIALS: Record<string, string> = {
  "The Wisdom Judge": "WJ",
  "The Purpose": "P",
  "The Communicator": "C",
  "The Ethics Judge": "EJ",
  "The Sustainer": "S",
  "The Determined": "D",
  "The Aware": "A",
  "The Focused": "F",
  "Legal Analyst": "LA",
  "Financial Strategist": "FS",
  "Technical Architect": "TA",
  "Market Analyst": "MA",
  "Risk Assessor": "RA",
  "Growth Strategist": "GS",
  Sutra: "Su",
};

function getAgentColor(agent: Agent): string {
  return AGENT_COLORS[agent.persona_name || agent.name] || "#71717a";
}

function getAgentInitials(agent: Agent): string {
  const name = agent.persona_name || agent.name;
  return (
    AGENT_INITIALS[name] ||
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  );
}

function getAgentDesignation(agent: Agent): string {
  if (agent.council_role === "synthesis") return "Ethics & Synthesis";
  if (agent.eightfold_path_aspect) return agent.eightfold_path_aspect;
  if (agent.persona_designation) {
    // Truncate long designations for card view
    const parts = agent.persona_designation.split(" — ");
    return parts[0];
  }
  return agent.description || "";
}

// ─── Page wrapper ───

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

// ─── Main dashboard ───

function DashboardContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [setting, setSetting] = useState(false);

  // Detail & chat state
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const loadAgents = useCallback(async () => {
    try {
      // Ensure council exists
      const ensureRes = await fetch("/api/council/ensure", { method: "POST" });
      if (!ensureRes.ok) {
        const errData = await ensureRes.json().catch(() => ({}));
        console.error("[dashboard] Ensure failed:", ensureRes.status, errData);
      }
      // Fetch all agents
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
    } catch (err) {
      console.error("[dashboard] Load failed:", err);
      setError("Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    loadAgents();
  }, [isSignedIn, loadAgents]);

  async function handleSetup() {
    setSetting(true);
    setError("");
    try {
      const ensureRes = await fetch("/api/council/ensure", { method: "POST" });
      if (!ensureRes.ok) {
        const errData = await ensureRes.json().catch(() => ({}));
        setError(errData.error || `Setup failed (${ensureRes.status})`);
        return;
      }
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
    } catch {
      setError("Failed to set up council. Please try again.");
    } finally {
      setSetting(false);
    }
  }

  function openDetail(agent: Agent) {
    setSelectedAgent(agent);
    setShowDetail(true);
  }

  function openChat(agent: Agent) {
    setChatAgent(agent);
    setChatMessages([]);
    setChatInput("");
    setShowChat(true);
    setShowDetail(false);
  }

  async function sendMessage() {
    if (!chatInput.trim() || !chatAgent || chatLoading) return;

    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    const allMessages = [...chatMessages, userMsg];
    setChatMessages(allMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`/api/agents/${chatAgent.id}/gateway`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const assistantContent =
        data.response || data.content || data.error || "No response";
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantContent },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Failed to get response" },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleKill(agent: Agent) {
    try {
      await fetch(`/api/agents/${agent.id}/kill`, { method: "POST" });
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, status: "terminated" } : a)),
      );
      if (selectedAgent?.id === agent.id) {
        setSelectedAgent({ ...agent, status: "terminated" });
      }
    } catch {
      setError("Failed to terminate agent");
    }
  }

  async function handleRevive(agent: Agent) {
    try {
      await fetch(`/api/agents/${agent.id}/revive`, { method: "POST" });
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, status: "active" } : a)),
      );
      if (selectedAgent?.id === agent.id) {
        setSelectedAgent({ ...agent, status: "active" });
      }
    } catch {
      setError("Failed to revive agent");
    }
  }

  // ─── Auth gates ───

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
            Sign in to access your team
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

  // ─── First visit — no agents yet ───

  if (!loading && agents.length === 0) {
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
            experts. Sutra — the ethics analyst who synthesizes every perspective
            into principled guidance.
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

  // ─── Loading ───

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
          <p className="text-sm text-sutra-muted">Loading your team...</p>
        </div>
      </div>
    );
  }

  // ─── Agent categorization ───

  const sutraAgent = agents.find((a) => a.council_role === "synthesis");
  const activeCount = agents.filter((a) => a.status === "active").length;

  return (
    <div className="min-h-screen bg-sutra-bg">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto">
          {sutraAgent && (
            <button
              onClick={() => openChat(sutraAgent)}
              className="flex items-center gap-2 bg-sutra-surface border border-fuchsia-500/30 rounded-lg px-4 py-2.5 text-sm font-medium text-sutra-text hover:border-fuchsia-500/60 transition whitespace-nowrap cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-fuchsia-400"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Ask Sutra
            </button>
          )}

          <Link
            href="/connect"
            className="flex items-center gap-2 bg-sutra-surface border border-sutra-border rounded-lg px-4 py-2.5 text-sm font-medium text-sutra-text hover:border-sutra-accent/40 transition whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-sutra-accent"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
            Voice Session
          </Link>

          <div className="ml-auto text-xs text-zinc-500 whitespace-nowrap">
            {activeCount}/{agents.length} active
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {agents.map((agent) => {
            const color = getAgentColor(agent);
            const initials = getAgentInitials(agent);
            const designation = getAgentDesignation(agent);
            const isActive = agent.status === "active";
            const isSutra = agent.council_role === "synthesis";
            const hasVoice = !!agent.tts_voice_name;

            return (
              <button
                key={agent.id}
                onClick={() => openDetail(agent)}
                className={`flex items-center gap-3 bg-sutra-surface border rounded-xl px-4 py-3 text-left transition cursor-pointer hover:border-opacity-60 ${
                  isSutra
                    ? "border-fuchsia-500/30 hover:border-fuchsia-500/50"
                    : "border-sutra-border hover:border-zinc-600"
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ backgroundColor: color + "30", color }}
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-sutra-text truncate">
                      {agent.persona_name || agent.name}
                    </span>
                    {/* Status indicator */}
                    {isActive ? (
                      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                      </span>
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">
                    {designation}
                  </div>
                </div>

                {/* Right icons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasVoice && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-zinc-600"
                    >
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    </svg>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openChat(agent);
                    }}
                    className="p-1 rounded hover:bg-zinc-800 transition cursor-pointer"
                    title={`Chat with ${agent.persona_name || agent.name}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-zinc-500"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
              </button>
            );
          })}
        </div>

        {/* Security Badge */}
        <div className="text-center text-xs text-zinc-600">
          All 8 security layers enforced &middot; Ed25519 signed &middot; Every
          action audited
        </div>
      </div>

      {/* ─── Detail Panel (overlay) ─── */}
      {showDetail && selectedAgent && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowDetail(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative bg-sutra-surface border border-sutra-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{
                  backgroundColor: getAgentColor(selectedAgent) + "30",
                  color: getAgentColor(selectedAgent),
                }}
              >
                {getAgentInitials(selectedAgent)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-sutra-text">
                    {selectedAgent.persona_name || selectedAgent.name}
                  </h2>
                  {selectedAgent.status === "active" ? (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                      Terminated
                    </span>
                  )}
                </div>
                <div className="text-sm text-zinc-400">
                  {selectedAgent.persona_designation ||
                    getAgentDesignation(selectedAgent)}
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Details */}
            <div className="space-y-4 text-sm">
              {selectedAgent.origin_narrative && (
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                    Origin
                  </div>
                  <div className="text-zinc-300 text-xs leading-relaxed">
                    {selectedAgent.origin_narrative}
                  </div>
                </div>
              )}

              {selectedAgent.voice_tone && (
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                    Voice Tone
                  </div>
                  <div className="text-zinc-300">{selectedAgent.voice_tone}</div>
                </div>
              )}

              {selectedAgent.value_framework_primary && (
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                    Value Framework
                  </div>
                  <div className="text-zinc-300">
                    {selectedAgent.value_framework_primary}
                  </div>
                </div>
              )}

              {selectedAgent.differentiation_statement && (
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                    Differentiation
                  </div>
                  <div className="text-zinc-300 text-xs leading-relaxed">
                    {selectedAgent.differentiation_statement}
                  </div>
                </div>
              )}

              {/* Voice config */}
              {selectedAgent.tts_voice_name && (
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs text-zinc-500">Voice</div>
                    <div className="text-zinc-300">
                      {selectedAgent.tts_voice_name}
                      {selectedAgent.tts_provider && (
                        <span className="text-zinc-600 ml-1">
                          ({selectedAgent.tts_provider})
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedAgent.voice_speed &&
                    selectedAgent.voice_speed !== 1.0 && (
                      <div>
                        <div className="text-xs text-zinc-500">Speed</div>
                        <div className="text-zinc-300">
                          {selectedAgent.voice_speed}x
                        </div>
                      </div>
                    )}
                </div>
              )}

              {selectedAgent.eightfold_path_aspect && (
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                    Eightfold Path
                  </div>
                  <div className="text-zinc-300">
                    {selectedAgent.eightfold_path_aspect}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-sutra-border">
              <button
                onClick={() => openChat(selectedAgent)}
                className="flex-1 bg-sutra-accent hover:bg-sutra-accent/90 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm cursor-pointer"
              >
                Chat with{" "}
                {selectedAgent.persona_name || selectedAgent.name}
              </button>

              {selectedAgent.status === "active" ? (
                <button
                  onClick={() => handleKill(selectedAgent)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium py-2.5 px-4 rounded-lg transition text-sm cursor-pointer"
                >
                  Terminate
                </button>
              ) : (
                <button
                  onClick={() => handleRevive(selectedAgent)}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium py-2.5 px-4 rounded-lg transition text-sm cursor-pointer"
                >
                  Revive
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Chat Panel (overlay) ─── */}
      {showChat && chatAgent && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowChat(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative bg-sutra-surface border border-sutra-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg h-[85vh] sm:h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat header */}
            <div className="flex items-center gap-3 p-4 border-b border-sutra-border flex-shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  backgroundColor: getAgentColor(chatAgent) + "30",
                  color: getAgentColor(chatAgent),
                }}
              >
                {getAgentInitials(chatAgent)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-sutra-text truncate">
                  {chatAgent.persona_name || chatAgent.name}
                </div>
                <div className="text-xs text-zinc-500">
                  {getAgentDesignation(chatAgent)}
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center text-zinc-600 text-sm mt-8">
                  Send a message to start chatting with{" "}
                  {chatAgent.persona_name || chatAgent.name}
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-sutra-accent/20 text-sutra-text"
                        : "bg-zinc-800 text-zinc-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-sutra-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`Message ${chatAgent.persona_name || chatAgent.name}...`}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-sutra-text placeholder:text-zinc-600 focus:outline-none focus:border-sutra-accent/50"
                  disabled={chatLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-sutra-accent hover:bg-sutra-accent/90 disabled:bg-zinc-800 disabled:text-zinc-600 text-white p-2.5 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
                >
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
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
