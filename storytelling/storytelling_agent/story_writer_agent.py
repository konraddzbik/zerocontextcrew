from google.adk.agents import Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models.lite_llm import LiteLlm
from google.genai import types as genai_types

from .tools.story_tools import save_chapter


def _init_story_state(callback_context: CallbackContext):
    """Initialize story state variables with defaults on the first iteration.

    Uses ``not in`` instead of ``not state.get(...)`` to avoid falsy-value bugs:
    ``not 0`` is True, which would reset chapter_number every iteration.
    """
    # --- Content safety gate ---
    # If prompt_parser_agent blocked the content, skip story writing entirely.
    # Returns Content to bypass the LLM — no chapter is written, no API call made.
    if callback_context.state.get("content_blocked"):
        reason = callback_context.state.get(
            "block_reason", "Content not suitable for children."
        )
        return genai_types.Content(
            role="model",
            parts=[genai_types.Part(text=f"STORY BLOCKED: {reason}")],
        )

    if "story_so_far" not in callback_context.state:
        callback_context.state["story_so_far"] = "(No story written yet)"
    if "chapter_number" not in callback_context.state:
        callback_context.state["chapter_number"] = 0
    if "language" not in callback_context.state:
        callback_context.state["language"] = "English"
    if "total_chapters" not in callback_context.state:
        callback_context.state["total_chapters"] = 3
    if "current_chapter" not in callback_context.state:
        callback_context.state["current_chapter"] = ""
    # Reset per-iteration guard counter (used by save_chapter Guard 2)
    callback_context.state["_chapter_guard_rejects"] = 0


story_writer_agent = Agent(
    name="story_writer_agent",
    model=LiteLlm(model="mistral/mistral-large-latest", temperature=0.7),
    description="Writes the next chapter of a children's story.",
    instruction="""You are a children's story writer.

Use the user's message in the conversation as the story request.

Write the story in: {language}

Story written so far:
{story_so_far}

Current chapter number: {chapter_number}
Total chapters planned: {total_chapters}

Rules:
- Write EXACTLY ONE chapter per invocation. Do NOT write multiple chapters.
- If there is no story so far, write the opening chapter that introduces characters and setting.
- If there is existing story, continue naturally from where it left off.
- Each chapter should be 200-400 words, vivid and engaging for children aged 5-10.
- Use simple language, colorful descriptions, and a sense of wonder.
- Keep the story safe and positive — no violence, battles, evil characters, or dark themes.
- If this is NOT the final chapter, end with a mini cliffhanger or transition.
- If this IS the final chapter (chapter_number equals total_chapters), wrap up with a satisfying conclusion.

After writing the chapter, you MUST call save_chapter with ALL of these arguments:
- chapter_text: the full chapter text you wrote
- scene_description: ALWAYS IN ENGLISH, regardless of story language. A SHORT (1-2 sentences) visual description of the main scene for an illustrator. Describe what should be DRAWN — setting, character positions, key visual elements. Example: "A small white bunny stands at the entrance of a glowing crystal cave, surrounded by colorful butterflies."
- characters: a list of the MAIN characters in this chapter (max 4), each with "name" and "role". The "role" MUST be a SHORT English word describing what the character IS (species or type), NOT a description. Example: [{"name": "Luna", "role": "bunny"}, {"name": "Max", "role": "fox"}]. Good roles: "dog", "cat", "puppy", "boy", "girl", "wizard". Bad roles: "a brave young fox who loves adventure" — too long!
- emotion: the dominant mood — one of: happy, sad, excited, scared, curious, calm, mysterious, funny, adventurous

Do NOT say anything after calling the tool. STOP immediately.""",
    tools=[save_chapter],
    before_agent_callback=_init_story_state,
)
