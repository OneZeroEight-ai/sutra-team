// Sutra.team Stripe Configuration — Credit-Based Pricing

export const STRIPE_CONFIG = {
  // Subscription tiers
  plans: {
    creator: {
      priceId: "price_1T05jIGBRiRBfxh90VA2WpMq",
      name: "Creator",
      price: 49,
      credits: 30,
      overageRate: 5.0,
      overagePriceId: "price_1T05rBGBRiRBfxh9cBp12Ik8",
      councilAccess: ["rights"] as string[],
    },
    professional: {
      priceId: "price_1T05m1GBRiRBfxh9taePMHIU",
      name: "Professional",
      price: 149,
      credits: 75,
      overageRate: 4.0,
      overagePriceId: "price_1T05t4GBRiRBfxh90gCgq9ck",
      councilAccess: ["rights", "experts", "combined"] as string[],
    },
  },

  // Credit packs (one-time purchases)
  creditPacks: {
    pack10: {
      priceId: "price_1T05vIGBRiRBfxh9Tpna2rrM",
      credits: 10,
      price: 45,
      perCredit: 4.5,
    },
    pack25: {
      priceId: "price_1T05xqGBRiRBfxh9odEkn4ZH",
      credits: 25,
      price: 100,
      perCredit: 4.0,
    },
  },

  // Expert sessions (outside credit system)
  expertSession: {
    priceId: "price_1T060XGBRiRBfxh9H688YEQv",
    price: 79,
    description: "30-minute video consultation with licensed professional",
  },

  // Credit costs per deliverable
  creditCosts: {
    // Tier 1: Conversational
    quickQuestion: 1,
    voiceSession: 1,
    phoneCall: 1,
    // Tier 2: Council Deliberations
    rightsCouncil: 3,
    expertCouncil: 3,
    combinedCouncil: 5,
    // Tier 3: Skill Deliverables
    pressRelease: 5,
    investorUpdate: 5,
    socialMediaLaunch: 5,
    blogPost: 5,
    emailOutreach: 3,
    pitchDeck: 8,
    growthPlaybook: 10,
    financialModel: 8,
    architectureDoc: 8,
    comparisonPage: 5,
    explainerScript: 3,
    faqContent: 3,
    termsOfService: 8,
    privacyPolicy: 8,
    // Tier 4: Premium Deliverables
    businessPlan: 20,
    dueDiligenceReport: 20,
    strategicAudit: 15,
    bookPublication: 50,
  },
} as const;

// Map tier names to Stripe price IDs (used by checkout route)
export const TIER_PRICE_MAP: Record<string, string> = {
  Creator: STRIPE_CONFIG.plans.creator.priceId,
  Professional: STRIPE_CONFIG.plans.professional.priceId,
};

// Deliverable menu for frontend display
export interface DeliverableItem {
  name: string;
  credits: number | null;
  price?: number;
  description: string;
}

export interface DeliverableCategory {
  category: string;
  items: DeliverableItem[];
}

export const DELIVERABLE_MENU: DeliverableCategory[] = [
  {
    category: "Conversational",
    items: [
      { name: "Quick Question", credits: 1, description: "Single agent response" },
      { name: "Voice Session", credits: 1, description: "5-minute voice conversation" },
      { name: "Phone Call", credits: 1, description: "Dial-in session" },
    ],
  },
  {
    category: "Council Deliberations",
    items: [
      { name: "Rights Council Opinion", credits: 3, description: "8 principled agents + synthesis" },
      { name: "Expert Council Analysis", credits: 3, description: "6 domain experts + synthesis" },
      { name: "Combined Council", credits: 5, description: "Full 14-agent deliberation" },
    ],
  },
  {
    category: "Skill Deliverables",
    items: [
      { name: "Press Release", credits: 5, description: "Publication-ready announcement" },
      { name: "Investor Update", credits: 5, description: "Monthly/quarterly investor email" },
      { name: "Social Media Launch Pack", credits: 5, description: "Twitter, LinkedIn, Instagram, Product Hunt" },
      { name: "Blog Post", credits: 5, description: "1,000-2,000 word thought leadership" },
      { name: "Email Outreach Campaign", credits: 3, description: "Cold/warm email sequences" },
      { name: "Pitch Deck Talking Points", credits: 8, description: "10-slide investor pitch" },
      { name: "Growth Playbook", credits: 10, description: "90-day growth strategy with experiments" },
      { name: "Financial Model", credits: 8, description: "Projections, unit economics, scenarios" },
      { name: "Technical Architecture Doc", credits: 8, description: "System design with ADRs" },
      { name: "Terms of Service (Draft)", credits: 8, description: "AI-drafted, expert-validated" },
      { name: "Privacy Policy (Draft)", credits: 8, description: "AI-drafted, expert-validated" },
      { name: "FAQ Content", credits: 3, description: "10+ Q&As for your product" },
      { name: "Explainer Video Script", credits: 3, description: "60-second video script" },
      { name: "Comparison Page", credits: 5, description: "Your product vs. alternatives" },
    ],
  },
  {
    category: "Premium Deliverables",
    items: [
      { name: "Comprehensive Business Plan", credits: 20, description: "Full plan with financials and strategy" },
      { name: "Due Diligence Report", credits: 20, description: "Multi-dimensional investment analysis" },
      { name: "Strategic Audit", credits: 15, description: "Full organizational assessment" },
      { name: "Book-Length Publication", credits: 50, description: "Amazon KDP, documentation, or archival" },
    ],
  },
  {
    category: "Human Expert Sessions",
    items: [
      { name: "Expert Session — 30 Min", credits: null, price: 79, description: "Video consultation with licensed professional" },
    ],
  },
];
