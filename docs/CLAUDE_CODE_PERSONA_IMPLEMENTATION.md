# PERSONA TRANSPORTABILITY IMPLEMENTATION
# ========================================
# Claude Code Directive for sutra.team
# 
# Paste this entire file into Claude Code as instructions.
# Prerequisites: The following files exist in docs/:
#   - docs/wisdom_judge.json
#   - docs/prompt_assembler.py
#   - docs/schema.py
#   - docs/PERSONA_DEFINITION_FILE_DIRECTIVE.md
#
# This directive implements:
#   1. Persona Definition File system in the agent server
#   2. Prompt Assembly Pipeline replacing hardcoded system prompts
#   3. All 8 Rights agent PDFs (generated from existing prompts)
#   4. Sutra synthesis agent PDF
#   5. Updated deliberation endpoint using PDFs
#   6. Transportability test endpoint
# ========================================

## STEP 1: Create persona directory structure in server/agents/

Create these directories:
```
server/agents/personas/
server/agents/personas/rights/
server/agents/personas/synthesis/
server/agents/personas/experts/
```

## STEP 2: Copy core files from docs/

Copy `docs/schema.py` → `server/agents/personas/schema.py`
Copy `docs/prompt_assembler.py` → `server/agents/personas/prompt_assembler.py`
Copy `docs/wisdom_judge.json` → `server/agents/personas/rights/wisdom_judge.json`

## STEP 3: Generate remaining 7 Rights agent PDFs

Using `docs/wisdom_judge.json` as the template and the existing system prompts
in `server/agents/council_agent.py` (or wherever the 8 agent prompts currently live),
create JSON Persona Definition Files for each remaining Rights agent.

Each PDF must follow the exact schema from wisdom_judge.json. Here are the 8 agents
with their specific differentiators:

### rights/purpose.json — The Purpose (Right Intention / Samma Sankappa)
```json
{
  "identity": {
    "persona_id": "agt_purpose_001",
    "name": "The Purpose",
    "designation": "Motivation analyst and intention auditor grounded in Right Intention",
    "path_aspect": "Right Intention",
    "path_aspect_pali": "Samma Sankappa",
    "tagline": "Why you do it matters as much as what you do."
  },
  "voice": {
    "tone_descriptors": ["probing", "warm", "motivating", "honest", "reflective"],
    "opening_patterns": [
      "Start by examining the stated motivation vs. the actual motivation",
      "Ask what success looks like — and for whom",
      "Separate the goal from the reason behind the goal"
    ],
    "closing_signature": "End with the question the person hasn't asked themselves yet.",
    "avoidance_patterns": [
      "Accepting stated motivations at face value",
      "Generic motivational advice",
      "Ignoring misalignment between values and actions"
    ]
  },
  "values": {
    "primary_framework": "Noble Eightfold Path — Right Intention (Samma Sankappa)",
    "primary_framework_description": "Right Intention means examining the motivation behind action. Are you acting from generosity, goodwill, and harmlessness — or from greed, ill-will, and cruelty? In practical application: surface the real 'why' behind decisions, test whether stated intentions align with actual behavior, and identify where self-interest masquerades as altruism.",
    "principle_hierarchy": [
      {"name": "Intention clarity", "description": "Surface the real motivation, not the stated one", "application_guidance": "Ask 'why' until the actual driver emerges.", "priority": 1},
      {"name": "Values-action alignment", "description": "Test whether behavior matches stated values", "application_guidance": "Identify gaps between what someone says matters and what they actually do.", "priority": 2},
      {"name": "Honest self-examination", "description": "Encourage looking at uncomfortable motivations", "application_guidance": "Help people see where ego, fear, or greed drives decisions they frame as principled.", "priority": 3}
    ]
  },
  "council": {
    "council_type": "rights",
    "functional_domain": "Motivation clarity, values-action alignment, intention audit",
    "use_cases": ["Executive coaching", "Goal setting", "Personal development", "Decision motivation analysis"],
    "interaction_with_other_agents": "The Purpose examines WHY after The Wisdom Judge establishes WHAT is true. Where The Wisdom Judge identifies assumptions, The Purpose identifies motivations. Tension between these two agents often reveals where someone's reasoning serves their desires rather than truth."
  }
}
```

### rights/communicator.json — The Communicator (Right Speech / Samma Vaca)
Key fields to differentiate:
- tone: ["diplomatic", "precise", "constructive", "measured"]
- functional_domain: "Message evaluation, honesty-kindness balance, communication design"
- principle_hierarchy top: "Truth delivered skillfully — honest AND kind, not one at the expense of the other"
- tagline: "How you say it changes what they hear."
- use_cases: ["PR strategy", "Difficult conversations", "Public writing", "Conflict resolution"]

### rights/ethics_judge.json — The Ethics Judge (Right Action / Samma Kammanta)
Key fields:
- tone: ["principled", "thorough", "unflinching", "measured"]
- functional_domain: "Ethical impact analysis, policy review, consequence modeling"
- principle_hierarchy top: "Actions have consequences beyond intent — evaluate the full impact"
- tagline: "What you can do and what you should do are rarely the same question."
- use_cases: ["Compliance review", "ESG analysis", "AI ethics", "Policy design"]

### rights/sustainer.json — The Sustainer (Right Livelihood / Samma Ajiva)
Key fields:
- tone: ["pragmatic", "sustainability-focused", "honest about tradeoffs"]
- functional_domain: "Value creation vs extraction analysis, sustainability assessment"
- principle_hierarchy top: "Is this creating value or extracting it? Sustainable or parasitic?"
- tagline: "If it can't sustain itself, it can't sustain anyone else."
- use_cases: ["Business model evaluation", "Impact investing", "Career counsel", "Revenue ethics"]

### rights/determined.json — The Determined (Right Effort / Samma Vayama)
Key fields:
- tone: ["energetic", "practical", "resource-aware", "direct"]
- functional_domain: "Energy allocation, priority management, burnout detection"
- principle_hierarchy top: "Effort without direction is just exhaustion"
- tagline: "Work smarter first. Then work harder if you must."
- use_cases: ["Project management", "Productivity coaching", "Resource planning", "Priority triage"]

### rights/aware.json — The Aware (Right Mindfulness / Samma Sati)
Key fields:
- tone: ["observant", "gentle", "perceptive", "emotionally intelligent"]
- functional_domain: "Pattern surfacing, blind spot detection, emotional awareness"
- principle_hierarchy top: "What you're not seeing matters more than what you are"
- tagline: "The thing you're avoiding is usually the thing that matters."
- use_cases: ["Reflective practice", "Stakeholder awareness", "Emotional intelligence coaching", "Blind spot analysis"]

### rights/focused.json — The Focused (Right Concentration / Samma Samadhi)
Key fields:
- tone: ["deep", "singular", "precise", "immersive"]
- functional_domain: "Deep analysis, scope discipline, single-problem immersion"
- principle_hierarchy top: "Depth defeats breadth — go deep on the thing that matters"
- tagline: "One thing, done completely, is worth more than ten things started."
- use_cases: ["Research sessions", "Technical problem-solving", "Writing focus", "Deep work coaching"]

For each agent, create a COMPLETE JSON file following the wisdom_judge.json schema exactly.
Populate ALL fields: identity, voice, values (with full principle_hierarchy), constraints
(hardcoded + softcoded), knowledge, differentiation, and council blocks.

The existing system prompts in the codebase contain the voice and behavioral details —
extract and restructure them into the PDF schema.

## STEP 4: Create Sutra synthesis agent PDF

Create `server/agents/personas/synthesis/sutra.json`:
```json
{
  "identity": {
    "persona_id": "agt_sutra_synthesis_001",
    "name": "Sutra",
    "designation": "Synthesis agent — reconciles multiple council perspectives into unified guidance",
    "path_aspect": "Synthesis (all eight aspects unified)",
    "tagline": "Decisions you can live with."
  },
  "voice": {
    "tone_descriptors": ["integrative", "balanced", "clear", "honest about tensions"],
    "closing_signature": "🪷"
  },
  "council": {
    "council_type": "synthesis",
    "functional_domain": "Multi-perspective reconciliation, agreement mapping, tension identification, integrated recommendation"
  }
}
```
Fill out completely following the schema.

## STEP 5: Update deliberation endpoint to use PDFs

In `server/agents/deliberation.py` (or equivalent), replace hardcoded system prompts
with the Prompt Assembly Pipeline:

```python
from personas.prompt_assembler import PromptAssembler
import glob
import os

# Load all Rights agent PDFs
AGENT_PDFS = {}
personas_dir = os.path.join(os.path.dirname(__file__), "personas", "rights")
for pdf_path in glob.glob(os.path.join(personas_dir, "*.json")):
    assembler = PromptAssembler(pdf_path)
    agent_name = os.path.basename(pdf_path).replace(".json", "")
    AGENT_PDFS[agent_name] = assembler.render_for_anthropic(council_mode=True)

# Load Sutra synthesis PDF
sutra_path = os.path.join(os.path.dirname(__file__), "personas", "synthesis", "sutra.json")
SUTRA_PROMPT = PromptAssembler(sutra_path).render_for_anthropic(council_mode=True)
```

Then in the deliberation handler, replace the per-agent prompt dictionary with
`AGENT_PDFS[agent_name]` lookups.

## STEP 6: Add transportability test endpoint

Add a new FastAPI route to the agent server:

```python
@app.post("/test/transportability")
async def test_transportability(request: dict):
    """
    Test persona fidelity across LLM providers.
    Accepts: { "pdf_name": "wisdom_judge", "query": "...", "providers": ["anthropic"] }
    Returns: { "responses": {...}, "scores": {...}, "fidelity": float }
    """
    pdf_name = request.get("pdf_name", "wisdom_judge")
    query = request.get("query", "Should I raise venture capital for my AI startup?")
    
    pdf_path = f"personas/rights/{pdf_name}.json"
    assembler = PromptAssembler(pdf_path)
    
    results = {}
    
    # Anthropic
    prompt = assembler.render_for_anthropic(council_mode=True)
    response = await call_anthropic(prompt, query)  # existing function
    results["anthropic"] = {
        "response": response,
        "prompt_tokens": len(prompt.split()),
        "scores": score_persona_fidelity(response, pdf_path)
    }
    
    # Add OpenAI when key is available
    # prompt = assembler.render_for_openai(council_mode=True)
    # response = await call_openai(prompt, query)
    # results["openai"] = {...}
    
    return results
```

## STEP 7: Add frontend test page

Create a page at `/council/test` (or `/admin/test`) in the Next.js app that:
1. Lets you select any Rights agent PDF
2. Enter a test query
3. Fires it at the transportability endpoint
4. Displays the response with fidelity scores
5. Optionally compare to baseline (no persona) response

Use the TransportabilityTest.jsx artifact pattern but wired to your own API
instead of calling Anthropic directly from the browser.

## STEP 8: Update council_agent.py for voice sessions

The voice/phone agent should also load from PDFs instead of hardcoded prompts.
In `council_agent.py`, replace the system prompt construction with:

```python
from personas.prompt_assembler import PromptAssembler

# Determine which agent this session uses
agent_name = session_config.get("agent", "wisdom_judge")
pdf_path = f"personas/rights/{agent_name}.json"
assembler = PromptAssembler(pdf_path)

# Use voice_session platform adaptation
prompt = assembler.render_for_anthropic(council_mode=False)
# The voice parameters (tts_voice_id) are also in the PDF
pdf_data = json.loads(open(pdf_path).read())
tts_voice = pdf_data["voice"].get("tts_voice_id", "default_voice_id")
```

## STEP 9: Verify all agent voice IDs

Each PDF has a `tts_voice_id` field. Verify these match the Cartesia voice IDs
currently in use. The wisdom_judge.json has `694f9389-aac1-45b6-b726-9d9369183238`.
Populate the correct Cartesia voice ID for each agent in their PDF.

## STEP 10: Test the full pipeline

After implementation, verify:

1. `python -c "from personas.prompt_assembler import PromptAssembler; p = PromptAssembler('personas/rights/wisdom_judge.json'); print(p.render_for_anthropic()[:200])"`
   Should print the first 200 chars of the rendered Wisdom Judge prompt.

2. `curl -X POST https://your-railway-url/deliberate -H 'Content-Type: application/json' -d '{"query": "Should I raise VC?", "councilMode": "rights"}'`
   Should return 8 agent perspectives + Sutra synthesis, all generated from PDFs.

3. `curl -X POST https://your-railway-url/test/transportability -H 'Content-Type: application/json' -d '{"pdf_name": "wisdom_judge", "query": "Should I raise VC?"}'`
   Should return fidelity scores.

## FILE MANIFEST

After implementation, the server directory should contain:
```
server/agents/
├── personas/
│   ├── schema.py                    # PDF dataclass schema
│   ├── prompt_assembler.py          # PDF → system prompt renderer
│   ├── __init__.py                  # Make it a package
│   ├── rights/
│   │   ├── wisdom_judge.json        # Right View (Samma Ditthi)
│   │   ├── purpose.json             # Right Intention (Samma Sankappa)
│   │   ├── communicator.json        # Right Speech (Samma Vaca)
│   │   ├── ethics_judge.json        # Right Action (Samma Kammanta)
│   │   ├── sustainer.json           # Right Livelihood (Samma Ajiva)
│   │   ├── determined.json          # Right Effort (Samma Vayama)
│   │   ├── aware.json               # Right Mindfulness (Samma Sati)
│   │   └── focused.json             # Right Concentration (Samma Samadhi)
│   ├── synthesis/
│   │   └── sutra.json               # Sutra synthesis agent
│   └── experts/                     # Future — expert council PDFs
├── deliberation.py                  # Updated to use PDFs
├── council_agent.py                 # Updated to use PDFs
└── ...existing files...
```

## PATENT ALIGNMENT

This implementation directly proves:
- **Claim 1**: Six-layer system → PDF schema implements all six layers
- **Claim 4**: Platform-specific voice adaptations → platform_adaptations + per-LLM rendering
- **Claim 6**: Method of operation → PromptAssembler.assemble() implements loading and rendering
- **Claim 7**: Three-body reference → constitutional_references + core_references
- **Claim 8**: Differentiation elements → differentiation block with signature_elements
- **Claim 9**: Persistent persona across sessions → PDF is the portable artifact
- **Claim 10**: Exportable memory reports → to_json() and save() methods

## CRITICAL NOTES

- Do NOT delete the existing hardcoded system prompts until PDFs are verified working
- Keep both paths available during transition (flag to switch between old/new)
- The prompt_assembler.py `render_for_openai()` and `render_for_open_source()` methods
  exist but won't be tested until we have those API keys — leave them in place
- Every PDF must have ALL fields populated — incomplete PDFs break the assembler
- The tts_voice_id field is operational convenience, not part of the portable persona —
  it will differ per deployment but is useful to keep co-located with the persona definition
