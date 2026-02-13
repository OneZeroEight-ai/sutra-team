# REVENUE VALIDATION SPRINT — COMPLETE IMPLEMENTATION
# ====================================================
# Claude Code Directive for sutra.team
#
# Implements ALL Council of Rights recommendations:
#   1. Clerk authentication
#   2. Credit system (Clerk metadata, no DB)
#   3. Stripe pilot product ($20 for 10 deliberations)
#   4. Deliberation UI with credit awareness
#   5. Deploy deliberation to Railway
#   6. Pilot user onboarding flow
#
# Goal: 0 paying users → first dollar in 14 days.
# Everything here is MINIMUM VIABLE. No gold plating.
# ====================================================


# ============================================================================
# PART 1: CLERK AUTHENTICATION
# ============================================================================

## 1.1 Install

```bash
npm install @clerk/nextjs
```

## 1.2 Environment variables

Add to `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_PLACEHOLDER
CLERK_SECRET_KEY=sk_test_PLACEHOLDER
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/council
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/council
```

JB replaces PLACEHOLDERs after creating app at https://dashboard.clerk.com.
Same vars go in Vercel Project Settings → Environment Variables for production.

## 1.3 ClerkProvider in root layout

Update `src/app/layout.tsx` — wrap existing content with ClerkProvider.
Do NOT remove any existing layout content (fonts, metadata, providers).
Just add ClerkProvider as the outermost wrapper around the `<html>` tag:

```tsx
import { ClerkProvider } from '@clerk/nextjs'

// Wrap like this:
// <ClerkProvider>
//   <html lang="en">
//     ...all existing layout content stays exactly as is...
//   </html>
// </ClerkProvider>
```

## 1.4 Middleware

Create `src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/council/deliberate(.*)',
  '/council/session(.*)',
  '/dashboard(.*)',
  '/api/council/deliberate(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

Public (no auth): `/`, `/sign-in`, `/sign-up`, `/experts/*`, `/about`, `/pricing`, `/api/council`, `/api/webhooks/*`
Protected (auth required): `/council/deliberate`, `/council/session/*`, `/dashboard`, `/api/council/deliberate`

## 1.5 Sign-in page

Create `src/app/sign-in/[[...sign-in]]/page.tsx`:

```tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-zinc-900 border border-zinc-800 shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-zinc-400",
            socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700",
            formButtonPrimary: "bg-violet-600 hover:bg-violet-700",
            footerActionLink: "text-violet-400 hover:text-violet-300",
            formFieldInput: "bg-zinc-800 border-zinc-700 text-white",
            formFieldLabel: "text-zinc-400",
            identityPreviewEditButton: "text-violet-400",
          }
        }}
      />
    </div>
  )
}
```

## 1.6 Sign-up page

Create `src/app/sign-up/[[...sign-up]]/page.tsx`:

```tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-zinc-900 border border-zinc-800 shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-zinc-400",
            socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700",
            formButtonPrimary: "bg-violet-600 hover:bg-violet-700",
            footerActionLink: "text-violet-400 hover:text-violet-300",
            formFieldInput: "bg-zinc-800 border-zinc-700 text-white",
            formFieldLabel: "text-zinc-400",
            identityPreviewEditButton: "text-violet-400",
          }
        }}
      />
    </div>
  )
}
```

Adjust appearance colors to match whatever the current site theme uses.

## 1.7 Auth UI in site header

Find the existing header/nav component. Add:

```tsx
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

// In the header's right side, alongside existing nav items:
<SignedOut>
  <SignInButton mode="modal">
    <button className="text-sm text-zinc-400 hover:text-white transition cursor-pointer">
      Sign In
    </button>
  </SignInButton>
  <a
    href="/sign-up"
    className="text-sm bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition"
  >
    Get Started
  </a>
</SignedOut>
<SignedIn>
  <a href="/council/deliberate" className="text-sm text-zinc-400 hover:text-white transition">
    Council
  </a>
  <UserButton
    afterSignOutUrl="/"
    appearance={{
      elements: { avatarBox: "w-8 h-8" }
    }}
  />
</SignedIn>
```


# ============================================================================
# PART 2: CREDIT SYSTEM (Clerk metadata — no database needed)
# ============================================================================

## 2.1 Credit utility

Create `src/lib/credits.ts`:

```typescript
import { clerkClient } from '@clerk/nextjs/server'

// ============================================
// CREDIT CONSTANTS
// ============================================
export const FREE_TRIAL_CREDITS = 3        // New users get 3 free deliberations
export const PILOT_CREDITS = 10            // $20 pilot purchase = 10 deliberations
export const CREATOR_CREDITS = 30          // $49/mo Creator tier (future)
export const PROFESSIONAL_CREDITS = 75     // $149/mo Professional tier (future)

// ============================================
// CREDIT OPERATIONS
// ============================================

export async function getCredits(userId: string): Promise<number> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const meta = user.publicMetadata as Record<string, any>
    const credits = meta?.credits

    // First-time user: initialize with free trial
    if (credits === undefined || credits === null) {
      await setCredits(userId, FREE_TRIAL_CREDITS)
      return FREE_TRIAL_CREDITS
    }

    return Number(credits)
  } catch (error) {
    console.error('[credits] Failed to get credits:', error)
    return 0
  }
}

export async function setCredits(userId: string, credits: number): Promise<void> {
  try {
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        credits: Math.max(0, Math.floor(credits)),
        lastCreditUpdate: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[credits] Failed to set credits:', error)
    throw error
  }
}

export async function deductCredit(userId: string): Promise<{
  allowed: boolean
  remaining: number
  message?: string
}> {
  const credits = await getCredits(userId)

  if (credits <= 0) {
    return {
      allowed: false,
      remaining: 0,
      message: 'No credits remaining. Purchase more at /pricing.',
    }
  }

  const remaining = credits - 1
  await setCredits(userId, remaining)
  return { allowed: true, remaining }
}

export async function addCredits(userId: string, amount: number): Promise<number> {
  const current = await getCredits(userId)
  const updated = current + amount
  await setCredits(userId, updated)
  return updated
}

export async function getUserCreditInfo(userId: string): Promise<{
  credits: number
  tier: string
}> {
  const credits = await getCredits(userId)
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const tier = (user.publicMetadata as any)?.tier || 'free'
  return { credits, tier }
}
```

## 2.2 Credit balance API

Create `src/app/api/credits/route.ts`:

```typescript
import { auth } from '@clerk/nextjs/server'
import { getUserCreditInfo } from '@/lib/credits'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const info = await getUserCreditInfo(userId)
  return Response.json(info)
}
```

## 2.3 Gate the deliberation API

Update `src/app/api/council/deliberate/route.ts`:

```typescript
import { auth } from '@clerk/nextjs/server'
import { deductCredit, getCredits } from '@/lib/credits'

export async function POST(request: Request) {
  // 1. Authenticate
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  // 2. Check credits
  const credits = await getCredits(userId)
  if (credits <= 0) {
    return Response.json({
      error: 'No credits remaining',
      credits: 0,
      upgradeUrl: '/pricing',
    }, { status: 402 })
  }

  // 3. Parse request
  const body = await request.json()

  // 4. Forward to agent server
  const agentUrl = process.env.AGENT_SERVER_URL
  if (!agentUrl) {
    return Response.json({ error: 'Agent server not configured' }, { status: 503 })
  }

  try {
    const response = await fetch(`${agentUrl}/deliberate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DELIBERATION_API_KEY || ''}`,
        'X-User-Id': userId,
      },
      body: JSON.stringify({ ...body, userId }),
      signal: AbortSignal.timeout(120_000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[deliberate] Agent server error:', response.status, errorText)
      return Response.json(
        { error: 'Deliberation failed', detail: errorText },
        { status: response.status }
      )
    }

    // 5. Deduct credit AFTER successful deliberation (not before)
    const { remaining } = await deductCredit(userId)

    // 6. Return result with credit info
    const data = await response.json()
    return Response.json({
      ...data,
      credits: { remaining, deducted: 1 },
    })
  } catch (error: any) {
    console.error('[deliberate] Error:', error)
    if (error.name === 'TimeoutError') {
      return Response.json({ error: 'Deliberation timed out' }, { status: 504 })
    }
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

## 2.4 Credit badge component

Create `src/components/CreditBadge.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'

export function CreditBadge() {
  const { isSignedIn } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/credits')
      .then((r) => r.json())
      .then((data) => setCredits(data.credits))
      .catch(() => setCredits(null))
  }, [isSignedIn])

  if (!isSignedIn || credits === null) return null

  return (
    <div className={`text-xs px-2 py-1 rounded-full ${
      credits > 5 ? 'bg-zinc-800 text-zinc-400'
        : credits > 0 ? 'bg-amber-900/50 text-amber-400'
        : 'bg-red-900/50 text-red-400'
    }`}>
      {credits} credit{credits !== 1 ? 's' : ''}
    </div>
  )
}
```

Add `<CreditBadge />` next to `<UserButton />` in the header.


# ============================================================================
# PART 3: STRIPE PILOT PRODUCT — $20 for 10 deliberations
# ============================================================================

## 3.1 Stripe setup (manual — JB does this)

In Stripe Dashboard:
- Create product: "Pilot Access"
- Price: $20.00 one-time
- Description: "10 council deliberations"
- Note the price ID (e.g., price_xxxxx)

Add to `.env.local`:
```
NEXT_PUBLIC_STRIPE_PILOT_PRICE_ID=price_PLACEHOLDER
STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER
```

## 3.2 Checkout API

Create `src/app/api/checkout/route.ts`:

```typescript
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const priceId = body.priceId || process.env.NEXT_PUBLIC_STRIPE_PILOT_PRICE_ID

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://sutra.team'}/council/deliberate?purchased=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://sutra.team'}/pricing`,
      metadata: {
        userId,
        credits: '10',
      },
    })

    return Response.json({ url: session.url })
  } catch (error: any) {
    console.error('[checkout] Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

## 3.3 Stripe webhook → add credits

Create `src/app/api/webhooks/stripe/route.ts`:

```typescript
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { addCredits } from '@/lib/credits'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return Response.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const credits = parseInt(session.metadata?.credits || '0', 10)

    if (userId && credits > 0) {
      try {
        const newTotal = await addCredits(userId, credits)
        console.log(`[webhook] Added ${credits} credits to ${userId}. Total: ${newTotal}`)
      } catch (error) {
        console.error('[webhook] Failed to add credits:', error)
        // Don't return error — Stripe will retry. Log for manual fix.
      }
    }
  }

  return Response.json({ received: true })
}
```

This route is NOT protected by Clerk middleware (webhook comes from Stripe).
The middleware in Part 1 already excludes `/api/webhooks/*`.

## 3.4 Pricing page

Create `src/app/pricing/page.tsx`:

```tsx
'use client'

import { useAuth } from '@clerk/nextjs'
import { useState } from 'react'

export default function PricingPage() {
  const { isSignedIn } = useAuth()
  const [loading, setLoading] = useState(false)

  async function handlePurchase() {
    if (!isSignedIn) {
      window.location.href = '/sign-up'
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Try the Council</h1>
          <p className="text-zinc-400">
            8 AI agents grounded in the Noble Eightfold Path deliberate on your question.
            One synthesis. Decisions you can live with.
          </p>
        </div>

        {/* Pilot Offer */}
        <div className="bg-zinc-900 border border-violet-500/30 rounded-xl p-6 mb-6">
          <div className="text-xs text-violet-400 uppercase tracking-wider mb-2">Pilot Access</div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold">$20</span>
            <span className="text-zinc-500">one-time</span>
          </div>
          <ul className="space-y-2 mb-6 text-sm text-zinc-300">
            <li className="flex items-center gap-2">
              <span className="text-violet-400">✓</span> 10 council deliberations
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-400">✓</span> All 8 Rights agents + Sutra synthesis
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-400">✓</span> Full perspective reports
            </li>
            <li className="flex items-center gap-2">
              <span className="text-zinc-600">—</span>
              <span className="text-zinc-500">No subscription required</span>
            </li>
          </ul>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-lg transition cursor-pointer disabled:cursor-wait"
          >
            {loading ? 'Loading...' : isSignedIn ? 'Purchase Pilot Access' : 'Sign Up & Purchase'}
          </button>
        </div>

        {/* Free trial note */}
        <div className="text-center text-sm text-zinc-500">
          <p>New accounts include 3 free deliberations to try the council.</p>
          <p className="mt-1">
            Questions?{' '}
            <a href="mailto:jbwagoner@gmail.com" className="text-violet-400 hover:text-violet-300">
              jbwagoner@gmail.com
            </a>
          </p>
        </div>

        {/* Future tiers (greyed out) */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 text-center mb-4">Coming soon</p>
          <div className="grid grid-cols-2 gap-4 opacity-40">
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="text-sm font-semibold">Creator</div>
              <div className="text-lg font-bold">$49<span className="text-xs text-zinc-500">/mo</span></div>
              <div className="text-xs text-zinc-500">30 deliberations/mo</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="text-sm font-semibold">Professional</div>
              <div className="text-lg font-bold">$149<span className="text-xs text-zinc-500">/mo</span></div>
              <div className="text-xs text-zinc-500">75 deliberations/mo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```


# ============================================================================
# PART 4: DELIBERATION UI WITH CREDIT AWARENESS
# ============================================================================

## 4.1 Update the deliberation page

Update `/council/deliberate` page to show credits, handle empty state, display results.
This replaces or augments whatever is currently in the deliberation page:

```tsx
'use client'

import { useAuth } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function DeliberatePage() {
  const { isSignedIn } = useAuth()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [credits, setCredits] = useState<number | null>(null)
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false)

  // Load credits
  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/credits')
      .then((r) => r.json())
      .then((data) => setCredits(data.credits))
      .catch(() => {})
  }, [isSignedIn])

  // Handle post-purchase redirect
  useEffect(() => {
    if (searchParams.get('purchased') === 'true') {
      setShowPurchaseSuccess(true)
      window.history.replaceState({}, '', '/council/deliberate')
      // Refresh credits
      fetch('/api/credits')
        .then((r) => r.json())
        .then((data) => setCredits(data.credits))
        .catch(() => {})
    }
  }, [searchParams])

  async function handleSubmit() {
    if (!query.trim() || loading) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/council/deliberate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          councilMode: 'rights',
          outputFormat: 'synthesis_with_perspectives',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 402) {
          setError('No credits remaining.')
          setCredits(0)
          return
        }
        setError(data.error || 'Deliberation failed')
        return
      }

      setResult(data)
      if (data.credits?.remaining !== undefined) {
        setCredits(data.credits.remaining)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = credits !== null && credits > 0 && query.trim().length > 0 && !loading

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-semibold">Council of Rights</h1>
            <p className="text-sm text-zinc-500">8 agents · Noble Eightfold Path · Sutra synthesis</p>
          </div>
          {credits !== null && (
            <div className={`text-sm px-3 py-1 rounded-full ${
              credits > 5 ? 'bg-zinc-800 text-zinc-400'
              : credits > 0 ? 'bg-amber-900/50 text-amber-400 border border-amber-500/30'
              : 'bg-red-900/50 text-red-400 border border-red-500/30'
            }`}>
              {credits} credit{credits !== 1 ? 's' : ''} remaining
            </div>
          )}
        </div>

        {/* Purchase success banner */}
        {showPurchaseSuccess && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-6 text-sm text-green-300">
            ✓ Pilot access activated — 10 deliberations added to your account.
          </div>
        )}

        {/* Input */}
        <div className="mb-6">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What decision, question, or situation should the council deliberate on?"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-violet-500/50 transition"
            rows={4}
            disabled={loading}
          />
          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-zinc-600">
              {credits === 0 ? (
                <a href="/pricing" className="text-violet-400 hover:text-violet-300">
                  Purchase credits to continue →
                </a>
              ) : '1 credit per deliberation · ~30 seconds'}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium py-2 px-6 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Deliberating...' : 'Submit to Council'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-sm text-red-400">
            {error}
            {credits === 0 && (
              <a href="/pricing" className="block mt-2 text-violet-400 hover:text-violet-300">
                → Purchase more credits
              </a>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-violet-500 animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-zinc-500 text-sm">8 agents deliberating in parallel...</p>
          </div>
        )}

        {/* Synthesis */}
        {result?.synthesis && (
          <div className="bg-zinc-900/50 border border-violet-500/20 rounded-xl p-6 mb-6">
            <div className="text-xs text-violet-400 uppercase tracking-wider mb-2">Sutra Synthesis</div>
            <div className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{result.synthesis}</div>
          </div>
        )}

        {/* Perspectives */}
        {result?.perspectives && (
          <div className="space-y-2">
            <div className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Individual Perspectives</div>
            {result.perspectives.map((p: any) => (
              <details key={p.agent_name || p.name} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <summary className="p-4 cursor-pointer text-sm text-zinc-300 hover:text-white transition">
                  {p.agent_name || p.name}
                </summary>
                <div className="px-4 pb-4 text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {p.response || p.response_text}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```


# ============================================================================
# PART 5: DEPLOY DELIBERATION TO RAILWAY
# ============================================================================

## 5.1 Fix Railway deployment

The deliberation endpoint exists in code but isn't deployed (GitHub App
permissions issue). Try these in order:

### Option A: Reconnect GitHub (preferred)
Railway dashboard → Project → Settings → Source → Disconnect + Reconnect

### Option B: Railway CLI
```bash
cd server/agents
echo "assets/music/" >> .railwayignore
echo "*.wav" >> .railwayignore
echo ".venv/" >> .railwayignore
echo "__pycache__/" >> .railwayignore
railway up --service sutra-council-agents
```

### Option C: Docker push
```bash
cd server/agents
docker build -t sutra-agents .
# Push to Railway's container registry
```

## 5.2 Railway env vars

```
ANTHROPIC_API_KEY=sk-ant-xxxxx         # Already set
DELIBERATION_API_KEY=sutra-secret-xxx  # Generate random string
USE_PERSONA_PDFS=true                  # Enable PDF personas
```

## 5.3 Vercel env vars

```
AGENT_SERVER_URL=https://sutra-council-agents-production.up.railway.app
DELIBERATION_API_KEY=sutra-secret-xxx   # Same as Railway
NEXT_PUBLIC_STRIPE_PILOT_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
NEXT_PUBLIC_APP_URL=https://sutra.team
```

## 5.4 Stripe webhook setup

Stripe Dashboard → Developers → Webhooks:
1. Add endpoint: `https://sutra.team/api/webhooks/stripe`
2. Events to send: `checkout.session.completed`
3. Copy signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel


# ============================================================================
# PART 6: PILOT USER OUTREACH (JB does this, not Claude Code)
# ============================================================================

## 6.1 Post-deploy verification

1. Sign up at sutra.team → verify Clerk works
2. Check 3 free credits appear
3. Run a deliberation → verify end-to-end
4. Purchase pilot ($20) in Stripe test mode → verify credits added
5. Switch Stripe to LIVE mode
6. Switch Clerk to production keys

## 6.2 Find 3 pilot users

Send to 10 people. Goal: 3 pay.

Targets:
- Anyone who's expressed interest in AI decision tools
- Founders/consultants in your network
- Expert portal applicants (if any)
- People who've engaged with the Sutra music project

Message:
"Hey [name] — I built an AI deliberation platform called Sutra.
Instead of one AI giving you one answer, 8 specialized AI agents each
grounded in a different aspect of Buddhist ethics analyze your question
independently, then a synthesis agent reconciles their perspectives.

It's live at sutra.team. Pilot access is $20 for 10 deliberations.
Want to try it?"

## 6.3 What to watch

- Which queries do they ask? → Tells you the use case
- Do they use all 10 credits? → Tells you retention
- Do they read perspectives or only synthesis? → Tells you product shape
- Do they ask to buy more? → Tells you everything


# ============================================================================
# FILE MANIFEST
# ============================================================================
#
# New files:
#   src/middleware.ts
#   src/app/sign-in/[[...sign-in]]/page.tsx
#   src/app/sign-up/[[...sign-up]]/page.tsx
#   src/lib/credits.ts
#   src/app/api/credits/route.ts
#   src/app/api/checkout/route.ts
#   src/app/api/webhooks/stripe/route.ts
#   src/app/pricing/page.tsx
#   src/components/CreditBadge.tsx
#
# Updated files:
#   src/app/layout.tsx                         — ClerkProvider wrapper
#   src/app/api/council/deliberate/route.ts    — Auth + credit gating
#   src/app/council/deliberate/page.tsx        — Credit-aware deliberation UI
#   [header/nav component]                     — Auth buttons + CreditBadge
#
# New packages:
#   @clerk/nextjs


# ============================================================================
# EXECUTION ORDER (if breaking into multiple sessions)
# ============================================================================
#
# Priority 1 — AUTH: Clerk install, middleware, provider, pages, header UI
# Priority 2 — CREDITS: credits.ts, /api/credits, deliberation gating, badge
# Priority 3 — PAYMENT: checkout, webhook, pricing page
# Priority 4 — UI: deliberation page with credits, loading, results
# Priority 5 — DEPLOY: Railway fix, env vars, Stripe webhook, production test
#
# Steps 1-4 verify with `npm run dev`. Step 5 needs infra access.


# ============================================================================
# WHAT THIS INTENTIONALLY EXCLUDES
# ============================================================================
#
# No database (Clerk metadata is the "DB" for now)
# No subscriptions (one-time purchase only until demand proven)
# No expert council (Rights only until paying users exist)
# No memory persistence (stateless deliberations)
# No voice auth (text first)
# No email notifications
# No analytics beyond Stripe
# No admin dashboard (use Clerk + Stripe + Railway dashboards)
# No knowledge base / vector DB
# No SammaSuit backend (stub only)
#
# Everything not on the path to first dollar is deprioritized.
# ============================================================================
