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
            3 free deliberations &middot; No credit card required
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
              &ldquo;what should I do&rdquo; but &ldquo;what should I do and can I live
              with it.&rdquo; The dual-council architecture described in
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
              <span className="text-violet-400">Agreement &middot; Tension &middot; Gap mapping</span>
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
            Haven&apos;t read the book yet?
          </p>
          <a href="https://a.co/d/09DBCIAA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white
              font-medium py-3 px-8 rounded-xl transition">
            Get The Portable Mind on Amazon &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
