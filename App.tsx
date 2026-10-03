import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Moon, Sun } from 'lucide-react';
import { ContactModal } from './components/modals/ContactModal';
import { DonationOverlay } from './components/overlays/DonationOverlay';
import { CryptoModal } from './components/modals/CryptoModal';
import { ImagePopup } from './components/overlays/ImagePopup';
import { Spiral, Star } from './components/Artwork';
import { Orbit } from './components/Orbit';
import { useTheme } from './components/hooks';

const GITHUB_URL = 'https://github.com/chenyy1069';
const PROJECTS_URL = 'https://navigation.chenyy.cc';

function LinkBody({ no, label, zh, meta }: { no: string; label: string; zh: string; meta: string }) {
  return (
    <>
      <span className="link-no">{no}</span>
      <span className="link-label">
        {label}
        <small lang="zh-CN">{zh}</small>
      </span>
      <span className="link-meta">{meta}</span>
      <span className="card-arrow" aria-hidden="true">
        <ArrowUpRight size={18} strokeWidth={1.5} />
      </span>
    </>
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

  // Esc peels off the top-most layer; single keys open the four links.
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
      if ((e.target as HTMLElement).closest('input, textarea')) return;
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
          <span className="wordmark">
            <Star className="brand-mark" />
            <span>
              chenyy<span className="wordmark-dot">.</span>cc
            </span>
          </span>
          <button
            type="button"
            className="round-btn"
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

        <main className="card">
          <div className="card-copy">
            <h1 className="display">
              Hi! Welcome to <em>ChenYY</em>
              <Spiral className="glyph-spiral" />
              <span className="sr-only">🌀</span>'s site!
            </h1>

            <nav className="links" aria-label="Links">
              <button type="button" className="link" onClick={() => setIsContactOpen(true)}>
                <LinkBody no="01" label="Contact" zh="联系" meta="1@chenyy.cc" />
              </button>
              <button type="button" className="link" onClick={() => setIsDonationOpen(true)}>
                <LinkBody no="02" label="Donate" zh="打赏" meta="alipay · wechat · crypto" />
              </button>
              <a className="link" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <LinkBody no="03" label="My Github Page" zh="代码" meta="github.com/chenyy1069" />
              </a>
              <a className="link" href={PROJECTS_URL} target="_blank" rel="noopener noreferrer">
                <LinkBody no="04" label="My Projects" zh="项目" meta="navigation.chenyy.cc" />
              </a>
            </nav>
          </div>

          <Orbit />
        </main>

        <footer className="site-footer">
          <span>© {new Date().getFullYear()} ChenYY</span>
          <span className="footer-keys">KEYS — C · D · G · P</span>
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
