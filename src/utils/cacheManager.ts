/**
 * Cache Manager for Resilient Data System
 * 
 * Handles localStorage operations for caching data with automatic cleanup
 * and stale data management.
 * 
 * Handles localStorage operations for caching data with automatic cleanup
 * and stale data management.
 */

import { RESILIENCE_CONFIG, CACHE_THRESHOLDS } from '../config/resilience';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
  version: number;
}

interface CacheStore {
  [key: string]: CacheEntry<any>;
}

const CACHE_KEY = 'ts-resilient-cache';

/**
 * Get entire cache from localStorage
 */
export function getCache(): CacheStore {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};
    return JSON.parse(cached) as CacheStore;
  } catch (error) {
    console.error('[CacheManager] Failed to parse cache:', error);
    return {};
  }
}

/**
 * Save entire cache to localStorage
 */
function saveCache(cache: CacheStore): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('[CacheManager] Failed to save cache:', error);
    // Handle localStorage quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      cleanupStaleCache(); // Clean old cache and try again
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch (retryError) {
        console.error('[CacheManager] Still failed after cleanup:', retryError);
      }
    }
  }
}

/**
 * Save data to cache with timestamp
 * [REFACTORED] Uses plain JSON for stability and performance
 */
export async function saveToCache<T>(key: string, data: T): Promise<void> {
  const cache = getCache();
  
  const entry: CacheEntry<T> = {
    data: data,
    timestamp: Date.now(),
    key,
    version: 1, // Version 1 = plain JSON (Stable)
  };
  
  cache[key] = entry;
  saveCache(cache);
  
  console.log(`[CacheManager] Saved "${key}" to cache (Stable JSON)`);
}

/**
 * Get specific entry from cache
 * Uses standard JSON parsing for maximum stability
 */
export async function getFromCache<T>(key: string): Promise<CacheEntry<T> | null> {
  const cache = getCache();
  const entry = cache[key];
  
  if (!entry) {
    return null;
  }
  
  // Handle standard entries (v1 or legacy without conversion)
  if (entry.version === 1 || !entry.version) {
    return entry as CacheEntry<T>;
  }
  
  // Handle legacy version 2 (compressed)
  if (entry.version === 2) {
    console.warn(`[CacheManager] Entry "${key}" is version 2 (Legacy). Skipping to avoid errors.`);
    return null;
  }
  
  return entry as CacheEntry<T>;
}

/**
 * Remove specific entry from cache
 */
export function removeFromCache(key: string): void {
  const cache = getCache();
  delete cache[key];
  saveCache(cache);
  console.log(`[CacheManager] Removed "${key}" from cache`);
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  localStorage.removeItem(CACHE_KEY);
  console.log('[CacheManager] Cleared all cache');
}

/**
 * Cleanup stale cache entries older than TTL
 */
export function cleanupStaleCache(): void {
  const cache = getCache();
  const now = Date.now();
  const TTL = RESILIENCE_CONFIG.CACHE_TTL;
  
  let cleanedCount = 0;
  
  for (const key of Object.keys(cache)) {
    if (now - cache[key].timestamp > TTL) {
      delete cache[key];
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    saveCache(cache);
    console.log(`[CacheManager] Cleaned ${cleanedCount} stale entries`);
  }
}

/**
 * Get cache age in milliseconds
 */
export function getCacheAge(timestamp: number): number {
  return Date.now() - timestamp;
}

/**
 * Check if cache entry is stale
 */
export function isStale(timestamp: number, threshold?: number): boolean {
  const age = getCacheAge(timestamp);
  return age > (threshold || RESILIENCE_CONFIG.STALE_THRESHOLD);
}

/**
 * Get cache status based on age
 */
export function getCacheStatus(timestamp: number): 'fresh' | 'stale' | 'old' {
  const age = getCacheAge(timestamp);
  
  if (age < CACHE_THRESHOLDS.FRESH) {
    return 'fresh';
  } else if (age < CACHE_THRESHOLDS.STALE) {
    return 'stale';
  } else {
    return 'old';
  }
}

/**
 * Validate data before caching
 */
export function isValidData(data: any): boolean {
  if (!data) return false;
  if (typeof data === 'undefined') return false;
  return true;
}

// Auto-cleanup on module load
if (typeof window !== 'undefined') {
  // Cleanup stale cache once per session
  const lastCleanup = sessionStorage.getItem('ts-last-cleanup');
  const now = Date.now();
  
  if (!lastCleanup || now - parseInt(lastCleanup, 10) > RESILIENCE_CONFIG.CACHE_TTL) {
    cleanupStaleCache();
    sessionStorage.setItem('ts-last-cleanup', now.toString());
  }
}
