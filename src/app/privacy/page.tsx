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
          <a href="mailto:info@onezeroeight.ai"
            className="text-violet-400 hover:text-violet-300">
            info@onezeroeight.ai
          </a>.
        </p>
        <p className="text-zinc-600 text-sm mt-8">Last updated: February 2026</p>
      </div>
    </div>
  );
}
