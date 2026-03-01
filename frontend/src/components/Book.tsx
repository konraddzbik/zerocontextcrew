import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Chapter, ChoiceOption, BookState } from '../lib/types';
import { useTextPagination } from '../hooks/useTextPagination';
import BookCover from './BookCover';
import BookSpread from './BookSpread';
import TheEnd from './TheEnd';

// Fallback height if ref isn't ready yet
const TEXT_AREA_HEIGHT_FALLBACK = 400;

interface BookProps {
  chapters: Chapter[];
  title: string;
  hasMoreComing: boolean;
  totalChapters: number | null;
  choices: Record<string, ChoiceOption>;
  onChoice: (chapterId: string, option: ChoiceOption) => void;

  onNewStory: () => void;
}

export default function Book({
  chapters,
  title,
  hasMoreComing,
  totalChapters,
  choices,
  onChoice,
  onNewStory,
}: BookProps) {
  const [bookState, setBookState] = useState<BookState>('closed');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [textPageIndex, setTextPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [bookPageNumber, setBookPageNumber] = useState(1);
  // Track which textPageIndex should show the illustration (null = not yet placed)
  const [illustrationPageIdx, setIllustrationPageIdx] = useState<number | null>(null);
  // Ref to measure actual text area height dynamically
  const textAreaRef = useRef<HTMLDivElement | null>(null);

  const isReady = chapters.length > 0;
  const chapter = chapters[currentChapterIndex];

  // Paginate current chapter text into pages that fit on screen
  const textPages = useTextPagination(
    chapter?.text || '',
    textAreaRef.current ? textAreaRef : TEXT_AREA_HEIGHT_FALLBACK,
  );
  const isFirstTextPage = textPageIndex === 0;

  const hasIllustration = !!chapter?.illustrations[0]?.imageUrl;

  // Illustration shows on right when this spread is the designated illustration spread,
  // or for very short chapters (≤1 page) where there's no "next turn" to wait for.
  const showIllustrationOnRight = hasIllustration && (
    illustrationPageIdx === textPageIndex ||
    (illustrationPageIdx === null && textPages.length <= 1)
  );

  // When not showing illustration, fill the right page with text if available
  const rightTextContent =
    !showIllustrationOnRight && textPageIndex + 1 < textPages.length
      ? textPages[textPageIndex + 1]
      : undefined;

  // In dual-text mode, the last displayed page is textPageIndex+1
  const displayedLastIndex = rightTextContent ? textPageIndex + 1 : textPageIndex;
  const isLastTextPage = displayedLastIndex >= textPages.length - 1;

  const isFinalChapter = (() => {
    if (totalChapters !== null) {
      return chapter?.chapterNumber === totalChapters;
    }
    return currentChapterIndex === chapters.length - 1 && !hasMoreComing;
  })();

  // Reset text page + illustration tracking when chapter changes
  useEffect(() => {
    setTextPageIndex(0);
    setIllustrationPageIdx(null);
  }, [currentChapterIndex]);

  // Cover open — user click only
  const handleCoverOpen = useCallback(() => {
    if (bookState === 'closed' && isReady) {
      setBookState('opening');
    }
  }, [bookState, isReady]);

  // Called when cover flip animation completes
  const handleOpenComplete = useCallback(() => {
    setBookState('reading');
  }, []);

  // Start a page flip (forward)
  const triggerFlip = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
  }, [isFlipping]);

  // Go to previous page (instant, no flip animation)
  const handlePrevPage = useCallback(() => {
    if (isFlipping) return;
    // Return from "The End" to the last page of the story
    if (bookState === 'ended') {
      setBookState('reading');
      return;
    }
    if (textPageIndex > 0) {
      setTextPageIndex((i) => i - 1);
      setBookPageNumber((p) => Math.max(1, p - 1));
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex((i) => i - 1);
      setBookPageNumber((p) => Math.max(1, p - 1));
      // textPageIndex resets to 0 via useEffect on chapter change
    }
  }, [isFlipping, textPageIndex, currentChapterIndex, bookState]);

  const canGoPrev = bookState === 'ended' || textPageIndex > 0 || currentChapterIndex > 0;

  // Called by PageLeft when typewriter finishes on a non-last text page
  const handleAutoTurn = useCallback(() => {
    triggerFlip();
  }, [triggerFlip]);

  // Called by PageLeft "Turn page" button on last text page
  const handleTurnPage = useCallback(() => {
    triggerFlip();
  }, [triggerFlip]);

  // Called when PageTurn animation completes — decide what to advance
  const handleFlipComplete = useCallback(() => {
    setIsFlipping(false);
    setBookPageNumber((p) => p + 1);

    if (!isLastTextPage) {
      // Advance: 1 for illustration spread, 2 for dual-text, 1 for single-text
      const step = showIllustrationOnRight ? 1 : (rightTextContent ? 2 : 1);
      const nextIdx = textPageIndex + step;
      setTextPageIndex(nextIdx);

      // If illustration is ready but hasn't been placed, show it on the next spread
      if (hasIllustration && illustrationPageIdx === null) {
        setIllustrationPageIdx(nextIdx);
      }
    } else if (isFinalChapter) {
      // Final chapter done → The End
      setBookState('ended');
    } else if (currentChapterIndex < chapters.length - 1) {
      // Next chapter (textPageIndex + illustrationPageIdx reset via useEffect)
      setCurrentChapterIndex((i) => i + 1);
    }
  }, [isLastTextPage, showIllustrationOnRight, rightTextContent, textPageIndex, hasIllustration, illustrationPageIdx, isFinalChapter, currentChapterIndex, chapters.length]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (bookState === 'closed' && isReady && e.key === 'Enter') {
        handleCoverOpen();
        return;
      }
      if (bookState !== 'reading' || isFlipping) return;

      if (e.key === 'ArrowRight') {
        triggerFlip();
      }
      if (e.key === 'ArrowLeft') {
        handlePrevPage();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookState, isReady, isFlipping, handleCoverOpen, triggerFlip, handlePrevPage]);

  return (
    <div className="book-scene">
      <div className="book-shadow" />

      {/* Grid stage — all layers overlap in the same cell */}
      <div className="book-stage">
        {/* CLOSED: just the cover */}
        {bookState === 'closed' && (
          <motion.div
            className="book-stage-layer"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          >
            <BookCover
              title={title}
              onOpen={handleCoverOpen}
              isOpening={false}
              isReady={isReady}
            />
          </motion.div>
        )}

        {/* OPENING: static parchment spread behind + cover flips on top */}
        {bookState === 'opening' && (
          <>
            {/* Static parchment — clip-revealed in sync with cover flip */}
            <motion.div
              className="book-stage-layer"
              initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
              transition={{ delay: 0.4, duration: 1.4, ease: [0.645, 0.045, 0.355, 1] }}
            >
              <div className="book-spread">
                <div className="book-spread-top-edge" />
                <div className="book-spread-bottom-edge" />
              </div>
            </motion.div>

            {/* Cover on top — flips open with 3D rotation */}
            <div className="book-stage-layer" style={{ zIndex: 2 }}>
              <BookCover
                title={title}
                onOpen={() => {}}
                isOpening={true}
                isReady={true}
                onOpenComplete={handleOpenComplete}
              />
            </div>
          </>
        )}

        {/* READING: the actual spread with content */}
        {bookState === 'reading' && chapter && (
          <div className="book-stage-layer">
            <BookSpread
              chapter={chapter}
              textContent={textPages[textPageIndex] || ''}
              rightTextContent={rightTextContent}
              illustrationUrl={showIllustrationOnRight ? chapter.illustrations[0]?.imageUrl : undefined}
              isFirstTextPage={isFirstTextPage}
              isLastTextPage={isLastTextPage}
              onChoice={onChoice}
              selectedChoiceId={choices[chapter.id]?.id}
              isFinal={isFinalChapter}
              isFlipping={isFlipping}
              onTurnPage={handleTurnPage}
              onAutoTurn={handleAutoTurn}
              onFlipComplete={handleFlipComplete}
              pageNumber={bookPageNumber}
              hasNoIllustration={!hasIllustration}
              textAreaRef={textAreaRef}
            />
          </div>
        )}

        {/* Waiting for next chapter from SSE */}
        {bookState === 'reading' && !chapter && hasMoreComing && (
          <div className="book-stage-layer">
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
          </div>
        )}

        {/* THE END */}
        {bookState === 'ended' && (
          <motion.div
            className="book-stage-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <TheEnd
              onNewStory={onNewStory}
            />
          </motion.div>
        )}
      </div>

      {/* Navigation + progress — always rendered to reserve layout space */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: bookState === 'reading' || bookState === 'ended' ? 1 : 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ pointerEvents: bookState === 'reading' || bookState === 'ended' ? 'auto' : 'none' }}
      >
          <div className="book-nav">
            <motion.button
              onClick={onNewStory}
              className="book-nav-new-story"
              whileHover={{ scale: 1.05, opacity: 0.9 }}
              whileTap={{ scale: 0.95 }}
              title="Start a new story"
            >
              <span className="book-nav-new-story-icon" aria-hidden="true">&#x2726;</span>
              New Tale
            </motion.button>

            <div className="book-nav-controls">
              <motion.button
                onClick={handlePrevPage}
                disabled={!canGoPrev || isFlipping}
                className="book-nav-btn"
                whileHover={canGoPrev ? { scale: 1.1 } : {}}
                whileTap={canGoPrev ? { scale: 0.9 } : {}}
              >
                &larr;
              </motion.button>

              <div className="book-nav-info-enhanced">
                <div className="book-nav-chapter">
                  Chapter {chapter?.chapterNumber ?? currentChapterIndex + 1}
                  {totalChapters && <span className="book-nav-of"> of {totalChapters}</span>}
                </div>
              </div>

              <motion.button
                onClick={() => triggerFlip()}
                disabled={isFlipping || bookState === 'ended'}
                className="book-nav-btn"
                whileHover={!isFlipping && bookState !== 'ended' ? { scale: 1.1 } : {}}
                whileTap={!isFlipping && bookState !== 'ended' ? { scale: 0.9 } : {}}
              >
                &rarr;
              </motion.button>
            </div>
          </div>

          {totalChapters && totalChapters > 1 && (
            <div className="book-progress-bar">
              <motion.div
                className="book-progress-fill"
                initial={false}
                animate={{ width: `${((chapter?.chapterNumber ?? 1) / totalChapters) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          )}
        </motion.div>
    </div>
  );
}
