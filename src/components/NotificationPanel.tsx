import React, { memo } from 'react';
import { Notificacion } from '../types';
import { Avatar } from './Avatar';

interface NotificationPanelProps {
  notifications: Notificacion[];
  unreadCount: number;
  onRead: (notif: Notificacion) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = memo(({ notifications, unreadCount, onRead }) => {
  return (
    <div className="absolute right-0 top-full mt-2 w-72 glass rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500 z-[60] bg-white/90 dark:bg-black/90 backdrop-blur-3xl border border-white/10">
      <div className="p-3 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500">Notificaciones</h4>
        <span className="text-[9px] text-blue-500 font-bold">{unreadCount} nuevas</span>
      </div>
      <div className="max-h-64 overflow-y-auto no-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-[9px] font-black uppercase tracking-widest">Sin novedades</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => onRead(n)}
              className={`p-3 border-b border-gray-200 dark:border-white/5 flex gap-2 hover:bg-blue-500/5 transition-colors cursor-pointer group ${n.leida ? 'opacity-50' : ''}`}
            >
              <Avatar src={n.avatarUrl} name={n.mensaje} seed={n.id} size="sm" rounded="md" />
              <div className="flex-1">
                <p className="text-[10px] text-gray-700 dark:text-gray-300 leading-tight">{n.mensaje}</p>
                <p className="text-[8px] text-gray-500 font-bold mt-1 uppercase">{n.tiempo}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

NotificationPanel.displayName = 'NotificationPanel';

export default NotificationPanel;
