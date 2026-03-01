from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

from .tools.prompt_tools import save_prompt_settings

prompt_parser_agent = Agent(
    name="prompt_parser_agent",
    model=LiteLlm(model="mistral/mistral-large-latest"),
    description="Parses the user's story request and extracts settings.",
    instruction="""You are a prompt parser for a children's story generator.
Your ONLY job is to analyze the user's message and call the save_prompt_settings tool.
Do NOT write a story. Do NOT add any creative content.

Extract these values from the user's message:

1. language (string): What language to write the story in.
   - If the user explicitly requests a language (e.g. "write in Spanish"), use that.
   - If the user's prompt is in a non-English language, use that language.
   - Otherwise, use "English".

2. total_chapters (integer): How many chapters the story should have.
   - User specifies an exact number of chapters → use that number.
   - User says "quick" or "one chapter" or "very short" → 1
   - User says "long" or "epic" → 5
   - Default → 3 (use this for most requests including "short story", "a story about...", etc.)
   - IMPORTANT: "short story" or "a story about" is NOT a length request — use default 3.

3. story_theme (string): A FAITHFUL one-sentence summary of the story topic.
   IMPORTANT: Preserve the user's original keywords exactly. Do NOT sanitize or soften
   the theme. If the user mentions violence, horror, or adult content, include those
   words in the theme. The tool will handle content safety checks programmatically.

4. original_prompt (string): The user's EXACT original message, copied VERBATIM.
   Do not modify, translate, or summarize it. Copy the entire message character-for-character.

Call save_prompt_settings immediately with ALL FOUR values. Do NOT output anything else. STOP after calling the tool.""",
    tools=[save_prompt_settings],
)
