import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from './ToastProvider';
import logger from '../utils/logger';

interface NotificationPreferences {
  mentions: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
  signals: boolean;
  competitions: boolean;
  news: boolean;
  marketing: boolean;
}

interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
}

interface PushPreferencesProps {
  userId: string;
  onClose?: () => void;
}

export const PushPreferences: React.FC<PushPreferencesProps> = ({ userId, onClose }) => {
  const { success, error, warning, info } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    mentions: true,
    likes: true,
    comments: true,
    follows: true,
    signals: true,
    competitions: true,
    news: true,
    marketing: false,
  });

  const [quietHours, setQuietHours] = useState<QuietHours>({
    enabled: false,
    start: '22:00',
    end: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const subscribeToPush = useMutation(api.push.subscribeToPush);
  const unsubscribeFromPush = useMutation(api.push.unsubscribePush);
  const updateNotifications = useMutation(api.userPreferences.updateNotifications);
  const serverPreferences = useQuery(api.userPreferences.getPreferences, { oderId: userId });

  useEffect(() => {
    checkPushPermission();
  }, [userId]);

  useEffect(() => {
    if (serverPreferences) {
      setPreferences(serverPreferences.notificationPreferences);
      setQuietHours(serverPreferences.quietHours);
    }
  }, [serverPreferences]);

  const checkPushPermission = async () => {
    if (!('Notification' in window)) {
      setIsLoading(false);
      return;
    }

    const permission = Notification.permission;
    setIsPushEnabled(permission === 'granted');
    setIsLoading(false);
  };

  const savePreferences = async (newPrefs: NotificationPreferences, newQuietHours: QuietHours) => {
    if (isPushEnabled) {
      await navigator.serviceWorker.ready.then(async (registration) => {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscribeToPush({
            subscription: subscription.toJSON() as { keys: { auth: string; p256dh: string; }; endpoint: string; },
          });
        }
      });
    }

    try {
      await updateNotifications({
        oderId: userId,
        notificationPreferences: newPrefs,
        quietHours: newQuietHours,
      });
    } catch (err) {
      logger.error('Error saving preferences to Convex:', err);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    await savePreferences(newPrefs, quietHours);
  };

  const handleQuietHoursToggle = async () => {
    const newQuietHours = { ...quietHours, enabled: !quietHours.enabled };
    setQuietHours(newQuietHours);
    await savePreferences(preferences, newQuietHours);
  };

  const handleEnablePush = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      error('Tu navegador no soporta notificaciones push');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey ? urlBase64ToUint8Array(vapidKey) : undefined,
        });

        await subscribeToPush({
          subscription: subscription.toJSON() as { keys: { auth: string; p256dh: string; }; endpoint: string; },
        });

        setIsPushEnabled(true);
        success('Notificaciones activadas');
      } else {
        warning('Permiso de notificaciones denegado');
      }
    } catch (error) {
      logger.error('Error enabling push:', error);
      error('Error al activar notificaciones');
    }
  };

  const handleDisablePush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      await unsubscribeFromPush();
      setIsPushEnabled(false);
      info('Notificaciones desactivadas');
    } catch (error) {
      logger.error('Error disabling push:', error);
    }
  };

  const toggleAll = async () => {
    const allEnabled = Object.values(preferences).every(v => v);
    const newPrefs = Object.keys(preferences).reduce((acc, key) => {
      acc[key as keyof NotificationPreferences] = !allEnabled;
      return acc;
    }, {} as NotificationPreferences);
    
    setPreferences(newPrefs);
    await savePreferences(newPrefs, quietHours);
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full size-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 glass rounded-xl bg-white/5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">notifications</span>
          <div>
            <p className="text-sm font-bold text-white">Notificaciones Push</p>
            <p className="text-xs text-gray-500">
              {isPushEnabled ? 'Activas' : 'Inactivas'}
            </p>
          </div>
        </div>
        {isPushEnabled ? (
          <button
            onClick={handleDisablePush}
            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Desactivar
          </button>
        ) : (
          <button
            onClick={handleEnablePush}
            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Activar
          </button>
        )}
      </div>

      {isPushEnabled && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Notificaciones</h4>
              <button
                onClick={toggleAll}
                className="text-xs text-primary hover:underline"
              >
                {Object.values(preferences).every(v => v) ? 'Desactivar todas' : 'Activar todas'}
              </button>
            </div>

            {[
              { key: 'mentions', label: 'Menciones', icon: 'alternate_email', desc: 'Cuando alguien te menciona' },
              { key: 'likes', label: 'Likes', icon: 'thumb_up', desc: 'Cuando tu post recibe like' },
              { key: 'comments', label: 'Comentarios', icon: 'chat_bubble', desc: 'Cuando te comentan' },
              { key: 'follows', label: 'Seguidores', icon: 'person_add', desc: 'Cuando alguien te sigue' },
              { key: 'signals', label: 'Señales', icon: 'trending_up', desc: 'Nuevas señales de trading' },
              { key: 'competitions', label: 'Competencias', icon: 'emoji_events', desc: 'Actualizaciones de competencias' },
              { key: 'news', label: 'Noticias', icon: 'newspaper', desc: 'Noticias del mercado' },
              { key: 'marketing', label: 'Promociones', icon: 'campaign', desc: 'Ofertas y promociones' },
            ].map(({ key, label, icon, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 glass rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-500">{icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(key as keyof NotificationPreferences)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    preferences[key as keyof NotificationPreferences]
                      ? 'bg-primary'
                      : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform ${
                      preferences[key as keyof NotificationPreferences]
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Horas silenciosas</h4>
            
            <div className="flex items-center justify-between p-3 glass rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-500">do_not_disturb_on</span>
                <div>
                  <p className="text-sm font-medium text-white">Modo No Molestar</p>
                  <p className="text-xs text-gray-500">Silenciar notificaciones por la noche</p>
                </div>
              </div>
              <button
                onClick={handleQuietHoursToggle}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  quietHours.enabled ? 'bg-primary' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform ${
                    quietHours.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {quietHours.enabled && (
              <div className="grid grid-cols-2 gap-2 p-3 glass rounded-xl bg-white/5">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Desde</label>
                  <input
                    type="time"
                    value={quietHours.start}
                    onChange={(e) => {
                      const newQuietHours = { ...quietHours, start: e.target.value };
                      setQuietHours(newQuietHours);
                      savePreferences(preferences, newQuietHours);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 text-white text-sm border border-white/10 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Hasta</label>
                  <input
                    type="time"
                    value={quietHours.end}
                    onChange={(e) => {
                      const newQuietHours = { ...quietHours, end: e.target.value };
                      setQuietHours(newQuietHours);
                      savePreferences(preferences, newQuietHours);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 text-white text-sm border border-white/10 focus:border-primary outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
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

export default PushPreferences;
