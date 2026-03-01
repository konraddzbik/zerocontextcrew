import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterPicker from '../components/CharacterPicker';
import CompanionPicker from '../components/CompanionPicker';
import WorldPicker from '../components/WorldPicker';
import FreeformPicker from '../components/FreeformPicker';
import BedtimeToggle from '../components/BedtimeToggle';
import { useBedtime } from '../components/BedtimeContext';
import { PageTransition, StaggerList, StaggerItem } from '../components/motion';

type Mode = 'guided' | 'freeform';

const modes = [
  {
    id: 'guided' as Mode,
    emoji: '🗺️',
    label: 'Guided Adventure',
    description: "We'll help you pick a hero, companion & world",
  },
  {
    id: 'freeform' as Mode,
    emoji: '✍️',
    label: 'Your Own Tale',
    description: 'Describe your dream story and let the magic happen',
  },
];

export default function StoryPickerPage() {
  const navigate = useNavigate();
  const { isBedtime } = useBedtime();

  // Guided mode state
  const [mode, setMode] = useState<Mode>('guided');
  const [name, setName] = useState('');
  const [characterType, setCharacterType] = useState('');
  const [companion, setCompanion] = useState('');
  const [world, setWorld] = useState('');

  // Freeform mode state
  const [prompt, setPrompt] = useState('');
  const [moods, setMoods] = useState<string[]>([]);

  const guidedReady = name.trim() && characterType && companion && world;
  const freeformReady = prompt.trim().length >= 10;
  const isReady = mode === 'guided' ? guidedReady : freeformReady;

  function handleCreate() {
    if (!isReady) return;

    if (mode === 'freeform') {
      const moodSuffix = moods.length > 0 ? `\nMood: ${moods.join(', ')}.` : '';
      navigate('/story', {
        state: {
          customPrompt: `Write a children's story in English with 3 chapters. Target age: 4-6 years old. Include ecology lessons and a sense of wonder.\n\nStory idea: ${prompt.trim()}${moodSuffix}`,
          world: 'forest',
          bedtimeMode: isBedtime,
        },
      });
    } else {
      navigate('/story', {
        state: { name, characterType, companion, world, bedtimeMode: isBedtime },
      });
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-bold text-forest mb-2">
              {isBedtime ? 'Create Your Bedtime Story \u{1F319}' : 'Create Your Story \u2728'}
            </h1>
            <p className="font-body text-lg text-leaf">
              {isBedtime
                ? 'A cozy story to drift off to sleep...'
                : "Choose your path and we'll write a story just for you!"}
            </p>
          </div>

          {/* Bedtime mode tile */}
          <div className="mb-8">
            <BedtimeToggle />
          </div>

          {/* Mode switcher */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {modes.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => setMode(m.id)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className={`text-left p-5 rounded-2xl border-2 cursor-pointer transition-colors ${
                  mode === m.id
                    ? 'border-sun bg-sun/10 shadow-md'
                    : 'border-leaf/20 bg-surface hover:border-leaf/40'
                }`}
              >
                <span className="text-3xl block mb-2">{m.emoji}</span>
                <h3 className="font-display font-bold text-forest text-lg">
                  {m.label}
                </h3>
                <p className="font-body text-sm text-bark/60 mt-1">
                  {m.description}
                </p>
              </motion.button>
            ))}
          </div>

          {/* Conditional content */}
          <AnimatePresence mode="wait">
            {mode === 'guided' ? (
              <motion.div
                key="guided"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <StaggerList className="space-y-8">
                  <StaggerItem>
                    <p className="font-display text-sm font-bold text-leaf uppercase tracking-wide mb-2">Your Hero</p>
                    <div className="bg-surface rounded-2xl p-6 shadow-[0_4px_20px_var(--soft-shadow)]">
                      <CharacterPicker
                        name={name}
                        onNameChange={setName}
                        selectedType={characterType}
                        onTypeChange={setCharacterType}
                      />
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <p className="font-display text-sm font-bold text-leaf uppercase tracking-wide mb-2">Your Companion</p>
                    <div className="bg-surface rounded-2xl p-6 shadow-[0_4px_20px_var(--soft-shadow)]">
                      <CompanionPicker
                        companion={companion}
                        onCompanionChange={setCompanion}
                      />
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <p className="font-display text-sm font-bold text-leaf uppercase tracking-wide mb-2">Your World</p>
                    <div className="bg-surface rounded-2xl p-6 shadow-[0_4px_20px_var(--soft-shadow)]">
                      <WorldPicker selected={world} onSelect={setWorld} />
                    </div>
                  </StaggerItem>
                </StaggerList>

                {/* Preview of selections */}
                {guidedReady && (
                  <motion.div
                    className="mt-8 bg-surface rounded-2xl px-6 py-4 shadow-[0_4px_20px_var(--soft-shadow)] text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="font-body text-lg text-bark/80">
                      <span className="font-semibold text-forest">{name}</span> the{' '}
                      {characterType} and their {companion} companion explore the {world}!
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="freeform"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <p className="font-display text-sm font-bold text-leaf uppercase tracking-wide mb-2">Your Story</p>
                <div className="bg-surface rounded-2xl p-6 shadow-[0_4px_20px_var(--soft-shadow)]">
                  <FreeformPicker
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    moods={moods}
                    onMoodsChange={setMoods}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create button */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={handleCreate}
              disabled={!isReady}
              whileHover={isReady ? { scale: 1.04, y: -2 } : {}}
              whileTap={isReady ? { scale: 0.97 } : {}}
              className={`px-10 py-4 rounded-2xl font-display font-bold text-xl transition-colors ${
                isReady
                  ? 'bg-sun text-forest shadow-lg cursor-pointer'
                  : 'bg-sky text-bark/40 cursor-not-allowed'
              }`}
            >
              {isReady ? 'Create My Story! 📖' : 'Pick everything first!'}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
