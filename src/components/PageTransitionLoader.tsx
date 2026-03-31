import React, { useState, useEffect, useCallback, memo, createContext, useContext } from 'react';

interface NavigationLoaderContextType {
  isNavigating: boolean;
  navigationLabel: string;
  startNavigation: (label?: string) => void;
  endNavigation: () => void;
}

const NavigationLoaderContext = createContext<NavigationLoaderContextType>({
  isNavigating: false,
  navigationLabel: '',
  startNavigation: () => {},
  endNavigation: () => {},
});

export const useNavigationLoader = () => useContext(NavigationLoaderContext);

const NAVIGATION_MESSAGES = [
  'Preparando entorno...',
  'Cargando contenido...',
  'Sincronizando datos...',
  'Optimizando vista...',
  'Casi listo...',
];

interface NavigationLoaderProviderProps {
  children: React.ReactNode;
}

export const NavigationLoaderProvider: React.FC<NavigationLoaderProviderProps> = memo(({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationLabel, setNavigationLabel] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);

  const startNavigation = useCallback((label: string = NAVIGATION_MESSAGES[0]) => {
    setIsNavigating(true);
    setNavigationLabel(label);
    setMessageIndex(Math.floor(Math.random() * NAVIGATION_MESSAGES.length));
  }, []);

  const endNavigation = useCallback(() => {
    setIsNavigating(false);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isNavigating) {
      interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % NAVIGATION_MESSAGES.length);
        setNavigationLabel(NAVIGATION_MESSAGES[(messageIndex + 1) % NAVIGATION_MESSAGES.length]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isNavigating, messageIndex]);

  return (
    <NavigationLoaderContext.Provider value={{ isNavigating, navigationLabel, startNavigation, endNavigation }}>
      {children}
      {isNavigating && <PageTransitionLoader label={navigationLabel} />}
    </NavigationLoaderContext.Provider>
  );
});

interface PageTransitionLoaderProps {
  label: string;
}

const PageTransitionLoader: React.FC<PageTransitionLoaderProps> = memo(({ label }) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    setFadeIn(true);
    const dotInterval = setInterval(() => {
      setDotCount(prev => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-500 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative flex flex-col items-center gap-8">
        {/* Calm spinning ring */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary/60 border-r-primary/40 animate-spin" 
               style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 rounded-full border border-transparent border-b-primary/30 border-l-primary/20 animate-spin" 
               style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
          <div className="absolute inset-4 rounded-full border border-transparent border-t-white/10 animate-spin" 
               style={{ animationDuration: '5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
          </div>
        </div>

        {/* Label */}
        <div className="text-center">
          <p className="text-white/80 text-sm font-light tracking-wide">
            {label}
            <span className="inline-block w-4 ml-1">
              {'.'.repeat(dotCount)}
            </span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full animate-[loading_2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; opacity: 0.5; }
          50% { width: 100%; opacity: 1; }
          100% { width: 0%; opacity: 0.5; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
});

export default PageTransitionLoader;
