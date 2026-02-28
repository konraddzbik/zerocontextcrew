 TaleWorld — AI-Powered Storybooks for Kids

## Project Overview

TaleWorld is an interactive storytelling app that generates personalized children's stories with ecology lessons, moral choices, and AI-generated illustrations. Built for a hackathon, designed to become a real product.

## Target Audience

- Children aged 4–8 (primary)
- Parents supervising or co-reading (secondary)
- Everything must be child-safe, friendly, and accessible

## Tech Stack

- **Build tool:** Vite + React
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Routing:** react-router-dom (simple client-side routing)
- **Language:** TypeScript
- **Fonts:** Fredoka / Baloo 2 (display), Nunito / DM Sans (body) — loaded via Google Fonts
- **Deployment:** Static site — `vite build` outputs a `dist` folder, deploy anywhere (Vercel, Netlify, GitHub Pages, S3, nginx, etc.)
- **Future mobile:** Capacitor wrap (do not introduce React Native patterns)

## Architecture

This is the **frontend only**. Backend is handled by teammates separately.

### Local Development Environment

- **Hardware:** NVIDIA DGX Spark
- **Local inference:** Ollama running Ministral 3B and 8B models locally
- **Usage:** During frontend development, hit Ollama's local API (`http://localhost:11434`) for story generation and choices instead of the remote Mistral API. This gives us fast iteration without burning API credits.
- **Ollama API format:** OpenAI-compatible — use `/v1/chat/completions` endpoint
- **Important:** The final production app will use the hosted Mistral API. Keep the API layer abstracted in `lib/api.ts` so we can swap between local Ollama and remote Mistral with an environment variable (`VITE_API_MODE=local | remote`).

### Backend (ADK-based, consumed by frontend)

- **Framework:** Google ADK (Agent Development Kit) using `get_fast_api_app()` — exposes agent interaction endpoints
- **Protocol:** SSE-based streaming — the backend streams agent responses via Server-Sent Events, no custom REST endpoints
- **Story generation:** Ministral 8B via Mistral API
- **Voice narration:** Eleven Labs API (currently mocked — URLs are placeholders)
- **Illustrations:** Image generation API (currently mocked — URLs are placeholders)
- **Important:** All communication goes through ADK's agent conversation protocol. There are no custom REST endpoints. The frontend must handle SSE streams from the ADK server.

### Story Structure (from backend)

Every story follows a fixed **3-chapter structure**. Each chapter contains:
- **Text** — the story narration for that chapter
- **Audio narration** — one audio URL per chapter (Eleven Labs, currently placeholder)
- **3–4 illustrations** — image URLs per chapter (currently placeholders)

The UI should present chapters sequentially — one chapter at a time, with its text, illustrations, and audio together.

### Frontend responsibilities

- Login screen (protect API access)
- Character & world selection screen
- Storybook reader — display 3 chapters sequentially, each with text + illustrations + audio
- Handle SSE streaming from ADK backend — parse and render as chapters arrive
- Choice moments (interactive moral decisions, if present in chapter)
- Parent summary screen (learning recap)
- Audio playback controls for narration
- Placeholder/skeleton UI for mocked images and audio during development
- Loading states, transitions, error handling

## Project Structure

```
/src
  main.tsx                → entry point
  App.tsx                 → router setup, auth wrapper
  /pages
    LoginPage.tsx         → magic word login
    StoryPickerPage.tsx   → character & world selection
    StoryReaderPage.tsx   → storybook reader — renders 3 chapters sequentially
    SummaryPage.tsx       → parent learning recap
  /components
    CharacterPicker.tsx   → avatar/name selection
    WorldPicker.tsx       → environment selection (forest, ocean, mountains...)
    Chapter.tsx           → single chapter: text + 3-4 illustrations + audio
    ChapterIllustrations.tsx → illustration gallery/carousel within a chapter
    ChoiceCard.tsx        → moral decision moment with 2-3 options
    ChapterTransition.tsx → animated transition between chapters
    AudioPlayer.tsx       → narration playback per chapter (Eleven Labs)
    ParentSummary.tsx     → what the child learned + choices made
    LoadingScene.tsx      → friendly animated loading state
    PlaceholderImage.tsx  → skeleton/placeholder for mocked image URLs
    AuthContext.tsx        → React context holding auth state
  /lib
    api.ts                → ADK agent communication — SSE stream parsing
    types.ts              → shared TypeScript types (Chapter, Story, etc.)
    sseClient.ts          → SSE client helper — connects to ADK endpoint, parses streamed chapters
/public
  /assets               → static illustrations, fallback images, icons
```

## Design Principles

### Aesthetic Reference — "The TaleWorld Look"

Our visual identity is established. Every screen in the app should feel like it belongs in the same storybook as our pitch page. Here is the exact aesthetic DNA to follow:

#### Fonts (Google Fonts, load both)

- **Display / headings:** `'Fraunces', serif` — weight 600–800, used for titles, chapter headings, buttons, the logo
- **Body / story text:** `'DM Sans', sans-serif` — weight 400–600, used for narration, UI labels, descriptions
- Never mix in other fonts. These two are the entire type system.

#### Color Palette (use as CSS variables)

```css
:root {
  --forest: #1a3a2a;       /* primary dark — headings, nav, footer, login box */
  --leaf: #4a7c59;          /* primary green — borders, accents, icons, links */
  --sun: #f5c542;           /* highlight yellow — badges, stars, active states, CTAs */
  --sky: #e8f0e8;           /* light green tint — subtle backgrounds, hover states */
  --cream: #faf8f2;         /* page background — the base of everything */
  --coral: #e07a5f;         /* warm accent — errors, alerts, world: volcano/desert */
  --water: #5b9bd5;         /* cool accent — world: ocean, info states */
  --berry: #9b5de5;         /* playful accent — world: magical/fantasy */
  --bark: #6b4226;          /* earthy brown — world: forest floor, secondary badges */
  --soft-shadow: rgba(26, 58, 42, 0.08); /* all box shadows use this */
}
```

- **Backgrounds:** always `--cream` (#faf8f2) as the page base. Never white (#fff), never dark mode.
- **Cards / panels:** white (#ffffff) with `box-shadow: 0 4px 20px var(--soft-shadow)` and `border-radius: 16px`
- **Colored borders:** cards use a 4px left border in a palette color for visual variety
- **Each world gets a sub-palette:** forest = leaf + bark, ocean = water + sky, mountains = forest + cream, arctic = water + white

#### Surface & Texture

- The page has a subtle cross-hatch SVG pattern overlay at very low opacity (2%) for a paper/storybook feel
- Layered radial gradients in the background (green at top-left, yellow at bottom-right, both at ~6% opacity) add warmth and depth
- Never flat solid backgrounds — always a hint of texture or gradient

#### Shapes & Layout

- **Border radius:** 16px minimum on cards, 20px on large panels, 24px on hero sections, 50px on pills/badges
- **Generous whitespace** — let elements breathe, never crowd
- **Cards grid:** 2-column grid on desktop, single column on mobile, 16px gap
- **Flow diagrams / steps:** horizontal row of rounded boxes connected by arrow characters, centered
- **Badges:** small pill shape, dark background (`--forest`), yellow text (`--sun`), uppercase, letter-spacing 2px

#### Illustration Scenes (hero areas, chapter headers)

- Use CSS-drawn scenic backgrounds: layered gradients (greens), CSS triangle mountains, circle sun with glowing box-shadow, floating cloud shapes with drift animation
- These are NOT images — they are pure CSS, lightweight and fast
- Each world should have its own scene variant (ocean = waves, forest = mountains + trees, arctic = snow hills)

#### Animations (Framer Motion)

- **Page enter:** `fadeUp` — opacity 0→1, translateY 24px→0, duration 0.8s, easeOut
- **Staggered children:** each child delays 0.1–0.15s after the previous
- **Sun/glow pulse:** `box-shadow` oscillates between 40px and 60px spread, 3s infinite, ease-in-out
- **Cloud drift:** `translateX` from -120px to beyond viewport, 12–16s linear infinite
- **Hover on cards:** `translateY(-3px)` with 0.2s transition
- **Choice buttons:** subtle spring bounce on hover/tap
- **Keep it gentle** — nothing fast, nothing startling. Durations 300ms–800ms.

#### Iconography

- Use emoji as icons (📖 🌍 ⚡ ✨ 🛠 🎯 🚀 🌿 🎨 🤔 📋) — they're universal, colorful, and child-friendly
- Place emoji inside small rounded square containers (36px, border-radius 10px, tinted background)
- No icon library needed — emoji keeps it lightweight and playful

#### Dark Panels (CTA boxes, login, footer)

- Background: `--forest` (#1a3a2a)
- Text: `--cream` (#faf8f2) at 80% opacity for body, 100% for headings
- Accent: `--sun` (#f5c542) for headings and highlights
- Border-radius: 20px
- Centered text, generous padding (36px 32px)

### Child-Friendly UI Rules

- Large touch targets (minimum 48px, prefer 56px+)
- Rounded corners everywhere (border-radius 16px+)
- Soft, warm color palette — no harsh contrast
- Big readable text (minimum 18px body, 28px+ for story text)
- No small text, no dense layouts, generous whitespace
- Illustrations are the hero — text supports, not dominates
- One chapter per viewport when possible — scroll reveals the next

### Typography Rules

- Story text: `'DM Sans'`, large (24–28px), high line-height (1.8+), max 60 characters per line
- Chapter titles: `'Fraunces'`, 600–800 weight, 1.5–2.5rem
- UI labels: `'DM Sans'`, 500 weight, 14–16px
- Never use ALL CAPS for story content (badges/labels only)

### Audio / Narration

- Play/pause button always visible during story
- Auto-play narration per chapter (with parent option to disable)
- Visual indication of which sentence is being read (highlight or underline)
- Graceful fallback if audio fails to load — show friendly "narration coming soon" state

## API Contract

### Communication Protocol

The backend uses **ADK's built-in FastAPI** (`get_fast_api_app()`). There are no custom REST endpoints. All interaction goes through ADK's agent conversation protocol via **Server-Sent Events (SSE)**.

The frontend sends a message to the agent (character name, world, preferences) and receives streamed SSE events as the story is generated. Parse these events to extract chapter data.

### Expected Data Structure (parsed from SSE stream)

```typescript
// What we send to the ADK agent
interface StoryRequest {
  characterName: string;
  characterType: string;    // "girl" | "boy" | "animal" | "creature"
  animalCompanion: string;  // "turtle" | "fox" | "owl" | "dolphin" ...
  world: string;            // "forest" | "ocean" | "mountains" | "arctic"
  ageRange: "4-6" | "6-8";
}

// What we parse from the SSE stream
interface Story {
  storyId: string;
  title: string;
  chapters: Chapter[];       // always 3 chapters
  summary: ParentSummary;
}

interface Chapter {
  id: string;
  chapterNumber: 1 | 2 | 3;
  title: string;                     // chapter title
  text: string;                      // story narration for this chapter
  illustrations: Illustration[];     // 3-4 images per chapter
  audioUrl?: string;                 // Eleven Labs narration URL (placeholder for now)
  ecoFact?: string;                  // optional ecology fact
  choice?: {                         // optional moral choice
    question: string;
    options: ChoiceOption[];
  };
}

interface Illustration {
  id: string;
  imageUrl: string;                  // placeholder URL for now
  altText: string;                   // descriptive alt text
  position: "inline" | "full-width"; // layout hint
}

interface ChoiceOption {
  id: string;
  label: string;
  consequence: string;
  lessonTag: string;                 // e.g. "empathy", "courage", "ecology"
}

interface ParentSummary {
  lessonsLearned: string[];
  ecoFactsCovered: string[];
  choicesMade: { question: string; chosen: string; lesson: string }[];
}
```

### SSE Handling Notes

- Connect to the ADK agent endpoint using EventSource or a fetch-based SSE client
- Chapters may arrive one at a time as the agent generates them — render each chapter as it arrives
- Parse the agent's streamed text output into the Chapter structure above
- Handle connection drops gracefully — show a friendly retry message
- The exact SSE event format depends on ADK's protocol — coordinate with backend team on the event shape

## Content Safety Rules

- All generated content must be age-appropriate
- No violence, no scary imagery, no death themes
- Consequences of choices are always gentle and constructive
- Ecology facts are hopeful — focus on "what we can do" not doom
- Animal companions never get hurt
- Backend handles content filtering — frontend should also sanitize displayed text

## Performance Guidelines

- Chapters stream in via SSE — render each chapter as it arrives, don't wait for all 3
- Images: show styled placeholder/skeleton while URLs are mocked or loading
- Audio: show a disabled play button with "narration coming soon" state for placeholder URLs
- Preload next chapter's assets while current chapter is being read
- Target: interactive within 2 seconds, first chapter visible as soon as SSE delivers it

## Accessibility

- All images have descriptive alt text
- Audio narration serves as built-in accessibility
- Touch targets meet WCAG AA minimum (48px)
- Color contrast ratios meet AA for large text
- Support for reduced-motion preference (disable animations)

## State Management

- Use React useState/useReducer — no external state library needed
- Story state lives in the story page, passed down via props
- No localStorage (not supported in all target environments)
- If persistence is needed later, use API-backed state

## Authentication

Simple credential-based login to protect access to paid APIs (Mistral, Eleven Labs). This is not a user accounts system — it's a gate to prevent unauthorized usage.

### Requirements

- Single login screen before the app is usable
- Hardcoded credentials (username + password) stored in environment variables (`VITE_AUTH_USERNAME`, `VITE_AUTH_PASSWORD`)
- On successful login, store a session token in memory (React state / context) — not localStorage
- All API calls to backend must include this token
- No registration, no password reset, no user profiles — just a lock on the front door
- Keep it minimal: one input for username, one for password, one button
- Style it child-friendly to match the app (friendly illustration, warm colors, "Enter the magic word!" vibe)

### Flow

```
Login screen → validate against env vars → set auth context → redirect to app
                                         → wrong? friendly error ("Hmm, that's not the magic word!")
```

### Implementation

- `AuthContext.tsx` — React context holding auth state
- `LoginScreen.tsx` — the login page
- Wrap app routes with auth check — redirect to login if not authenticated
- Backend should validate the token on every request (teammates handle this)

## What NOT to Build (out of scope for hackathon)

- User registration / profiles / password reset
- Story saving / history
- Multiple language support
- Offline mode
- Analytics
- Payment / subscription

Focus everything on one beautiful, smooth, end-to-end story experience.