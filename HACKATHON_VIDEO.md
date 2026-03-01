# TaleWorld — Hackathon Video Script
## Google ADK Hackathon Submission

**Target length:** 2 min 30 sec  
**Tone:** Warm, wonder-filled, technically confident  
**Format:** Screen recording + voiceover. No talking head needed.

---

## SECTION 1 — HOOK (0:00 – 0:20)

**[Screen: black. Fade in to a bedroom at night — the app's LoadingScene animation playing: mountains, drifting clouds, a rising sun.]**

> *Voiceover:*
> "It's 8 PM. A four-year-old wants one more story before bed. You're exhausted. You want something new — something *theirs*. Something that teaches them about the world without feeling like a lesson."

**[Screen: the animated loading scene fades into the TaleWorld login page.]**

> *Voiceover:*
> "We built TaleWorld."

**[Screen: brief pause on the logo and the warm cream background.]**

---

## SECTION 2 — THE PROBLEM (0:20 – 0:40)

**[Screen: split visual — left side shows generic bedtime story apps with static content; right side fades to black with the TaleWorld UI glowing through.]**

> *Voiceover:*
> "Every child is different. Their hero has a different name. Their world is the ocean, or the arctic, or the mountains. Their companion is a fox, or a turtle, or a bear."

> "Existing apps give you the same story, repackaged. We give you a story that has never existed before — written *right now*, just for your child."

---

## SECTION 3 — THE DEMO (0:40 – 1:45)

### 0:40 — Story Picker

**[Screen: StoryPickerPage loads with Framer Motion fade-up animation.]**

> *Voiceover:*
> "A parent opens TaleWorld. Two modes: guided adventure — pick a hero, a companion, a world — or freeform, where you describe the story in your own words."

**[Screen: slowly click through the guided flow. Type "Mia" as the hero name. Select "girl". Select "turtle" as companion. Select "ocean" as world. The preview sentence appears: "Mia the girl and their turtle companion explore the ocean!"]**

> *Voiceover:*
> "Let's say Mia — a brave little girl — and her turtle companion set off to explore the ocean. One button. And the magic begins."

**[Screen: click "Create My Story!" — transition to the animated LoadingScene.]**

### 1:05 — Story Generating (live SSE streaming)

**[Screen: LoadingScene plays. Then — the first chapter fades in, text appearing word by word as the SSE stream arrives.]**

> *Voiceover:*
> "Behind the scenes, a fleet of specialized AI agents gets to work — simultaneously and in sequence — powered by Google's Agent Development Kit."

**[Screen: briefly cut to the ADK dev-ui at localhost:8000/dev-ui showing the agent graph: SequentialAgent → LoopAgent → story_writer, then ParallelAgent branching to image_agent and audio_agent in parallel.]**

> *Voiceover:*
> "A prompt parser reads the request and sets the stage. A story writer crafts the first chapter — live, streaming word by word to the screen. The moment a chapter is saved, an image agent and an audio agent fire in parallel — so your child hears the narration *and* sees the illustration before the next chapter is even written."

### 1:25 — Reading Experience

**[Screen: back to the storybook UI. Chapter 1 is fully rendered: illustrated image, chapter text, audio player bar with a play button. Click play — the ElevenLabs narration begins, a calm, soft voice reading the chapter aloud.]**

> *Voiceover:*
> "Each chapter arrives with a hand-crafted illustration and professional audio narration — a gentle voice, paced for bedtime. Parents and children experience the story together, chapter by chapter, as it's being written."

**[Screen: scroll down past chapter 1 to see a soft "loading" shimmer where chapter 2 will appear. Then chapter 2 fades in — with its own image and audio. A leaf-green eco-fact card appears beneath: "Clean rivers help filter our drinking water."]**

> *Voiceover:*
> "Every story carries an ecology lesson — woven naturally into the plot, never preachy. A fact about rivers. About mushrooms. About why bees matter."

**[Screen: chapter 3 loads. Scroll to the end. A "Story Complete" button pulses gently.]**

---

## SECTION 4 — PARENT SUMMARY (1:45 – 2:05)

**[Screen: click "Story Complete". Animate to the SummaryPage — confetti spring-in emoji, then the ParentSummary card.]**

> *Voiceover:*
> "When the story ends, the app switches modes — for the parent."

**[Screen: the summary shows three cards: Lessons Learned, Eco Facts Covered, Choices Made.]**

> *Voiceover:*
> "A summary of the lessons your child just absorbed. The ecology facts from the story. And if the child made a choice — which path did the hero take? — it's recorded here, so you can talk about it tomorrow."

---

## SECTION 5 — ARCHITECTURE (2:05 – 2:20)

**[Screen: simple animated diagram — not a slide, draw it on screen or show the ADK dev-ui agent tree.]**

```
User prompt
    └─ prompt_parser_agent        (sets language, chapters, theme)
    └─ LoopAgent (one loop = one chapter)
         └─ story_writer_agent    (writes chapter, saves to state)
         └─ ParallelAgent
              ├─ image_agent      (Mistral image generation)
              └─ audio_agent      (ElevenLabs TTS)
```

> *Voiceover:*
> "The architecture is a LoopAgent — one iteration per chapter. Inside each loop: a story writer generates the next chapter and saves it to shared state. Then, in parallel, an image agent and an audio agent fire simultaneously — both reading from that same state, producing their output independently, before the loop advances."

> "Every agent is stateless. State is the contract. The loop is the engine."

---

## SECTION 6 — BEDTIME MODE (2:20 – 2:30)

**[Screen: back to StoryPickerPage. Toggle the Bedtime Mode switch. The UI dims slightly, a crescent moon appears. Select a story and create it.]**

> *Voiceover:*
> "One more thing — Bedtime Mode. The story writer receives an additional instruction: slower pacing, cozy warm settings, shorter sentences toward the end of each chapter. The voice narration follows. The story literally slows down as it goes — designed to help a child drift off."

**[Screen: the final chapter text ends mid-scroll, peaceful and still. The LoadingScene mountains rest. Stars appear.]**

> *Voiceover:*
> "TaleWorld. Every story, one of a kind. Every bedtime, a little more magical."

**[Screen: fade to black. TaleWorld wordmark. Google ADK logo. Team: Zero Context Crew.]**

---

## PRODUCTION NOTES

### Screen recording checklist (in order):
1. **Login page** — brief, just show the magic-word gate
2. **StoryPickerPage** — guided mode, fill in Mia / girl / turtle / ocean
3. **LoadingScene** — let it play 3–4 seconds
4. **StoryReaderPage** — chapter 1 text streaming in via SSE (live mode, real backend)
5. **ADK dev-ui** — agent tree at `http://localhost:8000/dev-ui` (5 seconds only)
6. **StoryReaderPage** — audio player playing chapter 1 narration
7. **StoryReaderPage** — eco-fact card under chapter 2
8. **SummaryPage** — all three summary cards
9. **ADK agent diagram** — draw on screen or use dev-ui
10. **Bedtime mode toggle** — picker page, then loading scene fading to stars

### Audio:
- Voiceover recorded separately, laid over screen recording
- Use a warm, calm voice — not corporate, not rushed
- Background music: soft ambient/lo-fi, fade to 10% under narration, 30% during silent screen sections

### Title cards needed:
- `0:00` — "TaleWorld" (wordmark, white on black, 2 seconds)
- `2:28` — "Built with Google ADK" + "Zero Context Crew" (fade in, hold 5 seconds)

### What NOT to show:
- Terminal output / pip install / Docker
- Any error states
- The ADK dev-ui for more than 5 seconds (too technical for the hook)
- Code (architecture section uses a diagram, not raw Python)
