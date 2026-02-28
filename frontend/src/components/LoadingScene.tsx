import { motion } from 'framer-motion';

export default function LoadingScene({ message = 'Writing your story...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* CSS Scene */}
      <div className="relative w-64 h-40 mb-8 overflow-hidden rounded-2xl">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-water/30 via-sky to-cream" />

        {/* Sun */}
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

        {/* Mountains */}
        <div className="absolute bottom-0 left-0 right-0">
          <div
            className="absolute bottom-0 left-4"
            style={{
              width: 0, height: 0,
              borderLeft: '50px solid transparent',
              borderRight: '50px solid transparent',
              borderBottom: '60px solid #4a7c59',
            }}
          />
          <div
            className="absolute bottom-0 left-16"
            style={{
              width: 0, height: 0,
              borderLeft: '70px solid transparent',
              borderRight: '70px solid transparent',
              borderBottom: '80px solid #1a3a2a',
            }}
          />
          <div
            className="absolute bottom-0 right-6"
            style={{
              width: 0, height: 0,
              borderLeft: '40px solid transparent',
              borderRight: '40px solid transparent',
              borderBottom: '50px solid #4a7c59',
            }}
          />
        </div>

        {/* Clouds */}
        <motion.div
          className="absolute top-4 w-16 h-5 bg-white/60 rounded-full"
          animate={{ x: [-20, 280] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-10 w-12 h-4 bg-white/40 rounded-full"
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
        <p className="font-display text-xl font-bold text-forest mb-1">{message}</p>
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
