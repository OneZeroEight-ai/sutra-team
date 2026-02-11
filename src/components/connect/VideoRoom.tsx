"use client";

import { useState } from "react";
import { ParticipantTile } from "./ParticipantTile";
import { TranscriptPanel } from "./TranscriptPanel";
import { RoomControls } from "./RoomControls";
import { RIGHTS_AGENTS, EXPERT_AGENTS } from "@/lib/constants";
import type { CouncilMode } from "@/lib/types";

interface VideoRoomProps {
  roomId: string;
  councilMode: CouncilMode;
  participantName: string;
  onLeave: () => void;
}

export function VideoRoom({
  roomId,
  councilMode,
  participantName,
  onLeave,
}: VideoRoomProps) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const agents =
    councilMode === "rights"
      ? RIGHTS_AGENTS
      : councilMode === "experts"
        ? EXPERT_AGENTS
        : [...RIGHTS_AGENTS, ...EXPERT_AGENTS];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <ParticipantTile
              name={participantName}
              accentColor="#a78bfa"
              isSpeaking={false}
              isAgent={false}
            />
            {agents.map((agent) => (
              <ParticipantTile
                key={agent.name}
                name={agent.name}
                pathAspect={"path_aspect" in agent ? agent.path_aspect : undefined}
                accentColor={agent.accent_color}
                isSpeaking={false}
                isAgent={true}
                perspectiveDelivered={false}
              />
            ))}
          </div>
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sutra-border bg-sutra-surface px-4 py-1.5 text-xs text-sutra-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-sutra-gold animate-pulse" />
              Room: {roomId} &middot;{" "}
              {councilMode === "combined"
                ? "Combined Council"
                : councilMode === "rights"
                  ? "Council of Rights"
                  : "Council of Experts"}
            </div>
          </div>
        </div>

        {/* Transcript sidebar */}
        <div className="hidden lg:block w-80">
          <TranscriptPanel entries={[]} />
        </div>
      </div>

      <RoomControls
        micEnabled={micEnabled}
        cameraEnabled={cameraEnabled}
        showCamera={true}
        onToggleMic={() => setMicEnabled(!micEnabled)}
        onToggleCamera={() => setCameraEnabled(!cameraEnabled)}
        onScreenShare={() => {}}
        onEndSession={onLeave}
      />
    </div>
  );
}
