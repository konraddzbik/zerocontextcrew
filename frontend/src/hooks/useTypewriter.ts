import { useState, useEffect, useRef, useMemo } from 'react';

export function useTypewriter(text: string, speed = 120) {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState(text);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Sync state with props — reset wordIndex atomically when text changes.
  // This prevents the stale-index bug where isDone is immediately true
  // because the old wordIndex exceeds the new (shorter) token array length.
  if (text !== currentText) {
    setCurrentText(text);
    setWordIndex(0);
  }

  const tokens = useMemo(() => currentText.split(/(\s+)/), [currentText]);

  useEffect(() => {
    if (wordIndex >= tokens.length) return;

    timerRef.current = setInterval(() => {
      setWordIndex((i) => {
        const next = i + 1;
        if (next >= tokens.length) {
          clearInterval(timerRef.current);
        }
        return next;
      });
    }, speed);

    return () => clearInterval(timerRef.current);
  }, [currentText, speed, tokens.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayed = tokens.slice(0, wordIndex).join('');
  const isDone = tokens.length > 0 && wordIndex >= tokens.length;
  const isRunning = !isDone && wordIndex > 0;

  return { displayed, isDone, isRunning };
}
