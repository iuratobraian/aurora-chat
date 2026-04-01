/**
 * Auto Fallback System - TSK-100
 * 
 * Centralized fallback orchestration that:
 * - Hides errors from regular users
 * - Shows admin-only corner error toast
 * - Keeps local cache always active as backup
 * - Ensures the app NEVER becomes unusable
 */

import { serviceCircuitBreakers } from '../lib/circuitBreaker';
import { withRetry, NetworkRetry } from '../lib/retry';
import { getFromCache, saveToCache } from '../utils/cacheManager';
import { eventBus, APP_EVENTS } from '../lib/eventBus';

export interface FallbackState {
  /** Whether we're currently serving from fallback/cache */
  isFallbackMode: boolean;
  /** Which services are degraded */
  degradedServices: Set<string>;
  /** Last error timestamp */
  lastErrorAt: number | null;
  /** Total errors caught */
  errorCount: number;
}

export interface FallbackOptions<T> {
  /** Unique key for cache lookup */
  cacheKey: string;
  /** Primary data source function */
  primary: () => Promise<T>;
  /** Optional fallback function (returns cached/default data) */
  fallback?: () => Promise<T>;
  /** Whether to use circuit breaker */
  useCircuitBreaker?: boolean;
  /** Circuit breaker service name */
  serviceName?: string;
  /** Whether to retry on failure */
  useRetry?: boolean;
  /** Whether to cache successful results */
  cacheResult?: boolean;
  /** Whether to emit error events for admin toast */
  emitErrorEvent?: boolean;
}

const FALLBACK_STATE_KEY = 'ts-fallback-state';

let fallbackState: FallbackState = {
  isFallbackMode: false,
  degradedServices: new Set<string>(),
  lastErrorAt: null,
  errorCount: 0,
};

function loadFallbackState(): FallbackState {
  try {
    const raw = localStorage.getItem(FALLBACK_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        degradedServices: new Set(parsed.degradedServices || []),
      };
    }
  } catch {
    // ignore
  }
  return fallbackState;
}

function saveFallbackState(): void {
  try {
    localStorage.setItem(FALLBACK_STATE_KEY, JSON.stringify({
      ...fallbackState,
      degradedServices: Array.from(fallbackState.degradedServices),
    }));
  } catch {
    // ignore - localStorage might be full
  }
}

export function getFallbackState(): FallbackState {
  return fallbackState;
}

function updateFallbackState(updates: Partial<FallbackState>): void {
  fallbackState = { ...fallbackState, ...updates };
  saveFallbackState();
  
  eventBus.emit(APP_EVENTS.FALLBACK_STATE_CHANGE, { ...fallbackState });
}

export async function withFallback<T>(options: FallbackOptions<T>): Promise<T> {
  const {
    cacheKey,
    primary,
    fallback,
    useCircuitBreaker = true,
    serviceName = cacheKey,
    useRetry = true,
    cacheResult = true,
    emitErrorEvent = true,
  } = options;

  const cb = useCircuitBreaker ? serviceCircuitBreakers[serviceName as keyof typeof serviceCircuitBreakers] : null;

  const executePrimary = async (): Promise<T> => {
    if (cb) {
      return cb.execute(primary);
    }
    return primary();
  };

  const executeWithRetry = async (): Promise<T> => {
    if (useRetry) {
      return NetworkRetry.defaultRetry(executePrimary);
    }
    return executePrimary();
  };

  try {
    const result = await executeWithRetry();
    
    if (cacheResult) {
      try {
        await saveToCache(cacheKey, result);
      } catch {
        // Cache save failed - non-critical
      }
    }

    if (fallbackState.degradedServices.has(serviceName)) {
      fallbackState.degradedServices.delete(serviceName);
      updateFallbackState({
        degradedServices: fallbackState.degradedServices,
        isFallbackMode: fallbackState.degradedServices.size > 0,
      });
    }

    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    updateFallbackState({
      lastErrorAt: Date.now(),
      errorCount: fallbackState.errorCount + 1,
      degradedServices: new Set([...fallbackState.degradedServices, serviceName]),
      isFallbackMode: true,
    });

    if (emitErrorEvent) {
      eventBus.emit(APP_EVENTS.SERVICE_ERROR, {
        service: serviceName,
        error: err.message,
        timestamp: Date.now(),
        stack: err.stack,
      });
    }

    // Try fallback function
    if (fallback) {
      try {
        const fallbackResult = await fallback();
        return fallbackResult;
      } catch (fallbackErr) {
        // Fallback also failed - try cache
      }
    }

    // Try cache as last resort
    try {
      const cached = await getFromCache<T>(cacheKey);
      if (cached && cached.data) {
        return cached.data;
      }
    } catch {
      // Cache read failed
    }

    // All sources failed - throw a safe error that UI can handle
    const safeError = new Error(`Service "${serviceName}" unavailable`);
    (safeError as any).code = 'FALLBACK_ALL_FAILED';
    (safeError as any).service = serviceName;
    throw safeError;
  }
}

export function isServiceDegraded(serviceName: string): boolean {
  return fallbackState.degradedServices.has(serviceName);
}

export function getDegradedServices(): string[] {
  return Array.from(fallbackState.degradedServices);
}

export function resetFallbackState(): void {
  fallbackState = {
    isFallbackMode: false,
    degradedServices: new Set(),
    lastErrorAt: null,
    errorCount: 0,
  };
  localStorage.removeItem(FALLBACK_STATE_KEY);
  eventBus.emit(APP_EVENTS.FALLBACK_STATE_CHANGE, { ...fallbackState });
}

export function getFallbackHealth(): {
  status: 'healthy' | 'degraded' | 'critical';
  degradedServices: string[];
  errorCount: number;
  lastError: number | null;
} {
  const degraded = Array.from(fallbackState.degradedServices);
  
  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (degraded.length > 0) status = 'degraded';
  if (degraded.length >= 3 || fallbackState.errorCount > 20) status = 'critical';

  return {
    status,
    degradedServices: degraded,
    errorCount: fallbackState.errorCount,
    lastError: fallbackState.lastErrorAt,
  };
}

export { eventBus, APP_EVENTS };
