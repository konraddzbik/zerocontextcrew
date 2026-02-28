interface PlaceholderImageProps {
  altText: string;
  fullWidth?: boolean;
}

export default function PlaceholderImage({ altText, fullWidth }: PlaceholderImageProps) {
  return (
    <div
      className={`rounded-xl bg-sky/60 border-2 border-dashed border-leaf/20 flex flex-col items-center justify-center gap-2 ${
        fullWidth ? 'w-full h-52' : 'w-48 h-48'
      }`}
      role="img"
      aria-label={altText}
    >
      <span className="text-3xl opacity-40">🎨</span>
      <span className="font-body text-xs text-bark/40 text-center px-4 leading-tight">
        {altText}
      </span>
    </div>
  );
}
