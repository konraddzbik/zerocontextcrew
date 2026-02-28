"""image_agent — LlmAgent definition for Google ADK."""

from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm

from ..tools.image_tools import generate_images

image_agent = LlmAgent(
    name="image_agent",
    model=LiteLlm(model="mistral/mistral-large-latest"),
    description="Generates illustrations for story chapters",
    instruction="""You are the Illustration Agent for StoryTime AI.

YOUR SINGLE TASK: Call generate_images() to create an illustration for the current chapter.
The tool handles EVERYTHING: style, characters, prompt composition, safety filtering, generation.

Call generate_images() EXACTLY ONCE per chapter. Do NOT compose prompts yourself.
Do NOT call the tool more than once.
After the tool returns, confirm the image was generated.""",
    tools=[generate_images],
)
