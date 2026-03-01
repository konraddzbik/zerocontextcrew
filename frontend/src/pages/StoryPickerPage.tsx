import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CharacterPicker from '../components/CharacterPicker';
import CompanionPicker from '../components/CompanionPicker';
import WorldPicker from '../components/WorldPicker';
import { PageTransition, StaggerList, StaggerItem } from '../components/motion';

export default function StoryPickerPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [characterType, setCharacterType] = useState('');
  const [companion, setCompanion] = useState('');
  const [world, setWorld] = useState('');

  const isReady = name.trim() && characterType && companion && world;

  function handleCreate() {
    if (!isReady) return;
    navigate('/story', {
      state: { name, characterType, companion, world },
    });
  }

  return (
    <PageTransition>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl font-bold text-forest mb-2">
              Create Your Story ✨
            </h1>
            <p className="font-body text-lg text-leaf">
              Pick a hero, a companion, and a world — we'll write a story just for you!
            </p>
          </div>

          {/* Pickers */}
          <StaggerList className="space-y-8">
            <StaggerItem>
              <p className="font-display text-sm font-bold text-leaf uppercase tracking-wide mb-2">Your Hero</p>
              <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_var(--soft-shadow)]">
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
              <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_var(--soft-shadow)]">
                <CompanionPicker
                  companion={companion}
                  onCompanionChange={setCompanion}
                />
              </div>
            </StaggerItem>

            <StaggerItem>
              <p className="font-display text-sm font-bold text-leaf uppercase tracking-wide mb-2">Your World</p>
              <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_var(--soft-shadow)]">
                <WorldPicker selected={world} onSelect={setWorld} />
              </div>
            </StaggerItem>
          </StaggerList>

          {/* Preview of selections */}
          {isReady && (
            <motion.div
              className="mt-8 bg-white rounded-2xl px-6 py-4 shadow-[0_4px_20px_var(--soft-shadow)] text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="font-body text-lg text-bark/80">
                <span className="font-semibold text-forest">{name}</span> the{' '}
                {characterType} and their {companion} companion explore the {world}!
              </p>
            </motion.div>
          )}

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
