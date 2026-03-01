import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div
      className="bg-sun/10 rounded-2xl p-6 border-2 border-sun/30"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <motion.span
          className="text-2xl"
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
        >
          🤔
        </motion.span>
        <h3 className="font-display font-bold text-forest text-lg">{question}</h3>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const tagStyle = lessonColors[opt.lessonTag] || 'bg-sky text-forest border-leaf/20';

          return (
            <motion.button
              key={opt.id}
              onClick={() => onChoose(opt)}
              disabled={!!selectedId}
              whileHover={!selectedId ? { y: -2, scale: 1.01 } : {}}
              whileTap={!selectedId ? { scale: 0.98 } : {}}
              animate={isSelected ? { scale: [1, 1.02, 1] } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                isSelected
                  ? 'border-sun bg-sun/20 shadow-md'
                  : selectedId
                    ? 'border-leaf/10 bg-surface/50 opacity-60'
                    : 'border-leaf/20 bg-surface hover:border-leaf/40 hover:shadow-sm cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-body font-semibold text-forest">{opt.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-body font-medium ${tagStyle}`}>
                  {opt.lessonTag}
                </span>
              </div>
              <AnimatePresence>
                {isSelected && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="font-body text-sm text-bark/70 mt-2"
                  >
                    {opt.consequence}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
