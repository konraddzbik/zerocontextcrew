import { motion } from 'framer-motion';

interface CharacterPickerProps {
  name: string;
  onNameChange: (name: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const characterTypes = [
  { id: 'girl', emoji: '👧', label: 'Girl' },
  { id: 'boy', emoji: '👦', label: 'Boy' },
  { id: 'animal', emoji: '🐾', label: 'Animal' },
  { id: 'creature', emoji: '🧚', label: 'Creature' },
];

export default function CharacterPicker({
  name,
  onNameChange,
  selectedType,
  onTypeChange,
}: CharacterPickerProps) {
  return (
    <div className="space-y-6">
      {/* Name input */}
      <div>
        <label className="block font-display text-lg font-bold text-forest mb-2">
          What's your hero's name?
        </label>
        <input
          type="text"
          placeholder="Type a name..."
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={20}
          className="w-full px-4 py-3 rounded-lg border-2 border-[var(--ornate-border)] bg-cream font-body text-lg text-[var(--ink)] placeholder-[var(--ink)]/30 focus:outline-none focus:border-[var(--gold)] transition-colors"
        />
      </div>

      {/* Character type */}
      <div>
        <label className="block font-display text-lg font-bold text-forest mb-2">
          Who are they?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {characterTypes.map((ct) => (
            <motion.button
              key={ct.id}
              onClick={() => onTypeChange(ct.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              animate={selectedType === ct.id ? { scale: [1, 1.04, 1] } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedType === ct.id
                  ? 'border-[var(--gold)] bg-[var(--gold)]/10 shadow-md'
                  : 'border-[var(--ornate-border)] bg-surface hover:border-[var(--gold-muted)]'
              }`}
            >
              <span className="text-3xl">{ct.emoji}</span>
              <span className="font-body font-semibold text-forest">{ct.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

    </div>
  );
}
