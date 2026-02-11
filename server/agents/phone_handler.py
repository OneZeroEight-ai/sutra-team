"""
Phone Handler — SIP telephony integration for Sutra.team council sessions.

Handles inbound phone calls via LiveKit's SIP bridge. Implements:
- IVR greeting and council mode selection (DTMF or voice)
- PIN-based authentication for account linking
- Same agent pipeline as web sessions (modality-agnostic)

SIP Configuration:
- Inbound trunk receives calls from provisioned phone numbers
- Dispatch rules route calls to council rooms with appropriate metadata
- Agents detect connection type (WebRTC vs SIP) and optimize accordingly

Usage:
    This module is imported by council_agent.py for SIP-specific handling.
    It is not run standalone.
"""

import logging

logger = logging.getLogger("phone-handler")


# SIP trunk configuration templates
# These are applied via the LiveKit API when provisioning phone numbers.

INBOUND_TRUNK_CONFIG = {
    "name": "Sutra-Team-Inbound",
    "numbers": [],  # Populated from environment / provisioning
    "krisp_enabled": True,  # Noise cancellation for phone audio
}

DISPATCH_RULE_CONFIG = {
    "name": "council-dispatch",
    "trunk_ids": [],  # Populated after trunk creation
    "room_prefix": "council-phone-",
}


IVR_GREETING = (
    "Welcome to Sutra dot team. "
    "Press 1 for the Council of Rights. "
    "Press 2 for the Council of Experts. "
    "Press 3 for the Combined Council. "
    "Or say the name of the council you'd like to convene."
)

PIN_PROMPT = (
    "To link this session to your account, please enter your PIN followed "
    "by the pound key. Or press star to continue as a guest."
)


DTMF_TO_COUNCIL_MODE = {
    "1": "rights",
    "2": "experts",
    "3": "combined",
}


def parse_dtmf_selection(dtmf: str) -> str:
    """Convert DTMF input to council mode."""
    return DTMF_TO_COUNCIL_MODE.get(dtmf, "rights")


def is_sip_participant(participant_identity: str) -> bool:
    """Check if a participant joined via SIP (phone) rather than WebRTC."""
    return participant_identity.startswith("sip_") or "+1" in participant_identity


def get_phone_optimizations() -> dict:
    """
    Return configuration optimizations for phone (SIP) sessions.

    Phone audio is narrowband (8kHz) vs. WebRTC wideband (48kHz).
    Adjust STT and TTS settings accordingly.
    """
    return {
        "stt_model": "nova-3",  # Deepgram handles narrowband well
        "tts_speed": 0.95,  # Slightly slower for phone clarity
        "tts_sample_rate": 8000,  # Match phone narrowband
        "vad_sensitivity": 0.6,  # More sensitive for phone noise floor
    }
