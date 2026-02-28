import type { ChoiceOption } from '../lib/types';

interface ChoiceCardProps {
  question: string;
  options: ChoiceOption[];
  selectedId?: string;
  onChoose: (option: ChoiceOption) => void;
}

const lessonColors: Record<string, string> = {
  ecology: 'bg-leaf/10 text-leaf border-leaf/30',
  courage: 'bg-sun/20 text-bark border-sun/40',
  empathy: 'bg-berry/10 text-berry border-berry/30',
  kindness: 'bg-coral/10 text-coral border-coral/30',
};

export default function ChoiceCard({ question, options, selectedId, onChoose }: ChoiceCardProps) {
  return (
    <div className="bg-sun/10 rounded-2xl p-6 border-2 border-sun/30">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤔</span>
        <h3 className="font-display font-bold text-forest text-lg">{question}</h3>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const tagStyle = lessonColors[opt.lessonTag] || 'bg-sky text-forest border-leaf/20';

          return (
            <button
              key={opt.id}
              onClick={() => onChoose(opt)}
              disabled={!!selectedId}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-sun bg-sun/20 shadow-md'
                  : selectedId
                    ? 'border-leaf/10 bg-white/50 opacity-60'
                    : 'border-leaf/20 bg-white hover:border-leaf/40 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-body font-semibold text-forest">{opt.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-body font-medium ${tagStyle}`}>
                  {opt.lessonTag}
                </span>
              </div>
              {isSelected && (
                <p className="font-body text-sm text-bark/70 mt-2">
                  {opt.consequence}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
