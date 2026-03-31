import React, { createContext, useContext, useState, useCallback, useRef, memo } from 'react';

interface NavigationState {
  currentView: string;
  previousView: string;
  isTransitioning: boolean;
  pendingLoads: number;
  viewData: Record<string, {
    loaded: boolean;
    lastLoaded: number;
    data: unknown;
  }>;
}

interface NavigationContextType extends NavigationState {
  navigate: (view: string) => void;
  startTransition: (fromView: string, toView: string) => void;
  endTransition: () => void;
  incrementPendingLoads: () => void;
  decrementPendingLoads: () => void;
  setViewData: (view: string, data: unknown) => void;
  isViewLoaded: (view: string) => boolean;
  getViewData: <T>(view: string) => T | undefined;
  clearViewData: (view: string) => void;
  shouldReload: (view: string, maxAge: number) => boolean;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

const MAIN_VIEWS = ['comunidad', 'academia', 'exness', 'grafico', 'leaderboard', 'discover', 'creator', 'pricing'];

export const isMainView = (view: string): boolean => MAIN_VIEWS.includes(view);

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = memo(({ children }) => {
  const [state, setState] = useState<NavigationState>({
    currentView: 'comunidad',
    previousView: '',
    isTransitioning: false,
    pendingLoads: 0,
    viewData: {}
  });

  const pendingLoadsRef = useRef(0);

  const navigate = useCallback((view: string) => {
    setState(prev => ({
      ...prev,
      previousView: prev.currentView,
      currentView: view,
      isTransitioning: true
    }));
  }, []);

  const startTransition = useCallback((fromView: string, toView: string) => {
    setState(prev => ({
      ...prev,
      previousView: fromView,
      currentView: toView,
      isTransitioning: true
    }));
  }, []);

  const endTransition = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTransitioning: false,
      pendingLoads: 0
    }));
    pendingLoadsRef.current = 0;
  }, []);

  const incrementPendingLoads = useCallback(() => {
    pendingLoadsRef.current += 1;
    setState(prev => ({
      ...prev,
      pendingLoads: pendingLoadsRef.current
    }));
  }, []);

  const decrementPendingLoads = useCallback(() => {
    pendingLoadsRef.current = Math.max(0, pendingLoadsRef.current - 1);
    setState(prev => ({
      ...prev,
      pendingLoads: pendingLoadsRef.current
    }));
    
    if (pendingLoadsRef.current === 0) {
      setTimeout(() => {
        setState(prev => ({ ...prev, isTransitioning: false }));
      }, 500);
    }
  }, []);

  const setViewData = useCallback((view: string, data: unknown) => {
    setState(prev => ({
      ...prev,
      viewData: {
        ...prev.viewData,
        [view]: {
          loaded: true,
          lastLoaded: Date.now(),
          data
        }
      }
    }));
  }, []);

  const isViewLoaded = useCallback((view: string): boolean => {
    return state.viewData[view]?.loaded ?? false;
  }, [state.viewData]);

  const getViewData = useCallback(<T,>(view: string): T | undefined => {
    return state.viewData[view]?.data as T | undefined;
  }, [state.viewData]);

  const clearViewData = useCallback((view: string) => {
    setState(prev => {
      const newViewData = { ...prev.viewData };
      delete newViewData[view];
      return { ...prev, viewData: newViewData };
    });
  }, []);

  const shouldReload = useCallback((view: string, maxAge: number): boolean => {
    const viewInfo = state.viewData[view];
    if (!viewInfo) return true;
    return Date.now() - viewInfo.lastLoaded > maxAge;
  }, [state.viewData]);

  const value: NavigationContextType = {
    ...state,
    navigate,
    startTransition,
    endTransition,
    incrementPendingLoads,
    decrementPendingLoads,
    setViewData,
    isViewLoaded,
    getViewData,
    clearViewData,
    shouldReload
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
});

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationContext;
