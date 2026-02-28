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
    colors: 'border-leaf bg-gradient-to-br from-sky to-white',
    selectedColors: 'border-leaf bg-gradient-to-br from-sky to-sky/60 shadow-lg',
  },
  {
    id: 'ocean',
    emoji: '🌊',
    label: 'Deep Ocean',
    description: 'Coral reefs, friendly whales, and sunken treasures',
    colors: 'border-water/40 bg-gradient-to-br from-water/10 to-white',
    selectedColors: 'border-water bg-gradient-to-br from-water/20 to-water/10 shadow-lg',
  },
  {
    id: 'mountains',
    emoji: '🏔️',
    label: 'Misty Mountains',
    description: 'Snowy peaks, secret caves, and soaring eagles',
    colors: 'border-bark/30 bg-gradient-to-br from-cream to-white',
    selectedColors: 'border-bark bg-gradient-to-br from-bark/10 to-cream shadow-lg',
  },
  {
    id: 'arctic',
    emoji: '❄️',
    label: 'Frozen Arctic',
    description: 'Northern lights, polar bears, and crystal ice caves',
    colors: 'border-water/30 bg-gradient-to-br from-water/5 to-white',
    selectedColors: 'border-water bg-gradient-to-br from-water/15 to-sky shadow-lg',
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
          <button
            key={w.id}
            onClick={() => onSelect(w.id)}
            className={`text-left p-5 rounded-2xl border-2 transition-all cursor-pointer ${
              selected === w.id
                ? `${w.selectedColors} scale-[1.02]`
                : `${w.colors} hover:-translate-y-0.5`
            }`}
          >
            <div className="text-4xl mb-2">{w.emoji}</div>
            <h3 className="font-display font-bold text-forest text-lg">{w.label}</h3>
            <p className="font-body text-sm text-bark/70 mt-1">{w.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
