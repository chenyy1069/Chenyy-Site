import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import { ContactModal } from './components/modals/ContactModal';
import { DonationOverlay } from './components/overlays/DonationOverlay';
import { CryptoModal } from './components/modals/CryptoModal';
import { ImagePopup } from './components/overlays/ImagePopup';
import { CardArtwork, OrbitFigure, Spiral, Star } from './components/Artwork';
import { OrbitLab } from './components/OrbitLab';
import { useTheme } from './components/hooks';

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

// Working propositions, numbered after the Tractatus (loosely): n.1 remarks on n.
const PROPOSITIONS = [
  { no: '1', en: '“I don’t know” is a complete answer.', zh: '「不知道」是一个完整的答案。' },
  { no: '1.1', en: 'A confident wrong answer is worse than an honest blank.', zh: '自信的错误，比诚实的空白更糟。' },
  { no: '2', en: 'Correct the premise before answering the question.', zh: '先修正前提，再回答问题。' },
  { no: '2.1', en: 'Including my own.', zh: '包括我自己的前提。' },
  { no: '3', en: 'Truth does not bend to whoever is louder.', zh: '真相不向更大的声音弯腰。' },
  { no: '3.1', en: 'Pressure is not an argument.', zh: '压力不是论据。' },
  { no: '4', en: 'Sharp is fine. Vague is not.', zh: '尖锐可以，含糊不行。' },
  { no: '5', en: 'A person is not a list of facts about them.', zh: '人不是一串关于自己的事实。' },
  { no: '6', en: 'Stay a little out of orbit.', zh: '留一点偏离轨道的余地。' },
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
            <a href="#propositions">命题 Propositions</a>
            <a href="#doors">去处 Doors</a>
            <a href="#made">作品 Made</a>
            <a href="#orbit">轨道 Orbit</a>
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
              <a className="hero-next" href="#propositions">
                <span className="hero-next-arrow">↓</span> 随好奇心，往下看
              </a>
            </div>

            <figure className="hero-figure">
              <OrbitFigure />
              <figcaption>
                <span>FIG. 01 — A SMALL UNIVERSE, NOT TO SCALE</span>
                <span>OBSERVER × 1</span>
              </figcaption>
            </figure>
          </section>

          {/* ---------- propositions ---------- */}
          <section className="section" aria-labelledby="propositions">
            <SectionHead id="propositions" zh="命题" en="PROPOSITIONS" note="02 / NUMBERED AFTER THE TRACTATUS, LOOSELY" />
            <div className="props-intro">
              <p className="statement">
                Working <em>propositions.</em>
              </p>
              <p className="lede" lang="zh-CN">
                不是信条，是目前还没被推翻的假设。随时修订。
              </p>
            </div>
            <ol className="props">
              {PROPOSITIONS.map((p) => (
                <li key={p.no} className={p.no.includes('.') ? 'is-remark' : ''}>
                  <span className="props-no">{p.no}</span>
                  <span className="props-text">
                    <span className="props-en">{p.en}</span>
                    <span className="props-zh" lang="zh-CN">{p.zh}</span>
                  </span>
                </li>
              ))}
            </ol>
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

          {/* ---------- orbit ---------- */}
          <section className="section" aria-labelledby="orbit">
            <SectionHead id="orbit" zh="轨道" en="ORBIT" note="05 / FIG. 02 — FALL, LEAVE, OR NEITHER" />
            <div className="orbit-section">
              <div className="orbit-copy">
                <p className="statement">
                  Falling, and <em>missing,</em> forever.
                </p>
                <p className="lede" lang="zh-CN">
                  轨道不是静止，是一直在坠落，又一直错过地面。速度太小会坠落，太大会离开；介于两者之间，才叫轨道。
                </p>
                <p className="lede" lang="zh-CN">
                  按住拖动，抛出一颗卫星。轻点一下，是一条完美的圆。
                </p>
              </div>
              <OrbitLab />
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <p className="signoff">
            A little out of <em>orbit.</em>
          </p>
          <div className="footer-row">
            <span>© {new Date().getFullYear()} ChenYY</span>
            <span>Subject to revision · 随时修订</span>
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
