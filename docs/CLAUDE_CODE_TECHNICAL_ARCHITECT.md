# ADDING THE TECHNICAL ARCHITECT TO THE COUNCIL OF EXPERTS
# =========================================================
# Claude Code Directive for sutra.team
#
# Adds the Technical Architect as the next domain-specialist agent.
# Same pattern as previous experts.
# =========================================================


# ============================================================================
# STEP 1: COPY THE PERSONA JSON
# ============================================================================

```bash
cp technical_architect.json server/agents/personas/experts/technical_architect.json
```

# Directory structure after:
# server/agents/personas/experts/
#   legal_analyst.json
#   market_analyst.json
#   financial_strategist.json
#   risk_assessor.json
#   technical_architect.json        ← NEW


# ============================================================================
# STEP 2: UPDATE _EXPERT_PDF_KEY_TO_META IN deliberation.py
# ============================================================================

```python
_EXPERT_PDF_KEY_TO_META: dict[str, dict] = {
    "legal_analyst": {"name": "The Legal Analyst", "domain": "Legal Strategy & Risk Assessment"},
    "market_analyst": {"name": "The Market Analyst", "domain": "Competitive Intelligence & Market Strategy"},
    "financial_strategist": {"name": "The Financial Strategist", "domain": "Financial Analysis & Capital Strategy"},
    "risk_assessor": {"name": "The Risk Assessor", "domain": "Threat Modeling & Strategic Risk Management"},
    "technical_architect": {"name": "The Technical Architect", "domain": "Systems Design & Technical Strategy"},
    # Future experts:
    # "growth_strategist": {"name": "The Growth Strategist", "domain": "Go-to-Market & Scaling"},
}
```


# ============================================================================
# STEP 3: ENABLE IN THE UI
# ============================================================================

# In src/app/council/deliberate/page.tsx, find the expert agents list.
# Ensure the Technical Architect shows as active, not greyed out.
# Match the pattern of existing active experts.


# ============================================================================
# STEP 4: DEPLOY
# ============================================================================

```bash
git add server/agents/personas/experts/technical_architect.json server/agents/deliberation.py src/app/council/deliberate/page.tsx
git commit -m "feat: technical architect expert agent"
git push
```

# Railway auto-deploys from GitHub.
# Verify in logs:
#   INFO:sutra-deliberation:[PDF] Loaded expert technical_architect: XXXX words
#   INFO:sutra-deliberation:[PDF] Expert persona system active: 5 experts loaded


# ============================================================================
# TESTING
# ============================================================================

# Test 1: Expert mode — architecture decision
# Select "Council of Experts" → submit:
#   "We're building an AI SaaS platform on Vercel + Railway with 100 users. Should we switch to AWS now or wait?"
# Expected: Technical Architect leads with the constraint (100 users,
#   small team), recommends staying on current stack with migration path
#   documented, names what would trigger the switch.

# Test 2: Expert mode — build vs buy
# Select "Council of Experts" → submit:
#   "Should we build our own authentication system or keep using Clerk?"
# Expected: Technical Architect strongly recommends keeping Clerk (auth is
#   commodity infrastructure, not differentiation), names the tradeoffs,
#   and identifies when self-hosting auth would make sense.

# Test 3: Expert mode — AI infrastructure
# Select "Council of Experts" → submit:
#   "How should we architect multi-agent parallel deliberation to minimize latency and cost?"
# Expected: Technical Architect addresses asyncio.gather pattern, token
#   budget management, provider abstraction, fallback strategies, and
#   cost monitoring — directly relevant to Sutra's own architecture.

# Test 4: Combined mode
# Select "Combined" → submit:
#   "We need to decide whether to add real-time voice AI sessions alongside our text deliberation. What are the implications?"
# Expected: Technical Architect covers LiveKit integration complexity,
#   infrastructure cost, latency requirements. Other experts and Rights
#   agents add financial, market, risk, and ethical perspectives.
#   Sutra synthesizes the full picture.
