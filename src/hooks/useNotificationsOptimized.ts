import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { StorageService } from '../services/storage';
import logger from '../utils/logger';

interface CachedNotification {
  id: string;
  userId: string;
  tipo: string;
  title: string;
  mensaje: string;
  leida: boolean;
  tiempo: string;
  link?: string;
  avatarUrl?: string;
  createdAt: number;
  data?: unknown;
}

interface NotificationCache {
  notifications: CachedNotification[];
  lastFetch: number;
  lastNotifId: string | null;
}

const CACHE_KEY = 'notification_cache_optimized';
const CACHE_TTL = 5 * 60 * 1000;
const MIN_REFRESH_INTERVAL = 10000;

const getCache = (): NotificationCache | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    const age = Date.now() - parsed.lastFetch;
    if (age > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const setCache = (cache: NotificationCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage unavailable
  }
};

interface UseNotificationsOptimizedOptions {
  userId: string | null;
  isPanelOpen: boolean;
  onNewNotification?: (notification: CachedNotification) => void;
}

interface UseNotificationsOptimizedReturn {
  notifications: CachedNotification[];
  unreadCount: number;
  isLoading: boolean;
  lastUpdated: number | null;
  markAsRead: (notifId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

export const useNotificationsOptimized = ({
  userId,
  isPanelOpen,
  onNewNotification
}: UseNotificationsOptimizedOptions): UseNotificationsOptimizedReturn => {
  const [notifications, setNotifications] = useState<CachedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const lastFetchRef = useRef<number>(0);
  const isFetchingRef = useRef(false);
  const fetchOnOpenRef = useRef(false);

  const loadFromCache = useCallback(() => {
    const cache = getCache();
    if (cache && cache.notifications.length > 0) {
      setNotifications(cache.notifications);
      setUnreadCount(cache.notifications.filter(n => !n.leida).length);
      setLastUpdated(cache.lastFetch);
      return true;
    }
    return false;
  }, []);

  const fetchNotifications = useCallback(async (force = false) => {
    if (!userId || userId === 'guest' || isFetchingRef.current) return;
    
    const now = Date.now();
    if (!force && now - lastFetchRef.current < MIN_REFRESH_INTERVAL) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const data = await StorageService.getNewNotifications(userId);
      
      if (data && data.length > 0) {
        const mapped: CachedNotification[] = data.map((n: any) => ({
          id: n.id || n._id,
          userId: n.userId,
          tipo: n.tipo || n.type || 'system',
          title: n.title || 'Notificación',
          mensaje: n.mensaje || n.body || '',
          leida: n.leida ?? n.read ?? false,
          tiempo: n.tiempo || formatTimeAgo(n.createdAt),
          link: n.link,
          avatarUrl: n.avatarUrl,
          createdAt: n.createdAt || Date.now(),
          data: n.data
        }));

        lastFetchRef.current = now;
        setNotifications(mapped);
        setUnreadCount(mapped.filter(n => !n.leida).length);
        setLastUpdated(now);

        setCache({
          notifications: mapped,
          lastFetch: now,
          lastNotifId: mapped[0]?.id || null
        });

        if (!force && mapped.length > 0) {
          const newest = mapped[0];
          const prevCache = getCache();
          if (prevCache?.lastNotifId && newest.id !== prevCache.lastNotifId) {
            onNewNotification?.(newest);
          }
        }
      }
    } catch (err) {
      logger.warn('Error fetching notifications:', err);
      loadFromCache();
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [userId, onNewNotification, loadFromCache]);

  const markAsRead = useCallback(async (notifId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notifId ? { ...n, leida: true } : n);
      const unread = updated.filter(n => !n.leida).length;
      setUnreadCount(unread);
      
      const cache = getCache();
      if (cache) {
        setCache({ ...cache, notifications: updated });
      }
      
      return updated;
    });

    try {
      await StorageService.markNotificationRead(notifId);
    } catch (err) {
      logger.warn('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, leida: true }));
      setUnreadCount(0);
      
      const cache = getCache();
      if (cache) {
        setCache({ ...cache, notifications: updated });
      }
      
      return updated;
    });

    if (userId && userId !== 'guest') {
      try {
        await StorageService.markAllNotificationsRead(userId);
      } catch (err) {
        logger.warn('Error marking all as read:', err);
      }
    }
  }, [userId]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setNotifications([]);
    setUnreadCount(0);
    setLastUpdated(null);
    lastFetchRef.current = 0;
  }, []);

  useEffect(() => {
    if (!userId || userId === 'guest') {
      clearCache();
      return;
    }

    const hasCache = loadFromCache();
    
    if (!hasCache || !lastUpdated) {
      fetchNotifications(true);
    }
  }, [userId, loadFromCache, fetchNotifications, clearCache, lastUpdated]);

  useEffect(() => {
    if (isPanelOpen && userId && userId !== 'guest') {
      const cache = getCache();
      const shouldFetch = !cache || Date.now() - cache.lastFetch > MIN_REFRESH_INTERVAL;
      
      if (shouldFetch && !fetchOnOpenRef.current) {
        fetchOnOpenRef.current = true;
        fetchNotifications(true).finally(() => {
          fetchOnOpenRef.current = false;
        });
      }
    }
  }, [isPanelOpen, userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    lastUpdated,
    markAsRead,
    markAllAsRead,
    refresh: () => fetchNotifications(true),
    clearCache
  };
};

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Ahora';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

export default useNotificationsOptimized;
