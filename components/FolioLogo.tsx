'use client';

interface FolioMarkProps {
  size?: number;
  className?: string;
}

/**
 * Folio logo mark — a folded-corner document with an F letterform.
 * Uses currentColor so it inherits text colour in both light and dark mode.
 */
export function FolioMark({ size = 30, className = '' }: FolioMarkProps) {
  const w = Math.round(size * 0.8);
  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 24 30"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Document body with folded top-right corner */}
      <path
        d="M2 2H16L22 8V28H2V2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Corner fold crease */}
      <path
        d="M16 2L16 8H22"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* F — vertical stroke */}
      <line
        x1="7" y1="13" x2="7" y2="23"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* F — top bar */}
      <line
        x1="7" y1="13" x2="15" y2="13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* F — middle bar (shorter) */}
      <line
        x1="7" y1="18" x2="13" y2="18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
