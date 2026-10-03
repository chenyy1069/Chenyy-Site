import React from 'react';

/*
 * Line-art vocabulary: one simple shape, repeated N times, each copy turned a
 * little. 1–1.5px strokes in currentColor or the accent; never filled shapes,
 * except the orb.
 */

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export function Star({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      {range(8).map((i) => (
        <ellipse key={i} cx="50" cy="27" rx="8" ry="24" transform={`rotate(${i * 45} 50 50)`} />
      ))}
    </svg>
  );
}

// An Archimedean spiral standing in for the 🌀 in the name.
const SPIRAL_PATH = (() => {
  const turns = 2.6;
  const steps = 90;
  const max = turns * Math.PI * 2;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * max;
    const r = 4 + (t / max) * 40;
    pts.push(`${(50 + r * Math.cos(t)).toFixed(2)} ${(50 + r * Math.sin(t)).toFixed(2)}`);
  }
  return `M${pts.join(' L')}`;
})();

export function Spiral({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d={SPIRAL_PATH} stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- FIG. 01: the hero orbit ---------- */

const C = 260;
const RING_A = -16; // degrees
const RING_B = 24;

// The satellite sits just outside ring A: a little out of orbit.
const SAT_THETA = (-38 * Math.PI) / 180;
const satLocal = { x: C + 214 * Math.cos(SAT_THETA), y: C + 66 * Math.sin(SAT_THETA) };
const satGlobal = (() => {
  const a = (RING_A * Math.PI) / 180;
  const dx = satLocal.x - C;
  const dy = satLocal.y - C;
  return { x: C + dx * Math.cos(a) - dy * Math.sin(a), y: C + dx * Math.sin(a) + dy * Math.cos(a) };
})();

function Rings({ rotate, count, clip }: { rotate: number; count: number; clip?: boolean }) {
  return (
    <g transform={`rotate(${rotate} ${C} ${C})`} clipPath={clip ? 'url(#orbit-front)' : undefined}>
      {range(count).map((i) => (
        <ellipse
          key={i}
          cx={C}
          cy={C}
          rx={196 + i * 3}
          ry={52 + i * 1.6}
          transform={`rotate(${i * 0.9} ${C} ${C})`}
        />
      ))}
    </g>
  );
}

export function OrbitFigure() {
  return (
    <svg className="orbit" viewBox="0 0 520 520" fill="none" aria-hidden="true">
      <defs>
        <pattern id="orbit-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="currentColor" />
        </pattern>
        <radialGradient id="orbit-fade">
          <stop offset="0.45" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id="orbit-fade-mask">
          <rect width="520" height="520" fill="url(#orbit-fade)" />
        </mask>
        <radialGradient id="orbit-orb" cx="0.36" cy="0.3" r="0.78">
          <stop offset="0" style={{ stopColor: 'var(--orb-highlight)' }} />
          <stop offset="0.48" style={{ stopColor: 'var(--orb-mid)' }} />
          <stop offset="1" style={{ stopColor: 'var(--orb-shadow)' }} />
        </radialGradient>
        <filter id="orbit-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        {/* the half of each ring that passes in front of the orb */}
        <clipPath id="orbit-front" clipPathUnits="userSpaceOnUse">
          <rect x="0" y={C} width="520" height="260" />
        </clipPath>
      </defs>

      {/* drawing-board construction */}
      <rect className="orbit-grid" width="520" height="520" fill="url(#orbit-dots)" mask="url(#orbit-fade-mask)" />
      <g className="orbit-construct">
        <circle cx={C} cy={C} r="236" strokeDasharray="2 6" />
        <circle cx={C} cy={C} r="150" strokeDasharray="2 6" />
        <path d={`M${C} 8V512M8 ${C}H512`} />
        {range(9).map((i) => (
          <path key={i} d={`M${C - 4} ${48 + i * 53}h8M${48 + i * 53} ${C - 4}v8`} />
        ))}
      </g>

      {/* back halves of the rings */}
      <g className="orbit-ring orbit-ring-a">
        <Rings rotate={RING_A} count={7} />
      </g>
      <g className="orbit-ring orbit-ring-b">
        <Rings rotate={RING_B} count={5} />
      </g>

      {/* the orb */}
      <circle cx={C} cy={C} r="92" fill="url(#orbit-orb)" />
      <circle cx={C} cy={C} r="92" fill="#fff" filter="url(#orbit-grain)" opacity="0.16" />

      {/* front halves */}
      <g className="orbit-ring orbit-ring-a">
        <Rings rotate={RING_A} count={7} clip />
      </g>
      <g className="orbit-ring orbit-ring-b">
        <Rings rotate={RING_B} count={5} clip />
      </g>

      {/* satellite, annotations */}
      <g className="orbit-sat" style={{ transformOrigin: `${satGlobal.x + 14}px ${satGlobal.y + 10}px` }}>
        <circle cx={satGlobal.x} cy={satGlobal.y} r="7" className="orbit-sat-body" />
        <circle cx={satGlobal.x} cy={satGlobal.y} r="13" className="orbit-sat-halo" />
      </g>
      <g className="orbit-notes">
        <path d={`M${satGlobal.x - 10} ${satGlobal.y - 14}L${satGlobal.x - 40} ${satGlobal.y - 44}H${satGlobal.x - 128}`} />
        <text x={satGlobal.x - 128} y={satGlobal.y - 52}>ME, ROUGHLY</text>
        <path d="M88 446L118 416H150" />
        <text x="40" y="466">∞ POSSIBILITIES</text>
        <text x={C + 8} y="22">N</text>
      </g>
    </svg>
  );
}

/* ---------- card artwork ---------- */

export function CardArtwork({ kind }: { kind: 'projects' | 'github' | 'contact' | 'donate' }) {
  if (kind === 'projects') {
    return (
      <div className="art art-projects" aria-hidden="true">
        <Star />
        <span className="art-ring" />
      </div>
    );
  }
  if (kind === 'github') {
    return (
      <svg className="art art-github" viewBox="0 0 180 180" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="1">
          {range(9).map((i) => (
            <rect
              key={i}
              x={26 + i * 4}
              y={26 + i * 4}
              width={128 - i * 8}
              height={128 - i * 8}
              rx="2"
              transform={`rotate(${i * 7} 90 90)`}
            />
          ))}
        </g>
        <path d="m79 80-11 10 11 10m22-20 11 10-11 10m-8-24-6 28" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === 'contact') {
    // a small pile of envelopes, each nudged a few degrees
    return (
      <svg className="art art-small" viewBox="0 0 120 100" fill="none" aria-hidden="true">
        {range(5).map((i) => (
          <g key={i} transform={`rotate(${-14 + i * 7} 60 54)`} stroke="currentColor" strokeWidth="1">
            <rect x="22" y="30" width="76" height="48" rx="2" fill="var(--card-surface)" />
            <path d="M22 31l38 27 38-27" />
          </g>
        ))}
      </svg>
    );
  }
  // donate: a stack of coins
  return (
    <svg className="art art-small" viewBox="0 0 120 100" fill="none" aria-hidden="true">
      {range(7).map((i) => (
        <g key={i} stroke="currentColor" strokeWidth="1">
          <path d={`M30 ${78 - i * 8}v6c0 6 13.4 11 30 11s30-5 30-11v-6`} fill="var(--card-surface)" />
          <ellipse cx={60 + (i % 2 ? 1.5 : -1.5)} cy={78 - i * 8} rx="30" ry="11" fill="var(--card-surface)" />
        </g>
      ))}
    </svg>
  );
}
