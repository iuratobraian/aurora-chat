import { useState, useEffect, useCallback } from 'react';
import { 
  registerServiceWorker, 
  subscribeToPush, 
  unsubscribe, 
  getPushSubscription,
  isPushSupported,
  checkNotificationPermission,
  sendPushNotification
} from '../../lib/pushNotifications';
import logger from '../utils/logger';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  register: () => Promise<ServiceWorkerRegistration | null>;
  subscribe: (userId: string) => Promise<void>;
  unsubscribeUser: (userId: string) => Promise<void>;
  sendNotification: (userId: string, title: string, body: string, url?: string) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supported = isPushSupported();
      setIsSupported(supported);
      
      if (supported) {
        const status = await checkNotificationPermission();
        setPermission(status.permission);
        setIsSubscribed(status.pushEnabled);
        
        await registerServiceWorker();
      } else {
        setPermission('denied');
        setIsSubscribed(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check push status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    if (!isSupported) return;

    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_RECEIVED') {
        logger.info('Push notification received in app:', event.data);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleSWMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, [isSupported]);

  const register = useCallback(async () => {
    try {
      setError(null);
      const registration = await registerServiceWorker();
      return registration;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register service worker');
      return null;
    }
  }, []);

  const subscribe = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await subscribeToPush(userId);
      setIsSubscribed(true);
      setPermission('granted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to push');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribeUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await unsubscribe(userId);
      setIsSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe from push');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendNotification = useCallback(async (
    userId: string, 
    title: string, 
    body: string, 
    url?: string
  ) => {
    try {
      await sendPushNotification(userId, { title, body, url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send push notification');
      throw err;
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    register,
    subscribe,
    unsubscribeUser,
    sendNotification,
    refreshStatus
  };
}
