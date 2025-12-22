import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Wallet, Smartphone, CreditCard } from 'lucide-react';

interface DonationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCrypto: () => void;
  onShowImage: (url: string) => void;
}

export const DonationOverlay: React.FC<DonationOverlayProps> = ({ 
  isOpen, 
  onClose, 
  onOpenCrypto,
  onShowImage 
}) => {
  const [showMethods, setShowMethods] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-white fade-in">
      
      {/* Back Button */}
      <button 
        onClick={() => {
          setShowMethods(false);
          onClose();
        }}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Main Content */}
      <div className="text-center max-w-lg w-full space-y-8">
        <div className="space-y-4">
            <span className="text-6xl animate-bounce inline-block">😁</span>
            <p className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-blue-300">
                Wanna donate some money to me? Sure!
            </p>
        </div>

        <button 
          onClick={() => setShowMethods(!showMethods)}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-bold text-lg shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95"
        >
          <span>Show Method</span>
          {showMethods ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}
        </button>

        {/* Payment Options - Animated Reveal */}
        <div className={`
            flex flex-col items-center gap-4 w-full transition-all duration-500 ease-in-out overflow-hidden
            ${showMethods ? 'max-h-96 opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'}
        `}>
            <button 
              onClick={() => onShowImage('https://res.chenyy.cc/alipay.jpg')}
              className="w-full max-w-xs flex items-center justify-between px-6 py-4 bg-[#1677FF] hover:bg-[#4096ff] rounded-xl font-semibold shadow-lg transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Smartphone size={24} />
                <span>AliPay</span>
              </div>
              <span className="opacity-60">→</span>
            </button>

            <button 
              onClick={() => onShowImage('https://res.chenyy.cc/wechatpay.jpg')}
              className="w-full max-w-xs flex items-center justify-between px-6 py-4 bg-[#07C160] hover:bg-[#28d07e] rounded-xl font-semibold shadow-lg transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <CreditCard size={24} />
                <span>WechatPay</span>
              </div>
              <span className="opacity-60">→</span>
            </button>

            <button 
              onClick={onOpenCrypto}
              className="w-full max-w-xs flex items-center justify-between px-6 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold shadow-lg transition-all transform hover:-translate-y-1"
            >
               <div className="flex items-center gap-3">
                <Wallet size={24} />
                <span>Cryptos</span>
              </div>
              <span className="opacity-60">→</span>
            </button>
        </div>
      </div>
    </div>
  );
};
