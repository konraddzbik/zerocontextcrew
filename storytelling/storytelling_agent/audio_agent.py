"""Audio agent — LlmAgent definition for Google ADK.

LLMAgent backed by a single tool.
The LLM's only job is to call generate_audio() once; all ElevenLabs TTS
logic, state management, and error handling live inside the tool.
"""

from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm

from .tools.audio_tools import generate_audio

audio_agent = LlmAgent(
    name="audio_agent",
    model=LiteLlm(model="mistral/mistral-large-latest", temperature=0.1),
    description="Narrates the current story chapter as audio. Generates audio narration for story chapters using ElevenLabs TTS",
    instruction="""You are an audio narrator for a children's storybook.

YOUR SINGLE TASK: Call generate_audio() EXACTLY ONCE to narrate the current chapter.

The tool reads the current chapter from state and generates one audio file.
It handles everything: the ElevenLabs API call, saving the file, and returning the URL.

After the tool returns, reply with exactly one word: done""",
    tools=[generate_audio],
)