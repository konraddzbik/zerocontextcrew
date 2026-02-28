"""Pollinations.ai — free, zero config. Fallback when Mistral API is unavailable."""

from __future__ import annotations

import logging
import os
import time
import uuid
from pathlib import Path
from urllib.parse import quote

import httpx

from . import ImageResult

OUTPUT_DIR = os.environ.get("OUTPUT_DIR", "/tmp/storytime_images")

logger = logging.getLogger(__name__)

# Pollinations uses GET with URL-encoded prompt — keep it under 500 chars
_MAX_PROMPT_LENGTH = 480

# PNG magic bytes: first 8 bytes of any valid PNG file
_PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


class PollinationsProvider:
    """Pollinations.ai free image generation. No API key needed."""

    def generate(
        self,
        prompt: str,
        style_context: str = "",
        character_context: str = "",
        emotion: str = "excited",
        width: int = 1024,
        height: int = 1024,
        seed: int | None = None,
    ) -> ImageResult | None:
        # Build full prompt — style + characters + scene + safety
        parts = []
        if style_context:
            parts.append(style_context)
        if character_context:
            parts.append(character_context)
        parts.append(prompt)
        parts.append(f"Mood: {emotion}")
        parts.append("Children's book illustration, safe for children, gentle, wholesome.")
        full_prompt = ". ".join(parts)

        # Truncate if too long for URL
        if len(full_prompt) > _MAX_PROMPT_LENGTH:
            # Drop character_context first (longest), keep style + scene + safety
            parts_short = []
            if style_context:
                parts_short.append(style_context)
            parts_short.append(prompt[:200])
            parts_short.append("Children's book illustration, safe for children.")
            full_prompt = ". ".join(parts_short)

        encoded = quote(full_prompt, safe="")
        url = (
            f"https://image.pollinations.ai/prompt/{encoded}"
            f"?width={width}&height={height}&model=flux&nologo=true&enhance=false"
        )
        if seed is not None and isinstance(seed, int) and seed >= 0:
            url += f"&seed={seed}"

        logger.info("Pollinations request: %s", url[:200])
        start = time.monotonic()

        try:
            with httpx.Client(timeout=120, follow_redirects=True) as client:
                resp = client.get(url)
                resp.raise_for_status()

                if len(resp.content) < 1024:
                    logger.warning("Pollinations response too small (%d bytes)", len(resp.content))
                    return None

                # Validate response is actually a PNG image (not HTML error page)
                if not resp.content.startswith(_PNG_MAGIC):
                    content_type = resp.headers.get("content-type", "")
                    logger.warning(
                        "Pollinations response is not PNG (content-type=%s, first bytes=%r)",
                        content_type, resp.content[:16],
                    )
                    return None

                elapsed_ms = int((time.monotonic() - start) * 1000)

                output_dir = Path(OUTPUT_DIR)
                output_dir.mkdir(parents=True, exist_ok=True)
                uid = uuid.uuid4().hex[:8]
                filename = f"pollinations_{seed or 'noseed'}_{uid}.png"
                output_path = output_dir / filename
                output_path.write_bytes(resp.content)

                logger.info("Pollinations saved: %s (%dms, %d bytes)", output_path, elapsed_ms, len(resp.content))

                return ImageResult(
                    status="success",
                    provider="pollinations",
                    image_path=str(output_path),
                    generation_time_ms=elapsed_ms,
                    prompt_used=full_prompt,
                )

        except Exception:
            logger.exception("Pollinations generation failed")
            return None
