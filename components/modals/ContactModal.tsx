import React from 'react';
import { Mail, MessageCircle, Facebook, Copy, Check, LucideIcon, MessageSquareText } from 'lucide-react';
import { Panel } from './Panel';
import { useCopy } from '../useCopy';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon: Icon, label, value, color }) => {
  const { copied, copy } = useCopy();

  return (
    <button
      className="row"
      style={{ '--c': color } as React.CSSProperties}
      onClick={() => copy(value)}
      title="Click to copy"
    >
      <span className="row-icon">
        <Icon size={17} />
      </span>
      <span className="row-text">
        <span className="row-label">
          {label}
          {copied && <span className="copied">Copied</span>}
        </span>
        <span className="row-value">{value}</span>
      </span>
      <span className="row-action">{copied ? <Check size={16} /> : <Copy size={16} />}</span>
    </button>
  );
};

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Panel title="Contact Info" footer="Click an item to copy" zIndex={50} onClose={onClose}>
      <ContactItem icon={Mail} label="Email" value="1@chenyy.cc" color="#7ee6ff" />
      <ContactItem icon={MessageCircle} label="Telegram" value="@Chenyy1069" color="#5cb6ff" />
      <ContactItem icon={MessageSquareText} label="WeChat" value="@19129958669" color="#3ddc97" />
      <ContactItem icon={Facebook} label="Facebook" value="@Chenyy1069" color="#a58bff" />
    </Panel>
  );
};
