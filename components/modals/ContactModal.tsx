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
}

const ContactItem: React.FC<ContactItemProps> = ({ icon: Icon, label, value }) => {
  const { copied, copy } = useCopy();

  return (
    <button className="row" onClick={() => copy(value)} title="Click to copy">
      <span className="row-icon">
        <Icon size={17} strokeWidth={1.5} />
      </span>
      <span className="row-text">
        <span className="row-label">
          {label}
          {copied && <span className="copied"><i className="square" aria-hidden="true" />Copied</span>}
        </span>
        <span className="row-value">{value}</span>
      </span>
      <span className="row-action">{copied ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}</span>
    </button>
  );
};

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Panel kicker="01 / CONTACT" title="Contact Info" footer="Click an item to copy" zIndex={50} onClose={onClose}>
      <ContactItem icon={Mail} label="Email" value="1@chenyy.cc" />
      <ContactItem icon={MessageCircle} label="Telegram" value="@Chenyy1069" />
      <ContactItem icon={MessageSquareText} label="WeChat" value="@19129958669" />
      <ContactItem icon={Facebook} label="Facebook" value="@Chenyy1069" />
    </Panel>
  );
};
