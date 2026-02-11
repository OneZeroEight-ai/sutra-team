export interface PersonaIdentity {
  persona_id: string;
  name: string;
  designation: string;
  origin_narrative?: string;
  creator_id: string;
  tagline?: string;
  version: string;
  created_at: string;
  visibility: "private" | "unlisted" | "public" | "enterprise";
}

export interface VoiceParameters {
  tone_descriptors: string[];
  opening_patterns: string[];
  closing_signature: string;
  avoidance_patterns: string[];
  formality_range: [number, number];
}

export interface RightsAgent {
  name: string;
  path_aspect: string;
  pali_name: string;
  functional_domain: string;
  use_cases: string[];
  accent_color: string;
}

export interface ExpertAgent {
  name: string;
  domain: string;
  knowledge_sources: string[];
  accent_color: string;
}

export type CouncilMode = "rights" | "experts" | "combined";
export type ConnectMode = "video" | "voice" | "phone";

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  includes: string[];
  connect_modes: ConnectMode[];
  target_user: string;
  highlighted?: boolean;
}

export interface CouncilSession {
  session_id: string;
  room_name: string;
  council_mode: CouncilMode;
  connect_mode: ConnectMode;
  agents_active: string[];
  status: "waiting" | "deliberating" | "synthesizing" | "complete";
  created_at: string;
}

export interface AgentParticipant {
  persona_id: string;
  name: string;
  path_aspect?: string;
  avatar_url: string;
  is_speaking: boolean;
  perspective_delivered: boolean;
}

export interface SynthesisResult {
  deliberation_id: string;
  agreements: string[];
  tensions: { description: string; agents: string[] }[];
  gaps: string[];
  unified_response: string;
  confidence: number;
}

export interface DeliberationStep {
  step: number;
  name: string;
  description: string;
}

export interface DifferentiationMetric {
  name: string;
  description: string;
  target: number;
  unit: string;
}

export interface EcosystemLink {
  name: string;
  url: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
}
