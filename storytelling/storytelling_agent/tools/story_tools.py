from google.adk.tools import ToolContext


def save_chapter(chapter_text: str, tool_context: ToolContext) -> dict:
    """Save the newly generated chapter to the story state.

    Appends the chapter text to the accumulated story and increments the chapter counter.

    Args:
        chapter_text: The full text of the newly generated chapter.
        tool_context: ADK tool context for accessing session state.

    Returns:
        Confirmation with the chapter number saved.
    """
    chapter_number = tool_context.state.get("chapter_number", 0) + 1
    story_so_far = tool_context.state.get("story_so_far", "")

    separator = f"\n\n--- Chapter {chapter_number} ---\n\n"
    story_so_far += separator + chapter_text

    tool_context.state["story_so_far"] = story_so_far
    tool_context.state["chapter_number"] = chapter_number

    return {
        "status": "saved",
        "chapter_number": chapter_number,
        "total_story_length": len(story_so_far),
    }
