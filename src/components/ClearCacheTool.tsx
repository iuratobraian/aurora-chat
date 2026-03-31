import { useEffect, useState } from 'react';

/**
 * Componente para limpiar caché del Service Worker y recargar la app
 * 
 * Uso: Agregar en AdminView o como ruta temporal /clear-cache
 */
export default function ClearCacheTool() {
  const [status, setStatus] = useState<'idle' | 'clearing' | 'done' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    console.log(message);
  };

  const clearAllCaches = async () => {
    setStatus('clearing');
    addLog('🧹 Iniciando limpieza...');

    try {
      // 1. Limpiar Cache Storage
      const cacheNames = await caches.keys();
      addLog(`📦 Cachés encontradas: ${cacheNames.length}`);
      
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      addLog('✅ Cachés eliminadas');

      // 2. Unregister Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        addLog(`🔧 Service Workers encontrados: ${registrations.length}`);
        
        for (const registration of registrations) {
          await registration.unregister();
          addLog(`✅ Service Worker unregistered: ${registration.scope}`);
        }
      }

      // 3. Limpiar Local Storage
      localStorage.clear();
      addLog('✅ Local Storage limpiado');

      // 4. Limpiar Session Storage
      sessionStorage.clear();
      addLog('✅ Session Storage limpiado');

      setStatus('done');
      addLog('✨ ¡Limpieza completada!');

      // 5. Recargar automáticamente
      addLog('🔄 Recargando en 3 segundos...');
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error: any) {
      setStatus('error');
      addLog(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="bg-card-dark rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">
          🧹 Limpieza de Caché
        </h2>
        
        <p className="text-gray-400 mb-6">
          Este herramienta limpiará toda la caché del Service Worker y recargará la aplicación.
        </p>

        <button
          onClick={clearAllCaches}
          disabled={status === 'clearing' || status === 'done'}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'clearing' ? '🔄 Limpiando...' : status === 'done' ? '✅ Completado' : '🧹 Limpiar Caché'}
        </button>

        {logs.length > 0 && (
          <div className="mt-6 p-4 bg-black/50 rounded-xl max-h-64 overflow-y-auto font-mono text-xs text-gray-300">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        )}

        {status === 'done' && (
          <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 text-center">
            ✅ Caché limpiada exitosamente. Recargando...
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-center">
            ❌ Error al limpiar caché. Revisa la consola.
          </div>
        )}
      </div>
    </div>
  );
}
