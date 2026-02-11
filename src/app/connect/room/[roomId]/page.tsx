"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = use(params);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getToken() {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName: roomId,
            participantName: `user-${Date.now()}`,
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
  }, [roomId]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/connect")}
            className="px-6 py-2 border border-[#1e1e2e] rounded-lg text-[#e4e4e7] hover:border-[#a78bfa] transition-colors"
          >
            Back to Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center max-w-lg">
        <h1 className="text-2xl font-bold text-[#e4e4e7] mb-2">
          Room: {roomId}
        </h1>
        <p className="text-[#71717a] mb-6">
          Token acquired. LiveKit room component will mount here once
          @livekit/components-react is installed and configured.
        </p>
        <div className="p-4 bg-[#12121a] rounded-lg border border-[#1e1e2e]">
          <p className="text-xs text-[#71717a] font-mono break-all">
            Token: {token?.slice(0, 40)}...
          </p>
        </div>
      </div>
    </div>
  );
}
