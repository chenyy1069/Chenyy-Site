import React, { useEffect, useRef, useState } from 'react';

/*
 * FIG. 01 — the orb, its drifting rings, and whatever you throw at it.
 * Press, drag and release (or tap) to launch a satellite; it follows real
 * two-body gravity, integrated with symplectic Euler in small substeps.
 * Its fate is known at launch from energy and angular momentum.
 */

const C = 260;
const R = 92; // orb radius
const RING_A = -16;
const RING_B = 24;
const MU = 3.2e6; // GM, px³/s²
const GAIN = 1.8; // drag px → px/s
const SUBSTEPS = 8;
const TRAIL = 900;
const GHOSTS = 3;

type Vec = { x: number; y: number };
type Outcome = 'fall' | 'escape' | 'orbit';
interface Reading {
  e: number;
  outcome: Outcome;
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const classify = (p: Vec, v: Vec): Reading => {
  const rx = p.x - C;
  const ry = p.y - C;
  const r = Math.hypot(rx, ry);
  const h = rx * v.y - ry * v.x;
  const energy = (v.x * v.x + v.y * v.y) / 2 - MU / r;
  const e = Math.sqrt(Math.max(0, 1 + (2 * energy * h * h) / (MU * MU)));
  const periapsis = (h * h) / MU / (1 + e);
  if (e >= 1 && rx * v.x + ry * v.y > 0) return { e, outcome: 'escape' };
  if (periapsis <= R) return { e, outcome: 'fall' };
  return { e, outcome: e < 1 ? 'orbit' : 'escape' };
};

// Circular-orbit velocity at p, counter-clockwise on screen.
const circular = (p: Vec): Vec => {
  const rx = p.x - C;
  const ry = p.y - C;
  const r = Math.hypot(rx, ry);
  const s = Math.sqrt(MU / r) / r;
  return { x: ry * s, y: -rx * s };
};

const toPoints = (pts: Vec[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

function Rings({ rotate, count, clip }: { rotate: number; count: number; clip?: boolean }) {
  return (
    <g transform={`rotate(${rotate} ${C} ${C})`} clipPath={clip ? 'url(#orbit-front)' : undefined}>
      {range(count).map((i) => (
        <ellipse key={i} cx={C} cy={C} rx={196 + i * 3} ry={52 + i * 1.6} transform={`rotate(${i * 0.9} ${C} ${C})`} />
      ))}
    </g>
  );
}

export function Orbit() {
  const svgRef = useRef<SVGSVGElement>(null);
  const trailRef = useRef<SVGPolylineElement>(null);
  const satRef = useRef<SVGCircleElement>(null);
  const body = useRef<{ p: Vec; v: Vec; trail: Vec[]; alive: boolean } | null>(null);
  const raf = useRef(0);
  const last = useRef(0);

  const [ghosts, setGhosts] = useState<string[]>([]);
  const [aim, setAim] = useState<{ from: Vec; to: Vec } | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);

  const step = (now: number) => {
    const b = body.current;
    if (!b || !b.alive) return;
    const dt = Math.min(0.033, (now - last.current) / 1000) / SUBSTEPS;
    last.current = now;
    for (let i = 0; i < SUBSTEPS; i++) {
      const rx = b.p.x - C;
      const ry = b.p.y - C;
      const r = Math.hypot(rx, ry);
      if (r <= R || r > 2600) {
        b.alive = false;
        break;
      }
      const k = -MU / (r * r * r);
      b.v.x += rx * k * dt;
      b.v.y += ry * k * dt;
      b.p.x += b.v.x * dt;
      b.p.y += b.v.y * dt;
    }
    b.trail.push({ x: b.p.x, y: b.p.y });
    if (b.trail.length > TRAIL) b.trail.shift();
    trailRef.current?.setAttribute('points', toPoints(b.trail));
    const sat = satRef.current;
    if (sat) {
      sat.setAttribute('cx', b.p.x.toFixed(1));
      sat.setAttribute('cy', b.p.y.toFixed(1));
      sat.setAttribute('opacity', b.alive ? '1' : '0');
    }
    if (b.alive) raf.current = requestAnimationFrame(step);
  };

  const launch = (p: Vec, v: Vec) => {
    cancelAnimationFrame(raf.current);
    const prev = body.current;
    if (prev && prev.trail.length > 1) {
      const pts = toPoints(prev.trail);
      setGhosts((g) => [pts, ...g].slice(0, GHOSTS));
    }
    body.current = { p: { ...p }, v: { ...v }, trail: [{ ...p }], alive: true };
    trailRef.current?.setAttribute('points', '');
    setReading(classify(p, v));
    last.current = performance.now();
    raf.current = requestAnimationFrame(step);
  };

  // One satellite already in flight, unless motion is reduced.
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const p = { x: C + 34, y: C - 206 };
      const c = circular(p);
      launch(p, { x: c.x * 0.86, y: c.y * 0.86 });
    }
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const toSvg = (e: React.PointerEvent): Vec | null => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  };

  // A tap rather than a drag throws at exactly circular speed.
  const velocityOf = (a: { from: Vec; to: Vec }): Vec => {
    const dx = a.to.x - a.from.x;
    const dy = a.to.y - a.from.y;
    return Math.hypot(dx, dy) < 6 ? circular(a.from) : { x: dx * GAIN, y: dy * GAIN };
  };

  const handleDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = toSvg(e);
    if (!p || Math.hypot(p.x - C, p.y - C) < R + 6) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setAim({ from: p, to: p });
  };

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!aim) return;
    const p = toSvg(e);
    if (p) setAim({ from: aim.from, to: p });
  };

  const handleUp = () => {
    if (!aim) return;
    launch(aim.from, velocityOf(aim));
    setAim(null);
  };

  const shown = aim ? classify(aim.from, velocityOf(aim)) : reading;

  let head = '';
  if (aim) {
    const dx = aim.to.x - aim.from.x;
    const dy = aim.to.y - aim.from.y;
    const len = Math.hypot(dx, dy);
    if (len > 12) {
      const ux = dx / len;
      const uy = dy / len;
      const bx = aim.to.x - ux * 10;
      const by = aim.to.y - uy * 10;
      head = `M${aim.to.x} ${aim.to.y}L${bx - uy * 4.5} ${by + ux * 4.5}L${bx + uy * 4.5} ${by - ux * 4.5}Z`;
    }
  }

  return (
    <figure className="orbit-figure">
      <svg
        ref={svgRef}
        className={`orbit ${aim ? 'is-aiming' : ''}`}
        viewBox="0 0 520 520"
        fill="none"
        role="img"
        aria-label="可交互的轨道图：按住拖动抛出卫星 / Interactive orbit: press and drag to throw a satellite"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={() => setAim(null)}
      >
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

        {/* hit area, so empty space still takes the pointer */}
        <rect width="520" height="520" fill="transparent" />

        <rect className="orbit-grid" width="520" height="520" fill="url(#orbit-dots)" mask="url(#orbit-fade-mask)" />
        <g className="orbit-construct">
          <circle cx={C} cy={C} r="236" strokeDasharray="2 6" />
          <circle cx={C} cy={C} r="150" strokeDasharray="2 6" />
          <path d={`M${C} 8V512M8 ${C}H512`} />
          {range(9).map((i) => (
            <path key={i} d={`M${C - 4} ${48 + i * 53}h8M${48 + i * 53} ${C - 4}v8`} />
          ))}
        </g>

        <g className="orbit-ring orbit-ring-a">
          <Rings rotate={RING_A} count={7} />
        </g>
        <g className="orbit-ring orbit-ring-b">
          <Rings rotate={RING_B} count={5} />
        </g>

        {ghosts.map((pts, i) => (
          <polyline key={`${i}-${pts.length}`} className="orbit-ghost" points={pts} style={{ opacity: 0.5 - i * 0.14 }} />
        ))}
        <polyline ref={trailRef} className="orbit-trail" />

        <circle cx={C} cy={C} r={R} fill="url(#orbit-orb)" />
        <circle cx={C} cy={C} r={R} fill="#fff" filter="url(#orbit-grain)" opacity="0.16" />

        <g className="orbit-ring orbit-ring-a">
          <Rings rotate={RING_A} count={7} clip />
        </g>
        <g className="orbit-ring orbit-ring-b">
          <Rings rotate={RING_B} count={5} clip />
        </g>

        <circle ref={satRef} className="orbit-sat" r="6" opacity="0" />

        {aim && (
          <g className="orbit-aim">
            <circle cx={aim.from.x} cy={aim.from.y} r="5" />
            <path d={`M${aim.from.x} ${aim.from.y}L${aim.to.x} ${aim.to.y}`} />
            {head && <path d={head} className="orbit-aim-head" />}
          </g>
        )}

        <text className="orbit-n" x={C + 8} y="22">N</text>
      </svg>

      <figcaption>
        <span>FIG. 01 · DRAG TO THROW</span>
        <span className="orbit-readout" aria-live="polite">
          {shown ? (
            <>
              e = {shown.e >= 10 ? '≥10' : shown.e.toFixed(2)} — {{ fall: 'FALL', escape: 'ESCAPE', orbit: 'ORBIT' }[shown.outcome]}
            </>
          ) : (
            '—'
          )}
        </span>
      </figcaption>
    </figure>
  );
}
