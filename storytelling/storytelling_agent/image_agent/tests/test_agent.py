"""Tests for image_agent ADK integration."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from ..character_dna import generate_character_dna_llm, get_or_create_character_dna
from ..prompts import CharacterDNA, create_default_character_dna
from ..providers import ImageResult
from ...tools.image_tools import generate_images


def _make_tool_context(state: dict) -> MagicMock:
    """Create a mock ToolContext with the given state dict."""
    ctx = MagicMock()
    ctx.state = state
    ctx.save_artifact = AsyncMock()
    return ctx


@pytest.mark.asyncio
class TestGenerateImages:
    async def test_no_chapter_returns_error(self):
        ctx = _make_tool_context({})
        result = await generate_images(ctx)
        assert result["status"] == "error"
        assert "illustrate" in result["message"].lower()

    @patch("storytelling_agent.tools.image_tools._get_provider")
    async def test_string_chapter(self, mock_get_provider):
        """Plain string from story_writer works."""
        mock_provider = MagicMock()
        mock_provider.generate.return_value = ImageResult(
            status="success",
            provider="mock",
            image_path="/tmp/mock.png",
            generation_time_ms=500,
            prompt_used="test prompt",
        )
        mock_get_provider.return_value = mock_provider

        state = {
            "current_chapter": "Luna the bunny found a glowing door in the old oak tree.",
            "chapter_number": 1,
        }
        ctx = _make_tool_context(state)
        result = await generate_images(ctx)

        assert result["status"] == "success"
        assert result["chapters_illustrated"] == 1
        assert result["results"][0]["chapter"] == 1
        assert "current_image" in state

    @patch("storytelling_agent.tools.image_tools._get_provider")
    async def test_dict_chapter_with_characters(self, mock_get_provider):
        """Structured dict from FE with characters creates DNA."""
        mock_provider = MagicMock()
        mock_provider.generate.return_value = ImageResult(
            status="success",
            provider="mock",
            image_path="/tmp/mock.png",
            generation_time_ms=500,
            prompt_used="test prompt",
        )
        mock_get_provider.return_value = mock_provider

        state = {
            "current_chapter": {
                "scene": "Luna discovers a magical garden behind the oak tree",
                "characters": [
                    {"name": "Luna", "role": "bunny"},
                    {"name": "Max", "role": "fox"},
                ],
                "emotion": "curious",
                "chapter_number": 1,
            }
        }
        ctx = _make_tool_context(state)
        result = await generate_images(ctx)

        assert result["status"] == "success"
        # Character DNA should be created
        assert "Luna" in state["character_dna"]
        assert "Max" in state["character_dna"]
        assert "bunny" in state["character_dna"]["Luna"]["visual_description"].lower()
        assert "fox" in state["character_dna"]["Max"]["visual_description"].lower()

    @patch("storytelling_agent.tools.image_tools._get_provider")
    async def test_character_dna_persists(self, mock_get_provider):
        """DNA created in ch1 is reused in ch2."""
        mock_provider = MagicMock()
        mock_provider.generate.return_value = ImageResult(
            status="success",
            provider="mock",
            image_path="/tmp/mock.png",
            generation_time_ms=500,
            prompt_used="test prompt",
        )
        mock_get_provider.return_value = mock_provider

        state = {
            "current_chapter": {
                "scene": "Luna in a garden",
                "characters": [{"name": "Luna", "role": "bunny"}],
                "emotion": "happy",
                "chapter_number": 1,
            }
        }
        ctx = _make_tool_context(state)

        # Chapter 1
        await generate_images(ctx)
        dna_after_ch1 = state["character_dna"]["Luna"].copy()

        # Chapter 2 — same character
        state["current_chapter"] = {
            "scene": "Luna climbs a mountain",
            "characters": [{"name": "Luna", "role": "bunny"}],
            "emotion": "adventurous",
            "chapter_number": 2,
        }
        await generate_images(ctx)

        # DNA should be identical (reused, not recreated)
        assert state["character_dna"]["Luna"] == dna_after_ch1
        assert len(state["illustration_history"]) == 2

    @patch("storytelling_agent.tools.image_tools._get_provider")
    async def test_style_bible_persists(self, mock_get_provider):
        """Style Bible created on ch1 is reused on ch2."""
        mock_provider = MagicMock()
        mock_provider.generate.return_value = ImageResult(
            status="success",
            provider="mock",
            image_path="/tmp/mock.png",
            generation_time_ms=500,
            prompt_used="test prompt",
        )
        mock_get_provider.return_value = mock_provider

        state = {"current_chapter": "Luna found a door.", "chapter_number": 1}
        ctx = _make_tool_context(state)

        await generate_images(ctx)
        style_after_ch1 = state["style_bible"].copy()

        state["current_chapter"] = "Luna stepped through."
        state["chapter_number"] = 2
        await generate_images(ctx)

        assert state["style_bible"] == style_after_ch1

    @patch("storytelling_agent.tools.image_tools._get_provider")
    async def test_unsafe_scene_sanitized(self, mock_get_provider):
        """Unsafe content in scene is replaced with safe default."""
        mock_provider = MagicMock()
        mock_provider.generate.return_value = ImageResult(
            status="success",
            provider="mock",
            image_path="/tmp/mock.png",
            generation_time_ms=500,
            prompt_used="test prompt",
        )
        mock_get_provider.return_value = mock_provider

        state = {
            "current_chapter": {
                "scene": "a violent battle with blood and weapons",
                "characters": [],
                "emotion": "excited",
            }
        }
        ctx = _make_tool_context(state)
        result = await generate_images(ctx)

        assert result["status"] == "success"
        # The prompt sent to the provider should NOT contain unsafe words
        prompt_used = mock_provider.generate.call_args.kwargs["prompt"]
        assert "violent" not in prompt_used

    @patch("storytelling_agent.tools.image_tools._get_provider")
    async def test_fallback_to_placeholder(self, mock_get_provider):
        """All providers fail — falls back to placeholder."""
        mock_provider = MagicMock()
        mock_provider.generate.return_value = None
        mock_get_provider.return_value = mock_provider

        state = {"current_chapter": "Luna found a door.", "chapter_number": 1}
        ctx = _make_tool_context(state)
        result = await generate_images(ctx)

        assert result["status"] == "fallback"
        assert result["results"][0]["provider"] == "placeholder"

    @patch("storytelling_agent.tools.image_tools._get_provider")
    async def test_multi_chapter_batch_generation(self, mock_get_provider):
        """All chapters from all_chapters get illustrated in one call."""
        mock_provider = MagicMock()
        mock_provider.generate.return_value = ImageResult(
            status="success",
            provider="mock",
            image_path="/tmp/mock.png",
            generation_time_ms=500,
            prompt_used="test prompt",
        )
        mock_get_provider.return_value = mock_provider

        state = {
            "all_chapters": [
                {
                    "text": "Chapter 1 text",
                    "scene": "Luna in a garden",
                    "characters": [{"name": "Luna", "role": "bunny"}],
                    "emotion": "happy",
                    "chapter_number": 1,
                },
                {
                    "text": "Chapter 2 text",
                    "scene": "Luna by the river",
                    "characters": [{"name": "Luna", "role": "bunny"}],
                    "emotion": "curious",
                    "chapter_number": 2,
                },
                {
                    "text": "Chapter 3 text",
                    "scene": "Luna goes home",
                    "characters": [{"name": "Luna", "role": "bunny"}],
                    "emotion": "calm",
                    "chapter_number": 3,
                },
            ],
            "current_chapter": {
                "text": "Chapter 3 text",
                "scene": "Luna goes home",
                "characters": [{"name": "Luna", "role": "bunny"}],
                "emotion": "calm",
                "chapter_number": 3,
            },
            "chapter_number": 3,
        }
        ctx = _make_tool_context(state)
        result = await generate_images(ctx)

        assert result["status"] == "success"
        assert result["chapters_illustrated"] == 3
        assert result["successful"] == 3
        assert len(result["results"]) == 3
        assert len(state["illustration_history"]) == 3
        # Each chapter should have its own entry
        chapters_in_history = {e["chapter"] for e in state["illustration_history"]}
        assert chapters_in_history == {1, 2, 3}

    @patch("storytelling_agent.tools.image_tools._get_provider")
    async def test_skips_already_illustrated_chapters(self, mock_get_provider):
        """Chapters already in illustration_history are skipped."""
        mock_provider = MagicMock()
        mock_provider.generate.return_value = ImageResult(
            status="success",
            provider="mock",
            image_path="/tmp/mock.png",
            generation_time_ms=500,
            prompt_used="test prompt",
        )
        mock_get_provider.return_value = mock_provider

        state = {
            "all_chapters": [
                {"scene": "Garden", "characters": [], "emotion": "happy", "chapter_number": 1},
                {"scene": "River", "characters": [], "emotion": "curious", "chapter_number": 2},
            ],
            "illustration_history": [
                {"chapter": 1, "image_path": "/tmp/old.png", "provider": "mock", "prompt": "x"},
            ],
        }
        ctx = _make_tool_context(state)
        result = await generate_images(ctx)

        assert result["chapters_illustrated"] == 1
        assert result["results"][0]["chapter"] == 2
        # Total history should now have 2 entries
        assert len(state["illustration_history"]) == 2

    @patch("storytelling_agent.tools.image_tools._get_provider")
    async def test_all_chapters_illustrated_returns_skipped(self, mock_get_provider):
        """If all chapters already illustrated, returns skipped."""
        state = {
            "all_chapters": [
                {"scene": "Garden", "characters": [], "emotion": "happy", "chapter_number": 1},
            ],
            "illustration_history": [
                {"chapter": 1, "image_path": "/tmp/old.png", "provider": "mock", "prompt": "x"},
            ],
        }
        ctx = _make_tool_context(state)
        result = await generate_images(ctx)
        assert result["status"] == "skipped"

    @patch("storytelling_agent.tools.image_tools._get_provider")
    async def test_dict_with_string_characters(self, mock_get_provider):
        """Characters as plain strings (not dicts) work too."""
        mock_provider = MagicMock()
        mock_provider.generate.return_value = ImageResult(
            status="success",
            provider="mock",
            image_path="/tmp/mock.png",
            generation_time_ms=500,
            prompt_used="test prompt",
        )
        mock_get_provider.return_value = mock_provider

        state = {
            "current_chapter": {
                "scene": "Friends in a garden",
                "characters": ["Luna", "Max"],
                "emotion": "happy",
            }
        }
        ctx = _make_tool_context(state)
        result = await generate_images(ctx)

        assert result["status"] == "success"
        assert "Luna" in state["character_dna"]
        assert "Max" in state["character_dna"]


# --- Dynamic Character DNA ---


@pytest.mark.asyncio
class TestDynamicCharacterDNA:
    async def test_cache_hit_skips_llm(self):
        """If DNA already in store, LLM is never called."""
        existing_dna = create_default_character_dna("Luna", "bunny").model_dump()
        dna_store = {"Luna": existing_dna}

        result = await get_or_create_character_dna(
            "Luna", "bunny", dna_store, story_theme="forest adventure",
        )
        assert result.name == "Luna"
        assert dna_store["Luna"] == existing_dna  # unchanged

    @patch("storytelling_agent.image_agent.character_dna.litellm")
    async def test_llm_success_creates_dna(self, mock_litellm):
        """Successful LLM call creates contextual DNA."""
        import json
        llm_response = MagicMock()
        llm_response.choices = [MagicMock()]
        llm_response.choices[0].message.content = json.dumps({
            "short_tag": "Luna, sea bunny with shell necklace",
            "visual_description": "A white bunny with turquoise eyes and a seashell necklace.",
            "color_key": "white fur #F5F5F5, turquoise eyes #40E0D0, shell necklace #FFB6C1",
            "distinguishing_features": "seashell necklace, turquoise eyes",
            "body_type": "small, round, curious posture",
        })
        mock_litellm.acompletion = AsyncMock(return_value=llm_response)

        dna_store: dict = {}
        result = await get_or_create_character_dna(
            "Luna", "curious bunny", dna_store,
            story_theme="underwater adventure",
            style_context="ocean blues, turquoise",
        )

        assert result.name == "Luna"
        assert "sea" in result.short_tag.lower() or "shell" in result.short_tag.lower()
        assert "Luna" in dna_store  # cached

    @patch("storytelling_agent.image_agent.character_dna.litellm")
    async def test_llm_failure_falls_back_to_static(self, mock_litellm):
        """If LLM fails, falls back to static template."""
        mock_litellm.acompletion = AsyncMock(side_effect=Exception("API down"))

        dna_store: dict = {}
        result = await get_or_create_character_dna(
            "Luna", "bunny", dna_store,
            story_theme="forest adventure",
        )

        assert result.name == "Luna"
        assert "bunny" in result.visual_description.lower()  # static template
        assert "Luna" in dna_store  # cached even on fallback

    @patch("storytelling_agent.image_agent.character_dna.litellm")
    async def test_llm_bad_json_falls_back(self, mock_litellm):
        """If LLM returns invalid JSON, falls back to static."""
        llm_response = MagicMock()
        llm_response.choices = [MagicMock()]
        llm_response.choices[0].message.content = "not valid json{{"
        mock_litellm.acompletion = AsyncMock(return_value=llm_response)

        dna_store: dict = {}
        result = await get_or_create_character_dna(
            "Max", "fox", dna_store,
        )

        assert result.name == "Max"
        assert "fox" in result.visual_description.lower()  # static fallback

    @patch("storytelling_agent.image_agent.character_dna.litellm")
    async def test_existing_characters_passed_to_llm(self, mock_litellm):
        """Existing characters are passed so LLM can make new ones distinct."""
        import json
        llm_response = MagicMock()
        llm_response.choices = [MagicMock()]
        llm_response.choices[0].message.content = json.dumps({
            "short_tag": "Max, adventurous fox with blue bandana",
            "visual_description": "A bold orange fox with a blue bandana and amber eyes.",
            "color_key": "orange fur #E65100, blue bandana #2196F3, amber eyes #FFA000",
            "distinguishing_features": "blue bandana, amber eyes",
            "body_type": "lean, agile, confident stance",
        })
        mock_litellm.acompletion = AsyncMock(return_value=llm_response)

        dna_store = {
            "Luna": {"visual_description": "white bunny with red scarf"},
        }
        result = await get_or_create_character_dna(
            "Max", "brave fox", dna_store,
            story_theme="forest adventure",
        )

        # LLM should have been called with existing characters context
        call_args = mock_litellm.acompletion.call_args
        messages = call_args.kwargs["messages"]
        user_msg = messages[1]["content"]
        assert "Luna" in user_msg  # existing character mentioned
        assert result.name == "Max"
