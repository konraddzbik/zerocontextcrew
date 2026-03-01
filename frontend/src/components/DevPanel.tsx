import { useState } from 'react';
import type { Chapter, Story } from '../lib/types';

interface DevPanelProps {
  story: Story | null;
  chapters: Chapter[];
  currentPage: number;
  totalChapters: number | null;
  hasMoreComing: boolean;
}

export default function DevPanel({
  story,
  chapters,
  currentPage,
  totalChapters,
  hasMoreComing,
}: DevPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-[100] w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          fontSize: '1.2rem',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
        aria-label="Toggle debug panel"
      >
        {open ? '✕' : '🛠️'}
      </button>

      {open && (
        <div
          className="fixed bottom-16 right-4 z-[100] w-80 max-h-96 overflow-auto rounded-lg p-4"
          style={{
            background: 'rgba(0,0,0,0.85)',
            color: '#e0e0e0',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            lineHeight: 1.5,
            backdropFilter: 'blur(8px)',
          }}
        >
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--gold)' }}>
            Dev Panel
          </h3>
          <div className="space-y-1">
            <div><strong>Story ID:</strong> {story?.storyId ?? 'streaming...'}</div>
            <div><strong>Page:</strong> {currentPage + 1}</div>
            <div><strong>Chapters loaded:</strong> {chapters.length}</div>
            <div><strong>Total planned:</strong> {totalChapters ?? '?'}</div>
            <div><strong>More coming:</strong> {hasMoreComing ? 'yes' : 'no'}</div>
            <div><strong>Story complete:</strong> {story ? 'yes' : 'no'}</div>
            <hr className="border-white/20 my-2" />
            {chapters.map((ch) => (
              <div key={ch.id} className="mb-1">
                <div style={{ color: 'var(--gold)' }}>Ch {ch.chapterNumber}: {ch.title}</div>
                <div>Text: {ch.text.length} chars</div>
                <div>Illustrations: {ch.illustrations.length}</div>
                <div>Audio: {ch.audioUrl ? 'yes' : 'no'}</div>
                <div>Choice: {ch.choice ? `${ch.choice.options.length} opts` : 'none'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
