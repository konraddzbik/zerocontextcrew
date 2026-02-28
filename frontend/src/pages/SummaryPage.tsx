import { useNavigate, useLocation } from 'react-router-dom';
import { mockStory } from '../lib/mockData';
import ParentSummary from '../components/ParentSummary';

export default function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const story = location.state?.story || mockStory;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-forest mb-2">
            Story Complete!
          </h1>
          <p className="font-body text-lg text-leaf">
            "{story.title}" — what an adventure!
          </p>
        </div>

        {/* Parent summary */}
        <ParentSummary summary={story.summary} />

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/pick')}
            className="px-8 py-3 rounded-xl font-display font-bold text-lg bg-sun text-forest hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg transition-all cursor-pointer"
          >
            Read Another Story! 📖
          </button>
          <button
            onClick={() => navigate('/story')}
            className="px-8 py-3 rounded-xl font-display font-bold text-lg bg-white text-forest border-2 border-leaf/20 hover:border-leaf/40 hover:-translate-y-0.5 shadow-sm transition-all cursor-pointer"
          >
            Read Again
          </button>
        </div>
      </div>
    </div>
  );
}
