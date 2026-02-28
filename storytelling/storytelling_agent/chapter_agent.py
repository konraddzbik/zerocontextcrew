from google.adk.agents import LoopAgent, SequentialAgent

from .media_agent import media_agent
from .story_writer_agent import story_writer_agent

chapter_agent = SequentialAgent(
    name="chapter_agent",
    description="Produces one complete story chapter with text, audio, and images.",
    sub_agents=[story_writer_agent, media_agent],
)

root_agent = LoopAgent(
    name="storytelling_loop",
    description="Generates a two-chapter children's story with audio and illustrations.",
    sub_agents=[chapter_agent],
    max_iterations=2,
)
