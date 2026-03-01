import { motion } from 'framer-motion';

interface WorldPickerProps {
  selected: string;
  onSelect: (world: string) => void;
}

const worlds = [
  {
    id: 'forest',
    emoji: '🌲',
    label: 'Enchanted Forest',
    description: 'Tall trees, glowing mushrooms, and hidden creatures',
    colors: 'border-[var(--ornate-border)] bg-gradient-to-br from-sky to-surface',
    selectedColors: 'border-[var(--gold)] bg-gradient-to-br from-sky to-sky/60 shadow-lg',
  },
  {
    id: 'ocean',
    emoji: '🌊',
    label: 'Deep Ocean',
    description: 'Coral reefs, friendly whales, and sunken treasures',
    colors: 'border-[var(--ornate-border)] bg-gradient-to-br from-water/10 to-surface',
    selectedColors: 'border-[var(--gold)] bg-gradient-to-br from-water/20 to-water/10 shadow-lg',
  },
  {
    id: 'mountains',
    emoji: '🏔️',
    label: 'Misty Mountains',
    description: 'Snowy peaks, secret caves, and soaring eagles',
    colors: 'border-[var(--ornate-border)] bg-gradient-to-br from-cream to-surface',
    selectedColors: 'border-[var(--gold)] bg-gradient-to-br from-bark/10 to-cream shadow-lg',
  },
  {
    id: 'arctic',
    emoji: '❄️',
    label: 'Frozen Arctic',
    description: 'Northern lights, polar bears, and crystal ice caves',
    colors: 'border-[var(--ornate-border)] bg-gradient-to-br from-water/5 to-surface',
    selectedColors: 'border-[var(--gold)] bg-gradient-to-br from-water/15 to-sky shadow-lg',
  },
];

export default function WorldPicker({ selected, onSelect }: WorldPickerProps) {
  return (
    <div>
      <label className="block font-display text-lg font-bold text-forest mb-3">
        Choose your world!
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {worlds.map((w) => (
          <motion.button
            key={w.id}
            onClick={() => onSelect(w.id)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            animate={selected === w.id ? { scale: [1, 1.03, 1] } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`text-left p-5 rounded-lg border-2 cursor-pointer transition-colors ${
              selected === w.id ? w.selectedColors : w.colors
            }`}
          >
            <motion.div
              className="text-4xl mb-2"
              animate={selected === w.id ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              {w.emoji}
            </motion.div>
            <h3 className="font-display font-bold text-forest text-lg">{w.label}</h3>
            <p className="font-body text-sm text-bark/70 mt-1">{w.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
