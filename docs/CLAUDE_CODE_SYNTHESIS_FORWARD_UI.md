# SYNTHESIS-FORWARD UI REDESIGN
# ====================================================
# Claude Code Directive for sutra.team
#
# Redesign the deliberation page to lead with synthesis.
# The oracle speaks first. The council deliberation is behind the curtain.
# Uses the psychedelic hue-cycling GIF as the oracle's avatar.
# ====================================================


# ============================================================================
# DESIGN PHILOSOPHY
# ============================================================================
#
# BEFORE: "8 agents deliberate, here are their perspectives, and also a synthesis"
# AFTER:  "The Oracle has spoken. Want to see how it thinks? Peek behind the curtain."
#
# The synthesis IS the product. The 8 agents are the engine, not the interface.
# Users buy confident answers, not deliberative complexity.
#
# The psychedelic GIF is the Oracle — mysterious, alive, hypnotic.
# It pulses during deliberation (loading state).
# It anchors the synthesis when results arrive.
# Individual perspectives are collapsed behind "How the Council deliberated"


# ============================================================================
# STEP 1: COPY THE GIF INTO THE PROJECT
# ============================================================================

# Copy the GIF to the public assets folder so Next.js can serve it:

```bash
mkdir -p public/images
cp "C:\Users\jbwagoner\Downloads\psychedelic_hue_cycle.gif" public/images/oracle.gif
```

# This makes it available at /images/oracle.gif in the browser.


# ============================================================================
# STEP 2: REDESIGN THE DELIBERATION PAGE
# ============================================================================

# Replace the contents of src/app/council/deliberate/page.tsx
# Keep all existing logic (handleSubmit, credits, voice, file input, etc.)
# Only change the JSX layout and add the oracle visual.

# Here is the complete updated component structure:

## Header Section — replace current header:

```tsx
{/* Oracle Header */}
<div className="text-center mb-8">
  <div className="relative inline-block mb-4">
    <img
      src="/images/oracle.gif"
      alt="Sutra Oracle"
      className="w-24 h-24 rounded-full object-cover border-2 border-violet-500/30 shadow-lg shadow-violet-500/20"
    />
    {loading && (
      <div className="absolute inset-0 rounded-full border-2 border-violet-400 animate-ping" />
    )}
  </div>
  <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
    Sutra
  </h1>
  <p className="text-sm text-zinc-500 mt-1">
    Strategic Decision Intelligence
  </p>
  {credits !== null && (
    <div className={`inline-block text-xs px-3 py-1 rounded-full mt-3 ${
      credits > 5 ? 'bg-zinc-800/50 text-zinc-500'
      : credits > 0 ? 'bg-amber-900/30 text-amber-400'
      : 'bg-red-900/30 text-red-400'
    }`}>
      {credits} credit{credits !== 1 ? 's' : ''}
    </div>
  )}
</div>
```

## Input Section — keep textarea and buttons, but style more minimal:

```tsx
{/* Input */}
<div className="mb-8">
  <textarea
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Describe your decision, dilemma, or strategic question..."
    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-violet-500/30 transition min-h-[100px]"
    rows={3}
    disabled={loading}
  />
  {/* Button row — keep existing attach, mic, submit buttons as-is */}
</div>
```

## Loading State — the oracle comes alive:

```tsx
{/* Loading — Oracle Deliberating */}
{loading && (
  <div className="text-center py-12">
    <img
      src="/images/oracle.gif"
      alt="Deliberating..."
      className="w-40 h-40 rounded-2xl object-cover mx-auto mb-6 shadow-2xl shadow-violet-500/20 border border-violet-500/20"
    />
    <p className="text-violet-400 text-sm font-medium animate-pulse">
      The council is deliberating...
    </p>
    <p className="text-zinc-600 text-xs mt-2">
      8 perspectives · synthesizing · ~30 seconds
    </p>
  </div>
)}
```

## Synthesis Result — the oracle speaks (big, prominent, the MAIN thing):

```tsx
{/* Synthesis — The Oracle Speaks */}
{result?.synthesis && !loading && (
  <div className="mb-8">
    {/* Oracle avatar + label */}
    <div className="flex items-center gap-3 mb-4">
      <img
        src="/images/oracle.gif"
        alt="Sutra"
        className="w-10 h-10 rounded-full object-cover border border-violet-500/30"
      />
      <div>
        <div className="text-sm font-semibold text-violet-400">Sutra</div>
        <div className="text-xs text-zinc-600">Synthesis of 8 perspectives</div>
      </div>
    </div>

    {/* Synthesis content — prominent */}
    <div className="bg-zinc-900/50 border border-violet-500/10 rounded-xl p-6 leading-relaxed">
      <div className="text-zinc-200 whitespace-pre-wrap text-[15px] leading-7">
        {result.synthesis}
      </div>
    </div>
  </div>
)}
```

## Individual Perspectives — behind the curtain:

```tsx
{/* Council Perspectives — collapsed by default */}
{result?.perspectives && !loading && (
  <details className="group mb-8">
    <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-300 transition flex items-center gap-2 py-3">
      <svg
        className="w-4 h-4 transition-transform group-open:rotate-90"
        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
      How the council deliberated · {result.perspectives.length} perspectives
    </summary>
    <div className="space-y-3 mt-3 pl-6 border-l border-zinc-800">
      {result.perspectives.map((p: any) => (
        <details key={p.agent_name || p.name} className="group/agent">
          <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-200 transition py-1">
            {p.agent_name || p.name}
          </summary>
          <div className="text-sm text-zinc-500 whitespace-pre-wrap leading-relaxed mt-1 mb-3 pl-4">
            {p.response || p.response_text}
          </div>
        </details>
      ))}
    </div>
  </details>
)}
```


# ============================================================================
# STEP 3: REMOVE OLD HEADER STYLING
# ============================================================================

# Remove or replace the old header:
#   - Remove "Council of Rights" h1
#   - Remove "8 agents · Noble Eightfold Path · Sutra synthesis" subtitle
#   - Remove the old credit display in the header bar (now integrated into oracle header)
#   - Remove the old loading animation (8 pulsing dots — replaced by oracle GIF)
#   - Remove the old "Sutra Synthesis" label above synthesis (oracle avatar replaces it)
#   - Remove the old "Individual Perspectives" label (replaced by "How the council deliberated")

# The page should feel like talking to ONE entity (Sutra/the Oracle),
# not managing a panel of 8 agents.


# ============================================================================
# STEP 4: PAGE BACKGROUND ENHANCEMENT (optional but recommended)
# ============================================================================

# Add a subtle radial gradient behind the oracle to give it presence:

```tsx
{/* Add as the outermost wrapper of the page */}
<div className="min-h-screen bg-black text-white">
  {/* Subtle ambient glow */}
  <div className="fixed inset-0 pointer-events-none">
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
  </div>

  {/* Content */}
  <div className="relative z-10 p-6">
    <div className="max-w-2xl mx-auto">
      {/* ... all content ... */}
    </div>
  </div>
</div>
```


# ============================================================================
# SUMMARY OF CHANGES
# ============================================================================
#
# Visual:
#   - Oracle GIF as the central avatar (24x24 header, 40x40 loading, 10x10 in results)
#   - Loading state: large oracle GIF with "council is deliberating" text
#   - Synthesis: oracle avatar + prominent text block
#   - Perspectives: collapsed behind "How the council deliberated" toggle
#   - Subtle violet ambient glow on page background
#   - "Strategic Decision Intelligence" replaces "8 agents · Noble Eightfold Path"
#
# Structural:
#   - Synthesis is the HERO of the results
#   - Individual perspectives are secondary (nested details/summary)
#   - Page feels like talking to one oracle, not managing 8 agents
#   - Credits shown subtly below oracle name
#
# No backend changes. No new dependencies. Just JSX/CSS.
#
# Files changed:
#   - public/images/oracle.gif (new — copy from Downloads)
#   - src/app/council/deliberate/page.tsx (updated layout)


# ============================================================================
# TESTING
# ============================================================================
#
# 1. npm run dev → visit /council/deliberate
# 2. Verify oracle GIF appears centered at top
# 3. Submit a query → oracle GIF should appear large during loading with pulse animation
# 4. After results: synthesis appears prominently with small oracle avatar
# 5. "How the council deliberated" is collapsed — click to expand
# 6. Individual perspectives are nested inside, each expandable
# 7. Voice input and file attach buttons still work
# 8. Credits still display and decrement
# 9. Purchase flow still works when credits = 0
