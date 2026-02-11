"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
  AudioConference,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
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
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#a78bfa] mx-auto mb-4" />
          <p className="text-[#71717a]">Connecting to council room...</p>
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
    <div className="min-h-screen bg-[#0a0a0f]" data-lk-theme="default">
      <LiveKitRoom
        serverUrl={livekitUrl}
        token={token}
        connect={true}
        video={!isVoice}
        audio={true}
        onDisconnected={handleDisconnected}
        style={{ height: "100vh" }}
      >
        {isVoice ? <AudioConference /> : <VideoConference />}
      </LiveKitRoom>
    </div>
  );
}
