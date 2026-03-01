import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '../hooks/useTypewriter';
import { TopVignette } from './PageOrnaments';
import AudioPlayer from './AudioPlayer';
import type { Chapter, ChoiceOption } from '../lib/types';

interface PageLeftProps {
  chapter: Chapter;
  onChoice: (chapterId: string, option: ChoiceOption) => void;
  selectedChoiceId?: string;
  isFinal: boolean;
  onTurnPage: () => void;
  pageNumber: number;
}

export default function PageLeft({
  chapter,
  onChoice,
  selectedChoiceId,
  isFinal,
  onTurnPage,
  pageNumber,
}: PageLeftProps) {
  const { displayed, isDone } = useTypewriter(chapter.text, 80);
  const firstLetter = displayed[0] || '';
  const restText = displayed.slice(1);
  const hasChoices = !!chapter.choice?.options?.length;
  const choiceMade = !!selectedChoiceId;
  const showTurnPage = isDone && !isFinal && (!hasChoices || choiceMade);

  return (
    <div className="page-left relative flex flex-col h-full p-6 md:p-8 pb-16 book-page-scroll">
      {/* Audio — small, top-right */}
      {chapter.audioUrl && (
        <div className="absolute top-3 right-3 z-10 scale-75 origin-top-right">
          <AudioPlayer audioUrl={chapter.audioUrl} chapterTitle={chapter.title} />
        </div>
      )}

      {/* Ornament + title */}
      <TopVignette />
      <h2 className="chapter-title-book">
        {chapter.title.startsWith('Chapter') ? chapter.title : `Chapter ${chapter.chapterNumber}: ${chapter.title}`}
      </h2>

      {/* Story text with dropcap */}
      <div className="story-text-book flex-1">
        {firstLetter && <span className="dropcap">{firstLetter}</span>}
        <span style={{ whiteSpace: 'pre-line' }}>{restText}</span>
        {!isDone && <span className="typewriter-cursor" />}
      </div>

      {/* Choices — slide up after typewriter finishes */}
      <AnimatePresence>
        {isDone && hasChoices && (
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

      {/* Turn page button */}
      {showTurnPage && (
        <motion.button
          onClick={onTurnPage}
          className="mt-4 self-end px-5 py-2 rounded-lg cursor-pointer"
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '0.85rem',
            color: 'var(--gold)',
            border: '1px solid var(--gold-muted)',
            background: 'transparent',
          }}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(212,165,71,0.1)' }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Turn page &rarr;
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
