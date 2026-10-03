import React from 'react';
import { ArrowUpRight, Wallet, Smartphone, CreditCard, LucideIcon } from 'lucide-react';
import { Panel } from './Panel';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCrypto: () => void;
  onShowImage: (url: string) => void;
}

const Method = ({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) => (
  <button className="method" onClick={onClick}>
    <span className="row-icon">
      <Icon size={17} strokeWidth={1.5} />
    </span>
    <span className="method-label">{label}</span>
    <span className="card-arrow" aria-hidden="true">
      <ArrowUpRight size={16} strokeWidth={1.5} />
    </span>
  </button>
);

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose, onOpenCrypto, onShowImage }) => {
  if (!isOpen) return null;

  return (
    <Panel kicker="02 / DONATE" title="Donate" zIndex={40} onClose={onClose}>
      <Method icon={Smartphone} label="AliPay" onClick={() => onShowImage('https://res.chenyy.cc/alipay.jpg')} />
      <Method icon={CreditCard} label="WechatPay" onClick={() => onShowImage('https://res.chenyy.cc/wechatpay.jpg')} />
      <Method icon={Wallet} label="Cryptos" onClick={onOpenCrypto} />
    </Panel>
  );
};
