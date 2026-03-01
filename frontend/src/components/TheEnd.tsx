import { motion } from 'framer-motion';
import { TopVignette } from './PageOrnaments';

interface TheEndProps {
  onNewStory: () => void;
  onViewSummary: () => void;
}

export default function TheEnd({ onNewStory, onViewSummary }: TheEndProps) {
  return (
    <div className="book-spread">
      {/* Page edge stacks */}
      <div className="book-spread-top-edge" />
      <div className="book-spread-bottom-edge" />

      {/* Left page — "The End" */}
      <div className="page-left relative flex flex-col items-center justify-center h-full p-8 pb-16">
        <TopVignette />
        <motion.h1
          className="text-center"
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: 'var(--chapter-title)',
            lineHeight: 1.3,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          The End
        </motion.h1>
        <motion.div
          className="mt-6"
          style={{ color: 'var(--gold-muted)', fontSize: '1.5rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
          aria-hidden="true"
        >
          &#10087; &#10047; &#10087;
        </motion.div>

        {/* Decorative bottom border */}
        <div className="page-bottom-border">
          <span className="border-symbol" aria-hidden="true">&#10043;</span>
          <span className="border-symbol" aria-hidden="true">&#10022;</span>
          <span className="border-symbol" aria-hidden="true">&#10043;</span>
        </div>
      </div>

      {/* Right page — actions */}
      <div className="page-right relative flex flex-col items-center justify-center h-full p-8 pb-16 gap-6">
        <p
          style={{
            fontFamily: "'Crimson Text', serif",
            fontStyle: 'italic',
            fontSize: '1.1rem',
            color: 'var(--ink)',
            opacity: 0.7,
            textAlign: 'center',
          }}
        >
          Every story is a new adventure...
        </p>

        <motion.button
          onClick={onViewSummary}
          className="px-6 py-3 rounded-lg cursor-pointer"
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '0.9rem',
            color: 'var(--gold)',
            border: '2px solid var(--gold-muted)',
            background: 'transparent',
          }}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(212,165,71,0.1)' }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          View Story Summary
        </motion.button>

        <motion.button
          onClick={onNewStory}
          className="px-6 py-3 rounded-lg cursor-pointer"
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '0.9rem',
            color: 'var(--parchment)',
            background: 'var(--leather)',
            border: '2px solid var(--gold-muted)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          New Adventure
        </motion.button>

        {/* Decorative bottom border */}
        <div className="page-bottom-border">
          <span className="border-symbol" aria-hidden="true">&#10043;</span>
          <span className="border-symbol" aria-hidden="true">&#10022;</span>
          <span className="border-symbol" aria-hidden="true">&#10043;</span>
          <span className="border-symbol" aria-hidden="true">&#10022;</span>
          <span className="border-symbol" aria-hidden="true">&#10043;</span>
        </div>
      </div>
    </div>
  );
}
