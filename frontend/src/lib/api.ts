import type { Story, Chapter, StoryRequest } from './types';
import { mockStory } from './mockData';
import { connectSSE, type ADKEvent } from './sseClient';

const API_MODE = import.meta.env.VITE_API_MODE || 'mock';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const APP_NAME = 'storytelling_agent';

// --- Helpers ---

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildPrompt(request: StoryRequest): string {
  if (request.customPrompt) return request.customPrompt;
  return [
    `Write a children's story in English with 3 chapters.`,
    `The hero is ${request.characterName}, a ${request.characterType}.`,
    `Their companion is a ${request.animalCompanion}.`,
    `The story takes place in the ${request.world}.`,
    `Target age: ${request.ageRange} years old.`,
    `Include ecology lessons and a sense of wonder.`,
  ].join('\n');
}

// --- Public API ---

export interface ChapterMeta {
  totalChapters: number | null;
}

export interface StoryGenerationCallbacks {
  /** Called when a new chapter becomes available (progressive rendering) */
  onChapterReady: (chapters: Chapter[], meta: ChapterMeta) => void;
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

  const delays = [800, 2500, 4500, 6000];
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const totalChapters = mockStory.chapters.length;

  mockStory.chapters.forEach((_, i) => {
    const t = setTimeout(() => {
      if (cancelled) return;
      callbacks.onChapterReady(mockStory.chapters.slice(0, i + 1), { totalChapters });
    }, delays[i]);
    timeouts.push(t);
  });

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

  const confirmedChapters: Chapter[] = [];
  let totalChapters: number | null = null;
  let streamingText = '';
  let lastPreviewUpdate = 0;

  function emitChapters() {
    callbacks.onChapterReady([...confirmedChapters], { totalChapters });
  }

  // ADK requires the session to exist before /run_sse
  const createSessionUrl = `${API_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions`;
  fetch(createSessionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
    signal: abortController.signal,
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
      return res.json();
    })
    .then(() => startSSE())
    .catch((err) => {
      if (!abortController.signal.aborted) {
        callbacks.onError(err instanceof Error ? err : new Error(String(err)));
      }
    });

  function startSSE() {
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
        streaming: true,
      },
      {
        onEvent: (event: ADKEvent) => {
          // Detect structured tool calls (functionCall events from ADK)
          for (const part of event.content?.parts ?? []) {
            if (!part.functionCall) continue;
            const { name, args } = part.functionCall;

            if (name === 'save_prompt_settings' && args.total_chapters != null) {
              totalChapters = args.total_chapters as number;
            }

            if (name === 'save_chapter' && args.chapter_text) {
              const chapterNum = confirmedChapters.length + 1;
              confirmedChapters.push({
                id: `ch-${chapterNum}`,
                chapterNumber: chapterNum,
                title: `Chapter ${chapterNum}`,
                text: (args.chapter_text as string).trim(),
                illustrations: [],
              });
              // Clear preview text — confirmed chapter replaces it
              streamingText = '';
              emitChapters();
            }
          }

          // Accumulate streaming text for live preview
          const text = event.content?.parts?.[0]?.text;
          if (!text) return;

          streamingText += text;

          // Throttle live preview updates
          const now = Date.now();
          if (now - lastPreviewUpdate < 200) return;
          lastPreviewUpdate = now;

          const previewText = streamingText.trim();
          if (previewText.length > 0) {
            const chapterNum = confirmedChapters.length + 1;
            const liveChapter: Chapter = {
              id: 'ch-live',
              chapterNumber: chapterNum,
              title: `Chapter ${chapterNum}`,
              text: previewText,
              illustrations: [],
            };
            callbacks.onChapterReady([...confirmedChapters, liveChapter], { totalChapters });
          }
        },
        onDone: () => {
          const story: Story = {
            storyId: sessionId,
            title: request.customPrompt ? 'Your Adventure' : `${request.characterName}'s Adventure`,
            chapters: confirmedChapters,
            summary: {
              lessonsLearned: ['Taking care of nature helps everyone.'],
              ecoFactsCovered: [],
              choicesMade: [],
            },
          };
          if (story.chapters.length > 0) {
            callbacks.onComplete(story);
          } else {
            callbacks.onError(new Error('No chapters were generated.'));
          }
        },
        onError: callbacks.onError,
      },
      abortController.signal,
    );
  }

  return {
    abort: () => abortController.abort(),
  };
}
