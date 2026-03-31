import logger from './utils/logger';

export const registerServiceWorker = async () => {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    logger.debug('[App] Service Worker registered:', registration.scope);

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            logger.debug('[App] New Service Worker available');
            
            window.dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.dispatchEvent(new CustomEvent('sw-controller-change'));
    });

    return registration;
  } catch (error) {
    logger.error('[App] Service Worker registration failed:', error);
    return null;
  }
};

export const unregisterServiceWorker = async () => {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    logger.debug('[App] Service Worker unregistered');
  } catch (error) {
    logger.error('[App] Service Worker unregister failed:', error);
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    logger.warn('[App] Browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

export const subscribeToPush = async (userId: string, vapidPublicKey?: string) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    logger.warn('[App] Push not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey 
        ? urlBase64ToUint8Array(vapidPublicKey)
        : undefined,
    });

    logger.debug('[App] Push subscription:', subscription);

    return subscription;
  } catch (error) {
    logger.error('[App] Push subscription failed:', error);
    return null;
  }
};

export const getPushSubscription = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    logger.error('[App] Get push subscription failed:', error);
    return null;
  }
};

export const unsubscribeFromPush = async () => {
  const subscription = await getPushSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    logger.debug('[App] Unsubscribed from push');
  }
};

export const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
};

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

export const canInstallPWA = () => {
  if (typeof window === 'undefined') return false;
  return isMobileDevice() && !isStandalone();
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const clearAllCaches = async () => {
  if (!('caches' in window)) return;
  
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    logger.debug('[App] All caches cleared');
  } catch (error) {
    logger.error('[App] Clear caches failed:', error);
  }
};

export const preCacheUrls = async (urls: string[]) => {
  if (!('caches' in window)) return;
  
  try {
    const cache = await caches.open('tradehub-precache');
    await cache.addAll(urls);
    logger.debug('[App] URLs pre-cached:', urls.length);
  } catch (error) {
    logger.error('[App] Pre-cache failed:', error);
  }
};
