import React from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CryptoItem = ({ label, address, colorClass }: { label: string; address: string; colorClass: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <div className="flex justify-between items-end mb-1">
        <span className={`text-xs font-bold uppercase tracking-wider ${colorClass}`}>{label}</span>
        {copied && <span className="text-xs text-green-600 font-medium animate-pulse flex items-center gap-1"><Check size={12}/> Copied</span>}
      </div>
      <div 
        className="bg-gray-50 border border-gray-200 rounded-lg p-3 pr-10 font-mono text-sm text-gray-600 break-all cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors relative"
        onClick={handleCopy}
        title="Click to copy"
      >
        {address}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500">
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </div>
      </div>
    </div>
  );
};

export const CryptoModal: React.FC<CryptoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md fade-in p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Crypto Addresses</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <CryptoItem 
            label="Bitcoin" 
            address="Bc1quekrfj6mh76d8kgjmqtmh24ffa34ha5fsydjzy" 
            colorClass="text-orange-500"
          />
          <CryptoItem 
            label="Ethereum" 
            address="0x80AD0861b4c68dC9b9de0eB88A135e89CB08F974" 
            colorClass="text-indigo-500"
          />
          <CryptoItem 
            label="Tron" 
            address="TAxTAe8o4vh3CKxADTJtjDCDW5nJjbSEYs" 
            colorClass="text-red-500"
          />
        </div>
        
        <div className="bg-gray-50 p-3 text-center text-xs text-gray-400">
          Click address to copy to clipboard
        </div>
      </div>
    </div>
  );
};
