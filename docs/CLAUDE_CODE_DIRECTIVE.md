# Claude Code Directive: Build sutra.team Repository & Rebuild Website

## Objective

Create a new GitHub repository under the `OneZeroEight-ai` organization and rebuild the sutra.team website from its current purpose (AI safety consulting site) into a **persona hosting platform** product site — the commercial front for the Sutra.team platform described in `docs/CLAUDE.md`.

## Context

- **GitHub Org:** `OneZeroEight-ai` (existing — also hosts `samma-suit` repo)
- **Project root (local):** `C:\Users\jbwagoner\sutra.team\`
- **Reference doc:** `C:\Users\jbwagoner\sutra.team\docs\CLAUDE.md` — read this FIRST, it contains the full technical spec
- **Current site:** https://sutra.team — currently a consulting/services site ("AI Safety You Can't Game") that needs to become the product platform site
- **Related sites:** https://sammasuit.com (infrastructure layer), https://onezeroeight.ai (parent company/research)

---

## Phase 1: Repository Setup

### 1.1 Create the repo

```bash
cd C:\Users\jbwagoner\sutra.team
git init
gh repo create OneZeroEight-ai/sutra-team --public --description "Sutra.team — Persona Hosting Platform powered by SammaSuit.com infrastructure" --source=. --remote=origin
```

### 1.2 Project structure

```
sutra.team/
├── docs/
│   └── CLAUDE.md                    # Already exists — project reference
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout with metadata, fonts, analytics
│   │   ├── page.tsx                 # Landing page (hero + product overview)
│   │   ├── council/
│   │   │   └── page.tsx             # Council product page (Rights + Experts + Combined)
│   │   ├── personas/
│   │   │   └── page.tsx             # Persona marketplace / directory
│   │   ├── pricing/
│   │   │   └── page.tsx             # Pricing tiers (Explorer → Enterprise)
│   │   ├── docs/
│   │   │   └── page.tsx             # Developer docs / API reference
│   │   ├── about/
│   │   │   └── page.tsx             # About — JB Wagoner, patent, Zen AI, ecosystem
│   │   └── api/                     # API routes (future: proxy to SammaSuit backend)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Site header with nav
│   │   │   ├── Footer.tsx           # Footer with ecosystem links
│   │   │   └── EcosystemBanner.tsx  # Top banner linking sutra.exchange, onezeroeight.ai, sammasuit.com
│   │   ├── council/
│   │   │   ├── CouncilDemo.tsx      # Interactive council deliberation demo
│   │   │   ├── AgentCard.tsx        # Individual agent display card
│   │   │   ├── RightsGrid.tsx       # 8-agent Noble Eightfold Path grid
│   │   │   ├── ExpertsGrid.tsx      # 6-agent expert council grid
│   │   │   └── SynthesisFlow.tsx    # Visual deliberation pipeline animation
│   │   ├── persona/
│   │   │   ├── PersonaCard.tsx      # Persona marketplace card
│   │   │   └── PersonaBuilder.tsx   # Persona creation preview/CTA
│   │   ├── pricing/
│   │   │   └── PricingTable.tsx     # Tier comparison table
│   │   ├── differentiation/
│   │   │   └── DiffScore.tsx        # Differentiation score visualization
│   │   └── ui/                      # Shared UI primitives (buttons, cards, modals)
│   ├── lib/
│   │   ├── constants.ts             # Agent definitions, pricing tiers, API endpoints
│   │   └── types.ts                 # TypeScript types matching persona data model from spec
│   └── styles/
│       └── globals.css              # Tailwind CSS + custom design tokens
├── public/
│   ├── agents/                      # Agent avatar images (8 Rights + 6 Experts + Sutra)
│   └── og/                          # Open Graph images
├── .gitignore
├── .env.example                     # NEXT_PUBLIC_SUTRA_API_URL, analytics keys
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 1.3 Initialize Next.js

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Install additional dependencies:

```bash
npm install framer-motion lucide-react clsx tailwind-merge
npm install -D @tailwindcss/typography
```

### 1.4 Git setup

```bash
# .gitignore should include:
# node_modules, .next, .env.local, .env, out, .vercel
git add .
git commit -m "feat: initial sutra.team project scaffold"
git push -u origin main
```

---

## Phase 2: Rebuild the Website

### 2.1 Design Direction

The current site is a consulting site selling audits and architecture engagements. The new site is a **product platform** — think Linear, Vercel, or Notion's marketing site. The vibe should be:

- **Dark theme** with accent colors inspired by the Noble Eightfold Path
- **Sophisticated, minimal** — not a generic SaaS template
- **Buddhist/contemplative undertones** without being heavy-handed — subtle lotus motifs, clean geometry, space
- **Product-first** — the Council deliberation system is the hero, not consulting services
- Carry forward the "Safety You Can't Game" ethos but reframe around the product: the platform IS the proof

### 2.2 Color System

```css
/* Design tokens */
--sutra-bg: #0a0a0f;          /* Near-black background */
--sutra-surface: #12121a;     /* Card/surface background */
--sutra-border: #1e1e2e;      /* Subtle borders */
--sutra-text: #e4e4e7;        /* Primary text */
--sutra-muted: #71717a;       /* Secondary text */
--sutra-accent: #a78bfa;      /* Primary accent — violet/purple */
--sutra-gold: #f59e0b;        /* Secondary accent — gold (Buddhist association) */
--sutra-lotus: #ec4899;       /* Highlight — lotus pink */
```

### 2.3 Page-by-Page Content Brief

#### Landing Page (`/`)

**Hero Section:**
- Headline: "Your AI needs a council, not a chatbot."
- Subhead: "Sutra.team is a persona hosting platform where multiple AI agents deliberate on your question — then a synthesis agent reconciles their perspectives into one unified answer."
- Two CTAs: "Try a Deliberation" (demo) + "View Pricing"
- Background: Subtle animated visualization of 8 agents converging into one synthesis point

**How It Works Section:**
- 3-step visual: (1) You ask a question → (2) 8+ specialized agents deliberate in parallel → (3) Sutra synthesizes into unified response
- Show the deliberation pipeline from the spec (Section 4.3.1) as an interactive diagram

**Council of Rights Section:**
- Grid of 8 agent cards, each showing: name, Noble Eightfold Path aspect, functional domain, sample use case
- Pull all data from the spec (Section 4.1)

**Council of Experts Section:**
- Grid of 6 expert agent cards with domain and knowledge base sources
- Emphasize composability: "Build your own council"

**Combined Council Section:**
- Show the premium value prop: Strategic Analysis + Principled Evaluation + Integrated Recommendation
- Quote: "Not just what should I do — but what should I do and can I live with it."

**Differentiation Section:**
- "This isn't a prompt wrapper." 
- Show differentiation metrics from the spec (Section 8.1): voice consistency > 0.85, base model divergence > 0.30, etc.
- Side-by-side example: base model response vs. Sutra council response

**Powered by SammaSuit Section:**
- Brief explanation that sutra.team runs on SammaSuit.com infrastructure
- Link to sammasuit.com
- Mention 8-layer security (SUTRA, DHARMA, SANGHA, KARMA, SILA, METTA, BODHI, NIRVANA)

**Patent & Credibility Section:**
- Patent filed January 2026
- IEEE CertifAIEd
- 40+ songs, 4 albums (proof of sustained alignment)
- Link to Zen AI book
- Link to onezeroeight.ai research

#### Council Page (`/council`)

Deep dive into how the council works:
- Full deliberation pipeline diagram (interactive, step-by-step)
- Synthesis method explanation (agreement mapping → tension identification → gap detection → hierarchical resolution → transparent uncertainty)
- Example deliberation walkthrough with a real query
- Comparison: Council of Rights vs. Council of Experts vs. Combined

#### Personas Page (`/personas`)

Persona marketplace preview:
- Sutra (exemplary embodiment) as featured persona
- The Noble 8 (8 Rights agents) as showcased personas
- "Coming Soon: Create Your Own" with persona builder preview
- Explain the Persona Definition File schema (identity, voice, values, constraints)
- Differentiation portfolio concept

#### Pricing Page (`/pricing`)

Direct from the spec (Section 10):
- Explorer (Free): 1 persona, 10 deliberations/mo
- Creator ($29/mo): 3 personas, 100 deliberations/mo, Rights Council
- Professional ($99/mo): All agents, 500 deliberations/mo, Combined Council
- Enterprise (Custom): White-label, SSO, custom councils
- API Developer (Usage-based): Per-deliberation pricing
- Include feature comparison table

#### Docs Page (`/docs`)

Developer documentation preview:
- API endpoint reference (from spec Section 6.1)
- Deliberation request/response schema overview
- Persona Definition File schema
- Authentication (OAuth 2.0, JWT, API keys)
- "Full API docs coming with Phase 2 launch"

#### About Page (`/about`)

- JB Wagoner bio (cognitive science + AI ethics background, Dr. Xes 1986, Zen AI, IEEE CertifAIEd)
- The Sutra project story (40+ songs, Noble 8, values-based alignment)
- Ecosystem overview: onezeroeight.ai → sammasuit.com → sutra.team → sutra.exchange
- Patent information
- Contact

### 2.4 Shared Layout

**Header:**
- Logo: "sutra.team" (wordmark)
- Nav: Council | Personas | Pricing | Docs | About
- CTA button: "Get Started"
- Ecosystem banner (collapsible): links to sammasuit.com, onezeroeight.ai, sutra.exchange

**Footer:**
- Product links: Council, Personas, Pricing, Docs
- Company links: About, Blog (placeholder), Contact
- Ecosystem links: sammasuit.com, onezeroeight.ai, sutra.exchange
- Legal: Terms, Privacy, Patent Notice
- © 2026 sutra.team — Powered by SammaSuit.com

---

## Phase 3: Data & Types

### 3.1 Type Definitions (`src/lib/types.ts`)

Define TypeScript types that match the persona data model from the spec:

```typescript
// Core types from the Sutra.team technical specification
export interface PersonaIdentity {
  persona_id: string;
  name: string;
  designation: string;
  origin_narrative?: string;
  creator_id: string;
  tagline?: string;
  version: string;
  created_at: string;
  visibility: 'private' | 'unlisted' | 'public' | 'enterprise';
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
}

export interface ExpertAgent {
  name: string;
  domain: string;
  knowledge_sources: string[];
}

export type CouncilMode = 'rights' | 'experts' | 'combined';

export interface PricingTier {
  name: string;
  price: string;
  includes: string[];
  target_user: string;
  highlighted?: boolean;
}
```

### 3.2 Constants (`src/lib/constants.ts`)

Populate all agent definitions, pricing tiers, and deliberation pipeline steps directly from the spec. This is the single source of truth for all display data.

---

## Phase 4: Deployment

### 4.1 Vercel

```bash
npm install -g vercel
vercel link  # Link to OneZeroEight-ai org on Vercel
vercel --prod
```

- Set custom domain: `sutra.team`
- Add environment variables in Vercel dashboard

### 4.2 DNS

Point `sutra.team` DNS to Vercel once ready to cut over. Keep existing site live until new build is verified.

---

## Important Notes

1. **Read `docs/CLAUDE.md` first** — it contains the complete technical spec distilled from the patent and architecture document. All product copy, data models, agent definitions, pricing, and pipeline descriptions come from there.

2. **Do NOT delete consulting content yet** — the new site replaces it, but keep the old content accessible via git history in case anything needs to be referenced.

3. **The current site has these pages to deprecate:** `/about`, `/methodology`, `/case-study`, `/blog`, `/contact`. The new site replaces them with: `/council`, `/personas`, `/pricing`, `/docs`, `/about`.

4. **Ecosystem consistency:** The site must link to sammasuit.com, onezeroeight.ai, and sutra.exchange throughout. The platform hierarchy is: OneZeroEight.ai (research) → SammaSuit.com (infrastructure) → Sutra.team (product) → Sutra.exchange (token ecosystem).

5. **Patent sensitivity:** This is a patented system (U.S. Provisional Application, January 30, 2026). Include patent notice in the footer but do not reproduce the full patent text on the site.

6. **The differentiation engine is a key selling point.** The site should emphasize that Sutra.team personas are NOT prompt wrappers — they have measurable differentiation scores, automated testing, and public differentiation certificates. This is what makes the platform defensible.

7. **Samma Suit integration:** Sutra.team runs ON SammaSuit.com infrastructure. The 8-layer security framework (SUTRA, DHARMA, SANGHA, KARMA, SILA, METTA, BODHI, NIRVANA) protects all agent operations. Reference this but don't duplicate the full Samma Suit docs — link to sammasuit.com instead.

8. **Launch roadmap alignment:** The website is Phase 0 work. It should present the full vision (all phases) but clearly indicate what's available now vs. coming soon. Phase 0 deliverables: single persona chat with Sutra, session + interaction memory. Phase 1+: council deliberation, marketplace, etc.
