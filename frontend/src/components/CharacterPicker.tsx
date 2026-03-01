import { motion } from 'framer-motion';

interface CharacterPickerProps {
  name: string;
  onNameChange: (name: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  companion: string;
  onCompanionChange: (companion: string) => void;
}

const characterTypes = [
  { id: 'girl', emoji: '👧', label: 'Girl' },
  { id: 'boy', emoji: '👦', label: 'Boy' },
  { id: 'animal', emoji: '🐾', label: 'Animal' },
  { id: 'creature', emoji: '🧚', label: 'Creature' },
];

const companions = [
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'owl', emoji: '🦉', label: 'Owl' },
  { id: 'turtle', emoji: '🐢', label: 'Turtle' },
  { id: 'dolphin', emoji: '🐬', label: 'Dolphin' },
  { id: 'rabbit', emoji: '🐰', label: 'Rabbit' },
  { id: 'butterfly', emoji: '🦋', label: 'Butterfly' },
];

export default function CharacterPicker({
  name,
  onNameChange,
  selectedType,
  onTypeChange,
  companion,
  onCompanionChange,
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
          className="w-full px-4 py-3 rounded-xl border-2 border-leaf/30 bg-white font-body text-lg text-forest placeholder-bark/30 focus:outline-none focus:border-leaf transition-colors"
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
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                selectedType === ct.id
                  ? 'border-leaf bg-sky shadow-md'
                  : 'border-leaf/20 bg-white hover:border-leaf/40'
              }`}
            >
              <span className="text-3xl">{ct.emoji}</span>
              <span className="font-body font-semibold text-forest">{ct.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Companion */}
      <div>
        <label className="block font-display text-lg font-bold text-forest mb-2">
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
    </div>
  );
}
