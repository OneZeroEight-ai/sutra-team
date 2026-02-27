import type {
  RightsAgent,
  ExpertAgent,
  PricingTier,
  DeliberationStep,
  DifferentiationMetric,
  EcosystemLink,
  NavLink,
  SecurityLayer,
  TemplateCategory,
  CouncilAgent,
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
  "legal-analyst": "/avatars/LegalAnalyst.png",
  "financial-strategist": "/avatars/FinancialStrategist.png",
  "technical-architect": "/avatars/TechnicalArchitect.png",
  "market-analyst": "/avatars/MarketAnalyst.png",
  "risk-assessor": "/avatars/RiskAssessor.png",
  "growth-strategist": "/avatars/GrowthStrategist.png",
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
    credits: 5,
    includes: [
      "5 credits/month",
      "Single agent only",
      "Text + voice sessions",
      "Session memory",
      "Basic differentiation score",
    ],
    connect_modes: [],
    target_user: "Try the platform",
  },
  {
    name: "Creator",
    price: "$49",
    period: "/mo",
    credits: 30,
    overageRate: 5.0,
    includes: [
      "30 credits/month",
      "Council of Rights access",
      "Voice + phone sessions",
      "All skill deliverables",
      "Interaction memory",
      "Knowledge base (1GB)",
      "Overage: $5/credit",
    ],
    connect_modes: ["voice", "phone"],
    target_user: "Solo professionals, coaches",
  },
  {
    name: "Professional",
    price: "$149",
    period: "/mo",
    credits: 75,
    overageRate: 4.0,
    includes: [
      "75 credits/month",
      "Rights + Experts + Combined",
      "Video + Voice + Phone",
      "All skill deliverables",
      "Premium deliverables",
      "Full memory system",
      "Knowledge base (10GB)",
      "API access",
      "Overage: $4/credit",
    ],
    connect_modes: ["video", "voice", "phone"],
    target_user: "Founders, executives, consultants",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    includes: [
      "Custom credit allocation",
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
      "$5/credit consumed",
      "All council modes",
      "Streaming support",
      "Webhook integrations",
      "Full documentation",
      "Developer support",
    ],
    connect_modes: ["video", "voice", "phone"],
    target_user: "Developers building on platform",
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
  { label: "Agents", href: "/#agents" },
  { label: "Security", href: "/#security" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Book", href: "/book" },
];

// ── New landing page data ──

export const COUNCIL_OF_RIGHTS: CouncilAgent[] = [
  { name: "Wisdom Judge", aspect: "Right View", icon: "\u2696\uFE0F", desc: "Strategic analysis & evidence evaluation" },
  { name: "The Purpose", aspect: "Right Intention", icon: "\uD83C\uDFAF", desc: "Motivation clarity & values alignment" },
  { name: "Communicator", aspect: "Right Speech", icon: "\uD83D\uDCAC", desc: "Message evaluation & honesty-kindness balance" },
  { name: "Ethics Judge", aspect: "Right Action", icon: "\u26A1", desc: "Ethical impact analysis & consequence modeling" },
  { name: "Sustainer", aspect: "Right Livelihood", icon: "\uD83C\uDF31", desc: "Value creation vs. extraction analysis" },
  { name: "Determined", aspect: "Right Effort", icon: "\uD83D\uDD25", desc: "Priority management & burnout detection" },
  { name: "The Aware", aspect: "Right Mindfulness", icon: "\uD83D\uDC41\uFE0F", desc: "Pattern surfacing & blind spot detection" },
  { name: "The Focused", aspect: "Right Concentration", icon: "\uD83D\uDD2C", desc: "Deep analysis & single-problem immersion" },
];

export const COUNCIL_OF_EXPERTS: CouncilAgent[] = [
  { name: "Legal Analyst", domain: "Contract Law, IP, Compliance", icon: "\uD83D\uDCDC" },
  { name: "Financial Strategist", domain: "Valuation, Fundraising, Unit Economics", icon: "\uD83D\uDCCA" },
  { name: "Tech Architect", domain: "System Design, Architecture, Security", icon: "\uD83C\uDFD7\uFE0F" },
  { name: "Market Analyst", domain: "Industry Analysis, Competitive Intel", icon: "\uD83D\uDCC8" },
  { name: "Risk Assessor", domain: "Risk Frameworks, Probability Modeling", icon: "\uD83D\uDEE1\uFE0F" },
  { name: "Growth Strategist", domain: "GTM, Growth Loops, Scaling", icon: "\uD83D\uDE80" },
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { category: "Healthcare", templates: ["Medical Researcher", "Patient Advocate", "Clinical Coordinator"] },
  { category: "Education", templates: ["Curriculum Designer", "Student Mentor", "Research Assistant"] },
  { category: "Real Estate", templates: ["Property Analyst", "Market Researcher", "Deal Evaluator"] },
  { category: "Creative", templates: ["Content Strategist", "Brand Voice", "Campaign Manager"] },
  { category: "Finance", templates: ["Portfolio Analyst", "Tax Strategist", "Compliance Officer"] },
  { category: "Engineering", templates: ["Code Reviewer", "DevOps Lead", "Security Auditor"] },
  { category: "Household", templates: ["Meal Planner", "Budget Tracker", "Schedule Coordinator"] },
  { category: "Nonprofit", templates: ["Grant Writer", "Volunteer Coordinator", "Impact Analyst"] },
  { category: "Sales", templates: ["Lead Qualifier", "Proposal Writer", "Account Strategist"] },
  { category: "Legal", templates: ["Contract Reviewer", "IP Researcher", "Compliance Checker"] },
  { category: "Music", templates: ["A&R Analyst", "Sync Licensing Scout", "Release Strategist"] },
  { category: "Sports", templates: ["Performance Analyst", "Nutrition Coach", "Scouting Coordinator"] },
];

export const SECURITY_LAYERS: SecurityLayer[] = [
  { name: "KARMA", label: "Budget Enforcement", desc: "Per-agent and per-council token budgets. Never overspend.", native: true, plugin: true },
  { name: "SILA", label: "Audit Trail", desc: "Every agent action logged. Full decision chain transparency.", native: true, plugin: true },
  { name: "METTA", label: "Cryptographic Identity", desc: "Ed25519 keypairs per agent. Verify who said what.", native: true, plugin: true },
  { name: "SANGHA", label: "Skill Vetting", desc: "AST scanning + governed network egress. No rogue skills.", native: true, plugin: true },
  { name: "NIRVANA", label: "Kill Switch", desc: "Council-level emergency halt. Shut down all agents at once.", native: true, plugin: true },
  { name: "DHARMA", label: "Model Permissions", desc: "Per-agent model routing. Claude, OpenAI, Google, local.", native: true, plugin: true },
  { name: "BODHI", label: "Process Isolation", desc: "Agents sandboxed during deliberation. No cross-contamination.", native: true, plugin: false },
  { name: "SUTRA", label: "Value Framework", desc: "Hierarchical ethical principles guiding every response.", native: true, plugin: false },
];

export const NEW_PRICING_TIERS = [
  {
    name: "Explorer",
    price: "$9",
    period: "/mo",
    description: "Start with the full team. Build up to 5 agents.",
    accent: "green",
    features: [
      "15 pre-built PMF specialists",
      "5 custom agents",
      "Dashboard chat",
      "All 32+ skills",
      "Audit trail",
      "BYOK supported",
    ],
    cta: { label: "Get Started", href: "/dashboard.html" },
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "Unlimited agents. Full power. All channels.",
    accent: "accent",
    features: [
      "Everything in Explorer",
      "Unlimited agents",
      "Voice sessions",
      "All channels (Telegram, Slack, Email)",
      "Heartbeat scheduling",
      "Council deliberation skill",
      "Priority support",
    ],
    cta: { label: "Go Pro", href: "/dashboard.html" },
    popular: true,
  },
  {
    name: "International",
    price: "$49",
    period: "/mo",
    description: "Iceland-hosted. Full power. Global privacy.",
    accent: "warm",
    flag: "\uD83C\uDDEE\uD83C\uDDF8",
    features: [
      "Everything in Pro",
      "Iceland server infrastructure",
      "100% renewable energy hosting",
      "GDPR-aligned data jurisdiction",
      "Outside US surveillance scope",
      "Bitcoin / crypto payments accepted",
      "Priority international support",
    ],
    cta: { label: "Go International", href: "/dashboard.html" },
    popular: false,
    paymentMethods: ["\u20BF BTC", "\u039E ETH", "\uD83D\uDCB3 Card", "\uD83C\uDFE6 Wire"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Multiple AI agencies. White-label. SSO. SLA.",
    accent: "purple",
    features: [
      "Everything in International",
      "Custom councils & value frameworks",
      "White-labeling",
      "SSO / SAML",
      "Dedicated support + SLA",
      "Custom model routing",
      "On-prem option",
    ],
    cta: { label: "Contact Sales", href: "/about#contact" },
    popular: false,
    paymentMethods: ["All payment methods accepted"],
  },
];
