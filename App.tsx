import { useState } from 'react';
import { TypingTitle } from './components/TypingTitle';
import { ContactModal } from './components/modals/ContactModal';
import { DonationOverlay } from './components/overlays/DonationOverlay';
import { CryptoModal } from './components/modals/CryptoModal';
import { ImagePopup } from './components/overlays/ImagePopup';
import { InteractiveBackground } from './components/InteractiveBackground';
import { Mail, DollarSign } from 'lucide-react';

export default function App() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isCryptoOpen, setIsCryptoOpen] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <InteractiveBackground />
      
      {/* Main Card */}
      <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl p-8 md:p-12 text-center relative z-10 transition-all duration-300 hover:shadow-3xl transform hover:-translate-y-1">
        
        <div className="mb-10 min-h-[4rem] flex items-center justify-center">
          <TypingTitle text="Hi! Welcome to Chenyy's site!" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          <button
            onClick={() => setIsContactOpen(true)}
            className="group flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all duration-200 w-full sm:w-auto transform active:scale-95"
          >
            <Mail className="w-5 h-5 group-hover:animate-bounce" />
            <span>Contact</span>
          </button>

          <button
            onClick={() => setIsDonationOpen(true)}
            className="group flex items-center justify-center gap-2 px-8 py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-xl font-semibold shadow-lg shadow-amber-100 transition-all duration-200 w-full sm:w-auto transform active:scale-95"
          >
            <DollarSign className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Donate</span>
          </button>
        </div>
      </div>

      {/* Footer / Background decorative elements */}
      <div className="fixed -bottom-32 -right-32 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      {/* Modals & Overlays */}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      
      <DonationOverlay 
        isOpen={isDonationOpen} 
        onClose={() => setIsDonationOpen(false)}
        onOpenCrypto={() => setIsCryptoOpen(true)}
        onShowImage={(url) => setQrImage(url)}
      />

      {/* Crypto Modal sits on top of Donation Overlay ideally, handled by z-index in component */}
      <CryptoModal isOpen={isCryptoOpen} onClose={() => setIsCryptoOpen(false)} />

      <ImagePopup imageUrl={qrImage} onClose={() => setQrImage(null)} />

    </div>
  );
}