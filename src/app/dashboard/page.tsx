"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
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
    const parts = agent.persona_designation.split(" — ");
    return parts[0];
  }
  return agent.description || "";
}

// ─── CSS Animations ───

const DASHBOARD_STYLES = `
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.3); }
  30% { transform: scale(1); }
  45% { transform: scale(1.15); }
  60% { transform: scale(1); }
}
@keyframes deathShake {
  0% { transform: translateX(0); }
  10% { transform: translateX(-6px) rotate(-1deg); }
  20% { transform: translateX(5px) rotate(1deg); }
  30% { transform: translateX(-4px) rotate(-0.5deg); }
  40% { transform: translateX(3px) rotate(0.5deg); }
  50% { transform: translateX(-2px); }
  60% { transform: translateX(1px); }
  100% { transform: translateX(0); }
}
@keyframes killFlash {
  0% { border-color: #ef4444; box-shadow: 0 0 40px rgba(239,68,68,0.4); }
  100% { border-color: rgba(63,63,70,0.5); box-shadow: none; }
}
@keyframes reviveFlash {
  0% { border-color: #fbbf24; box-shadow: 0 0 30px rgba(255,215,0,0.4); }
  30% { border-color: #fbbf24; box-shadow: 0 0 50px rgba(255,215,0,0.6); }
  60% { border-color: #10b981; box-shadow: 0 0 30px rgba(5,150,105,0.3); }
  100% { border-color: rgba(63,63,70,0.5); box-shadow: none; }
}
@keyframes reviveIconPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}
.agent-heartbeat {
  animation: heartbeat 1s ease-in-out infinite;
  display: inline-block;
  font-size: 14px;
  line-height: 1;
}
.agent-killing {
  animation: deathShake 0.6s ease-out, killFlash 0.6s ease-out;
}
.agent-reviving {
  animation: reviveFlash 2.5s ease-out;
}
.agent-revive-icon {
  animation: reviveIconPulse 0.8s ease-in-out infinite;
  display: inline-block;
  font-size: 14px;
  line-height: 1;
}
`;

// ─── Page wrapper ───

export default function DashboardPage() {
  return (
    <Suspense>
      <style dangerouslySetInnerHTML={{ __html: DASHBOARD_STYLES }} />
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Transition animation state
  const [killingAgents, setKillingAgents] = useState<Set<string>>(new Set());
  const [revivingAgents, setRevivingAgents] = useState<Set<string>>(new Set());

  // New Agent modal state
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentPrompt, setNewAgentPrompt] = useState("");
  const [newAgentModel, setNewAgentModel] = useState("claude-sonnet-4-20250514");
  const [newAgentBudget, setNewAgentBudget] = useState("5.00");
  const [creatingAgent, setCreatingAgent] = useState(false);

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

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

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

      // Gateway returns Anthropic-style response: content is an array of blocks
      let assistantContent = "";
      if (Array.isArray(data.content)) {
        assistantContent = data.content
          .filter((b: { type: string }) => b.type === "text")
          .map((b: { text: string }) => b.text)
          .join("\n");
      }
      if (!assistantContent) {
        assistantContent = data.error || data.detail || "No response";
      }

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
    // Start killing animation
    setKillingAgents((prev) => new Set(prev).add(agent.id));

    try {
      await fetch(`/api/agents/${agent.id}/kill`, { method: "POST" });

      // After animation (600ms), update status
      setTimeout(() => {
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agent.id ? { ...a, status: "terminated" } : a,
          ),
        );
        if (selectedAgent?.id === agent.id) {
          setSelectedAgent({ ...agent, status: "terminated" });
        }
        setKillingAgents((prev) => {
          const next = new Set(prev);
          next.delete(agent.id);
          return next;
        });
      }, 600);
    } catch {
      setError("Failed to terminate agent");
      setKillingAgents((prev) => {
        const next = new Set(prev);
        next.delete(agent.id);
        return next;
      });
    }
  }

  async function handleRevive(agent: Agent) {
    // Start reviving animation
    setRevivingAgents((prev) => new Set(prev).add(agent.id));

    try {
      await fetch(`/api/agents/${agent.id}/revive`, { method: "POST" });

      // Update status immediately
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agent.id ? { ...a, status: "active" } : a,
        ),
      );
      if (selectedAgent?.id === agent.id) {
        setSelectedAgent({ ...agent, status: "active" });
      }

      // Remove reviving animation after 2.5s
      setTimeout(() => {
        setRevivingAgents((prev) => {
          const next = new Set(prev);
          next.delete(agent.id);
          return next;
        });
      }, 2500);
    } catch {
      setError("Failed to revive agent");
      setRevivingAgents((prev) => {
        const next = new Set(prev);
        next.delete(agent.id);
        return next;
      });
    }
  }

  async function handleCreateAgent() {
    if (!newAgentName.trim() || !newAgentPrompt.trim()) return;
    setCreatingAgent(true);
    setError("");

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAgentName.trim(),
          system_prompt: newAgentPrompt.trim(),
          model: newAgentModel,
          monthly_budget_usd: parseFloat(newAgentBudget) || 5.0,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Failed to create agent");
        return;
      }

      // Reset form and reload
      setShowNewAgent(false);
      setNewAgentName("");
      setNewAgentPrompt("");
      setNewAgentModel("claude-sonnet-4-20250514");
      setNewAgentBudget("5.00");
      await loadAgents();
    } catch {
      setError("Failed to create agent");
    } finally {
      setCreatingAgent(false);
    }
  }

  // ─── Status indicator component ───

  function StatusIndicator({ agent }: { agent: Agent }) {
    const isKilling = killingAgents.has(agent.id);
    const isReviving = revivingAgents.has(agent.id);

    if (isReviving) {
      return <span className="agent-revive-icon" title="Reviving...">&#9889;</span>;
    }
    if (isKilling) {
      return <span style={{ fontSize: 14, lineHeight: 1 }} title="Terminating...">&#128128;</span>;
    }
    if (agent.status === "active") {
      return <span className="agent-heartbeat" title="Active">&#10084;&#65039;</span>;
    }
    // terminated
    return <span style={{ fontSize: 14, lineHeight: 1, opacity: 0.7 }} title="Terminated">&#128128;</span>;
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
            <button
              onClick={() => setError("")}
              className="ml-2 text-red-500 hover:text-red-300 cursor-pointer"
            >
              &times;
            </button>
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

          <button
            onClick={() => setShowNewAgent(true)}
            className="flex items-center gap-2 bg-sutra-surface border border-sutra-border rounded-lg px-4 py-2.5 text-sm font-medium text-sutra-text hover:border-emerald-500/40 transition whitespace-nowrap cursor-pointer"
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
              className="text-emerald-400"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Agent
          </button>

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
            const isSutra = agent.council_role === "synthesis";
            const hasVoice = !!agent.tts_voice_name;
            const isKilling = killingAgents.has(agent.id);
            const isReviving = revivingAgents.has(agent.id);

            return (
              <button
                key={agent.id}
                onClick={() => openDetail(agent)}
                className={`flex items-center gap-3 bg-sutra-surface border rounded-xl px-4 py-3 text-left transition cursor-pointer hover:border-opacity-60 ${
                  isKilling
                    ? "agent-killing"
                    : isReviving
                      ? "agent-reviving"
                      : ""
                } ${
                  isSutra
                    ? "border-fuchsia-500/30 hover:border-fuchsia-500/50"
                    : "border-sutra-border hover:border-zinc-600"
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
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
                    <StatusIndicator agent={agent} />
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
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <span className="agent-heartbeat" style={{ fontSize: 10 }}>&#10084;&#65039;</span>
                      Active
                    </span>
                  ) : (
                    <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1">
                      &#128128; Terminated
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
                    className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
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
              <div ref={chatEndRef} />
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

      {/* ─── New Agent Modal ─── */}
      {showNewAgent && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowNewAgent(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative bg-sutra-surface border border-sutra-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-sutra-text">
                Create New Agent
              </h2>
              <button
                onClick={() => setShowNewAgent(false)}
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

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. Research Assistant"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-sutra-text placeholder:text-zinc-600 focus:outline-none focus:border-sutra-accent/50"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  System Prompt
                </label>
                <textarea
                  value={newAgentPrompt}
                  onChange={(e) => setNewAgentPrompt(e.target.value)}
                  placeholder="Describe the agent's role, personality, and expertise..."
                  rows={4}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-sutra-text placeholder:text-zinc-600 focus:outline-none focus:border-sutra-accent/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Model
                  </label>
                  <select
                    value={newAgentModel}
                    onChange={(e) => setNewAgentModel(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-sutra-text focus:outline-none focus:border-sutra-accent/50"
                  >
                    <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                    <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
                    <option value="claude-opus-4-6">Claude Opus 4.6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Monthly Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={newAgentBudget}
                    onChange={(e) => setNewAgentBudget(e.target.value)}
                    min="0"
                    step="0.50"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-sutra-text focus:outline-none focus:border-sutra-accent/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-sutra-border">
              <button
                onClick={handleCreateAgent}
                disabled={creatingAgent || !newAgentName.trim() || !newAgentPrompt.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-600/90 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {creatingAgent ? "Creating..." : "Create Agent"}
              </button>
              <button
                onClick={() => setShowNewAgent(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 px-4 rounded-lg transition text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
