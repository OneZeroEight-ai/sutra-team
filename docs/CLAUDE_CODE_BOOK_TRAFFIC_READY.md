# SUTRA.TEAM — BOOK TRAFFIC READINESS
# ====================================================
# Claude Code Directive
#
# Prepares sutra.team for visitors arriving from
# The Portable Mind Amazon listing. Tightens the site
# to showcase what actually works, removes broken links,
# and creates a /book landing page.
# ====================================================


# ============================================================================
# CHANGE 1: UPDATE HERO HEADLINE AND CTA
# ============================================================================

# File: src/app/page.tsx (or wherever the landing page hero section is)

# Find the hero headline "Your personal council of experts." and replace with:
#   "Strategic Decision Intelligence"
#
# Find the subtitle/description that starts "Sutra.team is a persona hosting platform..."
# and replace with:
#   "Eight principled perspectives analyze your question in parallel.
#    One synthesis agent reconciles them into unified guidance you can act on."
#
# Find the primary CTA button "Start a Session" that links to /connect
# and change it to:
#   Text: "Ask the Oracle"
#   Link: /council/deliberate
#
# Keep the secondary CTA "View Pricing" as-is.
#
# Also update the tagline next to "Patent Pending" at the top:
#   Change "Ensemble Agent Deliberation" to "Strategic Decision Intelligence"


# ============================================================================
# CHANGE 2: FIX EXPERT AGENTS — HIDE UNBUILT ONES
# ============================================================================

# File: src/app/page.tsx (or the component rendering the Council of Experts grid)

# The Council of Experts section currently shows 6 agents:
#   Legal Analyst, Financial Strategist, Technical Architect,
#   Market Analyst, Risk Assessor, Growth Strategist
#
# Only the Legal Analyst is actually loaded on the agent server.
# The other 5 use the generic Sutra avatar and aren't functional.
#
# Option A (recommended): Show Legal Analyst as active, show the rest greyed out
# with a "Coming Soon" label:

# For the Legal Analyst card, keep it as-is (fully visible).
# For the other 5 cards, add:
#   - Reduce opacity: className includes "opacity-40"
#   - Add a small "Coming Soon" badge in the corner
#   - Example badge:
#     <span className="text-[10px] uppercase tracking-wider text-zinc-500
#       bg-zinc-800 px-2 py-0.5 rounded-full">Coming Soon</span>

# Also update the note below the expert grid from:
#   "Default set shown (startup/business focus). Custom expert councils
#    available on Professional and Enterprise plans."
# to:
#   "Legal Analyst is live. Additional experts launching soon.
#    Custom expert councils available on Professional and Enterprise plans."


# ============================================================================
# CHANGE 3: LABEL HUMAN EXPERT SECTION AS COMING SOON
# ============================================================================

# File: src/app/page.tsx

# Find the "Human Expert Integration" section with the heading
# "The professional is already in the room."
#
# Add a "Coming Soon" badge next to the "Premium Add-on" label:
#
# Change:
#   "Premium Add-on"
# to:
#   "Coming Soon — Premium Add-on"
#
# Add a subtle overlay or reduced opacity (opacity-60) to the entire section
# so it's visually distinct from live features.
#
# OR simpler approach: wrap the section in a div with:
#   className="relative"
# and add a banner across the top:
#   <div className="bg-zinc-800/80 text-zinc-400 text-xs font-medium
#     text-center py-2 rounded-t-xl">
#     Coming Soon — Human Expert Network
#   </div>


# ============================================================================
# CHANGE 4: FIX DEAD LINKS
# ============================================================================

# File: src/app/page.tsx (footer section) and any navigation components

# The following links currently point to "#" and need placeholder pages:

# 1. Terms → /terms
# 2. Privacy → /privacy
# 3. Patent Notice → /patent
# 4. Blog → /blog

# Create minimal placeholder pages for each:

# --- src/app/terms/page.tsx ---
```tsx
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto py-20">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-zinc-400 leading-relaxed">
          Sutra.team is currently in pilot. Terms of service are being
          finalized and will be published here prior to general availability.
          For questions, contact{' '}
          <a href="mailto:jbwagoner@gmail.com"
            className="text-violet-400 hover:text-violet-300">
            jbwagoner@gmail.com
          </a>.
        </p>
        <p className="text-zinc-600 text-sm mt-8">Last updated: February 2026</p>
      </div>
    </div>
  );
}
```

# --- src/app/privacy/page.tsx ---
```tsx
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto py-20">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-zinc-400 leading-relaxed mb-4">
          Sutra.team collects only the information necessary to provide
          the deliberation service. Your queries are processed through
          the Anthropic Claude API and are not stored beyond the active session
          unless you opt into memory features.
        </p>
        <p className="text-zinc-400 leading-relaxed mb-4">
          We use Clerk for authentication and Stripe for payment processing.
          Both services handle your data according to their respective
          privacy policies.
        </p>
        <p className="text-zinc-400 leading-relaxed">
          A comprehensive privacy policy is being finalized and will be
          published here prior to general availability. For questions, contact{' '}
          <a href="mailto:jbwagoner@gmail.com"
            className="text-violet-400 hover:text-violet-300">
            jbwagoner@gmail.com
          </a>.
        </p>
        <p className="text-zinc-600 text-sm mt-8">Last updated: February 2026</p>
      </div>
    </div>
  );
}
```

# --- src/app/patent/page.tsx ---
```tsx
export default function PatentPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto py-20">
        <h1 className="text-3xl font-bold mb-6">Patent Notice</h1>
        <p className="text-zinc-400 leading-relaxed mb-4">
          Sutra.team implements technology covered by a U.S. Provisional
          Patent Application filed January 30, 2026.
        </p>
        <p className="text-zinc-400 leading-relaxed mb-4">
          Title: System and Method for Creating and Operating Persistent
          Intelligent Agent Personas with Integrated Value Frameworks,
          Memory Systems, and Multi-Modal Creative Output Capabilities.
        </p>
        <p className="text-zinc-400 leading-relaxed mb-4">
          Inventor: John B. Wagoner II (JB Wagoner)
        </p>
        <p className="text-zinc-400 leading-relaxed">
          The six-layer architecture — Persona Definition, Knowledge
          Integration, Memory System, Value Framework Engine, Multi-Modal
          Output System, and Differentiation Documentation — is the subject
          of pending patent claims.
        </p>
        <p className="text-zinc-600 text-sm mt-8">Last updated: February 2026</p>
      </div>
    </div>
  );
}
```

# --- src/app/blog/page.tsx ---
```tsx
export default function BlogPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto py-20">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        <p className="text-zinc-400 leading-relaxed mb-8">
          Coming soon. In the meantime, read the book that started it all.
        </p>
        <a href="/book"
          className="inline-block bg-violet-600 hover:bg-violet-700 text-white
            font-medium py-3 px-6 rounded-lg transition">
          The Portable Mind →
        </a>
      </div>
    </div>
  );
}
```

# Update the footer links to point to these pages:
#   Terms → /terms
#   Privacy → /privacy
#   Patent Notice → /patent
#   Blog → /blog


# ============================================================================
# CHANGE 5: CREATE /book LANDING PAGE
# ============================================================================

# --- src/app/book/page.tsx ---

# This is the bridge between the book and the product.
# A reader who finishes The Portable Mind and visits sutra.team/book
# should immediately see the connection and be able to try the system.

```tsx
import Link from 'next/link';

export default function BookPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2
          w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-400 mb-4">
            The Portable Mind
          </p>
          <h1 className="text-4xl font-bold mb-4">
            You read the book.
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400
              bg-clip-text text-transparent">
              Now try the system.
            </span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-lg mx-auto">
            Every concept in The Portable Mind is running in production
            right here. Eight agents. Principled deliberation. Sutra synthesis.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mb-16">
          <Link href="/council/deliberate"
            className="inline-block bg-violet-600 hover:bg-violet-700 text-white
              font-semibold py-4 px-10 rounded-xl transition text-lg
              shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30">
            Ask the Oracle
          </Link>
          <p className="text-zinc-600 text-sm mt-4">
            3 free deliberations · No credit card required
          </p>
        </div>

        {/* What you can try */}
        <div className="space-y-6 mb-16">
          <h2 className="text-xl font-semibold text-center mb-8">
            What you can try right now
          </h2>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold text-violet-400 mb-2">
              Council of Rights
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Eight agents grounded in the Noble Eightfold Path deliberate
              on your question in parallel. Sutra synthesizes their
              perspectives into unified guidance. This is the system
              described in Part IV of the book.
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold text-violet-400 mb-2">
              Council of Experts
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Domain-specialist agents provide technical expertise.
              The Legal Analyst is live now with deep knowledge of
              IP protection, contract law, and regulatory compliance.
              Additional experts launching soon.
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold text-violet-400 mb-2">
              Combined Mode
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Run both councils on the same query. Not just
              "what should I do" but "what should I do and can I live
              with it." The dual-council architecture described in
              Chapter 12.
            </p>
          </div>
        </div>

        {/* Book concepts mapped to product */}
        <div className="border-t border-zinc-800 pt-12 mb-16">
          <h2 className="text-xl font-semibold text-center mb-8">
            From the book to the product
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center
              border-b border-zinc-800/50 pb-3">
              <span className="text-zinc-400">Persona Definition Files (Ch. 5)</span>
              <span className="text-violet-400">9 persona JSONs loaded</span>
            </div>
            <div className="flex justify-between items-center
              border-b border-zinc-800/50 pb-3">
              <span className="text-zinc-400">Deliberation Intelligence (Ch. 12)</span>
              <span className="text-violet-400">Live at /council/deliberate</span>
            </div>
            <div className="flex justify-between items-center
              border-b border-zinc-800/50 pb-3">
              <span className="text-zinc-400">Differentiation Engine (Ch. 6)</span>
              <span className="text-violet-400">6 metrics, automated scoring</span>
            </div>
            <div className="flex justify-between items-center
              border-b border-zinc-800/50 pb-3">
              <span className="text-zinc-400">Synthesis Method (Ch. 11)</span>
              <span className="text-violet-400">Agreement · Tension · Gap mapping</span>
            </div>
            <div className="flex justify-between items-center pb-3">
              <span className="text-zinc-400">Portability (Ch. 7-9)</span>
              <span className="text-violet-400">Provider-agnostic JSON format</span>
            </div>
          </div>
        </div>

        {/* Buy the book */}
        <div className="text-center border-t border-zinc-800 pt-12">
          <p className="text-zinc-500 text-sm mb-4">
            Haven't read the book yet?
          </p>
          <a href="https://a.co/d/09DBCIAA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white
              font-medium py-3 px-8 rounded-xl transition">
            Get The Portable Mind on Amazon →
          </a>
        </div>
      </div>
    </div>
  );
}
```


# ============================================================================
# CHANGE 6: ADD /book LINK TO NAVIGATION
# ============================================================================

# File: src/components/layout/Header.tsx (or wherever the nav links are)

# Add a "Book" link to the main navigation, after "About":
#   <Link href="/book">Book</Link>
#
# Also add it to the footer under the "Company" column:
#   <Link href="/book">The Portable Mind</Link>


# ============================================================================
# CHANGE 7: ADD AMAZON LINK TO ABOUT PAGE
# ============================================================================

# File: src/app/about/page.tsx

# If there's a section about JB Wagoner or the project's origin,
# add a mention of the book:
#
#   "The concepts behind Sutra.team are detailed in The Portable Mind:
#    AI Constitutions, Persona Architecture, and the Future of Transportable
#    Intelligence — available on Amazon."
#
# With a link to https://a.co/d/09DBCIAA


# ============================================================================
# DEPLOY
# ============================================================================

# 1. Build and verify:
```bash
npm run build
```

# 2. Commit and push (Vercel auto-deploys):
```bash
git add .
git commit -m "feat: book traffic readiness - hero update, /book page, dead link fixes, coming soon labels"
git push
```

# No Railway redeployment needed — these are all frontend changes.


# ============================================================================
# TESTING CHECKLIST
# ============================================================================
#
# [ ] Homepage hero says "Strategic Decision Intelligence"
# [ ] Primary CTA "Ask the Oracle" goes to /council/deliberate
# [ ] Expert agent cards: Legal Analyst fully visible, other 5 greyed with "Coming Soon"
# [ ] Human Expert section labeled "Coming Soon"
# [ ] /terms loads placeholder page
# [ ] /privacy loads placeholder page
# [ ] /patent loads placeholder page with patent details
# [ ] /blog loads placeholder with link to /book
# [ ] /book page loads with "You read the book. Now try the system."
# [ ] /book "Ask the Oracle" button goes to /council/deliberate
# [ ] /book Amazon link opens https://a.co/d/09DBCIAA in new tab
# [ ] "Book" link appears in main nav and footer
# [ ] Footer links all resolve (no more # links)
# [ ] Build passes clean
