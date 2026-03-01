import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBedtime } from './BedtimeContext';

export default function BedtimeToggle() {
  const { isBedtime, toggleBedtime } = useBedtime();

  const stars = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        top: `${10 + ((i * 19 + 3) % 60)}%`,
        right: `${6 + ((i * 13 + 5) % 30)}%`,
        delay: i * 0.5,
        size: 8 + (i % 3) * 2,
      })),
    [],
  );

  return (
    <motion.button
      onClick={toggleBedtime}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className={`relative w-full text-left p-5 rounded-lg border-2 cursor-pointer transition-colors overflow-hidden ${
        isBedtime
          ? 'border-[var(--gold)]/40 bg-[var(--gold)]/10 shadow-md'
          : 'border-[var(--ornate-border)] bg-surface hover:border-[var(--gold-muted)]'
      }`}
      aria-label={isBedtime ? 'Disable bedtime story mode' : 'Enable bedtime story mode'}
      aria-pressed={isBedtime}
      role="switch"
    >
      <div className="flex items-center gap-4">
        {/* Moon icon */}
        <motion.span
          className="text-3xl shrink-0"
          animate={isBedtime ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {'\u{1F319}'}
        </motion.span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-forest text-lg">
            Bedtime Story
          </h3>
          <p className="font-body text-sm text-bark/60 mt-0.5">
            A calm, cozy story to drift off to sleep
          </p>
        </div>

        {/* Status indicator */}
        <div
          className={`shrink-0 w-5 h-5 rounded-full border-2 transition-colors duration-300 flex items-center justify-center ${
            isBedtime
              ? 'border-[var(--gold)] bg-[var(--gold)]'
              : 'border-[var(--gold-muted)]/30 bg-transparent'
          }`}
        >
          <AnimatePresence>
            {isBedtime && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-3 h-3 text-white"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 6l3 3 5-5" />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative twinkling stars when active */}
      <AnimatePresence>
        {isBedtime &&
          stars.map((star, i) => (
            <motion.span
              key={i}
              className="absolute pointer-events-none text-[var(--gold)]/40"
              style={{
                top: star.top,
                right: star.right,
                fontSize: star.size,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.7, 0.3, 0.7], scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                opacity: { duration: 3, repeat: Infinity, delay: star.delay },
                scale: { duration: 0.3 },
              }}
            >
              {'\u2726'}
            </motion.span>
          ))}
      </AnimatePresence>
    </motion.button>
  );
}
