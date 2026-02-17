"use client";

import Image from "next/image";
import {
  RoomAudioRenderer,
  ControlBar,
  useVoiceAssistant,
  useIsSpeaking,
  useConnectionState,
} from "@livekit/components-react";
import { ConnectionState, type Participant } from "livekit-client";
import { AGENT_AVATARS, RIGHTS_AGENTS } from "@/lib/constants";

interface AgentInfo {
  name: string;
  subtitle: string;
  avatar?: string;
  accentColor: string;
}

interface VoiceSessionViewProps {
  agent: AgentInfo;
  roomId: string;
}

function resolveAvatarFromRoom(roomId: string): {
  avatarSrc: string;
  accentColor: string;
} {
  // Extract slug from roomId: "voice-communicator-1739369452000" → "communicator"
  const withoutPrefix = roomId.replace(/^(voice|video)-/, "");
  const slug = withoutPrefix.replace(/-\d+$/, "");

  // Check AGENT_AVATARS for direct match
  if (AGENT_AVATARS[slug]) {
    const agent = RIGHTS_AGENTS.find((a) => {
      const agentSlug = a.name
        .replace(/^The\s+/i, "")
        .toLowerCase()
        .replace(/\s+/g, "-");
      return agentSlug === slug;
    });
    return {
      avatarSrc: AGENT_AVATARS[slug],
      accentColor: agent?.accent_color ?? "#a78bfa",
    };
  }

  // Fallback to Sutra
  return {
    avatarSrc: "/images/agents/sutra.png",
    accentColor: "#a78bfa",
  };
}

interface ActiveAvatarProps extends VoiceSessionViewProps {
  agentParticipant: Participant;
  voiceState: string;
}

function ActiveAvatar({
  agent,
  roomId,
  agentParticipant,
  voiceState,
}: ActiveAvatarProps) {
  const isSpeaking = useIsSpeaking(agentParticipant);

  const { avatarSrc, accentColor: resolvedColor } =
    resolveAvatarFromRoom(roomId);
  const accentColor = agent.accentColor || resolvedColor;
  const avatarUrl = agent.avatar || avatarSrc;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Avatar with speaking pulse */}
      <div className="relative">
        {/* Outer pulse ring — visible when speaking */}
        <div
          className={`absolute inset-0 rounded-full transition-transform duration-700 ease-in-out ${
            isSpeaking ? "scale-110 opacity-100" : "scale-100 opacity-0"
          }`}
          style={{
            width: 216,
            height: 216,
            top: -8,
            left: -8,
            backgroundColor: `${accentColor}15`,
            border: `2px solid ${accentColor}40`,
          }}
        />

        {/* Inner pulse glow — visible when speaking */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-1000 ease-in-out ${
            isSpeaking ? "opacity-60" : "opacity-0"
          }`}
          style={{
            width: 200,
            height: 200,
            boxShadow: isSpeaking
              ? `0 0 40px 8px ${accentColor}30, 0 0 80px 16px ${accentColor}15`
              : "none",
          }}
        />

        {/* Avatar circle */}
        <div
          className="relative w-[200px] h-[200px] rounded-full overflow-hidden border-[3px] transition-colors duration-300"
          style={{
            borderColor: isSpeaking ? accentColor : `${accentColor}40`,
          }}
        >
          <Image
            src={avatarUrl}
            alt={agent.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Agent info */}
      <div className="text-center">
        <p className="text-lg font-semibold text-[#e4e4e7]">{agent.name}</p>
        <p className="text-sm text-[#71717a] mt-0.5">{agent.subtitle}</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#1e1e2e] bg-[#12121a] px-4 py-1.5 text-xs text-[#71717a]">
          <span
            className={`w-2 h-2 rounded-full ${
              isSpeaking ? "animate-pulse" : ""
            }`}
            style={{
              backgroundColor: isSpeaking ? accentColor : "#22c55e",
            }}
          />
          {voiceState === "connecting"
            ? "Connecting..."
            : voiceState === "listening"
              ? "Listening"
              : isSpeaking
                ? "Speaking"
                : "Connected"}
        </div>
      </div>
    </div>
  );
}

function AgentSpeakingAvatar({ agent, roomId }: VoiceSessionViewProps) {
  const voiceAssistant = useVoiceAssistant();

  if (!voiceAssistant.agent) {
    return <ConnectingAvatar agent={agent} roomId={roomId} />;
  }

  return (
    <ActiveAvatar
      agent={agent}
      roomId={roomId}
      agentParticipant={voiceAssistant.agent}
      voiceState={voiceAssistant.state}
    />
  );
}

function ConnectingAvatar({ agent, roomId }: VoiceSessionViewProps) {
  const { avatarSrc, accentColor: resolvedColor } =
    resolveAvatarFromRoom(roomId);
  const accentColor = agent.accentColor || resolvedColor;
  const avatarUrl = agent.avatar || avatarSrc;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div
          className="relative w-[200px] h-[200px] rounded-full overflow-hidden border-[3px]"
          style={{ borderColor: `${accentColor}40` }}
        >
          <Image
            src={avatarUrl}
            alt={agent.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-[#e4e4e7]">{agent.name}</p>
        <p className="text-sm text-[#71717a] mt-0.5">{agent.subtitle}</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#1e1e2e] bg-[#12121a] px-4 py-1.5 text-xs text-[#71717a]">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
          Connecting...
        </div>
      </div>
    </div>
  );
}

export function VoiceSessionView({ agent, roomId }: VoiceSessionViewProps) {
  const connectionState = useConnectionState();
  const isConnected = connectionState === ConnectionState.Connected;

  return (
    <div className="flex flex-col h-full">
      <RoomAudioRenderer />

      {/* Centered avatar area */}
      <div className="flex-1 flex items-center justify-center">
        {isConnected ? (
          <AgentSpeakingAvatar agent={agent} roomId={roomId} />
        ) : (
          <ConnectingAvatar agent={agent} roomId={roomId} />
        )}
      </div>

      {/* Controls */}
      <div className="pb-4">
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: false,
            screenShare: false,
            leave: true,
          }}
        />
      </div>
    </div>
  );
}
