import uuid

from google.adk.tools import ToolContext


def generate_audio(text: str, voice: str, tool_context: ToolContext) -> dict:
    """Mock ElevenLabs text-to-speech API call.

    Simulates sending text to ElevenLabs for audio generation.
    Returns placeholder audio metadata instead of making a real API call.

    Args:
        text: The story text to convert to speech.
        voice: The voice name to use (e.g. "storyteller", "narrator").
        tool_context: ADK tool context for accessing session state.

    Returns:
        Mock audio generation result with URL and metadata.
    """
    audio_id = uuid.uuid4().hex[:12]
    word_count = len(text.split())
    estimated_duration = round(word_count / 2.5, 1)  # ~150 words per minute

    chapter_number = tool_context.state.get("chapter_number", 1)

    result = {
        "status": "success",
        "audio_id": audio_id,
        "audio_url": f"https://mock-elevenlabs.example.com/audio/{audio_id}.mp3",
        "voice": voice,
        "duration_seconds": estimated_duration,
        "chapter": chapter_number,
        "message": f"[MOCK] Audio generated for chapter {chapter_number} "
        f"({word_count} words, ~{estimated_duration}s) using voice '{voice}'",
    }

    # Accumulate audio results across chapters
    audio_results = tool_context.state.get("all_audio_results", [])
    audio_results.append(result)
    tool_context.state["all_audio_results"] = audio_results

    return result
