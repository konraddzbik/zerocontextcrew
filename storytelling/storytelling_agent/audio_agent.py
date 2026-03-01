"""Audio agent that calls ElevenLabs TTS directly — no LLM involved.

This is a custom BaseAgent subclass.  When the ADK runner invokes it,
``_run_async_impl`` reads the chapter text from session state, calls
``generate_audio`` (which hits the real ElevenLabs API), and emits an
Event with the result.  Because there is no LLM in the loop the tool
is *always* called and results are never hallucinated.
"""

from __future__ import annotations

import time
from collections.abc import AsyncGenerator
from typing import TYPE_CHECKING

from google.adk.agents import BaseAgent
from google.adk.events import Event, EventActions
from google.genai import types as genai_types

from .tools.audio_tools import generate_audio as _generate_audio

if TYPE_CHECKING:
    from google.adk.agents.invocation_context import InvocationContext


class AudioAgent(BaseAgent):
    """Deterministic agent that generates audio for the current chapter."""

    # Pydantic model config — allow arbitrary types so ADK internals work.
    model_config = {"arbitrary_types_allowed": True}

    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        raw_chapter = ctx.session.state.get("current_chapter", "")
        chapter_number: int = ctx.session.state.get("chapter_number", 1)

        # current_chapter may be a dict (from save_chapter) or a plain string
        if isinstance(raw_chapter, dict):
            chapter_text = raw_chapter.get("text", "")
        else:
            chapter_text = str(raw_chapter) if raw_chapter else ""

        if not chapter_text or not chapter_text.strip():
            yield Event(
                author=self.name,
                invocation_id=ctx.invocation_id,
                content=genai_types.Content(
                    role="model",
                    parts=[genai_types.Part(text="AUDIO SKIPPED: no chapter text available.")],
                ),
                actions=EventActions(state_delta={}),
                timestamp=time.time(),
            )
            return

        # Build a minimal mock ToolContext so generate_audio can read/write state.
        tool_ctx = _ToolContextShim(ctx.session.state)

        result = await _generate_audio(
            text=chapter_text,
            voice="rachel",
            tool_context=tool_ctx,
        )

        # Propagate any state changes the tool made (all_audio_results, etc.)
        state_delta: dict = {}
        for key, value in tool_ctx.state_writes.items():
            state_delta[key] = value

        if result.get("status") == "success":
            text_out = (
                f"**Chapter {result['chapter']} Audio Ready**\n"
                f"[Listen to Chapter {result['chapter']}]({result['audio_url']})\n"
                f"Duration: ~{result.get('duration_seconds_estimate', '?')} s "
                f"| Size: {result.get('file_size_kb', '?')} KB"
            )
            state_delta["audio_result"] = text_out
        else:
            text_out = f"AUDIO ERROR: {result.get('message', 'unknown error')}"
            state_delta["audio_result"] = text_out

        yield Event(
            author=self.name,
            invocation_id=ctx.invocation_id,
            content=genai_types.Content(
                role="model",
                parts=[genai_types.Part(text=text_out)],
            ),
            actions=EventActions(state_delta=state_delta),
            timestamp=time.time(),
        )


class _ToolContextShim:
    """Minimal shim that satisfies what ``generate_audio`` expects from a ToolContext.

    ``generate_audio`` calls ``tool_context.state.get(...)`` and
    ``tool_context.state[...] = ...``.  This shim proxies reads to the
    real session state and records writes so the caller can propagate them
    as a ``state_delta``.
    """

    def __init__(self, session_state: dict):
        self.state = _StateDictProxy(session_state)

    @property
    def state_writes(self) -> dict:
        return self.state.writes


class _StateDictProxy(dict):
    """Dict-like wrapper that tracks mutations."""

    def __init__(self, real_state: dict):
        super().__init__(real_state)
        self.writes: dict = {}

    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        self.writes[key] = value


# The agent instance used by media_agent / chapter_agent.
audio_agent = AudioAgent(
    name="audio_agent",
    description="Generates audio narration for a story chapter using ElevenLabs TTS.",
)
