"""Image generation providers."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ImageResult:
    """Result of image generation."""

    status: str  # "success" | "fallback" | "error"
    provider: str
    image_path: str | None = None
    image_url: str | None = None
    image_base64: str | None = None
    generation_time_ms: int = 0
    prompt_used: str = ""
    upsampled_prompt: str | None = None
