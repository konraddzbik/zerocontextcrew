import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { mockStory } from '../lib/mockData';
import type { ChoiceOption } from '../lib/types';
import Chapter from '../components/Chapter';
import WorldScene from '../components/WorldScene';
import { PageTransition } from '../components/motion';

const chapterVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.3, ease: 'easeIn' } },
};

export default function StoryReaderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [choices, setChoices] = useState<Record<string, ChoiceOption>>({});
  const [direction, setDirection] = useState(1);

  const story = mockStory;
  const world = (location.state?.world || 'forest') as 'forest' | 'ocean' | 'mountains' | 'arctic';
  const chapter = story.chapters[currentChapter];
  const isFirst = currentChapter === 0;
  const isLast = currentChapter === story.chapters.length - 1;

  function handleChoice(chapterId: string, option: ChoiceOption) {
    setChoices((prev) => ({ ...prev, [chapterId]: option }));
  }

  function handleNext() {
    if (isLast) {
      navigate('/summary', { state: { story, choices } });
    } else {
      setDirection(1);
      setCurrentChapter((c) => c + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handlePrev() {
    if (!isFirst) {
      setDirection(-1);
      setCurrentChapter((c) => c - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* World scene header */}
          <WorldScene world={world} className="h-36 sm:h-44 mb-6" />

          {/* Story title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-forest">
              {story.title}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              {story.chapters.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === currentChapter ? 32 : 16,
                    backgroundColor:
                      i === currentChapter
                        ? '#f5c542'
                        : i < currentChapter
                          ? 'rgba(74,124,89,0.6)'
                          : 'rgba(74,124,89,0.2)',
                  }}
                  className="h-2 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              ))}
            </div>
          </div>

          {/* Chapter transition separator */}
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-3 text-leaf/40">
              <div className="h-px w-12 bg-leaf/20" />
              <span className="text-xl">✨</span>
              <div className="h-px w-12 bg-leaf/20" />
            </div>
          </div>

          {/* Current chapter with animation */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentChapter}
              custom={direction}
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
                  : 'bg-white text-forest border-2 border-leaf/20 hover:border-leaf/40 shadow-sm cursor-pointer'
              }`}
            >
              ← Back
            </motion.button>

            <span className="font-body text-sm text-bark/50">
              {currentChapter + 1} of {story.chapters.length}
            </span>

            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-display font-bold bg-sun text-forest shadow-lg transition-colors cursor-pointer"
            >
              {isLast ? 'Finish Story ✨' : 'Next Chapter →'}
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
