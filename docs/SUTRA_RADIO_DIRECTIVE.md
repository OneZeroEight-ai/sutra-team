# SUTRA RADIO & SESSION INTRO DIRECTIVE

**Context:** Sutra.team has original music (Sutra and the Noble 8, 4 albums, 40+ tracks). 5 WAV files from the NeoSoul album are in `server/agents/assets/music/`. This directive builds two features: a session intro chime that plays at the start of every voice/phone session, and an always-on radio station streaming Sutra's music.

---

## Part 1: Session Intro Chime

### Purpose
Cover the 3-5 seconds of WebRTC/SIP connection jitter at the start of every session with intentional, branded audio instead of static or silence.

### Implementation

**Step 1: Generate intro clip**

Create a script at `server/agents/scripts/create_intro.py`:

```python
"""
Create a 5-second intro clip from the first available Sutra track.
Picks the track with the smoothest/softest opening, fades in over 1s,
holds for 3s, fades out over 1s.
"""
import subprocess
import sys
from pathlib import Path

MUSIC_DIR = Path(__file__).parent.parent / "assets" / "music"
INTRO_PATH = Path(__file__).parent.parent / "assets" / "intro.wav"

def find_best_intro_track():
    """Find WAV files and pick one. Prefer tracks with 'neo' or 'soul' in name."""
    wavs = sorted(MUSIC_DIR.glob("*.wav"))
    if not wavs:
        print("ERROR: No WAV files found in", MUSIC_DIR)
        sys.exit(1)
    
    # Prefer tracks with keywords suggesting mellow/smooth opening
    preferred_keywords = ["neo", "soul", "harmony", "lotus", "peace", "dream", "float"]
    for wav in wavs:
        name_lower = wav.stem.lower()
        if any(kw in name_lower for kw in preferred_keywords):
            return wav
    
    # Fall back to first track
    return wavs[0]

def create_intro(track_path: Path):
    """Extract first 5 seconds with fade in/out using ffmpeg."""
    print(f"Creating intro from: {track_path.name}")
    
    cmd = [
        "ffmpeg", "-y",
        "-i", str(track_path),
        "-t", "5",                          # 5 seconds
        "-af", "afade=t=in:st=0:d=1.5,afade=t=out:st=3.5:d=1.5",  # Fade in 1.5s, fade out 1.5s
        "-ar", "48000",                     # 48kHz sample rate (LiveKit standard)
        "-ac", "1",                          # Mono
        str(INTRO_PATH),
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("ffmpeg error:", result.stderr)
        sys.exit(1)
    
    print(f"Intro clip created: {INTRO_PATH} ({INTRO_PATH.stat().st_size / 1024:.0f} KB)")

if __name__ == "__main__":
    track = find_best_intro_track()
    create_intro(track)
```

Run this once on the agent server (or locally if ffmpeg is installed):
```bash
pip install --break-system-packages ffmpeg-python  # if needed
python server/agents/scripts/create_intro.py
```

This creates `server/agents/assets/intro.wav` — a 5-second fade-in/fade-out clip.

**Step 2: Play intro at session start**

Update `server/agents/council_agent.py` to play the intro clip before the agent greeting.

Add to imports:
```python
import wave
import numpy as np
from livekit import rtc
from pathlib import Path

INTRO_PATH = Path(__file__).parent / "assets" / "intro.wav"
```

Add a function to play audio into the room:
```python
async def play_intro(room: rtc.Room):
    """Play the intro chime into the LiveKit room before the agent speaks."""
    if not INTRO_PATH.exists():
        return  # Skip if no intro file — don't break the session
    
    try:
        # Create an audio source
        source = rtc.AudioSource(48000, 1)  # 48kHz mono
        track = rtc.LocalAudioTrack.create_audio_track("intro", source)
        
        options = rtc.TrackPublishOptions()
        options.source = rtc.TrackSource.SOURCE_MICROPHONE
        
        publication = await room.local_participant.publish_track(track, options)
        
        # Read WAV file and push frames
        with wave.open(str(INTRO_PATH), 'rb') as wf:
            sample_rate = wf.getframerate()
            channels = wf.getnchannels()
            
            # Read in chunks of 20ms (960 samples at 48kHz)
            chunk_size = sample_rate // 50  # 20ms frames
            
            while True:
                raw_data = wf.readframes(chunk_size)
                if not raw_data:
                    break
                
                # Convert to int16 numpy array
                samples = np.frombuffer(raw_data, dtype=np.int16)
                
                frame = rtc.AudioFrame(
                    data=samples.tobytes(),
                    sample_rate=sample_rate,
                    num_channels=channels,
                    samples_per_channel=len(samples) // channels,
                )
                await source.capture_frame(frame)
        
        # Small pause after intro before agent speaks
        import asyncio
        await asyncio.sleep(0.5)
        
        # Unpublish the intro track
        await room.local_participant.unpublish_track(publication.sid)
        
    except Exception as e:
        # Never let intro playback break the session
        print(f"Intro playback error (non-fatal): {e}")
```

In the entrypoint, call `play_intro` before starting the agent session:
```python
@server.rtc_session()
async def entrypoint(ctx: JobContext):
    # ... existing setup ...
    
    # Play intro chime while connection stabilizes
    await play_intro(ctx.room)
    
    # Now start the agent session (existing code)
    await session.start(agent=council_agent, room=ctx.room)
    await session.generate_reply(instructions=greeting)
```

**Note:** The exact LiveKit Agents SDK API for raw audio playback may differ from the above pseudocode. Check the LiveKit Python SDK docs for `AudioSource` and `LocalAudioTrack` usage. The key pattern is: publish a temporary audio track, push WAV frames into it, unpublish when done. If the SDK doesn't support this cleanly, an alternative is to have Cartesia TTS speak a brief "Welcome to Sutra" with a 2-second leading pause, which is simpler but less branded.

---

## Part 2: Sutra Radio Station

### Architecture

A lightweight Python process that:
1. Runs as a separate service on Railway (or as a second process on the existing agent server)
2. Creates a persistent LiveKit room called `radio-sutra`
3. Publishes audio by looping through all available tracks
4. Listeners join in listen-only mode via the web UI

### Cost Analysis

| Component | Cost | Notes |
|---|---|---|
| LiveKit room (always on) | ~$0.02/participant-min | Only costs when listeners are connected |
| Railway process | ~$0-5/mo | Minimal CPU — just reading files and pushing frames |
| LLM / STT / TTS | $0 | None needed |
| Storage | 0 | Files on disk |

**With 0 listeners:** ~$0/month (room exists but no participant-minutes billed)
**With 1 listener 24/7:** ~$0.02 × 60 × 24 × 30 = ~$864/month (unlikely edge case)
**With 5 casual listeners averaging 30 min/day:** ~$0.02 × 30 × 5 × 30 = ~$90/month

Realistically, early on this costs nearly nothing.

### Implementation

**File:** `server/agents/radio.py`

```python
"""
Sutra Radio — Always-on music stream using LiveKit.
Loops through Sutra and the Noble 8 discography in a persistent room.
Listeners join in listen-only mode.
"""

import asyncio
import wave
import random
import numpy as np
from pathlib import Path
from livekit import api, rtc

MUSIC_DIR = Path(__file__).parent / "assets" / "music"
ROOM_NAME = "radio-sutra"
PARTICIPANT_NAME = "Sutra Radio"


def get_playlist() -> list[Path]:
    """Get all WAV files, shuffled."""
    tracks = sorted(MUSIC_DIR.glob("*.wav"))
    if not tracks:
        raise FileNotFoundError(f"No WAV files in {MUSIC_DIR}")
    random.shuffle(tracks)
    return tracks


async def stream_track(source: rtc.AudioSource, track_path: Path):
    """Stream a single WAV file into the audio source."""
    print(f"Now playing: {track_path.stem}")
    
    with wave.open(str(track_path), 'rb') as wf:
        sample_rate = wf.getframerate()
        channels = wf.getnchannels()
        chunk_duration_ms = 20  # 20ms frames
        chunk_size = int(sample_rate * chunk_duration_ms / 1000)
        
        while True:
            raw_data = wf.readframes(chunk_size)
            if not raw_data:
                break
            
            samples = np.frombuffer(raw_data, dtype=np.int16)
            
            frame = rtc.AudioFrame(
                data=samples.tobytes(),
                sample_rate=sample_rate,
                num_channels=channels,
                samples_per_channel=len(samples) // channels,
            )
            await source.capture_frame(frame)
            
            # Pace the playback to real-time
            await asyncio.sleep(chunk_duration_ms / 1000)
    
    # Brief silence between tracks (2 seconds)
    silence = np.zeros(sample_rate * 2, dtype=np.int16)
    frame = rtc.AudioFrame(
        data=silence.tobytes(),
        sample_rate=sample_rate,
        num_channels=1,
        samples_per_channel=len(silence),
    )
    await source.capture_frame(frame)


async def run_radio():
    """Main radio loop — connect to room and stream forever."""
    room = rtc.Room()
    
    # Create a LiveKit API token for the radio bot
    token = api.AccessToken() \
        .with_identity("sutra-radio") \
        .with_name(PARTICIPANT_NAME) \
        .with_grants(api.VideoGrants(
            room_join=True,
            room=ROOM_NAME,
            can_publish=True,
            can_subscribe=False,
        ))
    
    import os
    livekit_url = os.environ["LIVEKIT_URL"]
    
    await room.connect(livekit_url, token.to_jwt())
    print(f"Sutra Radio connected to room: {ROOM_NAME}")
    
    # Create audio source and publish track
    source = rtc.AudioSource(48000, 1)
    audio_track = rtc.LocalAudioTrack.create_audio_track("radio", source)
    
    options = rtc.TrackPublishOptions()
    options.source = rtc.TrackSource.SOURCE_MICROPHONE
    await room.local_participant.publish_track(audio_track, options)
    
    # Loop forever
    while True:
        playlist = get_playlist()  # Reshuffle each loop
        for track_path in playlist:
            try:
                await stream_track(source, track_path)
            except Exception as e:
                print(f"Error playing {track_path.stem}: {e}")
                await asyncio.sleep(2)
                continue
        
        print("Playlist complete. Reshuffling...")


if __name__ == "__main__":
    asyncio.run(run_radio())
```

### Deployment

**Option A: Separate Railway service (recommended)**

```bash
cd server/agents
railway service create sutra-radio
# Set same LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET env vars
# Dockerfile CMD: python radio.py
```

**Option B: Background process on existing agent server**

Add to the agent server's startup script:
```bash
python radio.py &
python council_agent.py dev
```

Option A is cleaner — if radio crashes it doesn't take down the agent server.

### Dockerfile for Radio Service

**File:** `server/agents/Dockerfile.radio`

```dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir numpy

COPY . .

CMD ["python", "radio.py"]
```

### Frontend: Radio Player Component

**File:** `src/components/radio/SutraRadio.tsx`

A persistent mini-player that can appear on any page — a small bar at the bottom or a floating widget.

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";

const RADIO_ROOM = "radio-sutra";

export default function SutraRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roomConnection, setRoomConnection] = useState<any>(null);

  const toggleRadio = async () => {
    if (isPlaying) {
      // Disconnect from room
      if (roomConnection) {
        await roomConnection.disconnect();
        setRoomConnection(null);
      }
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        // Fetch a listen-only token for the radio room
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: RADIO_ROOM,
            username: `listener-${Date.now()}`,
            listenOnly: true,
          }),
        });
        const { token } = await res.json();

        // Connect to LiveKit room using the standard LiveKit client
        // The room component handles audio playback automatically
        // For a minimal player, use the LiveKit JS SDK directly:
        const { Room, RoomEvent } = await import("livekit-client");
        const room = new Room();
        await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);

        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === "audio") {
            const element = track.attach();
            document.body.appendChild(element);
          }
        });

        setRoomConnection(room);
        setIsPlaying(true);
      } catch (err) {
        console.error("Radio connection error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleRadio}
        disabled={isLoading}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-full shadow-lg
          transition-all duration-300
          ${isPlaying
            ? "bg-emerald-600 text-white shadow-emerald-500/30"
            : "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20"
          }
        `}
      >
        <Image
          src="/images/agents/sutra.png"
          alt="Sutra Radio"
          width={32}
          height={32}
          className="rounded-full"
        />
        <div className="text-left">
          <div className="text-xs font-medium opacity-70">Sutra Radio</div>
          <div className="text-sm font-semibold">
            {isLoading ? "Connecting..." : isPlaying ? "Now Playing" : "Tap to Listen"}
          </div>
        </div>
        {isPlaying && (
          <div className="flex gap-0.5 items-end h-4">
            <span className="w-1 bg-white rounded-full animate-pulse" style={{ height: "60%", animationDelay: "0ms" }} />
            <span className="w-1 bg-white rounded-full animate-pulse" style={{ height: "100%", animationDelay: "150ms" }} />
            <span className="w-1 bg-white rounded-full animate-pulse" style={{ height: "40%", animationDelay: "300ms" }} />
            <span className="w-1 bg-white rounded-full animate-pulse" style={{ height: "80%", animationDelay: "450ms" }} />
          </div>
        )}
      </button>
    </div>
  );
}
```

Add `<SutraRadio />` to the root layout so it appears on every page:

```tsx
// In src/app/layout.tsx, inside the body:
import SutraRadio from "@/components/radio/SutraRadio";

// ... inside <body>:
<SutraRadio />
```

### Update Token Endpoint

The `/api/livekit/token` endpoint needs to handle `listenOnly` requests — generating tokens with `canPublish: false` for radio listeners.

In `src/app/api/livekit/token/route.ts`, add handling for the `listenOnly` field:

```typescript
// If listenOnly is true, grant subscribe-only permissions
const grants: VideoGrant = {
  roomJoin: true,
  room: room,
  canPublish: !listenOnly,
  canSubscribe: true,
};
```

---

## Part 3: Add Radio Route (Optional)

Create a dedicated `/radio` page with album art, track info, and a larger player:

**File:** `src/app/radio/page.tsx`

A full-page radio experience showing:
- Large Sutra album art
- "Now Playing" with track name (requires the radio service to publish track metadata)
- Album selector (when more albums are added)
- Links to Spotify/Apple Music for the full catalog
- Visualizer animation (CSS-based audio bars)

This is a nice-to-have. The floating widget on every page is the priority.

---

## Part 4: Music File Requirements

### Current State
- 5 WAV files from NeoSoul album in `server/agents/assets/music/`

### Future
- Add remaining albums: Booting Samsara, Harmonic Alignment, Turing Bodhi
- Normalize all tracks to 48kHz mono WAV for consistent LiveKit playback
- Add track metadata file (`server/agents/assets/music/tracks.json`):

```json
[
  {
    "filename": "track-name.wav",
    "title": "Track Title",
    "album": "NeoSoul",
    "artist": "Sutra and the Noble 8",
    "duration_seconds": 210,
    "path_aspect": "Right Speech"
  }
]
```

### Normalization Script

```bash
# Run once to normalize all WAV files to 48kHz mono
for f in server/agents/assets/music/*.wav; do
  ffmpeg -y -i "$f" -ar 48000 -ac 1 "${f%.wav}_normalized.wav"
  mv "${f%.wav}_normalized.wav" "$f"
done
```

---

## Verify and Build

### For Claude Code:

> Read docs/SUTRA_RADIO_DIRECTIVE.md and execute:
> 1. Create the intro clip script (server/agents/scripts/create_intro.py)
> 2. Add play_intro function to council_agent.py
> 3. Create radio.py
> 4. Create Dockerfile.radio
> 5. Create SutraRadio.tsx component
> 6. Add SutraRadio to root layout
> 7. Update token endpoint for listenOnly
> 8. Build and verify

### Manual steps (JB):
- [ ] Run create_intro.py locally to generate intro.wav (needs ffmpeg installed)
- [ ] Deploy radio as separate Railway service
- [ ] Add remaining album tracks to music directory
- [ ] Normalize audio files to 48kHz mono

Confirm:
- [ ] `server/agents/assets/intro.wav` exists (5 seconds)
- [ ] Agent sessions play intro before greeting
- [ ] `radio.py` runs and publishes audio to `radio-sutra` room
- [ ] Floating radio widget appears on all pages
- [ ] Token endpoint supports listenOnly mode
- [ ] Build passes
