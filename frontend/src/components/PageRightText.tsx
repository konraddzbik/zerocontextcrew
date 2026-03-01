import { useEffect, useRef } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { PageCorners } from './PageOrnaments';

interface PageRightTextProps {
  text: string;
  startTyping: boolean;
  pageNumber: number;
  isLastTextPage: boolean;
  onAutoTurn: () => void;
  onTypeDone?: () => void;
}

export default function PageRightText({
  text,
  startTyping,
  pageNumber,
  isLastTextPage,
  onAutoTurn,
  onTypeDone,
}: PageRightTextProps) {
  // Pass empty string until left page finishes → text change triggers useTypewriter reset
  const { displayed, isDone } = useTypewriter(startTyping ? text : '', 50);

  // Signal completion (immediate, for choices coordination)
  const typeDoneRef = useRef(false);
  useEffect(() => { typeDoneRef.current = false; }, [text]);

  useEffect(() => {
    if (isDone && startTyping && text.length > 0 && onTypeDone && !typeDoneRef.current) {
      typeDoneRef.current = true;
      onTypeDone();
    }
  }, [isDone, startTyping, text, onTypeDone]);

  // Auto page-turn after typewriter finishes (3s delay, non-last pages only)
  const autoTurnedRef = useRef(false);
  useEffect(() => { autoTurnedRef.current = false; }, [text]);

  useEffect(() => {
    if (isDone && startTyping && text.length > 0 && !isLastTextPage) {
      const timer = setTimeout(() => {
        if (!autoTurnedRef.current) {
          autoTurnedRef.current = true;
          onAutoTurn();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isDone, startTyping, text, isLastTextPage, onAutoTurn]);

  const firstLetter = startTyping ? (displayed[0] || '') : '';
  const restText = startTyping ? displayed.slice(1) : '';

  return (
    <div className="page-right relative flex flex-col h-full p-6 md:p-8 pb-16">
      <PageCorners />

      <div className="story-text-book flex-1" style={{ overflow: 'hidden' }}>
        {firstLetter && <span className="dropcap">{firstLetter}</span>}
        <span style={{ whiteSpace: 'pre-line' }}>{restText}</span>
        {startTyping && !isDone && <span className="typewriter-cursor" />}
      </div>

      <div className="page-bottom-border">
        <span className="border-symbol" aria-hidden="true">&#10043;</span>
        <span className="border-symbol" aria-hidden="true">&#10022;</span>
        <span className="border-symbol" aria-hidden="true">&#10043;</span>
        <span className="border-symbol" aria-hidden="true">&#10022;</span>
        <span className="border-symbol" aria-hidden="true">&#10043;</span>
      </div>

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
