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
 */
export function flattenPMF(pmf: Record<string, unknown>): Record<string, unknown> {
  const fmt = detectFormat(pmf);

  if (fmt === "layered") {
    return flattenLayered(pmf);
  }
  // Flat or unknown — map from top-level fields
  return flattenFlat(pmf);
}

function flattenFlat(pmf: Record<string, unknown>): Record<string, unknown> {
  const vp = (pmf.voice_parameters || {}) as Record<string, unknown>;
  const vf = (pmf.value_framework || {}) as Record<string, unknown>;
  const sec = (pmf.security || {}) as Record<string, unknown>;
  const mr = (sec.model_routing || {}) as Record<string, unknown>;
  const bc = (pmf.behavioral_constraints || {}) as Record<string, unknown>;
  const diff = (pmf.differentiation || {}) as Record<string, unknown>;
  const hb = (pmf.heartbeat || {}) as Record<string, unknown>;
  const kb = (pmf.knowledge_base || {}) as Record<string, unknown>;

  // Build a system_prompt from origin_narrative or a generated summary
  const origin = pmf.origin_narrative as string | undefined;
  const designation = pmf.designation as string | undefined;
  const systemPrompt = origin || (designation ? `You are ${pmf.name}. ${designation}.` : "");

  // Extract principle names if they're objects
  const principles = Array.isArray(vf.principles)
    ? vf.principles.map((p: unknown) =>
        typeof p === "object" && p !== null ? (p as Record<string, unknown>).name || String(p) : String(p),
      )
    : undefined;

  return {
    name: pmf.name || "Imported Agent",
    system_prompt: systemPrompt,
    model: mr.default || "claude-sonnet-4-5-20250929",
    provider: "anthropic",
    // Identity
    persona_name: pmf.name,
    persona_designation: designation,
    origin_narrative: origin,
    voice_tone: Array.isArray(vp.tone_descriptors) ? vp.tone_descriptors.join(", ") : undefined,
    voice_avoidances: Array.isArray(vp.avoidance_patterns) ? vp.avoidance_patterns.join(", ") : undefined,
    voice_opening_pattern: Array.isArray(vp.opening_patterns) ? vp.opening_patterns[0] : undefined,
    voice_closing_pattern: typeof vp.closing_signature === "string" ? vp.closing_signature : undefined,
    platform_adaptations: vp.platform_adaptations,
    // Knowledge
    domain_expertise: Array.isArray(kb.domain_expertise) ? kb.domain_expertise : undefined,
    knowledge_sources: Array.isArray(kb.core_references) ? kb.core_references : undefined,
    // Values
    value_framework_primary: vf.primary_framework,
    value_principles: principles,
    value_conflict_protocol: typeof vf.uncertainty_protocol === "string" ? vf.uncertainty_protocol : undefined,
    // Capabilities
    installed_skills: Array.isArray(pmf.skills) ? pmf.skills : undefined,
    // Differentiation
    differentiation_statement: diff.differentiation_statement,
    hardcoded_limits: Array.isArray(bc.hardcoded)
      ? bc.hardcoded.map((c: unknown) =>
          typeof c === "object" && c !== null ? (c as Record<string, unknown>).description || JSON.stringify(c) : String(c),
        )
      : undefined,
    softcoded_defaults: Array.isArray(bc.softcoded)
      ? bc.softcoded.map((c: unknown) => {
          if (typeof c === "object" && c !== null) {
            const obj = c as Record<string, unknown>;
            return { rule: obj.description || "", override: obj.override_condition || "" };
          }
          return { rule: String(c), override: "" };
        })
      : undefined,
  };
}

function flattenLayered(pmf: Record<string, unknown>): Record<string, unknown> {
  const layers = pmf.layers as Record<string, unknown>;
  const id = (layers.identity || {}) as Record<string, unknown>;
  const kn = (layers.knowledge || {}) as Record<string, unknown>;
  const mem = (layers.memory || {}) as Record<string, unknown>;
  const val = (layers.values || {}) as Record<string, unknown>;
  const cap = (layers.capabilities || {}) as Record<string, unknown>;
  const vc = (cap.voice_config || {}) as Record<string, unknown>;
  const diff = (layers.differentiation || {}) as Record<string, unknown>;

  return {
    name: pmf.agent_name || id.persona_name || "Imported Agent",
    system_prompt: (id.origin_narrative as string) || "",
    persona_name: id.persona_name,
    persona_designation: id.persona_designation,
    origin_narrative: id.origin_narrative,
    voice_tone: id.voice_tone,
    voice_avoidances: id.voice_avoidances,
    voice_opening_pattern: id.voice_opening_pattern,
    voice_closing_pattern: id.voice_closing_pattern,
    platform_adaptations: id.platform_adaptations,
    domain_expertise: kn.domain_expertise,
    knowledge_sources: kn.knowledge_sources,
    knowledge_documents: kn.knowledge_documents,
    memory_enabled: mem.memory_enabled ?? false,
    memory_tiers: mem.memory_tiers,
    memory_retention_days: mem.memory_retention_days,
    value_framework_primary: val.value_framework_primary,
    value_framework_secondary: val.value_framework_secondary,
    value_principles: val.value_principles,
    value_conflict_protocol: val.value_conflict_protocol,
    uncertainty_expression: val.uncertainty_expression,
    model: cap.model,
    provider: cap.provider,
    monthly_budget_usd: cap.monthly_budget_usd,
    installed_skills: cap.installed_skills,
    conference_group: cap.conference_group,
    llm_base_url: cap.llm_base_url,
    tts_provider: vc.tts_provider,
    tts_voice_id: vc.tts_voice_id,
    tts_voice_name: vc.tts_voice_name,
    voice_speed: vc.voice_speed,
    voice_language: vc.voice_language,
    differentiation_statement: diff.differentiation_statement,
    differentiation_examples: diff.differentiation_examples,
    hardcoded_limits: diff.hardcoded_limits,
    softcoded_defaults: diff.softcoded_defaults,
    escalation_protocol: diff.escalation_protocol,
  };
}
