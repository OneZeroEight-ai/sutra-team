# CLERK FIX: RENAME middleware.ts → proxy.ts
# ============================================
# Claude Code Directive — Quick Fix
#
# The revenue sprint created src/middleware.ts but current Clerk docs
# require src/proxy.ts instead. The code inside is identical — only
# the filename changed.
# ============================================

## Step 1: Rename the file

```bash
mv src/middleware.ts src/proxy.ts
```

If the file is still named `middleware.ts`, rename it.
If Claude Code already created it as `proxy.ts`, skip this step.

## Step 2: Verify the contents of proxy.ts

The file should contain exactly this:

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

## Step 3: Verify no middleware.ts remains

```bash
# Should NOT exist:
ls src/middleware.ts 2>/dev/null && echo "ERROR: middleware.ts still exists — delete it" || echo "OK: no middleware.ts"

# Should exist:
ls src/proxy.ts 2>/dev/null && echo "OK: proxy.ts exists" || echo "ERROR: proxy.ts missing"
```

## Step 4: Verify auth() calls use await

Any file that imports `auth` from Clerk must use `await`:

```typescript
// ✅ Correct
import { auth } from '@clerk/nextjs/server'
const { userId } = await auth()

// ❌ Wrong (older pattern)
import { auth } from '@clerk/nextjs'
const { userId } = auth()
```

Check these files:
- `src/app/api/council/deliberate/route.ts`
- `src/app/api/credits/route.ts`
- `src/app/api/checkout/route.ts`

All should import from `@clerk/nextjs/server` and use `await auth()`.

## Step 5: Rebuild

```bash
npm run build
```

Should compile clean (TypeScript errors only if Clerk placeholder keys are still in .env.local — that's expected).
