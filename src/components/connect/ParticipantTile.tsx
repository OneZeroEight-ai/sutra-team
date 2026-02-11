"use client";

import { AgentAvatar } from "./AgentAvatar";

interface ParticipantTileProps {
  name: string;
  pathAspect?: string;
  accentColor: string;
  isSpeaking: boolean;
  isAgent: boolean;
  perspectiveDelivered?: boolean;
}

export function ParticipantTile({
  name,
  pathAspect,
  accentColor,
  isSpeaking,
  isAgent,
  perspectiveDelivered,
}: ParticipantTileProps) {
  return (
    <div className="rounded-xl border border-sutra-border bg-sutra-surface p-4 flex flex-col items-center justify-center gap-3 aspect-video min-h-[160px]">
      {isAgent ? (
        <>
          <AgentAvatar
            name={name}
            pathAspect={pathAspect}
            accentColor={accentColor}
            isSpeaking={isSpeaking}
          />
          {perspectiveDelivered && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sutra-accent/10 text-sutra-accent">
              Perspective delivered
            </span>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full border-2 border-sutra-accent bg-sutra-bg flex items-center justify-center">
            <span className="text-2xl font-bold text-sutra-accent">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="text-xs font-medium text-sutra-text">{name}</p>
          <p className="text-[10px] text-sutra-muted">You</p>
        </div>
      )}
    </div>
  );
}
