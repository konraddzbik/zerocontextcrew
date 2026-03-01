import { motion } from 'framer-motion';

interface FreeformPickerProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  moods: string[];
  onMoodsChange: (moods: string[]) => void;
}

const moodOptions = [
  { id: 'funny', emoji: '😄', label: 'Funny' },
  { id: 'brave', emoji: '⚔️', label: 'Brave' },
  { id: 'mysterious', emoji: '🔮', label: 'Mysterious' },
  { id: 'gentle', emoji: '🌸', label: 'Gentle' },
  { id: 'spooky', emoji: '👻', label: 'Spooky' },
  { id: 'silly', emoji: '🤪', label: 'Silly' },
];

export default function FreeformPicker({
  prompt,
  onPromptChange,
  moods,
  onMoodsChange,
}: FreeformPickerProps) {
  function toggleMood(id: string) {
    onMoodsChange(
      moods.includes(id) ? moods.filter((m) => m !== id) : [...moods, id],
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-display text-lg font-bold text-forest mb-2">
          What story do you dream of?
        </label>
        <textarea
          placeholder="Once upon a time, in a land where trees could sing and rivers told stories..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={5}
          className="w-full px-5 py-4 rounded-2xl border-2 border-leaf/20 bg-cream font-body text-lg text-forest placeholder-bark/30 focus:outline-none focus:border-sun transition-colors resize-none"
        />
        <p className="text-right text-xs font-body text-bark/30 mt-1">
          {prompt.length < 10
            ? `${10 - prompt.length} more characters needed`
            : 'Ready to create!'}
        </p>
      </div>

      <div>
        <label className="block font-display text-base font-bold text-forest mb-3">
          Set the mood <span className="font-body text-sm font-normal text-bark/40">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {moodOptions.map((m) => (
            <motion.button
              key={m.id}
              onClick={() => toggleMood(m.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.94 }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 cursor-pointer transition-colors font-body text-sm font-medium ${
                moods.includes(m.id)
                  ? 'border-leaf bg-sky text-forest shadow-sm'
                  : 'border-leaf/20 bg-white text-forest/70 hover:border-leaf/40'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
