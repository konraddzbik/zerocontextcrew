export function TopVignette() {
  return (
    <svg
      viewBox="0 0 200 20"
      className="w-32 mx-auto mb-3"
      style={{ opacity: 0.35 }}
      aria-hidden="true"
    >
      <path
        d="M10 15 Q50 0 100 10 Q150 0 190 15"
        fill="none"
        stroke="var(--gold-muted)"
        strokeWidth="1.5"
      />
      <circle cx="100" cy="10" r="2.5" fill="var(--gold-muted)" />
    </svg>
  );
}

export function FrameCorners() {
  const style = (pos: 'tl' | 'tr' | 'bl' | 'br'): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      fontSize: '1.4rem',
      color: 'var(--gold-muted)',
      opacity: 0.45,
      lineHeight: 1,
    };
    switch (pos) {
      case 'tl': return { ...base, top: 8, left: 8, transform: 'rotate(0deg)' };
      case 'tr': return { ...base, top: 8, right: 8, transform: 'rotate(90deg)' };
      case 'bl': return { ...base, bottom: 8, left: 8, transform: 'rotate(-90deg)' };
      case 'br': return { ...base, bottom: 8, right: 8, transform: 'rotate(180deg)' };
    }
  };

  return (
    <>
      <span style={style('tl')} aria-hidden="true">&#10087;</span>
      <span style={style('tr')} aria-hidden="true">&#10087;</span>
      <span style={style('bl')} aria-hidden="true">&#10087;</span>
      <span style={style('br')} aria-hidden="true">&#10087;</span>
    </>
  );
}
