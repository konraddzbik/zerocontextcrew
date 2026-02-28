"""Dynamic Character DNA generation via Mistral Large.

Instead of static if/elif templates, uses LLM to generate contextual
character designs that fit the story theme, setting, and style.
Falls back to static templates if LLM is unavailable.
"""

from __future__ import annotations

import json
import logging
from typing import Any

import litellm

from .prompts import CharacterDNA, create_default_character_dna

logger = logging.getLogger(__name__)

# ── System prompt for DNA generator ──────────────────────────────────

_SYSTEM_PROMPT = """\
You are a children's book character designer. Given a character name, role, \
story theme, and visual style guide, create a UNIQUE, DETAILED visual description.

Rules:
- Design MUST fit the story theme (pirate story → pirate accessories, space → astronaut gear)
- Design MUST respect the color palette from the style guide
- Every character must be visually DISTINCT from existing characters (different colors, shapes, accessories)
- Include ONE memorable distinguishing feature (pattern, accessory, posture, marking)
- Accessories must make sense for the story context
- Keep descriptions concrete and visual — an illustrator must be able to draw this consistently
- For animal characters: specify species, fur/feather color, size, posture
- For human characters: specify age range, build, hair, clothing
- Include 3-4 hex color codes that define this character's palette
- Body type should suggest personality (round=friendly, tall=brave, small=curious)
- NEVER include scary, violent, or dark elements — this is for children aged 3-8

Respond ONLY with valid JSON, no markdown, no explanation."""

_USER_TEMPLATE = """\
Create a visual character sheet.

CHARACTER NAME: {name}
CHARACTER ROLE: {role}
STORY THEME: {story_theme}
STYLE GUIDE: {style_context}
EXISTING CHARACTERS (design must be visually DISTINCT from these):
{existing_characters}

Return JSON with exactly these fields:
{{
  "short_tag": "15 words max — Name, species/type, key visual features and accessories",
  "visual_description": "2-3 sentences, concrete visual details only. Describe what an illustrator should draw.",
  "color_key": "3-4 colors with hex codes, e.g. 'soft brown fur #8B6914, sky blue scarf #87CEEB'",
  "distinguishing_features": "1-2 unique visual features that make this character instantly recognizable across illustrations",
  "body_type": "size + shape + posture in 5-10 words"
}}"""


async def generate_character_dna_llm(
    name: str,
    role: str,
    story_theme: str = "children's adventure",
    style_context: str = "",
    existing_characters: dict[str, Any] | None = None,
) -> CharacterDNA | None:
    """Generate Character DNA via Mistral Large.

    Returns CharacterDNA on success, None on failure (caller should fallback).
    """
    # Format existing characters so LLM knows what to avoid
    existing_desc = "None yet — this is the first character."
    if existing_characters:
        parts = []
        for char_name, dna in existing_characters.items():
            desc = dna.get("visual_description", dna.get("short_tag", "no description"))
            parts.append(f"- {char_name}: {desc}")
        existing_desc = "\n".join(parts)

    user_prompt = _USER_TEMPLATE.format(
        name=name,
        role=role,
        story_theme=story_theme,
        style_context=style_context or "watercolor children's book, warm pastels",
        existing_characters=existing_desc,
    )

    try:
        response = await litellm.acompletion(
            model="mistral/mistral-large-latest",
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=500,
        )

        raw = response.choices[0].message.content
        data = json.loads(raw)

        # Validate required fields
        required = ("short_tag", "visual_description", "color_key",
                     "distinguishing_features", "body_type")
        missing = [f for f in required if not data.get(f)]
        if missing:
            logger.warning("LLM DNA for '%s' missing fields: %s", name, missing)
            return None

        dna = CharacterDNA(
            name=name,
            short_tag=data["short_tag"],
            visual_description=data["visual_description"],
            color_key=data["color_key"],
            distinguishing_features=data["distinguishing_features"],
            body_type=data["body_type"],
            seed=CharacterDNA.compute_seed(name),
        )
        logger.info("Generated LLM DNA for '%s': %s", name, dna.short_tag)
        return dna

    except json.JSONDecodeError:
        logger.exception("LLM DNA for '%s': invalid JSON response", name)
        return None
    except Exception:
        logger.exception("LLM DNA generation failed for '%s'", name)
        return None


async def get_or_create_character_dna(
    name: str,
    role: str,
    dna_store: dict[str, Any],
    story_theme: str = "children's adventure",
    style_context: str = "",
) -> CharacterDNA:
    """Get cached DNA or create new via LLM → static fallback chain.

    Fallback chain: LLM generation → static template → emergency generic.
    Result is cached in dna_store for reuse across chapters.
    """
    # 1. Cache hit — reuse existing DNA
    if name in dna_store:
        return CharacterDNA(**dna_store[name])

    # 2. Try LLM generation (contextual, best quality)
    dna = await generate_character_dna_llm(
        name=name,
        role=role,
        story_theme=story_theme,
        style_context=style_context,
        existing_characters=dna_store,
    )

    # 3. Fallback to static template
    if dna is None:
        logger.warning("LLM DNA failed for '%s', using static template", name)
        dna = create_default_character_dna(name, role)

    # 4. Cache for reuse
    dna_store[name] = dna.model_dump()
    return dna
