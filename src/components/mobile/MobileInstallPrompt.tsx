import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const MobileInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    setIsInstalled(isStandalone);
    
    if (isStandalone || !isMobile) return;

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedDate = localStorage.getItem('pwa-install-dismissed-date');
    if (dismissed && dismissedDate) {
      const parsed = parseInt(dismissedDate, 10);
      const dismissedTimestamp = isNaN(parsed) ? Date.now() : parsed;
      const daysSinceDismissed = (Date.now() - dismissedTimestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
        return;
      }
    }

    if (isIOS) {
      // iOS doesn't support beforeinstallprompt, show it manually after 3 seconds
      const timer = setTimeout(() => {
        if (!isDismissed && !isInstalled) {
          setShowPrompt(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      setTimeout(() => {
        if (!isDismissed && !isInstalled) {
          setShowPrompt(true);
        }
      }, 3000); // Show after 3 seconds on Android instead of 30s
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isDismissed, isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-dismissed-date', Date.now().toString());
  };

  const isIOS = typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (!showPrompt || isInstalled || (!deferredPrompt && !isIOS)) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="glass bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl max-w-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-2xl">get_app</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white mb-1">Instalar TradeHub</h3>
            <p className="text-xs text-gray-400">
              {isIOS 
                ? "Toca el icono Compartir (abajo) y selecciona 'Agregar a Inicio' para instalar la App." 
                : "Añade a tu pantalla de inicio para mejor experiencia."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="material-symbols-outlined text-primary text-lg">bolt</span>
            Acceso rápido
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="material-symbols-outlined text-primary text-lg">notifications</span>
            Notificaciones
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="material-symbols-outlined text-primary text-lg">wifi_off</span>
            Modo offline
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="material-symbols-outlined text-primary text-lg">home</span>
            Icono home
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isIOS ? 'Entendido' : 'Quizás luego'}
          </button>
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Instalar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileInstallPrompt;
