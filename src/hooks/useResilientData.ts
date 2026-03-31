/**
 * useResilientData Hook
 * 
 * Custom hook for fetching data with automatic caching, retry logic,
 * and stale data management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  saveToCache,
  getFromCache,
  getCacheAge,
  isStale,
  isValidData,
} from '../utils/cacheManager';
import { RESILIENCE_CONFIG } from '../config/resilience';

export interface UseResilientDataOptions<T> {
  /** Unique cache key */
  key: string;
  /** Function to fetch data */
  query: () => Promise<T>;
  /** Time in ms before data is considered stale (default: 5 min) */
  staleTime?: number;
  /** Interval in ms between retries (default: 10 s) */
  retryInterval?: number;
  /** Maximum number of retries (default: 5) */
  maxRetries?: number;
  /** If false, don't fetch (default: true) */
  enabled?: boolean;
}

export interface UseResilientDataResult<T> {
  /** Fetched or cached data */
  data: T | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  isError: boolean;
  /** Data is stale (older than staleTime) */
  isStale: boolean;
  /** Timestamp of last successful update */
  lastUpdated: number | null;
  /** Age of cache in milliseconds */
  cacheAge: number;
  /** Force retry function */
  retry: () => Promise<void>;
  /** Clear cache for this key */
  clearCache: () => void;
}

export function useResilientData<T>(
  options: UseResilientDataOptions<T>
): UseResilientDataResult<T> {
  const {
    key,
    query,
    staleTime = RESILIENCE_CONFIG.STALE_THRESHOLD,
    retryInterval = RESILIENCE_CONFIG.RETRY_INTERVAL,
    maxRetries = RESILIENCE_CONFIG.MAX_RETRIES,
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const inFlightRef = useRef<Promise<any> | null>(null);
  const visibilityHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (visibilityHandlerRef.current) {
        document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
        visibilityHandlerRef.current = null;
      }
    };
  }, []);

  const executeQuery = useCallback(async () => {
    // OPT-012: Return in-flight request if one exists (request deduplication)
    if (inFlightRef.current) {
      return inFlightRef.current;
    }
    
    const promise = (async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        
        const result = await query();
        
        if (!isValidData(result)) {
          console.warn(`[useResilientData] Invalid data for key "${key}"`);
          setIsError(true);
          return;
        }
        
        // Save to cache (Stable JSON)
        await saveToCache(key, result);
        
        if (isMountedRef.current) {
          setData(result);
          setLastUpdated(Date.now());
          retryCountRef.current = 0; // Reset retry count on success
        }
      } catch (error) {
        console.error(`[useResilientData] Query failed for key "${key}":`, error);
        
        if (isMountedRef.current) {
          setIsError(true);
          
          // Try to use cached data if available
          const cached = await getFromCache<T>(key);
          if (cached) {
            setData(cached.data);
            setLastUpdated(cached.timestamp);
          }
          
          // Schedule retry if under max retries
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            
            // OPT-013: Pause retry if document is hidden
            if (document.visibilityState !== 'visible') {
              console.log(`[useResilientData] Tab hidden, pausing retry for key "${key}"`);
              if (visibilityHandlerRef.current) {
                document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
              }
              const resumeOnVisible = () => {
                if (document.visibilityState === 'visible') {
                  document.removeEventListener('visibilitychange', resumeOnVisible);
                  visibilityHandlerRef.current = null;
                  executeQuery();
                }
              };
              visibilityHandlerRef.current = resumeOnVisible;
              document.addEventListener('visibilitychange', resumeOnVisible);
              return;
            }

            console.log(
              `[useResilientData] Retrying in ${retryInterval / 1000}s (attempt ${retryCountRef.current}/${maxRetries})`
            );
            
            retryTimeoutRef.current = setTimeout(() => {
              inFlightRef.current = null; // Reset in-flight ref before retry
              if (isMountedRef.current) {
                executeQuery();
              }
            }, retryInterval);
          } else {
            console.error(
              `[useResilientData] Max retries (${maxRetries}) reached for key "${key}"`
            );
          }
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        inFlightRef.current = null; // Clear in-flight ref when done
      }
    })();
    
    inFlightRef.current = promise;
    return promise;
  }, [key, query, retryInterval, maxRetries]);

  const retry = useCallback(async () => {
    retryCountRef.current = 0; // Reset retry count
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    await executeQuery();
  }, [executeQuery]);

  const clearCache = useCallback(() => {
    // Remove from localStorage
    const cache = JSON.parse(localStorage.getItem('ts-resilient-cache') || '{}');
    delete cache[key];
    localStorage.setItem('ts-resilient-cache', JSON.stringify(cache));
    setData(null);
    setLastUpdated(null);
  }, [key]);

  // Initial fetch and cache check
  useEffect(() => {
    if (!enabled) return;

    const init = async () => {
      // Check cache first
      const cached = await getFromCache<T>(key);
      
      if (cached) {
        // Use cached data immediately
        if (isMountedRef.current) {
          setData(cached.data);
          setLastUpdated(cached.timestamp);
        }
        
        // If cache is fresh, don't fetch
        if (!isStale(cached.timestamp, staleTime)) {
          return;
        }
      }
      
      // OPT-013: Skip fetch if document is hidden, wait for visibility
      if (document.visibilityState !== 'visible') {
        const fetchOnVisible = () => {
          if (document.visibilityState === 'visible') {
            document.removeEventListener('visibilitychange', fetchOnVisible);
            executeQuery();
          }
        };
        if (visibilityHandlerRef.current) {
          document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
        }
        visibilityHandlerRef.current = fetchOnVisible;
        document.addEventListener('visibilitychange', fetchOnVisible);
        return;
      }
      
      // Fetch fresh data
      await executeQuery();
    };

    init();
  }, [key, enabled, staleTime, executeQuery]);

  const cacheAge = lastUpdated ? getCacheAge(lastUpdated) : 0;
  const isStaleData = lastUpdated ? isStale(lastUpdated, staleTime) : false;

  return {
    data,
    isLoading,
    isError,
    isStale: isStaleData,
    lastUpdated,
    cacheAge,
    retry,
    clearCache,
  };
}
