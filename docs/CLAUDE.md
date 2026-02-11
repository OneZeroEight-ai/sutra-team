# CLAUDE.md — Sutra.team Project Reference

## What This Project Is

**Sutra.team** is a persona hosting platform that enables the creation, deployment, and operation of AI personas built on the patented Intelligent Agent architecture (U.S. Provisional Application, filed January 30, 2026, inventor: JB Wagoner). The platform is hosted on **SammaSuit.com** infrastructure.

The core product is the **Council** — an ensemble agent deliberation system where multiple specialized personas analyze a single input and a synthesis agent (**Sutra**) reconciles their outputs into a unified response.

### Platform Hierarchy

- **Infrastructure** — `sammasuit.com`: Hosting, billing, auth, API gateway, persona storage, memory, LLM orchestration
- **Product** — `sutra.team`: User-facing app, council interfaces, persona marketplace, onboarding, Sutra synthesis layer
- **Research** — `onezeroweight.ai`: Alignment testing, differentiation benchmarking, value framework validation
- **Philosophy** — *Zen AI* (book by JB Wagoner): Theoretical foundation for values-based alignment

## Architecture Overview

The system implements a **six-layer architecture** defined in the patent:

1. **Persona Definition Layer** — JSON Schema persona definitions (identity, voice, values, behavioral constraints)
2. **Knowledge Integration Layer** — Vector database (pgvector) + document store per persona
3. **Memory System** — Session-scoped and long-term memory with export/import for portability
4. **Value Framework Engine** — Rule engine + LLM-based value analysis with hierarchical principle resolution
5. **Multi-Modal Output System** — Text via LLM API + coordination hooks for Suno (music), DALL-E/Midjourney (image), audio
6. **Differentiation Documentation System** — Automated comparison engine generating differentiation scores vs. base model

## Two Council Modes

### Council of Rights (Fixed — 8 Agents)
Eight agents grounded in the Noble Eightfold Path:

| Agent | Path Aspect | Domain |
|-------|------------|--------|
| The Wisdom Judge | Right View (Samma Ditthi) | Strategic analysis, evidence evaluation |
| The Purpose | Right Intention (Samma Sankappa) | Motivation clarity, values-action alignment |
| The Communicator | Right Speech (Samma Vaca) | Message evaluation, communication design |
| The Ethics Judge | Right Action (Samma Kammanta) | Ethical impact analysis, consequence modeling |
| The Sustainer | Right Livelihood (Samma Ajiva) | Value creation vs. extraction, sustainability |
| The Determined | Right Effort (Samma Vayama) | Energy allocation, priority management |
| The Aware | Right Mindfulness (Samma Sati) | Pattern surfacing, blind spot detection |
| The Focused | Right Concentration (Samma Samadhi) | Deep analysis, single-problem immersion |

### Council of Experts (Composable)
Domain-specialist agents configurable per use case. Default set (startup/business focus): Legal Analyst, Financial Strategist, Technical Architect, Market Analyst, Risk Assessor, Growth Strategist.

### Combined Council Mode (Premium)
Runs both councils on the same query. Output has Strategic Analysis + Principled Evaluation + Integrated Recommendation. Core differentiator: "not just *what should I do* but *what should I do and can I live with it*."

## Tech Stack

| Service | Stack |
|---------|-------|
| API Gateway | Kong / AWS API Gateway + JWT/OAuth2 |
| Persona Config | Node.js/TypeScript + PostgreSQL + S3 |
| Knowledge Base | Python/FastAPI + pgvector (PostgreSQL) + chunking pipeline |
| Memory Persistence | PostgreSQL (structured) + Redis (session cache) + S3 (exports) |
| Value Processing | Python + rule engine + LLM-assisted analysis |
| Agent Execution | Python/asyncio + LLM API clients (Anthropic, OpenAI) + queue |
| Sutra Synthesis | Dedicated LLM pipeline with custom synthesis prompts |
| Output Orchestration | Node.js + integration adapters (Suno, DALL-E, etc.) |
| Differentiation Analytics | Python + automated testing framework + comparison DB |
| Billing | Stripe + usage tracking |

### LLM Orchestration
- Platform is **LLM-agnostic** by design; persona definitions are portable across providers
- Initial deployment targets **Anthropic Claude API**
- OpenAI and open-source model support planned
- Each agent invocation = LLM API call with structured system prompt assembled from persona def + knowledge chunks + memory context
- **Token budget per agent**: ~8,000–10,000 tokens system context

### Prompt Assembly Pipeline (per agent call)
1. System Identity (~500 tokens): name, designation, origin, voice params, closing signature
2. Value Framework (~1,000 tokens): principles, constitutional refs, decision hierarchy
3. Knowledge Context (~2,000 tokens dynamic): semantically retrieved chunks
4. Memory Context (~1,500 tokens dynamic): recent history, preferences
5. Differentiation Directives (~300 tokens): how this agent differs from base model
6. Council Context (~2,000 tokens, synthesis only): other agents' perspectives
7. User Query (variable)

## Deliberation Pipeline

1. **Input Reception** — API Gateway validates query + metadata
2. **Routing** — Council Router determines mode (Rights/Experts/Combined) and agents
3. **Context Assembly** — Memory + Knowledge Base builds per-agent context packages
4. **Parallel Deliberation** — All agents process simultaneously
5. **Perspective Collection** — Aggregator collects responses with confidence/sources/tensions
6. **Synthesis** — Sutra analyzes all perspectives: agreement mapping, tension identification, gap detection, hierarchical resolution, transparent uncertainty
7. **Output Formatting** — Formatted per user prefs and platform
8. **Memory Update** — Interaction stored for all participants + synthesis layer

## Key API Endpoints

```
POST   /v1/council/deliberate              — Submit query to council
POST   /v1/council/deliberate/stream       — Streaming via SSE
GET    /v1/council/{id}/perspectives        — Individual agent perspectives
POST   /v1/persona/create                   — Create persona
PUT    /v1/persona/{id}                     — Update persona (new version)
GET    /v1/persona/{id}                     — Get persona definition
POST   /v1/persona/{id}/chat               — Direct single-persona chat
GET    /v1/memory/{persona_id}/report       — Memory report
POST   /v1/memory/{persona_id}/import       — Import memory state
GET    /v1/differentiation/{id}/score       — Differentiation metrics
POST   /v1/knowledge/{id}/ingest            — Add docs to knowledge base
```

## Data Model — Persona Definition File (PDF)

Every persona is defined by four blocks:

### Identity Block
`persona_id` (UUID), `name`, `designation`, `origin_narrative`, `creator_id`, `tagline`, `version` (SemVer), `created_at`, `visibility` (private | unlisted | public | enterprise)

### Voice Parameters Block
`tone_descriptors` (string[]), `opening_patterns` (templates), `closing_signature`, `avoidance_patterns`, `platform_adaptations` (per-platform overrides), `vocabulary_preferences`, `formality_range` (0.0–1.0 tuple)

### Value Framework Block
`primary_framework` (FrameworkRef), `secondary_frameworks`, `constitutional_refs`, `principle_hierarchy` (ordered), `uncertainty_protocol` (escalate | deliberate | defer_to_user | apply_hierarchy), `decision_audit_log` (bool)

### Behavioral Constraints Block
`hardcoded_constraints` (absolute, non-overridable), `softcoded_defaults` (with override conditions), `escalation_protocols`, `boundary_definitions`

## Memory System — 4 Tiers

| Tier | Scope | Persistence | Contents |
|------|-------|-------------|----------|
| Session | Single conversation | 24h TTL | Conversation history, working context |
| Interaction | Per user-persona pair | Indefinite (user-deletable) | Learned preferences, past queries |
| Persona | Per persona (global) | Indefinite (creator-managed) | Cross-user patterns (anonymized) |
| Council | Per deliberation | Indefinite | Past deliberations, outcome tracking |

Memory reports export as JSON: `user_profile`, `interaction_history`, `value_calibration`, `knowledge_gaps`.

## Differentiation Engine

Automated metrics that distinguish Sutra.team personas from generic prompt wrappers:

| Metric | Target |
|--------|--------|
| Voice Consistency (cosine similarity across 100 prompts) | > 0.85 |
| Base Model Divergence (semantic distance) | > 0.30 |
| Value Framework Adherence (conflict test cases) | > 0.90 |
| Knowledge Integration (correct citation rate) | > 0.80 |
| Signature Consistency | > 0.95 |
| Cross-Session Continuity (memory recall) | > 0.85 |

Each persona gets a **differentiation portfolio**: side-by-side comparisons, score dashboard, creative works catalog, public differentiation certificate.

## Security

- Auth: OAuth 2.0 / JWT, Enterprise SSO via SAML, API keys for programmatic access
- Roles: creator (full control), operator (deploy only), user (interact), viewer (read-only differentiation)
- Persona isolation: strict — no cross-persona data leakage
- Memory: encrypted at rest, user-exportable/deletable, GDPR/CCPA compliant
- Safety: all outputs pass through safety layer; personas cannot override base model safety (hardcoded constraints)
- Audit trail on all definition changes, knowledge updates, and deliberation requests

## Pricing Tiers

| Tier | Price | Key Includes |
|------|-------|-------------|
| Explorer | Free | 1 persona, 10 deliberations/mo, session memory |
| Creator | $29/mo | 3 personas, 100 deliberations/mo, Rights Council |
| Professional | $99/mo | All agents, 500 deliberations/mo, Combined Council |
| Enterprise | Custom | Custom councils, white-labeling, SSO, SLA |
| API Developer | Usage-based | All endpoints, per-deliberation pricing |

## Launch Roadmap

| Phase | Timeline | Focus |
|-------|----------|-------|
| Phase 0: Foundation | Weeks 1–4 | SammaSuit infra, Persona Config Service, single persona chat (Sutra), session + interaction memory |
| Phase 1: Council MVP | Weeks 5–8 | Council of Rights (8 agents), deliberation pipeline, web UI, basic differentiation |
| Phase 2: Experts + Combined | Weeks 9–12 | Council of Experts (6 agents), Combined mode, API beta, knowledge ingestion |
| Phase 3: Marketplace | Weeks 13–16 | Partner hosting, public directory, differentiation cert, creator dashboard |
| Phase 4: Enterprise | Weeks 17–20 | Custom councils, white-labeling, SSO/SAML, SLA |
| Phase 5: Multi-Modal | Weeks 21–24 | Suno integration, image gen, creative portfolio, multi-modal attribution |

## Patent Alignment

Every platform component maps to patent claims. Key mappings:
- **Claim 1** (six-layer system) → All six layers as distinct services
- **Claim 2** (value framework + conflict resolution) → Value Processing Pipeline
- **Claim 3** (differentiation documentation) → Differentiation Analytics Service
- **Claim 6** (method of operation) → Deliberation Pipeline (8 steps)
- **Claim 9** (persistent persona across sessions) → Memory Persistence Service (4 tiers)
- **Claim 10** (exportable memory reports) → Memory Report Generation with JSON export/import

## Key Files

- `sutra_team_technical_spec.docx` — Full technical specification (this CLAUDE.md is derived from it)
- `provisionalpatentintelligentagents.pdf` — U.S. Provisional Patent Application (filed Jan 30, 2026)

## Development Notes

- The Persona Definition File acronym is "PDF" in project context — not the document format
- Sutra is both the synthesis agent name and the exemplary embodiment described in the patent
- The "three-body reference structure" is a key differentiator: every Sutra response draws from (1) Anthropic's Constitution, (2) Zen AI philosophy, (3) OneZeroEight.ai technical platform
- The synthesis method is NOT simple concatenation or majority-vote — it's structured reconciliation (agreement mapping → tension identification → gap detection → hierarchical resolution → transparent uncertainty)
- The principal hierarchy for value resolution is: user > creator > platform > base model
