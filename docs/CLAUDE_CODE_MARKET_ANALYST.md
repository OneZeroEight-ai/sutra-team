# ADDING THE MARKET ANALYST TO THE COUNCIL OF EXPERTS
# ====================================================
# Claude Code Directive for sutra.team
#
# Adds the Market Analyst as the next domain-specialist agent
# in the Council of Experts. Follows the same pattern as legal_analyst.
# ====================================================


# ============================================================================
# STEP 1: COPY THE PERSONA JSON
# ============================================================================

# Copy market_analyst.json into the experts persona directory:

```bash
cp market_analyst.json server/agents/personas/experts/market_analyst.json
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
#     legal_analyst.json     ← existing
#     market_analyst.json    ← NEW


# ============================================================================
# STEP 2: UPDATE _EXPERT_PDF_KEY_TO_META IN deliberation.py
# ============================================================================

# Find _EXPERT_PDF_KEY_TO_META in server/agents/deliberation.py
# and add the market_analyst entry.
#
# It should look like this after the change:

```python
_EXPERT_PDF_KEY_TO_META: dict[str, dict] = {
    "legal_analyst": {"name": "The Legal Analyst", "domain": "Legal Strategy & Risk Assessment"},
    "market_analyst": {"name": "The Market Analyst", "domain": "Competitive Intelligence & Market Strategy"},
    # Future experts:
    # "financial_strategist": {"name": "The Financial Strategist", "domain": "Financial Analysis"},
    # "technical_architect": {"name": "The Technical Architect", "domain": "Systems & Architecture"},
    # "risk_assessor": {"name": "The Risk Assessor", "domain": "Threat Modeling & Contingency"},
    # "growth_strategist": {"name": "The Growth Strategist", "domain": "Go-to-Market & Scaling"},
}
```

# IMPORTANT: No other code changes should be needed. The expert persona
# loading code auto-discovers all .json files in the experts/ directory.
# As long as the key in _EXPERT_PDF_KEY_TO_META matches the filename stem
# (market_analyst.json → "market_analyst"), it will load automatically.


# ============================================================================
# STEP 3: VERIFY — NO OTHER CODE CHANGES NEEDED
# ============================================================================

# The following should already be in place from the legal_analyst integration:
#
# ✓ Expert persona loading loop in deliberation.py (glob("*.json") in experts/)
# ✓ _select_agents() handling "experts" and "combined" council modes
# ✓ _build_expert_prompt() function for flattening expert JSON to system prompts
# ✓ Council mode selector in the deliberation UI
# ✓ Sutra synthesis handling expert perspectives
#
# If any of these are missing, refer to CLAUDE_CODE_LEGAL_ANALYST.md
# and implement the missing pieces first.
#
# To verify the loading code exists, search for this pattern:
#   for pdf_path in sorted(_EXPERTS_DIR.glob("*.json")):
# If found, the auto-discovery is working and market_analyst.json
# will be picked up automatically.


# ============================================================================
# STEP 4: DEPLOY
# ============================================================================

# 1. Commit and push to GitHub (Vercel auto-deploys frontend — no UI changes needed):
```bash
git add server/agents/personas/experts/market_analyst.json server/agents/deliberation.py
git commit -m "feat: market analyst expert agent"
git push
```

# 2. Redeploy Railway (new persona file):
# If Railway is connected to GitHub, it auto-deploys.
# If using CLI:
```bash
cd server/agents
railway up --service sutra-council-agents
```

# 3. Verify in Railway logs that both experts load:
#    INFO:sutra-deliberation:[PDF] Loaded expert legal_analyst: XXXX words
#    INFO:sutra-deliberation:[PDF] Loaded expert market_analyst: XXXX words
#    INFO:sutra-deliberation:[PDF] Expert persona system active: 2 experts loaded


# ============================================================================
# TESTING
# ============================================================================

# Test 1: Expert mode — market question
# Select "Council of Experts" → submit:
#   "Should I enter the AI decision-support market targeting mid-market consulting firms?"
# Expected: Both Legal Analyst AND Market Analyst respond.
#   Market Analyst should: name specific competitors, size the beachhead,
#   assess timing window, and close with a positioning statement.

# Test 2: Expert mode — competitive question
# Select "Council of Experts" → submit:
#   "How should we position against ChatGPT Enterprise and Microsoft Copilot?"
# Expected: Market Analyst leads with competitive map, identifies
#   positioning white space, and honestly assesses competitive moats.

# Test 3: Combined mode
# Select "Combined" → submit:
#   "Is it ethical to market AI decision support as superior to human advisory councils?"
# Expected: Rights agents evaluate the ethical dimensions,
#   Market Analyst evaluates the positioning/messaging strategy,
#   Legal Analyst flags advertising law considerations,
#   Sutra synthesizes all perspectives.

# Test 4: Rights mode (unchanged)
# Select "Council of Rights" → submit: any question
# Expected: Same as before — 8 Rights agents only, no experts.
