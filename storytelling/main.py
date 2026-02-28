"""Storytelling server — use this instead of ``adk web .``

Start with:
    cd storytelling
    .venv/bin/python main.py

This gives you everything ``adk web .`` provides (dev UI at /dev-ui/, agent
endpoints, etc.) PLUS the /audio/ static mount for serving generated audio
files.  ``adk web .`` does NOT load main.py and therefore cannot serve audio.
"""

import os
from pathlib import Path

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from google.adk.cli.fast_api import get_fast_api_app

# Get the directory where main.py is located
AGENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Load .env from the same directory as main.py (works regardless of CWD)
load_dotenv(Path(AGENT_DIR) / ".env")

# Default port — same as ``adk web`` so bookmarks / URLs stay consistent
PORT = int(os.environ.get("PORT", 8000))

# Directory where generated audio files are stored
AUDIO_DIR = Path(AGENT_DIR) / "generated_audio"

# Call the function to get the FastAPI app instance — identical to what
# ``adk web .`` builds internally, including the /dev-ui/ web interface.
app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=True,
)

# Ensure the audio output directory exists
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# Mount static file serving for generated audio.
# Files are accessible at /audio/{filename} (e.g. /audio/chapter_1_abc123.mp3)
app.mount("/audio", StaticFiles(directory=str(AUDIO_DIR)), name="audio")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
