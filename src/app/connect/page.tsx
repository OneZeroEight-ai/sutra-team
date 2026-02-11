"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectModeSelector } from "@/components/connect/ConnectModeSelector";
import { Card } from "@/components/ui/Card";
import type { CouncilMode, ConnectMode } from "@/lib/types";
import { generateRoomName } from "@/lib/livekit";

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

  function handleModeSelect(connectMode: ConnectMode) {
    if (connectMode === "phone") {
      router.push("/connect/phone");
      return;
    }
    const roomName = generateRoomName(councilMode);
    const params = new URLSearchParams({
      mode: connectMode,
      council: councilMode,
    });
    router.push(`/connect/room/${roomName}?${params.toString()}`);
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
    </>
  );
}
