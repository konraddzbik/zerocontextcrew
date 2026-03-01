import { useState, useEffect, useRef, useMemo } from 'react';

export function useTypewriter(text: string, speed = 120) {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState(text);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Synchronous state reset when text changes — avoids a flash of stale text
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
        if (i >= tokens.length - 1) {
          clearInterval(timerRef.current);
          return tokens.length;
        }
        return i + 1;
      });
    }, speed);

    return () => clearInterval(timerRef.current);
  }, [currentText, speed, tokens.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayed = tokens.slice(0, wordIndex).join('');
  const isDone = tokens.length > 0 && wordIndex >= tokens.length;
  const isRunning = !isDone && wordIndex > 0;

  return { displayed, isDone, isRunning };
}
