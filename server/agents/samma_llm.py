"""
Samma Suit LLM Adapter — LiveKit LLM plugin that routes all
completions through the Samma Suit gateway.

Implements livekit.agents.llm.LLM / LLMStream so it can be used
as a drop-in replacement for livekit-plugins-anthropic in the
AgentSession voice pipeline.

The gateway returns a complete (non-streaming) response.  We emit
it as a single ChatChunk — LiveKit's TTS pipeline handles
sentence-level chunking internally.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx
from livekit.agents import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    llm,
)
from livekit.agents.llm.tool_context import Tool, ToolChoice
from livekit.agents.types import (
    DEFAULT_API_CONNECT_OPTIONS,
    NOT_GIVEN,
    APIConnectOptions,
    NotGivenOr,
)

from samma_client import SammaSuitClient

logger = logging.getLogger("sutra-council.samma-llm")


class SammaSuitLLM(llm.LLM):
    """LiveKit LLM that proxies every chat() call through the Samma Suit gateway."""

    def __init__(
        self,
        *,
        client: SammaSuitClient,
        agent_id: str,
        model: str = "claude-sonnet-4-5-20250929",
        max_tokens: int = 1024,
    ) -> None:
        super().__init__()
        self._client = client
        self._agent_id = agent_id
        self._model_name = model
        self._max_tokens = max_tokens

    @property
    def model(self) -> str:
        return self._model_name

    @property
    def provider(self) -> str:
        return "sammasuit-gateway"

    def chat(
        self,
        *,
        chat_ctx: llm.ChatContext,
        tools: list[Tool] | None = None,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
        parallel_tool_calls: NotGivenOr[bool] = NOT_GIVEN,
        tool_choice: NotGivenOr[ToolChoice] = NOT_GIVEN,
        extra_kwargs: NotGivenOr[dict[str, Any]] = NOT_GIVEN,
    ) -> SammaSuitLLMStream:
        return SammaSuitLLMStream(
            self,
            client=self._client,
            agent_id=self._agent_id,
            model=self._model_name,
            max_tokens=self._max_tokens,
            chat_ctx=chat_ctx,
            tools=tools or [],
            conn_options=conn_options,
        )

    async def aclose(self) -> None:
        # Client lifecycle managed by council_agent.py
        pass


class SammaSuitLLMStream(llm.LLMStream):
    """Wraps a single gateway HTTP call as a LiveKit-compatible LLM stream."""

    def __init__(
        self,
        llm_instance: SammaSuitLLM,
        *,
        client: SammaSuitClient,
        agent_id: str,
        model: str,
        max_tokens: int,
        chat_ctx: llm.ChatContext,
        tools: list[Tool],
        conn_options: APIConnectOptions,
    ) -> None:
        super().__init__(
            llm_instance,
            chat_ctx=chat_ctx,
            tools=tools,
            conn_options=conn_options,
        )
        self._client = client
        self._agent_id = agent_id
        self._model = model
        self._max_tokens = max_tokens

    async def _run(self) -> None:
        """Execute the gateway call and emit results as ChatChunk events."""
        try:
            # Convert LiveKit ChatContext → Anthropic wire format
            anthropic_ctx, extra_data = self._chat_ctx.to_provider_format("anthropic")

            # Flatten Anthropic content blocks to simple {role, content} dicts.
            # System messages are intentionally dropped — the gateway uses
            # the agent's enriched system prompt from the DB.
            gateway_messages: list[dict] = []
            for msg in anthropic_ctx:
                role = msg.get("role", "user")
                content_blocks = msg.get("content", [])

                text_parts: list[str] = []
                for block in content_blocks:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text_parts.append(block.get("text", ""))
                    elif isinstance(block, str):
                        text_parts.append(block)

                text = "\n".join(text_parts).strip()
                if text:
                    gateway_messages.append({"role": role, "content": text})

            # POST to gateway — no system param, no conversation_id
            response = await self._client.gateway_call(
                agent_id=self._agent_id,
                messages=gateway_messages,
                model=self._model,
                max_tokens=self._max_tokens,
            )

            request_id = response.get("id", "gateway-response")

            # Extract text from response content blocks
            text_content = ""
            for block in response.get("content", []):
                if isinstance(block, dict) and block.get("type") == "text":
                    text_content += block.get("text", "")

            # Emit content as a single chunk
            if text_content:
                self._event_ch.send_nowait(
                    llm.ChatChunk(
                        id=request_id,
                        delta=llm.ChoiceDelta(
                            content=text_content,
                            role="assistant",
                        ),
                    )
                )

            # Emit usage
            usage = response.get("usage", {})
            input_tokens = usage.get("input_tokens", 0)
            output_tokens = usage.get("output_tokens", 0)
            self._event_ch.send_nowait(
                llm.ChatChunk(
                    id=request_id,
                    usage=llm.CompletionUsage(
                        completion_tokens=output_tokens,
                        prompt_tokens=input_tokens,
                        total_tokens=input_tokens + output_tokens,
                    ),
                )
            )

        except httpx.HTTPStatusError as e:
            raise APIStatusError(
                f"Gateway returned {e.response.status_code}",
                status_code=e.response.status_code,
                body=e.response.text,
            ) from e
        except httpx.TimeoutException as e:
            raise APITimeoutError("Gateway request timed out") from e
        except Exception as e:
            raise APIConnectionError(f"Gateway request failed: {e}") from e
