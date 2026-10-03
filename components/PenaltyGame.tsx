import React, { useEffect, useRef, useState } from 'react';

/*
 * FIG. 02 — five penalties, drawn like a technical plate. The ball flies from
 * the spot toward a random point in the goal; the gloves follow the pointer.
 * A save is any arrival within REACH of the gloves.
 */

const SHOTS = 5;
const REACH = 44;
const GOAL = { x0: 80, x1: 560, y0: 70, y1: 230 }; // 7.32 m × 2.44 m at ~65.6 px/m
const SPOT = { x: 320, y: 318 };
const BALL_R = 20; // drawn radius; scaled during flight

type Phase = 'idle' | 'playing' | 'over';
type Verdict = 'saved' | 'goal' | null;

const VERDICTS: [string, string][] = [
  ['Strikers send their thanks.', '前锋们向你致谢。'],
  ['It happens.', '常有的事。'],
  ['Keep diving.', '继续扑。'],
  ['Solid hands.', '手很稳。'],
  ['Shootout hero.', '点球大战英雄。'],
  ['A wall.', '一堵墙。'],
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const pad = (n: number) => String(n).padStart(2, '0');

// Pentagon + seams, drawn once at BALL_R and scaled.
const PENTAGON = Array.from({ length: 5 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
  return [Math.cos(a) * 7, Math.sin(a) * 7] as const;
});
const BALL_PATH =
  `M${PENTAGON.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L')} Z ` +
  PENTAGON.map(([x, y]) => `M${x.toFixed(2)} ${y.toFixed(2)} L${(x * 2.75).toFixed(2)} ${(y * 2.75).toFixed(2)}`).join(' ');

export function PenaltyGame() {
  const svgRef = useRef<SVGSVGElement>(null);
  const ballRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);
  const gloveRef = useRef<SVGGElement>(null);
  const glove = useRef({ x: 320, y: 160 });
  const raf = useRef(0);
  const timers = useRef<number[]>([]);
  const tally = useRef({ shots: 0, saves: 0, log: [] as Verdict[] });

  const [phase, setPhase] = useState<Phase>('idle');
  const [shots, setShots] = useState(0);
  const [saves, setSaves] = useState(0);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [log, setLog] = useState<Verdict[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
    },
    []
  );

  const placeGlove = () => {
    gloveRef.current?.setAttribute('transform', `translate(${glove.current.x} ${glove.current.y})`);
  };

  const placeBall = (x: number, y: number, r: number, spin: number, opacity = 1) => {
    ballRef.current?.setAttribute('transform', `translate(${x} ${y}) scale(${r / BALL_R}) rotate(${spin})`);
    ballRef.current?.setAttribute('opacity', String(opacity));
  };

  const placeShadow = (x: number, y: number, r: number, opacity = 1) => {
    const s = shadowRef.current;
    if (!s) return;
    s.setAttribute('cx', String(x));
    s.setAttribute('cy', String(y));
    s.setAttribute('rx', String(r));
    s.setAttribute('ry', String(r * 0.22));
    s.setAttribute('opacity', String(opacity));
  };

  const resetBall = () => {
    placeBall(SPOT.x, SPOT.y, BALL_R, 0);
    placeShadow(SPOT.x, SPOT.y + BALL_R - 2, BALL_R * 0.9);
  };

  useEffect(() => {
    resetBall();
    placeGlove();
  }, []);

  const shoot = () => {
    setVerdict(null);
    resetBall();
    const target = {
      x: GOAL.x0 + 18 + Math.random() * (GOAL.x1 - GOAL.x0 - 36),
      y: GOAL.y0 + 16 + Math.random() * (GOAL.y1 - GOAL.y0 - 26),
    };
    const curve = (Math.random() - 0.5) * 260;
    const ctrl = { x: (SPOT.x + target.x) / 2 + curve, y: Math.min(SPOT.y, target.y) - 40 - Math.random() * 60 };
    const duration = 920 - tally.current.shots * 55;
    const t0 = performance.now();

    const fly = (now: number) => {
      const t = clamp((now - t0) / duration, 0, 1);
      const e = 1 - Math.pow(1 - t, 1.6); // fast off the boot, easing into the net
      const u = 1 - e;
      const x = u * u * SPOT.x + 2 * u * e * ctrl.x + e * e * target.x;
      const y = u * u * SPOT.y + 2 * u * e * ctrl.y + e * e * target.y;
      const r = BALL_R + (9 - BALL_R) * e;
      placeBall(x, y, r, e * 540);
      placeShadow(x, SPOT.y + BALL_R - 2 + (GOAL.y1 + 4 - SPOT.y - BALL_R + 2) * e, r * 0.9, 1 - e * 0.5);

      if (t < 1) {
        raf.current = requestAnimationFrame(fly);
        return;
      }

      const dx = target.x - glove.current.x;
      const dy = target.y - glove.current.y;
      const saved = Math.hypot(dx, dy) < REACH;
      tally.current.shots += 1;
      if (saved) tally.current.saves += 1;
      tally.current.log = [...tally.current.log, saved ? 'saved' : 'goal'];
      setLog(tally.current.log);
      setShots(tally.current.shots);
      setSaves(tally.current.saves);
      setVerdict(saved ? 'saved' : 'goal');

      if (saved) {
        // parried away from the gloves
        const len = Math.hypot(dx, dy) || 1;
        const dir = { x: dx / len || 0, y: dy / len || -1 };
        const p0 = performance.now();
        const parry = (n: number) => {
          const k = clamp((n - p0) / 420, 0, 1);
          placeBall(target.x + dir.x * 150 * k, target.y + dir.y * 150 * k - 40 * Math.sin(k * Math.PI), 9, 540 + k * 300, 1 - k);
          placeShadow(target.x + dir.x * 150 * k, GOAL.y1 + 4, 8, 0.5 * (1 - k));
          if (k < 1) raf.current = requestAnimationFrame(parry);
        };
        raf.current = requestAnimationFrame(parry);
      }

      if (tally.current.shots < SHOTS) later(shoot, 1250);
      else later(() => setPhase('over'), 1100);
    };
    raf.current = requestAnimationFrame(fly);
  };

  const start = () => {
    cancelAnimationFrame(raf.current);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    tally.current = { shots: 0, saves: 0, log: [] };
    setLog([]);
    setShots(0);
    setSaves(0);
    setVerdict(null);
    setPhase('playing');
    resetBall();
    later(shoot, 900);
    svgRef.current?.focus({ preventScroll: true });
  };

  const moveGlove = (x: number, y: number) => {
    glove.current = { x: clamp(x, GOAL.x0 - 20, GOAL.x1 + 20), y: clamp(y, GOAL.y0 - 10, GOAL.y1 - 14) };
    placeGlove();
  };

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    moveGlove(pt.x, pt.y);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    const step = 26;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    moveGlove(glove.current.x + m[0], glove.current.y + m[1]);
  };

  const [lineEn, lineZh] = VERDICTS[saves];

  return (
    <div className={`game ${phase === 'playing' ? 'is-playing' : ''}`}>
      <svg
        ref={svgRef}
        className="game-plate"
        viewBox="0 0 640 340"
        tabIndex={0}
        role="application"
        aria-label="点球扑救小游戏：移动鼠标、手指或方向键来移动手套 / Penalty save game: move the gloves with pointer or arrow keys"
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onKeyDown={handleKey}
      >
        <defs>
          <pattern id="net" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 0L16 16M16 0L0 16" />
          </pattern>
        </defs>

        {/* dimensions */}
        <g className="game-dim">
          <path d={`M${GOAL.x0} 42V30M${GOAL.x1} 42V30M${GOAL.x0} 36H${GOAL.x1}`} />
          <path d={`M${GOAL.x0} 36l8 -4v8zM${GOAL.x1} 36l-8 -4v8z`} className="game-dim-head" />
          <text x="320" y="28" textAnchor="middle">7.32 M</text>
          <path d={`M588 ${GOAL.y0}H600M588 ${GOAL.y1}H600M594 ${GOAL.y0}V${GOAL.y1}`} />
          <text
            x="612"
            y={(GOAL.y0 + GOAL.y1) / 2}
            textAnchor="middle"
            transform={`rotate(-90 612 ${(GOAL.y0 + GOAL.y1) / 2})`}
          >
            2.44 M
          </text>
        </g>

        {/* goal */}
        <rect className="game-net" x={GOAL.x0} y={GOAL.y0} width={GOAL.x1 - GOAL.x0} height={GOAL.y1 - GOAL.y0} fill="url(#net)" />
        <path className="game-frame" d={`M${GOAL.x0} ${GOAL.y1}V${GOAL.y0}H${GOAL.x1}V${GOAL.y1}`} />
        <path className="game-ground" d={`M20 ${GOAL.y1}H620`} />
        <path className="game-box" d={`M40 ${GOAL.y1}L8 332M600 ${GOAL.y1}L632 332`} />
        <circle className="game-spot" cx={SPOT.x} cy={SPOT.y + BALL_R + 4} r="2.5" />

        {/* gloves */}
        <g ref={gloveRef} className="game-glove">
          <circle r={REACH} className="game-reach" />
          <rect x="-26" y="-17" width="22" height="30" rx="9" />
          <rect x="4" y="-17" width="22" height="30" rx="9" />
          <path d="M-20 -9v8M-15 -11v10M-10 -9v8M10 -9v8M15 -11v10M20 -9v8" />
        </g>

        {/* ball */}
        <ellipse ref={shadowRef} className="game-shadow" />
        <g ref={ballRef} className="game-ball">
          <circle r={BALL_R} vectorEffect="non-scaling-stroke" />
          <path d={BALL_PATH} vectorEffect="non-scaling-stroke" />
        </g>
      </svg>

      <div className="game-bar">
        <span className="game-score">
          SHOT {pad(Math.min(shots + (phase === 'playing' && shots < SHOTS ? 1 : 0), SHOTS))} / {pad(SHOTS)}
          <i>·</i>
          SAVES {pad(saves)}
        </span>
        <span className="game-pips" aria-hidden="true">
          {Array.from({ length: SHOTS }, (_, i) => (
            <i key={i} className={log[i] ? `is-${log[i]}` : ''} />
          ))}
        </span>
        {phase === 'playing' && verdict && (
          <span key={shots} className={`game-verdict is-${verdict}`} aria-live="polite">
            {verdict === 'saved' ? 'Saved.' : 'Goal.'}
          </span>
        )}
        {phase !== 'playing' && (
          <button type="button" className="pill pill-ink" onClick={start}>
            {phase === 'idle' ? '开球 · Kick off' : '再来 · Again'}
          </button>
        )}
      </div>

      {phase === 'over' && (
        <p className="game-result" aria-live="polite">
          <em>{saves} / {SHOTS}.</em> {lineEn} <span lang="zh-CN">{lineZh}</span>
        </p>
      )}
    </div>
  );
}
