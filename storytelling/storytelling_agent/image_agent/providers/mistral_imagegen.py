"""Mistral native Image Generation — Agents/Conversations API (beta).

Mistral LLM enriches the prompt, FLUX Pro generates the image.
"""

from __future__ import annotations

import hashlib
import logging
import os
import time
import uuid
from pathlib import Path

from . import ImageResult

MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY", "")
OUTPUT_DIR = os.environ.get("OUTPUT_DIR", "/tmp/storytime_images")

logger = logging.getLogger(__name__)


class MistralImageGenProvider:
    """Mistral native Image Generation via Agents/Conversations API.

    Creates a persistent agent on first use (one per process lifetime).
    Conversation state (conversation_id) is managed externally by the caller
    and passed into generate(). This keeps the provider stateless w.r.t.
    sessions, avoiding cross-story leakage in multi-session servers.
    """

    def __init__(self) -> None:
        self._client = None
        self._agent_id: str | None = None

    def _ensure_agent(self) -> None:
        """Lazy init: create Mistral client + agent on first use."""
        if self._client is not None:
            return

        from mistralai import Mistral

        self._client = Mistral(api_key=MISTRAL_API_KEY)
        agent = self._client.beta.agents.create(
            model="mistral-medium-2505",
            name="StoryTime Illustrator",
            tools=[{"type": "image_generation"}],
            instructions=(
                "You are a children's book illustrator creating a series of illustrations "
                "for the SAME storybook. ALL illustrations MUST share the same visual style.\n\n"
                "CRITICAL — CHARACTER CONSISTENCY:\n"
                "- Every character MUST look IDENTICAL across all illustrations.\n"
                "- ALWAYS include ALL listed accessories (scarves, hats, bows) — NEVER omit them.\n"
                "- Keep EXACT same colors, proportions, and distinguishing features.\n"
                "- If a character had a red scarf in illustration 1, they MUST have it in illustration 2 and 3.\n"
                "- Show characters from the front or 3/4 angle so their features are clearly visible.\n\n"
                "STYLE — MUST be consistent across ALL illustrations:\n"
                "- Watercolor children's book illustration style.\n"
                "- Soft brushstrokes, warm pastels, rounded shapes, gentle lighting.\n"
                "- Same level of detail and same art style in every image.\n\n"
                "NEVER include: scary elements, violence, text/watermarks, realistic photographs, "
                "dark themes, weapons, blood, horror, nsfw content."
            ),
        )
        self._agent_id = agent.id
        logger.info("Mistral agent created: %s", self._agent_id)

    def generate(
        self,
        prompt: str,
        style_context: str = "",
        character_context: str = "",
        emotion: str = "excited",
        conversation_id: str | None = None,
        **kwargs,
    ) -> ImageResult | None:
        """Generate an image via Mistral Agents/Conversations API.

        Args:
            conversation_id: If set, appends to an existing conversation so
                the agent can see previous illustrations (cross-chapter consistency).
                If None, starts a fresh conversation.

        Note: ``seed`` is accepted via **kwargs for interface compatibility with
        other providers but is not used — Mistral's image_generation tool does
        not expose a seed parameter.
        """
        if not MISTRAL_API_KEY:
            logger.warning("MISTRAL_API_KEY not set, skipping Mistral provider")
            return None

        try:
            self._ensure_agent()
        except Exception:
            logger.exception("Failed to create Mistral agent")
            return None

        # Build conversation input — characters FIRST for consistency
        parts = []
        if character_context:
            parts.append(
                "CHARACTERS (MUST appear EXACTLY as described — include ALL accessories):\n"
                f"{character_context}"
            )
        parts.append(f"\nSCENE: {prompt}")
        if style_context:
            parts.append(f"STYLE: {style_context}")
        parts.append(f"MOOD: {emotion}, safe for ages 3-8")
        if conversation_id:
            parts.append(
                "IMPORTANT: Use the EXACT SAME art style and character appearance "
                "as the previous illustration(s) in this conversation. "
                "Characters must look identical — same accessories, same colors, same proportions."
            )
        parts.append("Generate the illustration now. Square format. No text in image.")
        message = "\n".join(parts)

        logger.info(
            "Mistral imagegen request (agent=%s, conversation=%s)",
            self._agent_id, conversation_id or "NEW",
        )
        start = time.monotonic()

        try:
            if conversation_id:
                # Continue existing conversation — agent sees previous images!
                response = self._client.beta.conversations.append(
                    conversation_id=conversation_id,
                    inputs=message,
                )
            else:
                # Start new conversation for first image
                response = self._client.beta.conversations.start(
                    agent_id=self._agent_id,
                    inputs=message,
                )
                conversation_id = response.conversation_id
                logger.info("New Mistral conversation: %s", conversation_id)

            elapsed_ms = int((time.monotonic() - start) * 1000)

            # Extract image from response — look for file chunks
            image_data = None
            for output in reversed(response.outputs):
                if not hasattr(output, "content"):
                    continue
                for chunk in output.content:
                    if hasattr(chunk, "file_id") and chunk.file_id:
                        file_bytes = self._client.files.download(file_id=chunk.file_id).read()
                        image_data = file_bytes
                        break
                if image_data:
                    break

            if not image_data:
                logger.warning("Mistral response contained no image file")
                return None

            # Save to file
            output_dir = Path(OUTPUT_DIR)
            output_dir.mkdir(parents=True, exist_ok=True)
            content_hash = hashlib.md5(image_data[:256]).hexdigest()[:8]
            uid = uuid.uuid4().hex[:8]
            filename = f"mistral_{content_hash}_{uid}.png"
            output_path = output_dir / filename
            output_path.write_bytes(image_data)

            logger.info("Mistral saved: %s (%dms, %d bytes)", output_path, elapsed_ms, len(image_data))

            return ImageResult(
                status="success",
                provider="mistral_imagegen",
                image_path=str(output_path),
                generation_time_ms=elapsed_ms,
                prompt_used=message,
                upsampled_prompt="(upsampled by Mistral internally)",
                conversation_id=conversation_id,
            )

        except Exception:
            logger.exception("Mistral image generation failed")
            return None
