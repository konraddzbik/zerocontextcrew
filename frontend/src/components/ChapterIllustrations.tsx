import type { Illustration } from '../lib/types';

interface ChapterIllustrationsProps {
  illustrations: Illustration[];
}

export default function ChapterIllustrations({ illustrations }: ChapterIllustrationsProps) {
  if (!illustrations.length) return null;

  return (
    <div className="space-y-4">
      {illustrations.map((ill) => (
        <div key={ill.id}>
          <img
            src={ill.imageUrl}
            alt={ill.altText}
            className={`rounded-xl shadow-sm ${
              ill.position === 'full-width'
                ? 'w-full'
                : 'w-48 sm:w-56 inline-block mr-4'
            }`}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
