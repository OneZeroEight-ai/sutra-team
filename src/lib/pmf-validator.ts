/**
 * PMF (Portable Mind Format) schema validator.
 *
 * Supports TWO PMF structures:
 *
 * 1. FLAT (spec format) — top-level name, designation, skills[], voice_parameters,
 *    value_framework, heartbeat, channels, security, behavioral_constraints, etc.
 *    Identified by: schema_version field, or name + voice_parameters at top level.
 *
 * 2. LAYERED (persona-editor export) — format: "portable-mind-format" with
 *    layers: { identity, knowledge, memory, values, capabilities, differentiation }
 *    Identified by: format === "portable-mind-format" && layers object.
 */

export interface PMFValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  parsed: Record<string, unknown> | null;
  /** Whether the parsed file uses layered (persona-editor) or flat (spec) format */
  format: "flat" | "layered" | "unknown";
}

/**
 * Detect whether a parsed PMF object is flat-spec or layered-export format.
 */
function detectFormat(obj: Record<string, unknown>): "flat" | "layered" | "unknown" {
  if (obj.format === "portable-mind-format" && obj.layers) return "layered";
  if (obj.schema_version || (obj.name && obj.voice_parameters)) return "flat";
  if (obj.layers) return "layered";
  return "unknown";
}

export function validatePMF(raw: string): PMFValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Parse JSON
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { valid: false, errors: [`Invalid JSON: ${msg}`], warnings: [], parsed: null, format: "unknown" };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { valid: false, errors: ["PMF must be a JSON object."], warnings: [], parsed: null, format: "unknown" };
  }

  const fmt = detectFormat(parsed);

  if (fmt === "flat") {
    // ── Flat PMF spec format ──
    if (!parsed.name || typeof parsed.name !== "string") {
      errors.push('Missing required field: "name" (string).');
    }
    if (!parsed.designation || typeof parsed.designation !== "string") {
      warnings.push("No designation provided.");
    }
    if (!parsed.voice_parameters || typeof parsed.voice_parameters !== "object") {
      warnings.push("No voice_parameters defined. Agent will use default voice.");
    } else {
      const vp = parsed.voice_parameters as Record<string, unknown>;
      if (!Array.isArray(vp.tone_descriptors) || vp.tone_descriptors.length === 0) {
        warnings.push("voice_parameters.tone_descriptors is empty. Consider defining a voice.");
      }
    }
    if (!parsed.value_framework || typeof parsed.value_framework !== "object") {
      warnings.push("No value_framework defined. Agent will use default value framework.");
    }
    if (!parsed.skills || !Array.isArray(parsed.skills) || parsed.skills.length === 0) {
      warnings.push("No skills defined. Agent will only be able to chat.");
    }
    if (!parsed.channels || !Array.isArray(parsed.channels) || parsed.channels.length === 0) {
      warnings.push("No channels defined. Agent will only be available on the dashboard.");
    }
    if (!parsed.behavioral_constraints) {
      warnings.push("No behavioral constraints defined. Consider adding hardcoded limits.");
    }
    if (!parsed.differentiation) {
      warnings.push("No differentiation block. Agent may behave like a generic chatbot.");
    }
  } else if (fmt === "layered") {
    // ── Layered persona-editor export format ──
    const layers = parsed.layers as Record<string, unknown>;
    const identity = layers.identity as Record<string, unknown> | undefined;
    if (!identity) {
      errors.push('Missing required layer: "identity".');
    }
    if (!parsed.agent_name && !identity?.persona_name) {
      errors.push('Missing agent name. Set "agent_name" or "layers.identity.persona_name".');
    }
    if (!layers.values) {
      warnings.push("No values layer defined. Agent will use default value framework.");
    }
    if (!layers.knowledge) {
      warnings.push("No knowledge layer. Agent will rely on base model knowledge only.");
    }
    if (!layers.capabilities) {
      warnings.push("No capabilities layer. Default model and budget will be used.");
    }
    if (!layers.differentiation) {
      warnings.push("No differentiation layer. Agent may behave like a generic chatbot.");
    }
    if (!layers.memory) {
      warnings.push("No memory layer. Agent memory will be disabled.");
    }
  } else {
    // Unknown format — require at minimum a name
    if (!parsed.name && !parsed.agent_name && !parsed.persona_name) {
      errors.push("Missing agent name. Provide a name, agent_name, or persona_name field.");
    }
    warnings.push("Unrecognized PMF format. File will be imported as raw agent JSON.");
  }

  // Size check
  const byteSize = new TextEncoder().encode(raw).length;
  if (byteSize > 500_000) {
    errors.push(`PMF file is ${Math.round(byteSize / 1000)}KB. Maximum is 500KB.`);
  } else if (byteSize > 100_000) {
    warnings.push(`PMF file is ${Math.round(byteSize / 1000)}KB. Consider trimming knowledge_base.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    parsed: errors.length === 0 ? parsed : null,
    format: fmt,
  };
}

/**
 * Flatten a PMF file into the shape the Samma Suit API expects for agent creation.
 * Handles both flat (spec) and layered (persona-editor) formats.
 * Critically, builds a COMPREHENSIVE system_prompt from ALL PMF fields so
 * the agent's persona actually governs LLM responses.
 */
export function flattenPMF(pmf: Record<string, unknown>): Record<string, unknown> {
  const fmt = detectFormat(pmf);

  if (fmt === "layered") {
    return flattenLayered(pmf);
  }
  return flattenFlat(pmf);
}

// ── Helpers ──────────────────────────────────────────────────────

type R = Record<string, unknown>;

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

// ── Build comprehensive system prompt from flat PMF ──────────────

function buildSystemPromptFromFlatPMF(pmf: R): string {
  const sections: string[] = [];

  // ── Identity ──
  sections.push(`You are ${pmf.name}.`);
  if (pmf.designation) sections.push(str(pmf.designation));
  if (pmf.origin_narrative) sections.push(str(pmf.origin_narrative));
  if (pmf.tagline) sections.push(`Tagline: "${pmf.tagline}"`);

  // ── Voice ──
  const vp = (pmf.voice_parameters || {}) as R;
  const voiceParts: string[] = [];
  if (arr(vp.tone_descriptors).length) {
    voiceParts.push(`Your tone is: ${(vp.tone_descriptors as string[]).join(", ")}.`);
  }
  if (arr(vp.opening_patterns).length) {
    voiceParts.push(`Opening patterns: ${(vp.opening_patterns as string[]).join(" | ")}`);
  }
  if (vp.closing_signature) {
    voiceParts.push(`Closing signature: ${vp.closing_signature}`);
  }
  if (arr(vp.avoidance_patterns).length) {
    voiceParts.push(`NEVER do these: ${(vp.avoidance_patterns as string[]).join("; ")}`);
  }
  if (vp.vocabulary_preferences && typeof vp.vocabulary_preferences === "object") {
    const entries = Object.entries(vp.vocabulary_preferences as Record<string, string>);
    if (entries.length) {
      voiceParts.push(
        `Vocabulary: ${entries.map(([k, v]) => `Use "${v}" instead of "${k}"`).join(". ")}`,
      );
    }
  }
  if (vp.response_length) {
    voiceParts.push(`Response length: ${vp.response_length}`);
  }
  if (vp.formality_range && Array.isArray(vp.formality_range)) {
    voiceParts.push(`Formality range: ${vp.formality_range[0]}-${vp.formality_range[1]} (0=casual, 10=formal)`);
  }
  if (vp.platform_adaptations && typeof vp.platform_adaptations === "object") {
    for (const [platform, config] of Object.entries(vp.platform_adaptations as Record<string, R>)) {
      const parts = [platform + ":"];
      if (config.tone_shift) parts.push(str(config.tone_shift));
      if (config.max_length) parts.push(`(max ${config.max_length} chars)`);
      if (config.hashtag_limit) parts.push(`(max ${config.hashtag_limit} hashtags)`);
      if (config.format_preference) parts.push(`format: ${config.format_preference}`);
      voiceParts.push(`On ${parts.join(" ")}`);
    }
  }
  if (arr(vp.example_phrases).length) {
    voiceParts.push(
      `Example phrases that capture your voice: ${(vp.example_phrases as string[]).map((p) => `"${p}"`).join("; ")}`,
    );
  }
  if (voiceParts.length) {
    sections.push("\n## VOICE\n" + voiceParts.join("\n"));
  }

  // ── Value Framework ──
  const vf = (pmf.value_framework || {}) as R;
  const valueParts: string[] = [];
  if (vf.primary_framework) {
    valueParts.push(`Primary framework: ${vf.primary_framework}`);
  }
  if (arr(vf.principles).length) {
    valueParts.push("Principles (ranked by priority):");
    for (const p of vf.principles as R[]) {
      valueParts.push(`  #${p.rank || "?"} ${p.name}: ${p.description || ""}`);
    }
  }
  if (vf.uncertainty_protocol) {
    valueParts.push(`When uncertain: ${vf.uncertainty_protocol}`);
  }
  if (valueParts.length) {
    sections.push("\n## VALUES\n" + valueParts.join("\n"));
  }

  // ── Behavioral Constraints ──
  const bc = (pmf.behavioral_constraints || {}) as R;
  const constraintParts: string[] = [];
  if (arr(bc.hardcoded).length) {
    constraintParts.push("ABSOLUTE CONSTRAINTS (never violate):");
    for (const c of bc.hardcoded as R[]) {
      constraintParts.push(`  - [${c.type || "rule"}] ${c.description}`);
    }
  }
  if (arr(bc.softcoded).length) {
    constraintParts.push("Default behaviors (can be overridden when noted):");
    for (const c of bc.softcoded as R[]) {
      constraintParts.push(
        `  - ${c.description}${c.override_condition ? ` (override: ${c.override_condition})` : ""}`,
      );
    }
  }
  if (arr(bc.escalation_rules).length) {
    constraintParts.push("Escalation rules:");
    for (const r of bc.escalation_rules as R[]) {
      constraintParts.push(`  - When: ${r.trigger} → Action: ${r.action}`);
    }
  }
  if (arr(bc.boundary_definitions).length) {
    constraintParts.push("Scope boundaries:");
    for (const b of bc.boundary_definitions as string[]) {
      constraintParts.push(`  - ${b}`);
    }
  }
  if (constraintParts.length) {
    sections.push("\n## CONSTRAINTS\n" + constraintParts.join("\n"));
  }

  // ── Knowledge Base ──
  const kb = (pmf.knowledge_base || {}) as R;
  const knowledgeParts: string[] = [];
  if (arr(kb.core_references).length) {
    for (const ref of kb.core_references as R[]) {
      knowledgeParts.push(`Reference: ${ref.title} (${ref.type}, source: ${ref.source || "n/a"})`);
      if (arr(ref.key_passages).length) {
        for (const p of ref.key_passages as string[]) {
          knowledgeParts.push(`  - ${p}`);
        }
      }
      if (ref.usage_guidance) {
        knowledgeParts.push(`  Usage: ${ref.usage_guidance}`);
      }
    }
  }
  if (arr(kb.domain_expertise).length) {
    knowledgeParts.push(`Domain expertise: ${(kb.domain_expertise as string[]).join(", ")}`);
  }
  if (arr(kb.knowledge_gaps).length) {
    knowledgeParts.push(
      `Knowledge gaps (defer on these topics): ${(kb.knowledge_gaps as string[]).join("; ")}`,
    );
  }
  if (knowledgeParts.length) {
    sections.push("\n## KNOWLEDGE\n" + knowledgeParts.join("\n"));
  }

  // ── Differentiation ──
  const diff = (pmf.differentiation || {}) as R;
  const diffParts: string[] = [];
  if (diff.differentiation_statement) {
    diffParts.push(str(diff.differentiation_statement));
  }
  if (arr(diff.base_model_divergence_points).length) {
    diffParts.push("How you differ from a generic AI:");
    for (const d of diff.base_model_divergence_points as string[]) {
      diffParts.push(`  - ${d}`);
    }
  }
  if (arr(diff.signature_elements).length) {
    diffParts.push("Signature elements in every response:");
    for (const s of diff.signature_elements as string[]) {
      diffParts.push(`  - ${s}`);
    }
  }
  if (diffParts.length) {
    sections.push("\n## DIFFERENTIATION\n" + diffParts.join("\n"));
  }

  // ── Skills & Channels ──
  const opParts: string[] = [];
  if (arr(pmf.skills).length) {
    opParts.push(`Available skills: ${(pmf.skills as string[]).join(", ")}`);
  }
  if (arr(pmf.channels).length) {
    opParts.push(`Active channels: ${(pmf.channels as string[]).join(", ")}`);
  }
  const hb = (pmf.heartbeat || {}) as R;
  if (arr(hb.schedules).length) {
    opParts.push("Scheduled tasks:");
    for (const s of hb.schedules as R[]) {
      opParts.push(`  - ${s.name}: ${s.action} (${s.cron})`);
    }
  }
  if (opParts.length) {
    sections.push("\n## OPERATIONAL\n" + opParts.join("\n"));
  }

  return sections.join("\n\n");
}

// ── Build comprehensive system prompt from layered PMF ───────────

function buildSystemPromptFromLayeredPMF(pmf: R): string {
  const layers = pmf.layers as R;
  const id = (layers.identity || {}) as R;
  const val = (layers.values || {}) as R;
  const diff = (layers.differentiation || {}) as R;
  const kn = (layers.knowledge || {}) as R;

  const sections: string[] = [];

  // Identity
  const name = pmf.agent_name || id.persona_name || "Agent";
  sections.push(`You are ${name}.`);
  if (id.persona_designation) sections.push(str(id.persona_designation));
  if (id.origin_narrative) sections.push(str(id.origin_narrative));

  // Voice
  const voiceParts: string[] = [];
  if (id.voice_tone) voiceParts.push(`Your tone is: ${id.voice_tone}.`);
  if (id.voice_avoidances) voiceParts.push(`NEVER: ${id.voice_avoidances}`);
  if (id.voice_opening_pattern) voiceParts.push(`Opening: ${id.voice_opening_pattern}`);
  if (id.voice_closing_pattern) voiceParts.push(`Closing: ${id.voice_closing_pattern}`);
  if (voiceParts.length) sections.push("\n## VOICE\n" + voiceParts.join("\n"));

  // Values
  const valueParts: string[] = [];
  if (val.value_framework_primary) valueParts.push(`Primary framework: ${val.value_framework_primary}`);
  if (arr(val.value_principles).length) {
    valueParts.push("Principles:");
    for (const p of val.value_principles as string[]) {
      valueParts.push(`  - ${p}`);
    }
  }
  if (val.value_conflict_protocol) valueParts.push(`Conflict protocol: ${val.value_conflict_protocol}`);
  if (valueParts.length) sections.push("\n## VALUES\n" + valueParts.join("\n"));

  // Constraints / Differentiation
  const diffParts: string[] = [];
  if (diff.differentiation_statement) diffParts.push(str(diff.differentiation_statement));
  if (arr(diff.hardcoded_limits).length) {
    diffParts.push("ABSOLUTE CONSTRAINTS:");
    for (const c of diff.hardcoded_limits as string[]) {
      diffParts.push(`  - ${c}`);
    }
  }
  if (diffParts.length) sections.push("\n## DIFFERENTIATION & CONSTRAINTS\n" + diffParts.join("\n"));

  // Knowledge
  if (arr(kn.domain_expertise).length) {
    const domains = (kn.domain_expertise as R[]).map((d) => `${d.domain} (${d.depth})`).join(", ");
    sections.push(`\n## KNOWLEDGE\nDomain expertise: ${domains}`);
  }

  return sections.join("\n\n");
}

// ── Flatten functions ────────────────────────────────────────────

function flattenFlat(pmf: R): R {
  const sec = (pmf.security || {}) as R;
  const mr = (sec.model_routing || {}) as R;

  return {
    name: pmf.name || "Imported Agent",
    system_prompt: buildSystemPromptFromFlatPMF(pmf),
    model: str(mr.default) || "claude-sonnet-4-5-20250929",
    provider: "anthropic",
  };
}

function flattenLayered(pmf: R): R {
  const layers = pmf.layers as R;
  const id = (layers.identity || {}) as R;
  const cap = (layers.capabilities || {}) as R;

  return {
    name: pmf.agent_name || id.persona_name || "Imported Agent",
    system_prompt: buildSystemPromptFromLayeredPMF(pmf),
    model: cap.model || undefined,
    provider: cap.provider || undefined,
    monthly_budget_usd: cap.monthly_budget_usd,
  };
}
