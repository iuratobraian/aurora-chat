import React, { useState, useEffect } from 'react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [cachedPages, setCachedPages] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setShowBanner(true);
      } else {
        setTimeout(() => setShowBanner(false), 3000);
      }
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          fetch('/sw.js')
            .then(() => {
              if ('caches' in window) {
                caches.keys().then((cacheNames) => {
                  const totalCacheSize = cacheNames.length;
                  setCachedPages([...cacheNames.slice(0, 5)]);
                });
              }
            })
            .catch(() => {});
        }
      });
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!showBanner && isOnline) return null;

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-300">
        <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                <span className="material-symbols-outlined text-white text-xl relative">
                  wifi_off
                </span>
              </div>
              <div>
                <p className="text-white font-bold text-sm uppercase tracking-wide">
                  Sin conexión
                </p>
                <p className="text-white/80 text-xs">
                  Cargando contenido desde caché...
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {cachedPages.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs">
                  <span className="material-symbols-outlined text-sm">cached</span>
                  <span>{cachedPages.length} páginas en caché</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-white text-xs font-medium">Offline</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-amber-600 via-orange-400 to-amber-600 animate-pulse" />
      </div>
    );
  }

  if (isOnline && showBanner) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-500">
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 px-4 py-2 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-white text-lg animate-bounce">
              wifi
            </span>
            <p className="text-white font-bold text-sm uppercase tracking-wide">
              Conexión restaurada
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OfflineIndicator;

interface OfflinePageProps {
  onRetry?: () => void;
}

export const OfflinePage: React.FC<OfflinePageProps> = ({ onRetry }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      onRetry?.();
    };
    
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onRetry]);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#0f1115]">
      <div className="glass max-w-md w-full mx-4 p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
            <span className="material-symbols-outlined text-amber-500 text-5xl animate-pulse">
              wifi_off
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
          Sin conexión
        </h2>
        
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          No hay conexión a internet. Algunas funciones pueden estar limitadas, 
          pero puedes ver el contenido en caché.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
            <p className="text-xs text-gray-400 mt-1">Feed en caché</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
            <p className="text-xs text-gray-400 mt-1">Perfil visible</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            disabled={!isOnline}
            className="w-full py-3 px-6 bg-gradient-to-r from-primary to-blue-600 text-white font-black uppercase tracking-wider rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOnline ? 'Reintentar' : 'Esperando conexión...'}
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 px-6 bg-white/5 text-gray-400 font-bold uppercase tracking-wider rounded-xl border border-white/10 hover:bg-white/10 transition-all"
          >
            Volver atrás
          </button>
        </div>

        {!isOnline && (
          <div className="mt-4 flex items-center justify-center gap-2 text-amber-500 text-xs">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Reconectando automáticamente...</span>
          </div>
        )}
      </div>
    </div>
  );
};
