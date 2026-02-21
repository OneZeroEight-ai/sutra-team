# ADDING THE GROWTH STRATEGIST TO THE COUNCIL OF EXPERTS
# =======================================================
# Claude Code Directive for sutra.team
#
# Adds the Growth Strategist — the final domain-specialist agent,
# completing the full 6-expert Council of Experts.
# =======================================================


# ============================================================================
# STEP 1: COPY THE PERSONA JSON
# ============================================================================

```bash
cp growth_strategist.json server/agents/personas/experts/growth_strategist.json
```

# FULL Council of Experts directory after this:
# server/agents/personas/experts/
#   legal_analyst.json           ✓
#   market_analyst.json          ✓
#   financial_strategist.json    ✓
#   risk_assessor.json           ✓
#   technical_architect.json     ✓
#   growth_strategist.json       ← NEW (final expert)


# ============================================================================
# STEP 2: UPDATE _EXPERT_PDF_KEY_TO_META IN deliberation.py
# ============================================================================

# This completes the full expert roster. No more "Future experts" comments needed.

```python
_EXPERT_PDF_KEY_TO_META: dict[str, dict] = {
    "legal_analyst": {"name": "The Legal Analyst", "domain": "Legal Strategy & Risk Assessment"},
    "market_analyst": {"name": "The Market Analyst", "domain": "Competitive Intelligence & Market Strategy"},
    "financial_strategist": {"name": "The Financial Strategist", "domain": "Financial Analysis & Capital Strategy"},
    "risk_assessor": {"name": "The Risk Assessor", "domain": "Threat Modeling & Strategic Risk Management"},
    "technical_architect": {"name": "The Technical Architect", "domain": "Systems Design & Technical Strategy"},
    "growth_strategist": {"name": "The Growth Strategist", "domain": "Go-to-Market & Scaling Strategy"},
}
```


# ============================================================================
# STEP 3: ENABLE IN THE UI
# ============================================================================

# In src/app/council/deliberate/page.tsx, find the expert agents list.
# Ensure the Growth Strategist shows as active, not greyed out.
# 
# After this step, ALL 6 experts should show as active in the UI:
#   ✓ The Legal Analyst
#   ✓ The Market Analyst
#   ✓ The Financial Strategist
#   ✓ The Risk Assessor
#   ✓ The Technical Architect
#   ✓ The Growth Strategist
#
# Remove any remaining "coming soon" labels from expert agents.
# The full Council of Experts is now live.


# ============================================================================
# STEP 4: DEPLOY
# ============================================================================

```bash
git add server/agents/personas/experts/growth_strategist.json server/agents/deliberation.py src/app/council/deliberate/page.tsx
git commit -m "feat: growth strategist expert — full Council of Experts complete (6/6)"
git push
```

# Railway auto-deploys from GitHub.
# Verify in logs — all 6 experts should load:
#   INFO:sutra-deliberation:[PDF] Loaded expert financial_strategist: XXXX words
#   INFO:sutra-deliberation:[PDF] Loaded expert growth_strategist: XXXX words
#   INFO:sutra-deliberation:[PDF] Loaded expert legal_analyst: XXXX words
#   INFO:sutra-deliberation:[PDF] Loaded expert market_analyst: XXXX words
#   INFO:sutra-deliberation:[PDF] Loaded expert risk_assessor: XXXX words
#   INFO:sutra-deliberation:[PDF] Loaded expert technical_architect: XXXX words
#   INFO:sutra-deliberation:[PDF] Expert persona system active: 6 experts loaded


# ============================================================================
# TESTING
# ============================================================================

# Test 1: Expert mode — growth question
# Select "Council of Experts" → submit:
#   "We have 50 free users and 3 paying customers at $49/month. What should our growth strategy be for the next 90 days?"
# Expected: Growth Strategist diagnoses stage (pre-PMF / early traction),
#   identifies binding constraint (likely activation or retention, not acquisition),
#   recommends stage-appropriate tactics, and names the one metric to focus on.

# Test 2: Expert mode — retention problem
# Select "Council of Experts" → submit:
#   "Users sign up for our AI platform but only 20% come back after the first session. How do we fix this?"
# Expected: Growth Strategist identifies this as an activation/retention
#   problem, recommends aha moment identification, onboarding optimization,
#   and cohort analysis — NOT more acquisition.

# Test 3: Full Expert Council (all 6)
# Select "Council of Experts" → submit:
#   "Should we launch a freemium tier or go straight to paid-only for our AI decision-support platform?"
# Expected: All 6 experts respond:
#   Growth Strategist: PLG analysis, free-to-paid conversion benchmarks, time-to-value
#   Financial Strategist: Unit economics of free users, CAC impact, revenue projections
#   Market Analyst: Competitive pricing landscape, positioning implications
#   Technical Architect: Infrastructure cost of free tier, scaling implications
#   Risk Assessor: Risks of free tier (cost overrun, wrong users, devaluation)
#   Legal Analyst: Terms of service, data handling, billing compliance
#   Sutra synthesizes all 6 into a unified recommendation.

# Test 4: Combined mode — FULL COUNCIL (8 Rights + 6 Experts = 14 agents + Sutra)
# Select "Combined" → submit:
#   "We're deciding whether to take VC funding or bootstrap. What should we do?"
# Expected: This is the premium product — 14 agents deliberating simultaneously.
#   Rights agents cover ethical, strategic, and principled dimensions.
#   Expert agents cover financial, market, legal, technical, risk, and growth.
#   Sutra synthesizes Strategic Analysis + Principled Evaluation + Integrated Recommendation.
#   This is the "what should I do AND can I live with it" output.

# Test 5: Rights mode (unchanged)
# Select "Council of Rights" → submit: any question
# Expected: Same as always — 8 Rights agents only, no experts.


# ============================================================================
# MILESTONE: COUNCIL OF EXPERTS COMPLETE
# ============================================================================
#
# With this deployment, the full product as specified in the technical
# spec (Section 4.2) is live:
#
#   Council of Rights:  8 agents (Noble Eightfold Path)     ✓
#   Council of Experts: 6 agents (domain specialists)       ✓
#   Combined Council:   14 agents + Sutra synthesis         ✓
#
# This matches the patent's ensemble agent deliberation system and
# the tech spec's three council modes (rights | experts | combined).
