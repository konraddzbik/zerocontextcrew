import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterPicker from '../components/CharacterPicker';
import WorldPicker from '../components/WorldPicker';

export default function StoryPickerPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [characterType, setCharacterType] = useState('');
  const [companion, setCompanion] = useState('');
  const [world, setWorld] = useState('');

  const isReady = name.trim() && characterType && companion && world;

  function handleCreate() {
    if (!isReady) return;
    // For now, navigate to reader with mock data. Later: pass selections to SSE.
    navigate('/story', {
      state: { name, characterType, companion, world },
    });
  }

  return (
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
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_var(--soft-shadow)]">
            <CharacterPicker
              name={name}
              onNameChange={setName}
              selectedType={characterType}
              onTypeChange={setCharacterType}
              companion={companion}
              onCompanionChange={setCompanion}
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_var(--soft-shadow)]">
            <WorldPicker selected={world} onSelect={setWorld} />
          </div>
        </div>

        {/* Create button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleCreate}
            disabled={!isReady}
            className={`px-10 py-4 rounded-2xl font-display font-bold text-xl transition-all cursor-pointer ${
              isReady
                ? 'bg-sun text-forest hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg'
                : 'bg-sky text-bark/40 cursor-not-allowed'
            }`}
          >
            {isReady ? 'Create My Story! 📖' : 'Choose all options to begin'}
          </button>
        </div>

        {/* Preview of selections */}
        {isReady && (
          <div className="mt-6 text-center font-body text-bark/70">
            <p>
              <span className="font-semibold text-forest">{name}</span> the{' '}
              {characterType} and their {companion} companion explore the {world}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
