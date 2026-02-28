# zerocontextcrew

Children's storytelling multi-agent backend powered by Google ADK.

Generates multi-chapter stories with audio narration and illustrations using a hierarchy of specialized agents.

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

**ADK dev UI:**

```bash
cd storytelling
adk web .
```

**FastAPI server:**

```bash
cd storytelling
python main.py
```

## Project Structure

```
storytelling/
├── main.py                          # FastAPI app entry point
├── requirements.txt
└── storytelling_agent/
    ├── agent.py                     # ADK entry point
    ├── chapter_agent.py             # SequentialAgent + root LoopAgent
    ├── story_writer_agent.py        # LLM story generation
    ├── media_agent.py               # ParallelAgent (audio + image)
    ├── audio_agent.py               # Mock ElevenLabs TTS
    ├── image_agent.py               # Mock image generation
    └── tools/
        ├── story_tools.py           # Chapter persistence
        ├── audio_tools.py           # Mock audio API
        └── image_tools.py           # Mock image API
```
