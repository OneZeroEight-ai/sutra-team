# Deployment Directive: sutra.team

## Overview

Deploy the sutra.team platform across three layers: Next.js frontend (Vercel), Python agent server (persistent host), and LiveKit real-time infrastructure. This directive assumes Phases 1–4 of the `CLAUDE_CODE_DIRECTIVE.md` are complete and the repo is at `OneZeroEight-ai/sutra-team` on GitHub.

---

## 1. Vercel — Frontend Deployment

### 1.1 Link and Deploy

```bash
cd C:\Users\jbwagoner\sutra.team
npm install -g vercel
vercel login
vercel link
# Select: OneZeroEight-ai org → sutra-team project → confirm settings
vercel --prod
```

### 1.2 Custom Domain

In Vercel Dashboard → Project Settings → Domains:

```
sutra.team
www.sutra.team  (redirect to sutra.team)
```

### 1.3 DNS Configuration

At your domain registrar (wherever `sutra.team` is registered), set:

| Type  | Name | Value                          | TTL  |
|-------|------|--------------------------------|------|
| A     | @    | 76.76.21.21                    | 300  |
| CNAME | www  | cname.vercel-dns.com           | 300  |

> **Note:** Vercel A record IP may change — verify current IP in Vercel dashboard after adding domain.

### 1.4 Environment Variables (Vercel Dashboard)

Set these in Project Settings → Environment Variables. Apply to Production, Preview, and Development.

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUTRA_API_URL` | `__PLACEHOLDER_SAMMASUIT_API_URL__` | SammaSuit backend API base URL (e.g., `https://api.sammasuit.com`) |
| `NEXT_PUBLIC_LIVEKIT_URL` | `__PLACEHOLDER_LIVEKIT_WS_URL__` | LiveKit WebSocket URL (e.g., `wss://sutra-team-xxxxx.livekit.cloud`) |
| `LIVEKIT_API_KEY` | `__PLACEHOLDER_LIVEKIT_API_KEY__` | From LiveKit Cloud dashboard or self-hosted config |
| `LIVEKIT_API_SECRET` | `__PLACEHOLDER_LIVEKIT_API_SECRET__` | From LiveKit Cloud dashboard or self-hosted config |
| `NEXT_PUBLIC_PHONE_NUMBER` | `__PLACEHOLDER_PHONE_NUMBER__` | Public-facing dial-in number (e.g., `+1-888-XXX-XXXX`) |
| `NEXT_PUBLIC_GA_ID` | `__PLACEHOLDER_GA_MEASUREMENT_ID__` | Google Analytics 4 measurement ID (optional) |

### 1.5 Verify Deployment

```bash
# After DNS propagation (may take up to 48h, usually <30min)
curl -I https://sutra.team
# Should return 200 with x-vercel-id header

# Test the LiveKit token route
curl -X POST https://sutra.team/api/livekit/token \
  -H "Content-Type: application/json" \
  -d '{"roomName":"test-room","participantName":"test-user","councilMode":"rights"}'
# Should return {"token":"eyJ..."}
```

---

## 2. LiveKit — Real-Time Communication Infrastructure

### 2.1 LiveKit Cloud Setup

1. Sign up at https://cloud.livekit.io
2. Create a new project named `sutra-team`
3. Copy credentials:
   - **API Key:** `__PLACEHOLDER_LIVEKIT_API_KEY__`
   - **API Secret:** `__PLACEHOLDER_LIVEKIT_API_SECRET__`
   - **WebSocket URL:** `__PLACEHOLDER_LIVEKIT_WS_URL__` (format: `wss://sutra-team-xxxxx.livekit.cloud`)
4. These go into both the Vercel env vars (Section 1.4) and the agent server env (Section 3.4)

### 2.2 Phone Number Provisioning

**Option A — LiveKit Phone Numbers (recommended, US only at launch):**

1. In LiveKit Cloud dashboard → Telephony → Phone Numbers
2. Purchase a number: `__PLACEHOLDER_PHONE_NUMBER__`
3. The number is automatically configured as an inbound SIP trunk

**Option B — Twilio SIP Trunk (international or existing Twilio account):**

1. Twilio Console → Elastic SIP Trunking → Create trunk
2. Trunk SID: `__PLACEHOLDER_TWILIO_TRUNK_SID__`
3. Configure origination URI to point to LiveKit:
   - URI: `sip:__PLACEHOLDER_LIVEKIT_SIP_URI__`
   - (Get this from LiveKit Cloud dashboard → Telephony → SIP)
4. Purchase a Twilio phone number: `__PLACEHOLDER_PHONE_NUMBER__`
5. Route the number to the SIP trunk

**Option C — Telnyx (alternative provider):**

1. Telnyx Mission Control → SIP Trunking → Create trunk
2. Connection ID: `__PLACEHOLDER_TELNYX_CONNECTION_ID__`
3. Point to LiveKit SIP URI (same as Twilio Option B)
4. Purchase number via Telnyx

### 2.3 SIP Trunk Configuration (LiveKit side)

After obtaining a phone number and SIP provider, configure the inbound trunk and dispatch rule. Run this once from the agent server environment:

```python
# scripts/configure_sip.py
import asyncio
from livekit import api
import os
from dotenv import load_dotenv

load_dotenv()

async def configure():
    lk = api.LiveKitAPI(
        os.getenv("LIVEKIT_URL"),
        os.getenv("LIVEKIT_API_KEY"),
        os.getenv("LIVEKIT_API_SECRET"),
    )

    # Create inbound trunk
    trunk = await lk.sip.create_sip_inbound_trunk(
        api.CreateSIPInboundTrunkRequest(
            trunk=api.SIPInboundTrunkInfo(
                name="sutra-team-inbound",
                numbers=["__PLACEHOLDER_PHONE_NUMBER__"],
                krisp_enabled=True,  # Noise cancellation
            )
        )
    )
    print(f"Inbound trunk created: {trunk.sip_trunk_id}")

    # Create dispatch rule — route calls to council agent
    rule = await lk.sip.create_sip_dispatch_rule(
        api.CreateSIPDispatchRuleRequest(
            rule=api.SIPDispatchRule(
                name="council-phone-dispatch",
                trunk_ids=[trunk.sip_trunk_id],
                rule=api.SIPDispatchRuleIndividual(
                    room_prefix="council-phone-",
                ),
            )
        )
    )
    print(f"Dispatch rule created: {rule.sip_dispatch_rule_id}")

    await lk.aclose()

asyncio.run(configure())
```

```bash
cd server/agents
python scripts/configure_sip.py
# Save the trunk ID and dispatch rule ID — you'll need them for phone_handler.py
```

### 2.4 LiveKit Credentials Checklist

| Credential | Source | Placeholder |
|------------|--------|-------------|
| API Key | LiveKit Cloud dashboard | `__PLACEHOLDER_LIVEKIT_API_KEY__` |
| API Secret | LiveKit Cloud dashboard | `__PLACEHOLDER_LIVEKIT_API_SECRET__` |
| WebSocket URL | LiveKit Cloud dashboard | `__PLACEHOLDER_LIVEKIT_WS_URL__` |
| SIP Trunk ID | Output of configure_sip.py | `__PLACEHOLDER_SIP_TRUNK_ID__` |
| Phone Number | LiveKit/Twilio/Telnyx | `__PLACEHOLDER_PHONE_NUMBER__` |

---

## 3. Agent Server — Python LiveKit Agents

### 3.1 Hosting Options

The agent server (`server/agents/`) runs as a persistent Python process. It must stay alive to accept LiveKit agent dispatch events. Pick one:

| Option | Best For | Cost | Notes |
|--------|----------|------|-------|
| **LiveKit Cloud Agents** | Fastest launch | Included in LiveKit Cloud pricing | Managed deployment, zero infra |
| **SammaSuit.com infra** | Production, data sovereignty | Existing infra cost | Aligns with Iceland hosting strategy |
| **Railway** | Quick iteration | ~$5/mo hobby, ~$20/mo pro | Easy Docker deploys, good DX |
| **Fly.io** | Global edge | ~$5–20/mo | Good for latency-sensitive workloads |
| **AWS ECS / Fargate** | Enterprise scale | Variable | Heavier setup, full control |
| **DigitalOcean App Platform** | Simple VPS alternative | ~$12/mo | Straightforward Docker support |

**Recommended path:** Start with Railway or LiveKit Cloud Agents for initial launch, migrate to SammaSuit.com infra for production.

### 3.2 Docker Setup

Create `server/agents/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# System dependencies for audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# LiveKit agent server entrypoint
CMD ["python", "council_agent.py", "start"]
```

Create `server/agents/requirements.txt` (if not already present):

```
livekit-agents>=0.12
livekit-agents[silero,deepgram,cartesia,turn-detector]
anthropic>=0.40
python-dotenv>=1.0
```

Build and test locally:

```bash
cd server/agents
docker build -t sutra-council-agents .
docker run --env-file .env sutra-council-agents
```

### 3.3 Railway Deployment (recommended for launch)

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Create project
railway init --name sutra-council-agents

# Link to the server/agents directory
cd server/agents
railway link

# Deploy
railway up

# Set environment variables
railway variables set LIVEKIT_URL=__PLACEHOLDER_LIVEKIT_WS_URL__
railway variables set LIVEKIT_API_KEY=__PLACEHOLDER_LIVEKIT_API_KEY__
railway variables set LIVEKIT_API_SECRET=__PLACEHOLDER_LIVEKIT_API_SECRET__
railway variables set ANTHROPIC_API_KEY=__PLACEHOLDER_ANTHROPIC_API_KEY__
railway variables set DEEPGRAM_API_KEY=__PLACEHOLDER_DEEPGRAM_API_KEY__
railway variables set CARTESIA_API_KEY=__PLACEHOLDER_CARTESIA_API_KEY__
railway variables set SIP_TRUNK_ID=__PLACEHOLDER_SIP_TRUNK_ID__
```

### 3.4 Agent Server Environment Variables

| Variable | Value | Source |
|----------|-------|--------|
| `LIVEKIT_URL` | `__PLACEHOLDER_LIVEKIT_WS_URL__` | LiveKit Cloud dashboard |
| `LIVEKIT_API_KEY` | `__PLACEHOLDER_LIVEKIT_API_KEY__` | LiveKit Cloud dashboard |
| `LIVEKIT_API_SECRET` | `__PLACEHOLDER_LIVEKIT_API_SECRET__` | LiveKit Cloud dashboard |
| `ANTHROPIC_API_KEY` | `__PLACEHOLDER_ANTHROPIC_API_KEY__` | Anthropic Console → API Keys |
| `DEEPGRAM_API_KEY` | `__PLACEHOLDER_DEEPGRAM_API_KEY__` | Deepgram Console → API Keys |
| `CARTESIA_API_KEY` | `__PLACEHOLDER_CARTESIA_API_KEY__` | Cartesia Dashboard → API Keys |
| `SIP_TRUNK_ID` | `__PLACEHOLDER_SIP_TRUNK_ID__` | Output of configure_sip.py (Section 2.3) |
| `SUTRA_API_URL` | `__PLACEHOLDER_SAMMASUIT_API_URL__` | SammaSuit backend for memory/knowledge persistence |

### 3.5 Verify Agent Server

```bash
# Check agent is registered and waiting for dispatch
# In LiveKit Cloud dashboard → Agents → should show "sutra-council-agent" as available

# Test manually: create a room and verify agent joins
curl -X POST https://__PLACEHOLDER_LIVEKIT_WS_URL__/twirp/livekit.RoomService/CreateRoom \
  -H "Authorization: Bearer $(lk token create --api-key __PLACEHOLDER_LIVEKIT_API_KEY__ --api-secret __PLACEHOLDER_LIVEKIT_API_SECRET__)" \
  -H "Content-Type: application/json" \
  -d '{"name":"test-council-room","metadata":"{\"councilMode\":\"rights\"}"}'
```

---

## 4. Third-Party API Accounts

### 4.1 Required Accounts

| Service | URL | What For | Credential Needed |
|---------|-----|----------|-------------------|
| **Anthropic** | https://console.anthropic.com | LLM for all council agents | API Key |
| **Deepgram** | https://console.deepgram.com | Speech-to-text (Nova-3) | API Key |
| **Cartesia** | https://play.cartesia.ai | Text-to-speech (Sonic-3) | API Key |
| **LiveKit** | https://cloud.livekit.io | WebRTC + SIP + agent dispatch | API Key + Secret |
| **Vercel** | https://vercel.com | Frontend hosting | Account (linked to GitHub) |
| **Stripe** | https://dashboard.stripe.com | Billing (Phase 5+) | `__PLACEHOLDER_STRIPE_KEY__` |

### 4.2 Optional / Future Accounts

| Service | URL | What For | When Needed |
|---------|-----|----------|-------------|
| **Twilio** | https://console.twilio.com | SIP trunk (if not using LiveKit Phone Numbers) | If international numbers needed |
| **Telnyx** | https://portal.telnyx.com | Alternative SIP provider | If Twilio pricing unfavorable |
| **ElevenLabs** | https://elevenlabs.io | Alternative TTS (higher voice quality) | If Cartesia insufficient |
| **Suno** | https://suno.com | Music generation (Phase 5 multi-modal) | Phase 5 |
| **Google Analytics** | https://analytics.google.com | Site analytics | Optional |

---

## 5. DNS & SSL

### 5.1 Domain Configuration

| Domain | Purpose | DNS Target |
|--------|---------|------------|
| `sutra.team` | Frontend (Vercel) | A → 76.76.21.21 |
| `www.sutra.team` | Redirect to apex | CNAME → cname.vercel-dns.com |
| `api.sutra.team` | Future: direct API access | `__PLACEHOLDER_API_DNS_TARGET__` |
| `connect.sutra.team` | Future: dedicated Connect subdomain | `__PLACEHOLDER_CONNECT_DNS_TARGET__` |

### 5.2 SSL

- Vercel handles SSL automatically for `sutra.team` and `www.sutra.team`
- LiveKit Cloud handles SSL for WebSocket connections
- Agent server SSL depends on hosting provider (Railway/Fly.io handle it automatically)

### 5.3 Domain Registrar

- Registrar: `__PLACEHOLDER_DOMAIN_REGISTRAR__` (e.g., Namecheap, Cloudflare, Google Domains)
- Account: `__PLACEHOLDER_REGISTRAR_ACCOUNT__`

---

## 6. Cutover Plan

### 6.1 Pre-Cutover Checklist

```
[ ] Vercel deployment live at temporary Vercel URL (*.vercel.app)
[ ] All environment variables set in Vercel
[ ] LiveKit Cloud project created with credentials
[ ] Agent server deployed and showing as available in LiveKit dashboard
[ ] Phone number provisioned and SIP trunk configured
[ ] LiveKit token endpoint returning valid tokens
[ ] All 12 routes rendering correctly on Vercel preview URL
[ ] Connect video room functional (can join room, see agent tiles)
[ ] Connect voice room functional (audio pipeline working)
[ ] Phone call routes to IVR and reaches agent
[ ] Old sutra.team site content preserved in git history
```

### 6.2 Cutover Steps

```bash
# 1. Verify everything works on the Vercel preview URL
# https://sutra-team-xxxx.vercel.app

# 2. Add custom domain in Vercel dashboard
# sutra.team + www.sutra.team

# 3. Update DNS records at registrar (Section 5.1)

# 4. Wait for DNS propagation (check with)
dig sutra.team +short
# Should return 76.76.21.21

# 5. Verify SSL certificate issued
curl -I https://sutra.team
# Should show valid HTTPS

# 6. Test all critical paths
curl https://sutra.team                      # Landing page
curl https://sutra.team/connect              # Connect hub
curl https://sutra.team/connect/phone        # Phone portal
curl https://sutra.team/pricing              # Pricing
curl -X POST https://sutra.team/api/livekit/token \
  -H "Content-Type: application/json" \
  -d '{"roomName":"test","participantName":"test","councilMode":"rights"}'

# 7. Call the phone number and verify IVR responds
# Dial: __PLACEHOLDER_PHONE_NUMBER__

# 8. Done — old site is replaced
```

### 6.3 Rollback Plan

If issues arise after cutover:
1. Revert DNS records to previous values (old hosting provider)
2. Old site was preserved in git history — can be redeployed from any pre-scaffold commit
3. Vercel supports instant rollback to any previous deployment in the dashboard

---

## 7. Monitoring & Post-Deploy

### 7.1 Vercel

- Vercel Analytics (built-in): page views, web vitals, errors
- Check Functions tab for `/api/livekit/token` invocation logs and errors

### 7.2 LiveKit

- LiveKit Cloud Dashboard → Rooms: active sessions, participant counts
- LiveKit Cloud Dashboard → Agents: agent availability, dispatch history
- LiveKit Cloud Dashboard → Telephony: call logs, SIP trunk health

### 7.3 Agent Server

- Railway/Fly.io dashboard: container health, logs, resource usage
- Key log signals to watch:
  - Agent registration: "Agent registered with LiveKit server"
  - Dispatch events: "Agent dispatched to room council-xxx"
  - Errors: any Anthropic API failures, Deepgram STT timeouts, TTS failures

### 7.4 Uptime Monitoring (recommended)

Set up basic uptime checks (UptimeRobot, Better Stack, or similar):

| Check | URL / Target | Interval |
|-------|-------------|----------|
| Frontend | `https://sutra.team` | 1 min |
| Token API | `POST https://sutra.team/api/livekit/token` | 5 min |
| Phone | Call `__PLACEHOLDER_PHONE_NUMBER__`, verify IVR | Manual / daily |

---

## 8. Placeholder Summary

All placeholders in this document that need real values before deployment:

| Placeholder | Description | Where to Get It |
|-------------|-------------|-----------------|
| `__PLACEHOLDER_SAMMASUIT_API_URL__` | SammaSuit backend API URL | SammaSuit.com infra team / config |
| `__PLACEHOLDER_LIVEKIT_WS_URL__` | LiveKit WebSocket URL | LiveKit Cloud dashboard → Project settings |
| `__PLACEHOLDER_LIVEKIT_API_KEY__` | LiveKit API key | LiveKit Cloud dashboard → Project settings |
| `__PLACEHOLDER_LIVEKIT_API_SECRET__` | LiveKit API secret | LiveKit Cloud dashboard → Project settings |
| `__PLACEHOLDER_LIVEKIT_SIP_URI__` | LiveKit SIP endpoint for trunk config | LiveKit Cloud dashboard → Telephony |
| `__PLACEHOLDER_SIP_TRUNK_ID__` | SIP trunk ID after creation | Output of `configure_sip.py` |
| `__PLACEHOLDER_PHONE_NUMBER__` | Public dial-in phone number | LiveKit Phone Numbers / Twilio / Telnyx |
| `__PLACEHOLDER_ANTHROPIC_API_KEY__` | Anthropic Claude API key | https://console.anthropic.com → API Keys |
| `__PLACEHOLDER_DEEPGRAM_API_KEY__` | Deepgram STT API key | https://console.deepgram.com → API Keys |
| `__PLACEHOLDER_CARTESIA_API_KEY__` | Cartesia TTS API key | https://play.cartesia.ai → Dashboard |
| `__PLACEHOLDER_STRIPE_KEY__` | Stripe API key (billing, future) | https://dashboard.stripe.com → API Keys |
| `__PLACEHOLDER_GA_MEASUREMENT_ID__` | Google Analytics ID (optional) | GA4 property → Data Streams |
| `__PLACEHOLDER_TWILIO_TRUNK_SID__` | Twilio SIP trunk SID (if using Twilio) | Twilio Console → Elastic SIP Trunking |
| `__PLACEHOLDER_TELNYX_CONNECTION_ID__` | Telnyx connection ID (if using Telnyx) | Telnyx Mission Control |
| `__PLACEHOLDER_DOMAIN_REGISTRAR__` | Where sutra.team domain is registered | Your registrar account |
| `__PLACEHOLDER_REGISTRAR_ACCOUNT__` | Registrar login/account info | Your registrar account |
| `__PLACEHOLDER_API_DNS_TARGET__` | DNS target for api.sutra.team (future) | Depends on API hosting choice |
| `__PLACEHOLDER_CONNECT_DNS_TARGET__` | DNS target for connect.sutra.team (future) | Depends on Connect hosting choice |
