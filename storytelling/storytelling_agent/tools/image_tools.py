"""ADK Tool: generate_images() — orchestrates prompts -> provider -> state."""

from __future__ import annotations

import base64
import logging
import os
import time
import uuid
from pathlib import Path

from google.adk.tools import ToolContext

from ..image_agent.character_dna import get_or_create_character_dna
from ..image_agent.prompts import (
    CharacterDNA,
    StyleBible,
    compose_prompt,
    create_default_style_bible,
)
from ..image_agent.providers import ImageResult

# NOTE: /tmp is ephemeral — set OUTPUT_DIR in production for persistent storage.
OUTPUT_DIR = os.environ.get("OUTPUT_DIR", "/tmp/storytime_images")

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Child safety — input filtering (Checkpoint 10)
# ---------------------------------------------------------------------------

BLOCKED_WORDS = frozenset({
    # Violence
    "violent", "violence", "blood", "bloody", "weapon", "weapons",
    "gun", "guns", "knife", "knives", "kill", "killing", "death", "dead",
    "battle", "attack", "attacking", "army", "war", "fighting", "fight",
    # Dark/horror
    "horror", "scary", "terrifying", "nightmare", "menacing",
    "evil", "sorcerer", "demon", "demons", "monster", "monsters",
    "dark", "darkness", "sinister", "ominous", "creepy",
    # Adult content
    "nude", "naked", "nsfw", "sexual",
    # Substances
    "drug", "drugs", "alcohol", "cigarette", "smoking",
    # Abuse
    "torture", "abuse", "suicide",
})

SAFE_DEFAULT_SCENE = "a peaceful meadow with gentle sunshine, colorful butterflies, and soft green grass"


def _is_safe_prompt(text: str) -> bool:
    """Check if text contains blocked words."""
    words = set(text.lower().split())
    return not words.intersection(BLOCKED_WORDS)


def _sanitize_scene(scene: str) -> str:
    """Replace unsafe scene with safe default. Log warning."""
    if _is_safe_prompt(scene):
        return scene
    logger.warning("Unsafe content detected in scene, replacing with safe default")
    return SAFE_DEFAULT_SCENE


# ---------------------------------------------------------------------------
# Provider management — fallback chain
# ---------------------------------------------------------------------------

_providers: dict[str, object] = {}


def _get_provider(name: str) -> object:
    """Get or create singleton provider instance."""
    if name not in _providers:
        if name == "mistral_imagegen":
            from ..image_agent.providers.mistral_imagegen import MistralImageGenProvider
            _providers[name] = MistralImageGenProvider()
        elif name == "pollinations":
            from ..image_agent.providers.pollinations import PollinationsProvider
            _providers[name] = PollinationsProvider()
    return _providers[name]


# Mistral → Pollinations → Placeholder (always succeeds)
FALLBACK_CHAIN = ["mistral_imagegen", "pollinations"]


# ---------------------------------------------------------------------------
# Image normalization — ensures consistent output across providers
# ---------------------------------------------------------------------------

TARGET_SIZE = (1024, 1024)


def _normalize_image(image_path: str) -> str:
    """Normalize image to consistent size and PNG format.

    Resizes to TARGET_SIZE, converts to RGB PNG. Returns path to normalized
    file (may be same path if already correct, or new path if converted).
    Falls back to original path if PIL is not available or conversion fails.
    """
    try:
        from PIL import Image

        img = Image.open(image_path)

        # Convert to RGB if needed (e.g., RGBA, P mode)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")

        # Resize if not target size (use LANCZOS for quality)
        if img.size != TARGET_SIZE:
            img = img.resize(TARGET_SIZE, Image.LANCZOS)

        # Ensure PNG format
        if not image_path.endswith(".png"):
            png_path = image_path.rsplit(".", 1)[0] + ".png"
        else:
            png_path = image_path

        img.save(png_path, "PNG")
        logger.debug("Normalized image: %s → %s (%s)", image_path, png_path, img.size)
        return png_path

    except ImportError:
        logger.debug("PIL not available, skipping image normalization")
        return image_path
    except Exception:
        logger.exception("Image normalization failed for %s", image_path)
        return image_path


# ---------------------------------------------------------------------------
# Placeholder (last resort — always works, raster PNG via PIL)
# ---------------------------------------------------------------------------

def _create_placeholder(emotion: str) -> ImageResult:
    """Raster PNG placeholder with gradient + emoji text. Always works."""
    output_dir = Path(OUTPUT_DIR)
    output_dir.mkdir(parents=True, exist_ok=True)
    uid = uuid.uuid4().hex[:8]

    emoji_label = {
        "happy": ":-)",
        "sad": ":-(",
        "excited": "!!!",
        "scared": "o_o",
        "curious": "?!",
        "calm": "~~~",
        "mysterious": "***",
        "funny": "XD",
        "adventurous": ">>>"
    }
    label = emoji_label.get(emotion, "...")

    try:
        from PIL import Image, ImageDraw, ImageFont

        img = Image.new("RGB", TARGET_SIZE, color=(255, 228, 196))  # bisque
        draw = ImageDraw.Draw(img)

        # Gradient background: bisque → plum
        for y in range(TARGET_SIZE[1]):
            r = int(255 - (255 - 221) * y / TARGET_SIZE[1])
            g = int(228 - (228 - 160) * y / TARGET_SIZE[1])
            b = int(196 + (221 - 196) * y / TARGET_SIZE[1])
            draw.line([(0, y), (TARGET_SIZE[0], y)], fill=(r, g, b))

        # Emoji text
        # Try common system font paths across platforms
        _font_candidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",  # Linux
            "/System/Library/Fonts/Helvetica.ttc",               # macOS
            "C:\\Windows\\Fonts\\arial.ttf",                     # Windows
        ]
        font_large = font_small = None
        for font_path in _font_candidates:
            try:
                font_large = ImageFont.truetype(font_path, 120)
                font_small = ImageFont.truetype(font_path, 28)
                break
            except (OSError, IOError):
                continue
        if font_large is None:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()

        draw.text((TARGET_SIZE[0] // 2, 400), label, fill=(100, 100, 100),
                   font=font_large, anchor="mm")
        draw.text((TARGET_SIZE[0] // 2, 550), "Illustration loading...",
                   fill=(100, 100, 100), font=font_small, anchor="mm")

        output_path = output_dir / f"placeholder_{uid}.png"
        img.save(str(output_path), "PNG")

        # Base64 for inline display
        import io
        buf = io.BytesIO()
        img.save(buf, "PNG")
        png_b64 = base64.b64encode(buf.getvalue()).decode()

        return ImageResult(
            status="fallback",
            provider="placeholder",
            image_path=str(output_path),
            image_base64=f"data:image/png;base64,{png_b64}",
            generation_time_ms=0,
            prompt_used="placeholder",
        )

    except ImportError:
        # PIL not available — fall back to SVG
        logger.debug("PIL not available, creating SVG placeholder")
        svg_emoji_map = {
            "happy": "&#128522;", "sad": "&#128546;", "excited": "&#127881;",
            "scared": "&#128552;", "curious": "&#128269;", "calm": "&#127756;",
            "mysterious": "&#10024;", "funny": "&#128516;", "adventurous": "&#127796;",
        }
        emoji = svg_emoji_map.get(emotion, "&#128214;")

        svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFE4C4"/>
      <stop offset="100%" style="stop-color:#DDA0DD"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="512" y="450" font-size="120" text-anchor="middle">{emoji}</text>
  <text x="512" y="550" font-size="24" text-anchor="middle"
        fill="#666" font-family="sans-serif">Illustration loading...</text>
</svg>"""
        output_path = output_dir / f"placeholder_{uid}.svg"
        output_path.write_text(svg)
        svg_b64 = base64.b64encode(svg.encode()).decode()

        return ImageResult(
            status="fallback",
            provider="placeholder",
            image_path=str(output_path),
            image_base64=f"data:image/svg+xml;base64,{svg_b64}",
            generation_time_ms=0,
            prompt_used="placeholder",
        )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _truncate_to_sentence(text: str, max_chars: int) -> str:
    """Truncate text at the last sentence boundary within max_chars."""
    if len(text) <= max_chars:
        return text
    truncated = text[:max_chars]
    for sep in [".", "!", "?"]:
        idx = truncated.rfind(sep)
        if idx > max_chars // 2:
            return truncated[: idx + 1]
    return truncated


def _parse_chapter(state: dict) -> dict:
    """Parse current_chapter from state.

    Supports two formats:
    - dict from FE: {scene, characters, emotion, chapter_number}
    - plain string from story_writer: raw chapter text
    """
    chapter = state.get("current_chapter")
    if not chapter:
        return {}

    if isinstance(chapter, dict):
        # Structured input from FE or future story_writer
        return {
            "scene": chapter.get("scene", chapter.get("text", "")[:500]),
            "characters": chapter.get("characters", []),
            "emotion": chapter.get("emotion", "excited"),
            "chapter_number": chapter.get("chapter_number", state.get("chapter_number", 1)),
        }

    # Plain string from story_writer
    return {
        "scene": _truncate_to_sentence(str(chapter), 500),
        "characters": [],
        "emotion": "excited",
        "chapter_number": state.get("chapter_number", 1),
    }


# ---------------------------------------------------------------------------
# Main ADK Tool
# ---------------------------------------------------------------------------

async def _generate_one_image(
    chapter_data: dict,
    state: dict,
    tool_context: ToolContext,
) -> dict:
    """Generate a single illustration for one chapter.

    Returns dict with generation status for this chapter.
    """
    scene = chapter_data.get("scene", chapter_data.get("text", "")[:500])
    characters_raw = chapter_data.get("characters", [])
    emotion = chapter_data.get("emotion", "excited")
    chapter_number = chapter_data.get("chapter_number", 1)

    # Safety filter
    scene = _sanitize_scene(scene)

    logger.info(
        "Generating illustration for chapter %d, emotion=%s, characters=%d",
        chapter_number, emotion, len(characters_raw),
    )

    # Style Bible — create on first chapter, reuse afterwards
    style_data = state.get("style_bible")
    if style_data:
        style = StyleBible(**style_data)
    else:
        story_theme = chapter_data.get("story_theme", "")
        style = create_default_style_bible(story_theme)
        state["style_bible"] = style.model_dump()

    # Character DNA — per character, create or reuse (LLM → static fallback)
    dna_store: dict = state.get("character_dna", {})
    story_theme = state.get("story_theme", "children's adventure")
    characters: list[CharacterDNA] = []
    main_seed: int | None = None

    for char_info in characters_raw:
        if isinstance(char_info, str):
            name, role = char_info, "character"
        else:
            name = char_info.get("name", "Character")
            role = char_info.get("role", "character")

        dna = await get_or_create_character_dna(
            name=name,
            role=role,
            dna_store=dna_store,
            story_theme=story_theme,
            style_context=style.style_prefix,
        )

        characters.append(dna)
        if main_seed is None:
            main_seed = dna.seed

    state["character_dna"] = dna_store

    # Compose prompt
    scene_prompt, character_context = compose_prompt(scene, emotion, style, characters)

    logger.debug("Prompt: %s", scene_prompt)
    logger.debug("Character context: %s", character_context)

    # Fallback chain: Mistral → Pollinations → Placeholder
    result: ImageResult | None = None

    for prov_name in FALLBACK_CHAIN:
        try:
            provider = _get_provider(prov_name)
            result = provider.generate(
                prompt=scene_prompt,
                style_context=style.style_prefix,
                character_context=character_context,
                emotion=emotion,
                seed=main_seed,
            )
            if result and result.status == "success":
                logger.info("Generated with %s in %dms", prov_name, result.generation_time_ms)
                break
        except Exception:
            logger.exception("Provider %s failed", prov_name)
            continue

    if not result or result.status != "success":
        logger.warning("All providers failed for chapter %d, using placeholder", chapter_number)
        result = _create_placeholder(emotion)

    # Normalize image: resize to 1024x1024 PNG for consistent output
    if result and result.image_path and Path(result.image_path).exists():
        normalized = _normalize_image(result.image_path)
        if normalized != result.image_path:
            result.image_path = normalized

    # Save as ADK artifact so the UI can display the image
    if result and result.image_path and Path(result.image_path).exists():
        try:
            from google.genai.types import Part as GenaiPart

            image_bytes = Path(result.image_path).read_bytes()
            ext = Path(result.image_path).suffix.lower()
            mime = {".svg": "image/svg+xml",
                    ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}.get(ext, "image/png")
            artifact = GenaiPart.from_bytes(data=image_bytes, mime_type=mime)
            artifact_name = f"chapter_{chapter_number}_illustration.png"
            await tool_context.save_artifact(filename=artifact_name, artifact=artifact)
            logger.info("Saved artifact: %s", artifact_name)
        except Exception:
            logger.exception("Failed to save artifact for chapter %d", chapter_number)

    # Save to state
    state["current_image"] = {
        "status": result.status,
        "image_url": result.image_url,
        "image_path": result.image_path,
        "image_base64": result.image_base64,
        "provider": result.provider,
        "generation_time_ms": result.generation_time_ms,
        "prompt_used": result.prompt_used,
        "upsampled_prompt": result.upsampled_prompt,
    }

    history: list = state.get("illustration_history", [])
    history.append({
        "chapter": chapter_number,
        "image_path": result.image_path,
        "provider": result.provider,
        "prompt": result.prompt_used,
        "upsampled_prompt": result.upsampled_prompt,
    })
    state["illustration_history"] = history

    return {
        "status": result.status,
        "provider": result.provider,
        "image_path": result.image_path,
        "generation_time_ms": result.generation_time_ms,
        "chapter": chapter_number,
    }


async def generate_images(tool_context: ToolContext) -> dict:
    """Generate illustrations for ALL unillustrated story chapters.

    The story_writer may write multiple chapters in a single LLM turn.
    This tool reads ALL accumulated chapters from state["all_chapters"]
    and generates an image for each one that doesn't already have an
    entry in illustration_history.

    Falls back to state["current_chapter"] if all_chapters is not present.

    Returns:
        Dict with generation results for all chapters processed.
    """
    state = tool_context.state

    # Determine which chapters already have illustrations
    history: list = state.get("illustration_history", [])
    illustrated_chapters: set[int] = {entry["chapter"] for entry in history}

    # Collect chapters that need illustration
    all_chapters: list[dict] = state.get("all_chapters", [])

    if all_chapters:
        # Filter to only unillustrated chapters
        chapters_to_illustrate = [
            ch for ch in all_chapters
            if ch.get("chapter_number", 0) not in illustrated_chapters
        ]
    else:
        # Fallback: use current_chapter (legacy path)
        parsed = _parse_chapter(state)
        if not parsed:
            return {"status": "error", "message": "No chapters to illustrate in state"}
        chapter_num = parsed.get("chapter_number", 0)
        if chapter_num in illustrated_chapters:
            return {"status": "skipped", "message": f"Chapter {chapter_num} already illustrated"}
        chapters_to_illustrate = [parsed]

    if not chapters_to_illustrate:
        return {"status": "skipped", "message": "All chapters already illustrated"}

    logger.info(
        "Generating illustrations for %d chapters: %s",
        len(chapters_to_illustrate),
        [ch.get("chapter_number") for ch in chapters_to_illustrate],
    )

    # Reset Mistral conversation so all images in this batch share context
    # (agent sees previous illustrations → visual consistency)
    try:
        provider = _get_provider("mistral_imagegen")
        if hasattr(provider, "new_story"):
            provider.new_story()
    except Exception:
        pass  # provider may not be available

    # Generate image for each unillustrated chapter
    results = []
    for chapter_data in chapters_to_illustrate:
        result = await _generate_one_image(chapter_data, state, tool_context)
        results.append(result)

    total = len(results)
    successful = sum(1 for r in results if r["status"] == "success")
    fallbacks = sum(1 for r in results if r["status"] == "fallback")

    return {
        "status": "success" if successful > 0 else ("fallback" if fallbacks > 0 else "error"),
        "chapters_illustrated": total,
        "successful": successful,
        "fallbacks": fallbacks,
        "results": results,
        "message": f"Generated {total} illustrations ({successful} success, {fallbacks} fallback)",
    }
