import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockStory } from '../lib/mockData';
import type { ChoiceOption } from '../lib/types';
import Chapter from '../components/Chapter';
import ChapterTransition from '../components/ChapterTransition';

export default function StoryReaderPage() {
  const navigate = useNavigate();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [choices, setChoices] = useState<Record<string, ChoiceOption>>({});

  const story = mockStory;
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
      setCurrentChapter((c) => c + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handlePrev() {
    if (!isFirst) {
      setCurrentChapter((c) => c - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Story title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-forest">
            {story.title}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            {story.chapters.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentChapter
                    ? 'w-8 bg-sun'
                    : i < currentChapter
                      ? 'w-4 bg-leaf/60'
                      : 'w-4 bg-leaf/20'
                }`}
              />
            ))}
          </div>
        </div>

        <ChapterTransition />

        {/* Current chapter */}
        <Chapter
          chapter={chapter}
          onChoice={handleChoice}
          selectedChoiceId={choices[chapter.id]?.id}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className={`px-6 py-3 rounded-xl font-display font-bold transition-all ${
              isFirst
                ? 'text-bark/30 cursor-not-allowed'
                : 'bg-white text-forest border-2 border-leaf/20 hover:border-leaf/40 hover:-translate-y-0.5 shadow-sm cursor-pointer'
            }`}
          >
            ← Back
          </button>

          <span className="font-body text-sm text-bark/50">
            {currentChapter + 1} of {story.chapters.length}
          </span>

          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-xl font-display font-bold bg-sun text-forest hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg transition-all cursor-pointer"
          >
            {isLast ? 'Finish Story ✨' : 'Next Chapter →'}
          </button>
        </div>
      </div>
    </div>
  );
}
