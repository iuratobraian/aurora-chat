/**
 * useOfflineStatus Hook
 * 
 * Detects online/offline state and provides utilities for
 * graceful degradation when connectivity is lost.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface OfflineStatus {
  /** Whether the app is currently online */
  isOnline: boolean;
  /** Whether the app was previously online (has had connection) */
  hasConnection: boolean;
  /** Timestamp of last known online state */
  lastOnlineAt: number | null;
  /** Timestamp when connection was lost */
  offlineSince: number | null;
  /** Queue of pending actions */
  pendingActions: number;
}

const ONLINE_KEY = 'ts-online-status';
const PENDING_KEY = 'ts-pending-actions';

export function useOfflineStatus(): OfflineStatus & {
  /** Register a pending action for sync when back online */
  registerPendingAction: (action: any) => void;
  /** Clear pending actions after successful sync */
  clearPendingActions: () => void;
} {
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [offlineSince, setOfflineSince] = useState<number | null>(null);
  const [pendingActions, setPendingActions] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(PENDING_KEY);
      return stored ? JSON.parse(stored).length : 0;
    } catch {
      return 0;
    }
  });

  const hasConnectionRef = useRef(true);
  const lastOnlineAtRef = useRef<number | null>(Date.now());

  const updatePendingCount = useCallback(() => {
    try {
      const stored = localStorage.getItem(PENDING_KEY);
      const actions = stored ? JSON.parse(stored) : [];
      setPendingActions(actions.length);
    } catch {
      setPendingActions(0);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineSince(null);
      lastOnlineAtRef.current = Date.now();
      hasConnectionRef.current = true;
      localStorage.setItem(ONLINE_KEY, JSON.stringify({
        lastOnlineAt: Date.now(),
      }));
      updatePendingCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineSince(Date.now());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updatePendingCount]);

  const registerPendingAction = useCallback((action: any) => {
    try {
      const stored = localStorage.getItem(PENDING_KEY);
      const actions = stored ? JSON.parse(stored) : [];
      actions.push({ ...action, queuedAt: Date.now() });
      localStorage.setItem(PENDING_KEY, JSON.stringify(actions));
      setPendingActions(actions.length);
    } catch (error) {
      console.error('[useOfflineStatus] Failed to register pending action:', error);
    }
  }, []);

  const clearPendingActions = useCallback(() => {
    localStorage.removeItem(PENDING_KEY);
    setPendingActions(0);
  }, []);

  return {
    isOnline,
    hasConnection: hasConnectionRef.current,
    lastOnlineAt: lastOnlineAtRef.current,
    offlineSince,
    pendingActions,
    registerPendingAction,
    clearPendingActions,
  };
}
