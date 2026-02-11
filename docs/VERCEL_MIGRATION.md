# VERCEL MIGRATION DIRECTIVE

**Context:** sutra.team is currently deployed on GitHub Pages as a static export. This migration moves it to Vercel to restore server-side capabilities (API routes, SSR, dynamic routes). Drop this file into `C:\Users\jbwagoner\sutra.team\docs\` and tell Claude Code: "Read docs/VERCEL_MIGRATION.md and execute it."

---

## Pre-Flight Check

Before starting, confirm:
- You have `vercel` CLI installed (`npm i -g vercel`)
- You are logged in (`vercel whoami` should return your account)
- The repo is `OneZeroEight-ai/sutra-team` on GitHub
- The current site is live at sutra.team via GitHub Pages

---

## Step 1: Remove Static Export Configuration

The static export was a workaround for GitHub Pages. Vercel doesn't need it.

### 1.1 — Update `next.config.ts`

**Remove** these two lines (or the equivalent in your config):
```typescript
// REMOVE THESE:
output: "export",
images: { unoptimized: true },
```

The config should look something like:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No output: "export" — Vercel handles builds natively
  // images can use Vercel's built-in optimization now
};

export default nextConfig;
```

### 1.2 — Delete GitHub Pages Workflow

**Delete** the file `.github/workflows/deploy.yml` (the GitHub Actions workflow that builds and deploys to Pages). Vercel has its own build pipeline — this file is no longer needed and could cause confusion.

```bash
rm .github/workflows/deploy.yml
```

If the `.github/workflows/` directory is now empty, delete it too.

---

## Step 2: Restore API Routes

These were removed because they're incompatible with static export. Restore them now.

### 2.1 — LiveKit Token Endpoint

**Create** `src/app/api/livekit/token/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  try {
    const { roomName, participantName, agentIds } = await req.json();

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: "roomName and participantName are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit credentials not configured" },
        { status: 500 }
      );
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: "10m",
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      token: jwt,
      roomName,
      livekitUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
```

### 2.2 — Council Deliberation Proxy

**Create** `src/app/api/council/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sutraApiUrl = process.env.NEXT_PUBLIC_SUTRA_API_URL;

    if (!sutraApiUrl) {
      // If SammaSuit backend isn't provisioned yet, return a stub response
      return NextResponse.json({
        deliberation_id: `stub-${Date.now()}`,
        status: "backend_not_configured",
        message:
          "Council deliberation backend is not yet provisioned. This endpoint will proxy to the SammaSuit API once configured.",
        query: body.query,
        council_mode: body.council_mode || "rights",
      });
    }

    // Proxy to SammaSuit backend
    const response = await fetch(`${sutraApiUrl}/v1/council/deliberate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("Authorization") || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Council proxy error:", error);
    return NextResponse.json(
      { error: "Failed to process council request" },
      { status: 500 }
    );
  }
}
```

---

## Step 3: Restore Dynamic Room Route

The `/connect/room/[roomId]` route was removed due to a Next.js static export bug on Windows. Restore it now.

**Create** `src/app/connect/room/[roomId]/page.tsx`:

```tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = use(params);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getToken() {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: roomId,
            participantName: `user-${Date.now()}`,
          }),
        });

        if (!res.ok) {
          throw new Error(`Token request failed: ${res.status}`);
        }

        const data = await res.json();
        setToken(data.token);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join room");
      } finally {
        setLoading(false);
      }
    }

    getToken();
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#a78bfa] mx-auto mb-4" />
          <p className="text-[#71717a]">Connecting to council room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/connect")}
            className="px-6 py-2 border border-[#1e1e2e] rounded-lg text-[#e4e4e7] hover:border-[#a78bfa] transition-colors"
          >
            Back to Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center max-w-lg">
        <h1 className="text-2xl font-bold text-[#e4e4e7] mb-2">
          Room: {roomId}
        </h1>
        <p className="text-[#71717a] mb-6">
          Token acquired. LiveKit room component will mount here once
          @livekit/components-react is installed and configured.
        </p>
        <div className="p-4 bg-[#12121a] rounded-lg border border-[#1e1e2e]">
          <p className="text-xs text-[#71717a] font-mono break-all">
            Token: {token?.slice(0, 40)}...
          </p>
        </div>
      </div>
    </div>
  );
}
```

> **Note:** This is a scaffold. The full LiveKit room UI (with `@livekit/components-react`) gets wired in when the agent server is deployed and you can actually connect to rooms. For now it confirms the token flow works.

---

## Step 4: Update the Connect Page

The `/connect` page currently shows "Coming Soon" overlays when selecting a mode. Update it so that the **Video Room** and **Voice Session** cards navigate to a room instead of showing the overlay. Keep **Phone Call** as "Coming Soon" until SIP is provisioned.

In `src/app/connect/page.tsx`, find the click handler for Video and Voice modes and change from the "Coming Soon" overlay to:

```typescript
// For Video Room and Voice Session cards:
const handleModeSelect = (mode: "video" | "voice" | "phone") => {
  if (mode === "phone") {
    // Phone still coming soon until SIP trunk provisioned
    setShowComingSoon(true);
    return;
  }
  const roomId = `${mode}-${Date.now()}`;
  router.push(`/connect/room/${roomId}`);
};
```

Make sure `useRouter` is imported from `next/navigation`.

---

## Step 5: Install LiveKit Server SDK

The token endpoint needs the LiveKit server SDK:

```bash
npm install livekit-server-sdk
```

---

## Step 6: Link to Vercel and Deploy

### 6.1 — Link the Project

If not already linked:

```bash
cd C:\Users\jbwagoner\sutra.team
vercel link
```

- Select the **OneZeroEight-ai** scope/org
- Link to the **existing** `OneZeroEight-ai/sutra-team` repo
- If it asks about project settings, accept defaults (Framework: Next.js, Root: ./)

### 6.2 — Set Environment Variables

Run the commands from `docs/VERCEL_ENV_SETUP.sh`, substituting your real values. Or add them via the Vercel dashboard: **Project Settings → Environment Variables**.

At minimum, you need these for the migration to work:

| Variable | Required Now? | Notes |
|----------|--------------|-------|
| `NEXT_PUBLIC_LIVEKIT_URL` | Yes | Your LiveKit Cloud WebSocket URL |
| `LIVEKIT_API_KEY` | Yes | From LiveKit Cloud dashboard |
| `LIVEKIT_API_SECRET` | Yes | From LiveKit Cloud dashboard |
| `NEXT_PUBLIC_SUTRA_API_URL` | No | SammaSuit backend — stub response until provisioned |
| `NEXT_PUBLIC_PHONE_NUMBER` | No | Until SIP trunk provisioned |
| `STRIPE_SECRET_KEY` | No | Until billing is implemented |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Until billing is implemented |
| `NEXT_PUBLIC_GA_ID` | No | Optional analytics |

If you don't have LiveKit credentials yet, set placeholder values — the token endpoint will return a 500 but the rest of the site works fine. Don't skip setting them entirely though, or the build may warn.

### 6.3 — Deploy

```bash
vercel --prod
```

Or just push to `main` — Vercel auto-deploys on push once linked.

Verify at the temporary `*.vercel.app` URL that:
- All pages render (/, /council, /connect, /pricing, /personas, /docs, /about)
- `/api/livekit/token` responds (POST with JSON body → returns token or 500 if creds missing)
- `/api/council` responds (POST → returns stub response)
- `/connect/room/test-123` renders the room scaffold page

---

## Step 7: DNS Cutover

### 7.1 — Add Domain in Vercel

In the Vercel dashboard: **Project Settings → Domains → Add**

Add:
- `sutra.team`
- `www.sutra.team` (redirect to apex)

Vercel will show you the DNS records to set.

### 7.2 — Update DNS Records

At your domain registrar, update:

| Type | Name | Value | Notes |
|------|------|-------|-------|
| A | @ | `76.76.21.21` | Vercel's IP |
| CNAME | www | `cname.vercel-dns.com` | Redirect to apex |

**Remove** any existing GitHub Pages DNS records (likely a CNAME pointing to `onezeroeight-ai.github.io` or similar A records for GitHub's IPs: 185.199.108-111.153).

### 7.3 — Disable GitHub Pages

In the GitHub repo settings (`OneZeroEight-ai/sutra-team` → Settings → Pages):
- Set source to **None** / disable Pages

This prevents the old static site from serving if DNS propagation has stale entries.

### 7.4 — Verify

- Wait for DNS propagation (usually 5-30 minutes, can take up to 48h)
- Hit `https://sutra.team` — should show the Vercel deployment
- Vercel auto-provisions SSL
- Test API routes: `curl -X POST https://sutra.team/api/livekit/token -H "Content-Type: application/json" -d '{"roomName":"test","participantName":"jb"}'`

---

## Step 8: Commit and Push

```bash
git add -A
git commit -m "feat: migrate to Vercel — restore API routes, dynamic room, remove static export"
git push origin main
```

Vercel auto-deploys on push.

---

## Post-Migration Checklist

```
[ ] next.config.ts has NO output: "export"
[ ] .github/workflows/deploy.yml is DELETED
[ ] /api/livekit/token route exists and responds
[ ] /api/council route exists and responds (stub OK)
[ ] /connect/room/[roomId] route exists and renders
[ ] /connect page navigates to rooms for video/voice modes
[ ] livekit-server-sdk is in package.json dependencies
[ ] Vercel env vars set (at least LIVEKIT_* trio)
[ ] sutra.team DNS points to Vercel (A record 76.76.21.21)
[ ] GitHub Pages disabled in repo settings
[ ] All 9+ routes render on production URL
[ ] SSL active (https://sutra.team loads with valid cert)
```

---

## What This Unblocks

Once on Vercel:
- **Agent server deployment** — token endpoint is live, rooms can be created, agents can join
- **Phone portal** — SIP trunk config + phone number → phone calls route to LiveKit rooms
- **Council API** — proxy route ready, just needs SammaSuit backend URL
- **Future SSR pages** — user dashboards, memory reports, persona builder (all need server-side rendering)
