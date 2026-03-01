import { motion } from 'framer-motion';

interface BookCoverProps {
  title: string;
  onOpen: () => void;
  isOpening: boolean;
  isReady: boolean;
  onOpenComplete?: () => void;
}

export default function BookCover({ title, onOpen, isOpening, isReady, onOpenComplete }: BookCoverProps) {
  return (
    <motion.div
      className="book-cover cursor-pointer select-none"
      style={{
        width: 'min(90vw, 500px)',
        height: 'min(70vh, 650px)',
        background: 'linear-gradient(135deg, var(--leather), var(--leather-dark))',
        borderRadius: '4px 12px 12px 4px',
        boxShadow:
          '0 10px 40px rgba(26,58,42,0.2), 0 4px 16px rgba(0,0,0,0.12), inset 0 0 0 12px rgba(139,105,20,0.15), inset 0 0 0 14px rgba(139,105,20,0.3)',
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
      animate={
        isOpening
          ? { rotateY: -180 }
          : { rotateY: 0 }
      }
      transition={
        isOpening
          ? { duration: 1.8, ease: [0.645, 0.045, 0.355, 1] }
          : undefined
      }
      onAnimationComplete={() => {
        if (isOpening && onOpenComplete) onOpenComplete();
      }}
      onClick={!isOpening && isReady ? onOpen : undefined}
    >
      {/* Embossed frames */}
      <div className="cover-emboss" />
      <div className="cover-emboss-inner" />

      {/* Leather texture + content */}
      <div className="book-cover-inner">
        {/* Decorative top ornament */}
        <div
          style={{ color: 'var(--gold)', fontSize: '2rem', opacity: 0.6 }}
          aria-hidden="true"
        >
          &#10087; &#10047; &#10087;
        </div>

        {/* Title */}
        <h1
          className="text-center px-8"
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: 'clamp(1.2rem, 3vw, 2rem)',
            color: 'var(--gold)',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h1>

        {/* Heraldic emblems — 4 panels like Shrek cover */}
        <div className="cover-emblems">
          <div className="cover-emblem">🦊</div>
          <div className="cover-emblem">🦉</div>
          <div className="cover-emblem">🐢</div>
          <div className="cover-emblem">🦋</div>
        </div>

        {/* Open button or loading state */}
        {!isOpening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {isReady ? (
              <motion.button
                onClick={(e) => { e.stopPropagation(); onOpen(); }}
                className="cursor-pointer"
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--gold)',
                  background: 'rgba(139,105,20,0.15)',
                  border: '1.5px solid var(--gold-muted)',
                  borderRadius: '8px',
                  padding: '10px 28px',
                  letterSpacing: '0.06em',
                }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(139,105,20,0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                Open the Book
              </motion.button>
            ) : (
              <span
                style={{
                  fontFamily: "'Crimson Text', serif",
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  color: 'var(--gold)',
                  opacity: 0.6,
                }}
              >
                Crafting your tale...
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* Spine edge */}
      <div
        className="absolute left-0 top-0 h-full w-3"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)',
          borderRadius: '4px 0 0 4px',
        }}
      />
    </motion.div>
  );
}
