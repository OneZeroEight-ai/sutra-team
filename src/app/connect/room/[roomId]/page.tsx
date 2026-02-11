"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { VideoRoom } from "@/components/connect/VideoRoom";
import { VoiceRoom } from "@/components/connect/VoiceRoom";
import type { CouncilMode, ConnectMode } from "@/lib/types";

function RoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = params.roomId as string;
  const connectMode = (searchParams.get("mode") ?? "video") as ConnectMode;
  const councilMode = (searchParams.get("council") ?? "rights") as CouncilMode;
  const participantName = "You";

  function handleLeave() {
    router.push("/connect");
  }

  if (connectMode === "voice") {
    return (
      <VoiceRoom
        roomId={roomId}
        councilMode={councilMode}
        participantName={participantName}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <VideoRoom
      roomId={roomId}
      councilMode={councilMode}
      participantName={participantName}
      onLeave={handleLeave}
    />
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-sm text-sutra-muted">
            Connecting to room...
          </div>
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
