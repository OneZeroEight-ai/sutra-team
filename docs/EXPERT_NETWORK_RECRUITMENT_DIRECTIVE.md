# EXPERT NETWORK RECRUITMENT DIRECTIVE

**Context:** Sutra.team needs human experts who will provide 30-minute video consultations to users. Each expert gets a card in the system (same UI as AI agents), with credit rates set based on what the expert charges. This directive covers the expert portal page, outreach messaging, and directory recruitment strategy.

---

## Part 1: Expert Portal Page

### Create `/experts/join` page

This is the public-facing recruitment page where professionals learn about the opportunity and apply.

**File:** `src/app/experts/join/page.tsx`

### Page Structure

**Hero Section:**
- Headline: "Join the Sutra Expert Network"
- Subheadline: "Get paid for 30-minute consultations — with AI that does the prep work for you."
- CTA button: "Apply Now" (scrolls to application form)

**How It Works Section (3 steps):**

Step 1: "AI Does the Heavy Lifting"
- When a client books a session with you, our AI council has already analyzed their question from 14 different perspectives — legal, financial, technical, market, risk, growth, and 8 principled viewpoints.
- You receive the full analysis packet before the session. You arrive informed, not cold.

Step 2: "You Validate and Advise"
- Join a 30-minute video session with the client. The AI did the research. You bring the judgment, experience, and professional credibility that AI cannot.
- You're not educating from scratch. You're validating, course-correcting, and adding the human insight that makes the difference.

Step 3: "Get Paid on Your Terms"
- Set your own rate for 30-minute sessions. We handle billing, scheduling, and client acquisition.
- You get paid per session. No monthly commitments. Consult when it fits your schedule.

**Why Experts Join Section:**
- "Clients arrive prepared." — The AI council pre-analyzes every question. No more spending the first 15 minutes understanding the problem.
- "Set your own rate." — You decide what your expertise is worth. We suggest ranges by category but you set the final number.
- "No client acquisition." — We bring the clients. You bring the expertise.
- "Flexible schedule." — Accept sessions when available. Decline when you're not. No quotas.
- "Build your reputation." — Your expert card is visible on the platform. Great sessions lead to more bookings.

**Categories Section:**
Display all 14 expert categories as cards:

1. Accountants / CPAs — Tax strategy, bookkeeping review, financial reporting
2. Attorneys — Contract review, IP protection, regulatory compliance, business formation
3. Financial Advisors — Investment strategy, wealth management, financial planning
4. Medical Professionals — Clinical consultation, health strategy, medical review
5. Music Industry — Production, licensing, distribution, artist management
6. Technical Consultants / CTOs — Architecture review, technical due diligence, scaling strategy
7. HR / People Ops — Employment law, compensation, organizational design, hiring strategy
8. Insurance Professionals — Coverage analysis, risk assessment, claims strategy
9. Real Estate — Investment analysis, commercial leasing, property valuation
10. Marketing / Brand Strategists — Brand positioning, campaign strategy, market entry
11. Supply Chain / Operations — Logistics optimization, procurement, vendor management
12. Cybersecurity — Compliance assessment, incident response, security architecture
13. Executive Coaches — Leadership development, C-suite transition, organizational leadership
14. Academic Researchers — Peer review, research methodology, domain-specific expertise

**Earnings Estimate Section:**
- "What could you earn?"
- Simple calculator: sessions per week × your rate = monthly estimate
- Example: "4 sessions/week at $60/session = $960/month for ~8 hours of work"
- Note: "Most experts do 2-6 sessions per week alongside their primary practice."

**Application Form Section:**
Fields:
- Full name *
- Email *
- LinkedIn profile URL *
- Professional category (dropdown, 14 options) *
- Credentials / licenses (text, e.g., "CPA, California" or "JD, admitted NY bar")
- Years of experience *
- Preferred rate for 30-min session ($ amount) *
- Brief bio (150 words max — this becomes your expert card description) *
- Why you want to join (optional)
- Availability (checkboxes: weekday mornings, weekday afternoons, weekday evenings, weekends)

**Form submission:** For now, POST to a simple API route that stores in a JSON file or sends an email notification. Production: store in database.

**File:** `src/app/api/experts/apply/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  
  // Validate required fields
  const required = ["name", "email", "linkedin", "category", "credentials", "experience", "rate", "bio"];
  for (const field of required) {
    if (!data[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }
  
  // For now, log to console and return success
  // Production: store in database + send notification email
  console.log("Expert application received:", JSON.stringify(data, null, 2));
  
  // TODO: Send notification email to JB
  // TODO: Store in database
  // TODO: Auto-respond with confirmation email
  
  return NextResponse.json({ 
    success: true, 
    message: "Application received. We'll review and get back to you within 48 hours." 
  });
}
```

### Add Navigation Link

Add "For Experts" link in the site footer and optionally in the nav dropdown.

---

## Part 2: Expert Card Data Model

### Update Types

Add to `src/lib/types.ts`:

```typescript
export interface ExpertCard {
  id: string;
  name: string;
  category: ExpertCategory;
  credentials: string;
  bio: string;
  avatarUrl: string;
  linkedinUrl?: string;
  yearsExperience: number;
  creditCost: number;          // Credits per 30-min session
  costBasis: number;           // What we pay the expert (internal, not displayed)
  rating?: number;             // Average rating from sessions (future)
  sessionsCompleted?: number;  // Total sessions (future)
  availability: string[];      // e.g., ["weekday_mornings", "weekday_evenings"]
  status: "active" | "pending" | "inactive";
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
```

### Credit Pricing for Human Experts

The credit cost for each expert is calculated from their rate:

```
expert_credit_cost = ceil(expert_rate / credit_value) + margin_credits

Where:
- expert_rate = what the expert charges for 30 min (e.g., $60)
- credit_value = $3 (our cost basis per credit)  
- margin_credits = 2-5 credits (our margin)

Example:
- Expert charges $60/session
- $60 / $3 = 20 credits (cost)
- + 3 credits margin
- = 23 credits displayed to user
- At Professional overage rate ($4/credit): user pays $92, expert gets $60, we keep $32
- At Creator overage rate ($5/credit): user pays $115, expert gets $60, we keep $55
```

This means expert rates naturally fall into tiers:

| Expert Rate | Credits (with margin) | User Pays (Pro) | Our Margin |
|---|---|---|---|
| $45/30min | 18 credits | $72 | $27 |
| $60/30min | 23 credits | $92 | $32 |
| $90/30min | 33 credits | $132 | $42 |
| $120/30min | 43 credits | $172 | $52 |
| $200/30min | 70 credits | $280 | $80 |

---

## Part 3: Outreach Messages

### LinkedIn Connection Request Note (300 char limit)

**For CPAs/Accountants:**
```
Hi [Name] — I'm building Sutra.team, a platform where professionals give 30-min paid consultations to clients who arrive pre-briefed by AI analysis. Looking for CPAs to join our Expert Network. Interested in learning more?
```

**For Attorneys:**
```
Hi [Name] — I'm building Sutra.team, where AI analyzes client questions from 14 perspectives before a human expert validates. We're recruiting attorneys for paid 30-min consultations. Would you be open to hearing more?
```

**Generic (any category):**
```
Hi [Name] — I'm recruiting [category] professionals for Sutra.team's Expert Network. Clients arrive pre-briefed by AI. You validate and advise in 30-min video sessions at your own rate. Interested?
```

### LinkedIn Follow-Up Message (after connection accepted)

```
Thanks for connecting, [Name].

Quick version: Sutra.team runs an AI council of 14 specialized agents that analyze client questions before a human expert joins. Think of it like having a team of analysts prep a briefing packet — then you walk in and give the professional opinion that matters.

How it works for experts:
- Client asks a question (e.g., "Should I restructure my LLC?")
- Our AI council analyzes it from legal, financial, technical, market, risk, and ethical perspectives
- You receive the full analysis packet
- You join a 30-min video session with the client
- You validate, correct, and add the judgment AI can't provide
- You get paid your rate. We handle billing and client acquisition.

We're in early access and building the founding expert network. You set your own rate, accept sessions when available, and never start cold.

Would you be open to a 15-minute call to see if it's a fit? Here's the details: sutra.team/experts/join

— JB
```

### Email Outreach (cold)

**Subject:** Paid AI-assisted consultations — recruiting [category] experts

```
Hi [Name],

I'm JB Wagoner, founder of Sutra.team. We're building a platform where professionals like you provide 30-minute paid video consultations — with a twist: our AI council pre-analyzes every client question from 14 specialized perspectives before you join the session.

You never start cold. You arrive with a full briefing packet covering legal, financial, technical, market, risk, and ethical dimensions of the client's question. Your job is to validate, correct, and add the professional judgment that AI cannot.

What experts get:
- Set your own rate for 30-min sessions
- Clients arrive prepared (AI does the research, you add the expertise)
- We handle billing, scheduling, and client acquisition
- Flexible — accept sessions when available, no quotas
- Your expert profile card is visible on the platform

We're recruiting our founding expert network now across 14 categories. I'd love to have you as one of our first [category] experts.

Interested? You can learn more and apply here: sutra.team/experts/join

Or if you'd prefer a quick conversation first, I'm happy to do a 15-minute call — just reply and I'll send a calendar link.

Best,
JB Wagoner
Founder, Sutra.team
(213) 274-8806
```

### Email Outreach (warm — someone you know or have a connection to)

**Subject:** Would you be open to paid consultations through my AI platform?

```
Hey [Name],

I've been building something I think you'd be great for.

Sutra.team runs an AI council — 14 specialized agents that analyze questions from every angle before connecting the client with a human expert for a 30-min video session. The AI does the prep work. The expert (you) brings the judgment.

I'm recruiting founding experts and immediately thought of you for [their specific expertise]. You set your own rate, and you'd never walk into a session cold — the AI briefing packet covers the analysis before you even join.

Would you be open to checking it out? sutra.team/experts/join

Happy to jump on a quick call if you want to hear more first.

— JB
```

---

## Part 4: Directory Recruitment Strategy

### Where to Find Experts

| Category | Directories & Platforms | Search Strategy |
|---|---|---|
| **CPAs / Accountants** | AICPA directory, LinkedIn "CPA", Upwork, Clarity.fm | Target solo practitioners and small firm CPAs who want side income |
| **Attorneys** | Avvo, Martindale-Hubbell, LinkedIn "attorney", LawTrades | Target attorneys already doing freelance legal work |
| **Financial Advisors** | FINRA BrokerCheck, NAPFA directory, XY Planning Network | Target fee-only advisors comfortable with tech |
| **Medical** | Doximity, Healthgrades, LinkedIn "MD" | Target telehealth-experienced physicians |
| **Music Industry** | LinkedIn, Music Business Worldwide, Recording Academy | Target producers, A&R, licensing specialists |
| **Technical / CTO** | LinkedIn, Toptal, CTO.ai, former YC founders | Target fractional CTOs already consulting |
| **HR / People Ops** | SHRM directory, LinkedIn, UpCounsel (employment law) | Target HR consultants and fractional CHROs |
| **Insurance** | National Association of Insurance Commissioners, LinkedIn | Target independent brokers |
| **Real Estate** | NAR directory, LinkedIn, BiggerPockets | Target commercial brokers and investment analysts |
| **Marketing / Brand** | AMA directory, LinkedIn, GrowthMentor | Target fractional CMOs |
| **Supply Chain** | APICS directory, LinkedIn, Gartner peer community | Target operations consultants |
| **Cybersecurity** | (ISC)² directory, LinkedIn "CISSP", HackerOne | Target compliance and vCISO consultants |
| **Executive Coaches** | ICF directory, LinkedIn, BetterUp alumni | Target certified coaches with corporate backgrounds |
| **Academic Researchers** | Google Scholar, ResearchGate, university faculty pages | Target adjuncts and researchers seeking supplemental income |

### Recruitment Targets

**Phase 1 (founding network — first 30 days):**
- 2-3 experts per category = 28-42 total
- Focus on: CPAs, Attorneys, Financial Advisors, Technical (highest demand)
- Goal: at least 1 expert available per category so the directory isn't empty

**Phase 2 (growth — 60-90 days):**
- 5-10 per category = 70-140 total
- Begin collecting ratings and session data
- Feature top-rated experts on landing page

**Phase 3 (scale — 6 months):**
- 20+ per category
- Specialization within categories (e.g., "IP Attorney", "Tax CPA", "Real Estate Investment")
- Geographic coverage for jurisdiction-specific advice

### Outreach Cadence

Per expert prospect:
1. LinkedIn connection request with note (Day 0)
2. Follow-up message after acceptance (Day 1-3)
3. Email if no LinkedIn response (Day 5)
4. One more follow-up email (Day 10)
5. Stop if no response

Target: 10 outreach messages per day = 50/week = 200/month
Expected conversion: 10-15% = 20-30 founding experts in first month

---

## Part 5: Verify and Build

Tell Claude Code:

> Read docs/EXPERT_NETWORK_RECRUITMENT_DIRECTIVE.md and execute Part 1 (Expert Portal page + API route + types). Skip Parts 2-4 (outreach messages and strategy are for JB, not code).

Confirm:
- [ ] `/experts/join` page renders with all sections
- [ ] Application form submits to `/api/experts/apply`
- [ ] ExpertCard type and EXPERT_CATEGORIES added to types.ts
- [ ] "For Experts" link in footer
- [ ] Build passes
