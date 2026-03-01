from google.adk.agents import ParallelAgent

from .image_agent import image_agent
from .audio_agent import audio_agent

media_agent = ParallelAgent(
    name="media_agent",
    description="Generates media assets (images) for the chapter.",
    sub_agents=[image_agent, audio_agent],
)
