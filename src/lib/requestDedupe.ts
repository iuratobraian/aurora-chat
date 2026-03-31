type PendingRequest<T> = {
  promise: Promise<T>;
  timestamp: number;
};

const pendingRequests = new Map<string, PendingRequest<unknown>>();
const responseCache = new Map<string, { data: unknown; timestamp: number }>();

const DEFAULT_TTL = 5000;
const MAX_CACHE_SIZE = 100;

function generateKey(fnName: string, args: unknown[]): string {
  return `${fnName}:${JSON.stringify(args)}`;
}

function evictOldest(): void {
  if (responseCache.size <= MAX_CACHE_SIZE) return;
  const oldest = [...responseCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
  const toRemove = Math.ceil(responseCache.size * 0.25);
  for (let i = 0; i < toRemove; i++) {
    responseCache.delete(oldest[i][0]);
  }
}

export function dedupeRequest<T>(fnName: string, args: unknown[], fetchFn: () => Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
  const key = generateKey(fnName, args);

  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data as T);
  }

  const pending = pendingRequests.get(key);
  if (pending && Date.now() - pending.timestamp < ttl * 2) {
    return pending.promise as Promise<T>;
  }

  const promise = fetchFn().then((data) => {
    pendingRequests.delete(key);
    evictOldest();
    responseCache.set(key, { data, timestamp: Date.now() });
    return data;
  }).catch((error) => {
    pendingRequests.delete(key);
    throw error;
  });

  pendingRequests.set(key, { promise, timestamp: Date.now() });
  return promise;
}

export function clearDedupeCache(pattern?: string): void {
  if (pattern) {
    for (const key of responseCache.keys()) {
      if (key.startsWith(pattern)) {
        responseCache.delete(key);
      }
    }
  } else {
    responseCache.clear();
    pendingRequests.clear();
  }
}

export function getDedupeStats(): { pending: number; cached: number } {
  return {
    pending: pendingRequests.size,
    cached: responseCache.size,
  };
}
