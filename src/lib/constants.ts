import type {
  RightsAgent,
  ExpertAgent,
  PricingTier,
  DeliberationStep,
  DifferentiationMetric,
  EcosystemLink,
  NavLink,
} from "./types";

export const RIGHTS_AGENTS: RightsAgent[] = [
  {
    name: "The Wisdom Judge",
    path_aspect: "Right View",
    pali_name: "Samma Ditthi",
    functional_domain: "Strategic analysis, evidence evaluation",
    use_cases: [
      "Evaluating competing strategies",
      "Assessing evidence quality",
      "Identifying cognitive biases in reasoning",
    ],
    accent_color: "#a78bfa",
  },
  {
    name: "The Purpose",
    path_aspect: "Right Intention",
    pali_name: "Samma Sankappa",
    functional_domain: "Motivation clarity, values-action alignment",
    use_cases: [
      "Clarifying project goals",
      "Aligning team values with actions",
      "Identifying hidden motivations",
    ],
    accent_color: "#818cf8",
  },
  {
    name: "The Communicator",
    path_aspect: "Right Speech",
    pali_name: "Samma Vaca",
    functional_domain: "Message evaluation, communication design",
    use_cases: [
      "Reviewing public communications",
      "Designing stakeholder messaging",
      "Identifying harmful rhetoric",
    ],
    accent_color: "#6366f1",
  },
  {
    name: "The Ethics Judge",
    path_aspect: "Right Action",
    pali_name: "Samma Kammanta",
    functional_domain: "Ethical impact analysis, consequence modeling",
    use_cases: [
      "Assessing ethical implications of decisions",
      "Modeling downstream consequences",
      "Identifying stakeholder impacts",
    ],
    accent_color: "#f59e0b",
  },
  {
    name: "The Sustainer",
    path_aspect: "Right Livelihood",
    pali_name: "Samma Ajiva",
    functional_domain: "Value creation vs. extraction, sustainability",
    use_cases: [
      "Evaluating business model sustainability",
      "Assessing value creation metrics",
      "Identifying extractive patterns",
    ],
    accent_color: "#10b981",
  },
  {
    name: "The Determined",
    path_aspect: "Right Effort",
    pali_name: "Samma Vayama",
    functional_domain: "Energy allocation, priority management",
    use_cases: [
      "Optimizing resource allocation",
      "Prioritizing competing demands",
      "Identifying wasted effort",
    ],
    accent_color: "#ef4444",
  },
  {
    name: "The Aware",
    path_aspect: "Right Mindfulness",
    pali_name: "Samma Sati",
    functional_domain: "Pattern surfacing, blind spot detection",
    use_cases: [
      "Surfacing hidden patterns",
      "Detecting organizational blind spots",
      "Identifying emerging risks",
    ],
    accent_color: "#ec4899",
  },
  {
    name: "The Focused",
    path_aspect: "Right Concentration",
    pali_name: "Samma Samadhi",
    functional_domain: "Deep analysis, single-problem immersion",
    use_cases: [
      "Deep technical analysis",
      "Root cause investigation",
      "Complex problem decomposition",
    ],
    accent_color: "#06b6d4",
  },
];

export const AGENT_AVATARS: Record<string, string> = {
  "wisdom-judge": "/images/agents/wisdom-judge.png",
  "purpose": "/images/agents/purpose.png",
  "communicator": "/images/agents/communicator.png",
  "ethics-judge": "/images/agents/ethics-judge.png",
  "sustainer": "/images/agents/sustainer.png",
  "determined": "/images/agents/determined.png",
  "aware": "/images/agents/aware.png",
  "focused": "/images/agents/focused.png",
  "sutra": "/images/agents/sutra.png",
};

export const EXPERT_AVATARS: Record<string, string> = {
  "legal-analyst": "/images/agents/sutra.png",
  "financial-strategist": "/images/agents/sutra.png",
  "technical-architect": "/images/agents/sutra.png",
  "market-analyst": "/images/agents/sutra.png",
  "risk-assessor": "/images/agents/sutra.png",
  "growth-strategist": "/images/agents/sutra.png",
};

export const EXPERT_AGENTS: ExpertAgent[] = [
  {
    name: "Legal Analyst",
    domain: "Legal & Compliance",
    knowledge_sources: [
      "Regulatory frameworks",
      "Case law databases",
      "Compliance standards",
    ],
    accent_color: "#6366f1",
  },
  {
    name: "Financial Strategist",
    domain: "Finance & Economics",
    knowledge_sources: [
      "Financial modeling",
      "Market data",
      "Economic indicators",
    ],
    accent_color: "#10b981",
  },
  {
    name: "Technical Architect",
    domain: "Technology & Engineering",
    knowledge_sources: [
      "System design patterns",
      "Technology stacks",
      "Architecture frameworks",
    ],
    accent_color: "#06b6d4",
  },
  {
    name: "Market Analyst",
    domain: "Market Intelligence",
    knowledge_sources: [
      "Industry reports",
      "Competitive analysis",
      "Consumer research",
    ],
    accent_color: "#f59e0b",
  },
  {
    name: "Risk Assessor",
    domain: "Risk Management",
    knowledge_sources: [
      "Risk frameworks",
      "Historical incident data",
      "Probability modeling",
    ],
    accent_color: "#ef4444",
  },
  {
    name: "Growth Strategist",
    domain: "Growth & GTM",
    knowledge_sources: [
      "Growth frameworks",
      "GTM playbooks",
      "Scaling case studies",
    ],
    accent_color: "#ec4899",
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Explorer",
    price: "Free",
    includes: [
      "1 persona",
      "10 deliberations/month",
      "Text only",
      "Session memory",
      "Basic differentiation score",
    ],
    connect_modes: [],
    target_user: "Try the platform",
  },
  {
    name: "Creator",
    price: "$29",
    period: "/mo",
    includes: [
      "3 personas",
      "100 deliberations/month",
      "Council of Rights access",
      "Voice sessions",
      "Interaction memory",
      "Knowledge base (1GB)",
      "Differentiation portfolio",
    ],
    connect_modes: ["voice"],
    target_user: "Individual creators",
  },
  {
    name: "Professional",
    price: "$99",
    period: "/mo",
    includes: [
      "10 personas",
      "500 deliberations/month",
      "All council modes",
      "Combined Council access",
      "Video + Voice + Phone",
      "Full memory system",
      "Knowledge base (10GB)",
      "API access",
      "Priority support",
    ],
    connect_modes: ["video", "voice", "phone"],
    target_user: "Teams & professionals",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    includes: [
      "Unlimited personas",
      "Custom deliberation limits",
      "Custom councils",
      "Dedicated phone numbers",
      "White-label deployment",
      "SSO / SAML",
      "SLA guarantee",
      "Dedicated support",
      "On-premise option",
    ],
    connect_modes: ["video", "voice", "phone"],
    target_user: "Organizations at scale",
  },
  {
    name: "API Developer",
    price: "Usage-based",
    includes: [
      "All API endpoints",
      "LiveKit room provisioning",
      "Per-deliberation pricing",
      "Streaming support",
      "Webhook integrations",
      "Full documentation",
      "Developer support",
    ],
    connect_modes: ["video", "voice", "phone"],
    target_user: "Developers & integrators",
  },
];

export const DELIBERATION_STEPS: DeliberationStep[] = [
  {
    step: 1,
    name: "Input Reception",
    description: "API Gateway validates query and metadata",
  },
  {
    step: 2,
    name: "Routing",
    description:
      "Council Router determines mode (Rights/Experts/Combined) and agents",
  },
  {
    step: 3,
    name: "Context Assembly",
    description:
      "Memory + Knowledge Base builds per-agent context packages",
  },
  {
    step: 4,
    name: "Parallel Deliberation",
    description: "All agents process the query simultaneously",
  },
  {
    step: 5,
    name: "Perspective Collection",
    description:
      "Aggregator collects responses with confidence, sources, and tensions",
  },
  {
    step: 6,
    name: "Synthesis",
    description:
      "Sutra analyzes all perspectives: agreement mapping, tension identification, gap detection, hierarchical resolution",
  },
  {
    step: 7,
    name: "Output Formatting",
    description: "Response formatted per user preferences and platform",
  },
  {
    step: 8,
    name: "Memory Update",
    description:
      "Interaction stored for all participants and synthesis layer",
  },
];

export const DIFFERENTIATION_METRICS: DifferentiationMetric[] = [
  {
    name: "Voice Consistency",
    description: "Cosine similarity across 100 prompts",
    target: 0.85,
    unit: "> 0.85",
  },
  {
    name: "Base Model Divergence",
    description: "Semantic distance from base model",
    target: 0.3,
    unit: "> 0.30",
  },
  {
    name: "Value Framework Adherence",
    description: "Conflict test case pass rate",
    target: 0.9,
    unit: "> 0.90",
  },
  {
    name: "Knowledge Integration",
    description: "Correct citation rate",
    target: 0.8,
    unit: "> 0.80",
  },
  {
    name: "Signature Consistency",
    description: "Voice signature maintained across contexts",
    target: 0.95,
    unit: "> 0.95",
  },
  {
    name: "Cross-Session Continuity",
    description: "Memory recall accuracy",
    target: 0.85,
    unit: "> 0.85",
  },
];

export const ECOSYSTEM_LINKS: EcosystemLink[] = [
  {
    name: "SammaSuit.com",
    url: "https://sammasuit.com",
    description: "Infrastructure & hosting platform",
  },
  {
    name: "OneZeroEight.ai",
    url: "https://onezeroeight.ai",
    description: "Research & parent company",
  },
  {
    name: "Sutra.exchange",
    url: "https://sutra.exchange",
    description: "Token ecosystem",
  },
];

export const NAV_LINKS: NavLink[] = [
  { label: "Council", href: "/council" },
  { label: "Connect", href: "/connect" },
  { label: "Personas", href: "/personas" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "About", href: "/about" },
];
