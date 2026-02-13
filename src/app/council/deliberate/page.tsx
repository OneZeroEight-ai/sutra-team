"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface AgentPerspective {
  agent_name?: string;
  name?: string;
  response?: string;
  response_text?: string;
}

interface DeliberationResult {
  synthesis?: string;
  perspectives?: AgentPerspective[];
  credits?: { remaining: number; deducted: number };
}

export default function DeliberatePage() {
  return (
    <Suspense>
      <DeliberateContent />
    </Suspense>
  );
}

function DeliberateContent() {
  const { isSignedIn } = useAuth();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DeliberationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credits, setCredits] = useState<number | null>(null);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);

  // Load credits
  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/credits")
      .then((r) => r.json())
      .then((data) => setCredits(data.credits))
      .catch(() => {});
  }, [isSignedIn]);

  // Handle post-purchase redirect
  useEffect(() => {
    if (searchParams.get("purchased") === "true") {
      setShowPurchaseSuccess(true);
      window.history.replaceState({}, "", "/council/deliberate");
      // Refresh credits
      fetch("/api/credits")
        .then((r) => r.json())
        .then((data) => setCredits(data.credits))
        .catch(() => {});
    }
  }, [searchParams]);

  async function handleSubmit() {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/council/deliberate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          councilMode: "rights",
          outputFormat: "structured",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setError("No credits remaining.");
          setCredits(0);
          return;
        }
        setError(data.error || "Deliberation failed");
        return;
      }

      setResult(data);
      if (data.credits?.remaining !== undefined) {
        setCredits(data.credits.remaining);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    credits !== null && credits > 0 && query.trim().length > 0 && !loading;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-semibold">Council of Rights</h1>
            <p className="text-sm text-zinc-500">
              8 agents · Noble Eightfold Path · Sutra synthesis
            </p>
          </div>
          {credits !== null && (
            <div
              className={`text-sm px-3 py-1 rounded-full ${
                credits > 5
                  ? "bg-zinc-800 text-zinc-400"
                  : credits > 0
                    ? "bg-amber-900/50 text-amber-400 border border-amber-500/30"
                    : "bg-red-900/50 text-red-400 border border-red-500/30"
              }`}
            >
              {credits} credit{credits !== 1 ? "s" : ""} remaining
            </div>
          )}
        </div>

        {/* Purchase success banner */}
        {showPurchaseSuccess && (
          <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-6 text-sm text-green-300">
            Pilot access activated — 10 deliberations added to your account.
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
                <a
                  href="/pricing"
                  className="text-violet-400 hover:text-violet-300"
                >
                  Purchase credits to continue &rarr;
                </a>
              ) : (
                "1 credit per deliberation · ~30 seconds"
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium py-2 px-6 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Deliberating..." : "Submit to Council"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-sm text-red-400">
            {error}
            {credits === 0 && (
              <a
                href="/pricing"
                className="block mt-2 text-violet-400 hover:text-violet-300"
              >
                &rarr; Purchase more credits
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
            <p className="text-zinc-500 text-sm">
              8 agents deliberating in parallel...
            </p>
          </div>
        )}

        {/* Synthesis */}
        {result?.synthesis && (
          <div className="bg-zinc-900/50 border border-violet-500/20 rounded-xl p-6 mb-6">
            <div className="text-xs text-violet-400 uppercase tracking-wider mb-2">
              Sutra Synthesis
            </div>
            <div className="text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {result.synthesis}
            </div>
          </div>
        )}

        {/* Perspectives */}
        {result?.perspectives && (
          <div className="space-y-2">
            <div className="text-xs text-zinc-600 uppercase tracking-wider mb-2">
              Individual Perspectives
            </div>
            {result.perspectives.map((p) => (
              <details
                key={p.agent_name || p.name}
                className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
              >
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
  );
}
