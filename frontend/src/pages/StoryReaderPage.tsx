import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Chapter as ChapterType, ChoiceOption, Story, StoryRequest } from '../lib/types';
import { generateStory } from '../lib/api';
import Book from '../components/Book';
import LoadingScene from '../components/LoadingScene';

type Status = 'loading' | 'reading' | 'error';

export default function StoryReaderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const abortRef = useRef<{ abort: () => void } | null>(null);

  const pickerState = location.state as {
    name?: string;
    characterType?: string;
    companion?: string;
    world?: string;
    customPrompt?: string;
    bedtimeMode?: boolean;
  } | null;

  const world = (pickerState?.world || 'forest') as 'forest' | 'ocean' | 'mountains' | 'arctic';

  const [status, setStatus] = useState<Status>('loading');
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<ChapterType[]>([]);
  const [totalChapters, setTotalChapters] = useState<number | null>(null);
  const [choices, setChoices] = useState<Record<string, ChoiceOption>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    const request: StoryRequest = {
      characterName: pickerState?.name || 'Luna',
      characterType: (pickerState?.characterType as StoryRequest['characterType']) || 'girl',
      animalCompanion: pickerState?.companion || 'fox',
      world: world,
      ageRange: '4-6',
      ...(pickerState?.customPrompt ? { customPrompt: pickerState.customPrompt } : {}),
      ...(pickerState?.bedtimeMode ? { bedtimeMode: true } : {}),
    };

    const handle = generateStory(request, {
      onChapterReady: (newChapters, meta) => {
        setChapters(newChapters);
        if (meta.totalChapters) setTotalChapters(meta.totalChapters);
        if (newChapters.length >= 1) setStatus('reading');
      },
      onTextDelta: () => {},
      onComplete: (completedStory) => {
        setStory(completedStory);
        setChapters(completedStory.chapters);
        setStatus('reading');
      },
      onError: (err) => {
        setError(err.message || 'Something went wrong creating your story.');
        setStatus('error');
      },
    });

    abortRef.current = handle;

    return () => {
      handle.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasMoreComing = !story;
  const storyTitle = story?.title || `${pickerState?.name || 'Your'}'s Adventure`;

  function handleChoice(chapterId: string, option: ChoiceOption) {
    setChoices((prev) => ({ ...prev, [chapterId]: option }));
  }

  function handleNewStory() {
    navigate('/pick');
  }

  return (
    <AnimatePresence mode="wait">
      {/* --- Loading state --- */}
      {status === 'loading' && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <LoadingScene message="Writing your story..." />
        </motion.div>
      )}

      {/* --- Error state --- */}
      {status === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl p-8 max-w-md w-full text-center shadow-[0_4px_20px_var(--soft-shadow)]">
              <div className="text-5xl mb-4">😔</div>
              <h2 className="font-display text-2xl font-bold text-forest mb-2">
                Oops! Story got lost
              </h2>
              <p className="font-body text-bark/70 mb-6">{error}</p>
              <div className="flex flex-col gap-3">
                <motion.button
                  onClick={() => window.location.reload()}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 rounded-xl bg-sun text-forest font-display font-bold cursor-pointer"
                >
                  Try Again
                </motion.button>
                <motion.button
                  onClick={() => navigate('/pick')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 rounded-xl bg-surface text-forest border-2 border-leaf/20 font-display font-bold cursor-pointer"
                >
                  Pick a Different Story
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- Reading state (Storybook UI) --- */}
      {status === 'reading' && (
        <motion.div
          key="reading"
          className="relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* App header — back navigation */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
            <motion.button
              onClick={() => navigate('/pick')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/80 backdrop-blur-sm border border-leaf/15 shadow-[0_2px_12px_var(--soft-shadow)] font-body text-sm text-forest cursor-pointer pointer-events-auto"
            >
              <span aria-hidden="true">&larr;</span>
              New Story
            </motion.button>
            <span className="font-display font-bold text-forest/40 text-sm pointer-events-auto">
              TaleWorld
            </span>
          </div>

          <Book
            chapters={chapters}
            title={storyTitle}
            hasMoreComing={hasMoreComing}
            totalChapters={totalChapters}
            choices={choices}
            onChoice={handleChoice}
            onNewStory={handleNewStory}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
