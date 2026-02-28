/**
 * PMF (Portable Mind Format) schema validator.
 *
 * Used both server-side (API route) and referenced conceptually
 * by the dashboard.html client-side validator.
 *
 * The PMF format wraps agent configuration into 6 layers:
 *   identity, knowledge, memory, values, capabilities, differentiation
 */

export interface PMFValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  parsed: PMFFile | null;
}

export interface PMFFile {
  format: string;
  version?: string;
  exported_at?: string;
  exported_from?: string;
  agent_name: string;
  layers: {
    identity: {
      persona_name?: string | null;
      persona_designation?: string | null;
      origin_narrative?: string | null;
      voice_tone?: string | null;
      voice_avoidances?: string | null;
      voice_opening_pattern?: string | null;
      voice_closing_pattern?: string | null;
      platform_adaptations?: Record<string, string> | null;
    };
    knowledge?: {
      domain_expertise?: { domain: string; depth: string }[] | null;
      knowledge_sources?: string[] | null;
      knowledge_documents?: { name: string; type: string; url?: string }[] | null;
    };
    memory?: {
      memory_enabled?: boolean;
      memory_tiers?: string[] | null;
      memory_retention_days?: number | null;
    };
    values: {
      value_framework_primary?: string | null;
      value_framework_secondary?: string | null;
      value_principles?: string[] | null;
      value_conflict_protocol?: string | null;
      uncertainty_expression?: string | null;
    };
    capabilities?: {
      model?: string | null;
      provider?: string | null;
      monthly_budget_usd?: number;
      installed_skills?: string[];
      conference_group?: string[] | null;
      llm_base_url?: string | null;
      voice_config?: {
        tts_provider?: string | null;
        tts_voice_id?: string | null;
        tts_voice_name?: string | null;
        voice_speed?: number;
        voice_language?: string | null;
      };
    };
    differentiation?: {
      differentiation_statement?: string | null;
      differentiation_examples?: { question: string; answer: string }[] | null;
      hardcoded_limits?: string[] | null;
      softcoded_defaults?: { rule: string; override: string }[] | null;
      escalation_protocol?: string | null;
    };
  };
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
    return { valid: false, errors: [`Invalid JSON: ${msg}`], warnings: [], parsed: null };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { valid: false, errors: ["PMF must be a JSON object."], warnings: [], parsed: null };
  }

  // Check format marker
  if (parsed.format !== "portable-mind-format") {
    // Allow raw agent JSON or alternative PMF formats — warn but don't reject
    warnings.push(
      'Missing format: "portable-mind-format". File will be treated as raw agent JSON.',
    );
  }

  // Check for layered structure
  const layers = parsed.layers as Record<string, unknown> | undefined;
  if (parsed.format === "portable-mind-format" && !layers) {
    errors.push('PMF files must have a "layers" object.');
  }

  if (layers && typeof layers === "object") {
    // Required: identity layer with at least a name
    const identity = layers.identity as Record<string, unknown> | undefined;
    if (!identity) {
      errors.push('Missing required layer: "identity"');
    }

    // Required: values layer
    const values = layers.values as Record<string, unknown> | undefined;
    if (!values) {
      warnings.push("No values layer defined. Agent will use default value framework.");
    }

    // Agent name
    if (!parsed.agent_name && !identity?.persona_name) {
      errors.push('Missing agent name. Set "agent_name" or "layers.identity.persona_name".');
    }

    // Warnings for missing optional layers
    if (!layers.knowledge) {
      warnings.push("No knowledge layer. Agent will rely on base model knowledge only.");
    }
    if (!layers.capabilities) {
      warnings.push("No capabilities layer. Default model and budget will be used.");
    }
    if (!layers.differentiation) {
      warnings.push(
        "No differentiation layer. Without this, the agent may behave like a generic chatbot.",
      );
    }
    if (!layers.memory) {
      warnings.push("No memory layer. Agent memory will be disabled.");
    }

    // Validate skill array types
    const caps = layers.capabilities as Record<string, unknown> | undefined;
    if (caps?.installed_skills && !Array.isArray(caps.installed_skills)) {
      errors.push("capabilities.installed_skills must be an array of strings.");
    }
  } else if (!layers && parsed.format === "portable-mind-format") {
    // Already reported above
  } else if (!layers) {
    // Raw agent JSON — check for a name at minimum
    if (!parsed.name && !parsed.agent_name && !parsed.persona_name) {
      errors.push("Missing agent name. Provide a name, agent_name, or persona_name field.");
    }
  }

  // Size check
  const byteSize = new TextEncoder().encode(raw).length;
  if (byteSize > 500_000) {
    errors.push(`PMF file is ${Math.round(byteSize / 1000)}KB. Maximum is 500KB.`);
  } else if (byteSize > 100_000) {
    warnings.push(
      `PMF file is ${Math.round(byteSize / 1000)}KB. Consider trimming knowledge_base.`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    parsed: errors.length === 0 ? (parsed as unknown as PMFFile) : null,
  };
}

/**
 * Flatten a PMF file's layers into the flat agent-data shape
 * that the Samma Suit API and persona-editor expect.
 */
export function flattenPMF(
  pmf: PMFFile,
): Record<string, unknown> {
  const l = pmf.layers;
  return {
    name: pmf.agent_name || l.identity?.persona_name || "Imported Agent",
    system_prompt: l.identity?.origin_narrative || "",
    // Identity
    persona_name: l.identity?.persona_name,
    persona_designation: l.identity?.persona_designation,
    origin_narrative: l.identity?.origin_narrative,
    voice_tone: l.identity?.voice_tone,
    voice_avoidances: l.identity?.voice_avoidances,
    voice_opening_pattern: l.identity?.voice_opening_pattern,
    voice_closing_pattern: l.identity?.voice_closing_pattern,
    platform_adaptations: l.identity?.platform_adaptations,
    // Knowledge
    domain_expertise: l.knowledge?.domain_expertise,
    knowledge_sources: l.knowledge?.knowledge_sources,
    knowledge_documents: l.knowledge?.knowledge_documents,
    // Memory
    memory_enabled: l.memory?.memory_enabled ?? false,
    memory_tiers: l.memory?.memory_tiers,
    memory_retention_days: l.memory?.memory_retention_days,
    // Values
    value_framework_primary: l.values?.value_framework_primary,
    value_framework_secondary: l.values?.value_framework_secondary,
    value_principles: l.values?.value_principles,
    value_conflict_protocol: l.values?.value_conflict_protocol,
    uncertainty_expression: l.values?.uncertainty_expression,
    // Capabilities
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
    // Differentiation
    differentiation_statement: l.differentiation?.differentiation_statement,
    differentiation_examples: l.differentiation?.differentiation_examples,
    hardcoded_limits: l.differentiation?.hardcoded_limits,
    softcoded_defaults: l.differentiation?.softcoded_defaults,
    escalation_protocol: l.differentiation?.escalation_protocol,
  };
}

/** Quick summary for previewing a PMF before import. */
export function pmfSummary(pmf: PMFFile) {
  const l = pmf.layers;
  return {
    name: pmf.agent_name || l.identity?.persona_name || "Unnamed",
    designation: l.identity?.persona_designation || "",
    tone: l.identity?.voice_tone || "",
    skillCount: l.capabilities?.installed_skills?.length || 0,
    hasMemory: !!l.memory?.memory_enabled,
    hasValues: !!(l.values?.value_framework_primary),
    hasDifferentiation: !!l.differentiation?.differentiation_statement,
    principleCount: l.values?.value_principles?.length || 0,
    model: l.capabilities?.model || "default",
    provider: l.capabilities?.provider || "anthropic",
  };
}
