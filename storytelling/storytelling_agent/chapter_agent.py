from google.adk.agents import LoopAgent, SequentialAgent

from .media_agent import media_agent
from .prompt_parser_agent import prompt_parser_agent
from .story_writer_agent import story_writer_agent

chapter_agent = SequentialAgent(
    name="chapter_agent",
    description="Produces one complete story chapter with text, audio, and images.",
    sub_agents=[story_writer_agent, media_agent],
)

story_loop = LoopAgent(
    name="story_loop",
    description="Iterates chapter generation until the target chapter count is reached.",
    sub_agents=[chapter_agent],
    max_iterations=5,
)

root_agent = SequentialAgent(
    name="storytelling_pipeline",
    description="Parses the user prompt then generates a multi-chapter children's story.",
    sub_agents=[prompt_parser_agent, story_loop],
)
