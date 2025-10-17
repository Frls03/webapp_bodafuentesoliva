import React from 'react';

/**
 * ArcText
 * Simple SVG text-on-path helper to render curved text.
 * Props:
 *  - text: string
 *  - radius: number (px)
 *  - startAngle, endAngle: degrees
 *  - reverse: boolean (flip sweep)
 *  - className: optional CSS class
 *  - id: optional id for the path
 *  - letterSpacing: em units
 */
export default function ArcText({
  text,
  radius = 220,
  startAngle = -120,
  endAngle = -60,
  reverse = false,
  className = '',
  id,
  letterSpacing = 0
}) {
  const vb = radius * 2 + 40;
  const half = vb / 2;
  const pathId = id || `arc-${Math.random().toString(36).slice(2)}`;

  const a1 = (Math.PI / 180) * startAngle;
  const a2 = (Math.PI / 180) * endAngle;

  const x1 = half + radius * Math.cos(a1);
  const y1 = half + radius * Math.sin(a1);
  const x2 = half + radius * Math.cos(a2);
  const y2 = half + radius * Math.sin(a2);

  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  const sweep = reverse ? 0 : 1;

  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }} aria-label={text}>
      <defs>
        <path id={pathId} d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${x2} ${y2}`} />
      </defs>

      <text className={className} style={{ letterSpacing: `${letterSpacing}em`, fontSize: '1.25rem' }} textAnchor="middle" dominantBaseline="middle" fill="currentColor">
        <textPath href={`#${pathId}`} xlinkHref={`#${pathId}`} startOffset="50%">
          {text}
        </textPath>
      </text>
    </svg>
  );
}
