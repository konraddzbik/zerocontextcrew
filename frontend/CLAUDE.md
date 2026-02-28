# TaleWorld Frontend

## Quick Start

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0    # port 5173
npm run build                     # production build
```

Env config: copy `.env.example` to `.env` and adjust values.

## Stack

Vite + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + React Router

## Structure

```
src/
├── App.tsx                    # Router + AuthProvider + ProtectedRoute
├── index.css                  # Tailwind, CSS vars, design tokens, animations
├── main.tsx                   # Entry point
├── vite-env.d.ts              # Env var types
├── pages/
│   ├── LoginPage.tsx          # "Magic word" credential gate
│   ├── StoryPickerPage.tsx    # Character + companion + world selection
│   ├── StoryReaderPage.tsx    # 3-chapter reader with progressive SSE loading
│   └── SummaryPage.tsx        # Parent recap (lessons, eco facts, choices)
├── components/
│   ├── AuthContext.tsx         # Auth state (in-memory, checks VITE_AUTH_* env vars)
│   ├── motion.tsx             # Framer Motion variants (fadeUp, stagger, scaleIn)
│   ├── CharacterPicker.tsx    # Hero name, type, companion selection
│   ├── WorldPicker.tsx        # World cards (forest, ocean, mountains, arctic)
│   ├── Chapter.tsx            # Single chapter: text + illustrations + audio + choice
│   ├── ChapterIllustrations.tsx
│   ├── ChapterTransition.tsx
│   ├── AudioPlayer.tsx        # Play/pause, "narration coming soon" fallback
│   ├── ChoiceCard.tsx         # Moral decision with lesson tags
│   ├── PlaceholderImage.tsx   # Skeleton for mocked/loading images
│   ├── ParentSummary.tsx      # Lessons, eco facts, choices recap
│   ├── WorldScene.tsx         # CSS-drawn animated scenes per world
│   └── LoadingScene.tsx       # Animated loading with mountains, sun, clouds
└── lib/
    ├── types.ts               # Story, Chapter, Illustration, ChoiceOption, etc.
    ├── mockData.ts            # Hardcoded 3-chapter mock story
    ├── api.ts                 # generateStory() — mock/live mode, parses ADK state
    └── sseClient.ts           # fetch-based SSE client for POST /run_sse
```

## Design System

- **Fonts:** Fraunces (display/headings) + DM Sans (body) — loaded via Google Fonts in `index.html`
- **Colors:** `--forest` `--leaf` `--sun` `--sky` `--cream` `--coral` `--water` `--berry` `--bark` — defined as CSS vars in `index.css`, mirrored as Tailwind theme colors
- **Background:** `--cream` (#faf8f2) with cross-hatch SVG texture (2%) + warm radial gradients
- **Cards:** white, `border-radius: 16px+`, `box-shadow` with `--soft-shadow`, colored left border
- **Animations:** Framer Motion — fadeUp pages, spring buttons, staggered children. `prefers-reduced-motion` is respected globally.

## Env Variables (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_AUTH_USERNAME` | `storyteller` | Login username |
| `VITE_AUTH_PASSWORD` | `taleworld` | Login password |
| `VITE_API_MODE` | `mock` | `mock` = hardcoded data, `local`/`remote` = ADK backend |
| `VITE_API_BASE_URL` | `http://localhost:8080` | ADK backend URL |

## User Flow

`Login → StoryPicker → StoryReader (3 chapters, progressive) → Summary → back to Picker`

## ADK Integration

- **Endpoint:** `POST /run_sse` at `VITE_API_BASE_URL`
- **Request:** `{ appName: "storytelling_agent", userId, sessionId, newMessage: { role: "user", parts: [{ text }] } }`
- **SSE events:** `data: { id, author, content: { parts: [{ text }] }, actions: { stateDelta } }`
- **State keys parsed:** `story_so_far`, `chapter_number`, `all_image_results`, `all_audio_results`
- **Terminal event:** `data: [DONE]`
- Uses fetch + ReadableStream (not EventSource, since it requires POST)

## Completed

1. Project scaffold (Vite + React + TS + Tailwind)
2. All 4 pages with mock data (login, picker, reader, summary)
3. Framer Motion animations, CSS world scenes, accessibility
4. SSE integration with ADK backend

## Not Yet Built

- Real image generation (tools are mocked)
- Real audio/TTS (tools are mocked)
- Server-side auth (client-side gate only — env vars are bundled in JS)
