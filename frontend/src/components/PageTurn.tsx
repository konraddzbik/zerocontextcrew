import { motion } from 'framer-motion';

interface PageTurnProps {
  isFlipping: boolean;
  onComplete: () => void;
}

export default function PageTurn({ isFlipping, onComplete }: PageTurnProps) {
  if (!isFlipping) return null;

  return (
    <motion.div
      className="absolute top-0 right-0 w-1/2 h-full z-20"
      style={{
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
      }}
      initial={{ rotateY: 0, z: 0 }}
      animate={{
        rotateY: -180,
        z: [0, 20, 0],
      }}
      transition={{
        duration: 0.8,
        ease: [0.15, 0.8, 0.3, 1],
        z: { duration: 0.8, times: [0, 0.45, 1], ease: 'easeInOut' },
      }}
      onAnimationComplete={onComplete}
    >
      {/* Front face — visible first half of turn */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          backgroundColor: 'var(--parchment)',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(139,109,76,0.03) 30px, rgba(139,109,76,0.03) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(139,109,76,0.02) 30px, rgba(139,109,76,0.02) 31px)',
          borderRadius: '0 12px 12px 0',
          overflow: 'hidden',
        }}
      >
        {/* Page thickness — bright strip on turning edge */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '2px',
            height: '100%',
            background:
              'linear-gradient(to bottom, rgba(255,240,220,0.6), rgba(200,180,150,0.3), rgba(255,240,220,0.6))',
          }}
        />

        {/* Fold shadow — sweeps across page, peaks mid-turn */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.12) 25%, transparent 60%)',
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, 1, 0.3] }}
          transition={{ duration: 0.8, times: [0, 0.4, 1], ease: 'easeInOut' }}
        />

        {/* Paper curve illusion — subtle highlight near the fold */}
        <motion.div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '12px',
            height: '100%',
            background:
              'linear-gradient(to right, rgba(255,255,255,0.12), transparent)',
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.8, times: [0, 0.4, 1], ease: 'easeInOut' }}
        />
      </div>

      {/* Back face — revealed second half of turn */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          backgroundColor: 'var(--parchment)',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(139,109,76,0.04) 30px, rgba(139,109,76,0.04) 31px)',
          borderRadius: '12px 0 0 12px',
          overflow: 'hidden',
        }}
      >
        {/* Page thickness — left edge on back face */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '2px',
            height: '100%',
            background:
              'linear-gradient(to bottom, rgba(255,240,220,0.5), rgba(200,180,150,0.2), rgba(255,240,220,0.5))',
          }}
        />

        {/* Edge shadow — fades as page settles */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to left, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.04) 15%, transparent 40%)',
            pointerEvents: 'none',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.7, 0.15] }}
          transition={{ duration: 0.8, times: [0, 0.5, 1], ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}
