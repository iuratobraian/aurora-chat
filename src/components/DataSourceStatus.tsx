import { useEffect, useState } from 'react';
import { useDataSourceStore, isAcceptableLocalStorage } from '../hooks/useDataSourceStatus';

export function DataSourceStatus() {
  const { isDegraded, lastError, syncStatus } = useDataSourceStore();
  const [dismissed, setDismissed] = useState(false);
  const [usage, setUsage] = useState<{ count: number; problematicKeys: string[] } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      const problematicKeys = keys.filter(k => !isAcceptableLocalStorage(k));
      setUsage({ count: keys.length, problematicKeys });
    }
  }, []);

  if (!isDegraded() || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-yellow-900/90 backdrop-blur-sm border border-yellow-600 rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
            <span className="text-lg">⚠️</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-yellow-100 font-semibold text-sm">Modo Degradado Activo</h4>
            <p className="text-yellow-200/80 text-xs mt-1">
              {lastError || 'Conectando con servidor local. Los datos pueden no estar actualizados.'}
            </p>
            {usage && usage.problematicKeys.length > 0 && (
              <div className="mt-2 text-xs text-yellow-300/70">
                ⚠️ {usage.problematicKeys.length} keys de localStorage usan datos no sincronizados
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setDismissed(true)}
                className="px-3 py-1.5 bg-yellow-700/50 hover:bg-yellow-600/50 text-yellow-100 text-xs rounded-lg transition-colors"
              >
                Ignorar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SyncStatusBadge() {
  const { syncStatus, posts, users, notifications, ads } = useDataSourceStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const sources = [posts, users, notifications, ads].filter(s => s === 'localStorage');
  if (sources.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-slate-300">Sync {sources.length}/4</span>
      </div>
    </div>
  );
}
