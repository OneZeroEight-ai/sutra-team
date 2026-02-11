# ============================================================================
# VERCEL ENVIRONMENT VARIABLE SETUP
# ============================================================================
# Run these commands after `vercel login` and `vercel link` to set all
# environment variables for the sutra-team project.
#
# Replace each __PLACEHOLDER__ with the real value before running.
# These apply to Production + Preview + Development environments.
# ============================================================================

# --- SammaSuit Backend ---
vercel env add NEXT_PUBLIC_SUTRA_API_URL production preview development
# Paste: __PLACEHOLDER_SAMMASUIT_API_URL__

# --- LiveKit (public — browser needs this) ---
vercel env add NEXT_PUBLIC_LIVEKIT_URL production preview development
# Paste: __PLACEHOLDER_LIVEKIT_WS_URL__

# --- LiveKit (server-side secrets — NOT public) ---
vercel env add LIVEKIT_API_KEY production preview development
# Paste: __PLACEHOLDER_LIVEKIT_API_KEY__

vercel env add LIVEKIT_API_SECRET production preview development
# Paste: __PLACEHOLDER_LIVEKIT_API_SECRET__

# --- Phone Number (public — displayed on site) ---
vercel env add NEXT_PUBLIC_PHONE_NUMBER production preview development
# Paste: __PLACEHOLDER_PHONE_NUMBER__

# --- Stripe (future) ---
vercel env add STRIPE_SECRET_KEY production preview
# Paste: __PLACEHOLDER_STRIPE_KEY__

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production preview development
# Paste: __PLACEHOLDER_STRIPE_PUBLISHABLE_KEY__

# --- Analytics (optional) ---
vercel env add NEXT_PUBLIC_GA_ID production
# Paste: __PLACEHOLDER_GA_MEASUREMENT_ID__


# ============================================================================
# VERCEL DASHBOARD — QUICK COPY TABLE
# ============================================================================
# If you prefer the web UI: Project Settings → Environment Variables → Add
#
# Variable Name                         | Environments        | Value
# --------------------------------------|---------------------|------
# NEXT_PUBLIC_SUTRA_API_URL             | Prod, Preview, Dev  | __PLACEHOLDER_SAMMASUIT_API_URL__
# NEXT_PUBLIC_LIVEKIT_URL               | Prod, Preview, Dev  | __PLACEHOLDER_LIVEKIT_WS_URL__
# LIVEKIT_API_KEY                       | Prod, Preview, Dev  | __PLACEHOLDER_LIVEKIT_API_KEY__
# LIVEKIT_API_SECRET                    | Prod, Preview, Dev  | __PLACEHOLDER_LIVEKIT_API_SECRET__
# NEXT_PUBLIC_PHONE_NUMBER              | Prod, Preview, Dev  | __PLACEHOLDER_PHONE_NUMBER__
# STRIPE_SECRET_KEY                     | Prod, Preview       | __PLACEHOLDER_STRIPE_KEY__
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY    | Prod, Preview, Dev  | __PLACEHOLDER_STRIPE_PUBLISHABLE_KEY__
# NEXT_PUBLIC_GA_ID                     | Prod                | __PLACEHOLDER_GA_MEASUREMENT_ID__


# ============================================================================
# AGENT SERVER ENVIRONMENT (server/agents/.env)
# ============================================================================
# Copy this block to server/agents/.env on your agent server host
# (Railway, Fly.io, Docker, or SammaSuit infra)
#
# LIVEKIT_URL=__PLACEHOLDER_LIVEKIT_WS_URL__
# LIVEKIT_API_KEY=__PLACEHOLDER_LIVEKIT_API_KEY__
# LIVEKIT_API_SECRET=__PLACEHOLDER_LIVEKIT_API_SECRET__
# ANTHROPIC_API_KEY=__PLACEHOLDER_ANTHROPIC_API_KEY__
# DEEPGRAM_API_KEY=__PLACEHOLDER_DEEPGRAM_API_KEY__
# CARTESIA_API_KEY=__PLACEHOLDER_CARTESIA_API_KEY__
# SIP_TRUNK_ID=__PLACEHOLDER_SIP_TRUNK_ID__
# SUTRA_API_URL=__PLACEHOLDER_SAMMASUIT_API_URL__
