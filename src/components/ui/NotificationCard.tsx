import React from 'react';

interface NotificationCardProps {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'social' | 'trading' | 'payment';
  read?: boolean;
  timestamp: string;
  onClick?: () => void;
  className?: string;
}

const typeIcons = {
  system: 'settings',
  social: 'group',
  trading: 'trending_up',
  payment: 'payments',
};

const typeColors = {
  system: 'bg-blue-500',
  social: 'bg-purple-500',
  trading: 'bg-green-500',
  payment: 'bg-yellow-500',
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  message,
  type,
  read = false,
  timestamp,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass rounded-xl p-4 transition-all duration-300 cursor-pointer ${
        !read ? 'border-l-2 border-l-primary' : ''
      } hover:bg-white/5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full ${typeColors[type]} flex items-center justify-center flex-shrink-0`}>
          <span className="material-symbols-outlined text-white text-sm">
            {typeIcons[type]}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-white text-sm truncate">{title}</h4>
            <span className="text-xs text-gray-500 flex-shrink-0">{timestamp}</span>
          </div>
          <p className="text-gray-300 text-sm mt-1 line-clamp-2">{message}</p>
        </div>
        
        {!read && (
          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
        )}
      </div>
    </div>
  );
};
