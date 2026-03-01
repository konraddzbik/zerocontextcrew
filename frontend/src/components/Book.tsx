import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Chapter, ChoiceOption, BookState } from '../lib/types';
import BookCover from './BookCover';
import BookSpread from './BookSpread';
import TheEnd from './TheEnd';

interface BookProps {
  chapters: Chapter[];
  title: string;
  hasMoreComing: boolean;
  totalChapters: number | null;
  choices: Record<string, ChoiceOption>;
  onChoice: (chapterId: string, option: ChoiceOption) => void;
  onFinish: () => void;
  onNewStory: () => void;
}

export default function Book({
  chapters,
  title,
  hasMoreComing,
  totalChapters,
  choices,
  onChoice,
  onFinish,
  onNewStory,
}: BookProps) {
  const [bookState, setBookState] = useState<BookState>('closed');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Auto-open cover when first chapter arrives
  useEffect(() => {
    if (chapters.length > 0 && bookState === 'closed') {
      // Small delay so user sees the cover
      const timer = setTimeout(() => setBookState('opening'), 800);
      return () => clearTimeout(timer);
    }
  }, [chapters.length, bookState]);

  const handleCoverOpen = useCallback(() => {
    if (bookState === 'closed' && chapters.length > 0) {
      setBookState('opening');
    }
  }, [bookState, chapters.length]);

  // Detect when opening animation finishes
  useEffect(() => {
    if (bookState === 'opening') {
      const timer = setTimeout(() => setBookState('reading'), 1900);
      return () => clearTimeout(timer);
    }
  }, [bookState]);

  const chapter = chapters[currentChapterIndex];
  const isFinalChapter = (() => {
    if (totalChapters !== null) {
      return chapter?.chapterNumber === totalChapters;
    }
    return currentChapterIndex === chapters.length - 1 && !hasMoreComing;
  })();

  const handleTurnPage = useCallback(() => {
    if (isFlipping) return;

    // If we're on the last chapter and story is done, go to "ended"
    if (isFinalChapter) {
      setIsFlipping(true);
      // After flip animation, show TheEnd
      setTimeout(() => {
        setIsFlipping(false);
        setBookState('ended');
      }, 1300);
      return;
    }

    // If next chapter exists, flip to it
    if (currentChapterIndex < chapters.length - 1) {
      setIsFlipping(true);
    }
  }, [isFlipping, isFinalChapter, currentChapterIndex, chapters.length]);

  const handleFlipComplete = useCallback(() => {
    setIsFlipping(false);
    setCurrentChapterIndex((i) => Math.min(i + 1, chapters.length - 1));
  }, [chapters.length]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (bookState !== 'reading' || isFlipping) return;

      if (e.key === 'ArrowRight') {
        handleTurnPage();
      } else if (e.key === 'ArrowLeft' && currentChapterIndex > 0) {
        setCurrentChapterIndex((i) => i - 1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookState, isFlipping, currentChapterIndex, handleTurnPage]);

  return (
    <div className="book-scene">
      <div className="book-shadow" />
      <AnimatePresence mode="wait">
        {/* Cover */}
        {(bookState === 'closed' || bookState === 'opening') && (
          <BookCover
            key="cover"
            title={title}
            onOpen={handleCoverOpen}
            isOpening={bookState === 'opening'}
          />
        )}

        {/* Reading spread */}
        {bookState === 'reading' && chapter && (
          <BookSpread
            key={`spread-${currentChapterIndex}`}
            chapter={chapter}
            onChoice={onChoice}
            selectedChoiceId={choices[chapter.id]?.id}
            isFinal={isFinalChapter}
            isFlipping={isFlipping}
            onTurnPage={handleTurnPage}
            onFlipComplete={handleFlipComplete}
            chapterIndex={currentChapterIndex}
          />
        )}

        {/* Waiting indicator when on last chapter and more are coming */}
        {bookState === 'reading' && !chapter && hasMoreComing && (
          <div className="book-spread">
            <div className="flex items-center justify-center h-full col-span-2">
              <p
                style={{
                  fontFamily: "'Crimson Text', serif",
                  fontStyle: 'italic',
                  color: 'var(--ink)',
                  opacity: 0.5,
                }}
              >
                The storyteller is writing the next chapter...
              </p>
            </div>
          </div>
        )}

        {/* The End */}
        {bookState === 'ended' && (
          <TheEnd
            key="end"
            onViewSummary={onFinish}
            onNewStory={onNewStory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
