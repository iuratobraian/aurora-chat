import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface NotificationCenterProps {
  userId: string;
  compact?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, compact = false }) => {
  const [showAll, setShowAll] = useState(false);
  const notifications = useQuery(api.whatsappCron.getAllNotifications, { userId }) || [];
  const stats = useQuery(api.whatsappCron.getNotificationStats);
  const markAsRead = useMutation(api.whatsappCron.queueCustomNotificationPublic as any);

  const filtered = notifications.filter((n: any) => n.userId === userId);
  const unread = filtered.filter((n: any) => !n.read).length;
  const display = showAll ? filtered : filtered.slice(0, 10);

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      achievement: 'emoji_events',
      signal: 'notifications_active',
      payment: 'payments',
      course: 'school',
      membership: 'card_membership',
      system: 'settings',
      welcome: 'waving_hand',
    };
    return icons[type] || 'notifications';
  };

  const getColor = (type: string) => {
    const colors: Record<string, string> = {
      achievement: 'text-yellow-400',
      signal: 'text-green-400',
      payment: 'text-blue-400',
      course: 'text-purple-400',
      membership: 'text-pink-400',
      system: 'text-gray-400',
      welcome: 'text-primary',
    };
    return colors[type] || 'text-white/60';
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowAll(!showAll)}
          className="relative p-2 rounded-xl hover:bg-white/5 transition-all"
        >
          <span className="material-symbols-outlined text-white/60">notifications</span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">notifications</span>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Notificaciones</h3>
            <p className="text-[10px] text-gray-500">{unread} sin leer</p>
          </div>
        </div>
        {stats && (
          <div className="flex gap-4 text-[10px] text-gray-500">
            <span>Total: {stats.total || 0}</span>
            <span>Leídas: {stats.read || 0}</span>
          </div>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {display.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">notifications_none</span>
            <p className="text-sm text-gray-500">No hay notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {display.map((notif: any) => (
              <div
                key={notif._id}
                className={`p-4 flex items-start gap-3 transition-all hover:bg-white/5 ${
                  !notif.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className={`size-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined text-sm ${getColor(notif.type)}`}>
                    {getIcon(notif.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{notif.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.body}</p>
                  <p className="text-[9px] text-gray-600 mt-1">{formatTime(notif.createdAt)}</p>
                </div>
                {!notif.read && (
                  <span className="size-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {filtered.length > 10 && (
        <div className="px-6 py-3 border-t border-white/5">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-xs text-primary font-bold hover:text-blue-400 transition-all"
          >
            {showAll ? 'Ver menos' : `Ver todas (${filtered.length})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
