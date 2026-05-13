import Link from "next/link";

export default function SubscriptionRequiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-stone-100 mb-4">
          Subscription Required
        </h1>
        <p className="text-stone-400 mb-6">
          Access to the Legal Council requires an active Full Council subscription.
        </p>
        <Link
          href="/checkout/law-full-council"
          className="inline-block px-6 py-3 bg-amber-700 text-white rounded hover:bg-amber-600"
        >
          Subscribe for $299/month
        </Link>
        <p className="text-stone-500 mt-4 text-sm">
          Need Enterprise pricing or custom terms?{" "}
          <a href="mailto:legal@sutra.team" className="underline">
            Contact us
          </a>
          .
        </p>
      </div>
    </div>
  );
}
