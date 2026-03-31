import { useOfflineStatus } from '../hooks/useOfflineStatus';

export function OfflineBanner() {
  const { isOnline, pendingActions, offlineSince } = useOfflineStatus();

  if (isOnline && pendingActions === 0) return null;

  const offlineDuration = offlineSince
    ? Math.round((Date.now() - offlineSince) / 60000)
    : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      {!isOnline ? (
        <div className="bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            <span>Sin conexión</span>
            {offlineDuration > 0 && (
              <span className="text-amber-100">({offlineDuration} min)</span>
            )}
            {pendingActions > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {pendingActions} pendiente{pendingActions > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      ) : pendingActions > 0 ? (
        <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm animate-pulse">sync</span>
            <span>Sincronizando {pendingActions} acci{pendingActions > 1 ? 'ones' : 'ón'}...</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
