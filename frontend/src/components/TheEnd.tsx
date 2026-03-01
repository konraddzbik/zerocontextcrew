import { motion } from 'framer-motion';
import { TopVignette } from './PageOrnaments';

const sparkles = [
  { symbol: '\u2726', top: '22%', left: '18%', size: '0.9rem', delay: 0.6 },
  { symbol: '\u274B', top: '20%', left: '78%', size: '0.7rem', delay: 0.75 },
  { symbol: '\u2726', top: '58%', left: '12%', size: '0.65rem', delay: 0.9 },
  { symbol: '\u2726', top: '60%', left: '85%', size: '0.8rem', delay: 1.05 },
  { symbol: '\u273F', top: '42%', left: '8%', size: '0.6rem', delay: 1.2 },
  { symbol: '\u273F', top: '40%', left: '90%', size: '0.7rem', delay: 1.35 },
];

interface TheEndProps {
  onNewStory: () => void;
}

export default function TheEnd({ onNewStory }: TheEndProps) {
  return (
    <div className="book-spread">
      {/* Page edge stacks */}
      <div className="book-spread-top-edge" />
      <div className="book-spread-bottom-edge" />

      {/* Left page — "The End" */}
      <div className="page-left relative flex flex-col items-center justify-center h-full p-8 pb-16">
        <TopVignette />

        {/* Sparkle decorations */}
        {sparkles.map((s, i) => (
          <motion.span
            key={i}
            className="absolute"
            style={{ top: s.top, left: s.left, fontSize: s.size, color: 'var(--gold-muted)' }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ delay: s.delay, duration: 0.6, ease: 'easeOut' }}
            aria-hidden="true"
          >
            {s.symbol}
          </motion.span>
        ))}

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

        {/* Animated SVG divider */}
        <motion.svg
          viewBox="0 0 300 30"
          className="mt-5"
          style={{ width: '12rem' }}
          aria-hidden="true"
        >
          <motion.path
            d="M10 15 Q75 2 150 15 Q225 28 290 15"
            fill="none"
            stroke="var(--gold-muted)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ delay: 0.6, duration: 1.5, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="150" cy="15" r="3"
            fill="var(--gold)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ delay: 1.8, duration: 0.4 }}
          />
        </motion.svg>

        {/* Warm closing line */}
        <motion.p
          className="mt-5 text-center"
          style={{
            fontFamily: "'Crimson Text', serif",
            fontStyle: 'italic',
            fontSize: '1.05rem',
            color: 'var(--ink)',
            opacity: 0.55,
            lineHeight: 1.8,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          And they all lived<br />happily ever after&hellip;
        </motion.p>

        <motion.div
          className="mt-4"
          style={{ color: 'var(--gold-muted)', fontSize: '1.5rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.6 }}
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
        {/* Decorative SVG ornament */}
        <motion.svg
          viewBox="0 0 120 60"
          style={{ width: '6rem' }}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <path
            d="M10 30 Q30 10 60 30 Q90 50 110 30"
            fill="none"
            stroke="var(--gold-muted)"
            strokeWidth="1"
          />
          <circle cx="60" cy="30" r="2" fill="var(--gold-muted)" />
        </motion.svg>

        <motion.p
          style={{
            fontFamily: "'Crimson Text', serif",
            fontStyle: 'italic',
            fontSize: '1.1rem',
            color: 'var(--ink)',
            opacity: 0.65,
            textAlign: 'center',
            lineHeight: 1.8,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Every story is a seed,<br />
          planted in the garden<br />
          of your imagination.
        </motion.p>

        {/* Another small ornament */}
        <motion.svg
          viewBox="0 0 120 20"
          style={{ width: '5rem' }}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <line x1="10" y1="10" x2="50" y2="10" stroke="var(--gold-muted)" strokeWidth="1" />
          <circle cx="60" cy="10" r="2" fill="var(--gold-muted)" />
          <line x1="70" y1="10" x2="110" y2="10" stroke="var(--gold-muted)" strokeWidth="1" />
        </motion.svg>

        <motion.button
          onClick={onNewStory}
          className="the-end-btn px-8 py-4 rounded-lg cursor-pointer"
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '0.95rem',
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
