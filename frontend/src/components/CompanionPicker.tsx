import { motion } from 'framer-motion';

interface CompanionPickerProps {
  companion: string;
  onCompanionChange: (companion: string) => void;
}

const companions = [
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'owl', emoji: '🦉', label: 'Owl' },
  { id: 'turtle', emoji: '🐢', label: 'Turtle' },
  { id: 'dolphin', emoji: '🐬', label: 'Dolphin' },
  { id: 'rabbit', emoji: '🐰', label: 'Rabbit' },
  { id: 'butterfly', emoji: '🦋', label: 'Butterfly' },
];

export default function CompanionPicker({
  companion,
  onCompanionChange,
}: CompanionPickerProps) {
  return (
    <div>
      <label className="block font-display text-lg font-bold text-forest mb-3">
        Pick a companion!
      </label>
      <div className="grid grid-cols-3 gap-3">
        {companions.map((c) => (
          <motion.button
            key={c.id}
            onClick={() => onCompanionChange(c.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            animate={companion === c.id ? { scale: [1, 1.06, 1] } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
              companion === c.id
                ? 'border-leaf bg-sky shadow-md'
                : 'border-leaf/20 bg-white hover:border-leaf/40'
            }`}
          >
            <span className="text-2xl">{c.emoji}</span>
            <span className="font-body text-sm font-medium text-forest">{c.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
