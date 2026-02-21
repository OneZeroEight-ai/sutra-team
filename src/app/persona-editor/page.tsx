"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ─── Types ───────────────────────────────────────────────
interface AgentData {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string | null;
  status: string;
  provider: string;
  model: string | null;
  monthly_budget_usd: number;
  installed_skills: string[];
  llm_base_url: string | null;
  persona_name: string | null;
  persona_designation: string | null;
  origin_narrative: string | null;
  voice_tone: string | null;
  voice_avoidances: string | null;
  voice_opening_pattern: string | null;
  voice_closing_pattern: string | null;
  platform_adaptations: Record<string, string> | null;
  knowledge_sources: string[] | null;
  knowledge_documents: { name: string; type: string; url?: string }[] | null;
  domain_expertise: { domain: string; depth: string }[] | null;
  memory_enabled: boolean;
  memory_tiers: string[] | null;
  memory_retention_days: number | null;
  value_framework_primary: string | null;
  value_framework_secondary: string | null;
  value_principles: string[] | null;
  value_conflict_protocol: string | null;
  uncertainty_expression: string | null;
  tts_provider: string | null;
  tts_voice_id: string | null;
  tts_voice_name: string | null;
  tts_model: string | null;
  stt_provider: string | null;
  stt_model: string | null;
  voice_speed: number;
  voice_language: string | null;
  conference_group: string[] | null;
  council_type: string | null;
  council_role: string | null;
  eightfold_path_aspect: string | null;
  synthesis_weight: number;
  differentiation_statement: string | null;
  differentiation_examples: { question: string; answer: string }[] | null;
  hardcoded_limits: string[] | null;
  softcoded_defaults: { rule: string; override: string }[] | null;
  escalation_protocol: string | null;
}

interface AgentSummary {
  id: string;
  name: string;
  persona_name: string | null;
  status: string;
}

type TabId = "identity" | "knowledge" | "memory" | "values" | "capabilities" | "differentiation";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "identity", label: "Identity", icon: "\uD83C\uDFAD" },
  { id: "knowledge", label: "Knowledge", icon: "\uD83D\uDCDA" },
  { id: "memory", label: "Memory", icon: "\uD83E\uDDE0" },
  { id: "values", label: "Values", icon: "\u2696\uFE0F" },
  { id: "capabilities", label: "Capabilities", icon: "\u2699\uFE0F" },
  { id: "differentiation", label: "Differentiation", icon: "\uD83C\uDF1F" },
];

// ─── Skills Data ─────────────────────────────────────────
const SKILL_TIERS: { tier: string; skills: { slug: string; name: string }[] }[] = [
  {
    tier: "Tier 1 \u2014 Utility",
    skills: [
      { slug: "text-summarizer", name: "Text Summarizer" },
      { slug: "sentiment-analyzer", name: "Sentiment Analyzer" },
      { slug: "json-formatter", name: "JSON Formatter" },
      { slug: "prompt-template-engine", name: "Prompt Template Engine" },
      { slug: "response-validator", name: "Response Validator" },
      { slug: "content-classifier", name: "Content Classifier" },
      { slug: "markdown-stripper", name: "Markdown Stripper" },
      { slug: "token-counter", name: "Token Counter" },
    ],
  },
  {
    tier: "Tier 2 \u2014 Integration",
    skills: [
      { slug: "web-fetcher", name: "Web Fetcher" },
      { slug: "code-executor", name: "Sandboxed Code Executor" },
      { slug: "file-reader", name: "File Reader" },
      { slug: "memory-store", name: "Agent Memory Store" },
      { slug: "email-sender", name: "Email Sender" },
      { slug: "zoom-scheduler", name: "Zoom Scheduler" },
      { slug: "moltbook", name: "Moltbook" },
    ],
  },
  {
    tier: "Tier 3 \u2014 Security",
    skills: [
      { slug: "secret-scanner", name: "Secret Scanner" },
      { slug: "pii-redactor", name: "PII Redactor" },
      { slug: "prompt-guard", name: "Prompt Guard" },
      { slug: "cost-estimator", name: "Cost Estimator" },
      { slug: "audit-report", name: "Audit Report Generator" },
    ],
  },
  {
    tier: "Tier 4 \u2014 Orchestration",
    skills: [
      { slug: "conversation-compressor", name: "Conversation Compressor" },
      { slug: "output-schema-enforcer", name: "Output Schema Enforcer" },
      { slug: "intent-router", name: "Intent Router" },
      { slug: "skill-chain", name: "Skill Chain Orchestrator" },
      { slug: "council-deliberation", name: "Council Deliberation" },
    ],
  },
  {
    tier: "Tier 5 \u2014 Production",
    skills: [
      { slug: "retry-engine", name: "Retry Engine" },
      { slug: "response-cache", name: "Response Cache" },
      { slug: "data-transformer", name: "Data Transformer" },
      { slug: "structured-logger", name: "Structured Logger" },
      { slug: "eval-harness", name: "Eval Harness" },
      { slug: "usage-tracker", name: "Usage Tracker" },
      { slug: "health-monitor", name: "Health Monitor" },
    ],
  },
];

const MODEL_GROUPS = [
  {
    label: "Cloud",
    models: [
      { value: "claude-sonnet-4-5-20250929", label: "Claude Sonnet 4.5", provider: "anthropic" },
      { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", provider: "anthropic" },
      { value: "gpt-4o", label: "GPT-4o", provider: "openai" },
      { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "google" },
    ],
  },
  {
    label: "Local / Self-Hosted",
    models: [
      { value: "ollama:custom", label: "Ollama (custom)", provider: "ollama" },
      { value: "lmstudio:custom", label: "LM Studio", provider: "lmstudio" },
      { value: "vllm:custom", label: "vLLM", provider: "vllm" },
      { value: "custom:custom", label: "Custom Endpoint", provider: "custom" },
    ],
  },
];

const LOCAL_PROVIDERS = new Set(["ollama", "lmstudio", "vllm", "custom"]);

const VOICE_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
  { value: "ko", label: "Korean" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italian" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "ru", label: "Russian" },
];

// ─── Main Export ─────────────────────────────────────────
export default function PersonaEditorPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PersonaEditorContent />
    </Suspense>
  );
}

// ─── Skeleton Loader ─────────────────────────────────────
function PageSkeleton() {
  return (
    <div style={{ ...S.page, padding: "32px 40px" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        {[120, 100, 90, 80, 120, 140].map((w, i) => (
          <div key={i} style={{ ...S.skeleton, width: w, height: 36 }} />
        ))}
      </div>
      <div style={{ ...S.skeleton, height: 44, marginBottom: 24, width: 300 }} />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div style={{ ...S.skeleton, height: 14, width: 100, marginBottom: 8 }} />
          <div style={{ ...S.skeleton, height: 42, width: "100%" }} />
        </div>
      ))}
    </div>
  );
}

// ─── Editor Content ──────────────────────────────────────
function PersonaEditorContent() {
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId");

  const [agent, setAgent] = useState<AgentData | null>(null);
  const [form, setForm] = useState<Partial<AgentData>>({});
  const [allAgents, setAllAgents] = useState<AgentSummary[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [activeTab, setActiveTab] = useState<TabId>("identity");
  const [showTestModal, setShowTestModal] = useState(false);

  const showToast = useCallback((msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3500);
  }, []);

  // Load agent + all agents list
  useEffect(() => {
    if (!isSignedIn) return;
    // Load all agents for conference group selector
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => setAllAgents(d.agents || []))
      .catch(() => {});

    if (!agentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/agents/${agentId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load agent");
        return r.json();
      })
      .then((data) => {
        setAgent(data.agent);
        setForm(data.agent);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [agentId, isSignedIn]);

  const updateField = useCallback((field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }, []);

  // ── Save ──
  const handleSave = useCallback(async () => {
    if (!agentId || !dirty) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || "Save failed");
      }
      const data = await res.json();
      setAgent(data.agent);
      setForm(data.agent);
      setDirty(false);
      showToast("Persona saved successfully");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }, [agentId, dirty, form, showToast]);

  // ── Export PMF ──
  const handleExport = useCallback(() => {
    const pmf = {
      format: "portable-mind-format",
      version: "1.0",
      exported_at: new Date().toISOString(),
      exported_from: "sutra.team",
      agent_name: form.name || "unnamed",
      layers: {
        identity: {
          persona_name: form.persona_name,
          persona_designation: form.persona_designation,
          origin_narrative: form.origin_narrative,
          voice_tone: form.voice_tone,
          voice_avoidances: form.voice_avoidances,
          voice_opening_pattern: form.voice_opening_pattern,
          voice_closing_pattern: form.voice_closing_pattern,
          platform_adaptations: form.platform_adaptations,
        },
        knowledge: {
          domain_expertise: form.domain_expertise,
          knowledge_sources: form.knowledge_sources,
          knowledge_documents: form.knowledge_documents,
        },
        memory: {
          memory_enabled: form.memory_enabled,
          memory_tiers: form.memory_tiers,
          memory_retention_days: form.memory_retention_days,
        },
        values: {
          value_framework_primary: form.value_framework_primary,
          value_framework_secondary: form.value_framework_secondary,
          value_principles: form.value_principles,
          value_conflict_protocol: form.value_conflict_protocol,
          uncertainty_expression: form.uncertainty_expression,
        },
        capabilities: {
          model: form.model,
          provider: form.provider,
          monthly_budget_usd: form.monthly_budget_usd,
          installed_skills: form.installed_skills,
          conference_group: form.conference_group,
          llm_base_url: form.llm_base_url,
          voice_config: {
            tts_provider: form.tts_provider,
            tts_voice_id: form.tts_voice_id,
            tts_voice_name: form.tts_voice_name,
            voice_speed: form.voice_speed,
            voice_language: form.voice_language,
          },
        },
        differentiation: {
          differentiation_statement: form.differentiation_statement,
          differentiation_examples: form.differentiation_examples,
          hardcoded_limits: form.hardcoded_limits,
          softcoded_defaults: form.softcoded_defaults,
          escalation_protocol: form.escalation_protocol,
        },
      },
    };
    const blob = new Blob([JSON.stringify(pmf, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(form.persona_name || form.name || "agent").toLowerCase().replace(/\s+/g, "-")}.pmf`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported as .pmf", "info");
  }, [form, showToast]);

  // ── Import PMF ──
  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pmf,.json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.format === "portable-mind-format" && data.layers) {
          // PMF format — flatten layers into form fields
          const l = data.layers;
          setForm((prev) => ({
            ...prev,
            ...l.identity,
            ...l.knowledge,
            ...l.memory,
            ...l.values,
            model: l.capabilities?.model,
            provider: l.capabilities?.provider,
            monthly_budget_usd: l.capabilities?.monthly_budget_usd,
            installed_skills: l.capabilities?.installed_skills,
            conference_group: l.capabilities?.conference_group,
            llm_base_url: l.capabilities?.llm_base_url,
            tts_provider: l.capabilities?.voice_config?.tts_provider,
            tts_voice_id: l.capabilities?.voice_config?.tts_voice_id,
            tts_voice_name: l.capabilities?.voice_config?.tts_voice_name,
            voice_speed: l.capabilities?.voice_config?.voice_speed,
            voice_language: l.capabilities?.voice_config?.voice_language,
            ...l.differentiation,
          }));
          setDirty(true);
          showToast(`Imported from ${file.name}`, "info");
        } else {
          // Raw agent JSON — merge directly
          setForm((prev) => ({ ...prev, ...data }));
          setDirty(true);
          showToast(`Imported from ${file.name}`, "info");
        }
      } catch {
        showToast("Invalid file format", "error");
      }
    };
    input.click();
  }, [showToast]);

  // ── Save as Template ──
  const handleSaveAsTemplate = useCallback(() => {
    const name = prompt("Template name:", form.persona_name || form.name || "My Template");
    if (!name) return;
    const templates = JSON.parse(localStorage.getItem("pmf-templates") || "[]");
    templates.push({
      id: `tmpl-${Date.now()}`,
      name,
      created: new Date().toISOString(),
      data: form,
    });
    localStorage.setItem("pmf-templates", JSON.stringify(templates));
    showToast(`Saved template "${name}"`, "info");
  }, [form, showToast]);

  // ── Keyboard shortcut ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  // ─── Render ────────────────────────────────────────────
  if (!isSignedIn) {
    return (
      <div style={S.page}>
        <div style={S.emptyState}>Please sign in to access the Persona Editor.</div>
      </div>
    );
  }

  if (!agentId) {
    return (
      <div style={S.page}>
        <div style={S.emptyState}>
          No agent selected. Go to the{" "}
          <a href="/dashboard" style={{ color: "#a78bfa", textDecoration: "none" }}>dashboard</a>{" "}
          and click &ldquo;Edit Persona&rdquo; on an agent.
        </div>
      </div>
    );
  }

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div style={S.page}>
        <div style={{ ...S.emptyState, color: "#ef4444" }}>{error}</div>
      </div>
    );
  }

  const agentInitial = (form.persona_name || form.name || "A").charAt(0).toUpperCase();

  return (
    <div style={S.page}>
      {/* ── Breadcrumb + Header ── */}
      <div style={S.breadcrumb}>
        <a href="/dashboard" style={S.breadcrumbLink}>Dashboard</a>
        <span style={S.breadcrumbSep}>/</span>
        <span style={S.breadcrumbCurrent}>Persona Editor</span>
        <span style={S.breadcrumbSep}>/</span>
        <span style={S.breadcrumbCurrent}>{form.persona_name || form.name || "Agent"}</span>
      </div>

      <div style={S.headerRow}>
        <div style={S.headerLeft}>
          <div style={S.avatar}>{agentInitial}</div>
          <div>
            <h1 style={S.agentName}>{form.persona_name || form.name || "Unnamed Agent"}</h1>
            <p style={S.agentDesignation}>{form.persona_designation || "No designation set"}</p>
          </div>
        </div>
        <div style={S.toolbar}>
          <button onClick={handleImport} style={S.btnGhost} title="Import .pmf file">
            Import .pmf
          </button>
          <button onClick={handleExport} style={S.btnGhost} title="Export as .pmf">
            Export .pmf
          </button>
          <button onClick={() => setShowTestModal(true)} style={S.btnGhost} title="Test agent response">
            Test Response
          </button>
          <button onClick={handleSaveAsTemplate} style={S.btnGhost} title="Save as reusable template">
            Save as Template
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            style={{
              ...S.btnPrimary,
              opacity: !dirty || saving ? 0.5 : 1,
            }}
          >
            {saving ? "Saving\u2026" : "Save"}
            {dirty && !saving && <span style={S.dirtyDot} />}
          </button>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={S.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...S.tab,
              ...(activeTab === tab.id ? S.tabActive : {}),
            }}
          >
            <span style={{ marginRight: 6 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={S.panel}>
        {activeTab === "identity" && <IdentityTab form={form} updateField={updateField} />}
        {activeTab === "knowledge" && <KnowledgeTab form={form} updateField={updateField} />}
        {activeTab === "memory" && <MemoryTab form={form} updateField={updateField} />}
        {activeTab === "values" && <ValuesTab form={form} updateField={updateField} />}
        {activeTab === "capabilities" && (
          <CapabilitiesTab form={form} updateField={updateField} allAgents={allAgents} currentAgentId={agentId} />
        )}
        {activeTab === "differentiation" && <DifferentiationTab form={form} updateField={updateField} />}
      </div>

      {/* ── Toast ── */}
      {toastMsg && (
        <div style={{
          ...S.toast,
          borderColor: toastType === "error" ? "rgba(239,68,68,0.3)" : toastType === "info" ? "rgba(96,165,250,0.3)" : "rgba(34,197,94,0.3)",
        }}>
          <span style={{ marginRight: 8 }}>
            {toastType === "error" ? "\u274C" : toastType === "info" ? "\u2139\uFE0F" : "\u2705"}
          </span>
          {toastMsg}
        </div>
      )}

      {/* ── Test Response Modal ── */}
      {showTestModal && (
        <TestResponseModal
          agentId={agentId}
          agentName={form.persona_name || form.name || "Agent"}
          onClose={() => setShowTestModal(false)}
        />
      )}
    </div>
  );
}

// ─── Tab Props ────────────────────────────────────────────
interface TabProps {
  form: Partial<AgentData>;
  updateField: (field: string, value: unknown) => void;
}

// ═══════════════════════════════════════════════════════════
// TAB 1: IDENTITY
// ═══════════════════════════════════════════════════════════
function IdentityTab({ form, updateField }: TabProps) {
  const adaptations = form.platform_adaptations || {};
  const adaptEntries = Object.entries(adaptations);

  return (
    <div>
      <SectionHeading text="Core Identity" />
      <div style={S.grid2}>
        <FG label="Persona Name" hint="What should this agent be called?">
          <Input value={form.persona_name || ""} onChange={(v) => updateField("persona_name", v)} placeholder="e.g. Aria, Marcus, The Analyst" />
        </FG>
        <FG label="Designation" hint="One-line role description">
          <Input value={form.persona_designation || ""} onChange={(v) => updateField("persona_designation", v)} placeholder="e.g. Senior Research Analyst" />
        </FG>
      </div>
      <FG label="Origin Narrative" hint="Why does this agent exist? What's its story?">
        <Textarea value={form.origin_narrative || ""} onChange={(v) => updateField("origin_narrative", v)} placeholder="Describe this agent's background, experience, and what shaped their worldview..." rows={4} />
      </FG>

      <SectionHeading text="Voice" />
      <FG label="Voice Tone" hint="Comma-separated: direct, warm, analytical">
        <Input value={form.voice_tone || ""} onChange={(v) => updateField("voice_tone", v)} placeholder="e.g. warm, direct, professional, witty" />
      </FG>
      <FG label="Voice Avoidances" hint="Phrases or patterns this agent should never use">
        <Textarea value={form.voice_avoidances || ""} onChange={(v) => updateField("voice_avoidances", v)} placeholder="e.g. Never use 'synergy', avoid exclamation marks, don't say 'as an AI'..." rows={3} />
      </FG>
      <div style={S.grid2}>
        <FG label="Opening Pattern" hint="How does this agent start responses?">
          <Input value={form.voice_opening_pattern || ""} onChange={(v) => updateField("voice_opening_pattern", v)} placeholder="e.g. Greet by name, then context" />
        </FG>
        <FG label="Closing Pattern" hint="Signature closing element">
          <Input value={form.voice_closing_pattern || ""} onChange={(v) => updateField("voice_closing_pattern", v)} placeholder='e.g. Summarize action items, then \uD83E\uDEB7' />
        </FG>
      </div>

      <SectionHeading text="Platform Adaptations" />
      <p style={S.sectionHint}>Adjust tone and style per platform</p>
      {adaptEntries.map(([platform, behavior], i) => (
        <div key={i} style={{ ...S.kvRow, marginBottom: 8 }}>
          <Input value={platform} onChange={(v) => {
            const next = { ...adaptations };
            const val = next[platform];
            delete next[platform];
            next[v] = val;
            updateField("platform_adaptations", next);
          }} placeholder="Platform" />
          <span style={{ color: "#3f3f46", fontSize: 18 }}>{"\u2192"}</span>
          <Input value={behavior} onChange={(v) => {
            updateField("platform_adaptations", { ...adaptations, [platform]: v });
          }} placeholder="Behavior description" />
          <button onClick={() => {
            const next = { ...adaptations };
            delete next[platform];
            updateField("platform_adaptations", next);
          }} style={S.btnRemove}>&times;</button>
        </div>
      ))}
      <button onClick={() => updateField("platform_adaptations", { ...adaptations, "": "" })} style={S.btnAdd}>+ Add Platform</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 2: KNOWLEDGE
// ═══════════════════════════════════════════════════════════
function KnowledgeTab({ form, updateField }: TabProps) {
  const expertise = (form.domain_expertise || []) as { domain: string; depth: string }[];
  const documents = (form.knowledge_documents || []) as { name: string; type: string; url?: string }[];

  return (
    <div>
      <SectionHeading text="Domain Expertise" />
      <p style={S.sectionHint}>Areas of knowledge with depth level</p>
      {expertise.map((item, i) => (
        <div key={i} style={{ ...S.kvRow, marginBottom: 8 }}>
          <div style={{ flex: 2 }}>
            <Input value={item.domain} onChange={(v) => {
              const next = [...expertise];
              next[i] = { ...next[i], domain: v };
              updateField("domain_expertise", next);
            }} placeholder="e.g. Contract Law" />
          </div>
          <select value={item.depth} onChange={(e) => {
            const next = [...expertise];
            next[i] = { ...next[i], depth: e.target.value };
            updateField("domain_expertise", next);
          }} style={{ ...S.selectInline, flex: 1 }}>
            <option value="novice">Novice</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
            <option value="authority">Authority</option>
          </select>
          <button onClick={() => updateField("domain_expertise", expertise.filter((_, j) => j !== i))} style={S.btnRemove}>&times;</button>
        </div>
      ))}
      <button onClick={() => updateField("domain_expertise", [...expertise, { domain: "", depth: "intermediate" }])} style={S.btnAdd}>+ Add Expertise</button>

      <SectionHeading text="Knowledge Sources" />
      <FG label="" hint="Approved sources this agent can reference. Type and press Enter.">
        <TagInput tags={(form.knowledge_sources || []) as string[]} onChange={(v) => updateField("knowledge_sources", v)} placeholder="e.g. SEC filings, legal databases, market research" />
      </FG>

      <SectionHeading text="Knowledge Documents" />
      <p style={S.sectionHint}>Reference documents this agent draws from</p>
      {documents.map((doc, i) => (
        <div key={i} style={{ ...S.kvRow, marginBottom: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 120 }}>
            <Input value={doc.name} onChange={(v) => {
              const next = [...documents];
              next[i] = { ...next[i], name: v };
              updateField("knowledge_documents", next);
            }} placeholder="Document name" />
          </div>
          <select value={doc.type} onChange={(e) => {
            const next = [...documents];
            next[i] = { ...next[i], type: e.target.value };
            updateField("knowledge_documents", next);
          }} style={{ ...S.selectInline, flex: 1, minWidth: 100 }}>
            <option value="reference">Reference</option>
            <option value="philosophy">Philosophy</option>
            <option value="technical">Technical</option>
            <option value="creative">Creative</option>
          </select>
          <div style={{ flex: 2, minWidth: 120 }}>
            <Input value={doc.url || ""} onChange={(v) => {
              const next = [...documents];
              next[i] = { ...next[i], url: v };
              updateField("knowledge_documents", next);
            }} placeholder="URL (optional)" />
          </div>
          <button onClick={() => updateField("knowledge_documents", documents.filter((_, j) => j !== i))} style={S.btnRemove}>&times;</button>
        </div>
      ))}
      <button onClick={() => updateField("knowledge_documents", [...documents, { name: "", type: "reference", url: "" }])} style={S.btnAdd}>+ Add Document</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 3: MEMORY
// ═══════════════════════════════════════════════════════════
function MemoryTab({ form, updateField }: TabProps) {
  const tiers = (form.memory_tiers || []) as string[];
  const memoryTierDefs = [
    { id: "session", label: "Session", desc: "Within one conversation" },
    { id: "interaction", label: "Interaction", desc: "Across conversations" },
    { id: "persona", label: "Persona", desc: "Agent's accumulated knowledge" },
    { id: "council", label: "Council", desc: "Shared with conference group" },
  ];

  return (
    <div>
      <SectionHeading text="Memory Configuration" />

      <FG label="Memory Enabled" hint="Allow this agent to retain information across interactions">
        <ToggleSwitch checked={form.memory_enabled !== false} onChange={(v) => updateField("memory_enabled", v)} label={form.memory_enabled !== false ? "Memory is ON" : "Memory is OFF"} />
      </FG>

      <FG label="Memory Tiers" hint="Which memory layers to activate">
        <div style={S.tierGrid}>
          {memoryTierDefs.map((t) => (
            <label key={t.id} style={S.tierCard}>
              <input type="checkbox" checked={tiers.includes(t.id)} onChange={(e) => {
                const next = e.target.checked ? [...tiers, t.id] : tiers.filter((x) => x !== t.id);
                updateField("memory_tiers", next);
              }} style={{ accentColor: "#a78bfa", width: 16, height: 16 }} />
              <div>
                <div style={{ fontWeight: 600, color: "#e4e4e7", fontSize: 14 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: "#71717a", marginTop: 2 }}>{t.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </FG>

      <FG label="Retention Period" hint="How many days to retain memories">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <input
            type="number" min={0}
            value={form.memory_retention_days ?? ""}
            onChange={(e) => updateField("memory_retention_days", e.target.value ? parseInt(e.target.value) : null)}
            placeholder="days"
            style={{ ...S.inputBase, width: 100 }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {[{ d: 7, l: "7 days" }, { d: 30, l: "30 days" }, { d: 90, l: "90 days" }, { d: 0, l: "Forever" }].map((p) => (
              <button key={p.d} onClick={() => updateField("memory_retention_days", p.d === 0 ? null : p.d)}
                style={{
                  ...S.presetBtn,
                  ...(form.memory_retention_days === p.d || (p.d === 0 && !form.memory_retention_days) ? S.presetBtnActive : {}),
                }}>
                {p.l}
              </button>
            ))}
          </div>
        </div>
      </FG>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 4: VALUES
// ═══════════════════════════════════════════════════════════
function ValuesTab({ form, updateField }: TabProps) {
  const principles = (form.value_principles || []) as string[];
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const next = [...principles];
    const [moved] = next.splice(dragItem.current, 1);
    next.splice(dragOver.current, 0, moved);
    updateField("value_principles", next);
    dragItem.current = null;
    dragOver.current = null;
  };

  return (
    <div>
      <SectionHeading text="Ethical Frameworks" />
      <div style={S.grid2}>
        <FG label="Primary Framework" hint="Primary ethical/philosophical framework">
          <Input value={form.value_framework_primary || ""} onChange={(v) => updateField("value_framework_primary", v)} placeholder="e.g. Noble Eightfold Path \u2014 Right View" />
        </FG>
        <FG label="Secondary Framework" hint="Secondary framework for edge cases">
          <Input value={form.value_framework_secondary || ""} onChange={(v) => updateField("value_framework_secondary", v)} placeholder="e.g. AI alignment principles" />
        </FG>
      </div>

      <SectionHeading text="Value Principles" />
      <p style={S.sectionHint}>Drag to reorder priority. #1 is highest priority.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {principles.map((p, i) => (
          <div key={i} draggable
            onDragStart={() => { dragItem.current = i; }}
            onDragEnter={() => { dragOver.current = i; }}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            style={S.dragItem}
          >
            <span style={S.dragHandle}>{"\u2261"}</span>
            <span style={S.dragNum}>{i + 1}.</span>
            <input value={p} onChange={(e) => {
              const next = [...principles];
              next[i] = e.target.value;
              updateField("value_principles", next);
            }} style={{ ...S.inputBase, flex: 1 }} placeholder="Principle" />
            <button onClick={() => updateField("value_principles", principles.filter((_, j) => j !== i))} style={S.btnRemove}>&times;</button>
          </div>
        ))}
      </div>
      <button onClick={() => updateField("value_principles", [...principles, ""])} style={{ ...S.btnAdd, marginTop: 8 }}>+ Add Principle</button>

      <SectionHeading text="Conflict Resolution" />
      <FG label="Value Conflict Protocol" hint="What to do when values conflict">
        <Textarea value={form.value_conflict_protocol || ""} onChange={(v) => updateField("value_conflict_protocol", v)} placeholder="e.g. When helpfulness conflicts with honesty, prioritize honesty..." rows={3} />
      </FG>
      <FG label="Uncertainty Expression" hint="How to handle uncertainty">
        <select value={form.uncertainty_expression || "express_openly"} onChange={(e) => updateField("uncertainty_expression", e.target.value)} style={S.selectBase}>
          <option value="express_openly">Express openly</option>
          <option value="quantify_confidence">Quantify with confidence levels</option>
          <option value="defer_to_human">Defer to human</option>
          <option value="flag_and_continue">Flag and continue</option>
        </select>
      </FG>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 5: CAPABILITIES
// ═══════════════════════════════════════════════════════════
function CapabilitiesTab({ form, updateField, allAgents, currentAgentId }: TabProps & { allAgents: AgentSummary[]; currentAgentId: string }) {
  const isLocal = LOCAL_PROVIDERS.has(form.provider || "anthropic");
  const skills = (form.installed_skills || []) as string[];
  const conferenceGroup = (form.conference_group || []) as string[];
  const otherAgents = allAgents.filter((a) => a.id !== currentAgentId && a.status !== "terminated");

  return (
    <div>
      <SectionHeading text="Model Configuration" />
      <div style={S.grid2}>
        <FG label="Model" hint="Select provider and model">
          <select value={`${form.provider || "anthropic"}:${form.model || ""}`}
            onChange={(e) => {
              const [prov, ...rest] = e.target.value.split(":");
              const mod = rest.join(":");
              updateField("provider", prov);
              if (mod === "custom") {
                updateField("model", "");
              } else {
                updateField("model", mod);
              }
            }} style={S.selectBase}>
            {MODEL_GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.models.map((m) => (
                  <option key={m.value} value={`${m.provider}:${m.value.includes(":") ? m.value.split(":")[1] || "custom" : m.value}`}>
                    {m.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </FG>
        <FG label="Monthly Budget" hint="USD per month spending cap">
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#71717a", fontSize: 14 }}>$</span>
            <input type="number" min={0} step={0.01}
              value={form.monthly_budget_usd ?? ""}
              onChange={(e) => updateField("monthly_budget_usd", e.target.value ? parseFloat(e.target.value) : 0)}
              style={{ ...S.inputBase, paddingLeft: 28 }} placeholder="5.00" />
          </div>
        </FG>
      </div>

      {isLocal && (
        <FG label="Endpoint URL" hint="OpenAI-compatible base URL for your local model server">
          <Input value={form.llm_base_url || ""} onChange={(v) => updateField("llm_base_url", v)}
            placeholder={form.provider === "ollama" ? "http://localhost:11434" : form.provider === "lmstudio" ? "http://localhost:1234" : "http://localhost:8000"} />
          {isLocal && form.provider !== "custom" && (
            <Input value={form.model || ""} onChange={(v) => updateField("model", v)} placeholder="Model name (e.g. llama3, mistral)" />
          )}
          <p style={{ fontSize: 11, color: "#71717a", marginTop: 4 }}>Local model \u2014 no credit charge. You provide the compute.</p>
        </FG>
      )}

      <SectionHeading text="Installed Skills" />
      <p style={S.sectionHint}>Select skills this agent can use. Grouped by tier.</p>
      {SKILL_TIERS.map((tier) => (
        <div key={tier.tier} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" as const, fontFamily: "var(--font-mono, monospace)" }}>{tier.tier}</div>
          <div style={S.skillGrid}>
            {tier.skills.map((sk) => (
              <label key={sk.slug} style={S.skillItem}>
                <input type="checkbox" checked={skills.includes(sk.slug)}
                  onChange={(e) => {
                    const next = e.target.checked ? [...skills, sk.slug] : skills.filter((s) => s !== sk.slug);
                    updateField("installed_skills", next);
                  }} style={{ accentColor: "#a78bfa", width: 14, height: 14 }} />
                <span style={{ fontSize: 13, color: skills.includes(sk.slug) ? "#e4e4e7" : "#71717a" }}>{sk.name}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <SectionHeading text="Conference Group" />
      <p style={S.sectionHint}>Select agents this agent can confer with in council deliberations.</p>
      {otherAgents.length === 0 ? (
        <p style={{ color: "#71717a", fontSize: 13 }}>No other agents available.</p>
      ) : (
        <div style={S.skillGrid}>
          {otherAgents.map((a) => (
            <label key={a.id} style={S.skillItem}>
              <input type="checkbox" checked={conferenceGroup.includes(a.id)}
                onChange={(e) => {
                  const next = e.target.checked ? [...conferenceGroup, a.id] : conferenceGroup.filter((x) => x !== a.id);
                  updateField("conference_group", next);
                }} style={{ accentColor: "#a78bfa", width: 14, height: 14 }} />
              <span style={S.conferenceAgent}>
                <span style={S.miniAvatar}>{(a.persona_name || a.name).charAt(0).toUpperCase()}</span>
                <span style={{ fontSize: 13, color: conferenceGroup.includes(a.id) ? "#e4e4e7" : "#71717a" }}>{a.persona_name || a.name}</span>
              </span>
            </label>
          ))}
        </div>
      )}

      <SectionHeading text="Voice Configuration" />
      <div style={S.grid2}>
        <FG label="TTS Provider">
          <select value={form.tts_provider || ""} onChange={(e) => updateField("tts_provider", e.target.value)} style={S.selectBase}>
            <option value="">None</option>
            <option value="cartesia">Cartesia</option>
            <option value="elevenlabs">ElevenLabs</option>
            <option value="openai">OpenAI</option>
          </select>
        </FG>
        <FG label="Voice ID" hint="Provider-specific voice identifier">
          <Input value={form.tts_voice_id || ""} onChange={(v) => updateField("tts_voice_id", v)} placeholder="e.g. alloy, echo, shimmer" />
        </FG>
      </div>
      <div style={S.grid2}>
        <FG label="Voice Name" hint="Friendly name for this voice">
          <Input value={form.tts_voice_name || ""} onChange={(v) => updateField("tts_voice_name", v)} placeholder="e.g. Warm Female" />
        </FG>
        <FG label="Language">
          <select value={form.voice_language || "en"} onChange={(e) => updateField("voice_language", e.target.value)} style={S.selectBase}>
            {VOICE_LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </FG>
      </div>
      <FG label="Voice Speed" hint={`Speed: ${(form.voice_speed ?? 1.0).toFixed(1)}x`}>
        <input type="range" min={0.5} max={2.0} step={0.1}
          value={form.voice_speed ?? 1.0}
          onChange={(e) => updateField("voice_speed", parseFloat(e.target.value))}
          style={S.slider} />
      </FG>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 6: DIFFERENTIATION
// ═══════════════════════════════════════════════════════════
function DifferentiationTab({ form, updateField }: TabProps) {
  const examples = (form.differentiation_examples || []) as { question: string; answer: string }[];
  const defaults = (form.softcoded_defaults || []) as { rule: string; override: string }[];

  return (
    <div>
      <SectionHeading text="Identity Statement" />
      <FG label="Differentiation Statement" hint="How does this agent differ from a base model?">
        <Textarea value={form.differentiation_statement || ""} onChange={(v) => updateField("differentiation_statement", v)}
          placeholder="e.g. Unlike generic assistants, I bring 20 years of financial analysis experience and always quantify uncertainty..." rows={4} />
      </FG>

      <SectionHeading text="Response Examples" />
      <p style={S.sectionHint}>Show how this agent would respond differently than a generic AI</p>
      {examples.map((ex, i) => (
        <div key={i} style={S.exampleCard}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, fontFamily: "var(--font-mono, monospace)", letterSpacing: 1 }}>EXAMPLE {i + 1}</span>
            <button onClick={() => updateField("differentiation_examples", examples.filter((_, j) => j !== i))} style={S.btnRemove}>&times;</button>
          </div>
          <FG label="Sample Question">
            <Input value={ex.question} onChange={(v) => {
              const next = [...examples]; next[i] = { ...next[i], question: v };
              updateField("differentiation_examples", next);
            }} placeholder="What would someone ask?" />
          </FG>
          <FG label="Expected Response">
            <Textarea value={ex.answer} onChange={(v) => {
              const next = [...examples]; next[i] = { ...next[i], answer: v };
              updateField("differentiation_examples", next);
            }} placeholder="How should this agent respond?" rows={3} />
          </FG>
        </div>
      ))}
      <button onClick={() => updateField("differentiation_examples", [...examples, { question: "", answer: "" }])} style={S.btnAdd}>+ Add Example Pair</button>

      <SectionHeading text="Hardcoded Limits" />
      <FG label="" hint="Absolute restrictions that can never be overridden">
        <TagInput tags={(form.hardcoded_limits || []) as string[]} onChange={(v) => updateField("hardcoded_limits", v)} placeholder="e.g. never provide legal advice as fact" />
      </FG>

      <SectionHeading text="Softcoded Defaults" />
      <p style={S.sectionHint}>Default behaviors that users can override under specific conditions</p>
      {defaults.map((d, i) => (
        <div key={i} style={{ ...S.kvRow, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <Input value={d.rule} onChange={(v) => {
              const next = [...defaults]; next[i] = { ...next[i], rule: v };
              updateField("softcoded_defaults", next);
            }} placeholder="Rule (e.g. Respond in English)" />
          </div>
          <span style={{ color: "#3f3f46", fontSize: 14, whiteSpace: "nowrap" as const }}>override when</span>
          <div style={{ flex: 1 }}>
            <Input value={d.override} onChange={(v) => {
              const next = [...defaults]; next[i] = { ...next[i], override: v };
              updateField("softcoded_defaults", next);
            }} placeholder="Condition (e.g. user requests another language)" />
          </div>
          <button onClick={() => updateField("softcoded_defaults", defaults.filter((_, j) => j !== i))} style={S.btnRemove}>&times;</button>
        </div>
      ))}
      <button onClick={() => updateField("softcoded_defaults", [...defaults, { rule: "", override: "" }])} style={S.btnAdd}>+ Add Default</button>

      <SectionHeading text="Escalation Protocol" />
      <FG label="" hint="What happens when the agent hits its boundaries?">
        <Textarea value={form.escalation_protocol || ""} onChange={(v) => updateField("escalation_protocol", v)}
          placeholder="e.g. Escalate when: user requests refund > $100, legal questions, safety concerns. Method: tag @support in Slack." rows={3} />
      </FG>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TEST RESPONSE MODAL
// ═══════════════════════════════════════════════════════════
function TestResponseModal({ agentId, agentName, onClose }: { agentId: string; agentName: string; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [meta, setMeta] = useState<{ duration_ms?: number; tokens?: number } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    if (!query.trim()) return;
    setTesting(true);
    setResponse("");
    setMeta(null);
    const t0 = Date.now();
    try {
      const res = await fetch(`/api/agents/${agentId}/gateway`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: query }] }),
      });
      const data = await res.json();
      const elapsed = Date.now() - t0;
      if (data.error) {
        setResponse(`Error: ${data.error}`);
      } else {
        setResponse(data.response || data.content || JSON.stringify(data, null, 2));
        setMeta({ duration_ms: elapsed, tokens: data.usage?.total_tokens || data.total_tokens });
      }
    } catch (e: unknown) {
      setResponse(`Error: ${e instanceof Error ? e.message : "Request failed"}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e4e4e7", margin: 0 }}>Test Response \u2014 {agentName}</h3>
          <button onClick={onClose} style={{ ...S.btnRemove, fontSize: 22 }}>&times;</button>
        </div>
        <p style={{ fontSize: 12, color: "#71717a", marginBottom: 12 }}>See how your persona definition affects responses in real time.</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleTest(); }}
            placeholder="Enter a test question..."
            style={{ ...S.inputBase, flex: 1 }} />
          <button onClick={handleTest} disabled={testing || !query.trim()}
            style={{ ...S.btnPrimary, opacity: testing || !query.trim() ? 0.5 : 1, whiteSpace: "nowrap" as const }}>
            {testing ? "Testing\u2026" : "Send"}
          </button>
        </div>
        {(response || testing) && (
          <div style={S.testResult}>
            {testing && <div style={{ color: "#71717a" }}>Generating response...</div>}
            {response && (
              <>
                <div style={{ fontSize: 14, color: "#e4e4e7", lineHeight: 1.6, whiteSpace: "pre-wrap" as const }}>{response}</div>
                {meta && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e1e2e", display: "flex", gap: 16, fontSize: 12, color: "#71717a" }}>
                    {meta.duration_ms && <span>{(meta.duration_ms / 1000).toFixed(1)}s</span>}
                    {meta.tokens && <span>{meta.tokens.toLocaleString()} tokens</span>}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════

function SectionHeading({ text }: { text: string }) {
  return <h3 style={S.sectionHead}>{text}</h3>;
}

function FG({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={S.label}>{label}</label>}
      {hint && <p style={S.hint}>{hint}</p>}
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={S.inputBase} />;
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...S.inputBase, resize: "vertical" as const, lineHeight: 1.6 }} />;
}

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
      <div onClick={() => onChange(!checked)} style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? "#a78bfa" : "#27272a",
        position: "relative", transition: "background 0.2s", cursor: "pointer",
        border: "1px solid " + (checked ? "rgba(167,139,250,0.5)" : "#3f3f46"),
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: 9,
          background: "#fff", position: "absolute", top: 2,
          left: checked ? 22 : 2, transition: "left 0.2s",
        }} />
      </div>
      <span style={{ fontSize: 14, color: checked ? "#e4e4e7" : "#71717a" }}>{label}</span>
    </label>
  );
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: tags.length ? 8 : 0 }}>
        {tags.map((tag, i) => (
          <span key={i} style={S.tag}>
            {tag}
            <button onClick={() => onChange(tags.filter((_, j) => j !== i))} style={S.tagX}>&times;</button>
          </span>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
        placeholder={placeholder} style={S.inputBase} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#06060E",
    padding: "20px 40px 80px",
    maxWidth: 1100,
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  emptyState: {
    textAlign: "center",
    padding: 80,
    color: "#71717a",
    fontSize: 15,
  },
  skeleton: {
    background: "linear-gradient(90deg, #12121a 25%, #1a1a2e 50%, #12121a 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: 8,
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    fontSize: 13,
  },
  breadcrumbLink: {
    color: "#71717a",
    textDecoration: "none",
    transition: "color 0.15s",
  },
  breadcrumbSep: {
    color: "#3f3f46",
  },
  breadcrumbCurrent: {
    color: "#a1a1aa",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap" as const,
    gap: 16,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 800,
    color: "#fff",
    flexShrink: 0,
  },
  agentName: {
    fontSize: 22,
    fontWeight: 800,
    color: "#e4e4e7",
    margin: 0,
    lineHeight: 1.2,
  },
  agentDesignation: {
    fontSize: 13,
    color: "#71717a",
    margin: "2px 0 0",
  },
  toolbar: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    alignItems: "center",
  },
  btnGhost: {
    padding: "7px 14px",
    background: "transparent",
    color: "#a1a1aa",
    border: "1px solid #27272a",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-mono, monospace)",
    transition: "all 0.15s",
    whiteSpace: "nowrap" as const,
  },
  btnPrimary: {
    padding: "8px 20px",
    background: "#a78bfa",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "var(--font-mono, monospace)",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.15s",
  },
  dirtyDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#fbbf24",
    display: "inline-block",
  },
  tabBar: {
    display: "flex",
    gap: 0,
    marginBottom: 24,
    borderBottom: "1px solid #1e1e2e",
    overflowX: "auto" as const,
    WebkitOverflowScrolling: "touch" as const,
  },
  tab: {
    padding: "12px 20px",
    fontSize: 13,
    fontWeight: 600,
    color: "#71717a",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    transition: "all 0.15s",
    fontFamily: "var(--font-mono, monospace)",
  },
  tabActive: {
    color: "#a78bfa",
    borderBottomColor: "#a78bfa",
  },
  panel: {
    background: "#0c0c14",
    border: "1px solid #1e1e2e",
    borderRadius: 14,
    padding: "28px 32px",
  },
  sectionHead: {
    fontSize: 14,
    fontWeight: 700,
    color: "#a78bfa",
    margin: "28px 0 12px",
    paddingTop: 20,
    borderTop: "1px solid #1e1e2e",
    fontFamily: "var(--font-mono, monospace)",
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 12,
    color: "#71717a",
    margin: "-4px 0 12px",
    lineHeight: 1.4,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: "#e4e4e7",
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: "#52525b",
    margin: "0 0 8px",
    lineHeight: 1.4,
  },
  inputBase: {
    width: "100%",
    padding: "10px 14px",
    background: "#09090f",
    border: "1px solid #27272a",
    borderRadius: 8,
    color: "#e4e4e7",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s",
  },
  selectBase: {
    width: "100%",
    padding: "10px 14px",
    background: "#09090f",
    border: "1px solid #27272a",
    borderRadius: 8,
    color: "#e4e4e7",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
  selectInline: {
    padding: "10px 14px",
    background: "#09090f",
    border: "1px solid #27272a",
    borderRadius: 8,
    color: "#e4e4e7",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    background: "rgba(167,139,250,0.08)",
    border: "1px solid rgba(167,139,250,0.2)",
    borderRadius: 6,
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: 600,
  },
  tagX: {
    background: "none",
    border: "none",
    color: "#a78bfa",
    cursor: "pointer",
    fontSize: 14,
    padding: "0 0 0 2px",
    lineHeight: 1,
    opacity: 0.7,
  },
  btnAdd: {
    padding: "6px 14px",
    background: "rgba(167,139,250,0.06)",
    color: "#a78bfa",
    border: "1px solid rgba(167,139,250,0.15)",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  btnRemove: {
    background: "none",
    border: "none",
    color: "#52525b",
    cursor: "pointer",
    fontSize: 18,
    padding: "0 4px",
    lineHeight: 1,
    transition: "color 0.15s",
    flexShrink: 0,
  },
  kvRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  tierGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 10,
  },
  tierCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 14px",
    background: "#09090f",
    border: "1px solid #27272a",
    borderRadius: 10,
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
  presetBtn: {
    padding: "6px 12px",
    background: "transparent",
    border: "1px solid #27272a",
    borderRadius: 6,
    color: "#71717a",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  presetBtnActive: {
    background: "rgba(167,139,250,0.1)",
    borderColor: "rgba(167,139,250,0.3)",
    color: "#a78bfa",
  },
  dragItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px",
    background: "#09090f",
    border: "1px solid #27272a",
    borderRadius: 8,
    cursor: "grab",
    transition: "border-color 0.15s",
  },
  dragHandle: {
    color: "#3f3f46",
    fontSize: 20,
    cursor: "grab",
    userSelect: "none" as const,
    lineHeight: 1,
  },
  dragNum: {
    color: "#52525b",
    fontSize: 12,
    fontFamily: "var(--font-mono, monospace)",
    width: 22,
    textAlign: "right" as const,
  },
  skillGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 6,
  },
  skillItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    cursor: "pointer",
    borderRadius: 6,
    transition: "background 0.1s",
  },
  conferenceAgent: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  slider: {
    width: "100%",
    accentColor: "#a78bfa",
    height: 6,
  },
  exampleCard: {
    background: "#09090f",
    border: "1px solid #27272a",
    borderRadius: 10,
    padding: "16px 18px",
    marginBottom: 12,
  },
  toast: {
    position: "fixed",
    bottom: 24,
    right: 24,
    padding: "12px 20px",
    background: "#12121a",
    border: "1px solid #27272a",
    borderRadius: 10,
    color: "#e4e4e7",
    fontSize: 13,
    fontWeight: 600,
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: 20,
  },
  modalContent: {
    background: "#0c0c14",
    border: "1px solid #27272a",
    borderRadius: 16,
    padding: "24px 28px",
    width: "100%",
    maxWidth: 600,
    maxHeight: "80vh",
    overflowY: "auto" as const,
  },
  testResult: {
    background: "#09090f",
    border: "1px solid #1e1e2e",
    borderRadius: 10,
    padding: "16px 20px",
    maxHeight: 300,
    overflowY: "auto" as const,
  },
};
