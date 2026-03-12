'use client';

import { useId } from 'react';

interface FolioMarkProps {
  size?: number;
  className?: string;
}

/**
 * Folio mark — the letter F built from parallel stripes.
 * Vertical lines form the left stem; horizontal lines form each arm.
 * size = rendered height; width is derived from the 3:4 aspect ratio.
 * Uses currentColor for light/dark mode compatibility.
 */
export function FolioMark({ size = 26, className = '' }: FolioMarkProps) {
  const uid = useId();
  const vId = `${uid}v`;
  const hId = `${uid}h`;
  const w = Math.round(size * 0.75); // 30:40 viewBox aspect ratio

  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 30 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Vertical stripes — left stem */}
        <pattern id={vId} x="0" y="0" width="2.2" height="1" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1.0" height="1" fill="currentColor" />
        </pattern>
        {/* Horizontal stripes — arms */}
        <pattern id={hId} x="0" y="0" width="1" height="2.2" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="1" height="1.0" fill="currentColor" />
        </pattern>
      </defs>

      {/* Left stem: full height */}
      <rect x="2" y="2" width="7" height="36" fill={`url(#${vId})`} />

      {/* Top arm (overlaps stem → crosshatch at junction) */}
      <rect x="2" y="2" width="26" height="7" fill={`url(#${hId})`} />

      {/* Middle arm: ~65% width, centred at ~50% of height */}
      <rect x="2" y="16" width="18" height="7" fill={`url(#${hId})`} />
    </svg>
  );
}
