import React, { useEffect, useMemo, useState } from 'react';
import { emitVortex } from './InteractiveBackground';

interface TypingTitleProps {
  text: string;
  /** A substring rendered in the italic gradient accent. */
  accent?: string;
}

const GLYPHS = '01<>/\\{}[]#*+=~$%アカサタナハマヤラワ';
const SCRAMBLE = 4; // characters ahead of the cursor that flicker before settling
const TICK = 42;
const SWIRL = '🌀';

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/**
 * Types the text out, decoding each character from noise. Every character's
 * final glyph is laid out from the start (just hidden), so nothing reflows
 * while it types.
 */
export const TypingTitle: React.FC<TypingTitleProps> = ({ text, accent }) => {
  const chars = useMemo(() => [...text], [text]);
  const reduceMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const total = chars.length * 2 + SCRAMBLE * 2;
  const [frame, setFrame] = useState(reduceMotion ? total : 0);
  const [spins, setSpins] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    setFrame(0);
    let f = 0;
    let intervalId: number | undefined;
    // Wait for the card to rise in before typing.
    const startTimeout = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        f += 1;
        setFrame(f);
        if (f >= total) window.clearInterval(intervalId);
      }, TICK);
    }, 900);

    return () => {
      window.clearTimeout(startTimeout);
      window.clearInterval(intervalId);
    };
  }, [chars, total, reduceMotion]);

  const [accentStart, accentEnd] = useMemo(() => {
    const idx = accent ? text.indexOf(accent) : -1;
    if (!accent || idx < 0) return [-1, -1];
    const start = [...text.slice(0, idx)].length;
    return [start, start + [...accent].length];
  }, [text, accent]);

  const revealed = Math.floor(frame / 2);
  const done = revealed >= chars.length;

  const surge = () => {
    setSpins((n) => n + 1);
    emitVortex({ type: 'surge' });
  };

  const renderChar = (i: number) => {
    const ch = chars[i];
    const on = i < revealed;
    const scrambling = !on && i < revealed + SCRAMBLE && ch.trim() !== '';
    const caret = i === revealed && <span className="caret" />;

    if (ch === SWIRL) {
      return (
        <span key={i} className={`ch swirl ${on ? '' : 'off'} ${scrambling ? 'scrambling' : ''}`} onClick={on ? surge : undefined} title="spin me">
          {caret}
          <span className="swirl-inner" style={{ transform: `rotate(${spins * 1080}deg)` }}>
            {ch}
          </span>
          {scrambling && <span className="glyph">{randomGlyph()}</span>}
        </span>
      );
    }

    return (
      <span key={i} className={`ch ${on ? '' : 'off'} ${scrambling ? 'scrambling' : ''}`}>
        {caret}
        {ch}
        {scrambling && <span className="glyph">{randomGlyph()}</span>}
      </span>
    );
  };

  // Group characters into unbreakable words, with the accent as its own run.
  const nodes: React.ReactNode[] = [];
  let word: number[] = [];
  const flushWord = () => {
    if (!word.length) return;
    const runs: React.ReactNode[] = [];
    let run: number[] = [];
    let runAccent = false;
    const flushRun = () => {
      if (!run.length) return;
      const content = run.map(renderChar);
      runs.push(runAccent ? <span key={`a${run[0]}`} className="accent">{content}</span> : content);
      run = [];
    };
    for (const i of word) {
      const isAccent = i >= accentStart && i < accentEnd;
      if (isAccent !== runAccent) {
        flushRun();
        runAccent = isAccent;
      }
      run.push(i);
    }
    flushRun();
    nodes.push(<span key={`w${word[0]}`} className="word">{runs}</span>);
    word = [];
  };
  chars.forEach((ch, i) => {
    if (ch === ' ') {
      flushWord();
      nodes.push(renderChar(i));
    } else {
      word.push(i);
    }
  });
  flushWord();

  return (
    <h1 className="title" aria-label={text}>
      <span aria-hidden="true">
        {nodes}
        {done && <span className="caret" />}
      </span>
    </h1>
  );
};
