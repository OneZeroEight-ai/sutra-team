# CREDIT-BASED PRICING SYSTEM DIRECTIVE

**Context:** Sutra.team is transitioning from flat subscription + deliberation caps to a hybrid credit-based model. The product value is in the deliverables, not the deliberations. This directive defines the credit system, updated pricing tiers, deliverable menu with credit costs, and Stripe implementation.

---

## Pricing Philosophy

> Nobody pays for a meeting. They pay for what the meeting produces.

The deliberation is the engine. The deliverable is the product. Credits are consumed when the council produces something of value — not when you chat.

---

## Credit System Design

### Credit Values

1 credit ≈ $3 infrastructure cost (all-in: LLM tokens, STT, TTS, LiveKit, Railway, Vercel, bandwidth)

Credits are priced above cost to create margin. Overage credits are priced at retail to capture additional revenue from heavy users.

### Subscription Tiers

| Tier | Monthly Price | Credits Included | Overage Rate | Council Access | Target User |
|------|--------------|-----------------|--------------|----------------|-------------|
| **Explorer** | Free | 5 | Cannot purchase | Single agent only | Trial users |
| **Creator** | $49/mo | 30 | $5/credit | Rights Council | Solo professionals, coaches |
| **Professional** | $149/mo | 75 | $4/credit | Rights + Experts + Combined | Founders, executives, consultants |
| **Enterprise** | Custom | Custom | Custom | All + custom councils | Organizations, teams |
| **API Developer** | Usage-based | N/A | $5/credit | All via API | Developers building on platform |

### Credit Economics

| Tier | Revenue | Credits | Max Cost (all used) | Margin at 100% usage | Margin at 60% usage |
|------|---------|---------|--------------------|-----------------------|---------------------|
| Explorer | $0 | 5 | $15 | -$15 | -$9 |
| Creator ($49) | $49 | 30 | $90 | -$41 | +$4 |
| Professional ($149) | $149 | 75 | $225 | -$76 | +$14 |

**Key insight:** At 60% utilization (industry average for SaaS), Creator breaks even and Professional generates margin. Heavy users who exceed their credits pay overage at $4-5/credit, which is pure margin above the $3 cost basis. The model depends on:
1. Average utilization being well under 100%
2. Overage revenue from power users
3. Enterprise contracts priced with comfortable margins
4. Deliverable quality justifying the price (a $149/mo council replacing $5K+ consulting engagements)

### Credit Rollover

- Credits do NOT roll over month to month
- Unused credits expire at billing cycle end
- This encourages consistent usage and prevents credit hoarding

---

## Deliverable Menu

### Tier 1: Conversational (Low Credit Cost)

| Deliverable | Credits | Description | Agents Involved |
|-------------|---------|-------------|-----------------|
| Quick question | 1 | Single agent conversational response | 1 agent |
| Voice session (5 min) | 1 | Voice conversation with single agent | 1 agent |
| Phone call (5 min) | 1 | Phone dial-in session with agent | 1 agent |

### Tier 2: Council Deliberations (Medium Credit Cost)

| Deliverable | Credits | Description | Agents Involved |
|-------------|---------|-------------|-----------------|
| Rights Council opinion | 3 | Principled analysis from 8 Rights agents + Sutra synthesis | 8 + synthesis |
| Expert Council analysis | 3 | Domain analysis from 6 Expert agents + Sutra synthesis | 6 + synthesis |
| Combined Council deliberation | 5 | Full 14-agent deliberation + integrated synthesis | 14 + synthesis |

### Tier 3: Skill Deliverables (Higher Credit Cost)

These consume credits because they involve council deliberation PLUS structured document production using the skills library.

| Deliverable | Credits | Skill ID | Output Formats | Primary Agents |
|-------------|---------|----------|----------------|----------------|
| **Press Release** | 5 | press-release | .md, .docx, .pdf | Communicator + Growth Strategist |
| **Investor Update** | 5 | investor-update | .md, .html, .pdf | Communicator + Financial Strategist |
| **Social Media Launch Pack** | 5 | social-media-launch | .json, .md, .txt | Communicator + Growth Strategist |
| **Blog Post** | 5 | blog-post | .md, .html | Communicator + Market Analyst |
| **Email Outreach Campaign** | 3 | email-outreach | .md, .html, .txt | Communicator + Growth Strategist |
| **Pitch Deck Talking Points** | 8 | pitch-deck-talking-points | .md, .json, .pptx | Communicator + Financial + Market |
| **Growth Playbook** | 10 | growth-playbook | .md, .pdf, .docx | Growth Strategist + Market Analyst |
| **Financial Model** | 8 | financial-model | .md, .json | Financial Strategist |
| **Technical Architecture Doc** | 8 | architecture-doc | .md, .pdf | Technical Architect |
| **Comparison Page** | 5 | comparison-page | .md, .html | Communicator + Market Analyst |
| **Explainer Video Script** | 3 | explainer-script | .md, .txt | Communicator |
| **FAQ Content** | 3 | faq-content | .md, .json, .html | Communicator |
| **Terms of Service (DRAFT)** | 8 | terms-of-service | .md, .docx | Legal Analyst |
| **Privacy Policy (DRAFT)** | 8 | privacy-policy | .md, .docx | Legal Analyst |

### Tier 4: Premium Deliverables (High Credit Cost)

| Deliverable | Credits | Description | Output Formats | Agents Involved |
|-------------|---------|-------------|----------------|-----------------|
| **Comprehensive Business Plan** | 20 | Full business plan with financials, market analysis, strategy | .pdf, .docx | All 6 Experts + Rights synthesis |
| **Due Diligence Report** | 20 | Multi-dimensional analysis of investment, acquisition, or partnership | .pdf, .docx | All 6 Experts + Combined Council |
| **Strategic Audit** | 15 | Full organizational assessment: legal, financial, technical, market, risk, growth | .pdf, .docx | All 6 Experts |
| **Book-Length Publication** | 50 | Long-form manuscript for Amazon KDP or archival documentation | .pdf, .docx, .epub | Configurable — typically Combined Council |

### Tier 5: Human Expert Sessions (Flat Fee, Outside Credit System)

| Deliverable | Price | Description |
|-------------|-------|-------------|
| **Expert Session — 30 min** | $79 | Video consultation with licensed professional, includes AI prep packet |
| **Expert Session — Extension** | Metered (TBD) | Per-minute beyond 30 min |

Human expert sessions are purchased separately and do not consume credits.

---

## Book-Length Publication Skill

### Skill Definition

```python
BOOK_PUBLICATION = Skill(
    id="book-publication",
    name="Book-Length Publication",
    description="Long-form manuscript production for Amazon KDP publishing, technical documentation, research compendiums, or archival storage. Produces publication-ready output.",
    owner_agents=["communicator", "all_experts"],  # Configurable per project
    tier=Tier.AI_PRODUCES,
    output_formats=[OutputFormat.PDF, OutputFormat.DOCX, OutputFormat("epub")],
    sections=[
        "Front matter (title page, copyright, dedication, table of contents)",
        "Preface / Introduction (context, purpose, audience)",
        "Chapters (structured content, 3,000-5,000 words per chapter)",
        "Back matter (appendices, glossary, bibliography, index)",
        "Author/Council attribution page",
        "Amazon KDP metadata (title, subtitle, description, categories, keywords)",
    ],
    quality_checklist=[
        "Each chapter has a clear thesis and internal structure",
        "Consistent voice throughout (Sutra synthesis voice or specified persona)",
        "Table of contents accurately reflects chapter structure",
        "Front matter includes proper attribution to council agents",
        "KDP metadata is optimized for discoverability",
        "Total word count meets target (typically 20,000-60,000 words)",
        "PDF formatted for 6x9 or 8.5x11 trim size",
        "EPUB validates against EPUB 3.0 spec",
    ],
    template="""You are producing a BOOK-LENGTH PUBLICATION. This is a multi-session deliverable.

PUBLICATION TYPES:
1. **Technical Documentation** — Platform docs, API guides, system architecture references
2. **Research Compendium** — Collected council deliberations, analysis archives, findings
3. **Thought Leadership** — Original long-form work (philosophy, strategy, methodology)
4. **Archival Record** — Cold offline storage of council session history, decisions, and outcomes
5. **Training Material** — Educational content, onboarding guides, certification curricula

PRODUCTION PROCESS:
This is NOT produced in a single deliberation. It is a multi-phase project:

Phase 1: OUTLINE (1 deliberation)
- Define scope, audience, chapter structure
- Council deliberates on content strategy
- Output: Detailed chapter-by-chapter outline with word count targets

Phase 2: CHAPTER DRAFTS (1 deliberation per chapter)
- Each chapter produced as a separate deliberation
- Relevant experts assigned per chapter topic
- Output: Draft chapters in markdown

Phase 3: SYNTHESIS & EDITING (1-2 deliberations)
- Sutra synthesizes all chapters into cohesive manuscript
- Voice consistency pass
- Cross-reference and internal linking
- Output: Complete manuscript draft

Phase 4: FORMATTING & METADATA (1 deliberation)
- Format for target platform (KDP, documentation site, archive)
- Generate front/back matter
- Create KDP metadata if publishing to Amazon
- Output: Publication-ready files (.pdf, .docx, .epub)

AMAZON KDP SPECIFICS:
- Title and subtitle optimized for Amazon search
- Book description: 150 words max, benefit-focused, with keywords
- Categories: select 2-3 BISAC categories
- Keywords: 7 keyword phrases (Amazon allows 7)
- Trim size: 6x9 (standard) or 8.5x11 (technical/documentation)
- Interior: black & white or color (affects cost)
- Cover: NOT produced by this skill — requires separate design

ARCHIVAL/COLD STORAGE USE CASE:
For organizations using book publication as offline documentation:
- Compile council deliberation history into structured chapters
- Include decision logs, synthesis outputs, and dissenting perspectives
- Add metadata for future retrieval (dates, participants, topics)
- Publish to KDP as private/unlisted for low-cost physical archival
- KDP prints on demand — zero inventory cost, permanent availability

WORD COUNT GUIDELINES:
- Short book (documentation, guide): 15,000-25,000 words (~50-80 pages)
- Standard book (thought leadership): 30,000-50,000 words (~100-170 pages)
- Comprehensive reference: 50,000-80,000 words (~170-270 pages)

CREDIT CONSUMPTION:
At 50 credits for the full project, budget approximately:
- 1 credit: outline
- 5-8 credits: chapter drafts (1 per chapter, ~8-10 chapters)
- 2 credits: synthesis and editing passes
- 1 credit: formatting and metadata
- Remaining: revisions and iterations""",
)
```

### Add to Skills Registry

Add `BOOK_PUBLICATION` to `ALL_SKILLS` in `server/skills/registry.py`:

```python
ALL_SKILLS = {
    # ... existing skills ...
    # Premium
    "book-publication": BOOK_PUBLICATION,
}
```

---

## Stripe Implementation

### Archive Old Products

Archive these existing Stripe products (they use the old model):
- Sutra Creator ($29/mo) — `price_1Szow3GBRiRBfxh9KMN2GHOa`
- Sutra Professional ($99/mo) — `price_1SzoxtGBRiRBfxh91RAuonvW`
- Expert Session ($2.95/min metered) — `price_1Szp0YGBRiRBfxh9841ANpBk` (rename was pending)
- API Deliberations ($0.50/call metered) — `price_1SzpJwGBRiRBfxh9wDB98suk`

### Create New Stripe Products

**1. Sutra Creator — Credit Plan**
- Name: Sutra Creator
- Description: 30 credits/month. Rights Council access. Voice & phone sessions. Skill deliverables.
- Pricing: $49/month recurring
- Metadata: `tier=creator, credits=30, overage_rate=5.00`

**2. Sutra Professional — Credit Plan**
- Name: Sutra Professional
- Description: 75 credits/month. Full council access (Rights + Experts + Combined). All skill deliverables. Priority support.
- Pricing: $149/month recurring
- Metadata: `tier=professional, credits=75, overage_rate=4.00`

**3. Credit Overage — Creator**
- Name: Credit Overage (Creator)
- Description: Additional credits beyond monthly allocation
- Pricing: $5.00 per credit (metered, using credits meter)

**4. Credit Overage — Professional**
- Name: Credit Overage (Professional)
- Description: Additional credits beyond monthly allocation
- Pricing: $4.00 per credit (metered, using credits meter)

**5. Expert Session — 30 Min** (keep as-is)
- Name: Expert Session — 30 Min
- Price: $79.00 one-time

**6. Credit Pack — 10 Credits** (one-time purchase for flexibility)
- Name: Credit Pack — 10 Credits
- Description: 10 additional credits, no expiration
- Pricing: $45.00 one-time ($4.50/credit)

**7. Credit Pack — 25 Credits**
- Name: Credit Pack — 25 Credits
- Description: 25 additional credits, no expiration
- Pricing: $100.00 one-time ($4.00/credit)

### Create Stripe Meter

Create a new meter for credit consumption:
- Meter name: `deliberation_credits`
- Aggregation: sum
- Event name: `credit_consumed`

---

## Update src/lib/stripe.ts

```typescript
// Sutra.team Stripe Configuration — Credit-Based Pricing
// Replace ALL existing price IDs after creating new products in Stripe dashboard

export const STRIPE_CONFIG = {
  // Subscription tiers
  plans: {
    creator: {
      priceId: "__NEW_CREATOR_PRICE_ID__",
      name: "Creator",
      price: 49,
      credits: 30,
      overageRate: 5.0,
      councilAccess: ["rights"],
    },
    professional: {
      priceId: "__NEW_PROFESSIONAL_PRICE_ID__",
      name: "Professional",
      price: 149,
      credits: 75,
      overageRate: 4.0,
      councilAccess: ["rights", "experts", "combined"],
    },
  },

  // Credit packs (one-time purchases)
  creditPacks: {
    pack10: {
      priceId: "__NEW_PACK10_PRICE_ID__",
      credits: 10,
      price: 45,
      perCredit: 4.5,
    },
    pack25: {
      priceId: "__NEW_PACK25_PRICE_ID__",
      credits: 25,
      price: 100,
      perCredit: 4.0,
    },
  },

  // Expert sessions (outside credit system)
  expertSession: {
    priceId: "__NEW_EXPERT_SESSION_PRICE_ID__",
    price: 79,
    description: "30-minute video consultation with licensed professional",
  },

  // Credit costs per deliverable (for frontend display and backend enforcement)
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

  // Cost basis (internal — do not expose to frontend)
  internal: {
    costPerCredit: 3.0,  // All-in infrastructure cost
  },
};

// Deliverable menu for frontend display
export const DELIVERABLE_MENU = [
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
```

---

## Update Pricing Page Component

Replace the existing pricing table with credit-based tiers. Each tier card should show:

1. Tier name and price
2. Credits included per month
3. Council access level
4. Sample deliverables they can produce with their credits
5. "Subscribe" button → Stripe Checkout
6. Overage rate noted in small text

Below the tier cards, display the full **Deliverable Menu** as an interactive table showing:
- Deliverable name
- Credit cost
- Brief description
- Which council produces it

This is the core value proposition — users see WHAT they get, not just how many "deliberations" they're allowed.

---

## Update Cost Tracking

Update `server/agents/cost_tracker.py` to track credit consumption per session:

Add to `SessionCostRecord`:

```python
@dataclass
class SessionCostRecord:
    # ... existing fields ...
    credits_consumed: int = 0
    deliverable_type: Optional[str] = None  # skill ID or deliberation type
    user_tier: Optional[str] = None
    credits_remaining: Optional[int] = None  # after this session
```

Update alert thresholds to include credit-based alerts:

```python
ALERT_THRESHOLDS = {
    "session_cost_usd": float(os.environ.get("ALERT_SESSION_COST", "5.00")),
    "daily_cost_usd": float(os.environ.get("ALERT_DAILY_COST", "100.00")),
    "monthly_cost_usd": float(os.environ.get("ALERT_MONTHLY_COST", "2000.00")),
    "daily_credits_consumed": int(os.environ.get("ALERT_DAILY_CREDITS", "50")),
    "free_tier_daily_credits": int(os.environ.get("ALERT_FREE_DAILY_CREDITS", "3")),
}
```

---

## Credit Enforcement (Backend)

The credit system needs enforcement at the API gateway level:

```python
# Pseudocode for credit gate — implement in council_agent.py or API middleware

async def check_credits(user_id: str, deliverable_type: str) -> bool:
    """Check if user has enough credits for the requested deliverable."""
    user = await get_user(user_id)
    required = CREDIT_COSTS[deliverable_type]
    
    available = user.subscription_credits_remaining + user.purchased_credits
    
    if available >= required:
        return True
    
    if user.tier in ("creator", "professional") and user.overage_enabled:
        # Charge overage via Stripe metered billing
        return True
    
    return False  # Insufficient credits — prompt upgrade or credit pack purchase


async def consume_credits(user_id: str, deliverable_type: str, session_id: str):
    """Deduct credits after successful deliverable production."""
    required = CREDIT_COSTS[deliverable_type]
    user = await get_user(user_id)
    
    # Deduct from subscription credits first, then purchased credits, then overage
    if user.subscription_credits_remaining >= required:
        user.subscription_credits_remaining -= required
    elif user.purchased_credits >= required:
        user.purchased_credits -= required
    else:
        # Record overage for Stripe metered billing
        overage_credits = required - user.subscription_credits_remaining - user.purchased_credits
        user.subscription_credits_remaining = 0
        user.purchased_credits = 0
        await record_overage(user_id, overage_credits, session_id)
    
    await save_user(user)
```

---

## Verify and Build

```bash
npm run build
```

Confirm:
- [ ] Old Stripe products archived
- [ ] New Stripe products created with correct pricing
- [ ] `src/lib/stripe.ts` updated with new price IDs and credit costs
- [ ] Pricing page shows credit-based tiers with deliverable menu
- [ ] Book Publication skill added to skills registry
- [ ] Cost tracker updated with credit consumption tracking
- [ ] Build passes with no errors
