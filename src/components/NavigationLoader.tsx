import React, { memo, useEffect, useState } from 'react';

const TRADING_MESSAGES = [
  'Analizando mercados...',
  'Procesando datos...',
  'Cargando señales...',
  'Sincronizando información...',
  'Consultando análisis...',
  'Actualizando gráficos...',
  'Revisando oportunidades...',
  'Preparando datos...',
  'Optimizando vista...',
  'Cargando módulo...',
  'Conectando servidores...',
  'Ejecutando consulta...',
  'Extrayendo insights...',
  'Calculando métricas...',
  'Refrescando panel...'
];

interface NavigationLoaderProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  variant?: 'fullscreen' | 'overlay' | 'inline';
  className?: string;
}

export const NavigationLoader: React.FC<NavigationLoaderProps> = memo(({
  message,
  showProgress = true,
  progress,
  variant = 'overlay',
  className = ''
}) => {
  const [displayMessage, setDisplayMessage] = useState(message || TRADING_MESSAGES[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % TRADING_MESSAGES.length;
        setDisplayMessage(TRADING_MESSAGES[next]);
        return next;
      });
    }, 2500 + Math.random() * 1000);

    return () => clearInterval(interval);
  }, [message]);

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative size-24">
        <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
        
        <div className="absolute inset-0 rounded-full border-4 border-transparent animate-[spin_1.5s_linear_infinite]">
          <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-primary/80" />
        </div>
        
        <div className="absolute inset-2 rounded-full border-2 border-transparent animate-[spin_1s_linear_infinite_reverse]">
          <div className="absolute inset-0 rounded-full border-b-2 border-l-2 border-cyan-400/60" />
        </div>
        
        <div className="absolute inset-4 rounded-full border border-white/5">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-3 rounded-full bg-primary shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse" />
        </div>
        
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 rounded-full bg-white/20 animate-ping" />
      </div>

      <div className="text-center space-y-3">
        <div className="relative">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary animate-pulse">
            {displayMessage}
          </p>
        </div>

        {showProgress && (
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-blue-500 to-cyan-400 transition-all duration-300 ease-out rounded-full"
              style={{ 
                width: progress !== undefined ? `${progress}%` : '60%',
                boxShadow: '0 0 10px rgba(59,130,246,0.5)'
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="size-1 rounded-full bg-primary/40 animate-[bounce_1.4s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black via-[#0a0a0f] to-black backdrop-blur-md ${className}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-primary/5 blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 size-80 rounded-full bg-blue-500/5 blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 rounded-full bg-cyan-500/5 blur-[60px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10">
          {content}
        </div>
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl ${className}`}>
        <div className="transform scale-90">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      {content}
    </div>
  );
});

NavigationLoader.displayName = 'NavigationLoader';

interface ViewTransitionProps {
  isVisible: boolean;
  viewName: string;
  children: React.ReactNode;
}

export const ViewTransition: React.FC<ViewTransitionProps> = memo(({
  isVisible,
  viewName,
  children
}) => {
  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      }`}
      key={viewName}
    >
      {children}
    </div>
  );
});

ViewTransition.displayName = 'ViewTransition';

interface SectionLoaderProps {
  sectionName: string;
  isLoading: boolean;
  children: React.ReactNode;
  skeleton: React.ReactNode;
}

export const SectionLoader: React.FC<SectionLoaderProps> = memo(({
  sectionName,
  isLoading,
  children,
  skeleton
}) => {
  const [wasLoaded, setWasLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setWasLoaded(true);
    }
  }, [isLoading]);

  if (isLoading && !wasLoaded) {
    return (
      <div className="animate-in fade-in duration-300">
        {skeleton}
      </div>
    );
  }

  return (
    <div 
      className="transition-opacity duration-300"
      key={sectionName}
    >
      {children}
    </div>
  );
});

SectionLoader.displayName = 'SectionLoader';

export default NavigationLoader;
