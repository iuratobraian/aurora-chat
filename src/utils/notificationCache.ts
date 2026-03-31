import { safeJsonParse } from './safeJson';

const CACHE_PREFIX = 'notif_cache_';
const POLL_INTERVAL_MS = 30000;
const UNREAD_CACHE_TTL_MS = 30000;

const safeParseInt = (str: string | null, fallback: number): number => {
  if (!str) return fallback;
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? fallback : parsed;
};

export const getLastFetchTime = (userId: string): number => {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}lastFetch_${userId}`);
    return safeParseInt(cached, 0);
  } catch {
    return 0;
  }
};

export const setLastFetchTime = (userId: string, time: number): void => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}lastFetch_${userId}`, time.toString());
  } catch {
    // Storage full
  }
};

export const getCachedUnreadCount = (userId: string): number | null => {
  try {
    const lastFetch = safeParseInt(localStorage.getItem(`${CACHE_PREFIX}unreadFetch_${userId}`), 0);
    if (Date.now() - lastFetch > UNREAD_CACHE_TTL_MS) return null;
    const cached = localStorage.getItem(`${CACHE_PREFIX}unread_${userId}`);
    return safeParseInt(cached, 0);
  } catch {
    return null;
  }
};

export const setCachedUnreadCount = (userId: string, count: number): void => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}unread_${userId}`, count.toString());
    localStorage.setItem(`${CACHE_PREFIX}unreadFetch_${userId}`, Date.now().toString());
  } catch {
    // Storage full
  }
};

export const getCachedNotifications = (userId: string): any[] => {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}items_${userId}`);
    return safeJsonParse(cached, []);
  } catch {
    return [];
  }
};

export const setCachedNotifications = (userId: string, notifications: any[]): void => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}items_${userId}`, JSON.stringify(notifications.slice(0, 100)));
  } catch {
    // Storage full
  }
};

export const clearNotificationCache = (userId: string): void => {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}lastFetch_${userId}`);
    localStorage.removeItem(`${CACHE_PREFIX}unread_${userId}`);
    localStorage.removeItem(`${CACHE_PREFIX}unreadFetch_${userId}`);
    localStorage.removeItem(`${CACHE_PREFIX}items_${userId}`);
  } catch {
    // Ignore
  }
};

export const shouldRefetch = (lastFetch: number): boolean => {
  return Date.now() - lastFetch >= POLL_INTERVAL_MS;
};

export const deduplicateById = (arr: any[]): any[] => {
  const seen = new Set();
  return arr.filter(item => {
    const id = item.id || item._id;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};
