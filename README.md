# zerocontextcrew

Children's storytelling app powered by Google ADK.

Generates multi-chapter eco-adventure stories with audio narration and illustrations using a hierarchy of specialized agents. Includes a React frontend with progressive chapter streaming.

## Agent Architecture

```
LoopAgent (max 3 iterations — one per chapter)
└── SequentialAgent
    ├── Story Writer Agent — generates the next chapter (LLM)
    └── ParallelAgent
        ├── Audio Agent — generates narration via ElevenLabs (mocked)
        └── Image Agent — generates 3-4 illustrations (mocked)
```

## Setup

```bash
cd storytelling
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Ensure Ollama is running locally with the Mistral model pulled:

```bash
ollama pull mistral
ollama serve
```

## Running

### Backend + Frontend (full app)

Start the backend server:

```bash
cd storytelling
source .venv/bin/activate
python main.py
```

In a second terminal, start the frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Set `VITE_API_MODE=local` in `frontend/.env` to connect to the backend. The app is available at `http://localhost:5173`. Default login: `storyteller` / `taleworld`.

### Backend only

**ADK dev UI:**

```bash
cd storytelling
source .venv/bin/activate
adk web .
```

**FastAPI server:**

```bash
cd storytelling
source .venv/bin/activate
python main.py
```

### Frontend only (mock mode)

```bash
cd frontend
npm install
npm run dev
```

With `VITE_API_MODE=mock` (the default), the frontend uses a hardcoded story — no backend needed.

## Project Structure

```
storytelling/                        # Backend (Google ADK)
├── main.py                          # FastAPI app entry point
├── requirements.txt
└── storytelling_agent/
    ├── agent.py                     # ADK entry point
    ├── chapter_agent.py             # SequentialAgent + root LoopAgent
    ├── story_writer_agent.py        # LLM story generation
    ├── prompt_parser_agent.py       # Extracts story settings from user prompt
    ├── media_agent.py               # ParallelAgent (audio + image)
    ├── audio_agent.py               # Mock ElevenLabs TTS
    ├── image_agent.py               # Mock image generation
    └── tools/
        ├── story_tools.py           # save_chapter — chapter persistence
        ├── prompt_tools.py          # save_prompt_settings — prompt parsing
        ├── audio_tools.py           # Mock audio API
        └── image_tools.py           # Mock image API

frontend/                            # React app (Vite + TypeScript + Tailwind)
├── src/
│   ├── pages/                       # Login, StoryPicker, StoryReader, Summary
│   ├── components/                  # Chapter, WorldScene, AudioPlayer, etc.
│   └── lib/
│       ├── api.ts                   # generateStory() — mock or live SSE mode
│       ├── sseClient.ts             # fetch-based SSE client for POST /run_sse
│       ├── types.ts                 # Story, Chapter, StoryRequest, etc.
│       └── mockData.ts              # Hardcoded 3-chapter story fixture
└── .env.example                     # Environment variable template
```
