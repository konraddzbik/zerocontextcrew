import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl?: string;
  chapterTitle: string;
}

export default function AudioPlayer({ audioUrl, chapterTitle }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMocked = !audioUrl || audioUrl.includes('mock') || audioUrl.includes('example.com');

  function toggle() {
    if (isMocked || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  if (isMocked) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sky/60 border border-leaf/20"
        role="region"
        aria-label={`Audio narration for ${chapterTitle} — coming soon`}
      >
        <span className="text-xl opacity-50" aria-hidden="true">🔇</span>
        <span className="font-body text-sm text-bark/50">
          Narration coming soon
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sky border border-leaf/20"
      role="region"
      aria-label={`Audio narration for ${chapterTitle}`}
    >
      {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />}
      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-leaf text-white text-lg hover:bg-forest transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sun focus:ring-offset-2"
        aria-label={isPlaying ? `Pause narration for ${chapterTitle}` : `Play narration for ${chapterTitle}`}
      >
        {isPlaying ? '⏸' : '▶️'}
      </motion.button>
      <span className="font-body text-sm text-forest">
        {isPlaying ? 'Playing narration...' : 'Listen to this chapter'}
      </span>
    </div>
  );
}
