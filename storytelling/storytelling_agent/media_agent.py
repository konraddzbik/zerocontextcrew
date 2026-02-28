from google.adk.agents import ParallelAgent

from .audio_agent import audio_agent
from .image_agent import image_agent

media_agent = ParallelAgent(
    name="media_agent",
    description="Generates audio and images for the chapter in parallel.",
    sub_agents=[audio_agent, image_agent],
)
