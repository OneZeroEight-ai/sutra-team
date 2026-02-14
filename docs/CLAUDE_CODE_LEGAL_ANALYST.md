# ADDING THE LEGAL ANALYST TO THE COUNCIL OF EXPERTS
# ====================================================
# Claude Code Directive for sutra.team
#
# Adds the Legal Analyst as the first domain-specialist agent
# in the Council of Experts. Uses the same persona PDF architecture
# as the Council of Rights agents.
# ====================================================


# ============================================================================
# STEP 1: COPY THE PERSONA JSON
# ============================================================================

# Copy legal_analyst.json into the personas directory alongside the existing agents:

```bash
mkdir -p server/agents/personas/experts
cp legal_analyst.json server/agents/personas/experts/legal_analyst.json
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
#   experts/          ← NEW
#     legal_analyst.json


# ============================================================================
# STEP 2: UPDATE deliberation.py TO LOAD EXPERT PERSONAS
# ============================================================================

# In server/agents/deliberation.py, add expert persona loading
# alongside the existing rights persona loading.

# After the existing rights loading block (around line ~55-70), add:

```python
# --- Expert PDF personas ---
_EXPERT_PDF_PROMPTS: dict[str, str] = {}
_EXPERT_PDF_KEY_TO_META: dict[str, dict] = {
    "legal_analyst": {"name": "The Legal Analyst", "domain": "Legal Strategy & Risk Assessment"},
    # Add more experts here as they're created:
    # "financial_strategist": {"name": "The Financial Strategist", "domain": "Financial Analysis"},
    # "technical_architect": {"name": "The Technical Architect", "domain": "Systems & Architecture"},
    # "market_analyst": {"name": "The Market Analyst", "domain": "Competitive Intelligence"},
    # "risk_assessor": {"name": "The Risk Assessor", "domain": "Threat Modeling & Contingency"},
    # "growth_strategist": {"name": "The Growth Strategist", "domain": "Go-to-Market & Scaling"},
}

try:
    _EXPERTS_DIR = Path(__file__).parent / "personas" / "experts"
    for pdf_path in sorted(_EXPERTS_DIR.glob("*.json")):
        agent_key = pdf_path.stem
        assembler = PromptAssembler(str(pdf_path))
        _EXPERT_PDF_PROMPTS[agent_key] = assembler.render_for_anthropic(council_mode=True)
        logger.info(f"[PDF] Loaded expert {agent_key}: {len(_EXPERT_PDF_PROMPTS[agent_key].split())} words")
    if _EXPERT_PDF_PROMPTS:
        logger.info(f"[PDF] Expert persona system active: {len(_EXPERT_PDF_PROMPTS)} experts loaded")
except Exception as e:
    logger.info(f"[PDF] Expert persona system not available: {e}")
```


# ============================================================================
# STEP 3: UPDATE _select_agents() TO SUPPORT EXPERT MODE
# ============================================================================

# Find the _select_agents function in deliberation.py and update it
# to return expert agents when councilMode is "experts" or "combined".

# The current function probably only handles "rights". Update to:

```python
def _select_agents(council_mode: str) -> list[dict]:
    agents = []

    if council_mode in ("rights", "combined"):
        if _USE_PDF_PERSONAS and _PDF_PROMPTS:
            for key, prompt in _PDF_PROMPTS.items():
                meta = _PDF_KEY_TO_META.get(key, {"name": key, "aspect": key})
                agents.append({
                    "agent_id": f"rights-{key}",
                    "agent_name": meta["name"],
                    "path_aspect": meta.get("aspect", ""),
                    "council": "rights",
                    "system_prompt": prompt,
                })
        else:
            for agent in RIGHTS_AGENTS:
                agents.append({
                    "agent_id": f"rights-{agent['key']}",
                    "agent_name": agent["name"],
                    "path_aspect": agent.get("aspect", ""),
                    "council": "rights",
                    "system_prompt": agent["system_prompt"],
                })

    if council_mode in ("experts", "combined"):
        if _EXPERT_PDF_PROMPTS:
            for key, prompt in _EXPERT_PDF_PROMPTS.items():
                meta = _EXPERT_PDF_KEY_TO_META.get(key, {"name": key, "domain": key})
                agents.append({
                    "agent_id": f"expert-{key}",
                    "agent_name": meta["name"],
                    "domain": meta.get("domain", ""),
                    "council": "experts",
                    "system_prompt": prompt,
                })
        else:
            for agent in EXPERT_AGENTS:
                agents.append({
                    "agent_id": f"expert-{agent['key']}",
                    "agent_name": agent["name"],
                    "domain": agent.get("domain", ""),
                    "council": "experts",
                    "system_prompt": agent["system_prompt"],
                })

    return agents
```


# ============================================================================
# STEP 4: VERIFY THE PROMPT ASSEMBLER HANDLES EXPERT SCHEMA
# ============================================================================

# The existing PromptAssembler in server/agents/personas/prompt_assembler.py
# was built for the Rights council JSON schema. The Legal Analyst JSON has a
# different structure (knowledge_base instead of eightfold_path, etc.)
#
# The PromptAssembler needs to handle the expert schema gracefully.
# Either:
#   (a) Make PromptAssembler flexible enough to handle both schemas, OR
#   (b) For expert personas, build the system prompt directly from the JSON
#
# Quick approach (b) — add this helper function to deliberation.py:

```python
import json

def _build_expert_prompt(json_path: str) -> str:
    """Build a system prompt from an expert persona JSON file."""
    with open(json_path, 'r') as f:
        data = json.load(f)

    parts = []

    # Identity
    identity = data.get("identity", {})
    parts.append(f"# {data.get('name', 'Expert Agent')}")
    parts.append(f"## Role\n{identity.get('role', '')}")
    parts.append(f"## Approach\n{identity.get('approach', '')}")

    # Voice
    voice = data.get("voice", {})
    if voice.get("style"):
        parts.append(f"## Communication Style\n{voice['style']}")
    if voice.get("avoidance_patterns"):
        parts.append("## Avoidance Patterns\n" + "\n".join(f"- {p}" for p in voice["avoidance_patterns"]))
    if voice.get("closing_signature"):
        parts.append(f"## Closing\n{voice['closing_signature']}")

    # Value framework
    vf = data.get("value_framework", {})
    if vf.get("primary"):
        parts.append(f"## Core Principle\n{vf['primary']}")
    if vf.get("principles"):
        parts.append("## Guiding Principles\n" + "\n".join(f"- {p}" for p in vf["principles"]))

    # Knowledge base — the meat
    kb = data.get("knowledge_base", {})

    # Analytical frameworks
    frameworks = kb.get("analytical_frameworks", {})
    if frameworks:
        parts.append("## Analytical Frameworks")
        for name, details in frameworks.items():
            parts.append(f"### {name}")
            if isinstance(details, dict):
                for k, v in details.items():
                    parts.append(f"**{k}:** {v}")
            else:
                parts.append(str(details))

    # Core domains — flatten all nested knowledge
    domains = kb.get("core_domains", {})
    if domains:
        parts.append("## Domain Knowledge")
        for domain_name, domain_data in domains.items():
            parts.append(f"### {domain_name.replace('_', ' ').title()}")
            _flatten_knowledge(domain_data, parts, depth=0)

    # Disclaimers
    disclaimers = kb.get("disclaimers", {})
    if disclaimers:
        parts.append("## Important Disclaimers")
        for k, v in disclaimers.items():
            parts.append(f"- {v}")

    # Behavioral constraints
    bc = data.get("behavioral_constraints", {})
    if bc.get("hardcoded"):
        parts.append("## Absolute Constraints\n" + "\n".join(f"- {c}" for c in bc["hardcoded"]))

    # Response patterns
    rp = data.get("response_patterns", {})
    if rp.get("for_council_deliberation"):
        parts.append(f"## Council Deliberation Response Format\n{rp['for_council_deliberation']}")

    return "\n\n".join(parts)


def _flatten_knowledge(data, parts, depth=0):
    """Recursively flatten nested knowledge dicts into readable text."""
    indent = "  " * depth
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, dict):
                parts.append(f"{indent}**{key.replace('_', ' ').title()}:**")
                _flatten_knowledge(value, parts, depth + 1)
            elif isinstance(value, list):
                parts.append(f"{indent}**{key.replace('_', ' ').title()}:** " + "; ".join(str(v) for v in value))
            else:
                parts.append(f"{indent}**{key.replace('_', ' ').title()}:** {value}")
    elif isinstance(data, str):
        parts.append(f"{indent}{data}")
```

# Then in the expert loading block, use _build_expert_prompt instead of PromptAssembler:

```python
try:
    _EXPERTS_DIR = Path(__file__).parent / "personas" / "experts"
    for json_path in sorted(_EXPERTS_DIR.glob("*.json")):
        agent_key = json_path.stem
        _EXPERT_PDF_PROMPTS[agent_key] = _build_expert_prompt(str(json_path))
        logger.info(f"[PDF] Loaded expert {agent_key}: {len(_EXPERT_PDF_PROMPTS[agent_key].split())} words")
    if _EXPERT_PDF_PROMPTS:
        logger.info(f"[PDF] Expert persona system active: {len(_EXPERT_PDF_PROMPTS)} experts loaded")
except Exception as e:
    logger.info(f"[PDF] Expert persona system not available: {e}")
```


# ============================================================================
# STEP 5: UPDATE THE DELIBERATION UI FOR COUNCIL MODE SELECTION
# ============================================================================

# In src/app/council/deliberate/page.tsx, add a council mode selector
# so users can choose between Rights, Experts, or Combined.

# Add state:
```tsx
const [councilMode, setCouncilMode] = useState<'rights' | 'experts' | 'combined'>('rights')
```

# Add selector above the textarea:
```tsx
<div className="flex gap-2 mb-4">
  {(['rights', 'experts', 'combined'] as const).map(mode => (
    <button
      key={mode}
      onClick={() => setCouncilMode(mode)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        councilMode === mode
          ? 'bg-violet-600 text-white'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
      }`}
    >
      {mode === 'rights' && 'Council of Rights'}
      {mode === 'experts' && 'Council of Experts'}
      {mode === 'combined' && 'Combined'}
    </button>
  ))}
</div>
```

# Update the fetch body to use the selected mode:
```tsx
body: JSON.stringify({
  query: query.trim(),
  councilMode: councilMode,
  outputFormat: "structured",
}),
```

# Note: Combined mode runs BOTH councils (8 rights + N experts).
# This uses more tokens and takes longer (~45-60 seconds).
# Consider making Combined mode cost 2 credits instead of 1.


# ============================================================================
# STEP 6: DEPLOY
# ============================================================================

# 1. Commit and push to GitHub (Vercel auto-deploys frontend):
```bash
git add .
git commit -m "feat: legal analyst expert agent + council mode selector"
git push
```

# 2. Redeploy Railway (new persona file + updated deliberation.py):
```bash
cd server/agents
railway up
```

# 3. Verify in Railway logs that the expert loads:
#    INFO:sutra-deliberation:[PDF] Loaded expert legal_analyst: XXXX words
#    INFO:sutra-deliberation:[PDF] Expert persona system active: 1 experts loaded


# ============================================================================
# TESTING
# ============================================================================

# Test 1: Expert mode only
# Select "Council of Experts" → submit: "Should I file a provisional or non-provisional patent first?"
# Expected: Legal Analyst provides structured IRAC analysis of patent strategy

# Test 2: Combined mode
# Select "Combined" → submit: "Is it ethical and legal to use AI-generated content in a patent filing?"
# Expected: Both Rights agents AND Legal Analyst respond, Sutra synthesizes both perspectives

# Test 3: Rights mode (unchanged)
# Select "Council of Rights" → submit: any question
# Expected: Same behavior as before — 8 Rights agents only


# ============================================================================
# FUTURE EXPERT AGENTS
# ============================================================================

# To add more experts, create JSON files in server/agents/personas/experts/:
#
#   financial_strategist.json
#   technical_architect.json
#   market_analyst.json
#   risk_assessor.json
#   growth_strategist.json
#
# Each follows the same schema as legal_analyst.json.
# Update _EXPERT_PDF_KEY_TO_META in deliberation.py with name/domain.
# The loading code auto-discovers all .json files in the experts/ directory.
# No other code changes needed — just add the JSON and redeploy.
