"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect, useRef, Suspense } from "react";

interface AgentPerspective {
  agent: string;
  aspect: string | null;
  perspective: string;
  confidence: number;
  metta_signature: string | null;
  tokens_used: number;
}

interface Synthesis {
  agreements: string[];
  tensions: string[];
  gaps: string[];
  recommendation: string;
  confidence: number;
}

interface DeliberationResult {
  deliberation_id: string;
  query: string;
  council_type: string;
  perspectives: AgentPerspective[];
  synthesis: Synthesis;
  total_tokens: number;
  total_cost_usd: number;
  deliberation_time_ms: number;
  agents_consulted: number;
}

interface CouncilStatus {
  councils: {
    rights: { active: boolean; agent_count: number };
    experts: { active: boolean; agent_count: number };
    combined: { active: boolean; agent_count: number };
  };
  has_synthesis_agent: boolean;
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
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DeliberationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [councilMode, setCouncilMode] = useState<
    "rights" | "experts" | "combined"
  >("combined");
  const [councilStatus, setCouncilStatus] = useState<CouncilStatus | null>(
    null,
  );
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

  // On first load: ensure council exists, get status
  useEffect(() => {
    if (!isSignedIn) return;

    fetch("/api/council/ensure", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.councils) {
          setCouncilStatus({
            councils: data.councils,
            has_synthesis_agent: data.has_synthesis_agent,
          });
        }
      })
      .catch((err) => console.error("[council] Ensure failed:", err));
  }, [isSignedIn]);

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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.detail || "Deliberation failed");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = query.trim().length > 0 && !loading;

  const totalAgents = councilStatus
    ? councilStatus.councils.rights.agent_count +
      councilStatus.councils.experts.agent_count
    : 0;

  const modeDescriptions = {
    rights:
      "8 agents grounded in the Noble Eightfold Path analyze your question from ethical, strategic, and practical angles.",
    experts:
      "6 domain experts (finance, legal, tech, operations, growth, risk) provide specialized analysis.",
    combined:
      "All 14 agents deliberate together, with Sutra synthesizing across ethical and expert perspectives.",
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Subtle ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Council Status Banner */}
          {councilStatus && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-zinc-300">
                    {councilStatus.councils.rights.agent_count} Rights agents
                    {" + "}
                    {councilStatus.councils.experts.agent_count} Experts
                    {councilStatus.has_synthesis_agent && " + Sutra synthesis"}
                    {" = "}
                    <span className="text-white font-medium">
                      {totalAgents +
                        (councilStatus.has_synthesis_agent ? 1 : 0)}{" "}
                      agents ready
                    </span>
                  </span>
                </div>
                <span className="text-xs text-zinc-600">
                  All 8 security layers enforced
                </span>
              </div>
            </div>
          )}

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
              Ask your council anything
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Strategic Decision Intelligence
            </p>
          </div>

          {/* Council Mode Selector */}
          <div className="flex gap-2 mb-2 justify-center">
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
                {mode === "rights" && "Rights Council"}
                {mode === "experts" && "Experts Council"}
                {mode === "combined" && "Combined"}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-600 text-center mb-6">
            {modeDescriptions[councilMode]}
          </p>

          {/* Input */}
          <div className="mb-8">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your decision, dilemma, or strategic question..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-violet-500/30 transition min-h-[100px]"
              rows={3}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSubmit) {
                  handleSubmit();
                }
              }}
            />
            <div className="flex justify-between items-center mt-3">
              <div className="text-xs text-zinc-600">
                {isListening ? (
                  <span className="text-red-400 animate-pulse">
                    Listening... click mic to stop
                  </span>
                ) : (
                  <span>
                    Ctrl+Enter to submit
                  </span>
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
            </div>
          )}

          {/* Loading — Oracle Deliberating */}
          {loading && (
            <div className="text-center py-12">
              <img
                src="/images/oracle.gif"
                alt="Deliberating..."
                className="w-48 h-48 rounded-full object-cover mx-auto mb-6 shadow-2xl shadow-violet-500/20 border border-violet-500/20"
              />
              <p className="text-violet-400 text-sm font-medium animate-pulse">
                The council is deliberating...
              </p>
              <p className="text-zinc-600 text-xs mt-2">
                Consulting {councilMode === "rights" ? "8" : councilMode === "experts" ? "6" : "14"} agents + synthesis
              </p>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-8">
              {/* Synthesis — The Oracle Speaks */}
              {result.synthesis && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="/images/oracle.gif"
                      alt="Sutra"
                      className="w-10 h-10 rounded-full object-cover border border-violet-500/30"
                    />
                    <div>
                      <div className="text-sm font-semibold text-violet-400">
                        Sutra Synthesis
                      </div>
                      <div className="text-xs text-zinc-600">
                        {result.agents_consulted} perspectives analyzed
                      </div>
                    </div>
                  </div>

                  {/* Recommendation — prominent */}
                  {result.synthesis.recommendation && (
                    <div className="bg-zinc-900/50 border border-violet-500/20 rounded-xl p-6 mb-4">
                      <div className="text-xs font-medium text-violet-400 uppercase tracking-wider mb-3">
                        Recommendation
                      </div>
                      <div className="text-zinc-200 whitespace-pre-wrap text-[15px] leading-7">
                        {result.synthesis.recommendation}
                      </div>
                      {result.synthesis.confidence > 0 && (
                        <div className="mt-4 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-500 rounded-full transition-all"
                              style={{
                                width: `${Math.round(result.synthesis.confidence * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500">
                            {Math.round(result.synthesis.confidence * 100)}%
                            confidence
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Agreements / Tensions / Gaps */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {result.synthesis.agreements?.length > 0 && (
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-2">
                          Agreements
                        </div>
                        <ul className="space-y-2">
                          {result.synthesis.agreements.map((a, i) => (
                            <li
                              key={i}
                              className="text-sm text-zinc-400 leading-relaxed"
                            >
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.synthesis.tensions?.length > 0 && (
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-2">
                          Tensions
                        </div>
                        <ul className="space-y-2">
                          {result.synthesis.tensions.map((t, i) => (
                            <li
                              key={i}
                              className="text-sm text-zinc-400 leading-relaxed"
                            >
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.synthesis.gaps?.length > 0 && (
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs font-medium text-rose-400 uppercase tracking-wider mb-2">
                          Gaps
                        </div>
                        <ul className="space-y-2">
                          {result.synthesis.gaps.map((g, i) => (
                            <li
                              key={i}
                              className="text-sm text-zinc-400 leading-relaxed"
                            >
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Agent Perspectives */}
              {result.perspectives?.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-zinc-400 mb-4">
                    Council Perspectives
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.perspectives.map((p) => (
                      <div
                        key={p.agent}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-sm font-medium text-zinc-200">
                              {p.agent}
                            </div>
                            {p.aspect && (
                              <div className="text-xs text-violet-400/80">
                                {p.aspect}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {p.confidence > 0 && (
                              <span className="text-xs text-zinc-600">
                                {Math.round(p.confidence * 100)}%
                              </span>
                            )}
                            {p.metta_signature && (
                              <span
                                className="text-xs text-emerald-600"
                                title="METTA signed"
                              >
                                Signed
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed line-clamp-6">
                          {p.perspective}
                        </div>
                        {p.perspective.length > 400 && (
                          <details className="mt-2">
                            <summary className="text-xs text-violet-400 cursor-pointer hover:text-violet-300">
                              Read full response
                            </summary>
                            <div className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed mt-2">
                              {p.perspective}
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost & Metadata */}
              <div className="flex items-center justify-between text-xs text-zinc-600 border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-4">
                  <span>
                    {result.agents_consulted} agents consulted
                  </span>
                  <span>
                    {result.total_tokens.toLocaleString()} tokens
                  </span>
                  <span>
                    ${result.total_cost_usd.toFixed(4)} USD
                  </span>
                </div>
                <span>
                  {(result.deliberation_time_ms / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
