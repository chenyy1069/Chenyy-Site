import React from 'react';
import { X } from 'lucide-react';

interface PanelProps {
  kicker: string;
  title: string;
  footer?: string;
  zIndex: number;
  wide?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/** Shared shell for the dialogs: a square paper sheet with a round close button. */
export const Panel: React.FC<PanelProps> = ({ kicker, title, footer, zIndex, wide, onClose, children }) => (
  <div className="layer" style={{ zIndex }} onClick={onClose}>
    <div
      className={`panel ${wide ? 'panel-wide' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => e.stopPropagation()}
    >
      <header className="panel-head">
        <div>
          <p className="panel-kicker">{kicker}</p>
          <h2>{title}</h2>
        </div>
        <button className="round-btn" onClick={onClose} aria-label="Close" autoFocus>
          <X size={17} strokeWidth={1.5} />
        </button>
      </header>
      <div className="panel-body">{children}</div>
      {footer && <footer className="panel-foot">{footer}</footer>}
    </div>
  </div>
);
