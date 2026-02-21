# ADDING THE RISK ASSESSOR TO THE COUNCIL OF EXPERTS
# ====================================================
# Claude Code Directive for sutra.team
#
# Adds the Risk Assessor as the next domain-specialist agent
# in the Council of Experts. Same pattern as previous experts.
# ====================================================


# ============================================================================
# STEP 1: COPY THE PERSONA JSON
# ============================================================================

```bash
cp risk_assessor.json server/agents/personas/experts/risk_assessor.json
```

# Directory structure after:
# server/agents/personas/experts/
#   legal_analyst.json
#   market_analyst.json
#   financial_strategist.json
#   risk_assessor.json              ← NEW


# ============================================================================
# STEP 2: UPDATE _EXPERT_PDF_KEY_TO_META IN deliberation.py
# ============================================================================

# Add the risk_assessor entry:

```python
_EXPERT_PDF_KEY_TO_META: dict[str, dict] = {
    "legal_analyst": {"name": "The Legal Analyst", "domain": "Legal Strategy & Risk Assessment"},
    "market_analyst": {"name": "The Market Analyst", "domain": "Competitive Intelligence & Market Strategy"},
    "financial_strategist": {"name": "The Financial Strategist", "domain": "Financial Analysis & Capital Strategy"},
    "risk_assessor": {"name": "The Risk Assessor", "domain": "Threat Modeling & Strategic Risk Management"},
    # Future experts:
    # "technical_architect": {"name": "The Technical Architect", "domain": "Systems & Architecture"},
    # "growth_strategist": {"name": "The Growth Strategist", "domain": "Go-to-Market & Scaling"},
}
```


# ============================================================================
# STEP 3: ENABLE IN THE UI
# ============================================================================

# In src/app/council/deliberate/page.tsx, find the expert agents list.
# Ensure the Risk Assessor shows as active, not greyed out or "coming soon".
# Match the pattern of existing active experts.


# ============================================================================
# STEP 4: DEPLOY
# ============================================================================

```bash
git add server/agents/personas/experts/risk_assessor.json server/agents/deliberation.py src/app/council/deliberate/page.tsx
git commit -m "feat: risk assessor expert agent"
git push
```

# Railway auto-deploys from GitHub.
# Verify in logs:
#   INFO:sutra-deliberation:[PDF] Loaded expert risk_assessor: XXXX words
#   INFO:sutra-deliberation:[PDF] Expert persona system active: 4 experts loaded


# ============================================================================
# TESTING
# ============================================================================

# Test 1: Expert mode — risk question
# Select "Council of Experts" → submit:
#   "What are the biggest risks of building an AI platform that depends on Anthropic's API for all agent interactions?"
# Expected: Risk Assessor leads with platform dependency risk, models
#   likelihood and impact, identifies mitigation (multi-provider support),
#   and closes with the highest-priority action.

# Test 2: Expert mode — pre-mortem
# Select "Council of Experts" → submit:
#   "We're about to launch our product publicly. Run a pre-mortem — what could cause this launch to fail?"
# Expected: Risk Assessor structures a pre-mortem with 5-7 failure modes,
#   each with likelihood/impact assessment and specific mitigations.

# Test 3: Combined mode
# Select "Combined" → submit:
#   "Should we take on a large enterprise client that would represent 60% of our revenue?"
# Expected: Risk Assessor flags concentration risk immediately.
#   Financial Strategist models the revenue impact.
#   Market Analyst assesses competitive implications.
#   Legal Analyst covers contractual protections.
#   Rights agents evaluate ethical dimensions.
#   Sutra synthesizes with the concentration risk tension front and center.
