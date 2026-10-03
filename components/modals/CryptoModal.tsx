import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Panel } from './Panel';
import { useCopy } from '../useCopy';

interface CryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CryptoItem = ({ label, address, color }: { label: string; address: string; color: string }) => {
  const { copied, copy } = useCopy();

  return (
    <div className="crypto" style={{ '--c': color } as React.CSSProperties}>
      <div className="crypto-label">
        <span>{label}</span>
        {copied && <span className="copied">Copied</span>}
      </div>
      <button className="crypto-address" onClick={() => copy(address)} title="Click to copy">
        <span>{address}</span>
        <span className="row-action">{copied ? <Check size={15} /> : <Copy size={15} />}</span>
      </button>
    </div>
  );
};

export const CryptoModal: React.FC<CryptoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Panel title="Crypto Addresses" footer="Click address to copy to clipboard" zIndex={60} wide onClose={onClose}>
      <div className="crypto-list">
        <CryptoItem label="Bitcoin" address="Bc1quekrfj6mh76d8kgjmqtmh24ffa34ha5fsydjzy" color="#f7a94a" />
        <CryptoItem label="Ethereum" address="0x80AD0861b4c68dC9b9de0eB88A135e89CB08F974" color="#9b9bff" />
        <CryptoItem label="Tron" address="TAxTAe8o4vh3CKxADTJtjDCDW5nJjbSEYs" color="#ff6a6a" />
      </div>
    </Panel>
  );
};
