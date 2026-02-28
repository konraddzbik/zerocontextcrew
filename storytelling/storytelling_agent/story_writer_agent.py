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
    if not callback_context.state.get("language"):
        callback_context.state["language"] = "English"
    if not callback_context.state.get("total_chapters"):
        callback_context.state["total_chapters"] = 3
    if not callback_context.state.get("current_chapter"):
        callback_context.state["current_chapter"] = ""


story_writer_agent = Agent(
    name="story_writer_agent",
    model=LiteLlm(model="mistral/mistral-large-latest"),
    description="Writes the next chapter of a children's story.",
    instruction="""You are a children's story writer. Your ONLY output should be the chapter text itself — pure story content, nothing else.

IMPORTANT: Do NOT describe what you are doing, do NOT mention tools, do NOT add meta-commentary. Only output the story chapter text.

Use the user's message in the conversation as the story request.

Write the story in: {language}

Story written so far:
{story_so_far}

Current chapter number: {chapter_number}
Total chapters planned: {total_chapters}

Rules:
- If there is no story so far, write the opening chapter that introduces characters and setting.
- If there is existing story, continue naturally from where it left off.
- Each chapter should be 200-400 words, vivid and engaging for children aged 5-10.
- Use simple language, colorful descriptions, and a sense of wonder.
- If this is NOT the final chapter, end with a mini cliffhanger or transition that leads into the next chapter.
- If this IS the final chapter (chapter_number equals total_chapters), wrap up the story with a satisfying conclusion.

After writing the chapter, call the save_chapter tool with the full chapter text. Do NOT say anything after calling the tool.""",
    tools=[save_chapter],
    before_agent_callback=_init_story_state,
)
