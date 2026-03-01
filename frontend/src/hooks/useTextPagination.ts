import { useState, useEffect, type RefObject } from 'react';

/**
 * Splits text into pages that fit within a measured container height,
 * using DOM measurement for accuracy.
 *
 * Accepts either a numeric maxHeight or a ref to the container element
 * for dynamic measurement.
 *
 * First page gets less space (title + vignette + dropcap overhead).
 * Returns an array of text strings, one per page.
 */
export function useTextPagination(
  fullText: string,
  maxHeightOrRef: number | RefObject<HTMLDivElement | null>,
  firstPageOverhead = 90,
): string[] {
  const [pages, setPages] = useState<string[]>([fullText]);

  // Resolve height from ref or number
  const isRef = typeof maxHeightOrRef !== 'number';

  useEffect(() => {
    if (!fullText) {
      setPages([fullText || '']);
      return;
    }

    let maxHeight: number;
    let measuredWidth: number;

    if (isRef) {
      const el = (maxHeightOrRef as RefObject<HTMLDivElement | null>).current;
      if (!el) {
        setPages([fullText]);
        return;
      }
      maxHeight = el.clientHeight;
      measuredWidth = el.clientWidth;
    } else {
      maxHeight = maxHeightOrRef as number;
      measuredWidth = 430;
    }

    if (maxHeight <= 0) {
      setPages([fullText]);
      return;
    }

    // Safety margin to prevent text clipping at the bottom
    const safetyMargin = 20;
    maxHeight = maxHeight - safetyMargin;

    // Create an invisible measurer matching the story text area
    const measurer = document.createElement('div');
    measurer.style.cssText = `
      position: absolute; visibility: hidden; pointer-events: none;
      width: ${measuredWidth}px;
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
  }, [fullText, maxHeightOrRef, firstPageOverhead, isRef]);

  return pages;
}
