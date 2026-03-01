import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Chapter, ChoiceOption, BookState } from '../lib/types';
import { useTextPagination } from '../hooks/useTextPagination';
import BookCover from './BookCover';
import BookSpread from './BookSpread';
import TheEnd from './TheEnd';

function isRealAudioUrl(url?: string): boolean {
  return !!url && !url.includes('mock') && !url.includes('example.com');
}

// Fallback height if ref isn't ready yet
const TEXT_AREA_HEIGHT_FALLBACK = 400;

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

  // ── Persistent audio element ──────────────────────────────────────────────
  // Kept at Book level so it survives page turns within a chapter.
  // We update its src when the active chapter changes.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

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

  // Update audio src when the active chapter changes.
  // Pause current playback, load the new chapter's audio (if any).
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const url = chapter?.audioUrl;
    el.pause();
    setIsAudioPlaying(false);
    if (isRealAudioUrl(url)) {
      el.src = url!;
      el.load();
    } else {
      el.removeAttribute('src');
    }
  }, [currentChapterIndex, chapter?.audioUrl]);

  // Also update src if audioUrl arrives after the chapter is already active
  // (SSE delivers audio asynchronously, after the chapter text)
  useEffect(() => {
    const el = audioRef.current;
    if (!el || isAudioPlaying) return;
    const url = chapter?.audioUrl;
    if (isRealAudioUrl(url) && el.src !== url) {
      el.src = url!;
      el.load();
    }
  }, [chapter?.audioUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAudioToggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isAudioPlaying) {
      el.pause();
      setIsAudioPlaying(false);
    } else {
      el.play().then(() => setIsAudioPlaying(true)).catch(() => setIsAudioPlaying(false));
    }
  }, [isAudioPlaying]);

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
    if (textPageIndex > 0) {
      setTextPageIndex((i) => i - 1);
      setBookPageNumber((p) => Math.max(1, p - 1));
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex((i) => i - 1);
      setBookPageNumber((p) => Math.max(1, p - 1));
      // textPageIndex resets to 0 via useEffect on chapter change
    }
  }, [isFlipping, textPageIndex, currentChapterIndex]);

  const canGoPrev = textPageIndex > 0 || currentChapterIndex > 0;

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
      {/* Persistent audio element — lives outside the page DOM so page turns never kill it */}
      <audio
        ref={audioRef}
        onEnded={() => setIsAudioPlaying(false)}
        onPause={() => setIsAudioPlaying(false)}
        style={{ display: 'none' }}
      />
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
            {/* Static parchment — no interactive content, avoids state issues */}
            <motion.div
              className="book-stage-layer"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
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
              audioRef={audioRef}
              isAudioPlaying={isAudioPlaying}
              onAudioToggle={handleAudioToggle}
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

      {/* Navigation bar — below the book */}
      {bookState === 'reading' && (
        <div className="book-nav">
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
            disabled={isFlipping}
            className="book-nav-btn"
            whileHover={!isFlipping ? { scale: 1.1 } : {}}
            whileTap={!isFlipping ? { scale: 0.9 } : {}}
          >
            &rarr;
          </motion.button>
        </div>
      )}

      {/* Chapter progress bar */}
      {bookState === 'reading' && totalChapters && totalChapters > 1 && (
        <div className="book-progress-bar">
          <motion.div
            className="book-progress-fill"
            initial={false}
            animate={{ width: `${((chapter?.chapterNumber ?? 1) / totalChapters) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      )}
    </div>
  );
}
