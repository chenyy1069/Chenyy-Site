import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Panel } from './Panel';
import { useCopy } from '../useCopy';

interface CryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CryptoItem = ({ label, address }: { label: string; address: string }) => {
  const { copied, copy } = useCopy();

  return (
    <div className="crypto">
      <div className="crypto-label">
        <span>{label}</span>
        {copied && <span className="copied"><i className="square" aria-hidden="true" />Copied</span>}
      </div>
      <button className="crypto-address" onClick={() => copy(address)} title="Click to copy">
        <span>{address}</span>
        <span className="row-action">{copied ? <Check size={15} strokeWidth={1.5} /> : <Copy size={15} strokeWidth={1.5} />}</span>
      </button>
    </div>
  );
};

export const CryptoModal: React.FC<CryptoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Panel kicker="04 / FUEL — ON CHAIN" title="Crypto Addresses" footer="Click address to copy to clipboard" zIndex={60} wide onClose={onClose}>
      <div className="crypto-list">
        <CryptoItem label="Bitcoin" address="Bc1quekrfj6mh76d8kgjmqtmh24ffa34ha5fsydjzy" />
        <CryptoItem label="Ethereum" address="0x80AD0861b4c68dC9b9de0eB88A135e89CB08F974" />
        <CryptoItem label="Tron" address="TAxTAe8o4vh3CKxADTJtjDCDW5nJjbSEYs" />
      </div>
    </Panel>
  );
};
