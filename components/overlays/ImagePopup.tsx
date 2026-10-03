import React from 'react';
import { X } from 'lucide-react';

interface ImagePopupProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImagePopup: React.FC<ImagePopupProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="layer layer-dark" style={{ zIndex: 70 }} onClick={onClose}>
      <button className="icon-btn icon-btn-float" onClick={onClose} aria-label="Close" autoFocus>
        <X size={22} />
      </button>

      <div className="qr" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Payment QR Code" />
      </div>
    </div>
  );
};
