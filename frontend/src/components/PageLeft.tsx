import { useEffect, useRef, type RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '../hooks/useTypewriter';
import { TopVignette, PageCorners } from './PageOrnaments';
import AudioPlayer from './AudioPlayer';
import type { Chapter, ChoiceOption } from '../lib/types';

interface PageLeftProps {
  chapter: Chapter;
  textContent: string;
  isFirstTextPage: boolean;
  isLastTextPage: boolean;
  onChoice: (chapterId: string, option: ChoiceOption) => void;
  selectedChoiceId?: string;
  isFinal: boolean;
  onTurnPage: () => void;
  onAutoTurn: () => void;
  onTextComplete?: () => void;
  rightTextDone?: boolean;
  pageNumber: number;
  textAreaRef?: RefObject<HTMLDivElement | null>;
  /** Lifted audio state from Book — keeps playback alive across page turns */
  audioRef: RefObject<HTMLAudioElement | null>;
  isAudioPlaying: boolean;
  onAudioToggle: () => void;
}

export default function PageLeft({
  chapter,
  textContent,
  isFirstTextPage,
  isLastTextPage,
  onChoice,
  selectedChoiceId,
  isFinal,
  onTurnPage,
  onAutoTurn,
  onTextComplete,
  rightTextDone,
  pageNumber,
  textAreaRef,
  audioRef,
  isAudioPlaying,
  onAudioToggle,
}: PageLeftProps) {
  const { displayed, isDone } = useTypewriter(textContent, 50);
  const hasChoices = !!chapter.choice?.options?.length;
  const choiceMade = !!selectedChoiceId;

  // When right page has text, wait for it to finish before showing choices/end
  const allTextDone = isDone && (rightTextDone === undefined || rightTextDone);
  const showFinish = allTextDone && isLastTextPage && isFinal && (!hasChoices || choiceMade);

  // Signal typewriter completion to parent (for right-page coordination)
  const textCompleteFiredRef = useRef(false);
  useEffect(() => { textCompleteFiredRef.current = false; }, [textContent]);

  useEffect(() => {
    if (isDone && onTextComplete && !textCompleteFiredRef.current) {
      textCompleteFiredRef.current = true;
      onTextComplete();
    }
  }, [isDone, onTextComplete]);

  // Auto page-turn when typewriter finishes on a non-last text page (3s delay)
  // Only when there's no right text page (right page handles auto-turn in dual mode)
  const autoTurnedRef = useRef(false);
  useEffect(() => { autoTurnedRef.current = false; }, [textContent]);

  useEffect(() => {
    if (isDone && !isLastTextPage && !onTextComplete) {
      const timer = setTimeout(() => {
        if (!autoTurnedRef.current) {
          autoTurnedRef.current = true;
          onAutoTurn();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isDone, isLastTextPage, onAutoTurn, onTextComplete]);

  // Dropcap on every page — illuminated on first page, inline on others
  const firstLetter = displayed[0] || '';
  const restText = displayed.slice(1);
  const dropcapClass = isFirstTextPage ? 'dropcap dropcap-first' : 'dropcap';

  return (
    <div className="page-left relative flex flex-col h-full p-6 md:p-8 pb-16">
      <PageCorners />

      {/* Ornament + title — only on first text page */}
      {isFirstTextPage && (
        <>
          <TopVignette />
          <h2 className="chapter-title-book">
            {chapter.title.startsWith('Chapter') ? chapter.title : `Chapter ${chapter.chapterNumber}: ${chapter.title}`}
          </h2>
        </>
      )}

      {/* Audio player — every page; full variant on first, compact on subsequent */}
      <AudioPlayer
        audioUrl={chapter.audioUrl}
        chapterTitle={chapter.title}
        audioRef={audioRef}
        isPlaying={isAudioPlaying}
        onToggle={onAudioToggle}
        compact={!isFirstTextPage}
      />

      {/* Story text */}
      <div ref={textAreaRef} className="story-text-book flex-1" style={{ overflow: 'hidden' }}>
        {firstLetter && <span className={dropcapClass}>{firstLetter}</span>}
        <span style={{ whiteSpace: 'pre-line' }}>{restText}</span>
        {!isDone && <span className="typewriter-cursor" />}
      </div>

      {/* Choices — only on last text page */}
      <AnimatePresence>
        {allTextDone && isLastTextPage && hasChoices && (
          <motion.div
            className="mt-4 space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p
              className="text-sm font-semibold mb-2"
              style={{ fontFamily: "'Crimson Text', serif", color: 'var(--chapter-title)' }}
            >
              {chapter.choice!.question}
            </p>
            {chapter.choice!.options.map((opt) => {
              const isSelected = selectedChoiceId === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  onClick={() => onChoice(chapter.id, opt)}
                  disabled={choiceMade}
                  whileHover={!choiceMade ? { scale: 1.02 } : {}}
                  whileTap={!choiceMade ? { scale: 0.98 } : {}}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[var(--gold)] bg-[var(--gold)]/15'
                      : choiceMade
                        ? 'border-[var(--gold-muted)]/20 opacity-50'
                        : 'border-[var(--gold-muted)]/30 hover:border-[var(--gold)]/60 bg-[var(--parchment)]'
                  }`}
                  style={{ fontFamily: "'Crimson Text', serif", color: 'var(--ink)' }}
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish button — last text page of final chapter */}
      {showFinish && (
        <motion.button
          onClick={onTurnPage}
          className="mt-4 self-center px-6 py-2.5 rounded-lg cursor-pointer"
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '0.9rem',
            color: 'var(--gold)',
            border: '1.5px solid var(--gold-muted)',
            background: 'transparent',
          }}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(212,165,71,0.1)' }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          The End &hearts;
        </motion.button>
      )}

      {/* Decorative bottom border */}
      <div className="page-bottom-border">
        <span className="border-symbol" aria-hidden="true">&#10043;</span>
        <span className="border-symbol" aria-hidden="true">&#10022;</span>
        <span className="border-symbol" aria-hidden="true">&#10043;</span>
      </div>

      {/* Page number */}
      <div
        className="absolute bottom-2 left-0 right-0 text-center"
        style={{
          fontFamily: "'Crimson Text', serif",
          fontStyle: 'italic',
          fontSize: '0.8rem',
          color: 'var(--ink)',
          opacity: 0.4,
        }}
      >
        {pageNumber}
      </div>
    </div>
  );
}
