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
  timestamp?: string;
  layers?: string[];
  signature?: string;
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
  if (agent.council_role === "synthesis") return "Where strategy meets principle.";
  if (agent.eightfold_path_aspect) return agent.eightfold_path_aspect;
  if (agent.persona_designation) {
    const parts = agent.persona_designation.split(" — ");
    return parts[0];
  }
  return agent.description || "";
}

/** Council agents can't be killed/revived */
function isCouncilAgent(agent: Agent): boolean {
  return !!(agent.council_type || agent.council_role);
}

// ─── CSS — ported from sammasuit.com dashboard ───

const DASHBOARD_CSS = `
/* Custom properties — sammasuit.com palette */
.ss-dash {
  --bg: #06060E;
  --bg2: #0C0C1A;
  --card: #111126;
  --card-border: #1E1E3A;
  --purple: #7C3AED;
  --purple-glow: rgba(124, 58, 237, 0.3);
  --purple-dim: rgba(124, 58, 237, 0.08);
  --cyan: #00D4FF;
  --cyan-glow: rgba(0, 212, 255, 0.2);
  --gold: #FFD700;
  --red: #DC2626;
  --green: #059669;
  --orange: #EA580C;
  --pink: #FF6B9D;
  --blue: #0EA5E9;
  --white: #F0EFF4;
  --gray: #8888AA;
  --gray-dim: #4D4D66;
  --green-glow: rgba(5, 150, 105, 0.3);
  --red-glow: rgba(220, 38, 38, 0.3);
  font-family: 'Outfit', var(--font-geist-sans), system-ui, sans-serif;
  color: var(--white);
}

/* Grid background */
.ss-dash::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
}

/* ── Animations ── */
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.3); }
  30% { transform: scale(1); }
  45% { transform: scale(1.15); }
  60% { transform: scale(1); }
}
@keyframes deathShake {
  0%, 100% { transform: translateX(0) rotate(0); }
  10% { transform: translateX(-6px) rotate(-1deg); }
  20% { transform: translateX(6px) rotate(1deg); }
  30% { transform: translateX(-5px) rotate(-0.5deg); }
  40% { transform: translateX(5px) rotate(0.5deg); }
  50% { transform: translateX(-3px); }
  60% { transform: translateX(3px); }
  70% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
  90% { transform: translateX(-1px); }
}
@keyframes killFlash {
  0% { border-color: var(--red); box-shadow: 0 0 40px var(--red-glow); }
  100% { border-color: var(--card-border); box-shadow: none; }
}
@keyframes reviveFlash {
  0% { border-color: var(--gold); box-shadow: 0 0 30px rgba(255,215,0,0.4); }
  30% { border-color: var(--gold); box-shadow: 0 0 50px rgba(255,215,0,0.6); }
  60% { border-color: var(--green); box-shadow: 0 0 30px rgba(5,150,105,0.3); }
  100% { border-color: var(--card-border); box-shadow: none; }
}
@keyframes reviveIconPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes typingDot {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-4px); }
}

/* ── Overview cards ── */
.oc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.oc-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s;
}
.oc-card:hover {
  border-color: var(--purple);
  transform: translateY(-2px);
}
.oc-label {
  font-family: var(--font-geist-mono), 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--gray);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.oc-value {
  font-size: 32px;
  font-weight: 800;
}
.oc-sub {
  font-size: 13px;
  color: var(--gray-dim);
  margin-top: 4px;
}
.oc-minibar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--bg2);
  margin-top: 10px;
}
.oc-minibar .seg-active { background: var(--green); }
.oc-minibar .seg-terminated { background: var(--red); }
.oc-legend {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 11px;
  color: var(--gray-dim);
}
.oc-legend span::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
.oc-legend .leg-active::before { background: var(--green); }
.oc-legend .leg-term::before { background: var(--red); }

/* ── Tab bar ── */
.ss-tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--card-border);
  margin-bottom: 24px;
  overflow-x: auto;
  scrollbar-width: none;
}
.ss-tab-bar::-webkit-scrollbar { display: none; }
.ss-tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--gray);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  min-height: 44px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.ss-tab-btn:hover { color: var(--white); }
.ss-tab-btn.active { color: var(--cyan); border-bottom-color: var(--purple); }

/* ── Agent cards — sammasuit.com layout ── */
.agent-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 40px;
}
.agent-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease forwards;
}
.agent-card:hover { transform: scale(1.02); }
.agent-card.glow-active {
  border-color: rgba(5,150,105,0.25);
  box-shadow: 0 0 24px rgba(5,150,105,0.06);
}
.agent-card.glow-terminated {
  border-color: rgba(220,38,38,0.2);
  box-shadow: 0 0 24px rgba(220,38,38,0.05);
}
.agent-card.glow-sutra {
  border-color: rgba(217,70,239,0.3);
  box-shadow: 0 0 24px rgba(217,70,239,0.08);
}
.agent-card.death-shake {
  animation: deathShake 0.6s ease, killFlash 0.6s ease !important;
}
.agent-card.revive-flash {
  animation: reviveFlash 2.5s ease-out !important;
}

/* Agent state icons */
.agent-state-icon {
  display: inline-block;
  font-size: 16px;
  line-height: 1;
  vertical-align: middle;
}
.agent-state-icon.pulse-heart {
  animation: heartbeat 1s ease-in-out infinite;
}
.agent-state-icon.reviving {
  animation: reviveIconPulse 0.8s ease-in-out infinite;
}

/* Budget bar */
.budget-bar {
  width: 80px;
  height: 4px;
  background: var(--bg2);
  border-radius: 2px;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
}
.budget-bar-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--green);
  transition: width 0.5s ease;
}
.budget-bar-fill.warning { background: var(--gold); }
.budget-bar-fill.danger { background: var(--red); }

/* Action buttons */
.btn-ss {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid;
  min-height: 36px;
}
.btn-kill {
  background: rgba(220,38,38,0.1);
  color: var(--red);
  border-color: rgba(220,38,38,0.3);
}
.btn-kill:hover { background: rgba(220,38,38,0.2); border-color: var(--red); }
.btn-revive {
  background: rgba(5,150,105,0.1);
  color: var(--green);
  border-color: rgba(5,150,105,0.3);
}
.btn-revive:hover { background: rgba(5,150,105,0.2); border-color: var(--green); }
.btn-chat {
  background: rgba(6,182,212,0.1);
  color: var(--cyan);
  border-color: rgba(6,182,212,0.3);
}
.btn-chat:hover { background: rgba(6,182,212,0.2); border-color: var(--cyan); }
.btn-primary-ss {
  background: var(--purple);
  color: white;
  border-color: var(--purple);
  box-shadow: 0 0 20px var(--purple-glow);
}
.btn-primary-ss:hover {
  background: #8B5CF6;
  box-shadow: 0 0 30px var(--purple-glow);
  transform: translateY(-1px);
}

/* ── Chat sidebar ── */
.chat-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 149;
  transition: opacity 0.3s;
}
.chat-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 440px;
  max-width: 100%;
  height: 100vh;
  background: var(--bg2);
  border-left: 1px solid var(--card-border);
  z-index: 150;
  display: flex;
  flex-direction: column;
  transform: translateX(0);
  transition: transform 0.3s ease;
}
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--bg);
  border-bottom: 1px solid var(--card-border);
  min-height: 54px;
  gap: 10px;
}
.chat-header h3 {
  font-size: 16px;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}
.chat-messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.chat-msg-wrap {
  display: flex;
  flex-direction: column;
}
.chat-msg-wrap + .chat-msg-wrap { margin-top: 16px; }
.chat-sender-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  padding-left: 2px;
}
.chat-sender-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}
.chat-sender-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray);
  letter-spacing: 0.3px;
}
.chat-msg {
  max-width: 80%;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.55;
  word-wrap: break-word;
  overflow-wrap: break-word;
  animation: slideInUp 0.25s ease forwards;
}
.chat-msg.user {
  align-self: flex-end;
  background: var(--purple);
  color: white;
  border-radius: 18px 18px 4px 18px;
  white-space: pre-wrap;
}
.chat-msg.assistant {
  align-self: flex-start;
  max-width: 85%;
  background: #1a1a2e;
  color: var(--white);
  border: 1px solid rgba(30,30,58,0.8);
  border-radius: 4px 18px 18px 18px;
  white-space: pre-wrap;
}
.chat-msg.assistant p { margin: 5px 0; }
.chat-msg.assistant p:first-child { margin-top: 0; }
.chat-msg.assistant p:last-child { margin-bottom: 0; }
.chat-meta {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.layer-badge {
  font-family: var(--font-geist-mono), monospace;
  font-size: 9px;
  letter-spacing: 0.5px;
  padding: 1px 6px;
  border-radius: 4px;
  display: inline-block;
}
.layer-badge.sutra { background: rgba(124,58,237,0.15); color: var(--purple); }
.layer-badge.dharma { background: rgba(5,150,105,0.15); color: var(--green); }
.layer-badge.sangha { background: rgba(0,212,255,0.1); color: var(--cyan); }
.layer-badge.karma { background: rgba(255,215,0,0.1); color: var(--gold); }
.layer-badge.sila { background: rgba(234,88,12,0.1); color: var(--orange); }
.layer-badge.metta { background: rgba(255,107,157,0.1); color: var(--pink); }
.layer-badge.bodhi { background: rgba(14,165,233,0.1); color: var(--blue); }
.layer-badge.nirvana { background: rgba(220,38,38,0.1); color: var(--red); }
.chat-typing {
  align-self: flex-start;
  padding: 12px 18px;
  background: #1a1a2e;
  border: 1px solid rgba(30,30,58,0.8);
  border-radius: 4px 18px 18px 18px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.typing-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gray-dim);
  animation: typingDot 1.4s infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
.chat-input-bar {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  padding-bottom: env(safe-area-inset-bottom, 14px);
  background: var(--bg);
  border-top: 1px solid var(--card-border);
  align-items: flex-end;
}
.chat-input-bar textarea {
  flex: 1;
  padding: 10px 14px;
  border-radius: 20px;
  border: 1px solid var(--card-border);
  background: var(--bg2);
  color: var(--white);
  font-size: 14px;
  outline: none;
  font-family: inherit;
  min-height: 40px;
  max-height: 120px;
  resize: none;
  line-height: 1.4;
  overflow-y: auto;
}
.chat-input-bar textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 2px rgba(124,58,237,0.15);
}
.chat-input-bar textarea::placeholder { color: var(--gray-dim); }
.chat-send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--purple);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s, transform 0.1s;
}
.chat-send-btn:hover { background: #8B5CF6; transform: scale(1.05); }
.chat-send-btn:active { transform: scale(0.95); }
.chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* ── Modal ── */
.ss-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(6,6,14,0.85);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ss-modal {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 36px;
  max-width: 560px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  animation: fadeInUp 0.3s ease-out;
}
.ss-modal h3 {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
}
.ss-modal p {
  font-size: 14px;
  color: var(--gray);
  margin-bottom: 20px;
}
.ss-input {
  width: 100%;
  padding: 14px 18px;
  background: var(--bg2);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  color: var(--white);
  font-family: inherit;
  font-size: 15px;
  outline: none;
  transition: border-color 0.3s;
  margin-bottom: 12px;
}
.ss-input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 20px var(--purple-glow);
}
.ss-input::placeholder { color: var(--gray-dim); }
select.ss-input { appearance: auto; cursor: pointer; }
textarea.ss-input { resize: none; min-height: 100px; line-height: 1.5; }
.ss-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .oc-grid { grid-template-columns: repeat(2, 1fr); }
  .agent-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .chat-sidebar {
    width: 100% !important;
    border-left: none !important;
  }
  .oc-grid { grid-template-columns: 1fr 1fr; }
  .oc-card { padding: 16px; }
  .oc-value { font-size: 24px; }
}
`;

// ─── Page wrapper ───

export default function DashboardPage() {
  return (
    <Suspense>
      <style dangerouslySetInnerHTML={{ __html: DASHBOARD_CSS }} />
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap"
        rel="stylesheet"
      />
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
  const [activeTab, setActiveTab] = useState<"agents" | "chat">("agents");

  // Chat state
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detail modal
  const [detailAgent, setDetailAgent] = useState<Agent | null>(null);

  // Transition animation state
  const [killingAgents, setKillingAgents] = useState<Set<string>>(new Set());
  const [revivingAgents, setRevivingAgents] = useState<Set<string>>(new Set());

  // New Agent modal
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentPrompt, setNewAgentPrompt] = useState("");
  const [newAgentModel, setNewAgentModel] = useState("claude-sonnet-4-20250514");
  const [newAgentBudget, setNewAgentBudget] = useState("5.00");
  const [creatingAgent, setCreatingAgent] = useState(false);

  const loadAgents = useCallback(async () => {
    try {
      const ensureRes = await fetch("/api/council/ensure", { method: "POST" });
      if (!ensureRes.ok) {
        const errData = await ensureRes.json().catch(() => ({}));
        console.error("[dashboard] Ensure failed:", ensureRes.status, errData);
      }
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

  // Auto-resize textarea
  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setChatInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }

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

  function openChat(agent: Agent) {
    setChatAgent(agent);
    setChatMessages([]);
    setChatInput("");
    setChatOpen(true);
    setDetailAgent(null);
    // Focus textarea after sidebar renders
    setTimeout(() => textareaRef.current?.focus(), 300);
  }

  async function sendMessage() {
    if (!chatInput.trim() || !chatAgent || chatLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const allMessages = [...chatMessages, userMsg];
    setChatMessages(allMessages);
    setChatInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
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

      // Gateway returns Anthropic-style: content is array of blocks [{type, text}]
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
        {
          role: "assistant",
          content: assistantContent,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          layers: data.layers_enforced,
          signature: data.metta_signature,
        },
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
    setKillingAgents((prev) => new Set(prev).add(agent.id));
    try {
      await fetch(`/api/agents/${agent.id}/kill`, { method: "POST" });
      setTimeout(() => {
        setAgents((prev) =>
          prev.map((a) => (a.id === agent.id ? { ...a, status: "terminated" } : a)),
        );
        setKillingAgents((prev) => { const n = new Set(prev); n.delete(agent.id); return n; });
        if (detailAgent?.id === agent.id) setDetailAgent({ ...agent, status: "terminated" });
      }, 600);
    } catch {
      setError("Failed to terminate agent");
      setKillingAgents((prev) => { const n = new Set(prev); n.delete(agent.id); return n; });
    }
  }

  async function handleRevive(agent: Agent) {
    setRevivingAgents((prev) => new Set(prev).add(agent.id));
    try {
      await fetch(`/api/agents/${agent.id}/revive`, { method: "POST" });
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, status: "active" } : a)),
      );
      if (detailAgent?.id === agent.id) setDetailAgent({ ...agent, status: "active" });
      setTimeout(() => {
        setRevivingAgents((prev) => { const n = new Set(prev); n.delete(agent.id); return n; });
      }, 2500);
    } catch {
      setError("Failed to revive agent");
      setRevivingAgents((prev) => { const n = new Set(prev); n.delete(agent.id); return n; });
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

  // ─── Auth gates ───

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="ss-dash" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 16, padding: 48, maxWidth: 420, width: "100%", animation: "fadeInUp 0.6s ease-out" }}>
          <Image src="/images/oracle.gif" alt="Sutra" width={80} height={80} style={{ borderRadius: "50%", border: "2px solid var(--purple)", boxShadow: "0 0 30px rgba(124,58,237,0.3)", marginBottom: 24 }} />
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome to Sutra</h2>
          <p style={{ color: "var(--gray)", fontSize: 14, marginBottom: 32 }}>
            15 specialized agents. One principled answer.
          </p>
          <SignInButton mode="modal">
            <button className="btn-ss btn-primary-ss" style={{ width: "100%", justifyContent: "center", padding: "14px 32px", fontSize: 15, borderRadius: 8 }}>
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // ─── First visit — no agents ───

  if (!loading && agents.length === 0) {
    return (
      <div className="ss-dash" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center", maxWidth: 500 }}>
          <Image src="/images/oracle.gif" alt="Sutra" width={120} height={120} style={{ borderRadius: "50%", border: "2px solid var(--purple)", boxShadow: "0 0 40px rgba(124,58,237,0.3)", marginBottom: 24 }} />
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Meet Sutra</h1>
          <p style={{ color: "var(--gray)", fontSize: 16, marginBottom: 6 }}>Your AI council of 15 specialized agents</p>
          <p style={{ color: "var(--gray-dim)", fontSize: 14, marginBottom: 32 }}>
            8 Rights agents grounded in the Noble Eightfold Path. 6 domain experts.
            Sutra — the ethics analyst who synthesizes every perspective into principled guidance.
          </p>
          {error && (
            <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "var(--red)" }}>
              {error}
            </div>
          )}
          <button onClick={handleSetup} disabled={setting} className="btn-ss btn-primary-ss" style={{ padding: "14px 32px", fontSize: 15, borderRadius: 8 }}>
            {setting ? "Setting up..." : "Set Up My Council"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading ───

  if (loading) {
    return (
      <div className="ss-dash" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--gray)" }}>
          <div style={{ width: 20, height: 20, border: "2px solid var(--card-border)", borderTopColor: "var(--purple)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
          Loading your team...
        </div>
      </div>
    );
  }

  // ─── Agent categorization ───
  const activeCount = agents.filter((a) => a.status === "active").length;
  const terminatedCount = agents.filter((a) => a.status === "terminated").length;
  const sutraAgent = agents.find((a) => a.council_role === "synthesis");
  const totalBudget = agents.reduce((sum, a) => sum + (a.monthly_budget_usd || 0), 0);
  const totalSpend = agents.reduce((sum, a) => sum + (a.current_month_spend || 0), 0);
  const activePct = agents.length ? (activeCount / agents.length) * 100 : 0;
  const termPct = agents.length ? (terminatedCount / agents.length) * 100 : 0;

  return (
    <div className="ss-dash" style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 40px 60px", position: "relative", zIndex: 1 }}>

        {/* Error banner */}
        {error && (
          <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{error}</span>
            <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 18, padding: "0 4px" }}>&times;</button>
          </div>
        )}

        {/* ── Overview Cards ── */}
        <div className="oc-grid">
          <div className="oc-card">
            <div className="oc-label">Agents</div>
            <div className="oc-value">{agents.length}</div>
            <div className="oc-sub">{activeCount} active, {terminatedCount} terminated</div>
            <div className="oc-minibar">
              <div className="seg-active" style={{ width: `${activePct}%` }} />
              <div className="seg-terminated" style={{ width: `${termPct}%` }} />
            </div>
            <div className="oc-legend">
              <span className="leg-active">{activeCount} active</span>
              <span className="leg-term">{terminatedCount} terminated</span>
            </div>
          </div>
          <div className="oc-card">
            <div className="oc-label">Monthly Budget</div>
            <div className="oc-value">${totalBudget.toFixed(0)}</div>
            <div className="oc-sub">${totalSpend.toFixed(2)} spent this month</div>
          </div>
          <div className="oc-card">
            <div className="oc-label">Council</div>
            <div className="oc-value">15</div>
            <div className="oc-sub">8 Rights + 6 Experts + Sutra</div>
          </div>
          <div className="oc-card">
            <div className="oc-label">Security</div>
            <div className="oc-value" style={{ color: "var(--green)" }}>8 layers</div>
            <div className="oc-sub">Ed25519 signed &middot; All audited</div>
          </div>
        </div>

        {/* ── Ask Sutra Quick Action ── */}
        {sutraAgent && (
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => openChat(sutraAgent)} className="btn-ss btn-primary-ss" style={{ padding: "10px 24px", fontSize: 14 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Ask Sutra
            </button>
            <Link href="/connect" className="btn-ss btn-chat" style={{ textDecoration: "none", padding: "10px 24px", fontSize: 14 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              Voice Session
            </Link>
          </div>
        )}

        {/* ── Tab Bar ── */}
        <div className="ss-tab-bar">
          <button className={`ss-tab-btn ${activeTab === "agents" ? "active" : ""}`} onClick={() => setActiveTab("agents")}>
            Agents
          </button>
          <button className={`ss-tab-btn ${activeTab === "chat" ? "active" : ""}`} onClick={() => { setActiveTab("chat"); if (sutraAgent && !chatAgent) openChat(sutraAgent); }}>
            Chat
          </button>
        </div>

        {/* ── Agents Tab ── */}
        {activeTab === "agents" && (
          <div style={{ animation: "fadeInUp 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Agents</h3>
              <button onClick={() => setShowNewAgent(true)} className="btn-ss btn-primary-ss" style={{ padding: "8px 18px", fontSize: 13 }}>
                + New Agent
              </button>
            </div>

            <div className="agent-grid">
              {agents.map((agent, i) => {
                const color = getAgentColor(agent);
                const initials = getAgentInitials(agent);
                const designation = getAgentDesignation(agent);
                const isActive = agent.status === "active";
                const isSutra = agent.council_role === "synthesis";
                const hasVoice = !!agent.tts_voice_name;
                const isKilling = killingAgents.has(agent.id);
                const isReviving = revivingAgents.has(agent.id);
                const isUserAgent = !isCouncilAgent(agent);
                const budgetPct = agent.monthly_budget_usd ? Math.min(100, (agent.current_month_spend / agent.monthly_budget_usd) * 100) : 0;
                const budgetClass = budgetPct > 90 ? "danger" : budgetPct > 70 ? "warning" : "";

                return (
                  <div
                    key={agent.id}
                    className={`agent-card ${
                      isKilling ? "death-shake" : isReviving ? "revive-flash" :
                      isSutra ? "glow-sutra" :
                      isActive ? "glow-active" : "glow-terminated"
                    }`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                    onClick={() => setDetailAgent(agent)}
                  >
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Avatar */}
                        <div style={{
                          width: 48, height: 48, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 700,
                          backgroundColor: color + "25", color,
                          flexShrink: 0,
                        }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>
                            {agent.persona_name || agent.name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--gray-dim)", marginTop: 2 }}>
                            {designation}
                          </div>
                        </div>
                      </div>
                      {/* Status */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontFamily: "var(--font-geist-mono), monospace" }}>
                        {isReviving ? (
                          <>
                            <span className="agent-state-icon reviving">&#9889;</span>
                            <span style={{ color: "var(--gold)", letterSpacing: 0.5 }}>REVIVING</span>
                          </>
                        ) : isKilling ? (
                          <>
                            <span className="agent-state-icon">&#128128;</span>
                            <span style={{ color: "var(--red)", letterSpacing: 0.5 }}>KILLED</span>
                          </>
                        ) : isActive ? (
                          <>
                            <span className="agent-state-icon pulse-heart">&#10084;&#65039;</span>
                            <span style={{ color: "var(--green)", letterSpacing: 0.5 }}>ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <span className="agent-state-icon">&#128128;</span>
                            <span style={{ color: "var(--red)", letterSpacing: 0.5 }}>TERMINATED</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Meta row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                      <div>
                        <div style={{ color: "var(--gray-dim)", fontFamily: "var(--font-geist-mono), monospace", fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>Model</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{agent.model ? agent.model.replace("claude-", "").split("-202")[0] : "—"}</div>
                      </div>
                      <div>
                        <div style={{ color: "var(--gray-dim)", fontFamily: "var(--font-geist-mono), monospace", fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>Budget</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="budget-bar">
                            <div className={`budget-bar-fill ${budgetClass}`} style={{ width: `${budgetPct}%` }} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>${agent.current_month_spend?.toFixed(2) || "0.00"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Voice indicator */}
                    {hasVoice && (
                      <div style={{ fontSize: 11, color: "var(--gray-dim)", marginBottom: 12 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                        {agent.tts_voice_name}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--card-border)", paddingTop: 12, flexWrap: "wrap" }}>
                      <button onClick={(e) => { e.stopPropagation(); openChat(agent); }} className="btn-ss btn-chat">
                        Chat
                      </button>
                      {isUserAgent && isActive && (
                        <button onClick={(e) => { e.stopPropagation(); handleKill(agent); }} className="btn-ss btn-kill">
                          Terminate
                        </button>
                      )}
                      {isUserAgent && !isActive && !isKilling && (
                        <button onClick={(e) => { e.stopPropagation(); handleRevive(agent); }} className="btn-ss btn-revive">
                          Revive
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Chat Tab (shows sidebar inline if no agent selected) ── */}
        {activeTab === "chat" && !chatOpen && (
          <div style={{ animation: "fadeInUp 0.3s ease", textAlign: "center", padding: 48, color: "var(--gray)" }}>
            <p style={{ marginBottom: 16, fontSize: 15 }}>Select an agent to start chatting</p>
            {sutraAgent && (
              <button onClick={() => openChat(sutraAgent)} className="btn-ss btn-primary-ss" style={{ padding: "12px 28px", fontSize: 14 }}>
                Ask Sutra
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {detailAgent && (
        <div className="ss-modal-overlay" onClick={() => setDetailAgent(null)}>
          <div className="ss-modal" onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
            <button onClick={() => setDetailAgent(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--gray)", fontSize: 20, cursor: "pointer" }}>
              &times;
            </button>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700,
                backgroundColor: getAgentColor(detailAgent) + "25",
                color: getAgentColor(detailAgent),
              }}>
                {getAgentInitials(detailAgent)}
              </div>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
                  {detailAgent.persona_name || detailAgent.name}
                </h3>
                <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 2 }}>
                  {detailAgent.persona_designation || getAgentDesignation(detailAgent)}
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div style={{ marginBottom: 20 }}>
              {detailAgent.status === "active" ? (
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 11, letterSpacing: 1, padding: "3px 10px", borderRadius: 100, background: "rgba(5,150,105,0.15)", color: "var(--green)", textTransform: "uppercase" }}>
                  <span className="agent-state-icon pulse-heart" style={{ fontSize: 12 }}>&#10084;&#65039;</span> Active
                </span>
              ) : (
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 11, letterSpacing: 1, padding: "3px 10px", borderRadius: 100, background: "rgba(220,38,38,0.1)", color: "var(--red)", textTransform: "uppercase" }}>
                  &#128128; Terminated
                </span>
              )}
            </div>

            {/* Detail rows */}
            <div style={{ marginBottom: 24 }}>
              {detailAgent.origin_narrative && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--card-border)", fontSize: 14 }}>
                  <span style={{ color: "var(--gray)" }}>Origin</span>
                  <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 12, maxWidth: "60%", textAlign: "right" }}>{detailAgent.origin_narrative.slice(0, 120)}...</span>
                </div>
              )}
              {detailAgent.voice_tone && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--card-border)", fontSize: 14 }}>
                  <span style={{ color: "var(--gray)" }}>Voice Tone</span>
                  <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 13 }}>{detailAgent.voice_tone}</span>
                </div>
              )}
              {detailAgent.value_framework_primary && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--card-border)", fontSize: 14 }}>
                  <span style={{ color: "var(--gray)" }}>Value Framework</span>
                  <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 13 }}>{detailAgent.value_framework_primary}</span>
                </div>
              )}
              {detailAgent.eightfold_path_aspect && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--card-border)", fontSize: 14 }}>
                  <span style={{ color: "var(--gray)" }}>Eightfold Path</span>
                  <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 13 }}>{detailAgent.eightfold_path_aspect}</span>
                </div>
              )}
              {detailAgent.tts_voice_name && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--card-border)", fontSize: 14 }}>
                  <span style={{ color: "var(--gray)" }}>TTS Voice</span>
                  <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 13 }}>{detailAgent.tts_voice_name} ({detailAgent.tts_provider})</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--card-border)", fontSize: 14 }}>
                <span style={{ color: "var(--gray)" }}>Model</span>
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 13 }}>{detailAgent.model || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: 14 }}>
                <span style={{ color: "var(--gray)" }}>Budget</span>
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 13 }}>${detailAgent.current_month_spend?.toFixed(2) || "0.00"} / ${detailAgent.monthly_budget_usd?.toFixed(2) || "0.00"}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => { setDetailAgent(null); openChat(detailAgent); }} className="btn-ss btn-chat" style={{ padding: "10px 24px", fontSize: 14 }}>
                Chat with {detailAgent.persona_name || detailAgent.name}
              </button>
              {!isCouncilAgent(detailAgent) && detailAgent.status === "active" && (
                <button onClick={() => handleKill(detailAgent)} className="btn-ss btn-kill" style={{ padding: "10px 24px", fontSize: 14 }}>
                  Terminate
                </button>
              )}
              {!isCouncilAgent(detailAgent) && detailAgent.status === "terminated" && (
                <button onClick={() => handleRevive(detailAgent)} className="btn-ss btn-revive" style={{ padding: "10px 24px", fontSize: 14 }}>
                  Revive
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Sidebar ── */}
      {chatOpen && chatAgent && (
        <>
          <div className="chat-backdrop" onClick={() => setChatOpen(false)} />
          <div className="chat-sidebar">
            <div className="chat-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                <div className="chat-sender-avatar" style={{ width: 32, height: 32, fontSize: 12, backgroundColor: getAgentColor(chatAgent) + "30", color: getAgentColor(chatAgent) }}>
                  {getAgentInitials(chatAgent)}
                </div>
                <h3 style={{ color: "var(--white)" }}>{chatAgent.persona_name || chatAgent.name}</h3>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "var(--gray)", cursor: "pointer", fontSize: 22, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                &times;
              </button>
            </div>

            <div className="chat-messages-area">
              {chatMessages.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--gray-dim)", fontSize: 14, marginTop: 32 }}>
                  Send a message to chat with {chatAgent.persona_name || chatAgent.name}
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className="chat-msg-wrap">
                  {msg.role === "assistant" && (
                    <div className="chat-sender-header">
                      <div className="chat-sender-avatar" style={{ backgroundColor: getAgentColor(chatAgent), color: "white" }}>
                        {getAgentInitials(chatAgent)}
                      </div>
                      <span className="chat-sender-name">{chatAgent.persona_name || chatAgent.name}</span>
                    </div>
                  )}
                  <div className={`chat-msg ${msg.role}`}>
                    {msg.content}
                    {/* Layer badges for assistant messages */}
                    {msg.role === "assistant" && msg.layers && msg.layers.length > 0 && (
                      <div className="chat-meta">
                        {msg.layers.map((layer, li) => (
                          <span key={li} className={`layer-badge ${layer.toLowerCase()}`}>{layer}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.timestamp && (
                    <div style={{ fontSize: 10, color: "var(--gray-dim)", fontFamily: "var(--font-geist-mono), monospace", marginTop: 2, paddingLeft: msg.role === "user" ? 0 : 4, textAlign: msg.role === "user" ? "right" : "left" }}>
                      {msg.timestamp}
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="chat-typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-bar">
              <textarea
                ref={textareaRef}
                value={chatInput}
                onChange={handleTextareaInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Message ${chatAgent.persona_name || chatAgent.name}...`}
                disabled={chatLoading}
                rows={1}
              />
              <button onClick={sendMessage} disabled={chatLoading || !chatInput.trim()} className="chat-send-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── New Agent Modal ── */}
      {showNewAgent && (
        <div className="ss-modal-overlay" onClick={() => setShowNewAgent(false)}>
          <div className="ss-modal" onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
            <button onClick={() => setShowNewAgent(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--gray)", fontSize: 20, cursor: "pointer" }}>
              &times;
            </button>

            <h3>Create Agent</h3>
            <p>Deploy a new AI agent with its own budget, model, and personality.</p>

            <input
              type="text"
              className="ss-input"
              placeholder="Agent name"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
            />
            <textarea
              className="ss-input"
              placeholder="System prompt — describe the agent's role, personality, and expertise..."
              value={newAgentPrompt}
              onChange={(e) => setNewAgentPrompt(e.target.value)}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <select className="ss-input" value={newAgentModel} onChange={(e) => setNewAgentModel(e.target.value)}>
                <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
                <option value="claude-opus-4-6">Claude Opus 4.6</option>
              </select>
              <input
                type="number"
                className="ss-input"
                placeholder="Monthly budget (USD)"
                value={newAgentBudget}
                onChange={(e) => setNewAgentBudget(e.target.value)}
                min="0"
                step="0.50"
              />
            </div>

            <div className="ss-modal-actions">
              <button onClick={() => setShowNewAgent(false)} className="btn-ss" style={{ background: "transparent", color: "var(--gray)", borderColor: "var(--card-border)" }}>
                Cancel
              </button>
              <button
                onClick={handleCreateAgent}
                disabled={creatingAgent || !newAgentName.trim() || !newAgentPrompt.trim()}
                className="btn-ss btn-primary-ss"
                style={{ padding: "10px 28px", fontSize: 14, opacity: (!newAgentName.trim() || !newAgentPrompt.trim()) ? 0.5 : 1 }}
              >
                {creatingAgent ? "Creating..." : "Create Agent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
