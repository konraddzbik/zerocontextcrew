from google.adk.agents import Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models.lite_llm import LiteLlm

from .tools.story_tools import save_chapter


def _init_story_state(callback_context: CallbackContext):
    """Initialize story state variables with defaults on the first iteration."""
    if not callback_context.state.get("story_so_far"):
        callback_context.state["story_so_far"] = "(No story written yet)"
    if not callback_context.state.get("chapter_number"):
        callback_context.state["chapter_number"] = 0


story_writer_agent = Agent(
    name="story_writer_agent",
    model=LiteLlm(model="ollama_chat/mistral"),
    description="Writes the next chapter of a children's story.",
    instruction="""You are a creative children's story writer. Your job is to write
the next chapter of an engaging, age-appropriate story for children.

Use the user's message in the conversation as the story request.

Story written so far:
{story_so_far}

Current chapter number: {chapter_number}

Rules:
- If there is no story so far, write the opening chapter that introduces characters and setting.
- If there is existing story, continue naturally from where it left off.
- Each chapter should be 200-400 words, vivid and engaging for children aged 5-10.
- Use simple language, colorful descriptions, and a sense of wonder.
- End each chapter with a mini cliffhanger or transition that leads into the next chapter.
- On the final chapter (chapter 3), wrap up the story with a satisfying conclusion.

After writing the chapter, you MUST call the save_chapter tool with the full chapter text
to persist it for the next iteration.""",
    tools=[save_chapter],
    output_key="current_chapter",
    before_agent_callback=_init_story_state,
)
