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
      initial={{ rotateY: 0 }}
      animate={{ rotateY: -180 }}
      transition={{ duration: 1.2, ease: [0.645, 0.045, 0.355, 1] }}
      onAnimationComplete={onComplete}
    >
      {/* Front face — parchment with shadow gradient at fold */}
      <div
        className="page-flip-front"
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          backgroundColor: 'var(--parchment)',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(139,109,76,0.03) 30px, rgba(139,109,76,0.03) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(139,109,76,0.02) 30px, rgba(139,109,76,0.02) 31px)',
          borderRadius: '0 12px 12px 0',
          boxShadow: '-6px 0 20px rgba(0,0,0,0.25), 0 0 40px rgba(0,0,0,0.1)',
        }}
      >
        {/* Shadow gradient at the fold edge */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '40px',
            height: '100%',
            background: 'linear-gradient(to right, rgba(0,0,0,0.15), transparent)',
            borderRadius: '0',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Back face — reverse side of page */}
      <div
        className="page-flip-back"
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          backgroundColor: 'var(--parchment)',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(139,109,76,0.04) 30px, rgba(139,109,76,0.04) 31px)',
          borderRadius: '12px 0 0 12px',
          boxShadow: '6px 0 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Shadow gradient on the back side */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '40px',
            height: '100%',
            background: 'linear-gradient(to left, rgba(0,0,0,0.12), transparent)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </motion.div>
  );
}
