# ADDING THE FINANCIAL STRATEGIST TO THE COUNCIL OF EXPERTS
# ===========================================================
# Claude Code Directive for sutra.team
#
# Adds the Financial Strategist as the next domain-specialist agent
# in the Council of Experts. Same pattern as legal_analyst and market_analyst.
# ===========================================================


# ============================================================================
# STEP 1: COPY THE PERSONA JSON
# ============================================================================

# Copy financial_strategist.json into the experts persona directory:

```bash
cp financial_strategist.json server/agents/personas/experts/financial_strategist.json
```

# The directory structure should now look like:
# server/agents/personas/
#   rights/
#     wisdom_judge.json
#     purpose.json
#     communicator.json
#     ethics_judge.json
#     sustainer.json
#     determined.json
#     aware.json
#     focused.json
#   synthesis/
#     sutra.json
#   experts/
#     legal_analyst.json          ← existing
#     market_analyst.json         ← existing
#     financial_strategist.json   ← NEW


# ============================================================================
# STEP 2: UPDATE _EXPERT_PDF_KEY_TO_META IN deliberation.py
# ============================================================================

# Find _EXPERT_PDF_KEY_TO_META in server/agents/deliberation.py
# and add the financial_strategist entry.
#
# It should look like this after the change:

```python
_EXPERT_PDF_KEY_TO_META: dict[str, dict] = {
    "legal_analyst": {"name": "The Legal Analyst", "domain": "Legal Strategy & Risk Assessment"},
    "market_analyst": {"name": "The Market Analyst", "domain": "Competitive Intelligence & Market Strategy"},
    "financial_strategist": {"name": "The Financial Strategist", "domain": "Financial Analysis & Capital Strategy"},
    # Future experts:
    # "technical_architect": {"name": "The Technical Architect", "domain": "Systems & Architecture"},
    # "risk_assessor": {"name": "The Risk Assessor", "domain": "Threat Modeling & Contingency"},
    # "growth_strategist": {"name": "The Growth Strategist", "domain": "Go-to-Market & Scaling"},
}
```


# ============================================================================
# STEP 3: ENABLE IN THE UI
# ============================================================================

# In src/app/council/deliberate/page.tsx, find the expert agents list.
# The Financial Strategist may already be listed but greyed out / marked
# as "coming soon". Enable it so it shows as active alongside
# Legal Analyst and Market Analyst.
#
# Look for an array of expert agents and ensure financial_strategist
# (or "Financial Strategist") is NOT marked as disabled/coming_soon.
#
# If adding a new entry, match the pattern of existing active experts:
#   { name: "The Financial Strategist", domain: "Financial Analysis & Capital Strategy", active: true }


# ============================================================================
# STEP 4: VERIFY — NO OTHER CODE CHANGES NEEDED
# ============================================================================

# The following should already be in place from previous expert integrations:
#
# ✓ Expert persona loading loop (glob("*.json") in experts/ directory)
# ✓ _select_agents() handling "experts" and "combined" council modes
# ✓ _build_expert_prompt() function for flattening expert JSON
# ✓ Council mode selector in the deliberation UI
# ✓ Sutra synthesis handling expert perspectives
#
# The auto-discovery loop will pick up financial_strategist.json
# automatically as long as the key in _EXPERT_PDF_KEY_TO_META matches
# the filename stem (financial_strategist.json → "financial_strategist").


# ============================================================================
# STEP 5: DEPLOY
# ============================================================================

# 1. Commit and push to GitHub:
```bash
git add server/agents/personas/experts/financial_strategist.json server/agents/deliberation.py src/app/council/deliberate/page.tsx
git commit -m "feat: financial strategist expert agent"
git push
```

# 2. Railway auto-deploys from GitHub (if connected).
#    If not, deploy via CLI:
```bash
cd server/agents
railway up --service sutra-council-agents
```

# 3. Verify in Railway logs that all three experts load:
#    INFO:sutra-deliberation:[PDF] Loaded expert financial_strategist: XXXX words
#    INFO:sutra-deliberation:[PDF] Loaded expert legal_analyst: XXXX words
#    INFO:sutra-deliberation:[PDF] Loaded expert market_analyst: XXXX words
#    INFO:sutra-deliberation:[PDF] Expert persona system active: 3 experts loaded


# ============================================================================
# TESTING
# ============================================================================

# Test 1: Expert mode — financial question
# Select "Council of Experts" → submit:
#   "I have $50K in revenue, $8K/mo burn rate, and $120K in the bank. Should I raise a seed round or try to get to profitability?"
# Expected: Financial Strategist leads with runway calculation (15 months),
#   models both scenarios with explicit assumptions, identifies the
#   single metric that should drive the decision.

# Test 2: Expert mode — valuation question
# Select "Council of Experts" → submit:
#   "How should I think about valuation for a pre-revenue AI SaaS platform with a provisional patent and 3 pilot customers?"
# Expected: Financial Strategist discusses venture method, comparable
#   early-stage AI SaaS valuations, and what metrics matter pre-revenue.
#   Should NOT give a specific number without stating assumptions.

# Test 3: Combined mode — full council
# Select "Combined" → submit:
#   "Should I bootstrap or raise venture capital for an AI decision-support platform targeting professional services firms?"
# Expected: All Rights agents + all 3 Experts respond.
#   Financial Strategist analyzes unit economics and capital requirements.
#   Market Analyst assesses market size and timing.
#   Legal Analyst covers IP and fundraising legal considerations.
#   Rights agents evaluate ethical and strategic alignment.
#   Sutra synthesizes everything.

# Test 4: Rights mode (unchanged)
# Select "Council of Rights" → submit: any question
# Expected: Same as before — 8 Rights agents only, no experts.
