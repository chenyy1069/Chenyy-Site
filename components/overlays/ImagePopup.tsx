import React from 'react';
import { X } from 'lucide-react';

interface ImagePopupProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImagePopup: React.FC<ImagePopupProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 fade-in"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors z-[80]"
      >
        <X size={32} />
      </button>

      <div 
        className="relative max-w-full max-h-[85vh] overflow-hidden rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.15)] bg-white p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt="Payment QR Code" 
          className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-xl" 
        />
      </div>
    </div>
  );
};
