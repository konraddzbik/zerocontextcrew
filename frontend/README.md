# TaleWorld Frontend

Interactive storytelling app for children — pick a hero, choose a world, and read a generated eco-adventure with moral choices.

## Quick Start

```bash
cd frontend
cp .env.example .env   # adjust values as needed
npm install
npm run dev
```

Default login: `storyteller` / `taleworld`

## Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite 7 |
| UI | React 19, TypeScript 5.9 |
| Styling | Tailwind CSS v4, CSS custom properties |
| Animation | Framer Motion 12 |
| Routing | React Router v7 |
| Backend | SSE via `fetch` + `ReadableStream` to ADK `/run_sse` |

## Project Structure

```
src/
├── App.tsx                     # Router, AuthProvider, ProtectedRoute
├── index.css                   # Tailwind config, CSS vars, design tokens
├── main.tsx                    # Entry point
├── pages/
│   ├── LoginPage.tsx           # "Magic word" credential gate
│   ├── StoryPickerPage.tsx     # Character + companion + world selection
│   ├── StoryReaderPage.tsx     # Progressive chapter reader with SSE
│   └── SummaryPage.tsx         # Parent recap (lessons, eco facts, choices)
├── components/
│   ├── AuthContext.tsx          # In-memory auth state
│   ├── motion.tsx              # Framer Motion variants (fadeUp, stagger, scaleIn)
│   ├── CharacterPicker.tsx     # Hero name, type, companion grid
│   ├── WorldPicker.tsx         # World cards (forest, ocean, mountains, arctic)
│   ├── Chapter.tsx             # Chapter display: text, illustrations, audio, choice
│   ├── ChapterIllustrations.tsx
│   ├── ChapterTransition.tsx   # Decorative separator
│   ├── AudioPlayer.tsx         # Play/pause with "narration coming soon" fallback
│   ├── ChoiceCard.tsx          # Moral decision with lesson tags
│   ├── WorldScene.tsx          # Pure-CSS animated scene per world
│   ├── LoadingScene.tsx        # Animated loader (mountains, sun, clouds)
│   ├── ParentSummary.tsx       # Lessons, eco facts, choices recap
│   └── PlaceholderImage.tsx    # Skeleton for loading/mocked images
└── lib/
    ├── types.ts                # Story, Chapter, Illustration, ChoiceOption, etc.
    ├── mockData.ts             # Hardcoded 3-chapter story fixture
    ├── api.ts                  # generateStory() — mock or live SSE mode
    └── sseClient.ts            # fetch-based SSE client for POST /run_sse
```

## User Flow

```
Login → StoryPicker → StoryReader (3 chapters, progressive) → Summary → back to Picker
```

1. **Login** — enter credentials (validated against env vars)
2. **Story Picker** — name your hero, pick a character type (girl/boy/animal/creature), choose a companion, select a world
3. **Story Reader** — chapters stream in progressively via SSE; live text preview while generating; each chapter has illustrations, an eco fact, and optional moral choices
4. **Summary** — parent-facing recap of lessons learned, eco facts, and choices made

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_AUTH_USERNAME` | `storyteller` | Login username |
| `VITE_AUTH_PASSWORD` | `taleworld` | Login password |
| `VITE_API_MODE` | `mock` | `mock` = hardcoded data; `local` or `remote` = ADK backend |
| `VITE_API_BASE_URL` | `http://localhost:8080` | ADK backend URL (used in local/remote mode) |

## API Integration (ADK Backend)

When `VITE_API_MODE` is `local` or `remote`, the app connects to the ADK storytelling agent:

- **Endpoint:** `POST {VITE_API_BASE_URL}/run_sse`
- **Request body:** `{ appName, userId, sessionId, newMessage, streaming }`
- **SSE events:** JSON objects with `content.parts[].text` and `actions.stateDelta`
- **Parsed state keys:** `story_so_far`, `chapter_number`, `total_chapters`, `all_image_results`, `all_audio_results`
- **Terminal event:** `data: [DONE]`

Uses `fetch` + `ReadableStream` (not `EventSource`) since the endpoint requires POST.

## Design System

- **Fonts:** Fraunces (headings) + DM Sans (body) via Google Fonts
- **Colors:** CSS custom properties — `--forest`, `--leaf`, `--sun`, `--sky`, `--cream`, `--coral`, `--water`, `--berry`, `--bark`
- **Background:** `--cream` (#faf8f2) with subtle cross-hatch SVG texture and warm radial gradients
- **Cards:** white, 16px+ border-radius, soft shadow, colored left border
- **World Scenes:** Pure CSS + Framer Motion — geometric mountains, animated sun, drifting clouds, aurora effects (no external images)
- **Accessibility:** `prefers-reduced-motion` respected globally, WCAG AA contrast, visible focus states, semantic HTML, `aria-label` attributes

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # TypeScript check + production build
npm run preview   # Preview production build
npm run lint      # ESLint
```

## Current Status

**Working:**
- All 4 pages with full UI and animations
- Mock mode with hardcoded 3-chapter story
- SSE integration with ADK backend (progressive chapter delivery, live text preview)
- Image/audio result collection from backend state
- Abort support on page unmount

**Not yet implemented:**
- Real image generation (placeholder URLs used)
- Real audio/TTS ("narration coming soon" fallback)
- Server-side authentication (current gate is client-side only)
