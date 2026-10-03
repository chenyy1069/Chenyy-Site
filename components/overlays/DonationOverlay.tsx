import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, ChevronDown, Wallet, Smartphone, CreditCard, LucideIcon } from 'lucide-react';

interface DonationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCrypto: () => void;
  onShowImage: (url: string) => void;
}

const Method = ({ no, icon: Icon, label, onClick }: { no: string; icon: LucideIcon; label: string; onClick: () => void }) => (
  <button className="method" onClick={onClick}>
    <span className="method-no">{no}</span>
    <Icon size={18} strokeWidth={1.5} />
    <span className="method-label">{label}</span>
    <span className="card-arrow" aria-hidden="true">
      <ArrowUpRight size={16} strokeWidth={1.5} />
    </span>
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
    <div className="donate" role="dialog" aria-modal="true" aria-label="Donate">
      <div className="donate-bar">
        <button
          className="pill"
          onClick={() => {
            setShowMethods(false);
            onClose();
          }}
          autoFocus
        >
          <ArrowLeft size={15} strokeWidth={1.5} />
          Back
        </button>
        <span className="donate-note">02 / DONATE</span>
      </div>

      <div className="donate-body">
        <span className="donate-emoji">😁</span>
        <p className="donate-headline">
          Wanna donate some money to me? <em>Sure!</em>
        </p>

        <button
          className={`pill pill-ink ${showMethods ? 'is-open' : ''}`}
          onClick={() => setShowMethods(!showMethods)}
          aria-expanded={showMethods}
        >
          <span>Show Method</span>
          <ChevronDown size={16} strokeWidth={1.5} className="chev" />
        </button>

        <div className={`methods ${showMethods ? 'is-open' : ''}`}>
          <div className="methods-inner">
            <Method no="A" icon={Smartphone} label="AliPay" onClick={() => onShowImage('https://res.chenyy.cc/alipay.jpg')} />
            <Method no="B" icon={CreditCard} label="WechatPay" onClick={() => onShowImage('https://res.chenyy.cc/wechatpay.jpg')} />
            <Method no="C" icon={Wallet} label="Cryptos" onClick={onOpenCrypto} />
          </div>
        </div>
      </div>
    </div>
  );
};
