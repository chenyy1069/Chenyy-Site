import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Wallet, Smartphone, CreditCard, LucideIcon } from 'lucide-react';

interface DonationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCrypto: () => void;
  onShowImage: (url: string) => void;
}

const Method = ({ icon: Icon, label, color, onClick }: { icon: LucideIcon; label: string; color: string; onClick: () => void }) => (
  <button className="method" style={{ '--c': color } as React.CSSProperties} onClick={onClick}>
    <span className="method-dot" />
    <Icon size={18} />
    <span className="method-label">{label}</span>
    <ArrowRight size={16} className="method-arrow" />
  </button>
);

export const DonationOverlay: React.FC<DonationOverlayProps> = ({
  isOpen,
  onClose,
  onOpenCrypto,
  onShowImage
}) => {
  const [showMethods, setShowMethods] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="donate">
      <button
        className="pill back"
        onClick={() => {
          setShowMethods(false);
          onClose();
        }}
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="donate-body">
        <span className="donate-emoji">😁</span>
        <p className="donate-headline">
          Wanna donate some money to me? <em>Sure!</em>
        </p>

        <button
          className={`pill pill-warm ${showMethods ? 'is-open' : ''}`}
          onClick={() => setShowMethods(!showMethods)}
          aria-expanded={showMethods}
        >
          <span>Show Method</span>
          <ChevronDown size={16} className="chev" />
        </button>

        <div className={`methods ${showMethods ? 'is-open' : ''}`}>
          <div className="methods-inner">
            <Method icon={Smartphone} label="AliPay" color="#1677ff" onClick={() => onShowImage('https://res.chenyy.cc/alipay.jpg')} />
            <Method icon={CreditCard} label="WechatPay" color="#07c160" onClick={() => onShowImage('https://res.chenyy.cc/wechatpay.jpg')} />
            <Method icon={Wallet} label="Cryptos" color="#a58bff" onClick={onOpenCrypto} />
          </div>
        </div>
      </div>
    </div>
  );
};
