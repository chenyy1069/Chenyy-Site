import React, { useState } from 'react';
import { X, Mail, MessageCircle, Facebook, Copy, Check, LucideIcon } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  colorClass: string;
  bgClass: string;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon: Icon, label, value, colorClass, bgClass }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={handleCopy}
      className="group relative flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer active:scale-[0.98]"
      title="Click to copy"
    >
      <div className={`p-2.5 rounded-full transition-colors ${bgClass} ${colorClass}`}>
        <Icon size={20} />
      </div>
      
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">{label}</p>
          {copied && (
            <span className="text-xs text-green-600 font-medium animate-pulse flex items-center gap-1">
              <Check size={10}/> Copied
            </span>
          )}
        </div>
        <p className="text-gray-800 font-medium font-mono text-sm sm:text-base break-all">{value}</p>
      </div>

      <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
      </div>
    </div>
  );
};

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Contact Info</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-2">
          <ContactItem 
            icon={Mail} 
            label="Email" 
            value="1@chenyy.cc" 
            colorClass="text-blue-600" 
            bgClass="bg-blue-100 group-hover:bg-blue-200"
          />

          <ContactItem 
            icon={MessageCircle} 
            label="Telegram" 
            value="@Chenyy1069" 
            colorClass="text-sky-600" 
            bgClass="bg-sky-100 group-hover:bg-sky-200"
          />

          <ContactItem 
            icon={Facebook} 
            label="Facebook" 
            value="@Chenyy1069" 
            colorClass="text-indigo-600" 
            bgClass="bg-indigo-100 group-hover:bg-indigo-200"
          />
        </div>
        
        <div className="bg-gray-50 p-3 text-center text-xs text-gray-400 border-t border-gray-100">
          Click an item to copy
        </div>
      </div>
    </div>
  );
};