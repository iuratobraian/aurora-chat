import React, { memo } from 'react';
import { Notificacion } from '../types';
import { Avatar } from './Avatar';
import { NotificationCard } from './ui/NotificationCard';

interface NotificationPanelProps {
  notifications: Notificacion[];
  unreadCount: number;
  onRead: (notif: Notificacion) => void;
}

const typeMap: Record<string, 'system' | 'social' | 'trading' | 'payment'> = {
  system: 'system',
  social: 'social',
  trading: 'trading',
  payment: 'payment',
  streak: 'system',
  level_up: 'system',
  community: 'social',
  signal: 'trading',
};

const NotificationPanel: React.FC<NotificationPanelProps> = memo(({ notifications, unreadCount, onRead }) => {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 glass rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500 z-[60] bg-white/90 dark:bg-black/90 backdrop-blur-3xl border border-white/10">
      <div className="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Notificaciones</h4>
        <span className="text-xs text-blue-500 font-bold">{unreadCount} nuevas</span>
      </div>
      <div className="max-h-80 overflow-y-auto no-scrollbar p-2 space-y-2">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-xs font-black uppercase tracking-widest">Sin novedades</div>
        ) : (
          notifications.map(n => (
            <NotificationCard
              key={n.id}
              id={n.id}
              title={n.tipo.charAt(0).toUpperCase() + n.tipo.slice(1)}
              message={n.mensaje}
              type={typeMap[n.tipo] || 'system'}
              read={n.leida}
              timestamp={n.tiempo}
              onClick={() => onRead(n)}
            />
          ))
        )}
      </div>
    </div>
  );
});

NotificationPanel.displayName = 'NotificationPanel';

export default NotificationPanel;
