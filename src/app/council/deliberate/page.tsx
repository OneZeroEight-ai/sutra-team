"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useRef, Suspense } from "react";
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
  const [councilMode, setCouncilMode] = useState<
    "rights" | "experts" | "combined"
  >("rights");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set up speech recognition
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognitionCtor =
      w.SpeechRecognition || w.webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          }
        }
        if (finalTranscript) {
          setQuery((prev) => prev + finalTranscript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }

  async function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 50_000) {
      setError(
        "File too large. Please paste the relevant section instead (max 50KB).",
      );
      return;
    }

    const allowedExtensions = [".txt", ".md", ".csv", ".json", ".html"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setError(
        "Unsupported file type. Supported: .txt, .md, .csv, .json, .html",
      );
      return;
    }

    try {
      const text = await file.text();
      const truncated =
        text.length > 4000
          ? text.slice(0, 4000) +
            "\n\n[... truncated, " +
            text.length +
            " total characters]"
          : text;
      setQuery((prev) =>
        prev
          ? prev + "\n\n--- Attached: " + file.name + " ---\n" + truncated
          : truncated,
      );
      setError("");
    } catch {
      setError("Could not read file.");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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
          councilMode,
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
    <div className="min-h-screen bg-black text-white">
      {/* Subtle ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="max-w-2xl mx-auto">
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
              <div
                className={`inline-block text-xs px-3 py-1 rounded-full mt-3 ${
                  credits > 5
                    ? "bg-zinc-800/50 text-zinc-500"
                    : credits > 0
                      ? "bg-amber-900/30 text-amber-400"
                      : "bg-red-900/30 text-red-400"
                }`}
              >
                {credits} credit{credits !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Purchase success banner */}
          {showPurchaseSuccess && (
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-6 text-sm text-green-300">
              Pilot access activated — 10 deliberations added to your account.
            </div>
          )}

          {/* Council Mode Selector */}
          <div className="flex gap-2 mb-4">
            {(["rights", "experts", "combined"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCouncilMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  councilMode === mode
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {mode === "rights" && "Council of Rights"}
                {mode === "experts" && "Council of Experts"}
                {mode === "combined" && "Combined"}
              </button>
            ))}
          </div>

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
            <div className="flex justify-between items-center mt-3">
              <div className="text-xs text-zinc-600">
                {isListening ? (
                  <span className="text-red-400 animate-pulse">
                    Listening... click mic to stop
                  </span>
                ) : credits === 0 ? (
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
              <div className="flex items-center gap-2">
                {/* File attach */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.csv,.json,.html"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  disabled={loading}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition cursor-pointer disabled:opacity-50"
                  title="Attach a text file"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>

                {/* Voice input */}
                {speechSupported && (
                  <button
                    onClick={toggleListening}
                    type="button"
                    className={`p-2 rounded-lg transition cursor-pointer ${
                      isListening
                        ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                    }`}
                    title={isListening ? "Stop recording" : "Voice input"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                  </button>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium py-2 px-6 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? "Deliberating..." : "Submit to Council"}
                </button>
              </div>
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
                  <div className="text-sm font-semibold text-violet-400">
                    Sutra
                  </div>
                  <div className="text-xs text-zinc-600">
                    Synthesis of 8 perspectives
                  </div>
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

          {/* Council Perspectives — collapsed by default */}
          {result?.perspectives && !loading && (
            <details className="group mb-8">
              <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-300 transition flex items-center gap-2 py-3">
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
                How the council deliberated · {result.perspectives.length}{" "}
                perspectives
              </summary>
              <div className="space-y-3 mt-3 pl-6 border-l border-zinc-800">
                {result.perspectives.map((p) => (
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
        </div>
      </div>
    </div>
  );
}
