/**
 * Service Fallback Wrappers - TSK-100
 * 
 * High-order functions that wrap service calls with automatic fallback protection.
 * Use these to protect any service method without changing its core logic.
 */

import { withFallback, type FallbackOptions } from '../lib/fallback';
import { getFromCache, saveToCache } from '../utils/cacheManager';

export interface ServiceFallbackOptions<T, TArgs extends any[]> {
  cacheKeyFn: (...args: TArgs) => string;
  serviceName: string;
  defaultOnError?: (error: Error) => T | null;
}

export function createFallbackService<TService extends Record<string, (...args: any[]) => Promise<any>>>(
  service: TService,
  config: {
    serviceName: string;
    cacheKeys?: { [K in keyof TService]?: (...args: Parameters<TService[K]>) => string };
    defaults?: { [K in keyof TService]?: (...args: Parameters<TService[K]>) => ReturnType<TService[K]> };
  }
): TService {
  const wrapped = {} as TService;

  for (const key of Object.keys(service) as (keyof TService)[]) {
    const originalMethod = service[key];
    
    if (typeof originalMethod !== 'function') {
      wrapped[key] = originalMethod;
      continue;
    }

    wrapped[key] = (async (...args: Parameters<TService[keyof TService]>) => {
      const cacheKeyFn = config.cacheKeys?.[key];
      const cacheKey = cacheKeyFn ? cacheKeyFn(...args) : `${config.serviceName}:${String(key)}:${JSON.stringify(args).slice(0, 100)}`;
      const defaultFn = config.defaults?.[key];

      try {
        return await withFallback({
          cacheKey,
          primary: () => originalMethod(...args),
          fallback: defaultFn ? () => Promise.resolve(defaultFn(...args)) : undefined,
          serviceName: config.serviceName,
          useCircuitBreaker: true,
          useRetry: true,
          cacheResult: true,
          emitErrorEvent: true,
        });
      } catch (error) {
        if (defaultFn) {
          return defaultFn(...args);
        }
        throw error;
      }
    }) as TService[keyof TService];
  }

  return wrapped;
}

export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  options: {
    cacheKey: string;
    serviceName: string;
    defaultValue?: T;
  }
): Promise<T | null> {
  try {
    return await withFallback({
      cacheKey: options.cacheKey,
      primary: queryFn,
      fallback: options.defaultValue !== undefined ? () => Promise.resolve(options.defaultValue!) : undefined,
      serviceName: options.serviceName,
    });
  } catch {
    return options.defaultValue ?? null;
  }
}

export async function safeMutation<T>(
  mutationFn: () => Promise<T>,
  options: {
    cacheKey?: string;
    serviceName: string;
    invalidateCache?: string[];
  }
): Promise<{ data?: T; error?: string }> {
  try {
    const result = await mutationFn();
    
    if (options.cacheKey) {
      try {
        await saveToCache(options.cacheKey, result);
      } catch {
        // Cache save failed - non-critical for mutations
      }
    }

    if (options.invalidateCache) {
      for (const key of options.invalidateCache) {
        try {
          const cache = JSON.parse(localStorage.getItem('ts-resilient-cache') || '{}');
          delete cache[key];
          localStorage.setItem('ts-resilient-cache', JSON.stringify(cache));
        } catch {
          // Cache invalidation failed - non-critical
        }
      }
    }

    return { data: result };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    return { error: err.message };
  }
}

export async function cachedQuery<T>(
  queryFn: () => Promise<T>,
  options: {
    cacheKey: string;
    staleTime?: number;
  }
): Promise<T | null> {
  const staleTime = options.staleTime ?? 5 * 60 * 1000;

  try {
    const cached = await getFromCache<T>(options.cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < staleTime) {
      return cached.data;
    }

    const result = await queryFn();
    await saveToCache(options.cacheKey, result);
    return result;
  } catch {
    const cached = await getFromCache<T>(options.cacheKey);
    return cached?.data ?? null;
  }
}
