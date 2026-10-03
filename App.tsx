import React, { useEffect, useState } from 'react';
import { TypingTitle } from './components/TypingTitle';
import { HoloCard } from './components/HoloCard';
import { ContactModal } from './components/modals/ContactModal';
import { DonationOverlay } from './components/overlays/DonationOverlay';
import { CryptoModal } from './components/modals/CryptoModal';
import { ImagePopup } from './components/overlays/ImagePopup';
import { InteractiveBackground, emitVortex } from './components/InteractiveBackground';
import { Mail, DollarSign, Github, Globe, ArrowUpRight } from 'lucide-react';

const GITHUB_URL = 'https://github.com/chenyy1069';
const PROJECTS_URL = 'https://navigation.chenyy.cc';

export default function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isCryptoOpen, setIsCryptoOpen] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);

  const anyOpen = isContactOpen || isDonationOpen || isCryptoOpen || qrImage !== null;

  // Esc peels off the top-most layer; single keys open things from the card.
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

  // Clicking empty space sends a ripple through the vortex.
  const handleStagePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.card-wrap')) return;
    emitVortex({ type: 'wave', x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <InteractiveBackground />
      <div className="grain" aria-hidden="true" />

      <main className="stage" onPointerDown={handleStagePointerDown}>
        <HoloCard>
          <div className="card-head">
            <span><i className="dot" />chenyy.cc</span>
            <span>N° 1069</span>
          </div>

          <TypingTitle text="Hi! Welcome to ChenYY🌀's site!" accent="ChenYY" />

          <nav className="actions">
            <button className="action" style={{ '--c': 'var(--cyan)' } as React.CSSProperties} onClick={() => setIsContactOpen(true)}>
              <Mail size={16} />
              <span>Contact</span>
              <kbd>C</kbd>
            </button>

            <button className="action" style={{ '--c': 'var(--amber)' } as React.CSSProperties} onClick={() => setIsDonationOpen(true)}>
              <DollarSign size={16} />
              <span>Donate</span>
              <kbd>D</kbd>
            </button>

            <a className="action" style={{ '--c': 'var(--ink)' } as React.CSSProperties} href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Github size={16} />
              <span>My Github Page<ArrowUpRight size={12} className="out" /></span>
              <kbd>G</kbd>
            </a>

            <a className="action" style={{ '--c': 'var(--violet)' } as React.CSSProperties} href={PROJECTS_URL} target="_blank" rel="noopener noreferrer">
              <Globe size={16} />
              <span>My Projects<ArrowUpRight size={12} className="out" /></span>
              <kbd>P</kbd>
            </a>
          </nav>
        </HoloCard>

        <footer className="corners" aria-hidden="true">
          <span>© {new Date().getFullYear()} ChenYY</span>
          <span className="hint">
            <span className="hint-fine">click the void ✦</span>
            <span className="hint-touch">tap the void ✦</span>
          </span>
        </footer>
      </main>

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
