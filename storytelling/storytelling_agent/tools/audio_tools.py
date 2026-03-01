"""ElevenLabs text-to-speech tool for generating story chapter narration.

Converts chapter text into spoken audio using a soft, calm voice suitable
for children's bedtime reading.  Fully async to avoid blocking the event
loop during the API call and file write.

Generated MP3 files are saved to ``storytelling/generated_audio/`` and
served by the background HTTP file server (see :mod:`audio_server`).
"""

import logging
import os
import uuid
from pathlib import Path
from typing import Any

import aiofiles
from dotenv import load_dotenv
from elevenlabs import AsyncElevenLabs, VoiceSettings
from elevenlabs.core import ApiError
from google.adk.tools.tool_context import ToolContext

from . import audio_server

# Load .env relative to the storytelling/ project root (3 levels up from this file)
_ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(_ENV_PATH)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# ElevenLabs configuration
# ---------------------------------------------------------------------------

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")

#: Rachel — calm, gentle female voice ideal for bedtime stories.
DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

#: Voice settings tuned for soft, calm bedtime narration.
VOICE_SETTINGS = VoiceSettings(
    stability=0.85,         # consistent, soothing tone
    similarity_boost=0.78,  # natural while staying in character
    style=0.15,             # gentle delivery, no dramatic shifts
    speed=0.85,             # relaxed pacing for children falling asleep
)

# Re-export for tests that reference these via audio_tools
AUDIO_OUTPUT_DIR = audio_server.AUDIO_OUTPUT_DIR
AUDIO_SERVER_PORT = audio_server.AUDIO_SERVER_PORT
APP_BASE_URL = audio_server.APP_BASE_URL


def _ensure_output_dir() -> Path:
    """Create the audio output directory if it doesn't exist."""
    AUDIO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return AUDIO_OUTPUT_DIR


def _extract_text(chapter_data: Any) -> str:
    """Extract plain text from a chapter entry.

    Supports both dict (structured from save_chapter) and plain string formats.
    """
    if isinstance(chapter_data, dict):
        return chapter_data.get("text", "")
    return str(chapter_data) if chapter_data else ""


async def _generate_one_audio(
    chapter_data: Any,
    chapter_number: int,
    tool_context: ToolContext,
) -> dict:
    """Generate audio for a single chapter and persist the result to state.

    Returns a result dict with status, audio_url, and metadata.
    """
    text = _extract_text(chapter_data)
    word_count = len(text.split()) if text else 0

    # --- Validate input text ---
    if not text or not text.strip():
        error_msg = f"Cannot generate audio for chapter {chapter_number}: no text found."
        logger.warning(error_msg)
        result = {
            "status": "error",
            "error_type": "validation",
            "message": error_msg,
            "chapter": chapter_number,
        }
        _accumulate_result(tool_context.state, result)
        return result

    # --- Validate API key ---
    if not ELEVENLABS_API_KEY or ELEVENLABS_API_KEY.startswith("sk_your_"):
        error_msg = (
            "ELEVENLABS_API_KEY is not configured. "
            "Set a valid key in the .env file to enable audio generation."
        )
        logger.error(error_msg)
        result = {
            "status": "error",
            "error_type": "configuration",
            "message": error_msg,
            "chapter": chapter_number,
        }
        _accumulate_result(tool_context.state, result)
        return result

    # Ensure the background file server is running
    audio_server.ensure_running()

    try:
        client = AsyncElevenLabs(api_key=ELEVENLABS_API_KEY)

        audio_stream = client.text_to_speech.convert(
            voice_id=DEFAULT_VOICE_ID,
            text=text,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
            voice_settings=VOICE_SETTINGS,
        )

        chunks = []
        async for chunk in audio_stream:
            chunks.append(chunk)
        audio_bytes = b"".join(chunks)

        if not audio_bytes:
            error_msg = f"ElevenLabs returned empty audio for chapter {chapter_number}."
            logger.error(error_msg)
            result = {
                "status": "error",
                "error_type": "empty_response",
                "message": error_msg,
                "chapter": chapter_number,
            }
            _accumulate_result(tool_context.state, result)
            return result

        # Save audio file to disk
        output_dir = _ensure_output_dir()
        audio_id = uuid.uuid4().hex[:12]
        filename = f"chapter_{chapter_number}_{audio_id}.mp3"
        filepath = output_dir / filename

        async with aiofiles.open(filepath, "wb") as f:
            await f.write(audio_bytes)

        file_size_kb = round(len(audio_bytes) / 1024, 1)
        estimated_duration = round(word_count / 2.5, 1)  # ~150 wpm

        logger.info(
            "Audio generated for chapter %d: %s (%.1f KB)",
            chapter_number,
            filename,
            file_size_kb,
        )

        audio_url = f"{audio_server.APP_BASE_URL}/{filename}"

        result = {
            "status": "success",
            "chapter": chapter_number,
            "audio_url": audio_url,
            "duration_seconds_estimate": estimated_duration,
            "file_size_kb": file_size_kb,
            "audio_id": audio_id,
            "audio_file": str(filepath),
            "filename": filename,
            "word_count": word_count,
        }

    except ApiError as exc:
        error_msg = f"ElevenLabs API error for chapter {chapter_number}: {exc}"
        logger.error(error_msg)
        result = {
            "status": "error",
            "error_type": "api_error",
            "message": error_msg,
            "chapter": chapter_number,
        }

    except ConnectionError as exc:
        error_msg = f"Network error connecting to ElevenLabs (chapter {chapter_number}): {exc}"
        logger.error(error_msg)
        result = {
            "status": "error",
            "error_type": "network_error",
            "message": error_msg,
            "chapter": chapter_number,
        }

    except TimeoutError as exc:
        error_msg = f"Request to ElevenLabs timed out (chapter {chapter_number}): {exc}"
        logger.error(error_msg)
        result = {
            "status": "error",
            "error_type": "timeout",
            "message": error_msg,
            "chapter": chapter_number,
        }

    except OSError as exc:
        error_msg = f"Failed to save audio file for chapter {chapter_number}: {exc}"
        logger.error(error_msg)
        result = {
            "status": "error",
            "error_type": "file_system_error",
            "message": error_msg,
            "chapter": chapter_number,
        }

    except Exception as exc:
        error_msg = f"Unexpected error during audio generation (chapter {chapter_number}): {exc}"
        logger.exception(error_msg)
        result = {
            "status": "error",
            "error_type": "unexpected",
            "message": error_msg,
            "chapter": chapter_number,
        }

    _accumulate_result(tool_context.state, result)
    return result


async def generate_audio(tool_context: ToolContext) -> dict:
    """Generate audio narration for all story chapters not yet narrated.

    Reads accumulated chapters from state["all_chapters"] and generates
    audio for each one that does not already have an entry in
    state["all_audio_results"].  Falls back to state["current_chapter"]
    when all_chapters is not present.

    Args:
        tool_context: ADK tool context for reading/writing session state.

    Returns:
        dict with generation results for all chapters processed.
    """
    state = tool_context.state

    # Determine which chapters already have audio
    audio_history: list = state.get("all_audio_results", [])
    narrated_chapters: set[int] = {
        r["chapter"] for r in audio_history if r.get("status") == "success"
    }

    # Collect all_chapters from state (written by save_chapter)
    all_chapters: list = state.get("all_chapters", [])

    if all_chapters:
        chapters_to_narrate = [
            ch for ch in all_chapters
            if ch.get("chapter_number", 0) not in narrated_chapters
        ]
    else:
        # Fallback: use current_chapter
        current = state.get("current_chapter")
        if not current:
            return {"status": "error", "message": "No chapter text found in state."}
        chapter_num = (
            current.get("chapter_number", state.get("chapter_number", 1))
            if isinstance(current, dict)
            else state.get("chapter_number", 1)
        )
        if chapter_num in narrated_chapters:
            return {"status": "skipped", "message": f"Chapter {chapter_num} already narrated."}
        chapters_to_narrate = [current]

    if not chapters_to_narrate:
        return {"status": "skipped", "message": "All chapters already narrated."}

    logger.info(
        "Generating audio for %d chapter(s): %s",
        len(chapters_to_narrate),
        [ch.get("chapter_number") for ch in chapters_to_narrate],
    )

    results = []
    for chapter_data in chapters_to_narrate:
        chapter_number = (
            chapter_data.get("chapter_number", state.get("chapter_number", 1))
            if isinstance(chapter_data, dict)
            else state.get("chapter_number", 1)
        )
        result = await _generate_one_audio(chapter_data, chapter_number, tool_context)
        results.append(result)

    total = len(results)
    successful = sum(1 for r in results if r["status"] == "success")
    failed = total - successful

    # Build a human-readable summary for the LLM to relay to the user
    if successful > 0:
        success_details = [
            f"Chapter {r['chapter']}: {r['audio_url']} "
            f"(~{r.get('duration_seconds_estimate', '?')}s, {r.get('file_size_kb', '?')}KB)"
            for r in results if r["status"] == "success"
        ]
        summary = (
            f"Audio narration ready for {successful} chapter(s):\n"
            + "\n".join(success_details)
        )
        if failed:
            summary += f"\n{failed} chapter(s) failed."
        overall_status = "success"
    else:
        summary = f"Audio generation failed for all {total} chapter(s)."
        overall_status = "error"

    return {
        "status": overall_status,
        "chapters_narrated": total,
        "successful": successful,
        "failed": failed,
        "results": results,
        "message": summary,
    }


def _accumulate_result(state: Any, result: dict) -> None:
    """Append result to all_audio_results in session state."""
    audio_results = state.get("all_audio_results", [])
    audio_results.append(result)
    state["all_audio_results"] = audio_results
