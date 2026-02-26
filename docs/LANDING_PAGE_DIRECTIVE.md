# LANDING PAGE REPLACEMENT DIRECTIVE

**Context:** Sutra.team is pivoting from "multi-agent deliberation platform" to "The first OS for Autonomous Agents." This directive replaces the current `src/app/page.tsx` landing page with a completely new design and updates navigation, pricing, and related components to match the new positioning.

**Drop this file into `C:\Users\jbwagoner\sutra.team\docs\` and tell Claude Code:**
> "Read docs/LANDING_PAGE_DIRECTIVE.md and execute it step by step. The new landing page design is in the attached React component. Adapt it to the existing Next.js/Tailwind project structure."

---

## CRITICAL CONTEXT

- The site is a **Next.js 16** app with **Tailwind CSS v4**, **Clerk auth**, **Framer Motion**, deployed on **Vercel**
- Repo: `OneZeroEight-ai/sutra-team` on GitHub (auto-deploys to Vercel on push to main)
- Agent server runs on **Railway** (`sutra-council-agents` project)
- Persona JSON definitions and docs live in `C:\Users\jbwagoner\sutra.team\docs\`
- Current pages: `/`, `/council`, `/connect`, `/pricing`, `/personas`, `/docs`, `/about`, `/book`, `/blog`, `/terms`, `/privacy`, `/patent`, `/experts/join`, `/dashboard.html`
- All existing pages other than `/` (landing) should remain functional. Navigation links to them should be preserved.

---

## STEP 1: Understand the New Design

A complete React component for the new landing page has been designed with these sections (in order):

1. **NavBar** — Fixed nav with: Agents, Security, Pricing, Docs, Book + "Launch Dashboard" CTA. NO "Deliberate" link in top nav.
2. **Hero** — "The first OS for Autonomous Agents" headline. Badge: "Open Source · OpenClaw Compatible · Sammā Suit Protected". Stats: 15 PMF Agents, 12+ Field Templates, 8 Security Layers, 32+ Skills. Two CTAs: "Start Building" → /dashboard.html, "View Source" → GitHub.
3. **Value Props** — 6 cards: Easy, Secure, Powerful, Affordable, Extendable, Your Choice. Lead message: "Built for everyone — from managing a household to launching an enterprise AI strategy."
4. **Agents Showcase** — Tabbed (Council of Rights / Domain Experts / Synthesis). All 15 agents displayed with icons and descriptions.
5. **Templates** — 12 field categories with 3 template agents each (Healthcare, Education, Real Estate, Creative, Finance, Engineering, Household, Nonprofit, Sales, Legal, Music, Sports). PMF (Portable Mind Format) explainer with JSON code block.
6. **OpenClaw Compatibility** — Skills library compatible. Terminal demo showing `sutra skills install` with SANGHA scanning. Skill tag cloud (web-search, email-sender, calendar, browser, code-executor, slack, discord, file-manager, zoom, notion, obsidian, telegram).
7. **Security** — 8 layers of Sammā Suit protection. Each layer shows Native vs Plugin availability. BODHI (Process Isolation) and SUTRA (Value Framework) are Native-only. CTA for OpenClaw users to install the plugin.
8. **Iceland** — 🇮🇸 Powered by Iceland section. 100% renewable, 72% lower costs, GDPR-aligned privacy. Outside US surveillance jurisdiction.
9. **Deliberation Demo** — "Ask once. Hear everything." Shows a sample council deliberation (the SDK open-sourcing example from current site). Note: council deliberation is now positioned as a *skill* agents can invoke, not the headline product.
10. **Pricing** — 4 tiers:
    - **Explorer** $9/mo — 15 specialists, 5 custom agents, dashboard chat, all skills, audit trail, BYOK
    - **Pro** $29/mo (POPULAR badge) — Everything in Explorer + unlimited agents, voice sessions, all channels, heartbeat scheduling, council deliberation skill, priority support
    - **International** $99/mo 🇮🇸 — Everything in Pro + Iceland server infrastructure, 100% renewable hosting, GDPR jurisdiction, outside US surveillance, Bitcoin/crypto payments, priority international support. Payment badges: ₿ BTC · Ξ ETH · 💳 Card · 🏦 Wire
    - **Enterprise** Custom — Everything in International + custom councils & value frameworks, white-labeling, SSO/SAML, dedicated support + SLA, custom model routing, on-prem option
11. **CTA** — "Your agency is waiting" with "Launch Dashboard" button
12. **Footer** — Product, Company, Ecosystem, Legal columns. "From the same mind" links to NEOSOUL album and Portable Mind book. Social links. "Protected by Sammā Suit · Open Source · 🇮🇸 Iceland Powered"

---

## STEP 2: Design System

The new design uses a dark theme with these tokens. Map these to the existing Tailwind config or add as CSS variables:

```
bg:           #0a0a0f     (page background)
bgCard:       #12121a     (card backgrounds)
bgCardHover:  #1a1a25     (card hover state)
border:       #1e1e2e     (default borders)
borderHover:  #2a2a3e     (hover borders)
text:         #e4e4ef     (primary text)
textMuted:    #8888a0     (secondary text)
textDim:      #55556a     (tertiary/dim text)
accent:       #4fd1c5     (teal — primary accent, CTAs)
accentDim:    #2d9e94     (darker teal)
accentGlow:   rgba(79, 209, 197, 0.15)  (glow effects)
warm:         #f6ad55     (amber — International tier, tensions)
purple:       #b794f4     (purple — Enterprise tier)
green:        #68d391     (green — checkmarks, success)
danger:       #fc8181     (red — alerts)
```

Typography:
- Display/headings: `'Instrument Serif', Georgia, serif` — weight 400 (light, editorial feel)
- Body: `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`
- Code/monospace: `'JetBrains Mono', monospace`

Load via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
```

---

## STEP 3: Replace the Landing Page

Replace the contents of `src/app/page.tsx` with the new landing page. The reference React component is attached/provided separately. Adapt it to use:

- Tailwind classes where practical (the reference uses inline styles for portability — convert to Tailwind)
- Existing component patterns from the project (e.g., if there's a shared Card component, use it)
- Framer Motion for scroll-triggered animations on section entrances
- `next/link` for internal navigation
- `next/image` for any images (agent avatars are in `public/agents/` and `public/avatars/`)

**Key architectural decisions:**
- The landing page should be a **server component** with client components extracted for interactive elements (tabs, mobile nav toggle, expand/collapse)
- Agent data (names, descriptions, aspects) should come from `src/lib/constants.ts` — update that file if the new data differs
- Pricing data should also be in constants

---

## STEP 4: Update Navigation

The shared Header/Nav component (likely in `src/components/layout/Header.tsx` or similar) needs to be updated:

**REMOVE from top nav:**
- "Deliberate" or "Council" as a top-level nav item

**KEEP/ADD in top nav:**
- Agents (href="#agents" — scrolls to agents section on landing page)
- Security (href="#security" — scrolls to security section)
- Pricing (href="#pricing" or "/pricing")
- Docs ("/docs")
- Book ("/book")
- "Launch Dashboard" button (href="/dashboard.html")

**The /council page still exists** — it's just not in the top nav. It can be linked from within the deliberation demo section or the docs.

---

## STEP 5: Update Pricing Page

The standalone `/pricing` page should match the new 4-tier structure:

| Tier | Price | Key Differentiator |
|------|-------|--------------------|
| Explorer | $9/mo | 15 specialists, 5 custom agents, BYOK |
| Pro | $29/mo | Unlimited agents, voice, all channels |
| International | $99/mo | Iceland servers, GDPR, crypto payments |
| Enterprise | Custom | White-label, SSO, SLA, on-prem |

Add Bitcoin/ETH payment badges to the International tier. The International tier features:
- 🇮🇸 Iceland flag emoji
- Amber/warm color accent (not teal like Pro)
- Payment methods shown: ₿ BTC · Ξ ETH · 💳 Card · 🏦 Wire

---

## STEP 6: Update Constants

In `src/lib/constants.ts`, ensure the following data is present and up to date:

### Council of Rights (8 agents)
```typescript
export const councilOfRights = [
  { name: "Wisdom Judge", aspect: "Right View", icon: "⚖️", desc: "Strategic analysis & evidence evaluation" },
  { name: "The Purpose", aspect: "Right Intention", icon: "🎯", desc: "Motivation clarity & values alignment" },
  { name: "Communicator", aspect: "Right Speech", icon: "💬", desc: "Message evaluation & honesty-kindness balance" },
  { name: "Ethics Judge", aspect: "Right Action", icon: "⚡", desc: "Ethical impact analysis & consequence modeling" },
  { name: "Sustainer", aspect: "Right Livelihood", icon: "🌱", desc: "Value creation vs. extraction analysis" },
  { name: "Determined", aspect: "Right Effort", icon: "🔥", desc: "Priority management & burnout detection" },
  { name: "The Aware", aspect: "Right Mindfulness", icon: "👁️", desc: "Pattern surfacing & blind spot detection" },
  { name: "The Focused", aspect: "Right Concentration", icon: "🔬", desc: "Deep analysis & single-problem immersion" },
];
```

### Council of Experts (6 agents)
```typescript
export const councilOfExperts = [
  { name: "Legal Analyst", domain: "Contract Law, IP, Compliance", icon: "📜" },
  { name: "Financial Strategist", domain: "Valuation, Fundraising, Unit Economics", icon: "📊" },
  { name: "Tech Architect", domain: "System Design, Architecture, Security", icon: "🏗️" },
  { name: "Market Analyst", domain: "Industry Analysis, Competitive Intel", icon: "📈" },
  { name: "Risk Assessor", domain: "Risk Frameworks, Probability Modeling", icon: "🛡️" },
  { name: "Growth Strategist", domain: "GTM, Growth Loops, Scaling", icon: "🚀" },
];
```

### Template Categories (12 fields)
```typescript
export const templateCategories = [
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
```

### Security Layers (8 layers)
```typescript
export const securityLayers = [
  { name: "KARMA", label: "Budget Enforcement", desc: "Per-agent and per-council token budgets. Never overspend.", native: true, plugin: true },
  { name: "SILA", label: "Audit Trail", desc: "Every agent action logged. Full decision chain transparency.", native: true, plugin: true },
  { name: "METTA", label: "Cryptographic Identity", desc: "Ed25519 keypairs per agent. Verify who said what.", native: true, plugin: true },
  { name: "SANGHA", label: "Skill Vetting", desc: "AST scanning + governed network egress. No rogue skills.", native: true, plugin: true },
  { name: "NIRVANA", label: "Kill Switch", desc: "Council-level emergency halt. Shut down all agents at once.", native: true, plugin: true },
  { name: "DHARMA", label: "Model Permissions", desc: "Per-agent model routing. Claude, OpenAI, Google, local.", native: true, plugin: true },
  { name: "BODHI", label: "Process Isolation", desc: "Agents sandboxed during deliberation. No cross-contamination.", native: true, plugin: false },
  { name: "SUTRA", label: "Value Framework", desc: "Hierarchical ethical principles guiding every response.", native: true, plugin: false },
];
```

### Pricing Tiers (4 tiers)
```typescript
export const pricingTiers = [
  {
    name: "Explorer",
    price: "$9",
    period: "/mo",
    description: "Start with the full team. Build up to 5 agents.",
    accent: "green", // checkmark color
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
    accent: "accent", // teal
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
    price: "$99",
    period: "/mo",
    description: "Iceland-hosted. Full power. Global privacy.",
    accent: "warm", // amber
    flag: "🇮🇸",
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
    paymentMethods: ["₿ BTC", "Ξ ETH", "💳 Card", "🏦 Wire"],
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
```

---

## STEP 7: Preserve Existing Assets

- Agent avatar images are in `public/images/agents/` and `public/avatars/` — reference them where appropriate in the agents showcase
- The oracle GIF (`/images/oracle.gif`) can be used on the landing page if desired
- The NEOSOUL album cover and Portable Mind book cover should remain in the footer
- Logo is at `/images/logo.png`

---

## STEP 8: Update Meta Tags

In `src/app/layout.tsx`, update:

```typescript
export const metadata: Metadata = {
  title: "SUTRA.team — The First OS for Autonomous Agents",
  description: "Create your own AI agency in minutes. 15 prebuilt agents. Open source. OpenClaw compatible. 8 layers of Sammā Suit security. Easy enough for anyone, powerful enough for Fortune 500.",
  openGraph: {
    title: "SUTRA.team — The First OS for Autonomous Agents",
    description: "Create your own AI agency. 15 PMF agents. Open source. Secure by default.",
    url: "https://sutra.team",
    siteName: "SUTRA.team",
  },
  twitter: {
    card: "summary_large_image",
    title: "SUTRA.team — The First OS for Autonomous Agents",
    description: "Create your own AI agency. 15 PMF agents. Open source. Secure by default.",
    creator: "@sutra_ai",
  },
};
```

---

## STEP 9: Test and Deploy

1. Run `npm run build` — verify no build errors
2. Run `npm run dev` — visually verify all sections render correctly
3. Test responsive layout at 375px, 768px, 1024px, 1440px widths
4. Verify all internal links work (especially /dashboard.html, /docs, /book, /about, /council)
5. Verify external links work (sammasuit.com, GitHub, Amazon book link)
6. Commit with message: `feat: redesign landing page — OS for Autonomous Agents positioning`
7. Push to main — Vercel auto-deploys

---

## STEP 10: Post-Deploy Verification

After Vercel deploy completes:
- Visit https://sutra.team — confirm new landing page loads
- Check https://sutra.team/council — still accessible (just not in top nav)
- Check https://sutra.team/pricing — matches new 4-tier structure
- Check https://sutra.team/dashboard.html — dashboard still loads with Clerk auth
- Check mobile responsive — hero, nav, pricing cards should stack properly

---

## WHAT NOT TO CHANGE

- `/dashboard.html` — leave the dashboard completely alone
- `/council` page — keep it, just remove from top nav
- `/connect` route — keep it (voice sessions are disabled but code preserved)
- `/api/*` routes — don't touch
- Clerk auth configuration — don't touch
- Stripe configuration — don't touch
- Agent server (Railway) — don't touch
- `server/agents/` directory — don't touch
- Any persona JSON files in `docs/` — don't touch

---

## REFERENCE COMPONENT

The complete React component for the new landing page design is available as `sutra-landing.jsx`. This is a self-contained reference implementation. Claude Code should:

1. Read it to understand the design, layout, sections, and copy
2. Adapt it to the Next.js/Tailwind project structure
3. Use existing project components where they match
4. Create new components where needed
5. DO NOT copy it verbatim — translate the inline styles to Tailwind classes and the project's component patterns

The `.jsx` file should be placed alongside this directive in `C:\Users\jbwagoner\sutra.team\docs\sutra-landing.jsx` for Claude Code to reference.
