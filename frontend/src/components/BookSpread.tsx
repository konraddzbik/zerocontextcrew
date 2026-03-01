import { useState, useEffect, useCallback, type RefObject } from 'react';
import PageLeft from './PageLeft';
import PageRight from './PageRight';
import PageRightText from './PageRightText';
import PageTurn from './PageTurn';
import type { Chapter, ChoiceOption } from '../lib/types';

interface BookSpreadProps {
  chapter: Chapter;
  textContent: string;
  rightTextContent?: string;
  illustrationUrl?: string;
  isFirstTextPage: boolean;
  isLastTextPage: boolean;
  onChoice: (chapterId: string, option: ChoiceOption) => void;
  selectedChoiceId?: string;
  isFinal: boolean;
  isFlipping: boolean;
  onTurnPage: () => void;
  onAutoTurn: () => void;
  onFlipComplete: () => void;
  pageNumber: number;
  hasNoIllustration?: boolean;
  textAreaRef?: RefObject<HTMLDivElement | null>;
  /** Lifted audio state — passed through to PageLeft */
  audioRef: RefObject<HTMLAudioElement | null>;
  isAudioPlaying: boolean;
  onAudioToggle: () => void;
}

export default function BookSpread({
  chapter,
  textContent,
  rightTextContent,
  illustrationUrl,
  isFirstTextPage,
  isLastTextPage,
  onChoice,
  selectedChoiceId,
  isFinal,
  isFlipping,
  onTurnPage,
  onAutoTurn,
  onFlipComplete,
  pageNumber,
  hasNoIllustration,
  textAreaRef,
  audioRef,
  isAudioPlaying,
  onAudioToggle,
}: BookSpreadProps) {
  const leftPageNum = pageNumber * 2;
  const rightPageNum = leftPageNum + 1;
  const altText = chapter.illustrations[0]?.altText;

  // Coordinate sequential typewriter: left finishes → right starts
  const [leftDone, setLeftDone] = useState(false);
  const [rightDone, setRightDone] = useState(false);

  useEffect(() => {
    setLeftDone(false);
    setRightDone(false);
  }, [textContent]);

  const handleLeftTextComplete = useCallback(() => {
    setLeftDone(true);
  }, []);

  return (
    <div className="book-spread">
      {/* Page edge stacks */}
      <div className="book-spread-top-edge" />
      <div className="book-spread-bottom-edge" />

      <PageLeft
        chapter={chapter}
        textContent={textContent}
        isFirstTextPage={isFirstTextPage}
        isLastTextPage={isLastTextPage}
        onChoice={onChoice}
        selectedChoiceId={selectedChoiceId}
        isFinal={isFinal}
        onTurnPage={onTurnPage}
        onAutoTurn={onAutoTurn}
        onTextComplete={rightTextContent ? handleLeftTextComplete : undefined}
        rightTextDone={rightTextContent ? rightDone : undefined}
        pageNumber={leftPageNum}
        textAreaRef={textAreaRef}
        audioRef={audioRef}
        isAudioPlaying={isAudioPlaying}
        onAudioToggle={onAudioToggle}
      />

      {rightTextContent ? (
        <PageRightText
          text={rightTextContent}
          startTyping={leftDone}
          pageNumber={rightPageNum}
          isLastTextPage={isLastTextPage}
          onAutoTurn={onAutoTurn}
          onTypeDone={() => setRightDone(true)}
        />
      ) : (
        <PageRight
          imageUrl={illustrationUrl}
          altText={altText}
          chapterTitle={chapter.title.startsWith('Chapter') ? chapter.title : `Chapter ${chapter.chapterNumber}`}
          pageNumber={rightPageNum}
          hasNoIllustration={hasNoIllustration}
        />
      )}

      <PageTurn isFlipping={isFlipping} onComplete={onFlipComplete} />
    </div>
  );
}
