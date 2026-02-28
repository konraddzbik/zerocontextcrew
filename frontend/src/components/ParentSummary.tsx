import type { ParentSummary as ParentSummaryType } from '../lib/types';

interface ParentSummaryProps {
  summary: ParentSummaryType;
}

export default function ParentSummary({ summary }: ParentSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Lessons */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_var(--soft-shadow)] border-l-4 border-leaf">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🎯</span>
          <h3 className="font-display font-bold text-forest text-lg">Lessons Learned</h3>
        </div>
        <ul className="space-y-2">
          {summary.lessonsLearned.map((lesson, i) => (
            <li key={i} className="font-body text-forest/80 flex items-start gap-2">
              <span className="text-leaf mt-0.5 shrink-0">•</span>
              <span>{lesson}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Eco facts */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_var(--soft-shadow)] border-l-4 border-water">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🌍</span>
          <h3 className="font-display font-bold text-forest text-lg">Eco Facts Discovered</h3>
        </div>
        <ul className="space-y-2">
          {summary.ecoFactsCovered.map((fact, i) => (
            <li key={i} className="font-body text-forest/80 flex items-start gap-2">
              <span className="text-water mt-0.5 shrink-0">•</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Choices made */}
      {summary.choicesMade.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_var(--soft-shadow)] border-l-4 border-sun">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🤔</span>
            <h3 className="font-display font-bold text-forest text-lg">Choices Made</h3>
          </div>
          <div className="space-y-3">
            {summary.choicesMade.map((choice, i) => (
              <div key={i} className="bg-sun/10 rounded-xl p-4">
                <p className="font-body font-semibold text-forest text-sm">{choice.question}</p>
                <p className="font-body text-forest/70 text-sm mt-1">
                  Chose: <span className="font-semibold text-leaf">{choice.chosen}</span>
                </p>
                <p className="font-body text-bark/60 text-xs mt-1">{choice.lesson}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
