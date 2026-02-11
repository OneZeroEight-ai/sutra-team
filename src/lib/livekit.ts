import type { CouncilMode } from "./types";

export async function fetchRoomToken(
  roomName: string,
  participantName: string,
  councilMode: CouncilMode
): Promise<string> {
  const res = await fetch("/api/livekit/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomName, participantName, councilMode }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch room token: ${res.status}`);
  }
  const data = await res.json();
  return data.token;
}

export function generateRoomName(councilMode: CouncilMode): string {
  const id = Math.random().toString(36).substring(2, 10);
  return `council-${councilMode}-${id}`;
}

export const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";
