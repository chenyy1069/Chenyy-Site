import React, { useEffect, useRef } from 'react';

/**
 * A spiral galaxy rendered as a density wave: every particle travels its own
 * ellipse, and each ellipse is rotated a little more than the one inside it.
 * The arms emerge from where the orbits crowd together, so they never wind up.
 */

export type VortexEvent = { type: 'surge' } | { type: 'wave'; x: number; y: number };

const EVENT_NAME = 'chenyy:vortex';

export const emitVortex = (detail: VortexEvent) => {
  window.dispatchEvent(new CustomEvent<VortexEvent>(EVENT_NAME, { detail }));
};

const BG = '#050507';
const TRAIL = 'rgba(5, 5, 7, 0.24)';
const BUCKETS = 24;
const VIEW = -0.42; // rotation of the whole disc on screen
const TILT = 0.58; // squash of the disc, as if seen at an angle
const COS_V = Math.cos(VIEW);
const SIN_V = Math.sin(VIEW);

// Core → rim: warm white, amber, cyan, violet, rose.
const STOPS: [number, [number, number, number]][] = [
  [0, [255, 240, 222]],
  [0.16, [255, 200, 150]],
  [0.4, [126, 230, 255]],
  [0.72, [165, 139, 255]],
  [1, [255, 143, 184]],
];

const colorAt = (t: number): [number, number, number] => {
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i];
    if (t <= t1) {
      const [t0, c0] = STOPS[i - 1];
      const k = (t - t0) / (t1 - t0);
      return [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * k)) as [number, number, number];
    }
  }
  return STOPS[STOPS.length - 1][1];
};

const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

interface Particle {
  rn: number; // normalized orbit radius, 0..1
  t: number; // phase along the ellipse
  w: number; // angular speed
  ecc: number; // minor / major axis
  size: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
}

interface Wave {
  x: number;
  y: number;
  born: number;
}

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let maxR = 0;
    let twist = 0;
    let count = 0;
    let buckets: Particle[][] = [];
    const colors: string[] = [];
    for (let b = 0; b < BUCKETS; b++) {
      const t = (b + 0.5) / BUCKETS;
      const [r, g, bl] = colorAt(t);
      colors.push(`rgba(${r}, ${g}, ${bl}, ${(0.9 - t * 0.45).toFixed(3)})`);
    }

    const pointer = { x: -9999, y: -9999, active: false };
    const center = { x: 0, y: 0 };
    const waves: Wave[] = [];
    let surge = 1;
    let spin = 0;
    const born = performance.now();
    let last = born;
    let raf = 0;

    const populate = () => {
      count = Math.round(Math.min(2400, Math.max(1100, (w * h) / 650)));
      buckets = Array.from({ length: BUCKETS }, () => []);
      for (let i = 0; i < count; i++) {
        const rn = 0.025 + 0.975 * Math.pow(Math.random(), 1.35);
        const p: Particle = {
          rn,
          t: Math.random() * Math.PI * 2,
          w: (0.055 / Math.sqrt(rn + 0.04)) * (0.85 + Math.random() * 0.3),
          ecc: 0.64 + Math.random() * 0.12,
          size: (Math.random() < 0.05 ? 2.2 : 0.8 + Math.random() * 0.9) * (1.15 - rn * 0.4),
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
        };
        const jitter = (Math.random() - 0.5) * 0.12;
        const b = Math.min(BUCKETS - 1, Math.max(0, Math.floor((rn + jitter) * BUCKETS)));
        buckets[b].push(p);
      }
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maxR = Math.hypot(w, h) * 0.62;
      twist = 5.2 / maxR;
      center.x = w / 2;
      center.y = h / 2;
      // Mobile address bars resize the viewport constantly; only reseed on real changes.
      const wanted = Math.min(2400, Math.max(1100, (w * h) / 650));
      if (!count || wanted > count * 1.4 || wanted < count / 1.4) populate();
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
    };

    const draw = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const k = dt * 60; // ~1 at 60fps
      const damp = Math.pow(0.88, k);
      const spring = Math.pow(0.95, k);
      const intro = reduceMotion ? 1 : easeOutExpo(Math.min(1, Math.max(0, (now - born) / 2600)));

      surge = 1 + (surge - 1) * Math.exp(-dt * 1.3);
      spin += dt * 0.02 * surge;

      // The eye of the storm leans a little toward the cursor.
      const tx = w / 2 + (pointer.active ? (pointer.x - w / 2) * 0.04 : 0);
      const ty = h / 2 + (pointer.active ? (pointer.y - h / 2) * 0.04 : 0);
      center.x += (tx - center.x) * Math.min(1, dt * 2);
      center.y += (ty - center.y) * Math.min(1, dt * 2);

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = reduceMotion ? BG : TRAIL;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';

      // Core glow. Trails accumulate it roughly 4x, hence the low alpha.
      const coreR = maxR * 0.32 * intro + 1;
      const ga = reduceMotion ? 0.2 : 0.05;
      const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, coreR);
      glow.addColorStop(0, `rgba(255, 214, 170, ${ga})`);
      glow.addColorStop(0.4, `rgba(126, 160, 255, ${ga * 0.35})`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(center.x - coreR, center.y - coreR, coreR * 2, coreR * 2);

      // Shockwave rings.
      for (let i = waves.length - 1; i >= 0; i--) {
        const age = Math.max(0, now - waves[i].born);
        const life = age / 1800;
        if (life >= 1) {
          waves.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(200, 225, 255, ${0.12 * (1 - life)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(waves[i].x, waves[i].y, age * 0.75, 0, Math.PI * 2);
        ctx.stroke();
      }

      const R = pointer.active ? 150 : 0;
      const R2 = R * R;
      const BAND = 50;

      for (let b = 0; b < BUCKETS; b++) {
        ctx.fillStyle = colors[b];
        const list = buckets[b];
        for (let i = 0; i < list.length; i++) {
          const p = list[i];
          if (!reduceMotion) p.t += p.w * dt * surge;

          const a = p.rn * maxR * intro;
          const ex = a * Math.cos(p.t);
          const ey = a * p.ecc * Math.sin(p.t);
          const phi = p.rn * maxR * twist + spin;
          const c = Math.cos(phi);
          const s = Math.sin(phi);
          const x = ex * c - ey * s;
          const y = (ex * s + ey * c) * TILT;
          const X = center.x + x * COS_V - y * SIN_V;
          const Y = center.y + x * SIN_V + y * COS_V;

          if (R) {
            const dx = X + p.ox - pointer.x;
            const dy = Y + p.oy - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const d = Math.sqrt(d2) || 1;
              const f = 1 - d / R;
              const f2 = f * f * 0.5 * k;
              // Swirl around the cursor, and drift away from it.
              p.vx += (-dy / d * 1.6 + dx / d * 0.8) * f2;
              p.vy += (dx / d * 1.6 + dy / d * 0.8) * f2;
            }
          }

          for (let j = 0; j < waves.length; j++) {
            const wv = waves[j];
            const dx = X + p.ox - wv.x;
            const dy = Y + p.oy - wv.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const off = Math.abs(d - (now - wv.born) * 0.75);
            if (off < BAND) {
              const f = (1 - off / BAND) * (1 - (now - wv.born) / 1800) * 2.2 * k;
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            }
          }

          p.vx *= damp;
          p.vy *= damp;
          p.ox = (p.ox + p.vx * k) * spring;
          p.oy = (p.oy + p.vy * k) * spring;

          const px = X + p.ox;
          const py = Y + p.oy;
          if (px < -4 || py < -4 || px > w + 4 || py > h + 4) continue;
          ctx.fillRect(px, py, p.size, p.size);
        }
      }
    };

    // rAF's timestamp can trail a performance.now() taken during the same frame
    // (e.g. a wave spawned by a click), which would make elapsed times negative.
    const loop = () => {
      draw(performance.now());
      raf = requestAnimationFrame(loop);
    };

    let resizeQueued = 0;
    const handleResize = () => {
      cancelAnimationFrame(resizeQueued);
      resizeQueued = requestAnimationFrame(() => {
        resize();
        if (reduceMotion) draw(performance.now());
      });
    };

    const handleMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const handleLeave = () => {
      pointer.active = false;
    };
    const handleUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') pointer.active = false;
    };
    const handleVortex = (e: Event) => {
      const detail = (e as CustomEvent<VortexEvent>).detail;
      if (detail.type === 'surge') {
        surge = Math.min(surge + 7, 15);
      } else {
        waves.push({ x: detail.x, y: detail.y, born: performance.now() });
        if (waves.length > 4) waves.shift();
      }
    };

    resize();
    if (reduceMotion) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(loop);
      window.addEventListener('pointermove', handleMove, { passive: true });
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointercancel', handleLeave);
      window.addEventListener('blur', handleLeave);
      document.documentElement.addEventListener('pointerleave', handleLeave);
      window.addEventListener(EVENT_NAME, handleVortex);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeQueued);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleLeave);
      window.removeEventListener('blur', handleLeave);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
      window.removeEventListener(EVENT_NAME, handleVortex);
    };
  }, []);

  return <canvas ref={canvasRef} className="vortex" aria-hidden="true" />;
};
