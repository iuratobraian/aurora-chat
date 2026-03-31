/**
 * Query Cache - Smart caching layer for Convex queries
 * 
 * Implements stale-while-revalidate pattern with TTL-based invalidation.
 * Works alongside the existing cacheManager to provide in-memory caching
 * for frequently accessed data.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface QueryCacheConfig {
  defaultTTL: number;
  maxSize: number;
}

const DEFAULT_CONFIG: QueryCacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 50, // Max cached queries
};

class QueryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: QueryCacheConfig;

  constructor(config: Partial<QueryCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get cached data if fresh, otherwise return null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.defaultTTL,
      key,
    });
  }

  /**
   * Check if entry is stale (older than TTL)
   */
  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cleanup all stale entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const queryCache = new QueryCache();

/**
 * Execute query with stale-while-revalidate pattern
 * Returns cached data immediately if available, fetches fresh in background
 */
export async function staleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<{ data: T | null; isStale: boolean }> {
  const cached = queryCache.get<T>(key);
  const isStale = cached === null || queryCache.isStale(key);

  // Start background refresh
  fetcher()
    .then((freshData) => {
      queryCache.set(key, freshData, ttl);
    })
    .catch((err) => {
      console.warn(`[QueryCache] Background refresh failed for ${key}:`, err);
    });

  return {
    data: cached,
    isStale,
  };
}

/**
 * Execute query with cache-first strategy
 * Returns cached data if fresh, otherwise fetches and caches
 */
export async function cacheFirst<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = queryCache.get<T>(key);
  if (cached !== null && !queryCache.isStale(key)) {
    return cached;
  }

  const freshData = await fetcher();
  queryCache.set(key, freshData, ttl);
  return freshData;
}

/**
 * Execute query with network-first strategy
 * Tries network first, falls back to cache on failure
 */
export async function networkFirst<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  try {
    const freshData = await fetcher();
    queryCache.set(key, freshData, ttl);
    return freshData;
  } catch (error) {
    const cached = queryCache.get<T>(key);
    if (cached !== null) {
      console.warn(`[QueryCache] Network failed, serving cached data for ${key}`);
      return cached;
    }
    throw error;
  }
}

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    queryCache.cleanup();
  }, 5 * 60 * 1000);
}

export { QueryCache };
export type { CacheEntry, QueryCacheConfig };
