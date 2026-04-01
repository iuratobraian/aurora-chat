// Production rate limiting middleware
// Per-IP, per-user, per-endpoint with X-RateLimit-* headers

export interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  key: 'ip' | 'user' | 'both';
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  '/api/ai/': { windowMs: 60_000, maxRequests: 30, key: 'user' },
  '/api/ai/completion': { windowMs: 60_000, maxRequests: 20, key: 'user' },
  '/api/ai/generate-caption': { windowMs: 60_000, maxRequests: 10, key: 'user' },
  '/api/youtube/extract': { windowMs: 300_000, maxRequests: 5, key: 'ip' },
  '/api/instagram/': { windowMs: 60_000, maxRequests: 20, key: 'user' },
  '/webhooks/': { windowMs: 60_000, maxRequests: 100, key: 'ip' },
  '/api/auth/': { windowMs: 60_000, maxRequests: 10, key: 'ip' },
  default: { windowMs: 60_000, maxRequests: 100, key: 'ip' },
};

const windows = new Map<string, RateLimitEntry>();

function findMatchingConfig(path: string): RateLimitConfig {
  for (const [prefix, config] of Object.entries(DEFAULT_LIMITS)) {
    if (prefix !== 'default' && path.startsWith(prefix)) {
      return config;
    }
  }
  return DEFAULT_LIMITS.default;
}

export function rateLimitMiddleware(req: any, res: any, next: any) {
  const path = req.path || req.url?.split('?')[0] || '';
  const config = findMatchingConfig(path);

  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const userId = req.userId || ip;
  const key = config.key === 'user' && userId ? userId : ip;
  const windowKey = `${path}:${key}`;

  const now = Date.now();
  let entry = windows.get(windowKey);

  // Reset expired window
  if (entry && now - entry.firstRequest >= config.windowMs) {
    entry = undefined;
  }

  if (!entry) {
    entry = { count: 0, firstRequest: now, lastRequest: now };
  }

  entry.count++;
  entry.lastRequest = now;
  windows.set(windowKey, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetAt = entry.firstRequest + config.windowMs;
  const resetMs = Math.max(0, resetAt - now);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', config.maxRequests);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(resetAt / 1000));

  if (entry.count > config.maxRequests) {
    res.setHeader('Retry-After', Math.ceil(resetMs / 1000));
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(resetMs / 1000),
    });
  }

  next();
}

// Cleanup old windows periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of windows) {
    if (now - entry.firstRequest > 300_000) { // 5 min cleanup
      windows.delete(key);
    }
  }
}, 60_000);
