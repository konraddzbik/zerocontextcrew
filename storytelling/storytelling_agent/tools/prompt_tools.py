import re

from google.adk.tools import ToolContext

# ---------------------------------------------------------------------------
# Content safety filter for children's stories (ages 3-8)
# ---------------------------------------------------------------------------

BLOCKED_WORDS = frozenset({
    # Violence
    "violent", "violence", "blood", "bloody", "gore", "gory",
    "weapon", "weapons", "gun", "guns", "knife", "knives",
    "kill", "killing", "murder", "murdered", "death", "dead",
    "battle", "attack", "attacking", "war", "warfare",
    "brutal", "slaughter", "stab", "stabbing", "shoot", "shooting",
    "assault", "torture", "abuse",
    # Horror/dark
    "horror", "scary", "terrifying", "nightmare", "nightmares",
    "menacing", "evil", "demon", "demons", "devil",
    "zombie", "zombies", "undead",
    "haunted", "sinister", "creepy", "disturbing", "gruesome",
    "skeleton", "skeletons", "skull", "skulls", "corpse", "corpses",
    # Adult/NSFW
    "nude", "naked", "nsfw", "sexual", "erotic", "erotica",
    "sex", "pornographic", "sensual", "seductive",
    # Substances
    "drug", "drugs", "alcohol", "cigarette", "smoking", "drunk",
    # Self-harm
    "suicide", "selfharm",
})

BLOCKED_PHRASES = (
    "blood everywhere",
    "eat children",
    "kill children",
    "adult scene",
    "adult content",
    "romantic adult",
    "ghosts eat",
    "ghost eat",
)


def _check_content_safety(text: str) -> tuple[bool, list[str]]:
    """Check if text is safe for children's stories (ages 3-8).

    Returns:
        (is_safe, violations) — is_safe is True when no violations found.
    """
    if not text:
        return True, []

    violations: list[str] = []
    text_lower = text.lower()

    # Word-level check (regex handles punctuation: "blood," → "blood")
    words = set(re.findall(r"[a-z]+", text_lower))
    found = words & BLOCKED_WORDS
    if found:
        violations.extend(sorted(found))

    # Multi-word phrase check
    for phrase in BLOCKED_PHRASES:
        if phrase in text_lower:
            violations.append(f'"{phrase}"')

    return (len(violations) == 0, violations)


def save_prompt_settings(
    language: str,
    total_chapters: int,
    story_theme: str,
    original_prompt: str,
    tool_context: ToolContext,
) -> dict:
    """Save the parsed prompt settings to session state.

    Args:
        language: The language to write the story in (e.g. "English", "Polish", "Spanish").
        total_chapters: The number of chapters the story should have (1-5).
        story_theme: A brief summary of the story theme/request.
        original_prompt: The user's EXACT original message, copied verbatim without any changes.
        tool_context: ADK tool context for accessing session state.

    Returns:
        Confirmation of saved settings, or rejection if content is unsafe for children.
    """
    # --- Content Safety Check (Layer 1) ---
    # Check both the raw user prompt and extracted theme to catch unsafe content
    # even if the LLM sanitizes the theme during extraction.
    _, violations_orig = _check_content_safety(original_prompt)
    _, violations_theme = _check_content_safety(story_theme)

    # Deduplicate while preserving order
    all_violations = list(dict.fromkeys(violations_orig + violations_theme))

    if all_violations:
        tool_context.state["content_blocked"] = True
        tool_context.state["block_reason"] = (
            f"Content not suitable for children (ages 3-8). "
            f"Detected: {', '.join(all_violations)}"
        )
        return {
            "status": "blocked",
            "reason": tool_context.state["block_reason"],
            "instruction": (
                "Tell the user their story request contains themes not suitable "
                "for children aged 3-8. List the specific concerns. "
                "Suggest they try a different, child-friendly topic like: "
                "animals, friendship, space exploration, underwater adventures, "
                "magical gardens, or fairy tales."
            ),
        }

    # --- Save settings ---
    tool_context.state["language"] = language
    tool_context.state["total_chapters"] = total_chapters
    tool_context.state["story_theme"] = story_theme
    tool_context.state["content_blocked"] = False

    return {
        "status": "saved",
        "language": language,
        "total_chapters": total_chapters,
        "story_theme": story_theme,
    }
