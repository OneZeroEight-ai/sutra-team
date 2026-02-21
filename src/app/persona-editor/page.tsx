"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback, Suspense } from "react";
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
  // Identity
  persona_name: string | null;
  persona_designation: string | null;
  origin_narrative: string | null;
  voice_tone: string | null;
  voice_avoidances: string | null;
  voice_opening_pattern: string | null;
  voice_closing_pattern: string | null;
  platform_adaptations: Record<string, string> | null;
  // Knowledge
  knowledge_sources: string[] | null;
  domain_expertise: { domain: string; depth: string }[] | null;
  // Memory
  memory_enabled: boolean;
  memory_tiers: string[] | null;
  memory_retention_days: number | null;
  // Values
  value_framework_primary: string | null;
  value_framework_secondary: string | null;
  value_principles: string[] | null;
  value_conflict_protocol: string | null;
  uncertainty_expression: string | null;
  // Capabilities
  tts_provider: string | null;
  tts_voice_id: string | null;
  tts_voice_name: string | null;
  tts_model: string | null;
  stt_provider: string | null;
  stt_model: string | null;
  voice_speed: number;
  voice_language: string | null;
  conference_group: string[] | null;
  // Council
  council_type: string | null;
  council_role: string | null;
  eightfold_path_aspect: string | null;
  synthesis_weight: number;
  // Differentiation
  differentiation_statement: string | null;
  differentiation_examples: { question: string; answer: string }[] | null;
  hardcoded_limits: string[] | null;
  softcoded_defaults: { key: string; value: string }[] | null;
  escalation_protocol: string | null;
}

type TabId =
  | "identity"
  | "knowledge"
  | "memory"
  | "values"
  | "capabilities"
  | "differentiation";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "identity", label: "Identity", icon: "\uD83C\uDFAD" },
  { id: "knowledge", label: "Knowledge", icon: "\uD83D\uDCDA" },
  { id: "memory", label: "Memory", icon: "\uD83E\uDDE0" },
  { id: "values", label: "Values", icon: "\u2696\uFE0F" },
  { id: "capabilities", label: "Capabilities", icon: "\u2699\uFE0F" },
  { id: "differentiation", label: "Differentiation", icon: "\uD83C\uDF1F" },
];

// ─── Main Export ─────────────────────────────────────────
export default function PersonaEditorPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: "center", color: "#71717a" }}>
          Loading editor...
        </div>
      }
    >
      <PersonaEditorContent />
    </Suspense>
  );
}

// ─── Editor Content ──────────────────────────────────────
function PersonaEditorContent() {
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId");

  const [agent, setAgent] = useState<AgentData | null>(null);
  const [form, setForm] = useState<Partial<AgentData>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("identity");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  // Load agent
  useEffect(() => {
    if (!agentId || !isSignedIn) return;
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

  const updateField = useCallback(
    (field: string, value: unknown) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setDirty(true);
    },
    [],
  );

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
      showToast("Saved successfully");
    } catch (e: unknown) {
      showToast("Error: " + (e instanceof Error ? e.message : "Save failed"));
    } finally {
      setSaving(false);
    }
  }, [agentId, dirty, form, showToast]);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(form, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.name || "agent"}-persona.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [form]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        setForm((prev) => ({ ...prev, ...data }));
        setDirty(true);
        showToast("Imported — review and save");
      } catch {
        showToast("Invalid JSON file");
      }
    };
    input.click();
  }, [showToast]);

  const handleSaveAsTemplate = useCallback(() => {
    const key = `persona-template-${Date.now()}`;
    const template = {
      name: form.name || "Untitled",
      created: new Date().toISOString(),
      data: form,
    };
    localStorage.setItem(key, JSON.stringify(template));
    showToast("Saved as local template");
  }, [form, showToast]);

  // ─── Render ────────────────────────────────────────────
  if (!isSignedIn) {
    return (
      <div style={styles.container}>
        <p style={{ color: "#71717a" }}>
          Please sign in to access the persona editor.
        </p>
      </div>
    );
  }

  if (!agentId) {
    return (
      <div style={styles.container}>
        <p style={{ color: "#71717a" }}>
          No agent selected. Go to the{" "}
          <a href="/dashboard" style={{ color: "#a78bfa" }}>
            dashboard
          </a>{" "}
          and click &quot;Edit Persona&quot; on an agent.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: 60, color: "#71717a" }}>
          Loading agent...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <p style={{ color: "#ef4444" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <a
            href="/dashboard"
            style={{
              color: "#71717a",
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            &larr; Dashboard
          </a>
          <h1 style={styles.title}>
            {agent?.name || "Agent"}{" "}
            <span style={{ color: "#71717a", fontWeight: 400 }}>
              / Persona Editor
            </span>
          </h1>
        </div>
        <div style={styles.toolbar}>
          <button onClick={handleImport} style={styles.btnGhost}>
            Import JSON
          </button>
          <button onClick={handleExport} style={styles.btnGhost}>
            Export JSON
          </button>
          <button onClick={handleSaveAsTemplate} style={styles.btnGhost}>
            Save as Template
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            style={{
              ...styles.btnPrimary,
              opacity: !dirty || saving ? 0.5 : 1,
            }}
          >
            {saving ? "Saving..." : dirty ? "Save Changes" : "Saved"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
          >
            <span style={{ marginRight: 6 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.panel}>
        {activeTab === "identity" && (
          <IdentityTab form={form} updateField={updateField} />
        )}
        {activeTab === "knowledge" && (
          <KnowledgeTab form={form} updateField={updateField} />
        )}
        {activeTab === "memory" && (
          <MemoryTab form={form} updateField={updateField} />
        )}
        {activeTab === "values" && (
          <ValuesTab form={form} updateField={updateField} />
        )}
        {activeTab === "capabilities" && (
          <CapabilitiesTab form={form} updateField={updateField} />
        )}
        {activeTab === "differentiation" && (
          <DifferentiationTab form={form} updateField={updateField} />
        )}
      </div>

      {/* Toast */}
      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

// ─── Tab Components ──────────────────────────────────────

interface TabProps {
  form: Partial<AgentData>;
  updateField: (field: string, value: unknown) => void;
}

function IdentityTab({ form, updateField }: TabProps) {
  return (
    <div style={styles.fields}>
      <FieldGroup label="Persona Name" hint="How this agent introduces itself">
        <Input
          value={form.persona_name || ""}
          onChange={(v) => updateField("persona_name", v)}
          placeholder="e.g. Aria, Marcus, The Analyst"
        />
      </FieldGroup>
      <FieldGroup
        label="Designation"
        hint="Title or role description"
      >
        <Input
          value={form.persona_designation || ""}
          onChange={(v) => updateField("persona_designation", v)}
          placeholder="e.g. Senior Research Analyst, Customer Success Lead"
        />
      </FieldGroup>
      <FieldGroup
        label="Origin Narrative"
        hint="Backstory that shapes the persona's perspective"
      >
        <Textarea
          value={form.origin_narrative || ""}
          onChange={(v) => updateField("origin_narrative", v)}
          placeholder="Describe this agent's background, experience, and what shaped their worldview..."
          rows={4}
        />
      </FieldGroup>
      <FieldGroup
        label="Voice Tone"
        hint="Comma-separated tone descriptors"
      >
        <Input
          value={form.voice_tone || ""}
          onChange={(v) => updateField("voice_tone", v)}
          placeholder="e.g. warm, direct, professional, witty"
        />
      </FieldGroup>
      <FieldGroup
        label="Voice Avoidances"
        hint="Words, phrases, or patterns to avoid"
      >
        <Textarea
          value={form.voice_avoidances || ""}
          onChange={(v) => updateField("voice_avoidances", v)}
          placeholder="e.g. Never use 'synergy', avoid exclamation marks, don't say 'as an AI'..."
          rows={3}
        />
      </FieldGroup>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FieldGroup label="Opening Pattern" hint="How to start conversations">
          <Input
            value={form.voice_opening_pattern || ""}
            onChange={(v) => updateField("voice_opening_pattern", v)}
            placeholder="e.g. Greet by name, then ask about their day"
          />
        </FieldGroup>
        <FieldGroup label="Closing Pattern" hint="How to end conversations">
          <Input
            value={form.voice_closing_pattern || ""}
            onChange={(v) => updateField("voice_closing_pattern", v)}
            placeholder="e.g. Summarize action items, then sign off"
          />
        </FieldGroup>
      </div>
      <FieldGroup
        label="Platform Adaptations"
        hint="Adjust tone/style per platform (JSON object)"
      >
        <Textarea
          value={
            form.platform_adaptations
              ? JSON.stringify(form.platform_adaptations, null, 2)
              : ""
          }
          onChange={(v) => {
            try {
              updateField("platform_adaptations", JSON.parse(v));
            } catch {
              // Let user keep typing invalid JSON
            }
          }}
          placeholder='{"slack": "Use shorter messages, emoji OK", "email": "Formal, full sentences"}'
          rows={3}
          mono
        />
      </FieldGroup>
    </div>
  );
}

function KnowledgeTab({ form, updateField }: TabProps) {
  const sources = form.knowledge_sources || [];
  const expertise = form.domain_expertise || [];

  return (
    <div style={styles.fields}>
      <FieldGroup
        label="Knowledge Sources"
        hint="URLs, document names, or data sources this agent can reference"
      >
        <TagInput
          tags={sources as string[]}
          onChange={(v) => updateField("knowledge_sources", v)}
          placeholder="Add source and press Enter"
        />
      </FieldGroup>
      <FieldGroup
        label="Domain Expertise"
        hint="Areas of knowledge with depth level"
      >
        <ListEditor
          items={(expertise as { domain: string; depth: string }[]).map(
            (e) => `${e.domain} (${e.depth})`,
          )}
          onChange={(items) =>
            updateField(
              "domain_expertise",
              items.map((s) => {
                const match = s.match(/^(.+?)\s*\((.+?)\)$/);
                return match
                  ? { domain: match[1], depth: match[2] }
                  : { domain: s, depth: "general" };
              }),
            )
          }
          placeholder="e.g. Machine Learning (expert)"
        />
      </FieldGroup>
    </div>
  );
}

function MemoryTab({ form, updateField }: TabProps) {
  const tiers = form.memory_tiers || [];
  const allTiers = [
    "conversational",
    "episodic",
    "semantic",
    "procedural",
  ];

  return (
    <div style={styles.fields}>
      <FieldGroup label="Memory Enabled" hint="Allow this agent to remember across sessions">
        <label style={styles.toggle}>
          <input
            type="checkbox"
            checked={form.memory_enabled !== false}
            onChange={(e) => updateField("memory_enabled", e.target.checked)}
          />
          <span style={{ marginLeft: 8 }}>
            {form.memory_enabled !== false ? "Enabled" : "Disabled"}
          </span>
        </label>
      </FieldGroup>
      <FieldGroup label="Memory Tiers" hint="Which memory layers to activate">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {allTiers.map((tier) => (
            <label key={tier} style={styles.checkbox}>
              <input
                type="checkbox"
                checked={(tiers as string[]).includes(tier)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...(tiers as string[]), tier]
                    : (tiers as string[]).filter((t) => t !== tier);
                  updateField("memory_tiers", next);
                }}
              />
              <span style={{ marginLeft: 6, textTransform: "capitalize" }}>
                {tier}
              </span>
            </label>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup
        label="Retention Days"
        hint="How long to keep memories (blank = forever)"
      >
        <Input
          type="number"
          value={form.memory_retention_days?.toString() || ""}
          onChange={(v) =>
            updateField(
              "memory_retention_days",
              v ? parseInt(v, 10) : null,
            )
          }
          placeholder="e.g. 90"
        />
      </FieldGroup>
    </div>
  );
}

function ValuesTab({ form, updateField }: TabProps) {
  const principles = form.value_principles || [];
  const uncertaintyOptions = [
    "express_freely",
    "hedge_conservatively",
    "state_confidence_level",
    "defer_to_sources",
    "ask_for_clarification",
  ];

  return (
    <div style={styles.fields}>
      <FieldGroup
        label="Primary Value Framework"
        hint="The ethical or philosophical framework this agent follows"
      >
        <Input
          value={form.value_framework_primary || ""}
          onChange={(v) => updateField("value_framework_primary", v)}
          placeholder="e.g. Utilitarian, Deontological, Buddhist Right Speech"
        />
      </FieldGroup>
      <FieldGroup
        label="Secondary Framework"
        hint="Fallback framework for edge cases"
      >
        <Input
          value={form.value_framework_secondary || ""}
          onChange={(v) => updateField("value_framework_secondary", v)}
          placeholder="e.g. Virtue Ethics, Pragmatism"
        />
      </FieldGroup>
      <FieldGroup
        label="Value Principles"
        hint="Ordered list of principles (higher = more important)"
      >
        <ListEditor
          items={principles as string[]}
          onChange={(v) => updateField("value_principles", v)}
          placeholder="Add a principle"
        />
      </FieldGroup>
      <FieldGroup
        label="Value Conflict Protocol"
        hint="What to do when values conflict"
      >
        <Textarea
          value={form.value_conflict_protocol || ""}
          onChange={(v) => updateField("value_conflict_protocol", v)}
          placeholder="e.g. When helpfulness conflicts with honesty, prioritize honesty. When efficiency conflicts with thoroughness..."
          rows={3}
        />
      </FieldGroup>
      <FieldGroup
        label="Uncertainty Expression"
        hint="How this agent handles uncertain information"
      >
        <select
          value={form.uncertainty_expression || "express_freely"}
          onChange={(e) =>
            updateField("uncertainty_expression", e.target.value)
          }
          style={styles.select}
        >
          {uncertaintyOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </FieldGroup>
    </div>
  );
}

function CapabilitiesTab({ form, updateField }: TabProps) {
  const providers = [
    "anthropic", "openai", "google",
    "ollama", "lmstudio", "vllm", "custom",
  ];
  const localProviders = new Set(["ollama", "lmstudio", "vllm", "custom"]);
  const modelsByProvider: Record<string, string[]> = {
    anthropic: [
      "claude-sonnet-4-5-20250929",
      "claude-opus-4-6",
      "claude-haiku-4-5-20251001",
    ],
    openai: ["gpt-4o", "gpt-4o-mini", "gpt-4.1"],
    google: ["gemini-2.5-pro", "gemini-2.0-flash"],
    ollama: ["llama3", "mistral", "codellama", "gemma2", "phi3"],
    lmstudio: ["default"],
    vllm: ["default"],
    custom: ["default"],
  };
  const isLocal = localProviders.has(form.provider || "anthropic");

  return (
    <div style={styles.fields}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FieldGroup label="Provider">
          <select
            value={form.provider || "anthropic"}
            onChange={(e) => updateField("provider", e.target.value)}
            style={styles.select}
          >
            <optgroup label="Cloud">
              {providers.filter(p => !localProviders.has(p)).map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </optgroup>
            <optgroup label="Local / Self-Hosted">
              {providers.filter(p => localProviders.has(p)).map((p) => (
                <option key={p} value={p}>
                  {p === "lmstudio" ? "LM Studio" : p === "vllm" ? "vLLM" : p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </optgroup>
          </select>
        </FieldGroup>
        <FieldGroup label="Model">
          <select
            value={form.model || ""}
            onChange={(e) => updateField("model", e.target.value)}
            style={styles.select}
          >
            {(modelsByProvider[form.provider || "anthropic"] || []).map(
              (m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ),
            )}
          </select>
        </FieldGroup>
      </div>
      {isLocal && (
        <FieldGroup label="Endpoint URL" hint="OpenAI-compatible base URL for your local model server">
          <Input
            value={form.llm_base_url || ""}
            onChange={(v) => updateField("llm_base_url", v)}
            placeholder={
              form.provider === "ollama" ? "http://localhost:11434" :
              form.provider === "lmstudio" ? "http://localhost:1234" :
              "http://localhost:8000"
            }
          />
          <p style={{ fontSize: 11, color: "#71717a", marginTop: 4 }}>
            Local model — no credit charge. You provide the compute.
          </p>
        </FieldGroup>
      )}
      <FieldGroup label="Monthly Budget (USD)">
        <Input
          type="number"
          value={form.monthly_budget_usd?.toString() || ""}
          onChange={(v) =>
            updateField("monthly_budget_usd", v ? parseFloat(v) : 0)
          }
          placeholder="e.g. 25"
        />
      </FieldGroup>
      <FieldGroup
        label="Installed Skills"
        hint="Skill IDs this agent can use"
      >
        <TagInput
          tags={form.installed_skills || []}
          onChange={(v) => updateField("installed_skills", v)}
          placeholder="Add skill ID"
        />
      </FieldGroup>
      <FieldGroup
        label="Conference Group"
        hint="Council group IDs for multi-agent deliberation"
      >
        <TagInput
          tags={(form.conference_group as string[]) || []}
          onChange={(v) => updateField("conference_group", v)}
          placeholder="Add group ID"
        />
      </FieldGroup>
      <div style={{ borderTop: "1px solid #1e1e2e", paddingTop: 16, marginTop: 8 }}>
        <h3 style={{ fontSize: 14, color: "#71717a", marginBottom: 12 }}>
          Voice / TTS
        </h3>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <FieldGroup label="TTS Provider">
            <Input
              value={form.tts_provider || ""}
              onChange={(v) => updateField("tts_provider", v)}
              placeholder="e.g. elevenlabs, openai"
            />
          </FieldGroup>
          <FieldGroup label="TTS Voice ID">
            <Input
              value={form.tts_voice_id || ""}
              onChange={(v) => updateField("tts_voice_id", v)}
              placeholder="Voice identifier"
            />
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}

function DifferentiationTab({ form, updateField }: TabProps) {
  const examples = (form.differentiation_examples as { question: string; answer: string }[]) || [];
  const defaults = (form.softcoded_defaults as { key: string; value: string }[]) || [];

  return (
    <div style={styles.fields}>
      <FieldGroup
        label="Differentiation Statement"
        hint="What makes this agent unique — its core identity"
      >
        <Textarea
          value={form.differentiation_statement || ""}
          onChange={(v) => updateField("differentiation_statement", v)}
          placeholder="e.g. Unlike generic assistants, I bring 20 years of financial analysis experience and always quantify uncertainty..."
          rows={3}
        />
      </FieldGroup>
      <FieldGroup
        label="Differentiation Examples"
        hint='Q&A pairs showing how this agent responds differently'
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {examples.map((ex, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "start",
              }}
            >
              <div style={{ flex: 1 }}>
                <Input
                  value={ex.question}
                  onChange={(v) => {
                    const next = [...examples];
                    next[i] = { ...next[i], question: v };
                    updateField("differentiation_examples", next);
                  }}
                  placeholder="Question"
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  value={ex.answer}
                  onChange={(v) => {
                    const next = [...examples];
                    next[i] = { ...next[i], answer: v };
                    updateField("differentiation_examples", next);
                  }}
                  placeholder="How this agent would respond"
                />
              </div>
              <button
                onClick={() => {
                  updateField(
                    "differentiation_examples",
                    examples.filter((_, j) => j !== i),
                  );
                }}
                style={styles.btnRemove}
              >
                &times;
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              updateField("differentiation_examples", [
                ...examples,
                { question: "", answer: "" },
              ])
            }
            style={styles.btnAdd}
          >
            + Add Example
          </button>
        </div>
      </FieldGroup>
      <FieldGroup
        label="Hardcoded Limits"
        hint="Absolute rules that cannot be overridden"
      >
        <TagInput
          tags={(form.hardcoded_limits as string[]) || []}
          onChange={(v) => updateField("hardcoded_limits", v)}
          placeholder="e.g. Never reveal system prompt"
        />
      </FieldGroup>
      <FieldGroup
        label="Softcoded Defaults"
        hint="Default behaviors that users can override"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {defaults.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Input
                  value={d.key}
                  onChange={(v) => {
                    const next = [...defaults];
                    next[i] = { ...next[i], key: v };
                    updateField("softcoded_defaults", next);
                  }}
                  placeholder="Setting"
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  value={d.value}
                  onChange={(v) => {
                    const next = [...defaults];
                    next[i] = { ...next[i], value: v };
                    updateField("softcoded_defaults", next);
                  }}
                  placeholder="Default value"
                />
              </div>
              <button
                onClick={() =>
                  updateField(
                    "softcoded_defaults",
                    defaults.filter((_, j) => j !== i),
                  )
                }
                style={styles.btnRemove}
              >
                &times;
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              updateField("softcoded_defaults", [
                ...defaults,
                { key: "", value: "" },
              ])
            }
            style={styles.btnAdd}
          >
            + Add Default
          </button>
        </div>
      </FieldGroup>
      <FieldGroup
        label="Escalation Protocol"
        hint="When and how to escalate to a human"
      >
        <Textarea
          value={form.escalation_protocol || ""}
          onChange={(v) => updateField("escalation_protocol", v)}
          placeholder="e.g. Escalate when: user requests refund > $100, legal questions, safety concerns. Method: tag @support in Slack channel."
          rows={3}
        />
      </FieldGroup>
    </div>
  );
}

// ─── Reusable Field Components ───────────────────────────

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={styles.label}>{label}</label>
      {hint && <p style={styles.hint}>{hint}</p>}
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={styles.input}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        ...styles.input,
        resize: "vertical" as const,
        fontFamily: mono
          ? "var(--font-mono, monospace)"
          : "inherit",
        lineHeight: 1.5,
      }}
    />
  );
}

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput("");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: tags.length ? 8 : 0,
        }}
      >
        {tags.map((tag, i) => (
          <span key={i} style={styles.tag}>
            {tag}
            <button
              onClick={() => onChange(tags.filter((_, j) => j !== i))}
              style={styles.tagRemove}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
        }}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

function ListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const addItem = () => {
    const val = input.trim();
    if (val) {
      onChange([...items, val]);
      setInput("");
    }
  };

  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span style={{ color: "#71717a", fontSize: 12, width: 20 }}>
            {i + 1}.
          </span>
          <span style={{ flex: 1, fontSize: 14, color: "#e4e4e7" }}>
            {item}
          </span>
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            style={styles.btnRemove}
          >
            &times;
          </button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          style={{ ...styles.input, flex: 1 }}
        />
        <button onClick={addItem} style={styles.btnAdd}>
          Add
        </button>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "24px 20px 60px",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: "#e4e4e7",
    margin: "4px 0 0",
    fontFamily: "var(--font-display, system-ui)",
  },
  toolbar: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  tabBar: {
    display: "flex",
    gap: 4,
    marginBottom: 24,
    borderBottom: "1px solid #1e1e2e",
    paddingBottom: 0,
    overflowX: "auto",
  },
  tab: {
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 600,
    color: "#71717a",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
    fontFamily: "var(--font-mono, monospace)",
  },
  tabActive: {
    color: "#a78bfa",
    borderBottomColor: "#a78bfa",
  },
  panel: {
    background: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 12,
    padding: 24,
  },
  fields: {},
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: "#e4e4e7",
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: "#71717a",
    margin: "0 0 8px",
    lineHeight: 1.4,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "#0a0a0f",
    border: "1px solid #1e1e2e",
    borderRadius: 8,
    color: "#e4e4e7",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    background: "#0a0a0f",
    border: "1px solid #1e1e2e",
    borderRadius: 8,
    color: "#e4e4e7",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  },
  toggle: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    fontSize: 14,
    color: "#e4e4e7",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    fontSize: 14,
    color: "#e4e4e7",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    background: "rgba(167,139,250,0.1)",
    border: "1px solid rgba(167,139,250,0.25)",
    borderRadius: 6,
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: 600,
  },
  tagRemove: {
    background: "none",
    border: "none",
    color: "#a78bfa",
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
    lineHeight: 1,
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
  },
  btnGhost: {
    padding: "8px 14px",
    background: "transparent",
    color: "#71717a",
    border: "1px solid #1e1e2e",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-mono, monospace)",
  },
  btnAdd: {
    padding: "6px 14px",
    background: "rgba(167,139,250,0.08)",
    color: "#a78bfa",
    border: "1px solid rgba(167,139,250,0.2)",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnRemove: {
    background: "none",
    border: "none",
    color: "#71717a",
    cursor: "pointer",
    fontSize: 18,
    padding: "0 4px",
    lineHeight: 1,
  },
  toast: {
    position: "fixed",
    bottom: 24,
    right: 24,
    padding: "12px 20px",
    background: "#12121a",
    border: "1px solid #1e1e2e",
    borderRadius: 8,
    color: "#e4e4e7",
    fontSize: 13,
    fontWeight: 600,
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    zIndex: 1000,
  },
};
