from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

from .tools.image_tools import generate_images

image_agent = Agent(
    name="image_agent",
    model=LiteLlm(model="mistral/mistral-large-latest"),
    description="Generates illustrations for a story chapter.",
    instruction="""You are an illustration director for a children's book. Read the current
chapter and identify 3-4 key visual scenes that would make great illustrations.

Current chapter text:
{current_chapter}

For each scene, write a short, vivid description suitable for an image generator
(e.g. "A small fox with a red scarf standing at the edge of a glowing forest at sunset").

Then call the generate_images tool with the list of scene descriptions.

After the tool returns, respond with:
Generated <image_count> illustrations for chapter <chapter>.

Do not include any URLs in your response.""",
    tools=[generate_images],
    output_key="image_result",
)
