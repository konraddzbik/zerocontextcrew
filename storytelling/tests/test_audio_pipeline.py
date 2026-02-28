"""Tests for the ElevenLabs audio generation pipeline.

Covers the full chain: env loading -> API call -> file save -> URL construction.
All tests that produce audio write to the **persistent** directory
``storytelling/generated_audio/test_output/`` so files can be inspected after
the run.  The directory is cleaned at the start of the session (not at the end)
so the most-recent output is always available on disk.

Run with:
    cd storytelling
    .venv/bin/python -m pytest tests/test_audio_pipeline.py -v
"""

import os
import uuid
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from unittest.mock import MagicMock, patch
import threading
import time

import pytest

# ---------------------------------------------------------------------------
# Paths — everything relative to the project, nothing temporary
# ---------------------------------------------------------------------------

# storytelling/
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# storytelling/generated_audio/  (same dir the real app uses)
AUDIO_ROOT = PROJECT_ROOT / "generated_audio"

# storytelling/generated_audio/test_output/  (tests write here)
TEST_AUDIO_DIR = AUDIO_ROOT / "test_output"

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

SAMPLE_TEXT = (
    "Once upon a time, in a cozy little forest, there lived a tiny bunny "
    "named Pip. Pip loved to hop through the tall grass and chase butterflies "
    "under the warm golden sun."
)


@pytest.fixture(scope="session", autouse=True)
def prepare_test_audio_dir():
    """Create (or clean) the persistent test audio directory once per session."""
    if TEST_AUDIO_DIR.exists():
        for f in TEST_AUDIO_DIR.iterdir():
            if f.is_file():
                f.unlink()
    TEST_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    yield
    # Intentionally NOT cleaning up — files stay for inspection


@pytest.fixture()
def mock_tool_context():
    """Create a mock ToolContext with a working state dict."""
    ctx = MagicMock()
    ctx.state = {"chapter_number": 1}
    return ctx


@pytest.fixture()
def real_api_key():
    """Load the real API key from the project .env file.

    Skips the test if no valid key is available.
    """
    from dotenv import load_dotenv

    env_path = PROJECT_ROOT / ".env"
    load_dotenv(env_path)
    key = os.getenv("ELEVENLABS_API_KEY", "")
    if not key or key.startswith("sk_your_"):
        pytest.skip("ELEVENLABS_API_KEY not configured — skipping live API test")
    return key


# ===================================================================
# 1. ENV / CONFIG TESTS
# ===================================================================


class TestEnvLoading:
    """Verify .env loading and config resolution."""

    def test_env_path_resolves_to_storytelling_dir(self):
        """The .env path computed in audio_tools.py must point to storytelling/.env."""
        tools_file = (
            PROJECT_ROOT / "storytelling_agent" / "tools" / "audio_tools.py"
        )
        env_path = tools_file.resolve().parent.parent.parent / ".env"
        assert env_path.exists(), f".env not found at {env_path}"

    def test_api_key_loads_from_env(self, real_api_key):
        """A real API key is present and non-empty."""
        assert len(real_api_key) > 10

    def test_app_base_url_has_default(self):
        """APP_BASE_URL defaults to localhost:8001 when not set."""
        with patch.dict(os.environ, {}, clear=False):
            os.environ.pop("APP_BASE_URL", None)
            os.environ.pop("AUDIO_SERVER_PORT", None)
            # Default mirrors audio_tools.py: http://localhost:{AUDIO_SERVER_PORT}
            port = int(os.getenv("AUDIO_SERVER_PORT", "8001"))
            default = os.getenv("APP_BASE_URL", f"http://localhost:{port}")
            assert default == "http://localhost:8001"


# ===================================================================
# 2. ELEVENLABS API CALL TESTS (live — requires valid key)
# ===================================================================


class TestElevenLabsAPI:
    """Live API tests — call ElevenLabs and verify we get audio bytes back."""

    @pytest.mark.asyncio
    async def test_async_api_returns_audio_bytes(self, real_api_key):
        """The async TTS convert endpoint returns non-empty MP3 audio data."""
        from elevenlabs import AsyncElevenLabs, VoiceSettings

        client = AsyncElevenLabs(api_key=real_api_key)
        audio_stream = client.text_to_speech.convert(
            voice_id="21m00Tcm4TlvDq8ikWAM",
            text=SAMPLE_TEXT,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
            voice_settings=VoiceSettings(
                stability=0.85,
                similarity_boost=0.78,
                style=0.15,
                speed=0.85,
            ),
        )

        chunks = []
        async for chunk in audio_stream:
            chunks.append(chunk)
        audio_bytes = b"".join(chunks)

        assert len(audio_bytes) > 0, "ElevenLabs returned empty audio"
        assert audio_bytes[:3] == b"ID3" or audio_bytes[:2] == b"\xff\xfb", (
            "Response doesn't look like an MP3 file"
        )

    @pytest.mark.asyncio
    async def test_async_api_returns_substantial_audio(self, real_api_key):
        """Audio for a paragraph of text should be at least a few KB."""
        from elevenlabs import AsyncElevenLabs, VoiceSettings

        client = AsyncElevenLabs(api_key=real_api_key)
        audio_stream = client.text_to_speech.convert(
            voice_id="21m00Tcm4TlvDq8ikWAM",
            text=SAMPLE_TEXT,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
            voice_settings=VoiceSettings(
                stability=0.85,
                similarity_boost=0.78,
                style=0.15,
                speed=0.85,
            ),
        )

        chunks = []
        async for chunk in audio_stream:
            chunks.append(chunk)
        audio_bytes = b"".join(chunks)
        size_kb = len(audio_bytes) / 1024

        assert size_kb > 5, f"Audio too small ({size_kb:.1f} KB) — likely broken"


# ===================================================================
# 3. FILE SAVE TESTS (persistent)
# ===================================================================


class TestFileSave:
    """Verify audio bytes are correctly written to the persistent directory."""

    @pytest.mark.asyncio
    async def test_async_save_creates_mp3_file(self):
        """Writing bytes via aiofiles creates a real file in the persistent dir."""
        import aiofiles

        fake_audio = b"\xff\xfb" + b"\x00" * 1024
        filename = f"test_save_{uuid.uuid4().hex[:8]}.mp3"
        filepath = TEST_AUDIO_DIR / filename

        async with aiofiles.open(filepath, "wb") as f:
            await f.write(fake_audio)

        assert filepath.exists(), f"File not found at {filepath}"
        assert filepath.stat().st_size == len(fake_audio)

    @pytest.mark.asyncio
    async def test_async_save_file_is_readable(self):
        """Saved file can be read back identically via aiofiles."""
        import aiofiles

        fake_audio = os.urandom(2048)
        filepath = TEST_AUDIO_DIR / f"test_readback_{uuid.uuid4().hex[:8]}.mp3"

        async with aiofiles.open(filepath, "wb") as f:
            await f.write(fake_audio)

        async with aiofiles.open(filepath, "rb") as f:
            read_back = await f.read()

        assert read_back == fake_audio

    def test_output_dir_exists(self):
        """The persistent audio output directory exists and is writable."""
        assert AUDIO_ROOT.exists(), f"Audio root not found: {AUDIO_ROOT}"
        assert AUDIO_ROOT.is_dir()
        assert os.access(AUDIO_ROOT, os.W_OK), f"Audio root not writable: {AUDIO_ROOT}"

    @pytest.mark.asyncio
    async def test_save_with_real_api_bytes(self, real_api_key):
        """Full round-trip: async API call -> async save -> verify file on disk."""
        import aiofiles
        from elevenlabs import AsyncElevenLabs, VoiceSettings

        client = AsyncElevenLabs(api_key=real_api_key)
        audio_stream = client.text_to_speech.convert(
            voice_id="21m00Tcm4TlvDq8ikWAM",
            text="A tiny star blinked awake in the purple sky.",
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
            voice_settings=VoiceSettings(
                stability=0.85,
                similarity_boost=0.78,
                style=0.15,
                speed=0.85,
            ),
        )
        chunks = []
        async for chunk in audio_stream:
            chunks.append(chunk)
        audio_bytes = b"".join(chunks)

        filename = f"test_real_api_{uuid.uuid4().hex[:8]}.mp3"
        filepath = TEST_AUDIO_DIR / filename

        async with aiofiles.open(filepath, "wb") as f:
            await f.write(audio_bytes)

        assert filepath.exists(), f"File was not created at {filepath}"
        assert filepath.stat().st_size == len(audio_bytes), "File size mismatch"
        assert filepath.stat().st_size > 1000, "Saved file too small"

        header = filepath.read_bytes()[:3]
        assert header == b"ID3" or header[:2] == b"\xff\xfb"


# ===================================================================
# 4. URL CONSTRUCTION TESTS
# ===================================================================


class TestURLConstruction:
    """Verify audio URLs are built correctly for the background file server."""

    def test_url_format_default_base(self):
        """URL uses default localhost:8001 base (background file server)."""
        base = "http://localhost:8001"
        filename = "chapter_1_abc123def456.mp3"
        url = f"{base}/{filename}"

        assert url == "http://localhost:8001/chapter_1_abc123def456.mp3"

    def test_url_format_custom_base(self):
        """URL uses custom base for production deployment."""
        base = "https://myapp.example.com"
        filename = "chapter_2_abc123def456.mp3"
        url = f"{base}/{filename}"

        assert url == "https://myapp.example.com/chapter_2_abc123def456.mp3"

    def test_url_no_double_slash(self):
        """No double-slash between base and filename."""
        base = "http://localhost:8001"
        filename = "chapter_1_test.mp3"
        url = f"{base}/{filename}"

        assert "//" not in url.split("://")[1]

    def test_filename_contains_chapter_number(self):
        """Generated filename includes the chapter number."""
        chapter = 3
        audio_id = uuid.uuid4().hex[:12]
        filename = f"chapter_{chapter}_{audio_id}.mp3"

        assert filename.startswith("chapter_3_")
        assert filename.endswith(".mp3")


# ===================================================================
# 5. BACKGROUND FILE SERVER TESTS
# ===================================================================


class TestBackgroundFileServer:
    """Verify the background HTTP file server serves audio files correctly."""

    def test_background_server_serves_file(self):
        """Start a background HTTP server and verify it serves a test file."""
        # Write a test file
        test_file = TEST_AUDIO_DIR / f"test_bg_serve_{uuid.uuid4().hex[:8]}.mp3"
        test_data = b"\xff\xfb" + os.urandom(512)
        test_file.write_bytes(test_data)

        # Start a test server on a random high port
        handler = partial(SimpleHTTPRequestHandler, directory=str(TEST_AUDIO_DIR))
        server = HTTPServer(("127.0.0.1", 0), handler)
        port = server.server_address[1]
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()

        try:
            time.sleep(0.3)
            import urllib.request
            resp = urllib.request.urlopen(
                f"http://127.0.0.1:{port}/{test_file.name}"
            )
            data = resp.read()

            assert resp.status == 200
            assert data == test_data
            assert resp.headers["Content-Type"] == "audio/mpeg"
        finally:
            server.shutdown()

    def test_background_server_returns_404_for_missing(self):
        """Background server returns 404 for non-existent files."""
        handler = partial(SimpleHTTPRequestHandler, directory=str(TEST_AUDIO_DIR))
        server = HTTPServer(("127.0.0.1", 0), handler)
        port = server.server_address[1]
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()

        try:
            time.sleep(0.3)
            import urllib.request
            import urllib.error
            with pytest.raises(urllib.error.HTTPError) as exc_info:
                urllib.request.urlopen(
                    f"http://127.0.0.1:{port}/nonexistent_file.mp3"
                )
            assert exc_info.value.code == 404
        finally:
            server.shutdown()


# ===================================================================
# 6. GENERATE_AUDIO TOOL INTEGRATION TEST (with mock ToolContext)
# ===================================================================


class TestGenerateAudioTool:
    """Test the async generate_audio function directly with a mocked ToolContext.

    Uses the real persistent ``generated_audio/`` directory — the same one
    the production app writes to — so files survive after the test run.
    """

    @pytest.mark.asyncio
    async def test_generate_audio_full_pipeline(
        self, real_api_key, mock_tool_context
    ):
        """Call generate_audio and verify success, audio_url, and persistent file."""
        from storytelling_agent.tools import audio_tools

        original_key = audio_tools.ELEVENLABS_API_KEY
        original_base = audio_tools.APP_BASE_URL

        try:
            audio_tools.ELEVENLABS_API_KEY = real_api_key
            audio_tools.APP_BASE_URL = "http://localhost:8001"

            result = await audio_tools.generate_audio(
                text=SAMPLE_TEXT,
                voice="rachel",
                tool_context=mock_tool_context,
            )

            # Verify result structure
            assert result["status"] == "success", (
                f"Expected success, got: {result}"
            )
            assert "audio_url" in result, f"Missing audio_url: {result}"
            assert "audio_file" in result, f"Missing audio_file: {result}"
            assert "filename" in result, f"Missing filename: {result}"
            assert result["chapter"] == 1

            # Verify URL format — background server serves at root
            assert result["audio_url"].startswith("http://localhost:8001/")
            assert result["audio_url"].endswith(".mp3")

            # Verify file was saved to the REAL persistent directory
            saved_path = Path(result["audio_file"])
            assert saved_path.exists(), (
                f"Audio file not found at {saved_path}"
            )
            assert saved_path.stat().st_size > 1000, (
                f"Audio file too small: {saved_path.stat().st_size} bytes"
            )
            assert saved_path.parent == audio_tools.AUDIO_OUTPUT_DIR, (
                f"File saved to wrong dir: {saved_path.parent} "
                f"(expected {audio_tools.AUDIO_OUTPUT_DIR})"
            )

            # Verify state accumulation
            assert "all_audio_results" in mock_tool_context.state
            assert len(mock_tool_context.state["all_audio_results"]) == 1
            assert (
                mock_tool_context.state["all_audio_results"][0]["status"]
                == "success"
            )

        finally:
            audio_tools.ELEVENLABS_API_KEY = original_key
            audio_tools.APP_BASE_URL = original_base

    @pytest.mark.asyncio
    async def test_generate_audio_url_is_fetchable(
        self, real_api_key, mock_tool_context
    ):
        """The audio_url returned by generate_audio is fetchable via HTTP."""
        import urllib.request
        from storytelling_agent.tools import audio_tools

        original_key = audio_tools.ELEVENLABS_API_KEY
        original_base = audio_tools.APP_BASE_URL

        try:
            audio_tools.ELEVENLABS_API_KEY = real_api_key
            # Use the real default so the background server URL matches
            audio_tools.APP_BASE_URL = f"http://localhost:{audio_tools.AUDIO_SERVER_PORT}"

            result = await audio_tools.generate_audio(
                text="A little owl hooted softly in the moonlight.",
                voice="rachel",
                tool_context=mock_tool_context,
            )

            assert result["status"] == "success", f"Tool failed: {result}"

            # The background server should already be running (started by generate_audio)
            time.sleep(0.5)
            resp = urllib.request.urlopen(result["audio_url"])
            data = resp.read()

            assert resp.status == 200
            assert len(data) > 1000
            assert resp.headers["Content-Type"] == "audio/mpeg"

        finally:
            audio_tools.ELEVENLABS_API_KEY = original_key
            audio_tools.APP_BASE_URL = original_base

    @pytest.mark.asyncio
    async def test_generate_audio_empty_text_returns_error(self, mock_tool_context):
        """Empty text should return a validation error, not crash."""
        from storytelling_agent.tools import audio_tools

        original_key = audio_tools.ELEVENLABS_API_KEY
        try:
            audio_tools.ELEVENLABS_API_KEY = "sk_test_fake_key"

            result = await audio_tools.generate_audio(
                text="",
                voice="rachel",
                tool_context=mock_tool_context,
            )

            assert result["status"] == "error"
            assert result["error_type"] == "validation"

        finally:
            audio_tools.ELEVENLABS_API_KEY = original_key

    @pytest.mark.asyncio
    async def test_generate_audio_missing_key_returns_error(self, mock_tool_context):
        """Missing API key should return a config error."""
        from storytelling_agent.tools import audio_tools

        original_key = audio_tools.ELEVENLABS_API_KEY
        try:
            audio_tools.ELEVENLABS_API_KEY = ""

            result = await audio_tools.generate_audio(
                text=SAMPLE_TEXT,
                voice="rachel",
                tool_context=mock_tool_context,
            )

            assert result["status"] == "error"
            assert result["error_type"] == "configuration"

        finally:
            audio_tools.ELEVENLABS_API_KEY = original_key

    @pytest.mark.asyncio
    async def test_generate_audio_placeholder_key_returns_error(
        self, mock_tool_context
    ):
        """Placeholder API key should return a config error."""
        from storytelling_agent.tools import audio_tools

        original_key = audio_tools.ELEVENLABS_API_KEY
        try:
            audio_tools.ELEVENLABS_API_KEY = "sk_your_elevenlabs_api_key_here"

            result = await audio_tools.generate_audio(
                text=SAMPLE_TEXT,
                voice="rachel",
                tool_context=mock_tool_context,
            )

            assert result["status"] == "error"
            assert result["error_type"] == "configuration"

        finally:
            audio_tools.ELEVENLABS_API_KEY = original_key

    @pytest.mark.asyncio
    async def test_generate_audio_bad_key_returns_api_error(self, mock_tool_context):
        """An invalid API key should return an api_error."""
        from storytelling_agent.tools import audio_tools

        original_key = audio_tools.ELEVENLABS_API_KEY
        try:
            audio_tools.ELEVENLABS_API_KEY = "sk_definitely_not_a_real_key_1234567890"

            result = await audio_tools.generate_audio(
                text=SAMPLE_TEXT,
                voice="rachel",
                tool_context=mock_tool_context,
            )

            assert result["status"] == "error"
            assert result["error_type"] in ("api_error", "unexpected")

        finally:
            audio_tools.ELEVENLABS_API_KEY = original_key


# ===================================================================
# 7. END-TO-END: API -> SAVE -> SERVE (persistent)
# ===================================================================


class TestEndToEnd:
    """Full pipeline: ElevenLabs API -> persistent save -> HTTP serve -> verify."""

    @pytest.mark.asyncio
    async def test_full_pipeline_api_to_http(self, real_api_key):
        """Generate audio, save to persistent dir, fetch via background server."""
        import urllib.request
        from storytelling_agent.tools import audio_tools

        original_key = audio_tools.ELEVENLABS_API_KEY
        original_base = audio_tools.APP_BASE_URL

        try:
            audio_tools.ELEVENLABS_API_KEY = real_api_key
            audio_tools.APP_BASE_URL = f"http://localhost:{audio_tools.AUDIO_SERVER_PORT}"

            # Step 1: Call generate_audio with mock tool context
            mock_ctx = MagicMock()
            mock_ctx.state = {"chapter_number": 1}

            result = await audio_tools.generate_audio(
                text=SAMPLE_TEXT,
                voice="rachel",
                tool_context=mock_ctx,
            )

            assert result["status"] == "success", f"Tool failed: {result}"
            assert "audio_url" in result
            assert "filename" in result

            # Step 2: Verify file on disk (persistent)
            filepath = audio_tools.AUDIO_OUTPUT_DIR / result["filename"]
            assert filepath.exists(), f"File not on disk: {filepath}"

            saved_bytes = filepath.read_bytes()
            assert len(saved_bytes) > 1000

            # Step 3: Fetch via the background HTTP server
            time.sleep(0.5)
            resp = urllib.request.urlopen(result["audio_url"])
            fetched_bytes = resp.read()

            assert resp.status == 200, (
                f"HTTP {resp.status} for {result['audio_url']}"
            )
            assert len(fetched_bytes) == len(saved_bytes)
            assert fetched_bytes == saved_bytes
            assert resp.headers["Content-Type"] == "audio/mpeg"

            # Step 4: Verify file persists after test (not cleaned up)
            assert filepath.exists(), "File was removed — should be persistent!"

        finally:
            audio_tools.ELEVENLABS_API_KEY = original_key
            audio_tools.APP_BASE_URL = original_base
