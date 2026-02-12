"use client";

import { use, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { RIGHTS_AGENTS, AGENT_AVATARS } from "@/lib/constants";
import { VoiceSessionView } from "@/components/connect/VoiceSessionView";

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

function resolveAgent(roomId: string) {
  // Extract slug from roomId like "voice-communicator" or "video-wisdom-judge"
  const slug = roomId.replace(/^(voice|video)-/, "");

  // Try to match against Rights agents
  for (const agent of RIGHTS_AGENTS) {
    const agentSlug = agent.name
      .replace(/^The\s+/i, "")
      .toLowerCase()
      .replace(/\s+/g, "-");
    if (agentSlug === slug) {
      return {
        name: agent.name,
        subtitle: `${agent.path_aspect} (${agent.pali_name})`,
        avatar: AGENT_AVATARS[agentSlug],
        accentColor: agent.accent_color,
      };
    }
  }

  // Default to The Communicator for generic rooms
  return {
    name: "The Communicator",
    subtitle: "Right Speech (Samma Vaca)",
    avatar: AGENT_AVATARS["communicator"],
    accentColor: "#6366f1",
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isVoice = roomId.startsWith("voice-");
  const councilMode = searchParams.get("council") ?? "rights";
  const agent = useMemo(() => resolveAgent(roomId), [roomId]);

  useEffect(() => {
    async function getToken() {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: roomId,
            participantName: `user-${Date.now()}`,
            metadata: JSON.stringify({ councilMode }),
          }),
        });

        if (!res.ok) {
          throw new Error(`Token request failed: ${res.status}`);
        }

        const data = await res.json();
        setToken(data.token);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join room");
      } finally {
        setLoading(false);
      }
    }

    getToken();
  }, [roomId, councilMode]);

  const handleDisconnected = useCallback(() => {
    router.push("/connect");
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          {agent.avatar && (
            <div
              className="relative w-16 h-16 rounded-full overflow-hidden ring-2 mx-auto mb-4"
              style={{ ["--tw-ring-color" as string]: agent.accentColor }}
            >
              <Image
                src={agent.avatar}
                alt={agent.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#a78bfa] mx-auto mb-3" />
          <p className="text-[#e4e4e7] text-sm font-medium">{agent.name}</p>
          <p className="text-[#71717a] text-xs mt-1">Connecting...</p>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">{error ?? "No token received"}</p>
          <button
            onClick={() => router.push("/connect")}
            className="px-6 py-2 border border-[#1e1e2e] rounded-lg text-[#e4e4e7] hover:border-[#a78bfa] transition-colors cursor-pointer"
          >
            Back to Connect
          </button>
        </div>
      </div>
    );
  }

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!livekitUrl) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-red-400">LiveKit URL not configured</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col" data-lk-theme="default">
      {/* Agent header bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e2e] bg-[#12121a]">
        {agent.avatar && (
          <div
            className="relative w-10 h-10 rounded-full overflow-hidden ring-2 shrink-0"
            style={{ ["--tw-ring-color" as string]: agent.accentColor }}
          >
            <Image
              src={agent.avatar}
              alt={agent.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#e4e4e7] truncate">
            {agent.name}
          </p>
          <p className="text-xs text-[#71717a] truncate">{agent.subtitle}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-[#71717a]">Live</span>
        </div>
      </div>

      {/* LiveKit room */}
      <div className="flex-1">
        <LiveKitRoom
          serverUrl={livekitUrl}
          token={token}
          connect={true}
          video={!isVoice}
          audio={true}
          onDisconnected={handleDisconnected}
          style={{ height: "100%" }}
        >
          {isVoice ? (
            <VoiceSessionView agent={agent} roomId={roomId} />
          ) : (
            <VideoConference />
          )}
        </LiveKitRoom>
      </div>
    </div>
  );
}
