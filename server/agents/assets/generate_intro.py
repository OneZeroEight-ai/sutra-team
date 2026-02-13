"""
Generate a soft chime WAV for the Sutra session intro.

Produces a gentle rising tone (C5 -> E5 -> G5 arpeggio) with smooth
envelope, lasting ~2.5 seconds at 48kHz mono 16-bit.

Run once:  python generate_intro.py
Output:    intro.wav (in same directory)
"""

import math
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 48000
DURATION = 2.5  # seconds
NUM_SAMPLES = int(SAMPLE_RATE * DURATION)
MAX_AMPLITUDE = 0.25  # Keep it soft


def sine_wave(freq: float, t: float) -> float:
    """Generate a sine wave sample at time t."""
    return math.sin(2 * math.pi * freq * t)


def envelope(t: float, attack: float, sustain_end: float, release_end: float) -> float:
    """Smooth ADSR-like envelope: fade in, hold, fade out."""
    if t < attack:
        return t / attack
    elif t < sustain_end:
        return 1.0
    elif t < release_end:
        return 1.0 - (t - sustain_end) / (release_end - sustain_end)
    else:
        return 0.0


def generate_chime() -> list[float]:
    """Generate a gentle 3-note arpeggio chime."""
    samples = [0.0] * NUM_SAMPLES

    # Three notes: C5 (523Hz), E5 (659Hz), G5 (784Hz)
    # Staggered entry for arpeggio effect
    notes = [
        {"freq": 523.25, "start": 0.0, "attack": 0.15, "sustain_end": 0.8, "release_end": 1.6, "amp": 1.0},
        {"freq": 659.25, "start": 0.3, "attack": 0.15, "sustain_end": 1.0, "release_end": 1.8, "amp": 0.8},
        {"freq": 783.99, "start": 0.6, "attack": 0.15, "sustain_end": 1.2, "release_end": 2.2, "amp": 0.6},
    ]

    for note in notes:
        for i in range(NUM_SAMPLES):
            t = i / SAMPLE_RATE
            note_t = t - note["start"]
            if note_t < 0:
                continue
            env = envelope(note_t, note["attack"], note["sustain_end"], note["release_end"])
            samples[i] += sine_wave(note["freq"], note_t) * env * note["amp"] * MAX_AMPLITUDE

    # Soft global fade-out over final 0.3s
    fade_samples = int(0.3 * SAMPLE_RATE)
    for i in range(fade_samples):
        idx = NUM_SAMPLES - fade_samples + i
        samples[idx] *= i / fade_samples

    # Normalize to prevent clipping
    peak = max(abs(s) for s in samples)
    if peak > 0:
        scale = MAX_AMPLITUDE / peak
        samples = [s * scale for s in samples]

    return samples


def write_wav(filepath: str, samples: list[float]):
    """Write samples to 16-bit mono WAV."""
    with wave.open(filepath, "w") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)  # 16-bit
        wav.setframerate(SAMPLE_RATE)

        raw = b""
        for s in samples:
            clamped = max(-1.0, min(1.0, s))
            raw += struct.pack("<h", int(clamped * 32767))

        wav.writeframes(raw)


if __name__ == "__main__":
    out = Path(__file__).parent / "intro.wav"
    samples = generate_chime()
    write_wav(str(out), samples)
    print(f"Generated {out} ({len(samples)} samples, {DURATION}s, {SAMPLE_RATE}Hz)")
