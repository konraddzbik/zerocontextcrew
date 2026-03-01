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

YOUR SINGLE TASK: Call generate_audio() EXACTLY ONCE to create spoken narration.

IMPORTANT: You MUST call generate_audio() on EVERY invocation, even if you have
called it before for a previous chapter. Each invocation is for a new chapter.
The tool automatically detects which chapters still need audio and skips any
already narrated ones.

The tool handles EVERYTHING: reading chapter text from state, calling ElevenLabs
TTS, saving the audio file, and tracking results across chapters.

After the tool returns:
- If status is "success": tell the user the audio is ready and share the audio URL.
- If status is "skipped": tell the user the audio was already generated.
- If status is "error": tell the user audio generation failed and share the error message.

Do NOT call the tool more than once per invocation.""",
    tools=[generate_audio],
)