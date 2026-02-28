"""Tests for image generation providers and prompts."""

from __future__ import annotations

import os

import pytest

from ..prompts import (
    CharacterDNA,
    StyleBible,
    compose_prompt,
    create_default_character_dna,
    create_default_style_bible,
    emotion_to_atmosphere,
)
from ..providers import ImageResult
from ...tools.image_tools import (
    BLOCKED_WORDS,
    _create_placeholder,
    _is_safe_prompt,
    _parse_chapter,
    _sanitize_scene,
    _truncate_to_sentence,
)


# --- StyleBible ---


class TestStyleBible:
    def test_default_style_bible(self):
        style = create_default_style_bible("ocean adventure")
        assert "ocean" in style.color_palette.lower() or "blue" in style.color_palette.lower()

    def test_style_prefix(self):
        style = StyleBible()
        assert "watercolor" in style.style_prefix
        assert "pastel" in style.style_prefix

    def test_generic_theme(self):
        style = create_default_style_bible("a random story")
        assert style.color_palette

    def test_negative_prompt_exists(self):
        style = StyleBible()
        assert "scary" in style.negative_prompt
        assert "weapons" in style.negative_prompt


# --- CharacterDNA ---


class TestCharacterDNA:
    def test_compute_seed_deterministic(self):
        s1 = CharacterDNA.compute_seed("Luna")
        s2 = CharacterDNA.compute_seed("Luna")
        assert s1 == s2

    def test_compute_seed_different_names(self):
        s1 = CharacterDNA.compute_seed("Luna")
        s2 = CharacterDNA.compute_seed("Max")
        assert s1 != s2

    def test_create_cat_dna(self):
        dna = create_default_character_dna("Whiskers", "a curious cat")
        assert "cat" in dna.visual_description.lower()
        assert dna.color_key
        assert dna.seed > 0

    def test_create_bunny_dna(self):
        dna = create_default_character_dna("Luna", "little bunny")
        assert "bunny" in dna.visual_description.lower()
        assert "#" in dna.color_key  # has hex colors

    def test_create_fox_dna(self):
        dna = create_default_character_dna("Max", "clever fox")
        assert "fox" in dna.visual_description.lower()

    def test_create_dragon_dna(self):
        dna = create_default_character_dna("Sparky", "baby dragon")
        assert "dragon" in dna.visual_description.lower()

    def test_create_generic_dna(self):
        dna = create_default_character_dna("Bob", "friend")
        assert dna.visual_description
        assert dna.short_tag
        assert dna.color_key

    def test_dna_has_all_fields(self):
        dna = create_default_character_dna("Luna", "bunny")
        assert dna.name == "Luna"
        assert dna.visual_description
        assert dna.short_tag
        assert dna.color_key
        assert dna.distinguishing_features
        assert dna.body_type
        assert dna.seed > 0


# --- Prompt composition ---


class TestPromptComposition:
    def test_compose_without_characters(self):
        prompt, context = compose_prompt("a forest glade", "calm")
        assert "forest" in prompt
        assert "soft" in prompt  # calm atmosphere
        assert context == ""

    def test_compose_with_characters(self):
        chars = [create_default_character_dna("Luna", "bunny")]
        prompt, context = compose_prompt("a garden", "happy", characters=chars)
        assert "Luna" in prompt  # short_tag in scene prompt
        assert "Luna" in context  # full description in context
        assert "#" in context  # hex color codes

    def test_compose_with_style(self):
        style = StyleBible()
        prompt, context = compose_prompt("a garden", "happy", style=style)
        assert isinstance(prompt, str)

    def test_emotion_to_atmosphere(self):
        assert "bright" in emotion_to_atmosphere("excited")
        assert "soft" in emotion_to_atmosphere("calm")
        assert "discovery" in emotion_to_atmosphere("curious")
        # Unknown falls back to excited
        assert emotion_to_atmosphere("unknown") == emotion_to_atmosphere("excited")


# --- Safety filtering ---


class TestSafetyFilter:
    def test_safe_prompt_passes(self):
        assert _is_safe_prompt("a cute bunny in a garden") is True

    def test_blocked_word_detected(self):
        assert _is_safe_prompt("a violent battle scene") is False
        assert _is_safe_prompt("scary monster attacks") is False
        assert _is_safe_prompt("character with gun") is False

    def test_session_regression_words_blocked(self):
        """Regression: these phrases slipped past the filter during early testing
        (ADK session 3b032472) because 'evil', 'army', 'menacing', 'battle'
        were not in BLOCKED_WORDS. They are now blocked."""
        assert _is_safe_prompt("an evil sorcerer appears") is False
        assert _is_safe_prompt("army of dark creatures") is False
        assert _is_safe_prompt("menacing shadow over the scene") is False
        assert _is_safe_prompt("the battle raged on") is False

    def test_sanitize_safe_text(self):
        text = "Luna finds a flower"
        assert _sanitize_scene(text) == text

    def test_sanitize_unsafe_text(self):
        result = _sanitize_scene("a violent explosion with blood")
        assert "peaceful" in result  # replaced with safe default
        assert "blood" not in result


# --- Chapter parsing ---


class TestParseChapter:
    def test_parse_string_chapter(self):
        state = {"current_chapter": "Luna found a door.", "chapter_number": 2}
        parsed = _parse_chapter(state)
        assert parsed["scene"] == "Luna found a door."
        assert parsed["characters"] == []
        assert parsed["emotion"] == "excited"
        assert parsed["chapter_number"] == 2

    def test_parse_dict_chapter(self):
        state = {
            "current_chapter": {
                "scene": "A magical garden",
                "characters": [{"name": "Luna", "role": "bunny"}],
                "emotion": "curious",
                "chapter_number": 1,
            }
        }
        parsed = _parse_chapter(state)
        assert parsed["scene"] == "A magical garden"
        assert len(parsed["characters"]) == 1
        assert parsed["emotion"] == "curious"

    def test_parse_dict_with_string_characters(self):
        state = {
            "current_chapter": {
                "scene": "A garden",
                "characters": ["Luna", "Max"],
                "emotion": "happy",
            }
        }
        parsed = _parse_chapter(state)
        assert parsed["characters"] == ["Luna", "Max"]

    def test_parse_empty_state(self):
        assert _parse_chapter({}) == {}
        assert _parse_chapter({"current_chapter": ""}) == {}


# --- Helpers ---


class TestTruncateToSentence:
    def test_short_text_unchanged(self):
        assert _truncate_to_sentence("Hello.", 100) == "Hello."

    def test_truncates_at_sentence(self):
        text = "First sentence. Second sentence. Third sentence that is very long."
        result = _truncate_to_sentence(text, 40)
        assert result.endswith(".")
        assert len(result) <= 40

    def test_no_sentence_boundary(self):
        text = "a" * 100
        result = _truncate_to_sentence(text, 50)
        assert len(result) == 50


class TestPlaceholder:
    def test_placeholder_always_works(self):
        result = _create_placeholder("excited")
        assert result.status == "fallback"
        assert result.provider == "placeholder"
        assert result.image_path
        assert result.image_base64
        # PIL available → PNG, PIL missing → SVG fallback
        assert result.image_base64.startswith("data:image/png;base64,") or \
               result.image_base64.startswith("data:image/svg+xml;base64,")

    def test_placeholder_different_emotions(self):
        for emotion in ["happy", "sad", "curious", "scared"]:
            result = _create_placeholder(emotion)
            assert result.status == "fallback"


# --- Provider integration tests (require network/API keys) ---


@pytest.mark.skipif(
    not os.environ.get("MISTRAL_API_KEY"),
    reason="MISTRAL_API_KEY not set",
)
class TestMistralIntegration:
    def test_mistral_imagegen(self):
        from ..providers.mistral_imagegen import MistralImageGenProvider

        provider = MistralImageGenProvider()
        result = provider.generate(
            prompt="A small fox with a red scarf in a magical forest",
            style_context="watercolor children's book illustration",
            character_context="Fox: small orange fox with a bright red scarf and bushy tail",
            emotion="adventurous",
        )
        assert result is not None
        assert result.status == "success"


@pytest.mark.skipif(
    not os.environ.get("RUN_INTEGRATION_TESTS"),
    reason="Set RUN_INTEGRATION_TESTS=1 to run",
)
class TestPollinationsIntegration:
    def test_pollinations_generates_image(self):
        from ..providers.pollinations import PollinationsProvider

        provider = PollinationsProvider()
        result = provider.generate(
            prompt="A cute cartoon cat sitting on a cloud, children's book illustration",
            width=512,
            height=512,
            seed=42,
        )
        assert result is not None
        assert result.status == "success"
        assert result.image_path
