# Sutra.team — Project Checklist

**Last updated:** February 11, 2026

---

## ✅ Completed

- [x] Repository setup (OneZeroEight-ai/sutra-team)
- [x] Website rebuild — all pages live (/, /council, /connect, /connect/phone, /personas, /pricing, /docs, /about)
- [x] Data & types (TypeScript types, constants)
- [x] Vercel migration — API routes, SSR, dynamic room route restored
- [x] DNS cutover from GitHub Pages to Vercel (sutra.team → www.sutra.team)
- [x] SSL active
- [x] LiveKit token endpoint (`/api/livekit/token`)
- [x] Council proxy endpoint (`/api/council` — stub until backend provisioned)
- [x] LiveKit room UI (`@livekit/components-react`) — video and voice sessions
- [x] Agent server built (Python, LiveKit Agents 1.x SDK)
- [x] Agent server deployed to Railway (always-on)
- [x] Full voice pipeline operational (Deepgram STT → Anthropic Claude → Cartesia TTS)
- [x] Phone portal live — (213) 274-8806
- [x] LiveKit dispatch rule configured
- [x] Human Expert Integration section on landing page
- [x] Environment variables set (Vercel + Railway)
- [x] Technical specification document (sutra_team_technical_spec.docx)
- [x] Provisional patent filed (January 30, 2026)

---

## 🔴 High Priority — Pre-Launch

### Visual Assets
- [ ] Agent avatar images — 15 needed (8 Rights + 6 Experts + Sutra)
  - The Wisdom Judge, The Purpose, The Communicator, The Ethics Judge, The Sustainer, The Determined, The Aware, The Focused
  - Legal Analyst, Financial Strategist, Technical Architect, Market Analyst, Risk Assessor, Growth Strategist
  - Sutra (synthesis agent)
  - Style: consistent art direction, works on dark backgrounds, looks good at card size and room participant tile size
- [ ] Open Graph image (`public/og/og-default.png`) — 1200×630, for social sharing when someone links sutra.team
- [ ] Per-page OG images (optional but nice): /council, /connect, /pricing
- [ ] Remove default Next.js SVGs from `public/` (file.svg, globe.svg, next.svg, vercel.svg, window.svg)
- [ ] Favicon / app icon — replace default Next.js favicon with Sutra brand mark

### Site Polish
- [ ] README.md — replace default Next.js readme (directive already given to Claude Code)
- [ ] Mobile responsiveness audit — test all pages on iPhone and Android
- [ ] Loading states — add skeleton loaders or spinners for Connect room page
- [ ] Error handling — graceful fallback if agent server is down when user joins room
- [ ] 404 page — custom styled, not default Next.js

### Agent Server
- [ ] Assign distinct Cartesia voices to each agent (currently some may share voices)
  - Browse play.cartesia.ai/voices, pick 15 distinct voices
  - Update voice_id fields in `server/agents/prompts/rights.py` and `experts.py`
- [ ] Test all council modes from production (rights, experts, combined) via web and phone
- [ ] Add `livekit-plugins-anthropic` to `requirements.txt` (was installed manually, may be missing from file)
- [ ] Agent greeting — refine greeting messages for each council mode

### Environment & Config
- [ ] Set `NEXT_PUBLIC_PHONE_NUMBER=+12132748806` in Vercel env vars
- [ ] Update `/connect/phone` page to display the real phone number
- [ ] Remove the `nul` file from the repo root (Windows artifact)
- [ ] Add `nul` to `.gitignore` to prevent it from coming back
- [ ] Verify `.env` files are all in `.gitignore` (server/agents/.env, .env.local)

---

## 🟡 Medium Priority — Post-Launch Enhancements

### Multi-Agent Deliberation (Phase 2)
- [ ] Multiple agents join the same LiveKit room as named participants
- [ ] Sequential or round-robin speaking order
- [ ] Perspective collection mechanism before synthesis
- [ ] Sutra synthesis agent joins last, delivers unified response
- [ ] Room UI shows agent names/avatars as participant tiles
- [ ] Council mode selection affects which agents are dispatched

### Human Expert Integration (Backend)
- [ ] HumanExpert TypeScript types (already specified in directive addendum)
- [ ] Expert join flow — professionals join LiveKit rooms alongside AI agents
- [ ] Synthesis attribution — output credits expert by name and credentials
- [ ] Expert validation status on deliberation responses
- [ ] Expert Network application page (/about#expert-network)

### SammaSuit Backend
- [ ] Provision SammaSuit.com infrastructure
- [ ] Persona Configuration Service (CRUD for persona definitions)
- [ ] Knowledge Base Service (vector DB + document store)
- [ ] Memory Persistence Service (session + interaction + persona + council tiers)
- [ ] Value Processing Pipeline
- [ ] Update `NEXT_PUBLIC_SUTRA_API_URL` in Vercel once backend is live
- [ ] Wire `/api/council` proxy to actual backend (currently returns stub)

### Knowledge Base
- [ ] Document ingestion pipeline for persona knowledge bases
- [ ] Semantic search (pgvector) for per-agent context retrieval
- [ ] Source attribution in agent responses

### Memory System
- [ ] Session memory (conversation history within a session)
- [ ] Interaction memory (per user-persona pair, persists across sessions)
- [ ] Memory report generation (JSON export)
- [ ] Memory import/export endpoints

### Differentiation Engine
- [ ] Automated differentiation testing (voice consistency, base model divergence, etc.)
- [ ] Differentiation score dashboard
- [ ] Side-by-side comparison: base model vs. council response
- [ ] Public differentiation certificates for personas

---

## 🟢 Lower Priority — Future Phases

### Billing (Stripe)
- [ ] Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel
- [ ] Implement pricing tier enforcement (Explorer free, Creator $29, Professional $99, Enterprise custom)
- [ ] Usage metering (deliberation count per month)
- [ ] Subscription management UI
- [ ] Per-session expert validation billing (Professional tier+)

### Persona Marketplace
- [ ] Persona builder UI — create custom personas from the browser
- [ ] Public persona directory
- [ ] Partner persona hosting
- [ ] Creator dashboard for persona management
- [ ] Persona Definition File (PDF) export/import

### Multi-Modal Output (Phase 5)
- [ ] Music generation coordination (Suno integration)
- [ ] Image generation coordination (DALL-E / Midjourney)
- [ ] Creative portfolio management
- [ ] Multi-modal output attribution

### Enterprise Features
- [ ] Custom council configurations
- [ ] White-labeling
- [ ] SSO/SAML authentication
- [ ] SLA tier
- [ ] Custom value framework templating
- [ ] Dedicated phone numbers per organization

### Telephony Enhancements
- [ ] IVR menu — "Press 1 for Rights Council, Press 2 for Experts, Press 3 for Combined"
- [ ] PIN-based authentication for phone sessions
- [ ] Outbound calling capability
- [ ] International phone numbers
- [ ] Call recording and transcript export

### Analytics & Monitoring
- [ ] Google Analytics (`NEXT_PUBLIC_GA_ID`)
- [ ] Agent server health monitoring
- [ ] Deliberation latency tracking
- [ ] Usage dashboards for creators and enterprise clients

### Research (OneZeroEight.ai)
- [ ] Alignment testing methodology
- [ ] Differentiation benchmarking
- [ ] Value framework validation
- [ ] Published findings

---

## Infrastructure Reference

| Component | Status | Location |
|-----------|--------|----------|
| Frontend | Live | Vercel (sutra.team) |
| Agent Server | Live | Railway (sutra-council-agents) |
| LiveKit | Live | LiveKit Cloud |
| Phone | Live | +1 (213) 274-8806 |
| SammaSuit Backend | Not provisioned | — |
| Stripe | Not configured | — |
| Domain Registrar | GoDaddy | sutra.team |
| Git Repo | GitHub | OneZeroEight-ai/sutra-team |

---

*Patent: U.S. Provisional Application filed January 30, 2026*
*© 2026 JB Wagoner / OneZeroEight.ai*
