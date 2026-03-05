"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

// ── Types ──

interface SentinelStats {
  certified: number;
  approved: number;
  caution: number;
  review: number;
  blocked: number;
  avg_score: number;
  total: number;
  last_scan: string;
}

interface RegistrySkill {
  name: string;
  id: string;
  version: string | null;
  category: string;
  description: string;
  certification: string;
  sentinel_score: number;
  last_tested: string;
  sangha: {
    passed: boolean;
    risk_level: string;
    ast_score: number;
    findings: string[];
    dangerous_imports: string[];
    network_calls: string[];
    file_system_access: string[];
  };
  bodhi: {
    executed: boolean;
    sandbox_contained: boolean;
    execution_time_ms: number;
    output_size_bytes: number;
    network_blocked: boolean;
    resource_limit_hit: boolean;
    error: string | null;
  };
  compatibility: {
    anthropic: boolean;
    openai: boolean;
    google: boolean;
    schema_issues: string[];
  };
  notes: string;
}

interface ScanResult {
  job_id: string;
  status: string;
  skill_name: string;
  certification?: string;
  sentinel_score?: number;
  sangha?: Record<string, unknown>;
  bodhi?: Record<string, unknown>;
  compatibility?: Record<string, unknown>;
  score_breakdown?: Record<string, unknown>;
  badge_markdown?: string;
  progress?: {
    sangha: string;
    bodhi: string;
    compat: string;
  };
  result?: Record<string, unknown>;
  error?: string;
}

// ── Constants ──

const REGISTRY_URL =
  "https://raw.githubusercontent.com/OneZeroEight-ai/skill-registry/main/registry.json";

const API_BASE =
  process.env.NEXT_PUBLIC_SENTINEL_API_URL || "https://api.sammasuit.com";

const CERT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CERTIFIED: { bg: "rgba(0,212,255,0.12)", text: "#00d4ff", border: "#00d4ff" },
  APPROVED: { bg: "rgba(139,92,246,0.12)", text: "#8b5cf6", border: "#8b5cf6" },
  CAUTION: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", border: "#f59e0b" },
  REVIEW: { bg: "rgba(100,116,139,0.12)", text: "#64748b", border: "#64748b" },
  BLOCKED: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", border: "#ef4444" },
};

// ── Helpers ──

function certBadge(level: string, score?: number) {
  const c = CERT_COLORS[level] || CERT_COLORS.REVIEW;
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        padding: "2px 10px",
        borderRadius: "4px",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        textTransform: "uppercase" as const,
      }}
    >
      {level}
      {score !== undefined && ` ${score}`}
    </span>
  );
}

function compat(ok: boolean) {
  return ok ? (
    <span style={{ color: "#00d4ff" }}>Y</span>
  ) : (
    <span style={{ color: "#475569" }}>N</span>
  );
}

function scoreBar(score: number, label: string) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          marginBottom: 4,
          fontFamily: "var(--font-jetbrains-mono), monospace",
        }}
      >
        <span style={{ color: "#e2e8f0" }}>{label}</span>
        <span style={{ color: "#475569" }}>{score}/100</span>
      </div>
      <div
        style={{
          height: 6,
          background: "#1a2a4a",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #00d4ff, #8b5cf6)",
            borderRadius: 3,
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

// ── Page ──

export default function SentinelPage() {
  const { isSignedIn, getToken } = useAuth();

  // State
  const [stats, setStats] = useState<SentinelStats | null>(null);
  const [registry, setRegistry] = useState<RegistrySkill[]>([]);
  const [tab, setTab] = useState<"github" | "paste">("github");
  const [githubUrl, setGithubUrl] = useState("");
  const [pasteCode, setPasteCode] = useState("");
  const [skillName, setSkillName] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanProgress, setScanProgress] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "name">("score");
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Fetch registry
  useEffect(() => {
    fetch(REGISTRY_URL)
      .then((r) => r.json())
      .then((data) => {
        setRegistry(data.skills || []);
        const s = data.summary;
        setStats({
          certified: s?.certified || 0,
          approved: s?.approved || 0,
          caution: s?.caution || 0,
          review: s?.review || 0,
          blocked: s?.blocked || 0,
          avg_score: s?.avg_sentinel_score || 0,
          total: s?.total_skills || 0,
          last_scan: data.generated_at || "",
        });
      })
      .catch(() => {});
  }, []);

  // Poll for async jobs
  const pollJob = useCallback(
    async (jobId: string) => {
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        try {
          const res = await fetch(`${API_BASE}/v1/sentinel/job/${jobId}`);
          const data = await res.json();
          if (data.status === "complete") {
            setScanResult({ ...data.result, job_id: jobId, status: "complete" });
            setScanning(false);
            return;
          }
          if (data.status === "failed") {
            setScanResult({
              job_id: jobId,
              status: "failed",
              skill_name: data.skill_name || "unknown",
              error: data.result?.error || "Scan failed",
            });
            setScanning(false);
            return;
          }
          // Update progress
          if (data.progress) {
            const lines: string[] = [];
            if (data.progress.sangha === "complete")
              lines.push("SANGHA  Static analysis complete");
            if (data.progress.bodhi === "complete")
              lines.push("BODHI   Sandbox execution complete");
            if (data.progress.compat === "complete")
              lines.push("COMPAT  Provider compatibility complete");
            setScanProgress(lines);
          }
        } catch {
          /* continue polling */
        }
      }
      setScanning(false);
      setScanResult({
        job_id: jobId,
        status: "failed",
        skill_name: "unknown",
        error: "Scan timed out",
      });
    },
    []
  );

  // Submit
  async function handleSubmit() {
    setScanning(true);
    setScanResult(null);
    setScanProgress([]);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      let body: Record<string, string>;

      if (tab === "github") {
        if (!githubUrl.trim()) return setScanning(false);
        body = { source: "github_url", github_url: githubUrl.trim() };
      } else {
        if (!pasteCode.trim() || !isSignedIn) return setScanning(false);
        const token = await getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
        body = {
          source: "paste",
          source_code: pasteCode,
          skill_name: skillName.trim() || "unnamed-skill",
        };
      }

      const res = await fetch(`${API_BASE}/v1/sentinel/submit`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setScanResult({
          job_id: "",
          status: "failed",
          skill_name: body.skill_name || "unknown",
          error: data.detail || "Submission failed",
        });
        setScanning(false);
        return;
      }

      if (data.status === "complete") {
        setScanResult(data);
        setScanning(false);
      } else if (data.status === "queued" && data.job_id) {
        setScanProgress(["Job queued..."]);
        pollJob(data.job_id);
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (err) {
      setScanResult({
        job_id: "",
        status: "failed",
        skill_name: "unknown",
        error: String(err),
      });
      setScanning(false);
    }
  }

  // Filter + sort registry
  const categories = [...new Set(registry.map((s) => s.category))].sort();
  const filteredSkills = registry
    .filter((s) => {
      if (filterLevel !== "ALL" && s.certification !== filterLevel) return false;
      if (filterCategory && s.category !== filterCategory) return false;
      if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) =>
      sortBy === "score"
        ? b.sentinel_score - a.sentinel_score
        : a.name.localeCompare(b.name)
    );

  const lastScanDate = stats?.last_scan
    ? new Date(stats.last_scan).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "...";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050a1a",
        color: "#e2e8f0",
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      }}
    >
      {/* ━━━ HERO ━━━ */}
      <section
        style={{
          position: "relative",
          minHeight: 480,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/sentinel-hero.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        />
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(5,10,26,0.92) 0%, rgba(5,10,26,0.7) 50%, rgba(5,10,26,0.5) 100%)",
          }}
        />
        {/* Speed lines animation */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0,212,255,0.02) 2deg, transparent 4deg)",
            animation: "sentinel-rotate 120s linear infinite",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "80px 24px 60px",
            width: "100%",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 13,
              color: "#00d4ff",
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            SammaSuit Security
          </div>
          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 800,
              lineHeight: 1.1,
              margin: "0 0 16px",
              background: "linear-gradient(135deg, #e2e8f0 0%, #00d4ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            THE SENTINEL
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "#94a3b8",
              maxWidth: 560,
              lineHeight: 1.6,
              margin: "0 0 32px",
            }}
          >
            Automated skill certification for autonomous AI agents.
            <br />
            SANGHA static analysis + BODHI sandbox execution + provider
            compatibility.
          </p>

          {/* Stats bar */}
          {stats && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <StatBadge
                value={stats.certified}
                label="CERTIFIED"
                color="#00d4ff"
              />
              <StatBadge
                value={stats.approved}
                label="APPROVED"
                color="#8b5cf6"
              />
              <StatBadge
                value={stats.blocked}
                label="BLOCKED"
                color="#ef4444"
              />
              <StatBadge
                value={stats.avg_score}
                label="AVG SCORE"
                color="#3b82f6"
                decimal
              />
              <span
                style={{
                  fontSize: 12,
                  color: "#475569",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                Last scan: {lastScanDate}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ━━━ SUBMIT SECTION ━━━ */}
      <section
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 24,
            color: "#e2e8f0",
          }}
        >
          Test a Skill
        </h2>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 24,
            borderBottom: "1px solid #1a2a4a",
          }}
        >
          {(["github", "paste"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "none",
                borderBottom:
                  tab === t ? "2px solid #00d4ff" : "2px solid transparent",
                color: tab === t ? "#00d4ff" : "#475569",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: 0.5,
                textTransform: "uppercase",
                transition: "all 0.2s",
              }}
            >
              {t === "github" ? "GitHub URL" : "Paste Source"}
            </button>
          ))}
        </div>

        {/* GitHub URL tab */}
        {tab === "github" && (
          <div>
            <input
              type="text"
              placeholder="https://github.com/org/repo/blob/main/skill.py"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "#0a1628",
                border: "1px solid #1a2a4a",
                borderRadius: 8,
                color: "#e2e8f0",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 14,
                outline: "none",
                marginBottom: 8,
                caretColor: "#00d4ff",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "#00d4ff")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "#1a2a4a")
              }
            />
            <p style={{ fontSize: 12, color: "#475569", marginBottom: 16 }}>
              Paste a direct link to a Python skill file on GitHub
            </p>
          </div>
        )}

        {/* Paste tab */}
        {tab === "paste" && (
          <div>
            {!isSignedIn ? (
              <div
                style={{
                  padding: 32,
                  background: "#0a1628",
                  border: "1px solid #1a2a4a",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#94a3b8", marginBottom: 16 }}>
                  Sign in to test private skills
                </p>
                <a
                  href="/sign-in"
                  style={{
                    color: "#00d4ff",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  Sign in to sutra.team &rarr;
                </a>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Skill name (for the report)"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "#0a1628",
                    border: "1px solid #1a2a4a",
                    borderRadius: 8,
                    color: "#e2e8f0",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 13,
                    outline: "none",
                    marginBottom: 12,
                    caretColor: "#00d4ff",
                  }}
                />
                <textarea
                  placeholder="# Paste your Python skill source code here..."
                  value={pasteCode}
                  onChange={(e) => setPasteCode(e.target.value)}
                  rows={18}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "#0a1628",
                    border: "1px solid #1a2a4a",
                    borderRadius: 8,
                    color: "#e2e8f0",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 13,
                    outline: "none",
                    resize: "vertical",
                    marginBottom: 8,
                    caretColor: "#00d4ff",
                    lineHeight: 1.6,
                  }}
                />
                <p style={{ fontSize: 12, color: "#475569", marginBottom: 16 }}>
                  Requires a sutra.team account. Results are private.
                </p>
              </>
            )}
          </div>
        )}

        {/* Submit button */}
        {(tab === "github" || isSignedIn) && (
          <button
            onClick={handleSubmit}
            disabled={scanning}
            style={{
              width: "100%",
              padding: "14px",
              background: scanning
                ? "#1a2a4a"
                : "linear-gradient(135deg, #059669, #00d4ff)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 15,
              fontWeight: 700,
              cursor: scanning ? "wait" : "pointer",
              letterSpacing: 1,
              textTransform: "uppercase",
              transition: "all 0.3s",
              opacity: scanning ? 0.6 : 1,
            }}
          >
            {scanning ? "SCANNING..." : "RUN SENTINEL"}
          </button>
        )}

        {/* ━━━ RESULTS PANEL ━━━ */}
        <div ref={resultRef}>
          {(scanning || scanResult) && (
            <div
              style={{
                marginTop: 32,
                background: "#0a1628",
                border: "1px solid #1a2a4a",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 0 30px rgba(0,212,255,0.05)",
              }}
            >
              {scanning && !scanResult && (
                <>
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#00d4ff",
                      marginBottom: 16,
                    }}
                  >
                    SCANNING:{" "}
                    {tab === "github"
                      ? githubUrl.split("/").pop()
                      : skillName || "unnamed-skill"}
                  </div>
                  {/* Progress bar */}
                  <div
                    style={{
                      height: 4,
                      background: "#1a2a4a",
                      borderRadius: 2,
                      overflow: "hidden",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(95, 30 + scanProgress.length * 25)}%`,
                        background: "linear-gradient(90deg, #00d4ff, #8b5cf6)",
                        borderRadius: 2,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                  {scanProgress.map((line, i) => (
                    <div
                      key={i}
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 12,
                        color: "#94a3b8",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ color: "#00d4ff" }}>&#10003;</span> {line}
                    </div>
                  ))}
                  <div
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 12,
                      color: "#475569",
                      marginTop: 8,
                    }}
                  >
                    &#9676; Running analysis...
                  </div>
                </>
              )}

              {scanResult && scanResult.status === "complete" && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#e2e8f0",
                      }}
                    >
                      RESULT: {scanResult.skill_name}
                    </div>
                    {certBadge(
                      scanResult.certification || "REVIEW",
                      scanResult.sentinel_score
                    )}
                  </div>

                  {scoreBar(
                    (scanResult.sangha as Record<string, number>)?.ast_score || 0,
                    "SANGHA"
                  )}
                  {scoreBar(
                    scanResult.score_breakdown
                      ? Math.round(
                          ((scanResult.score_breakdown as Record<string, number>)
                            .bodhi_component || 0) /
                            0.35
                        )
                      : 0,
                    "BODHI"
                  )}
                  {scoreBar(
                    scanResult.score_breakdown
                      ? Math.round(
                          ((scanResult.score_breakdown as Record<string, number>)
                            .compat_component || 0) /
                            0.25
                        )
                      : 0,
                    "COMPAT"
                  )}

                  {/* Provider compat */}
                  <div
                    style={{
                      marginTop: 16,
                      fontSize: 13,
                      color: "#94a3b8",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                    }}
                  >
                    Provider compatibility:{" "}
                    <span style={{ marginLeft: 8 }}>
                      Anthropic{" "}
                      {compat(
                        !!(scanResult.compatibility as Record<string, boolean>)?.anthropic
                      )}
                    </span>
                    <span style={{ marginLeft: 16 }}>
                      OpenAI{" "}
                      {compat(
                        !!(scanResult.compatibility as Record<string, boolean>)?.openai
                      )}
                    </span>
                    <span style={{ marginLeft: 16 }}>
                      Google{" "}
                      {compat(
                        !!(scanResult.compatibility as Record<string, boolean>)?.google
                      )}
                    </span>
                  </div>

                  {/* Findings */}
                  {scanResult.sangha && (
                    <div
                      style={{
                        marginTop: 16,
                        fontSize: 13,
                        color: "#94a3b8",
                      }}
                    >
                      Findings:{" "}
                      {(
                        (scanResult.sangha as Record<string, string[]>).findings || []
                      ).length === 0
                        ? "No critical issues detected."
                        : (
                            (scanResult.sangha as Record<string, string[]>).findings || []
                          ).join("; ")}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginTop: 24,
                    }}
                  >
                    <button
                      onClick={() => {
                        const md =
                          scanResult.badge_markdown ||
                          `[![Sentinel ${scanResult.certification}](https://img.shields.io/badge/sentinel-${(scanResult.certification || "review").toLowerCase()}-00d084)](https://sutra.team/sentinel)`;
                        navigator.clipboard.writeText(md);
                      }}
                      style={{
                        padding: "10px 20px",
                        background: "#0a1628",
                        border: "1px solid #1a2a4a",
                        borderRadius: 6,
                        color: "#00d4ff",
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      COPY BADGE MARKDOWN
                    </button>
                  </div>
                </>
              )}

              {scanResult && scanResult.status === "failed" && (
                <div style={{ color: "#ef4444", fontSize: 14 }}>
                  <strong>Scan failed:</strong> {scanResult.error || "Unknown error"}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ━━━ REGISTRY TABLE ━━━ */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 24px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 20,
              fontWeight: 700,
              color: "#e2e8f0",
              margin: 0,
            }}
          >
            Certified Skills
          </h2>
          <span
            style={{
              fontSize: 12,
              color: "#475569",
              fontFamily: "var(--font-jetbrains-mono), monospace",
            }}
          >
            Last updated: {lastScanDate} &mdash; updates twice daily
          </span>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          {/* Level tabs */}
          {["ALL", "CERTIFIED", "APPROVED", "BLOCKED"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              style={{
                padding: "6px 14px",
                background:
                  filterLevel === lvl ? "rgba(0,212,255,0.1)" : "transparent",
                border: `1px solid ${filterLevel === lvl ? "#00d4ff" : "#1a2a4a"}`,
                borderRadius: 6,
                color: filterLevel === lvl ? "#00d4ff" : "#475569",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: 0.5,
              }}
            >
              {lvl}
            </button>
          ))}

          {/* Category dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: "6px 12px",
              background: "#0a1628",
              border: "1px solid #1a2a4a",
              borderRadius: 6,
              color: "#94a3b8",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "6px 12px",
              background: "#0a1628",
              border: "1px solid #1a2a4a",
              borderRadius: 6,
              color: "#e2e8f0",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 12,
              outline: "none",
              minWidth: 180,
              caretColor: "#00d4ff",
            }}
          />

          {/* Sort */}
          <button
            onClick={() => setSortBy(sortBy === "score" ? "name" : "score")}
            style={{
              padding: "6px 12px",
              background: "transparent",
              border: "1px solid #1a2a4a",
              borderRadius: 6,
              color: "#475569",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Sort: {sortBy === "score" ? "Score" : "Name"}
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #1a2a4a",
                  color: "#475569",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Skill</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Score</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Category</th>
                <th style={{ padding: "10px 8px", fontWeight: 600 }}>Anthropic</th>
                <th style={{ padding: "10px 8px", fontWeight: 600 }}>OpenAI</th>
                <th style={{ padding: "10px 8px", fontWeight: 600 }}>Google</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Tested</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map((skill) => (
                <SkillRow
                  key={skill.name}
                  skill={skill}
                  expanded={expandedSkill === skill.name}
                  onToggle={() =>
                    setExpandedSkill(
                      expandedSkill === skill.name ? null : skill.name
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredSkills.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#475569",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 13,
            }}
          >
            No skills match your filters.
          </div>
        )}
      </section>

      {/* ━━━ HOW IT WORKS FOOTER ━━━ */}
      <section
        style={{
          borderTop: "1px solid #1a2a4a",
          padding: "64px 24px",
          background: "#050a1a",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 8,
              color: "#e2e8f0",
            }}
          >
            How It Works
          </h2>
          <div
            style={{
              height: 2,
              width: 60,
              background: "linear-gradient(90deg, #00d4ff, #8b5cf6)",
              marginBottom: 32,
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              marginBottom: 40,
            }}
          >
            <StageCard
              title="SANGHA"
              subtitle="Static Analysis"
              description="AST scanning for dangerous imports, network calls, filesystem access, code injection patterns, and prototype pollution. 40% of score."
              color="#00d4ff"
            />
            <StageCard
              title="BODHI"
              subtitle="Sandbox Execution"
              description="Executes skill in isolated subprocess with network blocked, resource limits enforced, and output capped at 10KB. 35% of score."
              color="#8b5cf6"
            />
            <StageCard
              title="COMPAT"
              subtitle="Provider Check"
              description="Validates tool schema against Anthropic, OpenAI, and Google Gemini function calling formats. 25% of score."
              color="#3b82f6"
            />
          </div>

          <p
            style={{
              fontSize: 13,
              color: "#475569",
              lineHeight: 1.8,
              marginBottom: 24,
            }}
          >
            The Sentinel runs automatically twice daily. Skills are re-certified on
            every run. Scores may change as the scanner improves. For full testing
            methodology, see{" "}
            <a
              href="https://github.com/OneZeroEight-ai/skill-registry/blob/main/METHODOLOGY.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#00d4ff", textDecoration: "none" }}
            >
              METHODOLOGY.md
            </a>
            .
          </p>

          <a
            href="https://github.com/OneZeroEight-ai/skill-registry"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "transparent",
              border: "1px solid #1a2a4a",
              borderRadius: 8,
              color: "#e2e8f0",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            VIEW REGISTRY ON GITHUB &rarr;
          </a>
        </div>
      </section>

      {/* ━━━ CSS Animation ━━━ */}
      <style jsx global>{`
        @keyframes sentinel-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ──

function StatBadge({
  value,
  label,
  color,
  decimal,
}: {
  value: number;
  label: string;
  color: string;
  decimal?: boolean;
}) {
  return (
    <div
      style={{
        padding: "8px 16px",
        background: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 20,
          fontWeight: 700,
          color,
        }}
      >
        {decimal ? value.toFixed(1) : value}
      </span>
      <span
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 10,
          fontWeight: 600,
          color: "#475569",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function StageCard({
  title,
  subtitle,
  description,
  color,
}: {
  title: string;
  subtitle: string;
  description: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: 24,
        background: "#0a1628",
        border: "1px solid #1a2a4a",
        borderRadius: 12,
        borderTop: `2px solid ${color}`,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 16,
          fontWeight: 700,
          color,
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 12,
          color: "#94a3b8",
          marginBottom: 12,
        }}
      >
        {subtitle}
      </div>
      <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>
        {description}
      </p>
    </div>
  );
}

function SkillRow({
  skill,
  expanded,
  onToggle,
}: {
  skill: RegistrySkill;
  expanded: boolean;
  onToggle: () => void;
}) {
  const testedDate = skill.last_tested
    ? new Date(skill.last_tested).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "-";

  return (
    <>
      <tr
        onClick={onToggle}
        style={{
          borderBottom: "1px solid #0f1d35",
          cursor: "pointer",
          transition: "background 0.15s",
          background: expanded ? "rgba(0,212,255,0.03)" : "transparent",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(0,212,255,0.04)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = expanded
            ? "rgba(0,212,255,0.03)"
            : "transparent")
        }
      >
        <td style={{ padding: "12px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {certBadge(skill.certification)}
            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
              {skill.name}
            </span>
          </div>
        </td>
        <td style={{ padding: "12px 12px", color: "#00d4ff", fontWeight: 600 }}>
          {skill.sentinel_score}
        </td>
        <td style={{ padding: "12px 12px", color: "#475569" }}>
          {skill.category}
        </td>
        <td style={{ padding: "12px 8px", textAlign: "center" }}>
          {compat(skill.compatibility.anthropic)}
        </td>
        <td style={{ padding: "12px 8px", textAlign: "center" }}>
          {compat(skill.compatibility.openai)}
        </td>
        <td style={{ padding: "12px 8px", textAlign: "center" }}>
          {compat(skill.compatibility.google)}
        </td>
        <td style={{ padding: "12px 12px", color: "#475569" }}>{testedDate}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} style={{ padding: "0 12px 16px" }}>
            <div
              style={{
                padding: 20,
                background: "#0a1628",
                border: "1px solid #1a2a4a",
                borderRadius: 8,
                marginTop: 4,
              }}
            >
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
                {skill.description}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>
                    SANGHA
                  </div>
                  {scoreBar(skill.sangha.ast_score, `Risk: ${skill.sangha.risk_level}`)}
                  {skill.sangha.findings.length > 0 && (
                    <div style={{ fontSize: 11, color: "#f59e0b" }}>
                      {skill.sangha.findings.length} finding(s)
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>
                    BODHI
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    {skill.bodhi.executed ? "Executed" : "Skipped"}
                    {skill.bodhi.execution_time_ms > 0 &&
                      ` (${skill.bodhi.execution_time_ms}ms)`}
                  </div>
                  {skill.bodhi.error && (
                    <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
                      {skill.bodhi.error}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>
                    COMPAT
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    Anthropic: {compat(skill.compatibility.anthropic)} &nbsp;
                    OpenAI: {compat(skill.compatibility.openai)} &nbsp;
                    Google: {compat(skill.compatibility.google)}
                  </div>
                  {skill.compatibility.schema_issues.length > 0 && (
                    <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4 }}>
                      {skill.compatibility.schema_issues.join(", ")}
                    </div>
                  )}
                </div>
              </div>
              {skill.notes && (
                <div style={{ fontSize: 12, color: "#475569", marginTop: 12 }}>
                  {skill.notes}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
