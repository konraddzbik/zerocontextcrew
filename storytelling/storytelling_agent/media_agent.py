from google.adk.agents import ParallelAgent

from .image_agent import image_agent

# NOTE: audio_agent disabled for testing — mock-only and 7B model can't do tool calls.
# Re-enable when audio backend is ready:
#   from .audio_agent import audio_agent
#   sub_agents=[image_agent, audio_agent],

media_agent = ParallelAgent(
    name="media_agent",
    description="Generates media assets (images) for the chapter.",
    sub_agents=[image_agent],
)
