import { useState, useEffect, useRef } from 'react';

export function useTypewriter(text: string, speed = 120) {
  const [wordIndex, setWordIndex] = useState(0);
  const words = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Re-split when text changes
  useEffect(() => {
    words.current = text.split(/(\s+)/); // preserve whitespace tokens
    setWordIndex(0);
  }, [text]);

  useEffect(() => {
    if (wordIndex >= words.current.length) return;

    timerRef.current = setInterval(() => {
      setWordIndex((i) => {
        const next = i + 1;
        if (next >= words.current.length) {
          clearInterval(timerRef.current);
        }
        return next;
      });
    }, speed);

    return () => clearInterval(timerRef.current);
  }, [text, speed]); // restart timer when text or speed changes

  const displayed = words.current.slice(0, wordIndex).join('');
  const isDone = wordIndex >= words.current.length;
  const isRunning = !isDone && wordIndex > 0;

  return { displayed, isDone, isRunning };
}
