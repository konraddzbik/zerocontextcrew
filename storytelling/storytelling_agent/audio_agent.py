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

If the tool returns a status of "success", report the result including the file
path and chapter number.""",
    tools=[generate_audio],
    output_key="audio_result",
)
