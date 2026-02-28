import { useState } from 'react';
import type { Chapter as ChapterType, ChoiceOption } from '../lib/types';
import ChapterIllustrations from './ChapterIllustrations';
import AudioPlayer from './AudioPlayer';
import ChoiceCard from './ChoiceCard';

interface ChapterProps {
  chapter: ChapterType;
  onChoice?: (chapterId: string, option: ChoiceOption) => void;
  selectedChoiceId?: string;
}

export default function Chapter({ chapter, onChoice, selectedChoiceId }: ChapterProps) {
  const [localChoice, setLocalChoice] = useState<string | undefined>(selectedChoiceId);

  function handleChoose(option: ChoiceOption) {
    setLocalChoice(option.id);
    onChoice?.(chapter.id, option);
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_var(--soft-shadow)] border-l-4 border-leaf">
      {/* Chapter heading */}
      <h2 className="font-display text-2xl font-bold text-forest mb-1">
        Chapter {chapter.chapterNumber}: {chapter.title}
      </h2>

      {/* Eco fact badge */}
      {chapter.ecoFact && (
        <div className="flex items-start gap-2 mt-3 mb-5 px-4 py-2.5 rounded-xl bg-sky text-sm font-body text-leaf">
          <span className="text-base shrink-0">🌿</span>
          <span>{chapter.ecoFact}</span>
        </div>
      )}

      {/* Audio player */}
      <div className="mb-5">
        <AudioPlayer audioUrl={chapter.audioUrl} chapterTitle={chapter.title} />
      </div>

      {/* First illustration (hero) */}
      {chapter.illustrations.length > 0 && (
        <div className="mb-6">
          <img
            src={chapter.illustrations[0].imageUrl}
            alt={chapter.illustrations[0].altText}
            className="w-full rounded-xl shadow-sm"
            loading="lazy"
          />
        </div>
      )}

      {/* Story text */}
      <div className="font-body text-lg sm:text-xl leading-relaxed sm:leading-[1.8] text-forest/90 whitespace-pre-line max-w-[60ch] mb-6">
        {chapter.text}
      </div>

      {/* Remaining illustrations */}
      {chapter.illustrations.length > 1 && (
        <div className="mb-6">
          <ChapterIllustrations illustrations={chapter.illustrations.slice(1)} />
        </div>
      )}

      {/* Choice moment */}
      {chapter.choice && (
        <div className="mt-6">
          <ChoiceCard
            question={chapter.choice.question}
            options={chapter.choice.options}
            selectedId={localChoice}
            onChoose={handleChoose}
          />
        </div>
      )}
    </div>
  );
}
