from google.adk.tools import ToolContext


def save_prompt_settings(
    language: str,
    total_chapters: int,
    story_theme: str,
    tool_context: ToolContext,
) -> dict:
    """Save the parsed prompt settings to session state.

    Args:
        language: The language to write the story in (e.g. "English", "Polish", "Spanish").
        total_chapters: The number of chapters the story should have (1, 3, or 5, or user-specified).
        story_theme: A brief summary of the story theme/request extracted from the user's prompt.
        tool_context: ADK tool context for accessing session state.

    Returns:
        Confirmation of the saved settings.
    """
    tool_context.state["language"] = language
    tool_context.state["total_chapters"] = total_chapters
    tool_context.state["story_theme"] = story_theme

    return {
        "status": "saved",
        "language": language,
        "total_chapters": total_chapters,
        "story_theme": story_theme,
    }
