# DIRECTIVE ADDENDUM: Human Expert Integration

**Append this to `CLAUDE_CODE_DIRECTIVE.md` after the existing Phase 2 content.**

---

## Phase 2.5: Human Expert Integration Layer

### Overview

The Human Expert Integration Layer bridges AI advisory and professional services. Instead of the standard AI disclaimer ("this is not legal/financial advice"), Sutra.team brings licensed professionals into the council deliberation itself. The output credits both AI perspectives and human expert input.

**Core value prop:** "Every other AI tells you to consult a professional. We bring the professional into the room."

### Architecture Changes

#### 1. Hybrid Agent Roles

The Council of Experts agents (Legal Analyst, Financial Strategist, Technical Architect, etc.) become **hybrid roles** with two modes:

- **AI-only mode** (default): The AI agent performs full analysis autonomously. Output includes standard caveats.
- **Expert-validated mode** (premium): The AI agent performs initial analysis, then a human professional reviews, validates, corrects, or overrides via the LiveKit Connect layer. The synthesis output is tagged as expert-validated.

Add to `src/lib/types.ts`:

```typescript
interface HumanExpert {
  expert_id: string;
  name: string;
  credentials: string[];           // e.g., ["JD", "Bar: CA, NY"]
  domains: ExpertDomain[];         // e.g., ["contract_law", "ip", "compliance"]
  availability_status: 'available' | 'busy' | 'offline' | 'by_appointment';
  validation_count: number;        // total deliberations validated
  response_time_avg_minutes: number;
}

type ExpertDomain = 
  | 'contract_law' | 'corporate_law' | 'ip' | 'regulatory_compliance'
  | 'tax' | 'financial_planning' | 'investment' | 'valuation'
  | 'systems_architecture' | 'security' | 'data_engineering'
  | 'market_research' | 'competitive_intelligence'
  | 'risk_management' | 'insurance'
  | 'growth_strategy' | 'go_to_market';

interface ExpertValidation {
  expert_id: string;
  expert_name: string;
  credentials: string[];
  validation_type: 'approved' | 'approved_with_modifications' | 'flagged' | 'overridden';
  modifications?: string;          // What the expert changed
  notes?: string;                  // Additional expert commentary
  timestamp: string;               // ISO 8601
}

// Updated deliberation response
interface DeliberationResponse {
  // ... existing fields ...
  expert_validations?: ExpertValidation[];
  validation_status: 'ai_only' | 'expert_validated' | 'expert_pending';
}
```

#### 2. LiveKit Integration for Human Experts

Human professionals join the same LiveKit room as AI agents. The existing Connect layer already supports this — no new infrastructure needed.

**Expert join flow:**
1. User requests expert-validated deliberation (Combined Council + Expert Validation)
2. AI agents deliberate in parallel (existing pipeline)
3. System notifies available expert(s) in the relevant domain
4. Expert joins the LiveKit room (video, voice, or text) and reviews the AI perspectives
5. Expert provides validation, modifications, or override
6. Sutra synthesis incorporates expert input with attribution
7. Memory system captures expert input for continuity

**Expert participant in LiveKit room:**
- Experts appear as named participants (not anonymous)
- Credentials displayed alongside their input
- Expert can see all AI agent perspectives before providing input
- Expert input is transcribed and stored in the memory system

#### 3. Synthesis Attribution Update

When human experts participate, Sutra's synthesis output must:
- Credit the expert by name and credentials
- Distinguish between AI analysis and expert validation
- Note whether the expert approved, modified, or overrode AI conclusions
- Remove standard AI disclaimers for expert-validated content — replace with: "Reviewed by [Expert Name], [Credentials] via Sutra Expert Network"

### Landing Page Section

**Insert a new section on the landing page between "Combined Council" and "Differentiation."**

Reference the standalone HTML file `sutra_human_expert_landing_section.html` for the complete design. Key elements to implement in the Next.js component:

#### Component: `src/components/landing/HumanExpertSection.tsx`

**Structure:**

1. **Tagline**: `HUMAN EXPERT INTEGRATION` (monospace, gold, uppercase, tracked)
2. **Headline**: "The professional is *already* in the room." (serif, large, italic emphasis on "already" in gold)
3. **Subhead**: "Every other AI tells you to consult a lawyer... Sutra.team brings them into the deliberation."
4. **Before/After Comparison** — side-by-side cards:
   - LEFT (dimmed): "Every other AI" → "You should consult a professional." + the standard ⚠️ disclaimer box
   - RIGHT (highlighted, gold border glow): "Sutra.team" → "We already did." + "✓ Reviewed by licensed counsel via Sutra Expert Network"
5. **3-Step Flow** — three cards:
   - 01: "AI agents deliberate first"
   - 02: "Human expert reviews & validates"
   - 03: "Sutra synthesizes both"
6. **Aspirational Expert Network Banner**:
   - Label: `BUILDING THE SUTRA EXPERT NETWORK`
   - Pill-shaped category tags (NOT firm names): Big Four Advisory, AmLaw 100 Firms, Registered Investment Advisors, Fortune 500 Strategy, Licensed CPAs, Boutique Consultancies, Domain Specialists
   - Subtext: "Expanding our professional network across legal, financial, and strategic advisory." + link to /about#expert-network
   - **⚠️ CRITICAL: Do NOT use any specific company names or logos. No KPMG, Deloitte, EY, PwC, etc. Use category descriptions only.**
7. **CTA**: "Start a Session" → /connect

#### Styling Notes

- Dark theme consistent with existing sections (use `--sutra-*` CSS variables)
- Gold accent (#C9A84C) for highlights — this section introduces gold as the "trust" color
- The comparison cards should have clear visual hierarchy: LEFT card is subdued/muted, RIGHT card has subtle gold border glow
- Pills in the network banner should have hover states (border-color shift to gold)
- Responsive: stack comparison cards and flow steps vertically on mobile

### Pricing Impact

Update the pricing tiers to reflect expert validation access:

| Tier | Expert Access |
|------|--------------|
| Explorer (Free) | None |
| Creator ($29/mo) | None |
| Professional ($99/mo) | On-demand expert validation (billed per session) |
| Enterprise (Custom) | Dedicated expert pool, SLA for response time |
| API Developer | Expert validation endpoint (per-validation pricing) |

Add a row to the pricing comparison table: "Human Expert Validation" with values: — / — / On-demand / Dedicated / API

### About Page Addition

Add an "Expert Network" section (`/about#expert-network`) with:
- What the Sutra Expert Network is
- How professionals can join (application link / interest form)
- Categories of expertise being recruited
- How expert validation works (brief version of the 3-step flow)

### Constants Update

Add to `src/lib/constants.ts`:

```typescript
export const EXPERT_NETWORK_CATEGORIES = [
  { label: 'Big Four Advisory', domains: ['corporate_law', 'tax', 'valuation', 'compliance'] },
  { label: 'AmLaw 100 Firms', domains: ['contract_law', 'ip', 'regulatory_compliance'] },
  { label: 'Registered Investment Advisors', domains: ['financial_planning', 'investment'] },
  { label: 'Fortune 500 Strategy', domains: ['market_research', 'competitive_intelligence', 'growth_strategy'] },
  { label: 'Licensed CPAs', domains: ['tax', 'valuation'] },
  { label: 'Boutique Consultancies', domains: ['go_to_market', 'growth_strategy', 'risk_management'] },
  { label: 'Domain Specialists', domains: ['systems_architecture', 'security', 'data_engineering'] },
] as const;
```

---

## Updated Landing Page Section Order

For reference, the full landing page section order is now:

1. Hero
2. How It Works
3. Connect Preview
4. Council of Rights
5. Council of Experts
6. Combined Council
7. **Human Expert Integration** ← NEW
8. Differentiation
9. Aspirational Expert Network (within #7, but could also stand alone)
10. Powered by SammaSuit
11. Patent & Credibility
