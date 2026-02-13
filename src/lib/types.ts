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
  credits?: number;
  overageRate?: number;
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

export type ExpertCategory =
  | "accounting"
  | "legal"
  | "financial_advisory"
  | "medical"
  | "music_industry"
  | "technical"
  | "hr_people_ops"
  | "insurance"
  | "real_estate"
  | "marketing_brand"
  | "supply_chain"
  | "cybersecurity"
  | "executive_coaching"
  | "academic_research";

export const EXPERT_CATEGORIES: Record<ExpertCategory, { name: string; description: string }> = {
  accounting: { name: "Accountants / CPAs", description: "Tax strategy, bookkeeping review, financial reporting" },
  legal: { name: "Attorneys", description: "Contract review, IP protection, regulatory compliance" },
  financial_advisory: { name: "Financial Advisors", description: "Investment strategy, wealth management, planning" },
  medical: { name: "Medical Professionals", description: "Clinical consultation, health strategy, medical review" },
  music_industry: { name: "Music Industry", description: "Production, licensing, distribution, artist management" },
  technical: { name: "Technical Consultants", description: "Architecture review, technical due diligence, scaling" },
  hr_people_ops: { name: "HR / People Ops", description: "Employment law, compensation, organizational design" },
  insurance: { name: "Insurance", description: "Coverage analysis, risk assessment, claims strategy" },
  real_estate: { name: "Real Estate", description: "Investment analysis, commercial leasing, valuation" },
  marketing_brand: { name: "Marketing / Brand", description: "Brand positioning, campaign strategy, market entry" },
  supply_chain: { name: "Supply Chain / Ops", description: "Logistics optimization, procurement, vendor management" },
  cybersecurity: { name: "Cybersecurity", description: "Compliance, incident response, security architecture" },
  executive_coaching: { name: "Executive Coaches", description: "Leadership development, C-suite transition" },
  academic_research: { name: "Academic Researchers", description: "Peer review, research methodology, domain expertise" },
};

export interface ExpertCard {
  id: string;
  name: string;
  category: ExpertCategory;
  credentials: string;
  bio: string;
  avatarUrl: string;
  linkedinUrl?: string;
  yearsExperience: number;
  creditCost: number;
  costBasis: number;
  rating?: number;
  sessionsCompleted?: number;
  availability: string[];
  status: "active" | "pending" | "inactive";
}
