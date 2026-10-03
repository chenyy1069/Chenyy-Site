import React, { useEffect, useRef, useState } from 'react';

/*
 * FIG. 01 — the orb, its drifting rings, and whatever is thrown at it.
 *
 * - Press, drag and release (or tap) to launch a satellite. Up to five fly at
 *   once under real two-body gravity (symplectic Euler, small substeps).
 * - A moving pointer carries a little mass of its own and bends nearby
 *   orbits; it fades once the pointer rests, so taps stay clean circles.
 * - The orb is lit from wherever the pointer is.
 * - Satellites are kept in this browser and resume on the next visit.
 */

const C = 260;
const R = 92; // orb radius
const RING_A = -16;
const RING_B = 24;
const MU = 3.2e6; // orb GM, px³/s²
const MU_POINTER = 6e4; // the pointer's GM while it moves
const PRESENCE_FADE = 0.5; // s; a still pointer stops pulling
const SOFTEN = 30; // pointer softening length, px
const GAIN = 1.8; // drag px → px/s
const SUBSTEPS = 8;
const TRAIL = 600;
const MAX_BODIES = 5;
const STORE_KEY = 'chenyy-orbits';
const LIGHT_HOME = { x: 0.36, y: 0.3 };

type Vec = { x: number; y: number };
type Outcome = 'fall' | 'escape' | 'orbit';
interface Reading {
  e: number;
  outcome: Outcome;
}
interface Body {
  id: number;
  p: Vec;
  v: Vec;
  trail: Vec[];
  alive: boolean;
  fate?: Outcome;
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const finite = (...ns: unknown[]) => ns.every((n) => typeof n === 'number' && Number.isFinite(n));

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

const formatReading = (r: Reading | null) =>
  r ? `e = ${r.e >= 10 ? '≥10' : r.e.toFixed(2)} — ${{ fall: 'FALL', escape: 'ESCAPE', orbit: 'ORBIT' }[r.outcome]}` : '—';

const loadStored = (): { p: Vec; v: Vec }[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((b) => b && finite(b.p?.x, b.p?.y, b.v?.x, b.v?.y))
      .filter((b) => Math.hypot(b.p.x - C, b.p.y - C) > R)
      .slice(0, MAX_BODIES);
  } catch {
    return [];
  }
};

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
          pathLength={1}
          transform={`rotate(${i * 0.9} ${C} ${C})`}
          style={{ animationDelay: `${300 + i * 70}ms` }}
        />
      ))}
    </g>
  );
}

export function Orbit() {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradRef = useRef<SVGRadialGradientElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  const bodies = useRef<Body[]>([]);
  const els = useRef(new Map<number, { trail: SVGPolylineElement | null; sat: SVGCircleElement | null }>());
  const nextId = useRef(1);
  const pointer = useRef({ x: 0, y: 0, active: false, presence: 0 });
  const light = useRef({ ...LIGHT_HOME });
  const lightTarget = useRef({ ...LIGHT_HOME });
  const aimRef = useRef(false);
  const raf = useRef(0);
  const running = useRef(false);
  const last = useRef(0);
  const frame = useRef(0);
  const lastSave = useRef(0);
  const reduceMotion = useRef(false);

  const [ids, setIds] = useState<number[]>([]);
  const [fading, setFading] = useState<number[]>([]);
  const [aim, setAim] = useState<{ from: Vec; to: Vec } | null>(null);

  const setReadout = (r: Reading | null) => {
    if (readoutRef.current) readoutRef.current.textContent = formatReading(r);
  };

  const save = () => {
    try {
      const alive = bodies.current.filter((b) => b.alive).map(({ p, v }) => ({ p, v }));
      localStorage.setItem(STORE_KEY, JSON.stringify(alive));
    } catch {
      // Nothing to remember without storage.
    }
  };

  const retire = (b: Body, fate: Outcome) => {
    if (!b.alive) return;
    b.alive = false;
    b.fate = fate;
    els.current.get(b.id)?.sat?.setAttribute('opacity', '0');
    setFading((f) => [...f, b.id]);
    window.setTimeout(() => {
      bodies.current = bodies.current.filter((x) => x.id !== b.id);
      els.current.delete(b.id);
      setIds((list) => list.filter((id) => id !== b.id));
      setFading((f) => f.filter((id) => id !== b.id));
    }, 1600);
  };

  const tick = (now: number) => {
    const dt = Math.min(0.033, Math.max(0, (now - last.current) / 1000)) / SUBSTEPS;
    last.current = now;
    const ptr = pointer.current;
    ptr.presence *= Math.exp(-(dt * SUBSTEPS) / PRESENCE_FADE);
    const pull = ptr.active && !aimRef.current ? MU_POINTER * ptr.presence : 0;
    let busy = false;

    for (const b of bodies.current) {
      if (!b.alive) continue;
      busy = true;
      for (let i = 0; i < SUBSTEPS; i++) {
        const rx = b.p.x - C;
        const ry = b.p.y - C;
        const r = Math.hypot(rx, ry);
        if (r <= R) {
          retire(b, 'fall');
          break;
        }
        if (r > 1400) {
          retire(b, 'escape');
          break;
        }
        const k = -MU / (r * r * r);
        let ax = rx * k;
        let ay = ry * k;
        if (pull > 1) {
          const dx = ptr.x - b.p.x;
          const dy = ptr.y - b.p.y;
          const d2 = dx * dx + dy * dy + SOFTEN * SOFTEN;
          const kp = pull / (d2 * Math.sqrt(d2));
          ax += dx * kp;
          ay += dy * kp;
        }
        b.v.x += ax * dt;
        b.v.y += ay * dt;
        b.p.x += b.v.x * dt;
        b.p.y += b.v.y * dt;
      }
      b.trail.push({ x: b.p.x, y: b.p.y });
      if (b.trail.length > TRAIL) b.trail.shift();
      const el = els.current.get(b.id);
      el?.trail?.setAttribute('points', toPoints(b.trail));
      if (b.alive) {
        el?.sat?.setAttribute('cx', b.p.x.toFixed(1));
        el?.sat?.setAttribute('cy', b.p.y.toFixed(1));
        el?.sat?.setAttribute('opacity', '1');
      }
    }

    // The readout follows the newest satellite, live, since the pointer can perturb it.
    frame.current += 1;
    if (!aimRef.current && frame.current % 6 === 0) {
      const newest = [...bodies.current].reverse().find((b) => b.alive);
      if (newest) setReadout(classify(newest.p, newest.v));
    }

    // Ease the orb's light toward the pointer.
    const L = light.current;
    const T = lightTarget.current;
    const dl = Math.abs(T.x - L.x) + Math.abs(T.y - L.y);
    if (dl > 0.0005) {
      L.x += (T.x - L.x) * 0.08;
      L.y += (T.y - L.y) * 0.08;
      gradRef.current?.setAttribute('cx', L.x.toFixed(4));
      gradRef.current?.setAttribute('cy', L.y.toFixed(4));
      busy = true;
    }

    if (now - lastSave.current > 2000) {
      lastSave.current = now;
      save();
    }

    if (busy) {
      raf.current = requestAnimationFrame(tick);
    } else {
      running.current = false;
    }
  };

  const ensureLoop = () => {
    if (running.current) return;
    running.current = true;
    last.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };

  const launch = (p: Vec, v: Vec, announce = true) => {
    const alive = bodies.current.filter((b) => b.alive);
    if (alive.length >= MAX_BODIES) retire(alive[0], 'orbit');
    const id = nextId.current++;
    bodies.current.push({ id, p: { ...p }, v: { ...v }, trail: [{ ...p }], alive: true });
    setIds((list) => [...list, id]);
    if (announce) setReadout(classify(p, v));
    ensureLoop();
  };

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const entering = document.documentElement.classList.contains('is-entering');
    let start: number | undefined;

    if (!reduceMotion.current) {
      const stored = loadStored();
      const begin = () => {
        if (stored.length) stored.forEach((b) => launch(b.p, b.v));
        else {
          const p = { x: C + 34, y: C - 206 };
          const c = circular(p);
          launch(p, { x: c.x * 0.86, y: c.y * 0.86 });
        }
      };
      // Let the drawing finish assembling before anything moves.
      if (entering) start = window.setTimeout(begin, 1500);
      else begin();
    }

    const handlePointer = (e: PointerEvent) => {
      const svg = svgRef.current;
      const ctm = svg?.getScreenCTM();
      if (!svg || !ctm) return;
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
      const prev = pointer.current;
      const moved = Math.hypot(pt.x - prev.x, pt.y - prev.y);
      pointer.current = { x: pt.x, y: pt.y, active: true, presence: Math.min(1, prev.presence + moved / 40) };

      if (!reduceMotion.current) {
        // light comes from the pointer's side, more strongly the further away it is
        const dx = pt.x - C;
        const dy = pt.y - C;
        const d = Math.hypot(dx, dy) || 1;
        const f = Math.min(1, d / 700);
        lightTarget.current = { x: 0.5 + (dx / d) * 0.24 * f, y: 0.5 + (dy / d) * 0.24 * f };
        ensureLoop();
      }
    };
    const handleLeave = () => {
      pointer.current.active = false;
      lightTarget.current = { ...LIGHT_HOME };
      ensureLoop();
    };
    const handleUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') handleLeave();
    };

    window.addEventListener('pointermove', handlePointer, { passive: true });
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('blur', handleLeave);
    document.documentElement.addEventListener('pointerleave', handleLeave);
    window.addEventListener('pagehide', save);

    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(raf.current);
      running.current = false;
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('blur', handleLeave);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
      window.removeEventListener('pagehide', save);
    };
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
    const a = { from: p, to: p };
    aimRef.current = true;
    setAim(a);
    setReadout(classify(p, velocityOf(a)));
  };

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!aim) return;
    const p = toSvg(e);
    if (!p) return;
    const a = { from: aim.from, to: p };
    setAim(a);
    setReadout(classify(a.from, velocityOf(a)));
  };

  const handleUp = () => {
    if (!aim) return;
    aimRef.current = false;
    pointer.current.presence = 0;
    launch(aim.from, velocityOf(aim));
    setAim(null);
  };

  const bind = (id: number, kind: 'trail' | 'sat') => (el: SVGPolylineElement | SVGCircleElement | null) => {
    const entry = els.current.get(id) ?? { trail: null, sat: null };
    if (kind === 'trail') entry.trail = el as SVGPolylineElement | null;
    else entry.sat = el as SVGCircleElement | null;
    els.current.set(id, entry);
  };

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
        onPointerCancel={() => {
          aimRef.current = false;
          setAim(null);
        }}
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
          <radialGradient id="orbit-orb" ref={gradRef} cx={LIGHT_HOME.x} cy={LIGHT_HOME.y} r="0.78">
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

        <g className="orbit-bodies">
          {ids.map((id) => (
            <polyline key={id} ref={bind(id, 'trail')} className={`orbit-trail ${fading.includes(id) ? 'is-fading' : ''}`} />
          ))}
        </g>

        <g className="orbit-orb">
          <circle cx={C} cy={C} r={R} fill="url(#orbit-orb)" />
          <circle cx={C} cy={C} r={R} fill="#fff" filter="url(#orbit-grain)" opacity="0.16" />
        </g>

        <g className="orbit-ring orbit-ring-a">
          <Rings rotate={RING_A} count={7} clip />
        </g>
        <g className="orbit-ring orbit-ring-b">
          <Rings rotate={RING_B} count={5} clip />
        </g>

        <g className="orbit-bodies">
          {ids.map((id) => (
            <circle key={id} ref={bind(id, 'sat')} className="orbit-sat" r="6" opacity="0" />
          ))}
        </g>

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
        <span className="orbit-readout" ref={readoutRef}>
          —
        </span>
      </figcaption>
    </figure>
  );
}
