import React from 'react';
import { X } from 'lucide-react';

interface ImagePopupProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImagePopup: React.FC<ImagePopupProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="layer" style={{ zIndex: 70 }} onClick={onClose}>
      <figure className="qr" onClick={(e) => e.stopPropagation()}>
        <button className="round-btn qr-close" onClick={onClose} aria-label="Close" autoFocus>
          <X size={17} strokeWidth={1.5} />
        </button>
        <img src={imageUrl} alt="Payment QR Code" />
        <figcaption>FIG. — SCAN · 扫码</figcaption>
      </figure>
    </div>
  );
};
