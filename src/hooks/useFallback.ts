/**
 * useFallback Hook - TSK-100
 * 
 * React hook that provides fallback state and error handling for components.
 * Ensures users never see broken states while admins get notified of issues.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { eventBus, APP_EVENTS } from '../lib/eventBus';
import {
  getFallbackState,
  getFallbackHealth,
  isServiceDegraded,
  getDegradedServices,
  type FallbackState,
} from '../lib/fallback';

export interface ServiceError {
  service: string;
  error: string;
  timestamp: number;
  stack?: string;
}

export interface UseFallbackResult {
  /** Whether any service is currently degraded */
  isDegraded: boolean;
  /** List of degraded service names */
  degradedServices: string[];
  /** Overall fallback health status */
  health: 'healthy' | 'degraded' | 'critical';
  /** Recent service errors */
  recentErrors: ServiceError[];
  /** Whether the app is in full fallback mode */
  isFallbackMode: boolean;
  /** Error count since last reset */
  errorCount: number;
}

const MAX_RECENT_ERRORS = 10;

export function useFallback(): UseFallbackResult {
  const [state, setState] = useState<FallbackState>(() => getFallbackState());
  const [recentErrors, setRecentErrors] = useState<ServiceError[]>([]);
  const errorsRef = useRef<ServiceError[]>([]);

  useEffect(() => {
    const handleStateChange = (newState: FallbackState) => {
      setState({ ...newState });
    };

    const handleError = (errorData: ServiceError) => {
      errorsRef.current = [errorData, ...errorsRef.current].slice(0, MAX_RECENT_ERRORS);
      setRecentErrors([...errorsRef.current]);
    };

    eventBus.on(APP_EVENTS.FALLBACK_STATE_CHANGE, handleStateChange);
    eventBus.on(APP_EVENTS.SERVICE_ERROR, handleError);

    return () => {
      eventBus.off(APP_EVENTS.FALLBACK_STATE_CHANGE, handleStateChange);
      eventBus.off(APP_EVENTS.SERVICE_ERROR, handleError);
    };
  }, []);

  const health = getFallbackHealth();

  return {
    isDegraded: state.degradedServices.size > 0,
    degradedServices: getDegradedServices(),
    health: health.status,
    recentErrors,
    isFallbackMode: state.isFallbackMode,
    errorCount: state.errorCount,
  };
}

export function useServiceStatus(serviceName: string): {
  isDegraded: boolean;
  lastError: ServiceError | null;
} {
  const [degraded, setDegraded] = useState(() => isServiceDegraded(serviceName));
  const [lastError, setLastError] = useState<ServiceError | null>(null);

  useEffect(() => {
    const handleStateChange = () => {
      setDegraded(isServiceDegraded(serviceName));
    };

    const handleError = (errorData: ServiceError) => {
      if (errorData.service === serviceName) {
        setLastError(errorData);
      }
    };

    eventBus.on(APP_EVENTS.FALLBACK_STATE_CHANGE, handleStateChange);
    eventBus.on(APP_EVENTS.SERVICE_ERROR, handleError);

    return () => {
      eventBus.off(APP_EVENTS.FALLBACK_STATE_CHANGE, handleStateChange);
      eventBus.off(APP_EVENTS.SERVICE_ERROR, handleError);
    };
  }, [serviceName]);

  return { isDegraded: degraded, lastError };
}
