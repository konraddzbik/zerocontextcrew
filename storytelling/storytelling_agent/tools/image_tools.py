import uuid

from google.adk.tools import ToolContext


def generate_images(
    scene_descriptions: list[str], tool_context: ToolContext
) -> dict:
    """Mock image generation API call.

    Simulates generating images from scene descriptions.
    Returns placeholder image URLs instead of making real API calls.

    Args:
        scene_descriptions: A list of 3-4 scene descriptions to generate images for.
        tool_context: ADK tool context for accessing session state.

    Returns:
        Mock image generation result with URLs for each scene.
    """
    chapter_number = tool_context.state.get("chapter_number", 1)

    images = []
    for i, description in enumerate(scene_descriptions):
        image_id = uuid.uuid4().hex[:12]
        images.append(
            {
                "image_id": image_id,
                "image_url": f"https://mock-images.example.com/img/{image_id}.png",
                "scene_index": i + 1,
                "description": description,
            }
        )

    result = {
        "status": "success",
        "chapter": chapter_number,
        "image_count": len(images),
        "images": images,
        "message": f"[MOCK] Generated {len(images)} images for chapter {chapter_number}",
    }

    # Accumulate image results across chapters
    image_results = tool_context.state.get("all_image_results", [])
    image_results.append(result)
    tool_context.state["all_image_results"] = image_results

    return result
