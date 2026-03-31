import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigation, isMainView } from '../../context/NavigationContext';
import logger from '../utils/logger';

const TRADING_PHRASES = [
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

const MAIN_VIEW_TRANSITION_MS = 1200;
const SUB_VIEW_TRANSITION_MS = 600;
const MIN_LOADER_DISPLAY_MS = 1500;

interface UseNavigationLoaderOptions {
  view: string;
  minDisplayTime?: number;
  forceReload?: boolean;
  maxDataAge?: number;
  onDataLoaded?: (data: unknown) => void;
}

interface UseNavigationLoaderReturn {
  isLoading: boolean;
  isTransitioning: boolean;
  currentPhrase: string;
  progress: number;
  loadData: <T>(fetchFn: () => Promise<T>) => Promise<T | null>;
  skipLoader: () => void;
}

export const useNavigationLoader = ({
  view,
  minDisplayTime = MIN_LOADER_DISPLAY_MS,
  forceReload = false,
  maxDataAge = 5 * 60 * 1000,
  onDataLoaded
}: UseNavigationLoaderOptions): UseNavigationLoaderReturn => {
  const {
    currentView,
    isTransitioning: globalTransitioning,
    isViewLoaded,
    setViewData,
    shouldReload,
    incrementPendingLoads,
    decrementPendingLoads
  } = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [progress, setProgress] = useState(0);
  
  const loadStartTimeRef = useRef<number>(0);
  const loadingRef = useRef(false);

  const isMain = isMainView(view);
  const transitionTime = isMain ? MAIN_VIEW_TRANSITION_MS : SUB_VIEW_TRANSITION_MS;

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * TRADING_PHRASES.length);
    setCurrentPhrase(TRADING_PHRASES[randomIndex]);
    
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * TRADING_PHRASES.length);
      setCurrentPhrase(TRADING_PHRASES[idx]);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [view]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (isLoading) {
      setProgress(0);
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const elapsed = Date.now() - loadStartTimeRef.current;
          const targetProgress = Math.min(90, (elapsed / minDisplayTime) * 100);
          return targetProgress;
        });
      }, 50);
    } else {
      setProgress(100);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading, minDisplayTime]);

  const loadData = useCallback(async <T,>(fetchFn: () => Promise<T>): Promise<T | null> => {
    if (loadingRef.current) return null;

    const needsReload = forceReload || shouldReload(view, maxDataAge);
    
    if (!needsReload && isViewLoaded(view)) {
      return null;
    }

    loadingRef.current = true;
    setIsLoading(true);
    loadStartTimeRef.current = Date.now();
    incrementPendingLoads();

    try {
      const data = await fetchFn();
      
      const elapsed = Date.now() - loadStartTimeRef.current;
      const remainingTime = Math.max(0, minDisplayTime - elapsed);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      setViewData(view, data);
      onDataLoaded?.(data);
      
      return data;
    } catch (error) {
      logger.error(`Error loading data for view ${view}:`, error);
      return null;
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
      decrementPendingLoads();
    }
  }, [view, forceReload, maxDataAge, isViewLoaded, setViewData, onDataLoaded, minDisplayTime, incrementPendingLoads, decrementPendingLoads, shouldReload]);

  const skipLoader = useCallback(() => {
    if (loadingRef.current) {
      loadingRef.current = false;
      setIsLoading(false);
      decrementPendingLoads();
    }
  }, [decrementPendingLoads]);

  useEffect(() => {
    return () => {
      if (loadingRef.current) {
        loadingRef.current = false;
        decrementPendingLoads();
      }
    };
  }, [decrementPendingLoads]);

  return {
    isLoading,
    isTransitioning: isLoading || globalTransitioning,
    currentPhrase,
    progress,
    loadData,
    skipLoader
  };
};

export default useNavigationLoader;
