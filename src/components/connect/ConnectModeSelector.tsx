"use client";

import { Video, Mic, Phone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ConnectMode } from "@/lib/types";

interface ConnectModeSelectorProps {
  onSelect: (mode: ConnectMode) => void;
}

const MODES = [
  {
    mode: "video" as ConnectMode,
    icon: Video,
    title: "Video Room",
    tagline: "Face your council.",
    description:
      "Camera on, see animated agent avatars, screen sharing, full transcript. Best for deep work sessions, presentations, document review.",
    color: "#a78bfa",
  },
  {
    mode: "voice" as ConnectMode,
    icon: Mic,
    title: "Voice Session",
    tagline: "Hands-free wisdom.",
    description:
      "Audio only, agent avatars + live transcript. Best for mobile, walking, driving, multitasking.",
    color: "#06b6d4",
  },
  {
    mode: "phone" as ConnectMode,
    icon: Phone,
    title: "Phone Call",
    tagline: "Dial in from anywhere.",
    description:
      "Call a phone number, IVR routes to your council. No internet required. Best for accessibility, simplicity, on-the-go.",
    color: "#f59e0b",
  },
];

export function ConnectModeSelector({ onSelect }: ConnectModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {MODES.map((m) => (
        <Card key={m.mode} hover className="flex flex-col">
          <div
            className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${m.color}15` }}
          >
            <m.icon className="h-6 w-6" style={{ color: m.color }} />
          </div>
          <h3 className="text-lg font-semibold text-sutra-text">{m.title}</h3>
          <p className="text-sm font-medium mt-1" style={{ color: m.color }}>
            {m.tagline}
          </p>
          <p className="mt-3 text-sm text-sutra-muted leading-relaxed flex-1">
            {m.description}
          </p>
          {m.mode === "phone" ? (
            <Button
              className="mt-5 w-full"
              onClick={() => onSelect(m.mode)}
            >
              View Dial-In Info
            </Button>
          ) : (
            <div className="mt-5">
              <Button className="w-full" disabled>
                {m.title} — Coming Soon
              </Button>
              <p className="mt-2 text-center text-xs text-sutra-muted">
                <a
                  href="/council/deliberate"
                  className="text-sutra-accent hover:underline"
                >
                  Text deliberation available now
                </a>
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
