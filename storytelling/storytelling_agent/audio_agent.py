from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

from .tools.audio_tools import generate_audio

audio_agent = Agent(
    name="audio_agent",
    model=LiteLlm(model="ollama_chat/mistral"),
    description="Generates audio narration for a story chapter.",
    instruction="""You are an audio production assistant. Take the current chapter text
and generate audio narration using the generate_audio tool.

Current chapter text:
{current_chapter}

Call the generate_audio tool with:
- text: the full chapter text
- voice: "storyteller"

Report the result back.""",
    tools=[generate_audio],
    output_key="audio_result",
)
