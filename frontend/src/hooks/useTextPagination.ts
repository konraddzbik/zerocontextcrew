import { useState, useEffect } from 'react';

/**
 * Splits text into pages that fit within `maxHeight` pixels,
 * using DOM measurement for accuracy.
 *
 * First page gets less space (title + vignette overhead).
 * Returns an array of text strings, one per page.
 */
export function useTextPagination(
  fullText: string,
  maxHeight: number,
  firstPageOverhead = 90,
): string[] {
  const [pages, setPages] = useState<string[]>([fullText]);

  useEffect(() => {
    if (!fullText || maxHeight <= 0) {
      setPages([fullText || '']);
      return;
    }

    // Create an invisible measurer matching the story text area
    const measurer = document.createElement('div');
    measurer.style.cssText = `
      position: absolute; visibility: hidden; pointer-events: none;
      width: 430px;
      font-family: 'Crimson Text', serif;
      font-size: 1.15rem;
      line-height: 1.85;
      text-align: justify;
      white-space: pre-line;
      padding: 0;
    `;
    document.body.appendChild(measurer);

    const words = fullText.split(' ');
    const result: string[] = [];
    let current = '';
    // First page: less room because of chapter title + vignette + dropcap
    let pageMax = maxHeight - firstPageOverhead;

    for (let i = 0; i < words.length; i++) {
      const test = current + (current ? ' ' : '') + words[i];
      measurer.textContent = test;

      if (measurer.scrollHeight > pageMax) {
        // Page full — save it and start a new one
        if (current) result.push(current);
        current = words[i];
        pageMax = maxHeight; // subsequent pages get full height
      } else {
        current = test;
      }
    }

    if (current.trim()) result.push(current.trim());

    document.body.removeChild(measurer);

    // Filter out any empty/whitespace-only pages
    const cleaned = result.filter((p) => p.trim().length > 0);
    setPages(cleaned.length > 0 ? cleaned : [fullText]);
  }, [fullText, maxHeight, firstPageOverhead]);

  return pages;
}
