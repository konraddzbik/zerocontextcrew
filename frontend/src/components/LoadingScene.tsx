import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBedtime } from './BedtimeContext';

export default function LoadingScene({ message = 'Writing your story...' }: { message?: string }) {
  const { isBedtime } = useBedtime();

  const stars = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        top: `${6 + ((i * 13 + 3) % 35)}%`,
        left: `${8 + ((i * 19 + 7) % 80)}%`,
        delay: (i * 0.5) % 2,
        duration: 2 + (i % 3),
      })),
    [],
  );

  const skyGradient = isBedtime
    ? 'bg-gradient-to-b from-[#0a1628] via-[#0f1d30] to-[#1a2636]'
    : 'bg-gradient-to-b from-water/30 via-sky to-cream';
  const mtLight = isBedtime ? '#2a4a3a' : '#4a7c59';
  const mtDark = isBedtime ? '#152a20' : '#1a3a2a';
  const cloudOpacity1 = isBedtime ? 'bg-white/20' : 'bg-white/60';
  const cloudOpacity2 = isBedtime ? 'bg-white/15' : 'bg-white/40';
  const displayMessage = isBedtime ? 'Writing your bedtime story...' : message;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* CSS Scene */}
      <div className="relative w-64 h-40 mb-8 overflow-hidden rounded-2xl">
        {/* Sky gradient */}
        <div className={`absolute inset-0 ${skyGradient}`} />

        {/* Stars (bedtime only) */}
        {isBedtime &&
          stars.map((star, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white"
              style={{ top: star.top, left: star.left }}
              animate={{ opacity: [0.2, 0.9, 0.2] }}
              transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
            />
          ))}

        {/* Sun or Moon */}
        {isBedtime ? (
          <motion.div
            className="absolute top-6 right-10 w-10 h-10 rounded-full bg-[#e8dcc0]"
            animate={{
              boxShadow: [
                '0 0 15px 6px rgba(232, 220, 192, 0.2)',
                '0 0 25px 10px rgba(232, 220, 192, 0.3)',
                '0 0 15px 6px rgba(232, 220, 192, 0.2)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute top-1.5 left-2.5 w-2 h-2 rounded-full bg-[#d4c8a8] opacity-40" />
            <div className="absolute top-4 left-5 w-1.5 h-1.5 rounded-full bg-[#d4c8a8] opacity-30" />
          </motion.div>
        ) : (
          <motion.div
            className="absolute top-6 right-10 w-12 h-12 rounded-full bg-sun"
            animate={{
              boxShadow: [
                '0 0 30px 10px rgba(245, 197, 66, 0.3)',
                '0 0 50px 20px rgba(245, 197, 66, 0.4)',
                '0 0 30px 10px rgba(245, 197, 66, 0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Mountains */}
        <div className="absolute bottom-0 left-0 right-0">
          <div
            className="absolute bottom-0 left-4"
            style={{
              width: 0, height: 0,
              borderLeft: '50px solid transparent',
              borderRight: '50px solid transparent',
              borderBottom: `60px solid ${mtLight}`,
            }}
          />
          <div
            className="absolute bottom-0 left-16"
            style={{
              width: 0, height: 0,
              borderLeft: '70px solid transparent',
              borderRight: '70px solid transparent',
              borderBottom: `80px solid ${mtDark}`,
            }}
          />
          <div
            className="absolute bottom-0 right-6"
            style={{
              width: 0, height: 0,
              borderLeft: '40px solid transparent',
              borderRight: '40px solid transparent',
              borderBottom: `50px solid ${mtLight}`,
            }}
          />
        </div>

        {/* Clouds */}
        <motion.div
          className={`absolute top-4 w-16 h-5 ${cloudOpacity1} rounded-full`}
          animate={{ x: [-20, 280] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className={`absolute top-10 w-12 h-4 ${cloudOpacity2} rounded-full`}
          animate={{ x: [-30, 280] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear', delay: 3 }}
        />
      </div>

      {/* Loading text */}
      <motion.div
        className="text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <p className="font-display text-xl font-bold text-forest mb-1">{displayMessage}</p>
        <p className="font-body text-sm text-bark/50">This may take a moment...</p>
      </motion.div>

      {/* Bouncing dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-leaf"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}
