// @ts-nocheck
import { api } from "../convex/_generated/api";
import logger from "../utils/logger";

export interface NotificationData {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    logger.warn('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    logger.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  return await Notification.requestPermission();
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function subscribeToPush(userId: string): Promise<PushSubscriptionData | null> {
  const vapidKey = await fetchQuery(api.push.getVapidPublicKey, {});
  if (!vapidKey) {
    throw new Error('VAPID public key not configured');
  }

  const permission = await requestPushPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  await registerServiceWorker();
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey)
  });

  const convexSubscription: PushSubscriptionData = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.getKey('p256dh') 
        ? uint8ArrayToBase64(subscription.getKey('p256dh')!) 
        : '',
      auth: subscription.getKey('auth') 
        ? uint8ArrayToBase64(subscription.getKey('auth')!) 
        : ''
    }
  };

  await fetchMutation(api.push.subscribeToPush, { userId, subscription: convexSubscription });
  return convexSubscription;
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function unsubscribe(userId: string): Promise<void> {
  const subscription = await getPushSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }

  await fetchMutation(api.push.unsubscribePush, { userId });
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function sendPushNotification(
  userId: string, 
  notification: NotificationData
): Promise<void> {
  await fetchAction(api.pushActions.sendPushNotification, {
    userId,
    title: notification.title,
    body: notification.body,
    url: notification.url
  });
}

export async function sendBulkPushNotification(
  userIds: string[], 
  notification: NotificationData
): Promise<void> {
  await fetchAction(api.pushActions.sendBulkPushNotification, {
    userIds,
    title: notification.title,
    body: notification.body,
    url: notification.url
  });
}

export async function checkNotificationPermission(): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  pushEnabled: boolean;
}> {
  const supported = 'Notification' in window;
  const permission = supported ? Notification.permission : 'denied';
  const subscription = await getExistingSubscription();
  
  return {
    supported,
    permission,
    pushEnabled: subscription !== null
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function uint8ArrayToBase64(array: Uint8Array): string {
  let binary = '';
  const len = array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return window.btoa(binary);
}

async function fetchQuery<T>(query: any, args: any): Promise<T> {
  const { fetch } = await import('../convex/_generated/api');
  return await fetch(query, args);
}

async function fetchMutation<T>(mutation: any, args: any): Promise<T> {
  const { fetch } = await import('../convex/_generated/api');
  return await fetch(mutation, args);
}

async function fetchAction<T>(action: any, args: any): Promise<T> {
  const { fetch } = await import('../convex/_generated/api');
  return await fetch(action, args);
}
