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

/**
 * ADK artifact API returns JSON `{inlineData: {mimeType, data}}` with base64.
 * Fetch it, decode, and return a blob URL usable in <img src>.
 */
async function fetchArtifactAsBlobUrl(artifactUrl: string): Promise<string | null> {
  try {
    const res = await fetch(artifactUrl);
    if (!res.ok) return null;
    const json = await res.json();
    const mimeType = json?.inlineData?.mimeType || 'image/png';
    const base64 = json?.inlineData?.data;
    if (!base64) return null;
    // ADK may use URL-safe base64 (- and _ instead of + and /)
    const standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(standardBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('[StoryTime] Failed to fetch artifact:', artifactUrl, err);
    return null;
  }
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
  // Buffer: save_chapter functionCall text, waiting for functionResponse confirmation
  let pendingChapterText: string | null = null;

  function emitChapters() {
    callbacks.onChapterReady([...confirmedChapters], { totalChapters });
  }

  /** Update a confirmed chapter with image/audio that arrives later via stateDelta/artifactDelta. */
  function attachMedia(chapterNum: number, media: { artifactUrl?: string; audioUrl?: string }) {
    const chapter = confirmedChapters.find((c) => c.chapterNumber === chapterNum);
    if (!chapter) return;

    // Audio — direct URL, attach immediately
    if (media.audioUrl && !chapter.audioUrl) {
      chapter.audioUrl = media.audioUrl;
      emitChapters();
    }

    // Image — ADK artifact returns JSON with base64, need to fetch & decode
    if (media.artifactUrl && chapter.illustrations.length === 0) {
      // Mark as pending so we don't fetch twice
      chapter.illustrations = [
        {
          id: `ill-${chapterNum}`,
          imageUrl: '', // placeholder, will be replaced by blob URL
          altText: `Illustration for Chapter ${chapterNum}`,
          position: 'full-width',
        },
      ];
      fetchArtifactAsBlobUrl(media.artifactUrl).then((blobUrl) => {
        if (blobUrl) {
          chapter.illustrations[0].imageUrl = blobUrl;
          console.log(`[StoryTime] Ch${chapterNum} illustration blob ready`);
        } else {
          // Reset so fallback can retry
          chapter.illustrations = [];
          console.warn(`[StoryTime] Ch${chapterNum} artifact fetch failed`);
        }
        emitChapters();
      });
      return; // emitChapters will be called asynchronously after fetch
    }
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
          // --- 1. Detect structured tool calls and responses ---
          for (const part of event.content?.parts ?? []) {
            // Handle functionCall: buffer chapter text, extract settings
            if (part.functionCall) {
              const { name, args } = part.functionCall;

              if (name === 'save_prompt_settings' && args.total_chapters != null) {
                totalChapters = args.total_chapters as number;
              }

              if (name === 'save_chapter' && args.chapter_text) {
                pendingChapterText = (args.chapter_text as string).trim();
              }
            }

            // Handle functionResponse: only confirm chapter if backend accepted it
            const fResp = part.functionResponse as { name?: string; response?: Record<string, unknown> } | undefined;
            if (fResp?.name === 'save_chapter' && fResp.response) {
              const status = fResp.response.status as string;
              if (status === 'saved' && pendingChapterText) {
                const chapterNum = (fResp.response.chapter_number as number) || confirmedChapters.length + 1;
                // Extract title from stateDelta if available
                const allChapters = event.actions?.stateDelta?.all_chapters as
                  | Array<{ chapter_number: number; scene?: string }>
                  | undefined;
                const backendChapter = allChapters?.find((c) => c.chapter_number === chapterNum);
                confirmedChapters.push({
                  id: `ch-${chapterNum}`,
                  chapterNumber: chapterNum,
                  title: backendChapter?.scene
                    ? `Chapter ${chapterNum}`
                    : `Chapter ${chapterNum}`,
                  text: pendingChapterText,
                  illustrations: [],
                });
                streamingText = '';
                pendingChapterText = null;
                emitChapters();
              } else {
                // Rejected by Guard 2 — discard pending text
                pendingChapterText = null;
              }
            }
          }

          // --- 2. Parse artifactDelta for illustrations (ADK artifact API) ---
          const artifactDelta = event.actions?.artifactDelta as Record<string, number> | undefined;
          if (artifactDelta) {
            for (const filename of Object.keys(artifactDelta)) {
              const match = filename.match(/chapter_(\d+)_illustration/);
              if (match) {
                const chapterNum = parseInt(match[1], 10);
                const imageUrl = `${API_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions/${sessionId}/artifacts/${filename}`;
                console.log(`[StoryTime] Illustration artifact for ch${chapterNum}:`, imageUrl);
                attachMedia(chapterNum, { artifactUrl: imageUrl });
              }
            }
          }

          // --- 3. Parse stateDelta for audio + illustrations ---
          const stateDelta = event.actions?.stateDelta;
          if (stateDelta) {
            const audioResults = stateDelta.all_audio_results as
              | Array<{ chapter: number; audio_url: string }>
              | undefined;
            if (audioResults) {
              for (const entry of audioResults) {
                if (entry.chapter && entry.audio_url) {
                  attachMedia(entry.chapter, { audioUrl: entry.audio_url });
                }
              }
            }

            // Fallback: parse illustration_history from stateDelta
            const illustrationHistory = stateDelta.illustration_history as
              | Array<{ chapter: number; image_path?: string }>
              | undefined;
            if (illustrationHistory) {
              for (const entry of illustrationHistory) {
                if (!entry.chapter) continue;
                // Check if this chapter already has an illustration
                const ch = confirmedChapters.find((c) => c.chapterNumber === entry.chapter);
                if (ch && ch.illustrations.length > 0) continue;
                // Construct artifact URL from known naming convention
                const filename = `chapter_${entry.chapter}_illustration.png`;
                const imageUrl = `${API_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions/${sessionId}/artifacts/${filename}`;
                console.log(`[StoryTime] Illustration from stateDelta for ch${entry.chapter}:`, imageUrl);
                attachMedia(entry.chapter, { artifactUrl: imageUrl });
              }
            }
          }

          // --- 4. Accumulate streaming text for live preview ---
          // Only story_writer_agent text is actual chapter content
          if (event.author !== 'story_writer_agent') return;
          const text = event.content?.parts?.[0]?.text;
          if (!text) return;
          // Skip agent confirmation messages (not chapter text)
          if (event.partial === false) return;

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
