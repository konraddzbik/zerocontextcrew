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

# Directory where generated audio files are stored
AUDIO_DIR = Path(AGENT_DIR) / "generated_audio"

# Set web=True if you intend to serve a web interface, False otherwise
SERVE_WEB_INTERFACE = True

# Call the function to get the FastAPI app instance
# Ensures the agent directory name ('storytelling_agent') matches the agent folder
app: FastAPI = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=SERVE_WEB_INTERFACE,
)

# Ensure the audio output directory exists
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# Mount static file serving for generated audio
# Files are accessible at /audio/{filename} (e.g. /audio/chapter_1_abc123.mp3)
app.mount("/audio", StaticFiles(directory=str(AUDIO_DIR)), name="audio")

if __name__ == "__main__":
    # Use the PORT environment variable provided by Cloud Run, defaulting to 8080
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
