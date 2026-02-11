"use client";

import { useState } from "react";
import { AgentAvatar } from "./AgentAvatar";
import { TranscriptPanel } from "./TranscriptPanel";
import { RoomControls } from "./RoomControls";
import { RIGHTS_AGENTS, EXPERT_AGENTS } from "@/lib/constants";
import type { CouncilMode } from "@/lib/types";

interface VoiceRoomProps {
  roomId: string;
  councilMode: CouncilMode;
  participantName: string;
  onLeave: () => void;
}

export function VoiceRoom({
  roomId,
  councilMode,
  participantName,
  onLeave,
}: VoiceRoomProps) {
  const [micEnabled, setMicEnabled] = useState(true);

  const agents =
    councilMode === "rights"
      ? RIGHTS_AGENTS
      : councilMode === "experts"
        ? EXPERT_AGENTS
        : [...RIGHTS_AGENTS, ...EXPERT_AGENTS];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 flex overflow-hidden">
        {/* Agent ring */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="flex flex-wrap justify-center gap-6 max-w-2xl">
            {agents.map((agent) => (
              <AgentAvatar
                key={agent.name}
                name={agent.name}
                pathAspect={"path_aspect" in agent ? agent.path_aspect : undefined}
                accentColor={agent.accent_color}
                isSpeaking={false}
                size="md"
              />
            ))}
          </div>
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sutra-border bg-sutra-surface px-4 py-1.5 text-xs text-sutra-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-sutra-gold animate-pulse" />
              Voice Session &middot; {roomId}
            </div>
            <p className="text-xs text-sutra-muted mt-2">
              Connected as {participantName}
            </p>
          </div>
        </div>

        {/* Transcript — full width on mobile, sidebar on desktop */}
        <div className="hidden md:block w-80">
          <TranscriptPanel entries={[]} />
        </div>
      </div>

      <RoomControls
        micEnabled={micEnabled}
        cameraEnabled={false}
        showCamera={false}
        onToggleMic={() => setMicEnabled(!micEnabled)}
        onToggleCamera={() => {}}
        onScreenShare={() => {}}
        onEndSession={onLeave}
      />
    </div>
  );
}
