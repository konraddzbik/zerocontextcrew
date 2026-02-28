import os
import uuid
import logging
from pathlib import Path

import aiofiles
from dotenv import load_dotenv
from elevenlabs import AsyncElevenLabs, VoiceSettings
from elevenlabs.core import ApiError
from google.adk.tools import ToolContext

# Load .env relative to the storytelling/ project root (3 levels up from this file)
_ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(_ENV_PATH)

logger = logging.getLogger(__name__)

# ElevenLabs configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")

# Base URL for serving audio files to the frontend (no trailing slash)
APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:8080")

# Rachel — calm, gentle female voice ideal for bedtime stories
DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

# Voice settings tuned for soft, calm bedtime narration:
#   - High stability (0.85): consistent, soothing tone without erratic changes
#   - Moderate similarity (0.78): natural while staying close to the voice character
#   - Low style exaggeration (0.15): gentle delivery, no dramatic shifts
#   - Slower speed (0.85): relaxed pacing suitable for children falling asleep
VOICE_SETTINGS = VoiceSettings(
    stability=0.85,
    similarity_boost=0.78,
    style=0.15,
    speed=0.85,
)

# Output directory for generated audio files
AUDIO_OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "generated_audio"


def _ensure_output_dir() -> Path:
    """Create the audio output directory if it doesn't exist."""
    AUDIO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return AUDIO_OUTPUT_DIR


async def generate_audio(text: str, voice: str, tool_context: ToolContext) -> dict:
    """Generate audio narration via ElevenLabs text-to-speech API.

    Converts story chapter text into spoken audio using a soft, calm voice
    suitable for children's bedtime reading. Fully async to avoid blocking
    the event loop during the API call and file write.

    Args:
        text: The story text to convert to speech.
        voice: The voice name (used for logging; actual voice ID is configured
               via DEFAULT_VOICE_ID constant).
        tool_context: ADK tool context for accessing session state.

    Returns:
        dict with status, file path, and metadata on success,
        or status "error" with details on failure.
    """
    chapter_number = tool_context.state.get("chapter_number", 1)
    word_count = len(text.split())

    # --- Validate API key ---
    if not ELEVENLABS_API_KEY or ELEVENLABS_API_KEY.startswith("sk_your_"):
        error_msg = (
            "ELEVENLABS_API_KEY is not configured. "
            "Set a valid key in the .env file to enable audio generation."
        )
        logger.error(error_msg)
        return {
            "status": "error",
            "error_type": "configuration",
            "message": error_msg,
            "chapter": chapter_number,
        }

    # --- Validate input text ---
    if not text or not text.strip():
        error_msg = "Cannot generate audio from empty text."
        logger.warning(error_msg)
        return {
            "status": "error",
            "error_type": "validation",
            "message": error_msg,
            "chapter": chapter_number,
        }

    try:
        client = AsyncElevenLabs(api_key=ELEVENLABS_API_KEY)

        # Call ElevenLabs TTS API (async)
        audio_stream = client.text_to_speech.convert(
            voice_id=DEFAULT_VOICE_ID,
            text=text,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
            voice_settings=VOICE_SETTINGS,
        )

        # Collect audio bytes from the async generator
        chunks = []
        async for chunk in audio_stream:
            chunks.append(chunk)
        audio_bytes = b"".join(chunks)

        if not audio_bytes:
            error_msg = "ElevenLabs returned empty audio data."
            logger.error(error_msg)
            return {
                "status": "error",
                "error_type": "empty_response",
                "message": error_msg,
                "chapter": chapter_number,
            }

        # Save audio file to disk (async)
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

        audio_url = f"{APP_BASE_URL}/audio/{filename}"

        result = {
            "status": "success",
            "audio_id": audio_id,
            "audio_url": audio_url,
            "audio_file": str(filepath),
            "filename": filename,
            "voice": voice,
            "voice_id": DEFAULT_VOICE_ID,
            "duration_seconds_estimate": estimated_duration,
            "file_size_kb": file_size_kb,
            "chapter": chapter_number,
            "word_count": word_count,
            "message": (
                f"Audio generated for chapter {chapter_number} "
                f"({word_count} words, ~{estimated_duration}s, {file_size_kb} KB)"
            ),
        }

    except ApiError as exc:
        error_msg = f"ElevenLabs API error: {exc}"
        logger.error(error_msg)
        result = {
            "status": "error",
            "error_type": "api_error",
            "message": error_msg,
            "chapter": chapter_number,
        }

    except ConnectionError as exc:
        error_msg = f"Network error connecting to ElevenLabs: {exc}"
        logger.error(error_msg)
        result = {
            "status": "error",
            "error_type": "network_error",
            "message": error_msg,
            "chapter": chapter_number,
        }

    except TimeoutError as exc:
        error_msg = f"Request to ElevenLabs timed out: {exc}"
        logger.error(error_msg)
        result = {
            "status": "error",
            "error_type": "timeout",
            "message": error_msg,
            "chapter": chapter_number,
        }

    except OSError as exc:
        error_msg = f"Failed to save audio file to disk: {exc}"
        logger.error(error_msg)
        result = {
            "status": "error",
            "error_type": "file_system_error",
            "message": error_msg,
            "chapter": chapter_number,
        }

    except Exception as exc:
        error_msg = f"Unexpected error during audio generation: {exc}"
        logger.exception(error_msg)
        result = {
            "status": "error",
            "error_type": "unexpected",
            "message": error_msg,
            "chapter": chapter_number,
        }

    # Accumulate audio results across chapters (success or failure)
    audio_results = tool_context.state.get("all_audio_results", [])
    audio_results.append(result)
    tool_context.state["all_audio_results"] = audio_results

    return result
