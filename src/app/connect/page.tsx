"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectModeSelector } from "@/components/connect/ConnectModeSelector";
import { Card } from "@/components/ui/Card";
import type { CouncilMode, ConnectMode } from "@/lib/types";

const COUNCIL_OPTIONS: { mode: CouncilMode; label: string; desc: string }[] = [
  {
    mode: "rights",
    label: "Council of Rights",
    desc: "8 agents grounded in the Noble Eightfold Path",
  },
  {
    mode: "experts",
    label: "Council of Experts",
    desc: "6 domain-specialist agents",
  },
  {
    mode: "combined",
    label: "Combined Council",
    desc: "All 14 agents — Rights + Experts",
  },
];

export default function ConnectPage() {
  const router = useRouter();
  const [councilMode, setCouncilMode] = useState<CouncilMode>("rights");
  const [showComingSoon, setShowComingSoon] = useState(false);

  function handleModeSelect(connectMode: ConnectMode) {
    if (connectMode === "phone") {
      // Phone still coming soon until SIP trunk provisioned
      setShowComingSoon(true);
      return;
    }
    const roomId = `${connectMode}-${Date.now()}`;
    router.push(`/connect/room/${roomId}`);
  }

  return (
    <>
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-sutra-text">
            Connect with Your Council
          </h1>
          <p className="mt-4 text-lg text-sutra-muted max-w-2xl mx-auto">
            Choose how you want to talk to your council. No app install required
            &mdash; pure browser-native WebRTC, or just pick up the phone.
          </p>
        </div>
      </section>

      {/* Council Selection */}
      <section className="pb-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-sutra-text mb-4 text-center">
            Select Council Mode
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COUNCIL_OPTIONS.map((opt) => (
              <button
                key={opt.mode}
                onClick={() => setCouncilMode(opt.mode)}
                className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
                  councilMode === opt.mode
                    ? "border-sutra-accent bg-sutra-accent/5"
                    : "border-sutra-border bg-sutra-surface hover:border-sutra-muted"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    councilMode === opt.mode
                      ? "text-sutra-accent"
                      : "text-sutra-text"
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-sutra-muted mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Mode Selector */}
      <section className="pb-20 border-t border-sutra-border pt-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ConnectModeSelector onSelect={handleModeSelect} />
        </div>
      </section>

      {/* Info bar */}
      <section className="pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <p className="text-xs text-sutra-muted">
              All sessions are powered by{" "}
              <a
                href="https://livekit.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sutra-accent hover:underline"
              >
                LiveKit
              </a>{" "}
              &middot; WebRTC &middot; End-to-end encrypted &middot; No app
              install required
            </p>
          </Card>
        </div>
      </section>

      {/* Coming Soon overlay — phone only */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-sutra-border bg-sutra-surface p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sutra-accent/10">
              <span className="text-xl">📞</span>
            </div>
            <h3 className="text-lg font-semibold text-sutra-text">
              Phone Portal — Coming Soon
            </h3>
            <p className="mt-2 text-sm text-sutra-muted">
              Dial-in phone sessions are launching once the SIP trunk is
              provisioned. Join the waitlist to be first in.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => setShowComingSoon(false)}
                className="cursor-pointer rounded-lg border border-sutra-border bg-sutra-bg px-4 py-2 text-sm text-sutra-text transition-colors hover:bg-sutra-surface"
              >
                Go Back
              </button>
              <a
                href="mailto:jb@onezeroeight.ai?subject=Sutra.team%20Connect%20Waitlist"
                className="rounded-lg bg-sutra-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sutra-accent/80"
              >
                Join Waitlist
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
