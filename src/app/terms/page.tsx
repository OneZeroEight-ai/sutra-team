export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto py-20">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-zinc-400 leading-relaxed">
          Sutra.team is currently in pilot. Terms of service are being
          finalized and will be published here prior to general availability.
          For questions, contact{' '}
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
