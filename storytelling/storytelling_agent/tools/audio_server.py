"""Lightweight background HTTP server for serving generated audio files.

Runs in a daemon thread so it works transparently with ``adk web .``
(which doesn't load ``main.py`` and therefore has no custom static mount).
The server starts lazily on the first call to :func:`ensure_running` and
dies automatically when the main process exits.

Configuration (via ``.env`` or environment variables):

    AUDIO_SERVER_PORT  – port to bind (default 8001)
    APP_BASE_URL       – public base URL returned in audio tool results
                         (default ``http://localhost:{AUDIO_SERVER_PORT}``)
"""

import logging
import os
import threading
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the storytelling/ project root (3 levels up from this file)
_ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(_ENV_PATH)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Public configuration
# ---------------------------------------------------------------------------

#: Directory where generated audio files are stored.
AUDIO_OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "generated_audio"

#: Port for the audio file server (separate from the ADK web server on 8000).
AUDIO_SERVER_PORT = int(os.getenv("AUDIO_SERVER_PORT", "8001"))

#: Base URL for constructing playable audio links.
APP_BASE_URL = os.getenv("APP_BASE_URL", f"http://localhost:{AUDIO_SERVER_PORT}")

# ---------------------------------------------------------------------------
# Internals
# ---------------------------------------------------------------------------

_started = False
_lock = threading.Lock()


class _QuietHandler(SimpleHTTPRequestHandler):
    """HTTP request handler that suppresses per-request log lines."""

    def log_message(self, format, *args):  # noqa: A002
        pass


def ensure_running() -> None:
    """Start the background audio file server if it is not already running.

    Safe to call multiple times — only the first call actually starts the
    server.  Subsequent calls return immediately.
    """
    global _started
    with _lock:
        if _started:
            return

        AUDIO_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        handler = partial(_QuietHandler, directory=str(AUDIO_OUTPUT_DIR))
        try:
            server = HTTPServer(("0.0.0.0", AUDIO_SERVER_PORT), handler)
        except OSError as exc:
            logger.warning(
                "Could not start audio file server on port %d: %s",
                AUDIO_SERVER_PORT,
                exc,
            )
            return

        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        _started = True
        logger.info(
            "Audio file server started at http://localhost:%d (serving %s)",
            AUDIO_SERVER_PORT,
            AUDIO_OUTPUT_DIR,
        )
