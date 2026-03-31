import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { StorageService } from '../services/storage';
import { subscribeToPush, unsubscribe as unsubscribePush, isPushSupported, requestPushPermission } from '../../lib/pushNotifications';
import logger from '../utils/logger';

interface CachedNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  link?: string;
  avatarUrl?: string;
  createdAt: number;
  data?: any;
}

interface NotificationCache {
  notifications: CachedNotification[];
  lastFetch: number;
  lastNotifId: string | null;
}

const CACHE_KEY = 'notification_cache';
const POLL_INTERVAL = 30000;
const DEBOUNCE_DELAY = 2000;

const getCache = (): NotificationCache | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const setCache = (cache: NotificationCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full or unavailable
  }
};

const deduplicateNotifications = (incoming: CachedNotification[], existing: CachedNotification[]): CachedNotification[] => {
  const existingIds = new Set(existing.map(n => n.id));
  const newNotifications = incoming.filter(n => !existingIds.has(n.id));
  return [...newNotifications, ...existing].slice(0, 100);
};

export const useNotifications = (userId: string | null, isVisible: boolean = true) => {
  const [notifications, setNotifications] = useState<CachedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  
  const lastFetchRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  const convexNotifications = useQuery(
    userId && userId !== 'guest' ? api.notifications.getNotifications : null,
    userId ? { userId, limit: 50 } : undefined
  );

  const checkPushSupport = useCallback(() => {
    const supported = isPushSupported();
    setPushSupported(supported);
    return supported;
  }, []);

  const enablePush = useCallback(async (id: string) => {
    if (!id || id === 'guest') return;
    try {
      await requestPushPermission();
      await subscribeToPush(id);
      setPushEnabled(true);
    } catch (err) {
      logger.error('Failed to enable push notifications:', err);
      throw err;
    }
  }, []);

  const disablePush = useCallback(async (id: string) => {
    if (!id || id === 'guest') return;
    try {
      await unsubscribePush(id);
      setPushEnabled(false);
    } catch (err) {
      logger.error('Failed to disable push notifications:', err);
      throw err;
    }
  }, []);

  const loadFromCache = useCallback(() => {
    const cache = getCache();
    if (cache && cache.notifications.length > 0) {
      setNotifications(cache.notifications);
      setUnreadCount(cache.notifications.filter(n => !n.read).length);
      return cache;
    }
    return null;
  }, []);

  const fetchNotifications = useCallback(async (force: boolean = false) => {
    if (!userId || userId === 'guest' || isFetchingRef.current) return;
    
    const now = Date.now();
    if (!force && now - lastFetchRef.current < DEBOUNCE_DELAY) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const remote = await StorageService.getNewNotifications(userId);
      
      if (remote && remote.length > 0) {
        const mapped: CachedNotification[] = remote.map((n: any) => ({
          id: n.id || n._id,
          userId: n.userId,
          type: n.type || n.tipo || 'system',
          title: n.title || 'Notificación',
          body: n.body || n.mensaje || '',
          read: n.read ?? n.leida ?? false,
          link: n.link,
          avatarUrl: n.avatarUrl,
          createdAt: n.createdAt,
          data: n.data
        }));

        const cache = getCache();
        const existing = cache?.notifications || [];
        const deduplicated = deduplicateNotifications(mapped, existing);
        
        lastFetchRef.current = now;
        setNotifications(deduplicated);
        setUnreadCount(deduplicated.filter(n => !n.read).length);
        
        setCache({
          notifications: deduplicated,
          lastFetch: now,
          lastNotifId: deduplicated[0]?.id || null
        });
      }
    } catch (err) {
      logger.error('Error fetching notifications:', err);
      loadFromCache();
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId, loadFromCache]);

  const markAsRead = useCallback(async (notifId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notifId ? { ...n, read: true } : n);
      const cache = getCache();
      if (cache) {
        setCache({ ...cache, notifications: updated });
      }
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    try {
      await StorageService.markNotificationRead(notifId);
    } catch (err) {
      logger.error('Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      const cache = getCache();
      if (cache) {
        setCache({ ...cache, notifications: updated });
      }
      return updated;
    });
    setUnreadCount(0);
    
    if (userId && userId !== 'guest') {
      try {
        await StorageService.markAllNotificationsRead(userId);
      } catch (err) {
        logger.error('Error marking all as read:', err);
      }
    }
  }, [userId]);

  const deleteNotification = useCallback(async (notifId: string) => {
    const notif = notifications.find(n => n.id === notifId);
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notifId);
      const cache = getCache();
      if (cache) {
        setCache({ ...cache, notifications: updated });
      }
      return updated;
    });
    if (notif && !notif.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    try {
      await StorageService.deleteNotification(notifId);
    } catch (err) {
      logger.error('Error deleting notification:', err);
    }
  }, [notifications]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchNotifications(true);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    checkPushSupport();
  }, [checkPushSupport]);

  useEffect(() => {
    if (!userId || userId === 'guest') return;

    loadFromCache();
    fetchNotifications(true);

    if (isOnline) {
      pollIntervalRef.current = setInterval(() => {
        fetchNotifications(false);
      }, POLL_INTERVAL);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [userId, isOnline, fetchNotifications, loadFromCache]);

  useEffect(() => {
    if (isVisible && userId && userId !== 'guest') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        fetchNotifications(true);
      }, DEBOUNCE_DELAY);
    }
  }, [isVisible, userId, fetchNotifications]);

  useEffect(() => {
    if (convexNotifications && convexNotifications.length > 0) {
      const mapped: CachedNotification[] = convexNotifications.map((n: any) => ({
        id: n.id || n._id,
        userId: n.userId,
        type: n.type || n.tipo || 'system',
        title: n.title || 'Notificación',
        body: n.body || n.mensaje || '',
        read: n.read ?? n.leida ?? false,
        link: n.link,
        avatarUrl: n.avatarUrl,
        createdAt: n.createdAt,
        data: n.data
      }));
      
      const cache = getCache();
      const existing = cache?.notifications || [];
      const deduplicated = deduplicateNotifications(mapped, existing);
      
      setNotifications(deduplicated);
      setUnreadCount(deduplicated.filter(n => !n.read).length);
      
      setCache({
        notifications: deduplicated,
        lastFetch: Date.now(),
        lastNotifId: deduplicated[0]?.id || null
      });
    }
  }, [convexNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isOnline,
    pushEnabled,
    pushSupported,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: () => fetchNotifications(true),
    clearCache,
    enablePush,
    disablePush
  };
};
