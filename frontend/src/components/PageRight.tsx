import { useState } from 'react';
import LoadingQuill from './LoadingQuill';

interface PageRightProps {
  imageUrl?: string;
  altText?: string;
  pageNumber: number;
}

export default function PageRight({ imageUrl, altText, pageNumber }: PageRightProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="page-right relative flex flex-col items-center justify-center h-full p-6 md:p-8 pb-16">
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        {imageUrl && imageUrl.length > 0 && !error ? (
          <>
            {!loaded && <LoadingQuill />}
            <img
              src={imageUrl}
              alt={altText || 'Chapter illustration'}
              className={loaded ? 'illustration-enter illustration-on-page' : 'opacity-0 absolute'}
              onLoad={() => setLoaded(true)}
              onError={() => {
                console.error('[StoryTime] Image failed to load:', imageUrl);
                setError(true);
              }}
            />
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <span className="text-3xl">🖼️</span>
            <p style={{ fontFamily: "'Crimson Text', serif", fontStyle: 'italic', color: 'var(--ink)', opacity: 0.5, fontSize: '0.9rem' }}>
              Illustration couldn&apos;t be loaded
            </p>
          </div>
        ) : (
          <LoadingQuill />
        )}
      </div>

      {/* Scene description */}
      {altText && loaded && (
        <p
          className="mt-2 text-center"
          style={{
            fontFamily: "'Crimson Text', serif",
            fontStyle: 'italic',
            fontSize: '0.8rem',
            color: 'var(--ink)',
            opacity: 0.45,
          }}
        >
          {altText}
        </p>
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
