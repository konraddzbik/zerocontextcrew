import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Chapter as ChapterType, ChoiceOption, Story, StoryRequest } from '../lib/types';
import { generateStory } from '../lib/api';
import Chapter from '../components/Chapter';
import WorldScene from '../components/WorldScene';
import LoadingScene from '../components/LoadingScene';
import { useBedtime } from '../components/BedtimeContext';
import { PageTransition } from '../components/motion';

const chapterVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.3, ease: 'easeIn' as const } },
};

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
  const { isBedtime } = useBedtime();

  const [status, setStatus] = useState<Status>('loading');
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<ChapterType[]>([]);
  const [totalChapters, setTotalChapters] = useState<number | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
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
        // Clamp current index if chapters shrunk (e.g. live preview replaced by confirmed)
        setCurrentChapter((c) => Math.min(c, Math.max(0, newChapters.length - 1)));
        if (newChapters.length >= 1) setStatus('reading');
      },
      onTextDelta: () => {
        // Could use for streaming text display in the future
      },
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

  const chapter = chapters[currentChapter];
  const isFirst = currentChapter === 0;
  const isLast = currentChapter === chapters.length - 1;
  const hasMoreComing = !story; // still generating

  function handleChoice(chapterId: string, option: ChoiceOption) {
    setChoices((prev) => ({ ...prev, [chapterId]: option }));
  }

  function handleNext() {
    if (isLast && story) {
      navigate('/summary', { state: { story, choices } });
    } else if (!isLast) {
      setCurrentChapter((c) => c + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handlePrev() {
    if (!isFirst) {
      setCurrentChapter((c) => c - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // --- Loading state ---
  if (status === 'loading') {
    return <LoadingScene message="Writing your story..." />;
  }

  // --- Error state ---
  if (status === 'error') {
    return (
      <PageTransition>
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
      </PageTransition>
    );
  }

  // --- Reading state ---
  if (!chapter) return null;

  return (
    <PageTransition>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* World scene header */}
          <WorldScene world={world} className="h-36 sm:h-44 mb-6" />

          {/* Story title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-forest">
              {story?.title || `${pickerState?.name || 'Your'}'s Adventure`}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              {Array.from({ length: totalChapters ?? chapters.length }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === currentChapter ? 32 : 16,
                    backgroundColor:
                      i === currentChapter
                        ? (isBedtime ? '#d4a54a' : '#f5c542')
                        : i < chapters.length
                          ? (isBedtime ? 'rgba(123,155,181,0.6)' : 'rgba(74,124,89,0.6)')
                          : (isBedtime ? 'rgba(123,155,181,0.2)' : 'rgba(74,124,89,0.2)'),
                  }}
                  className="h-2 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              ))}
              {hasMoreComing && !totalChapters && (
                <motion.div
                  className="h-2 w-4 rounded-full bg-leaf/10"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
          </div>

          {/* Chapter transition separator */}
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-3 text-leaf/40">
              <div className="h-px w-12 bg-leaf/20" />
              <span className="text-xl">{isBedtime ? '\u{1F319}' : '\u2728'}</span>
              <div className="h-px w-12 bg-leaf/20" />
            </div>
          </div>

          {/* Current chapter with animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentChapter}
              variants={chapterVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Chapter
                chapter={chapter}
                onChoice={handleChoice}
                selectedChoiceId={choices[chapter.id]?.id}
              />
            </motion.div>
          </AnimatePresence>

          {/* "More coming" indicator */}
          {isLast && hasMoreComing && (
            <motion.div
              className="mt-6 text-center font-body text-bark/50"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isBedtime ? '\u{1F319}' : '\u2728'} Next chapter is being written...
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <motion.button
              onClick={handlePrev}
              disabled={isFirst}
              whileHover={!isFirst ? { scale: 1.05, y: -2 } : {}}
              whileTap={!isFirst ? { scale: 0.95 } : {}}
              className={`px-6 py-3 rounded-xl font-display font-bold transition-colors ${
                isFirst
                  ? 'text-bark/30 cursor-not-allowed'
                  : 'bg-surface text-forest border-2 border-leaf/20 hover:border-leaf/40 shadow-sm cursor-pointer'
              }`}
            >
              ← Back
            </motion.button>

            <span className="font-body text-sm text-bark/50">
              {currentChapter + 1} of {story?.chapters.length ?? totalChapters ?? '...'}
            </span>

            <motion.button
              onClick={handleNext}
              disabled={isLast && hasMoreComing}
              whileHover={!(isLast && hasMoreComing) ? { scale: 1.05, y: -2 } : {}}
              whileTap={!(isLast && hasMoreComing) ? { scale: 0.95 } : {}}
              className={`px-6 py-3 rounded-xl font-display font-bold shadow-lg transition-colors ${
                isLast && hasMoreComing
                  ? 'bg-sky text-bark/40 cursor-not-allowed'
                  : 'bg-sun text-forest cursor-pointer'
              }`}
            >
              {isLast && story ? (isBedtime ? 'Sweet Dreams \u{1F319}' : 'Finish Story \u2728') : isLast ? 'Waiting...' : 'Next Chapter \u2192'}
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
