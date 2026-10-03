import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import { ContactModal } from './components/modals/ContactModal';
import { DonationOverlay } from './components/overlays/DonationOverlay';
import { CryptoModal } from './components/modals/CryptoModal';
import { ImagePopup } from './components/overlays/ImagePopup';
import { CardArtwork, OrbitFigure, Spiral, Star } from './components/Artwork';
import { PenaltyGame } from './components/PenaltyGame';
import { useShenzhenTime, useTheme } from './components/hooks';

const GITHUB_URL = 'https://github.com/chenyy1069';
const PROJECTS_URL = 'https://navigation.chenyy.cc';

// The tools listed on navigation.chenyy.cc.
const MADE = [
  {
    no: 'M—01',
    title: 'Words into pictures.',
    label: 'Markdown 图像预览',
    description: '让文字有个好看的样子。预览 Markdown，导出为图片。',
    url: 'http://markdown-viewer.chenyy.cc',
    domain: 'markdown-viewer.chenyy.cc',
  },
  {
    no: 'M—02',
    title: 'Same words, new form.',
    label: '繁简转换',
    description: '繁与简之间，意思不变。给文字换一种写法。',
    url: 'http://hanzi.chenyy.cc',
    domain: 'hanzi.chenyy.cc',
  },
  {
    no: 'M—03',
    title: 'A shorter way there.',
    label: '短链接管理',
    description: '把长长的地址，折成一个小小的入口。',
    url: 'http://chenyy.cc/url-admin',
    domain: 'chenyy.cc/url-admin',
  },
];

function SectionHead({ id, zh, en, note }: { id: string; zh: string; en: string; note: string }) {
  return (
    <div className="section-head">
      <h2 id={id} className="section-title">
        <i className="square" aria-hidden="true" />
        {zh} <span>/ {en}</span>
      </h2>
      <span className="section-note">{note}</span>
    </div>
  );
}

function CardTop({ category }: { category: string }) {
  return (
    <div className="card-topline">
      <span className="card-category">{category}</span>
      <span className="card-arrow" aria-hidden="true">
        <ArrowUpRight size={18} strokeWidth={1.5} />
      </span>
    </div>
  );
}

export default function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isCryptoOpen, setIsCryptoOpen] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [starTurns, setStarTurns] = useState(0);
  const { theme, toggle } = useTheme();
  const time = useShenzhenTime();

  const anyOpen = isContactOpen || isDonationOpen || isCryptoOpen || qrImage !== null;

  // Esc peels off the top-most layer; single keys open the four doors.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (e.key === 'Escape') {
        if (qrImage) setQrImage(null);
        else if (isCryptoOpen) setIsCryptoOpen(false);
        else if (isContactOpen) setIsContactOpen(false);
        else if (isDonationOpen) setIsDonationOpen(false);
        return;
      }
      if (anyOpen) return;
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea')) return;
      switch (e.key.toLowerCase()) {
        case 'c':
          setIsContactOpen(true);
          break;
        case 'd':
          setIsDonationOpen(true);
          break;
        case 'g':
          window.open(GITHUB_URL, '_blank', 'noopener,noreferrer');
          break;
        case 'p':
          window.open(PROJECTS_URL, '_blank', 'noopener,noreferrer');
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [anyOpen, qrImage, isCryptoOpen, isContactOpen, isDonationOpen]);

  const awake =
    time.hour < 7 ? '大概在睡觉 · probably asleep' : time.hour >= 23 ? '该睡了 · should be asleep' : '醒着，大概 · awake, probably';

  return (
    <>
      <div className="shell">
        <header className="site-header" style={{ '--turns': starTurns } as React.CSSProperties}>
          <a className="wordmark" href="#top" aria-label="chenyy.cc">
            <Star className="brand-mark" />
            <span>
              chenyy<span className="wordmark-dot">.</span>cc
            </span>
          </a>
          <nav className="site-nav" aria-label="页面导航 / Sections">
            <a href="#about">关于 About</a>
            <a href="#doors">去处 Doors</a>
            <a href="#made">作品 Made</a>
            <a href="#goal">球门 Goal</a>
          </nav>
          <button
            type="button"
            className="round-btn theme-toggle"
            onClick={() => {
              toggle();
              setStarTurns((n) => n + 1);
            }}
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
          </button>
        </header>

        <main id="top">
          {/* ---------- hero ---------- */}
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">
                <i className="square" aria-hidden="true" />
                01 / A FACE BEHIND THE LINKS
              </p>
              <h1 className="display">
                Hi! Welcome to <em>ChenYY</em>
                <Spiral className="glyph-spiral" />
                <span className="sr-only">🌀</span>'s site!
              </h1>
              <p className="hero-sub" lang="zh-CN">
                互联网里的另一面。
                <br />
                一个不太愿意待在轨道里的人。
              </p>
              <a className="hero-next" href="#about">
                <span className="hero-next-arrow">↓</span> 随好奇心，往下看
              </a>
            </div>

            <figure className="hero-figure">
              <OrbitFigure />
              <figcaption>
                <span>FIG. 01 — A SMALL UNIVERSE, NOT TO SCALE</span>
                <span>22°32′N 114°03′E</span>
              </figcaption>
            </figure>
          </section>

          {/* ---------- about ---------- */}
          <section className="section" aria-labelledby="about">
            <SectionHead id="about" zh="关于" en="ABOUT" note="02 / WHO, ROUGHLY" />
            <div className="about">
              <div>
                <p className="statement">
                  Lives in Shenzhen. Writes a little code. <em>Keeps</em> a little goal.
                </p>
                <p className="lede" lang="zh-CN">
                  住在深圳，写一点代码，守一点球门。对很多事情好奇，对含糊的答案不太客气——包括我自己的。
                </p>
              </div>

              <dl className="spec">
                <div>
                  <dt>Based in</dt>
                  <dd>
                    深圳 Shenzhen <small>22°32′N 114°03′E</small>
                  </dd>
                </div>
                <div>
                  <dt>Local time</dt>
                  <dd>
                    <span className="clock">{time.text}</span> <small>UTC+8 · {awake}</small>
                  </dd>
                </div>
                <div>
                  <dt>Position</dt>
                  <dd>
                    守门员 Goalkeeper <small>最后一道防线 · the last line</small>
                  </dd>
                </div>
                <div>
                  <dt>Writes</dt>
                  <dd>
                    TypeScript · React <small>和一些半成品 · and some half-finished things</small>
                  </dd>
                </div>
                <div>
                  <dt>Speaks</dt>
                  <dd>中文 · English</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* ---------- doors ---------- */}
          <section className="section" aria-labelledby="doors">
            <SectionHead id="doors" zh="去处" en="DOORS" note="03 / FOUR DOORS, A FEW POSSIBILITIES" />
            <p className="statement statement-narrow">
              Four doors. <em>Pick one.</em>
            </p>

            <div className="doors">
              <a className="door door-solid span-3" href={PROJECTS_URL} target="_blank" rel="noopener noreferrer">
                <CardTop category="01 / IDEAS, INDEXED" />
                <CardArtwork kind="projects" />
                <div className="card-copy">
                  <span className="card-label">我的项目 · My Projects</span>
                  <h3>Every door, one page.</h3>
                  <p>所有小工具与实验的总入口。</p>
                </div>
                <span className="card-domain">navigation.chenyy.cc</span>
              </a>

              <a className="door door-outline span-3" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <CardTop category="02 / OPEN SOURCE, OPEN ENDED" />
                <CardArtwork kind="github" />
                <div className="card-copy">
                  <span className="card-label">代码与实验 · My Github Page</span>
                  <h3>Ideas, in source code.</h3>
                  <p>把「如果可以」写成代码。完成的、未完成的，都在这里。</p>
                </div>
                <span className="card-domain">github.com/chenyy1069</span>
              </a>

              <button type="button" className="door span-4" onClick={() => setIsContactOpen(true)}>
                <CardTop category="03 / SAY HELLO" />
                <CardArtwork kind="contact" />
                <div className="card-copy">
                  <span className="card-label">联系方式 · Contact</span>
                  <h3>Say hello, any channel.</h3>
                  <p>邮件、Telegram、微信、Facebook。点一下就能复制。</p>
                </div>
                <span className="card-domain">1@chenyy.cc</span>
              </button>

              <button type="button" className="door span-2" onClick={() => setIsDonationOpen(true)}>
                <CardTop category="04 / FUEL" />
                <CardArtwork kind="donate" />
                <div className="card-copy">
                  <span className="card-label">打赏 · Donate</span>
                  <h3>Keep me in orbit.</h3>
                  <p>支付宝、微信支付，或加密货币。</p>
                </div>
                <span className="card-domain">alipay · wechat · crypto</span>
              </button>
            </div>
          </section>

          {/* ---------- made ---------- */}
          <section className="section" aria-labelledby="made">
            <SectionHead id="made" zh="作品" en="MADE" note="04 / SMALL TOOLS, MADE TO BE USED" />
            <p className="statement statement-narrow">
              Small tools, for <em>real</em> itches.
            </p>
            <ol className="made">
              {MADE.map((m) => (
                <li key={m.no}>
                  <a className="made-row" href={m.url} target="_blank" rel="noopener noreferrer">
                    <span className="made-no">{m.no}</span>
                    <span className="made-title">{m.title}</span>
                    <span className="made-desc">
                      <b>{m.label}</b>
                      {m.description}
                    </span>
                    <span className="made-domain">{m.domain}</span>
                    <span className="card-arrow" aria-hidden="true">
                      <ArrowUpRight size={18} strokeWidth={1.5} />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------- goal ---------- */}
          <section className="section" aria-labelledby="goal">
            <SectionHead id="goal" zh="球门" en="BETWEEN THE POSTS" note="05 / FIG. 02 — 7.32 × 2.44 M" />
            <div className="goal">
              <div className="goal-copy">
                <p className="statement">
                  Saves, <em>not</em> goals.
                </p>
                <p className="lede" lang="zh-CN">
                  守门员的快乐不是进球，是让球进不去。五个点球，移动鼠标、手指或方向键去扑。
                </p>
              </div>
              <PenaltyGame />
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <p className="signoff">
            A little out of <em>orbit.</em>
          </p>
          <div className="footer-row">
            <span>© {new Date().getFullYear()} ChenYY</span>
            <span>22°32′N 114°03′E · {time.text} UTC+8</span>
            <span className="footer-keys">KEYS — C · D · G · P</span>
          </div>
        </footer>
      </div>

      {/* Modals & Overlays, stacked by z-index: donation 40 < contact 50 < crypto 60 < QR 70 */}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      <DonationOverlay
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        onOpenCrypto={() => setIsCryptoOpen(true)}
        onShowImage={(url) => setQrImage(url)}
      />

      <CryptoModal isOpen={isCryptoOpen} onClose={() => setIsCryptoOpen(false)} />

      <ImagePopup imageUrl={qrImage} onClose={() => setQrImage(null)} />
    </>
  );
}
