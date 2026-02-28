import { useState, useRef } from 'react';

interface AudioPlayerProps {
  audioUrl?: string;
  chapterTitle: string;
}

export default function AudioPlayer({ audioUrl, chapterTitle }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMocked = !audioUrl || audioUrl.includes('mock') || audioUrl.includes('example.com');

  function toggle() {
    if (isMocked) return;
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  if (isMocked) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sky/60 border border-leaf/20">
        <span className="text-xl opacity-50">🔇</span>
        <span className="font-body text-sm text-bark/50">
          Narration coming soon
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sky border border-leaf/20">
      {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />}
      <button
        onClick={toggle}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-leaf text-white text-lg hover:bg-forest transition-colors cursor-pointer"
        aria-label={isPlaying ? `Pause narration for ${chapterTitle}` : `Play narration for ${chapterTitle}`}
      >
        {isPlaying ? '⏸' : '▶️'}
      </button>
      <span className="font-body text-sm text-forest">
        {isPlaying ? 'Playing narration...' : 'Listen to this chapter'}
      </span>
    </div>
  );
}
