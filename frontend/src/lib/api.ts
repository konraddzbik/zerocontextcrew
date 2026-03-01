import type { Story, Chapter, StoryRequest } from './types';
import { mockStory } from './mockData';
import { connectSSE, type ADKEvent } from './sseClient';

const API_MODE = import.meta.env.VITE_API_MODE || 'mock';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const APP_NAME = 'storytelling_agent';

// --- Helpers ---

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildPrompt(request: StoryRequest): string {
  return `Write a children's story for a ${request.ageRange} year old.
The hero is ${request.characterName}, a ${request.characterType}.
Their companion is a ${request.animalCompanion}.
The story takes place in the ${request.world}.
Include ecology lessons and a moral choice in the first chapter.`;
}

// --- Parse ADK state into our Story structure ---

interface ADKStoryState {
  story_so_far: string;
  chapter_number: number;
  current_chapter: string;
  all_image_results: { chapter: number; images: { image_url: string; description: string }[] }[];
  all_audio_results: { chapter: number; audio_url: string; duration_seconds: number }[];
}

function parseChaptersFromState(state: Partial<ADKStoryState>): Chapter[] {
  const storyText = state.story_so_far || '';
  const chapterBlocks = storyText
    .split(/---\s*Chapter\s+\d+\s*---/)
    .filter((block) => block.trim());

  return chapterBlocks.map((text, i) => {
    const chapterNum = (i + 1) as 1 | 2 | 3;

    // Find matching images for this chapter
    const imageResult = (state.all_image_results || []).find(
      (r) => r.chapter === chapterNum,
    );
    const illustrations = (imageResult?.images || []).map((img, j) => ({
      id: `img-${chapterNum}-${j}`,
      imageUrl: img.image_url,
      altText: img.description,
      position: (j === 0 ? 'full-width' : 'inline') as 'full-width' | 'inline',
    }));

    // Find matching audio for this chapter
    const audioResult = (state.all_audio_results || []).find(
      (r) => r.chapter === chapterNum,
    );

    return {
      id: `ch-${chapterNum}`,
      chapterNumber: chapterNum,
      title: `Chapter ${chapterNum}`,
      text: text.trim(),
      illustrations,
      audioUrl: audioResult?.audio_url,
    };
  });
}

// --- Public API ---

export interface StoryGenerationCallbacks {
  /** Called when a new chapter becomes available (progressive rendering) */
  onChapterReady: (chapters: Chapter[]) => void;
  /** Called with raw text as it streams in */
  onTextDelta: (text: string, author: string) => void;
  /** Called when generation is complete */
  onComplete: (story: Story) => void;
  /** Called on error */
  onError: (error: Error) => void;
}

export function generateStory(
  request: StoryRequest,
  callbacks: StoryGenerationCallbacks,
): { abort: () => void } {
  if (API_MODE === 'mock') {
    return generateMockStory(callbacks);
  }

  return generateLiveStory(request, callbacks);
}

// --- Mock mode ---

function generateMockStory(callbacks: StoryGenerationCallbacks): { abort: () => void } {
  let cancelled = false;

  // Simulate progressive chapter delivery
  const delays = [800, 2500, 4500, 6000];
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  mockStory.chapters.forEach((_, i) => {
    const t = setTimeout(() => {
      if (cancelled) return;
      callbacks.onChapterReady(mockStory.chapters.slice(0, i + 1));
    }, delays[i]);
    timeouts.push(t);
  });

  // Final complete
  const finalT = setTimeout(() => {
    if (cancelled) return;
    callbacks.onComplete(mockStory);
  }, delays[delays.length - 1]);
  timeouts.push(finalT);

  return {
    abort: () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    },
  };
}

// --- Live ADK mode ---

function generateLiveStory(
  request: StoryRequest,
  callbacks: StoryGenerationCallbacks,
): { abort: () => void } {
  const abortController = new AbortController();
  const userId = `user-${generateId()}`;
  const sessionId = `session-${generateId()}`;

  // Accumulated state from ADK events
  const accState: Partial<ADKStoryState> = {};
  let lastChapterCount = 0;

  connectSSE(
    API_BASE_URL,
    {
      appName: APP_NAME,
      userId,
      sessionId,
      newMessage: {
        role: 'user',
        parts: [{ text: buildPrompt(request) }],
      },
      streaming: false,
    },
    {
      onEvent: (event: ADKEvent) => {
        // Capture text deltas
        const text = event.content?.parts?.[0]?.text;
        if (text && event.author !== 'user') {
          callbacks.onTextDelta(text, event.author);
        }

        // Merge state deltas
        if (event.actions?.stateDelta) {
          Object.assign(accState, event.actions.stateDelta);

          // Check if a new chapter appeared
          const chapters = parseChaptersFromState(accState);
          if (chapters.length > lastChapterCount) {
            lastChapterCount = chapters.length;
            callbacks.onChapterReady(chapters);
          }
        }
      },
      onDone: () => {
        const chapters = parseChaptersFromState(accState);
        const story: Story = {
          storyId: sessionId,
          title: `${request.characterName}'s Adventure`,
          chapters,
          summary: {
            lessonsLearned: ['Taking care of nature helps everyone.'],
            ecoFactsCovered: [],
            choicesMade: [],
          },
        };
        callbacks.onComplete(story);
      },
      onError: callbacks.onError,
    },
    abortController.signal,
  );

  return {
    abort: () => abortController.abort(),
  };
}
