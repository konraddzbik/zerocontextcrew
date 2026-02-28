from google.adk.tools import ToolContext


def save_chapter(
    chapter_text: str,
    scene_description: str,
    characters: list[dict],
    emotion: str,
    tool_context: ToolContext,
) -> dict:
    """Save the newly generated chapter to the story state.

    Appends the chapter text to the accumulated story and increments the chapter counter.

    Args:
        chapter_text: The full text of the newly generated chapter.
        scene_description: A short (1-2 sentences) visual description of the main scene
            for the illustrator. Describe what should be DRAWN, not what happens in the plot.
        characters: List of characters appearing in this chapter.
            Each character is a dict with "name" (str) and "role" (str).
            Example: [{"name": "Luna", "role": "bunny"}, {"name": "Max", "role": "fox"}]
        emotion: The dominant mood/emotion of this chapter.
            One of: "happy", "sad", "excited", "scared", "curious", "calm", "mysterious", "funny", "adventurous".
        tool_context: ADK tool context for accessing session state.

    Returns:
        Confirmation with the chapter number saved.
    """
    total_chapters = tool_context.state.get("total_chapters", 3)
    current_chapter_num = tool_context.state.get("chapter_number", 0)

    # Guard: prevent writing past the planned chapter count
    if current_chapter_num >= total_chapters:
        tool_context.actions.escalate = True
        return {
            "status": "rejected",
            "reason": f"Story is already complete ({current_chapter_num}/{total_chapters} chapters). STOP writing.",
            "instruction": "The story is FINISHED. Do NOT write more chapters. STOP now.",
        }

    chapter_number = current_chapter_num + 1
    story_so_far = tool_context.state.get("story_so_far", "")

    separator = f"\n\n--- Chapter {chapter_number} ---\n\n"
    story_so_far += separator + chapter_text

    tool_context.state["story_so_far"] = story_so_far
    tool_context.state["chapter_number"] = chapter_number

    chapter_data = {
        "text": chapter_text,
        "scene": scene_description,
        "characters": characters,
        "emotion": emotion,
        "chapter_number": chapter_number,
    }

    # Single source of truth: all_chapters list. current_chapter is a convenience
    # alias for other agents (image_agent, audio_agent) that read the latest chapter.
    all_chapters: list = tool_context.state.get("all_chapters", [])
    all_chapters.append(chapter_data)
    tool_context.state["all_chapters"] = all_chapters
    tool_context.state["current_chapter"] = all_chapters[-1]

    is_final = chapter_number >= total_chapters

    if is_final:
        tool_context.actions.escalate = True
        instruction = "Chapter saved. The story is COMPLETE. Do NOT write another chapter. STOP now."
    else:
        instruction = f"Chapter {chapter_number} saved. Your task for this iteration is COMPLETE. STOP now and wait for the next iteration."

    return {
        "status": "saved",
        "chapter_number": chapter_number,
        "total_chapters": total_chapters,
        "is_final_chapter": is_final,
        "total_story_length": len(story_so_far),
        "instruction": instruction,
    }
