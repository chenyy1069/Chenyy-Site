import React, { useRef } from 'react';

interface HoloCardProps {
  children: React.ReactNode;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * A card that tilts toward the pointer and catches a holographic sheen.
 * Pointer math runs on the untransformed wrapper so the tilt can't feed back
 * into its own measurement.
 */
export const HoloCard: React.FC<HoloCardProps> = ({ children }) => {
  const wrapRef = useRef<HTMLDivElement>(null);

  const apply = (px: number, py: number, active: boolean) => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.setProperty('--px', px.toFixed(3));
    el.style.setProperty('--py', py.toFixed(3));
    el.style.setProperty('--rx', `${((0.5 - py) * 10).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((px - 0.5) * 14).toFixed(2)}deg`);
    el.dataset.active = String(active);
  };

  const handleMove = (e: React.PointerEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    apply(clamp01((e.clientX - r.left) / r.width), clamp01((e.clientY - r.top) / r.height), true);
  };

  return (
    <div
      ref={wrapRef}
      className="card-wrap"
      onPointerMove={handleMove}
      onPointerLeave={() => apply(0.5, 0.5, false)}
    >
      <div className="card">
        <div className="card-fx" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
};
