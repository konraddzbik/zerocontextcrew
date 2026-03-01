import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mockStory } from '../lib/mockData';
import ParentSummary from '../components/ParentSummary';
import { PageTransition, StaggerList, StaggerItem } from '../components/motion';

export default function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const story = location.state?.story || mockStory;

  return (
    <PageTransition>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="text-5xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
            >
              🎉
            </motion.div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-forest mb-2">
              Story Complete!
            </h1>
            <p className="font-body text-lg text-leaf">
              "{story.title}" — what an adventure!
            </p>
          </div>

          {/* Parent summary with stagger */}
          <StaggerList>
            <StaggerItem>
              <ParentSummary summary={story.summary} />
            </StaggerItem>
          </StaggerList>

          {/* Actions */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => navigate('/pick')}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3 rounded-xl font-display font-bold text-lg bg-sun text-forest shadow-lg transition-colors cursor-pointer"
            >
              Read Another Story! 📖
            </motion.button>
            <motion.button
              onClick={() => navigate('/story')}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3 rounded-xl font-display font-bold text-lg bg-white text-forest border-2 border-leaf/20 hover:border-leaf/40 shadow-sm transition-colors cursor-pointer"
            >
              Read Again
            </motion.button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
