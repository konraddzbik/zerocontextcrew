import { type RefObject } from 'react';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl?: string;
  chapterTitle: string;
  /** External <audio> element managed by Book so it survives page turns */
  audioRef: RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  onToggle: () => void;
  /**
   * Compact mode — used on non-first pages where vertical space is tight.
   * Renders a small inline row instead of the full-width bar.
   */
  compact?: boolean;
}

export default function AudioPlayer({
  audioUrl,
  chapterTitle,
  audioRef: _audioRef,
  isPlaying,
  onToggle,
  compact = false,
}: AudioPlayerProps) {
  const isReady = !!audioUrl && !audioUrl.includes('mock') && !audioUrl.includes('example.com');

  // ── Placeholder — audio not yet available ────────────────────────────────
  if (!isReady) {
    if (compact) {
      return (
        <div
          className="narration-btn narration-btn--compact narration-btn--muted"
          aria-label={`Audio narration for ${chapterTitle} — coming soon`}
        >
          <span className="narration-btn__icon" aria-hidden="true">&#9835;</span>
          <span className="narration-btn__label">Narration coming soon…</span>
        </div>
      );
    }
    return (
      <motion.div
        className="narration-btn narration-btn--muted"
        role="region"
        aria-label={`Audio narration for ${chapterTitle} — coming soon`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="narration-btn__icon" aria-hidden="true">&#9835;</span>
        <span className="narration-btn__label">Narration coming soon…</span>
      </motion.div>
    );
  }

  // ── Compact variant — inner pages ─────────────────────────────────────────
  if (compact) {
    return (
      <div
        className="narration-btn narration-btn--compact"
        role="region"
        aria-label={`Audio narration for ${chapterTitle}`}
      >
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="narration-btn__play narration-btn__play--sm"
          aria-label={isPlaying ? `Pause narration` : `Play narration`}
        >
          {isPlaying ? '⏸' : '▶'}
        </motion.button>
        <span className="narration-btn__label">
          {isPlaying ? 'Playing…' : 'Narration'}
        </span>
      </div>
    );
  }

  // ── Full variant — first page ─────────────────────────────────────────────
  return (
    <div
      className="narration-btn"
      role="region"
      aria-label={`Audio narration for ${chapterTitle}`}
    >
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="narration-btn__play"
        aria-label={isPlaying ? `Pause narration for ${chapterTitle}` : `Play narration for ${chapterTitle}`}
      >
        {isPlaying ? '⏸' : '▶'}
      </motion.button>
      <span className="narration-btn__label">
        {isPlaying ? 'Playing narration…' : 'Listen to this chapter'}
      </span>
    </div>
  );
}
