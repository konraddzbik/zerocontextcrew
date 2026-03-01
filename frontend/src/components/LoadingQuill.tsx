interface LoadingQuillProps {
  text?: string;
}

export default function LoadingQuill({ text = 'The illustrator is painting...' }: LoadingQuillProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <span className="quill-spinner text-5xl select-none" aria-hidden="true">
        🪶
      </span>
      <p
        style={{
          fontFamily: "'Crimson Text', serif",
          fontStyle: 'italic',
          color: 'var(--ink)',
          opacity: 0.5,
          fontSize: '1rem',
        }}
      >
        {text}
      </p>
    </div>
  );
}
