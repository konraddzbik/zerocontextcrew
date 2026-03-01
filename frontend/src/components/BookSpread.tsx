import PageLeft from './PageLeft';
import PageRight from './PageRight';
import PageTurn from './PageTurn';
import type { Chapter, ChoiceOption } from '../lib/types';

interface BookSpreadProps {
  chapter: Chapter;
  onChoice: (chapterId: string, option: ChoiceOption) => void;
  selectedChoiceId?: string;
  isFinal: boolean;
  isFlipping: boolean;
  onTurnPage: () => void;
  onFlipComplete: () => void;
  chapterIndex: number;
}

export default function BookSpread({
  chapter,
  onChoice,
  selectedChoiceId,
  isFinal,
  isFlipping,
  onTurnPage,
  onFlipComplete,
  chapterIndex,
}: BookSpreadProps) {
  const leftPageNum = chapterIndex * 2 + 2;
  const rightPageNum = leftPageNum + 1;
  const imageUrl = chapter.illustrations[0]?.imageUrl;
  const altText = chapter.illustrations[0]?.altText;

  return (
    <div className="book-spread">
      {/* Page edge stacks */}
      <div className="book-spread-top-edge" />
      <div className="book-spread-bottom-edge" />

      <PageLeft
        chapter={chapter}
        onChoice={onChoice}
        selectedChoiceId={selectedChoiceId}
        isFinal={isFinal}
        onTurnPage={onTurnPage}
        pageNumber={leftPageNum}
      />
      <PageRight
        imageUrl={imageUrl}
        altText={altText}
        pageNumber={rightPageNum}
      />
      <PageTurn isFlipping={isFlipping} onComplete={onFlipComplete} />
    </div>
  );
}
