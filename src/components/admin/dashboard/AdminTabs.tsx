import React from 'react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  badge?: number;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      active
        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
    }`}
  >
    <span className="material-symbols-outlined text-base">{icon}</span>
    <span>{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="ml-1 bg-red-500/20 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

export const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'users', label: 'Usuarios', icon: 'group' },
  { id: 'communities', label: 'Comunidades', icon: 'groups' },
  { id: 'posts', label: 'Contenido', icon: 'article' },
  { id: 'ads', label: 'Ads', icon: 'campaign' },
  { id: 'propFirms', label: 'Prop Firms', icon: 'account_balance' },
  { id: 'referrals', label: 'Referidos', icon: 'group_add' },
  { id: 'aiAgent', label: 'AI Agent', icon: 'smart_toy' },
  { id: 'marketing', label: 'Marketing', icon: 'campaign' },
  { id: 'moderation', label: 'Moderación', icon: 'gavel' },
  { id: 'bitacora', label: 'Bitácora', icon: 'menu_book' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'chat' },
  { id: 'config', label: 'Ajustes', icon: 'settings' },
  { id: 'agentPrompts', label: 'Agent Prompts', icon: 'psychology' },
];
