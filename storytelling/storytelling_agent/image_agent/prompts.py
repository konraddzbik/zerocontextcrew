"""Prompt composition for image_agent.

StyleBible maintains a consistent visual style across the entire story.
CharacterDNA maintains consistent character appearance between chapters.
"""

from __future__ import annotations

import hashlib

from pydantic import BaseModel


class StyleBible(BaseModel):
    art_style: str = "watercolor children's book illustration, soft and whimsical"
    color_palette: str = "warm pastels, soft gold, lavender, mint green"
    mood: str = "magical, cozy, safe"
    rendering: str = "soft brushstrokes, gentle gradients, rounded shapes, thick outlines"
    negative_prompt: str = (
        "photorealistic, dark, scary, violent, horror, blood, weapons, "
        "text, watermark, deformed, ugly"
    )

    @property
    def style_prefix(self) -> str:
        return f"{self.art_style}, {self.color_palette}, {self.rendering}"


class CharacterDNA(BaseModel):
    """Visual identity of a character — persisted across chapters for consistency."""

    name: str
    visual_description: str
    short_tag: str
    color_key: str
    distinguishing_features: str
    body_type: str
    seed: int = 0

    @staticmethod
    def compute_seed(name: str) -> int:
        return int(hashlib.md5(name.encode()).hexdigest()[:8], 16) % 100000


# --- Emotion mapping ---

_EMOTION_MAP: dict[str, str] = {
    "happy": "bright warm lighting, joyful warm colors, gentle sunshine",
    "sad": "soft blue-grey lighting, muted cool tones, gentle rain",
    "excited": "bright dynamic lighting, vivid warm colors, sense of wonder",
    "scared": "cool dim lighting, soft shadows, safe cozy hiding spot",
    "curious": "dappled golden light, inviting colors, sense of discovery",
    "calm": "soft diffused lighting, muted tones, peaceful atmosphere",
    "mysterious": "cool blue-purple lighting, gentle mist, enchanting shadows",
    "funny": "bright cheerful lighting, exaggerated playful expressions",
    "adventurous": "golden hour lighting, wide panoramic view, sense of journey",
}


def emotion_to_atmosphere(emotion: str) -> str:
    return _EMOTION_MAP.get(emotion, _EMOTION_MAP["excited"])


# --- Defaults ---


def create_default_style_bible(story_theme: str) -> StyleBible:
    """Sensible default without LLM. Adjusts palette to match the theme."""
    theme_lower = story_theme.lower() if story_theme else ""
    palette = "warm pastels, soft gold, lavender, mint green, sky blue"
    if any(w in theme_lower for w in ("ocean", "sea", "water", "fish")):
        palette = "ocean blues, turquoise, sandy gold, coral pink"
    elif any(w in theme_lower for w in ("forest", "tree", "wood", "jungle")):
        palette = "forest greens, earthy browns, dappled gold, moss"
    elif any(w in theme_lower for w in ("space", "star", "planet", "galaxy")):
        palette = "deep indigo, cosmic purple, starlight white, nebula pink"
    elif any(w in theme_lower for w in ("snow", "winter", "ice", "frost")):
        palette = "icy blues, frosty white, silver, pale lavender"
    return StyleBible(color_palette=palette)


def create_default_character_dna(name: str, role: str) -> CharacterDNA:
    """Emergency fallback when LLM DNA generation fails.

    Generates a simple generic description from name and role.
    Only used when Mistral API is down or returns invalid JSON.
    """
    role_label = role.strip() if role else "character"
    seed = CharacterDNA.compute_seed(name)

    visual = (
        f"{name} is a friendly {role_label} with bright expressive eyes, "
        f"a warm smile, and a cheerful appearance. Safe and gentle for children."
    )
    short = f"{name}, a friendly {role_label} with bright eyes"
    color = "warm pastels #B39DDB, bright eyes #4A90D9, accent #FFD700"
    features = "bright expressive eyes, warm smile"
    body = "small, child-proportioned, friendly"

    return CharacterDNA(
        name=name,
        visual_description=visual,
        short_tag=short,
        color_key=color,
        distinguishing_features=features,
        body_type=body,
        seed=seed,
    )


# --- Prompt composition ---


# Max scene_prompt length — Pollinations uses GET with URL-encoded prompt.
# Mistral handles longer prompts fine, but we cap to be safe for all providers.
MAX_SCENE_PROMPT_LENGTH = 800


def compose_prompt(
    scene: str,
    emotion: str,
    style: StyleBible | None = None,
    characters: list[CharacterDNA] | None = None,
) -> tuple[str, str]:
    """Compose prompt for image generation.

    Returns (scene_prompt, character_context).
    - scene_prompt: scene description with character tags and atmosphere
    - character_context: full visual DNA for each character (sent separately)

    Characters are placed prominently in the scene prompt so the model
    prioritizes their appearance. Accessories are explicitly listed to
    prevent the model from omitting them.

    scene_prompt is capped at MAX_SCENE_PROMPT_LENGTH to stay within
    provider URL/token limits (especially Pollinations GET URLs).
    """
    atmosphere = emotion_to_atmosphere(emotion)
    chars = characters or []

    # Scene prompt — character tags embedded for visibility
    if chars:
        # Build accessory reminders: "Luna MUST WEAR red scarf", etc.
        accessory_notes = []
        for c in chars:
            features = c.distinguishing_features
            if features:
                accessory_notes.append(f"{c.name}: MUST HAVE {features}")
        accessory_str = ". ".join(accessory_notes)

        char_tags = ". ".join(c.short_tag for c in chars)
        scene_prompt = (
            f"{scene}. {char_tags}. "
            f"Show characters from front or 3/4 view. {accessory_str}. "
            f"{atmosphere}."
        )

        # If too long, drop accessory notes (char_tags + atmosphere are more important)
        if len(scene_prompt) > MAX_SCENE_PROMPT_LENGTH:
            scene_prompt = (
                f"{scene}. {char_tags}. "
                f"Show characters from front or 3/4 view. {atmosphere}."
            )

        # If still too long, truncate scene text (keep at least 50 chars)
        if len(scene_prompt) > MAX_SCENE_PROMPT_LENGTH:
            max_scene = max(50, MAX_SCENE_PROMPT_LENGTH - len(char_tags) - len(atmosphere) - 60)
            scene_prompt = f"{scene[:max_scene]}. {char_tags}. {atmosphere}."
            # Hard cap — if char_tags + atmosphere alone exceed the limit, truncate final result
            if len(scene_prompt) > MAX_SCENE_PROMPT_LENGTH:
                scene_prompt = scene_prompt[:MAX_SCENE_PROMPT_LENGTH]
    else:
        scene_prompt = f"{scene}. {atmosphere}."

    # Character context — full descriptions for provider
    char_lines = []
    for c in chars:
        char_lines.append(
            f"{c.name}: {c.visual_description} "
            f"Colors: {c.color_key}. "
            f"Features: {c.distinguishing_features}. "
            f"Body: {c.body_type}."
        )
    character_context = "\n".join(char_lines)

    return scene_prompt, character_context
