import React, { useEffect, useRef, useState } from 'react';

/*
 * FIG. 02 — throw a satellite and see which of the three things it does:
 * fall in, leave, or keep falling and missing (an orbit). Two-body Newtonian
 * gravity, integrated with symplectic Euler in small substeps. The outcome is
 * known the moment it is thrown, from its energy and angular momentum.
 */

const W = 640;
const H = 360;
const CX = 320;
const CY = 180;
const R = 34; // planet radius
const R0 = 120; // reference circle
const MU = 1.6e6; // GM, in px³/s²
const GAIN = 1.8; // drag px → velocity px/s
const SUBSTEPS = 8;
const TRAIL = 900;
const GHOSTS = 3;

type Outcome = 'fall' | 'leave' | 'orbit';
type Vec = { x: number; y: number };
interface Reading {
  e: number;
  outcome: Outcome;
}

const classify = (p: Vec, v: Vec): Reading => {
  const rx = p.x - CX;
  const ry = p.y - CY;
  const r = Math.hypot(rx, ry);
  const h = rx * v.y - ry * v.x;
  const energy = (v.x * v.x + v.y * v.y) / 2 - MU / r;
  const e = Math.sqrt(Math.max(0, 1 + (2 * energy * h * h) / (MU * MU)));
  const periapsis = (h * h) / MU / (1 + e);
  const outward = rx * v.x + ry * v.y > 0;
  if (e >= 1 && outward) return { e, outcome: 'leave' };
  if (periapsis <= R) return { e, outcome: 'fall' };
  return { e, outcome: e < 1 ? 'orbit' : 'leave' };
};

// Velocity for a circular orbit at p (counter-clockwise on screen).
const circular = (p: Vec): Vec => {
  const rx = p.x - CX;
  const ry = p.y - CY;
  const r = Math.hypot(rx, ry);
  const s = Math.sqrt(MU / r) / r;
  return { x: ry * s, y: -rx * s };
};

const verdictFor = ({ e, outcome }: Reading): [string, string] => {
  if (outcome === 'fall') return ['Fell in.', '坠落了。'];
  if (outcome === 'leave') return ['A lot out of orbit.', '彻底离开了轨道。'];
  if (e < 0.08) return ['Perfectly in orbit. A little dull.', '完美在轨，有点无聊。'];
  if (e < 0.6) return ['In orbit, with opinions.', '在轨道里，但有自己的想法。'];
  return ['A little out of orbit.', '有一点偏离轨道。刚刚好。'];
};

const toPoints = (pts: Vec[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

export function OrbitLab() {
  const svgRef = useRef<SVGSVGElement>(null);
  const trailRef = useRef<SVGPolylineElement>(null);
  const satRef = useRef<SVGCircleElement>(null);
  const body = useRef<{ p: Vec; v: Vec; trail: Vec[]; alive: boolean } | null>(null);
  const raf = useRef(0);
  const last = useRef(0);

  const [ghosts, setGhosts] = useState<string[]>([]);
  const [aim, setAim] = useState<{ from: Vec; to: Vec } | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [preview, setPreview] = useState<Reading | null>(null);

  const step = (now: number) => {
    const b = body.current;
    if (!b || !b.alive) return;
    const dt = Math.min(0.033, (now - last.current) / 1000) / SUBSTEPS;
    last.current = now;
    for (let i = 0; i < SUBSTEPS; i++) {
      const rx = b.p.x - CX;
      const ry = b.p.y - CY;
      const r = Math.hypot(rx, ry);
      if (r <= R || r > 2400) {
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
    satRef.current?.setAttribute('cx', b.p.x.toFixed(1));
    satRef.current?.setAttribute('cy', b.p.y.toFixed(1));
    satRef.current?.setAttribute('opacity', b.alive ? '1' : '0');
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

  const throwRandom = () => {
    const a = Math.random() * Math.PI * 2;
    const r = 90 + Math.random() * 70;
    const p = { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) * 0.8 };
    const c = circular(p);
    const f = 0.7 + Math.random() * 0.75;
    const tilt = (Math.random() - 0.5) * 0.6;
    launch(p, {
      x: (c.x * Math.cos(tilt) - c.y * Math.sin(tilt)) * f,
      y: (c.x * Math.sin(tilt) + c.y * Math.cos(tilt)) * f,
    });
  };

  const clear = () => {
    cancelAnimationFrame(raf.current);
    body.current = null;
    setGhosts([]);
    setReading(null);
    trailRef.current?.setAttribute('points', '');
    satRef.current?.setAttribute('opacity', '0');
  };

  // Start with one throw already in flight, so the plate isn't empty.
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const p = { x: CX + 150, y: CY };
      const c = circular(p);
      launch(p, { x: c.x * 0.8, y: c.y * 0.8 });
    }
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const toSvg = (e: React.PointerEvent): Vec | null => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  };

  const velocityOf = (a: { from: Vec; to: Vec }): Vec => {
    const dx = a.to.x - a.from.x;
    const dy = a.to.y - a.from.y;
    // A tap, not a drag: throw it at exactly circular speed.
    if (Math.hypot(dx, dy) < 6) return circular(a.from);
    return { x: dx * GAIN, y: dy * GAIN };
  };

  const handleDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = toSvg(e);
    if (!p || Math.hypot(p.x - CX, p.y - CY) < R + 6) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const a = { from: p, to: p };
    setAim(a);
    setPreview(classify(p, velocityOf(a)));
  };

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!aim) return;
    const p = toSvg(e);
    if (!p) return;
    const a = { from: aim.from, to: p };
    setAim(a);
    setPreview(classify(a.from, velocityOf(a)));
  };

  const handleUp = () => {
    if (!aim) return;
    launch(aim.from, velocityOf(aim));
    setAim(null);
    setPreview(null);
  };

  const shown = preview ?? reading;
  const [lineEn, lineZh] = shown ? verdictFor(shown) : ['Drag to throw.', '按住拖动，抛出一颗卫星。'];

  // aim arrowhead
  let head = '';
  if (aim) {
    const dx = aim.to.x - aim.from.x;
    const dy = aim.to.y - aim.from.y;
    const len = Math.hypot(dx, dy);
    if (len > 10) {
      const ux = dx / len;
      const uy = dy / len;
      const bx = aim.to.x - ux * 9;
      const by = aim.to.y - uy * 9;
      head = `M${aim.to.x} ${aim.to.y}L${bx - uy * 4} ${by + ux * 4}L${bx + uy * 4} ${by - ux * 4}Z`;
    }
  }

  return (
    <div className="lab">
      <svg
        ref={svgRef}
        className={`lab-plate ${aim ? 'is-aiming' : ''}`}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="轨道实验：按住拖动来抛出一颗卫星 / Orbit plate: press and drag to throw a satellite"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={() => {
          setAim(null);
          setPreview(null);
        }}
      >
        <defs>
          <pattern id="lab-dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="currentColor" />
          </pattern>
          <radialGradient id="lab-orb" cx="0.36" cy="0.3" r="0.78">
            <stop offset="0" style={{ stopColor: 'var(--orb-highlight)' }} />
            <stop offset="0.48" style={{ stopColor: 'var(--orb-mid)' }} />
            <stop offset="1" style={{ stopColor: 'var(--orb-shadow)' }} />
          </radialGradient>
        </defs>

        <rect className="lab-grid" width={W} height={H} fill="url(#lab-dots)" />
        <g className="lab-construct">
          <path d={`M${CX} 12V${H - 12}M12 ${CY}H${W - 12}`} />
          <circle cx={CX} cy={CY} r={R0} strokeDasharray="2 6" />
          <circle cx={CX} cy={CY} r={R0 * 2} strokeDasharray="2 6" />
        </g>
        <g className="lab-notes">
          <text x={CX + R0 + 6} y={CY - 6}>r₀</text>
          <text x={CX + R0 * 2 + 6} y={CY - 6}>2r₀</text>
          <text x="16" y="28">FIG. 02</text>
          <text x="16" y={H - 16}>{aim ? 'RELEASE TO THROW' : 'PRESS · DRAG · RELEASE'}</text>
        </g>

        {ghosts.map((pts, i) => (
          <polyline key={`${i}-${pts.length}`} className="lab-ghost" points={pts} style={{ opacity: 0.42 - i * 0.12 }} />
        ))}
        <polyline ref={trailRef} className="lab-trail" />

        <circle cx={CX} cy={CY} r={R} fill="url(#lab-orb)" />
        <circle ref={satRef} className="lab-sat" r="4.5" opacity="0" />

        {aim && (
          <g className="lab-aim">
            <circle cx={aim.from.x} cy={aim.from.y} r="4.5" />
            <path d={`M${aim.from.x} ${aim.from.y}L${aim.to.x} ${aim.to.y}`} />
            {head && <path d={head} className="lab-aim-head" />}
          </g>
        )}
      </svg>

      <div className="lab-bar">
        <span className="lab-e">
          e = {shown ? (shown.e >= 10 ? '≥ 10' : shown.e.toFixed(2)) : '—'}
          <i>{shown ? { fall: 'FALL', leave: 'ESCAPE', orbit: 'ORBIT' }[shown.outcome] : 'IDLE'}</i>
        </span>
        <span className="lab-verdict" aria-live="polite">
          <em>{lineEn}</em> <span lang="zh-CN">{lineZh}</span>
        </span>
        <span className="lab-actions">
          <button type="button" className="pill" onClick={throwRandom}>
            随手一抛<span className="hide-sm"> · Throw one</span>
          </button>
          <button type="button" className="round-btn" onClick={clear} aria-label="清空 / Clear">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </span>
      </div>
    </div>
  );
}
