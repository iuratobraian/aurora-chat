import React, { memo, useState, useRef, useEffect } from 'react';

export type NotificationType = 'mention' | 'like' | 'comment' | 'follow' | 'achievement' | 'level_up' | 'system' | 'streak';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  link?: string;
  avatarUrl?: string;
  createdAt: number;
  data?: any;
}

interface NotificationsProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onRead: (notif: NotificationItem) => void;
  onMarkAllRead: () => void;
  onDelete?: (notifId: string) => void;
  onClose?: () => void;
  isOpen: boolean;
}

const NOTIFICATION_CONFIG: Record<NotificationType, { icon: string; color: string; bgColor: string }> = {
  mention: { icon: 'alternate_email', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  like: { icon: 'favorite', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  comment: { icon: 'chat_bubble', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  follow: { icon: 'person_add', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  achievement: { icon: 'emoji_events', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  level_up: { icon: 'trending_up', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  system: { icon: 'info', color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
  streak: { icon: 'local_fire_department', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
};

const formatTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString();
};

const NotificationBell: React.FC<{ count: number }> = memo(({ count }) => (
  <div className="relative">
    <span className="material-symbols-outlined text-xl">notifications</span>
    {count > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse shadow-lg shadow-red-500/50">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </div>
));

NotificationBell.displayName = 'NotificationBell';

const NotificationItemComponent: React.FC<{
  notification: NotificationItem;
  onRead: (notif: NotificationItem) => void;
  onDelete?: (notifId: string) => void;
}> = memo(({ notification, onRead, onDelete }) => {
  const config = NOTIFICATION_CONFIG[notification.type];
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`relative group p-3 border-b border-gray-200 dark:border-white/5 transition-all cursor-pointer hover:bg-gradient-to-r hover:from-transparent ${
        notification.read ? 'opacity-50 hover:opacity-70' : 'bg-blue-500/5 hover:from-blue-500/10'
      }`}
      onClick={() => onRead(notification)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        <div className={`relative size-10 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
          {notification.avatarUrl ? (
            <img src={notification.avatarUrl} className="size-10 rounded-xl object-cover" alt="" />
          ) : (
            <span className={`material-symbols-outlined ${config.color}`}>{config.icon}</span>
          )}
          <div className={`absolute -bottom-1 -right-1 size-4 rounded-full ${config.bgColor} flex items-center justify-center`}>
            <span className={`material-symbols-outlined text-xs ${config.color}`}>{config.icon}</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-xs font-black text-gray-900 dark:text-white truncate">{notification.title}</h5>
            <span className="text-[9px] text-gray-400 font-bold flex-shrink-0">{formatTime(notification.createdAt)}</span>
          </div>
          <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">{notification.body}</p>
          
          {!notification.read && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider">Nuevo</span>
            </div>
          )}
        </div>

        {showActions && onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
            className="absolute top-2 right-2 size-6 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-xs text-red-500">close</span>
          </button>
        )}
      </div>
    </div>
  );
});

NotificationItemComponent.displayName = 'NotificationItemComponent';

const Notifications: React.FC<NotificationsProps> = memo(({
  notifications,
  unreadCount,
  onRead,
  onMarkAllRead,
  onDelete,
  onClose,
  isOpen
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const groupedNotifications = {
    new: notifications.filter(n => !n.read),
    earlier: notifications.filter(n => n.read),
  };

  return (
    <div ref={panelRef} className="absolute right-0 top-full mt-2 w-80 glass rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500 z-[60] bg-white/95 dark:bg-[#0f1115]/95 backdrop-blur-3xl border border-white/10">
      <div className="p-3 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500">notifications_active</span>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">Notificaciones</h4>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[9px] text-blue-500 hover:text-blue-600 font-bold uppercase tracking-wider transition-colors"
            >
              Marcar todas leídas
            </button>
          )}
          <button onClick={onClose} className="size-6 rounded-lg hover:bg-gray-200 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-gray-500 text-sm">close</span>
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">notifications_off</span>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Sin novedades</p>
          </div>
        ) : (
          <>
            {groupedNotifications.new.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 sticky top-0">
                  Nuevas ({groupedNotifications.new.length})
                </div>
                {groupedNotifications.new.map(n => (
                  <NotificationItemComponent
                    key={n.id}
                    notification={n}
                    onRead={onRead}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
            
            {groupedNotifications.earlier.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 sticky top-0">
                  Anteriores ({groupedNotifications.earlier.length})
                </div>
                {groupedNotifications.earlier.map(n => (
                  <NotificationItemComponent
                    key={n.id}
                    notification={n}
                    onRead={onRead}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-2 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
        <button className="w-full py-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors">
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  );
});

Notifications.displayName = 'Notifications';

export { NotificationBell, NotificationItemComponent };
export default Notifications;
