"use client";

import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff } from "lucide-react";

interface RoomControlsProps {
  micEnabled: boolean;
  cameraEnabled: boolean;
  showCamera?: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onScreenShare: () => void;
  onEndSession: () => void;
}

export function RoomControls({
  micEnabled,
  cameraEnabled,
  showCamera = true,
  onToggleMic,
  onToggleCamera,
  onScreenShare,
  onEndSession,
}: RoomControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4 px-6 border-t border-sutra-border bg-sutra-surface">
      <button
        onClick={onToggleMic}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
          micEnabled
            ? "bg-sutra-bg border border-sutra-border text-sutra-text hover:bg-sutra-border"
            : "bg-red-500/20 border border-red-500/40 text-red-400"
        }`}
        aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
      >
        {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </button>

      {showCamera && (
        <button
          onClick={onToggleCamera}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            cameraEnabled
              ? "bg-sutra-bg border border-sutra-border text-sutra-text hover:bg-sutra-border"
              : "bg-red-500/20 border border-red-500/40 text-red-400"
          }`}
          aria-label={cameraEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {cameraEnabled ? (
            <Video className="h-5 w-5" />
          ) : (
            <VideoOff className="h-5 w-5" />
          )}
        </button>
      )}

      <button
        onClick={onScreenShare}
        className="w-12 h-12 rounded-full bg-sutra-bg border border-sutra-border text-sutra-text hover:bg-sutra-border flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Share screen"
      >
        <MonitorUp className="h-5 w-5" />
      </button>

      <button
        onClick={onEndSession}
        className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer ml-4"
        aria-label="End session"
      >
        <PhoneOff className="h-5 w-5" />
      </button>
    </div>
  );
}
