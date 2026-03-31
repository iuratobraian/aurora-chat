import React from 'react';

interface AppViewFallbackProps {
  title?: string;
  message?: string;
  onGoSafe?: () => void;
  onRetry?: () => void;
}

const AppViewFallback: React.FC<AppViewFallbackProps> = ({
  title = 'Seguimos operativos',
  message = 'Este módulo tuvo un problema, pero la app sigue disponible. Puedes volver a la comunidad o reintentar sin perder la sesión.',
  onGoSafe,
  onRetry,
}) => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl glass rounded-3xl border border-white/10 bg-black/30 p-8 text-center">
        <div className="text-5xl mb-4">🛡️</div>
        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-3">
          {title}
        </h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onGoSafe}
            className="px-5 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-primary/20"
          >
            Ir a zona segura
          </button>
          <button
            onClick={onRetry}
            className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white font-black uppercase tracking-wider text-xs"
          >
            Reintentar
          </button>
        </div>

        <p className="text-[11px] text-white/30 mt-5">
          La navegación y tu sesión permanecen activas.
        </p>
      </div>
    </div>
  );
};

export default AppViewFallback;
