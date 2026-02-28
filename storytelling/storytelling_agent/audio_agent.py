from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

from .tools.audio_tools import generate_audio

audio_agent = Agent(
    name="audio_agent",
    model=LiteLlm(model="ollama_chat/mistral"),
    description="Generates audio narration for a story chapter using ElevenLabs TTS.",
    instruction="""You are an audio production assistant for children's bedtime stories.
Take the current chapter text and generate a calm, soothing audio narration
using the generate_audio tool.

Current chapter text:
{current_chapter}

Call the generate_audio tool with:
- text: the full chapter text
- voice: "rachel"

If the tool returns a status of "error", report the error message clearly so it
can be investigated. Do not retry automatically.

If the tool returns a status of "success", you MUST format your response exactly
like this example (using the real audio_url and chapter number from the result):

**Chapter 1 Audio Ready**
[Listen to Chapter 1](http://localhost:8080/audio/chapter_1_abc123.mp3)
Duration: ~45s | Size: 120.5 KB

Replace the URL, chapter number, duration and size with the actual values from
the tool result. The markdown link is required so the user can click to play.""",
    tools=[generate_audio],
    output_key="audio_result",
)
