import React from 'react';
import { X } from 'lucide-react';

interface PanelProps {
  title: string;
  footer?: string;
  zIndex: number;
  wide?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/** Shared shell for the dialogs: dimmed backdrop, glass panel, close button. */
export const Panel: React.FC<PanelProps> = ({ title, footer, zIndex, wide, onClose, children }) => (
  <div className="layer" style={{ zIndex }} onClick={onClose}>
    <div
      className={`panel ${wide ? 'panel-wide' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => e.stopPropagation()}
    >
      <header className="panel-head">
        <h2>{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close" autoFocus>
          <X size={18} />
        </button>
      </header>
      <div className="panel-body">{children}</div>
      {footer && <footer className="panel-foot">{footer}</footer>}
    </div>
  </div>
);
