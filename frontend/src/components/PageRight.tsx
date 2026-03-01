import { useState, useEffect } from 'react';
import LoadingQuill from './LoadingQuill';
import { PageCorners } from './PageOrnaments';

function DecorativePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6" style={{ opacity: 0.25 }}>
      <svg viewBox="0 0 120 120" className="w-24 h-24" aria-hidden="true">
        <circle cx="60" cy="60" r="50" fill="none" stroke="var(--gold-muted)" strokeWidth="1" />
        <circle cx="60" cy="60" r="35" fill="none" stroke="var(--gold-muted)" strokeWidth="0.5" />
        <circle cx="60" cy="60" r="4" fill="var(--gold-muted)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="60" y1="60"
            x2={60 + 45 * Math.cos((angle * Math.PI) / 180)}
            y2={60 + 45 * Math.sin((angle * Math.PI) / 180)}
            stroke="var(--gold-muted)" strokeWidth="0.5"
          />
        ))}
        {[0, 90, 180, 270].map((angle) => (
          <circle
            key={angle}
            cx={60 + 40 * Math.cos((angle * Math.PI) / 180)}
            cy={60 + 40 * Math.sin((angle * Math.PI) / 180)}
            r="2.5" fill="var(--gold-muted)"
          />
        ))}
      </svg>
      <p
        style={{
          fontFamily: "'Crimson Text', serif",
          fontStyle: 'italic',
          color: 'var(--gold-muted)',
          fontSize: '0.85rem',
        }}
        aria-hidden="true"
      >
        &#10087; &#10047; &#10087;
      </p>
    </div>
  );
}

interface PageRightProps {
  imageUrl?: string;
  altText?: string;
  chapterTitle?: string;
  pageNumber: number;
  hasNoIllustration?: boolean;
}

export default function PageRight({ imageUrl, altText, chapterTitle, pageNumber, hasNoIllustration }: PageRightProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Reset state when image URL changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [imageUrl]);

  return (
    <div className="page-right relative flex flex-col items-center justify-center h-full p-6 md:p-8 pb-16">
      <PageCorners />

      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        {imageUrl && imageUrl.length > 0 && !error ? (
          <>
            {!loaded && <LoadingQuill />}
            <div className={`illustration-frame ${loaded ? '' : 'hidden'}`}>
              <span className="illustration-corner-tr" aria-hidden="true" />
              <span className="illustration-corner-bl" aria-hidden="true" />
              <img
                src={imageUrl}
                alt={altText || 'Chapter illustration'}
                className="illustration-enter illustration-on-page"
                onLoad={() => setLoaded(true)}
                onError={() => {
                  console.error('[StoryTime] Image failed to load:', imageUrl);
                  setError(true);
                }}
              />
            </div>
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <span className="text-3xl">🖼️</span>
            <p style={{ fontFamily: "'Crimson Text', serif", fontStyle: 'italic', color: 'var(--ink)', opacity: 0.5, fontSize: '0.9rem' }}>
              Illustration couldn&apos;t be loaded
            </p>
          </div>
        ) : hasNoIllustration ? (
          <DecorativePlaceholder />
        ) : (
          <LoadingQuill />
        )}
      </div>

      {/* Caption below illustration */}
      {chapterTitle && loaded && (
        <div className="illustration-caption">
          <span className="caption-flourish" aria-hidden="true">&#8212;</span>
          <p className="caption-text">{chapterTitle}</p>
          <span className="caption-flourish" aria-hidden="true">&#8212;</span>
        </div>
      )}

      {/* Decorative bottom border */}
      <div className="page-bottom-border">
        <span className="border-symbol" aria-hidden="true">&#10043;</span>
        <span className="border-symbol" aria-hidden="true">&#10022;</span>
        <span className="border-symbol" aria-hidden="true">&#10043;</span>
        <span className="border-symbol" aria-hidden="true">&#10022;</span>
        <span className="border-symbol" aria-hidden="true">&#10043;</span>
      </div>

      {/* Page number */}
      <div
        className="absolute bottom-2 left-0 right-0 text-center"
        style={{
          fontFamily: "'Crimson Text', serif",
          fontStyle: 'italic',
          fontSize: '0.8rem',
          color: 'var(--ink)',
          opacity: 0.4,
        }}
      >
        {pageNumber}
      </div>
    </div>
  );
}
