"""
Samma Suit API Client — async HTTP wrapper for voice-config,
voice-session lifecycle, and gateway LLM calls.

Used by council_agent.py to fetch agent config from the Samma Suit
backend instead of hardcoded prompt files.
"""

import logging
import os
from dataclasses import dataclass
from typing import Optional

import httpx

logger = logging.getLogger("sutra-council.samma-client")


@dataclass
class VoiceConfig:
    """Agent voice configuration returned by GET /api/council/agents/{id}/voice-config."""

    agent_id: str
    agent_name: str
    tts_provider: str
    tts_voice_id: str
    tts_model: str
    stt_provider: str
    stt_model: str
    voice_speed: float
    voice_language: str
    system_prompt: str
    model: str
    council_type: Optional[str]
    council_role: Optional[str]
    eightfold_path_aspect: Optional[str]


@dataclass
class VoiceSession:
    """Session registration returned by POST /api/council/agents/{id}/voice-session."""

    session_id: str
    agent_id: str
    agent_name: str
    session_type: str
    budget_remaining: float


class SammaSuitClient:
    """Async client for the Samma Suit REST API."""

    def __init__(
        self,
        api_url: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        self.api_url = (api_url or os.environ.get("SAMMASUIT_API_URL", "")).rstrip("/")
        self.api_key = api_key or os.environ.get("SAMMASUIT_API_KEY", "")
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def configured(self) -> bool:
        """True when both API URL and key are set."""
        return bool(self.api_url and self.api_key)

    async def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=30.0,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
            )
        return self._client

    # ── Voice Config ──

    async def get_voice_config(self, agent_id: str) -> VoiceConfig:
        """GET /api/council/agents/{agent_id}/voice-config"""
        client = await self._ensure_client()
        resp = await client.get(
            f"{self.api_url}/api/council/agents/{agent_id}/voice-config",
        )
        resp.raise_for_status()
        data = resp.json()
        return VoiceConfig(
            agent_id=data["agent_id"],
            agent_name=data["agent_name"],
            tts_provider=data.get("tts_provider", "cartesia"),
            tts_voice_id=data["tts_voice_id"],
            tts_model=data.get("tts_model", "sonic-3"),
            stt_provider=data.get("stt_provider", "deepgram"),
            stt_model=data.get("stt_model", "nova-3"),
            voice_speed=data.get("voice_speed", 1.0),
            voice_language=data.get("voice_language", "en"),
            system_prompt=data["system_prompt"],
            model=data.get("model", "claude-sonnet-4-5-20250929"),
            council_type=data.get("council_type"),
            council_role=data.get("council_role"),
            eightfold_path_aspect=data.get("eightfold_path_aspect"),
        )

    # ── Voice Session Lifecycle ──

    async def start_voice_session(
        self, agent_id: str, session_type: str = "voice"
    ) -> VoiceSession:
        """POST /api/council/agents/{agent_id}/voice-session

        Registers session start.  KARMA budget check runs server-side;
        raises httpx.HTTPStatusError(402) when budget is exceeded.
        """
        client = await self._ensure_client()
        resp = await client.post(
            f"{self.api_url}/api/council/agents/{agent_id}/voice-session",
            json={"session_type": session_type},
        )
        resp.raise_for_status()
        data = resp.json()
        return VoiceSession(
            session_id=data["session_id"],
            agent_id=data["agent_id"],
            agent_name=data["agent_name"],
            session_type=data["session_type"],
            budget_remaining=data.get("budget_remaining", 0),
        )

    async def end_voice_session(
        self,
        agent_id: str,
        session_id: str,
        *,
        duration_seconds: float,
        tokens_used: int,
        tts_characters: int,
        stt_minutes: float,
        total_cost_usd: float,
    ) -> dict:
        """POST /api/council/agents/{agent_id}/voice-session/{session_id}/end"""
        client = await self._ensure_client()
        resp = await client.post(
            f"{self.api_url}/api/council/agents/{agent_id}/voice-session/{session_id}/end",
            json={
                "duration_seconds": duration_seconds,
                "tokens_used": tokens_used,
                "tts_characters": tts_characters,
                "stt_minutes": stt_minutes,
                "total_cost_usd": total_cost_usd,
            },
        )
        resp.raise_for_status()
        return resp.json()

    # ── Gateway (LLM proxy with full 8-layer enforcement) ──

    async def gateway_call(
        self,
        agent_id: str,
        messages: list[dict],
        model: str,
        max_tokens: int = 1024,
    ) -> dict:
        """POST /api/agents/{agent_id}/gateway

        Routes the LLM call through all 8 Samma Suit layers:
        SUTRA, NIRVANA, SANGHA, KARMA, DHARMA, BODHI, METTA, SILA.

        Returns Anthropic-style response dict with layer metadata.
        """
        client = await self._ensure_client()
        body: dict = {
            "messages": messages,
            "model": model,
            "max_tokens": max_tokens,
        }
        resp = await client.post(
            f"{self.api_url}/api/agents/{agent_id}/gateway",
            json=body,
        )
        resp.raise_for_status()
        return resp.json()

    # ── Cleanup ──

    async def aclose(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None
