import React from 'react';

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
