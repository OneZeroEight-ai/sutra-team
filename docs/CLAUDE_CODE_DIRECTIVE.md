# Claude Code Directive: Build sutra.team Repository & Rebuild Website

## Objective

Create a new GitHub repository under the `OneZeroEight-ai` organization and rebuild the sutra.team website from its current purpose (AI safety consulting site) into a **persona hosting platform** product site — the commercial front for the Sutra.team platform described in `docs/CLAUDE.md`.

## Context

- **GitHub Org:** `OneZeroEight-ai` (existing — also hosts `samma-suit` repo)
- **Project root (local):** `C:\Users\jbwagoner\sutra.team\`
- **Reference doc:** `C:\Users\jbwagoner\sutra.team\docs\CLAUDE.md` — read this FIRST, it contains the full technical spec
- **Current site:** https://sutra.team — currently a consulting/services site ("AI Safety You Can't Game") that needs to become the product platform site
- **Related sites:** https://sammasuit.com (infrastructure layer), https://onezeroeight.ai (parent company/research)

---

## Phase 1: Repository Setup

### 1.1 Create the repo

```bash
cd C:\Users\jbwagoner\sutra.team
git init
gh repo create OneZeroEight-ai/sutra-team --public --description "Sutra.team — Persona Hosting Platform powered by SammaSuit.com infrastructure" --source=. --remote=origin
```

### 1.2 Project structure

```
sutra.team/
├── docs/
│   └── CLAUDE.md                    # Already exists — project reference
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout with metadata, fonts, analytics
│   │   ├── page.tsx                 # Landing page (hero + product overview)
│   │   ├── council/
│   │   │   └── page.tsx             # Council product page (Rights + Experts + Combined)
│   │   ├── connect/
│   │   │   ├── page.tsx             # Connect hub — choose video, voice, or phone
│   │   │   ├── room/
│   │   │   │   └── [roomId]/
│   │   │   │       └── page.tsx     # LiveKit video/voice room (council session)
│   │   │   └── phone/
│   │   │       └── page.tsx         # Phone portal — dial-in info + connection status
│   │   ├── personas/
│   │   │   └── page.tsx             # Persona marketplace / directory
│   │   ├── pricing/
│   │   │   └── page.tsx             # Pricing tiers (Explorer → Enterprise)
│   │   ├── docs/
│   │   │   └── page.tsx             # Developer docs / API reference
│   │   ├── about/
│   │   │   └── page.tsx             # About — JB Wagoner, patent, Zen AI, ecosystem
│   │   └── api/
│   │       ├── livekit/
│   │       │   └── token/
│   │       │       └── route.ts     # API route: generate LiveKit room tokens (server-side)
│   │       └── council/
│   │           └── route.ts         # API route: proxy deliberation requests to SammaSuit backend
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Site header with nav
│   │   │   ├── Footer.tsx           # Footer with ecosystem links
│   │   │   └── EcosystemBanner.tsx  # Top banner linking sutra.exchange, onezeroeight.ai, sammasuit.com
│   │   ├── council/
│   │   │   ├── CouncilDemo.tsx      # Interactive council deliberation demo
│   │   │   ├── AgentCard.tsx        # Individual agent display card
│   │   │   ├── RightsGrid.tsx       # 8-agent Noble Eightfold Path grid
│   │   │   ├── ExpertsGrid.tsx      # 6-agent expert council grid
│   │   │   └── SynthesisFlow.tsx    # Visual deliberation pipeline animation
│   │   ├── connect/
│   │   │   ├── VideoRoom.tsx        # LiveKit video conference room — camera + agent avatars
│   │   │   ├── VoiceRoom.tsx        # Voice-only council session — no camera, audio + transcript
│   │   │   ├── ParticipantTile.tsx  # Individual participant tile (human or AI agent)
│   │   │   ├── AgentAvatar.tsx      # Animated speaking avatar for AI agents (waveform/pulse)
│   │   │   ├── TranscriptPanel.tsx  # Real-time scrolling transcript sidebar
│   │   │   ├── SynthesisOverlay.tsx # Sutra synthesis result overlay displayed in room
│   │   │   ├── RoomControls.tsx     # Mic, camera, screen share, end session controls
│   │   │   ├── PhonePortal.tsx      # Phone dial-in card — number, PIN, connection status
│   │   │   └── ConnectModeSelector.tsx  # Card selector: Video / Voice / Phone
│   │   ├── persona/
│   │   │   ├── PersonaCard.tsx      # Persona marketplace card
│   │   │   └── PersonaBuilder.tsx   # Persona creation preview/CTA
│   │   ├── pricing/
│   │   │   └── PricingTable.tsx     # Tier comparison table
│   │   ├── differentiation/
│   │   │   └── DiffScore.tsx        # Differentiation score visualization
│   │   └── ui/                      # Shared UI primitives (buttons, cards, modals)
│   ├── lib/
│   │   ├── constants.ts             # Agent definitions, pricing tiers, API endpoints
│   │   ├── types.ts                 # TypeScript types matching persona data model from spec
│   │   └── livekit.ts               # LiveKit client helpers — token fetch, room config, agent mapping
│   └── styles/
│       └── globals.css              # Tailwind CSS + custom design tokens
├── server/
│   └── agents/                      # LiveKit Agents (Python) — council agents as voice participants
│       ├── requirements.txt         # livekit-agents, livekit-plugins-silero, anthropic SDK, etc.
│       ├── council_agent.py         # Main agent entrypoint — spawns council agents into LiveKit rooms
│       ├── rights_agents.py         # 8 Rights council agent definitions (STT → LLM → TTS pipeline)
│       ├── expert_agents.py         # 6 Expert council agent definitions
│       ├── sutra_synthesis.py       # Sutra synthesis agent — joins after deliberation, delivers unified response
│       ├── phone_handler.py         # SIP telephony handler — inbound/outbound call routing + IVR
│       └── .env.example             # LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, ANTHROPIC_API_KEY
├── public/
│   ├── agents/                      # Agent avatar images (8 Rights + 6 Experts + Sutra)
│   └── og/                          # Open Graph images
├── .gitignore
├── .env.example                     # NEXT_PUBLIC_SUTRA_API_URL, NEXT_PUBLIC_LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 1.3 Initialize Next.js

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Install additional dependencies:

```bash
# Core UI
npm install framer-motion lucide-react clsx tailwind-merge
npm install -D @tailwindcss/typography

# LiveKit — video/voice conferencing
npm install @livekit/components-react @livekit/components-styles livekit-client livekit-server-sdk
```

### 1.4 Python agent environment (server/agents/)

```bash
cd server/agents
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install livekit-agents "livekit-agents[openai,silero,deepgram,cartesia,turn-detector]"
pip install anthropic
```

### 1.5 Git setup

```bash
# .gitignore should include:
# node_modules, .next, .env.local, .env, out, .vercel, server/agents/venv/, __pycache__
git add .
git commit -m "feat: initial sutra.team project scaffold with LiveKit connect layer"
git push -u origin main
```

---

## Phase 2: Rebuild the Website

### 2.1 Design Direction

The current site is a consulting site selling audits and architecture engagements. The new site is a **product platform** — think Linear, Vercel, or Notion's marketing site. The vibe should be:

- **Dark theme** with accent colors inspired by the Noble Eightfold Path
- **Sophisticated, minimal** — not a generic SaaS template
- **Buddhist/contemplative undertones** without being heavy-handed — subtle lotus motifs, clean geometry, space
- **Product-first** — the Council deliberation system is the hero, not consulting services
- **Communication-forward** — the Connect interface (video/voice/phone) is a primary product surface, not an afterthought
- Carry forward the "Safety You Can't Game" ethos but reframe around the product: the platform IS the proof

### 2.2 Color System

```css
/* Design tokens */
--sutra-bg: #0a0a0f;          /* Near-black background */
--sutra-surface: #12121a;     /* Card/surface background */
--sutra-border: #1e1e2e;      /* Subtle borders */
--sutra-text: #e4e4e7;        /* Primary text */
--sutra-muted: #71717a;       /* Secondary text */
--sutra-accent: #a78bfa;      /* Primary accent — violet/purple */
--sutra-gold: #f59e0b;        /* Secondary accent — gold (Buddhist association) */
--sutra-lotus: #ec4899;       /* Highlight — lotus pink */
```

### 2.3 Page-by-Page Content Brief

#### Landing Page (`/`)

**Hero Section:**
- Headline: "Your AI needs a council, not a chatbot."
- Subhead: "Sutra.team is a persona hosting platform where multiple AI agents deliberate on your question — then a synthesis agent reconciles their perspectives into one unified answer."
- Two CTAs: "Start a Session" (→ /connect) + "View Pricing"
- Background: Subtle animated visualization of 8 agents converging into one synthesis point

**How It Works Section:**
- 3-step visual: (1) You ask a question → (2) 8+ specialized agents deliberate in parallel → (3) Sutra synthesizes into unified response
- Show the deliberation pipeline from the spec (Section 4.3.1) as an interactive diagram

**Connect Preview Section:**
- "Talk to your council. Literally."
- Three mode cards side by side: Video Room / Voice Session / Phone Call
- Brief description of each modality + screenshot/mockup
- CTA: "Try a Session" → /connect
- Emphasize: no app install, browser-native (WebRTC), or just pick up the phone

**Council of Rights Section:**
- Grid of 8 agent cards, each showing: name, Noble Eightfold Path aspect, functional domain, sample use case
- Pull all data from the spec (Section 4.1)

**Council of Experts Section:**
- Grid of 6 expert agent cards with domain and knowledge base sources
- Emphasize composability: "Build your own council"

**Combined Council Section:**
- Show the premium value prop: Strategic Analysis + Principled Evaluation + Integrated Recommendation
- Quote: "Not just what should I do — but what should I do and can I live with it."

**Differentiation Section:**
- "This isn't a prompt wrapper."
- Show differentiation metrics from the spec (Section 8.1): voice consistency > 0.85, base model divergence > 0.30, etc.
- Side-by-side example: base model response vs. Sutra council response

**Powered by SammaSuit Section:**
- Brief explanation that sutra.team runs on SammaSuit.com infrastructure
- Link to sammasuit.com
- Mention 8-layer security (SUTRA, DHARMA, SANGHA, KARMA, SILA, METTA, BODHI, NIRVANA)

**Patent & Credibility Section:**
- Patent filed January 2026
- IEEE CertifAIEd
- 40+ songs, 4 albums (proof of sustained alignment)
- Link to Zen AI book
- Link to onezeroeight.ai research

#### Council Page (`/council`)

Deep dive into how the council works:
- Full deliberation pipeline diagram (interactive, step-by-step)
- Synthesis method explanation (agreement mapping → tension identification → gap detection → hierarchical resolution → transparent uncertainty)
- Example deliberation walkthrough with a real query
- Comparison: Council of Rights vs. Council of Experts vs. Combined

#### Connect Page (`/connect`)

**This is the real-time communication hub — how users actually talk to their council.** Three modalities, one unified interface.

**Connect Hub (landing — `/connect`):**
- Three large mode-selector cards:
  - **Video Room** — "Face your council." Camera on, see animated agent avatars, screen sharing, full transcript. Best for deep work sessions, presentations, document review.
  - **Voice Session** — "Hands-free wisdom." Audio only, agent avatars + live transcript. Best for mobile, walking, driving, multitasking.
  - **Phone Call** — "Dial in from anywhere." Call a phone number, IVR routes to your council. No internet required. Best for accessibility, simplicity, on-the-go.
- Each card shows: icon, brief description, "Start" button
- User selects council configuration (Rights / Experts / Combined) before joining
- Shows active session count / availability indicator

**Video Room (`/connect/room/[roomId]`):**
- Zoom-like layout built on **LiveKit** (@livekit/components-react)
- Top area: video grid showing user's camera + animated avatar tiles for each active council agent
- Agent tiles display: agent name, Noble Eightfold Path label (if Rights council), animated speaking indicator (audio waveform/pulse when agent is "speaking" via TTS)
- Right sidebar: real-time scrolling transcript panel showing who said what, timestamped
- When deliberation completes, a **Synthesis Overlay** slides in showing Sutra's unified response with agreement/tension/gap sections
- Bottom bar: mic toggle, camera toggle, screen share, end session, settings
- Screen sharing support so users can show agents documents, code, dashboards for context
- No app install — pure browser WebRTC via LiveKit

**Voice Room (same route, voice mode flag):**
- Simplified layout — no camera feed
- Center: ring of agent avatar circles that pulse/glow when speaking
- Full-width transcript panel
- Same deliberation flow, same synthesis overlay
- Optimized for mobile viewport

**Phone Portal (`/connect/phone`):**
- Display the dial-in phone number (provisioned via LiveKit Phone Numbers or Twilio SIP trunk)
- How it works explanation:
  1. Call the number
  2. IVR greeting: "Welcome to Sutra.team. Press 1 for Council of Rights, 2 for Council of Experts, 3 for Combined Council."
  3. Agents deliberate via voice — user hears each agent's perspective spoken aloud, then Sutra's synthesis
  4. Session is logged to memory system, transcript available in dashboard afterward
- PIN-based authentication for account linking (ties phone session to user's memory/history)
- International numbers section (or "coming soon" for non-US)
- FAQ: "Can I call from any phone?" Yes — landline, mobile, VoIP. "Is it recorded?" Transcribed and stored per your memory preferences. "What about enterprise?" Dedicated numbers, custom IVR, SLA.

**Technical implementation notes for Connect:**
- LiveKit Cloud (https://livekit.io) or self-hosted LiveKit server
- Token generation happens server-side in `/api/livekit/token/route.ts` — never expose API secret to client
- Each council agent is a **LiveKit Agent** (Python, using `livekit-agents` framework) that joins the room as a participant
- Agent pipeline per agent: user audio → Deepgram STT → Anthropic Claude API (with persona system prompt) → Cartesia/ElevenLabs TTS → audio back to room
- Sutra synthesis agent joins after all perspectives are collected, delivers the unified response
- Phone calls are bridged into LiveKit rooms via **SIP integration** — the same agent code handles both web and phone sessions
- The agent automatically detects connection type (WebRTC vs SIP) and optimizes accordingly (e.g., simpler audio for phone, richer for web)

#### Personas Page (`/personas`)

Persona marketplace preview:
- Sutra (exemplary embodiment) as featured persona
- The Noble 8 (8 Rights agents) as showcased personas
- "Coming Soon: Create Your Own" with persona builder preview
- Explain the Persona Definition File schema (identity, voice, values, constraints)
- Differentiation portfolio concept

#### Pricing Page (`/pricing`)

Direct from the spec (Section 10), updated with Connect access:
- Explorer (Free): 1 persona, 10 deliberations/mo, text only, session memory
- Creator ($29/mo): 3 personas, 100 deliberations/mo, Rights Council, voice sessions, interaction memory
- Professional ($99/mo): All agents, 500 deliberations/mo, Combined Council, video + voice + phone, full memory
- Enterprise (Custom): White-label, SSO, custom councils, dedicated phone numbers, SLA
- API Developer (Usage-based): All endpoints including LiveKit room provisioning, per-deliberation pricing
- Include feature comparison table with Connect modalities as a row (text / voice / video / phone)

#### Docs Page (`/docs`)

Developer documentation preview:
- API endpoint reference (from spec Section 6.1)
- **Connect API**: room creation, token generation, agent dispatch, SIP trunk configuration
- Deliberation request/response schema overview
- Persona Definition File schema
- Authentication (OAuth 2.0, JWT, API keys)
- LiveKit integration guide for custom frontends
- "Full API docs coming with Phase 2 launch"

#### About Page (`/about`)

- JB Wagoner bio (cognitive science + AI ethics background, Dr. Xes 1986, Zen AI, IEEE CertifAIEd)
- The Sutra project story (40+ songs, Noble 8, values-based alignment)
- Ecosystem overview: onezeroeight.ai → sammasuit.com → sutra.team → sutra.exchange
- Patent information
- Contact

### 2.4 Shared Layout

**Header:**
- Logo: "sutra.team" (wordmark)
- Nav: Council | Connect | Personas | Pricing | Docs | About
- CTA button: "Start a Session"
- Ecosystem banner (collapsible): links to sammasuit.com, onezeroeight.ai, sutra.exchange

**Footer:**
- Product links: Council, Connect, Personas, Pricing, Docs
- Company links: About, Blog (placeholder), Contact
- Ecosystem links: sammasuit.com, onezeroeight.ai, sutra.exchange
- Legal: Terms, Privacy, Patent Notice
- © 2026 sutra.team — Powered by SammaSuit.com

---

## Phase 3: Data & Types

### 3.1 Type Definitions (`src/lib/types.ts`)

Define TypeScript types that match the persona data model from the spec:

```typescript
// Core types from the Sutra.team technical specification
export interface PersonaIdentity {
  persona_id: string;
  name: string;
  designation: string;
  origin_narrative?: string;
  creator_id: string;
  tagline?: string;
  version: string;
  created_at: string;
  visibility: 'private' | 'unlisted' | 'public' | 'enterprise';
}

export interface VoiceParameters {
  tone_descriptors: string[];
  opening_patterns: string[];
  closing_signature: string;
  avoidance_patterns: string[];
  formality_range: [number, number];
}

export interface RightsAgent {
  name: string;
  path_aspect: string;
  pali_name: string;
  functional_domain: string;
  use_cases: string[];
}

export interface ExpertAgent {
  name: string;
  domain: string;
  knowledge_sources: string[];
}

export type CouncilMode = 'rights' | 'experts' | 'combined';
export type ConnectMode = 'video' | 'voice' | 'phone';

export interface PricingTier {
  name: string;
  price: string;
  includes: string[];
  connect_modes: ConnectMode[];  // which modalities this tier unlocks
  target_user: string;
  highlighted?: boolean;
}

// LiveKit / Connect types
export interface CouncilSession {
  session_id: string;
  room_name: string;               // LiveKit room name
  council_mode: CouncilMode;
  connect_mode: ConnectMode;
  agents_active: string[];          // agent persona_ids in the room
  status: 'waiting' | 'deliberating' | 'synthesizing' | 'complete';
  created_at: string;
}

export interface AgentParticipant {
  persona_id: string;
  name: string;
  path_aspect?: string;            // Noble Eightfold Path aspect (Rights council only)
  avatar_url: string;
  is_speaking: boolean;
  perspective_delivered: boolean;
}

export interface SynthesisResult {
  deliberation_id: string;
  agreements: string[];
  tensions: { description: string; agents: string[] }[];
  gaps: string[];
  unified_response: string;
  confidence: number;
}
```

### 3.2 Constants (`src/lib/constants.ts`)

Populate all agent definitions, pricing tiers, connect modes, and deliberation pipeline steps directly from the spec. This is the single source of truth for all display data.

### 3.3 LiveKit Helpers (`src/lib/livekit.ts`)

```typescript
// Helper to fetch a LiveKit room token from the server-side API route
export async function fetchRoomToken(
  roomName: string,
  participantName: string,
  councilMode: CouncilMode
): Promise<string> {
  const res = await fetch('/api/livekit/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomName, participantName, councilMode }),
  });
  const data = await res.json();
  return data.token;
}
```

---

## Phase 4: Connect Infrastructure (LiveKit)

This phase implements the real-time communication layer. It can be developed in parallel with the marketing site (Phase 2) or sequentially after it.

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  User Interfaces                                                     │
├──────────────┬──────────────┬───────────────────────────────────────┤
│  Browser     │  Browser     │  Phone (PSTN)                         │
│  (Video)     │  (Voice)     │                                       │
│  WebRTC      │  WebRTC      │  SIP Trunk (Twilio/LiveKit Numbers)   │
└──────┬───────┴──────┬───────┴──────────┬────────────────────────────┘
       │              │                  │
       └──────────────┼──────────────────┘
                      │
              ┌───────▼────────┐
              │  LiveKit Server │  (Cloud or self-hosted)
              │  (WebRTC SFU +  │
              │   SIP Gateway)  │
              └───────┬────────┘
                      │
         ┌────────────┼────────────────┐
         │            │                │
   ┌─────▼──────┐ ┌──▼───────┐ ┌─────▼──────┐
   │ Rights     │ │ Expert   │ │ Sutra      │
   │ Agents     │ │ Agents   │ │ Synthesis  │
   │ (1-8)      │ │ (1-6)    │ │ Agent      │
   │            │ │          │ │            │
   │ STT→LLM→  │ │ STT→LLM→ │ │ Collects   │
   │ TTS        │ │ TTS      │ │ perspectives│
   └─────┬──────┘ └──┬───────┘ │ → synthesize│
         │           │          │ → TTS       │
         └───────────┼──────────┘             │
                     │                         │
              ┌──────▼─────────┐               │
              │  SammaSuit.com │◄──────────────┘
              │  Backend       │
              │  (Persona defs,│
              │   Memory,      │
              │   Knowledge)   │
              └────────────────┘
```

### 4.2 LiveKit Server Setup

**Option A — LiveKit Cloud (recommended for launch):**
- Sign up at https://cloud.livekit.io
- Get `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- Purchase LiveKit Phone Numbers for the telephone portal (US numbers available immediately)
- No infrastructure to manage

**Option B — Self-hosted (for enterprise / data sovereignty):**
- Deploy LiveKit server on SammaSuit.com infrastructure (aligns with Iceland hosting strategy)
- Configure Twilio or Telnyx as SIP trunk provider for telephony
- Set up TURN/STUN servers for NAT traversal

### 4.3 Server-Side Token Route (`src/app/api/livekit/token/route.ts`)

```typescript
import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { roomName, participantName, councilMode } = await req.json();

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: participantName, name: participantName }
  );

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return NextResponse.json({ token: await token.toJwt() });
}
```

### 4.4 Council Agents as LiveKit Participants (`server/agents/`)

Each council agent runs as a **LiveKit Agent** using the `livekit-agents` Python framework. The agent pipeline:

1. **STT** (Speech-to-Text): Deepgram Nova-3 transcribes user speech in real-time
2. **LLM**: Anthropic Claude API with the agent's full persona system prompt (identity + voice + values + knowledge + memory + differentiation directives — per the Prompt Assembly Pipeline in the spec)
3. **TTS** (Text-to-Speech): Cartesia Sonic-3 or ElevenLabs renders the agent's response as spoken audio
4. **Turn Detection**: Silero VAD + multilingual turn detector to avoid interruptions

**Agent dispatch flow:**
1. User joins a LiveKit room via the web frontend or phone call
2. The token route (or SIP dispatch rule) triggers agent dispatch
3. Based on `councilMode`, the agent server spawns the appropriate agents (8 Rights / 6 Experts / all 14 for Combined)
4. Each agent joins the room as a named participant (e.g., "The Wisdom Judge", "Legal Analyst")
5. Agents listen to the user's query, then each delivers their perspective sequentially or in structured rounds
6. After all perspectives are delivered, the **Sutra Synthesis Agent** joins, collects all perspectives, runs the synthesis pipeline, and delivers the unified response
7. Transcript and synthesis result are persisted to the Memory System via the SammaSuit backend

**Example agent skeleton (`server/agents/council_agent.py`):**

```python
from livekit.agents import Agent, AgentSession, JobContext
from livekit.plugins import silero, deepgram, cartesia
import anthropic

class RightsAgent(Agent):
    def __init__(self, agent_config: dict):
        super().__init__(
            instructions=agent_config["system_prompt"],  # Full persona prompt from spec
        )
        self.agent_name = agent_config["name"]
        self.path_aspect = agent_config["path_aspect"]

# Agent server dispatches the right agents based on council_mode room metadata
```

### 4.5 Telephony / Phone Portal

**SIP Integration via LiveKit:**
- LiveKit's SIP bridge connects PSTN phone calls to LiveKit rooms
- Inbound calls arrive via a SIP trunk (LiveKit Phone Numbers or Twilio)
- A **dispatch rule** routes the call to a new room and triggers agent dispatch
- The phone handler (`server/agents/phone_handler.py`) implements an IVR:
  - Greeting: "Welcome to Sutra.team."
  - DTMF routing: Press 1 → Rights Council, Press 2 → Experts, Press 3 → Combined
  - Or voice routing: "Which council would you like to convene?" → intent detection → route
- PIN authentication: user speaks or enters a PIN to link the phone session to their account
- Same agent pipeline handles both web and phone — the agent code is modality-agnostic
- After the session, transcript is available in the user's dashboard

**LiveKit SIP trunk configuration:**

```python
# Inbound trunk (receive calls)
trunk_info_inbound = api.SIPInboundTrunkInfo(
    name="Sutra-Team-Inbound",
    numbers=["+1XXXXXXXXXX"],  # Provisioned phone number
    krisp_enabled=True,         # Noise cancellation for phone audio
)

# Dispatch rule — route inbound calls to council agent
dispatch_rule = api.SIPDispatchRule(
    name="council-dispatch",
    trunk_ids=[inbound_trunk_id],
    rule=api.SIPDispatchRuleIndividual(room_prefix="council-phone-"),
)
```

### 4.6 Environment Variables

```env
# .env.example (root — Next.js frontend)
NEXT_PUBLIC_SUTRA_API_URL=https://api.sammasuit.com
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# server/agents/.env.example (Python agent server)
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
ANTHROPIC_API_KEY=your_anthropic_key
DEEPGRAM_API_KEY=your_deepgram_key
CARTESIA_API_KEY=your_cartesia_key
SIP_TRUNK_ID=your_sip_trunk_id
```

---

## Phase 5: Deployment

### 5.1 Vercel (Next.js frontend)

```bash
npm install -g vercel
vercel link  # Link to OneZeroEight-ai org on Vercel
vercel --prod
```

- Set custom domain: `sutra.team`
- Add environment variables in Vercel dashboard
- The `/api/livekit/token` route runs as a Vercel serverless function

### 5.2 Agent Server Deployment

The Python LiveKit agent server (`server/agents/`) needs to run as a persistent process (not serverless). Options:
- **LiveKit Cloud Agent Dispatch** — deploy agents directly to LiveKit Cloud's managed infrastructure
- **SammaSuit.com infra** — deploy as a Docker container on the existing SammaSuit infrastructure (aligns with Iceland hosting strategy)
- **Railway / Fly.io** — lightweight alternative for initial launch

```bash
cd server/agents
# Docker deployment
docker build -t sutra-council-agents .
docker run -d --env-file .env sutra-council-agents
```

### 5.3 DNS

Point `sutra.team` DNS to Vercel once ready to cut over. Keep existing site live until new build is verified.

---

## Important Notes

1. **Read `docs/CLAUDE.md` first** — it contains the complete technical spec distilled from the patent and architecture document. All product copy, data models, agent definitions, pricing, and pipeline descriptions come from there.

2. **Do NOT delete consulting content yet** — the new site replaces it, but keep the old content accessible via git history in case anything needs to be referenced.

3. **The current site has these pages to deprecate:** `/about`, `/methodology`, `/case-study`, `/blog`, `/contact`. The new site replaces them with: `/council`, `/connect`, `/personas`, `/pricing`, `/docs`, `/about`.

4. **Ecosystem consistency:** The site must link to sammasuit.com, onezeroeight.ai, and sutra.exchange throughout. The platform hierarchy is: OneZeroEight.ai (research) → SammaSuit.com (infrastructure) → Sutra.team (product) → Sutra.exchange (token ecosystem).

5. **Patent sensitivity:** This is a patented system (U.S. Provisional Application, January 30, 2026). Include patent notice in the footer but do not reproduce the full patent text on the site.

6. **The differentiation engine is a key selling point.** The site should emphasize that Sutra.team personas are NOT prompt wrappers — they have measurable differentiation scores, automated testing, and public differentiation certificates. This is what makes the platform defensible.

7. **Samma Suit integration:** Sutra.team runs ON SammaSuit.com infrastructure. The 8-layer security framework (SUTRA, DHARMA, SANGHA, KARMA, SILA, METTA, BODHI, NIRVANA) protects all agent operations. Reference this but don't duplicate the full Samma Suit docs — link to sammasuit.com instead.

8. **Launch roadmap alignment:** The website is Phase 0 work. It should present the full vision (all phases) but clearly indicate what's available now vs. coming soon. Phase 0 deliverables: single persona chat with Sutra, session + interaction memory. Phase 1+: council deliberation, Connect interface, marketplace, etc.

9. **Connect is the killer feature.** The ability to video call, voice call, or phone call a council of AI agents — and have them deliberate in real-time, then synthesize — is what differentiates Sutra.team from every other AI chat product. The website should make this viscerally clear. Show it, don't just describe it.

10. **LiveKit is the communication backbone.** It handles WebRTC (browser video/voice), SIP (phone), and has a native AI agent framework that maps perfectly to the council architecture. The agent code is modality-agnostic — same agents serve web and phone users. LiveKit is open-source (MIT), can be self-hosted for enterprise/data sovereignty, or used as a managed cloud service. This aligns with the platform's LLM-agnostic philosophy — portable, not locked in.

11. **Phone portal is an accessibility and simplicity play.** Not everyone wants to open a browser. Enterprise users in the field, executives in cars, anyone without reliable internet — they can call a number and get the same council deliberation. This dramatically expands the addressable market beyond "people who use web apps."
