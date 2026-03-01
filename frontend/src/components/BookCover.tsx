import { motion } from 'framer-motion';

/* ── Heraldic SVG emblems — gold stroke on leather ── */

function FoxEmblem() {
  // Heraldic sitting fox in profile — simplified silhouette, no face detail
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" fill="var(--gold)" stroke="none" opacity="0.7">
      {/* Body + tail — single elegant silhouette */}
      <path d="
        M16 38
        Q14 32 15 26
        Q16 22 20 20
        L22 14
        Q23 12 24 14
        L24 18
        L26 14
        Q27 12 28 14
        L26 20
        Q30 22 32 26
        Q34 30 33 36
        Q36 32 40 28
        Q42 24 42 30
        Q42 36 36 40
        Q30 42 24 40
        Q18 42 16 38
        Z
      " />
    </svg>
  );
}

function OwlEmblem() {
  // Heraldic owl — round, simple, sitting posture
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" fill="var(--gold)" stroke="none" opacity="0.7">
      {/* Body silhouette */}
      <path d="
        M14 40
        Q12 32 14 24
        Q15 18 18 16
        L16 10 Q17 8 19 12
        L20 14
        Q22 12 24 12
        Q26 12 28 14
        L29 12 Q31 8 32 10
        L30 16
        Q33 18 34 24
        Q36 32 34 40
        Q30 44 24 44
        Q18 44 14 40
        Z
      " />
      {/* Eye cutouts — negative space on the filled shape */}
      <circle cx="19" cy="24" r="3.5" fill="var(--leather)" />
      <circle cx="29" cy="24" r="3.5" fill="var(--leather)" />
      {/* Pupils */}
      <circle cx="19" cy="24" r="1.5" fill="var(--gold)" />
      <circle cx="29" cy="24" r="1.5" fill="var(--gold)" />
      {/* Beak — small triangle cutout */}
      <path d="M22 28 L24 31 L26 28 Z" fill="var(--leather)" />
    </svg>
  );
}

function TurtleEmblem() {
  // Heraldic turtle — filled silhouette with shell pattern cutout
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" fill="var(--gold)" stroke="none" opacity="0.7">
      {/* Shell dome */}
      <path d="
        M10 30
        Q10 16 24 14
        Q38 16 38 30
        Q38 34 24 34
        Q10 34 10 30
        Z
      " />
      {/* Head */}
      <ellipse cx="40" cy="28" rx="4" ry="3" />
      {/* Tail */}
      <path d="M8 30 Q4 30 5 33 Q6 32 10 31 Z" />
      {/* Front legs */}
      <ellipse cx="34" cy="34" rx="3.5" ry="2.5" />
      <ellipse cx="14" cy="34" rx="3.5" ry="2.5" />
      {/* Shell pattern — leather cutouts */}
      <path d="M18 19 L24 17 L30 19 L30 27 L24 29 L18 27 Z" fill="var(--leather)" />
      <path d="M20 20 L24 18.5 L28 20 L28 26 L24 27.5 L20 26 Z" fill="var(--gold)" opacity="0.5" />
    </svg>
  );
}

function ButterflyEmblem() {
  // Heraldic butterfly — filled silhouette with wing spot cutouts
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" fill="var(--gold)" stroke="none" opacity="0.7">
      {/* Upper wings */}
      <path d="M24 22 Q14 6 6 14 Q3 22 18 26 Z" />
      <path d="M24 22 Q34 6 42 14 Q45 22 30 26 Z" />
      {/* Lower wings */}
      <path d="M24 26 Q12 28 9 38 Q14 42 22 32 Z" />
      <path d="M24 26 Q36 28 39 38 Q34 42 26 32 Z" />
      {/* Wing spot cutouts — negative space */}
      <circle cx="14" cy="17" r="2.5" fill="var(--leather)" />
      <circle cx="34" cy="17" r="2.5" fill="var(--leather)" />
      <circle cx="14" cy="34" r="1.8" fill="var(--leather)" />
      <circle cx="34" cy="34" r="1.8" fill="var(--leather)" />
      {/* Body */}
      <rect x="22.5" y="16" width="3" height="20" rx="1.5" fill="var(--leather)" />
      <rect x="23" y="16.5" width="2" height="19" rx="1" fill="var(--gold)" />
      {/* Antennae */}
      <path d="M24 17 Q20 10 17 7" stroke="var(--gold)" strokeWidth="1.2" fill="none" />
      <path d="M24 17 Q28 10 31 7" stroke="var(--gold)" strokeWidth="1.2" fill="none" />
      <circle cx="17" cy="7" r="1.2" />
      <circle cx="31" cy="7" r="1.2" />
    </svg>
  );
}

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

        {/* Heraldic emblems — gold SVG silhouettes */}
        <div className="cover-emblems" aria-hidden="true">
          <div className="cover-emblem"><FoxEmblem /></div>
          <div className="cover-emblem"><OwlEmblem /></div>
          <div className="cover-emblem"><TurtleEmblem /></div>
          <div className="cover-emblem"><ButterflyEmblem /></div>
        </div>

        {/* Open button or loading state — stays mounted to preserve layout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isOpening ? 0 : 1, y: 0 }}
          transition={isOpening ? { duration: 0.3 } : { delay: 0.5 }}
          style={{ pointerEvents: isOpening ? 'none' : 'auto' }}
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

        {/* Publisher imprint — like a real book's bottom-of-cover mark */}
        <div
          className="cover-publisher-imprint"
          aria-hidden="true"
        >
          <svg width="40" height="6" viewBox="0 0 40 6" style={{ opacity: 0.35 }}>
            <line x1="0" y1="3" x2="14" y2="3" stroke="var(--gold-muted)" strokeWidth="0.8" />
            <circle cx="20" cy="3" r="1.5" fill="var(--gold-muted)" />
            <line x1="26" y1="3" x2="40" y2="3" stroke="var(--gold-muted)" strokeWidth="0.8" />
          </svg>
          <span className="cover-publisher-name">
            TaleWorld
          </span>
        </div>
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
