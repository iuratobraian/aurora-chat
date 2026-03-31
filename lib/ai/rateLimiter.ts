export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface AIMetrics {
  totalRequests: number;
  totalErrors: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
  byUser: Record<string, number>;
  byEndpoint: Record<string, { requests: number; errors: number }>;
  lastRequestAt: number;
  lastErrorAt: number;
  errorRate: number;
}

export interface AuditLogEntry {
  timestamp: number;
  requestId: string;
  endpoint: string;
  userId?: string;
  provider?: string;
  model?: string;
  success: boolean;
  durationMs: number;
  errorMessage?: string;
  ip?: string;
}

const DEFAULT_CONFIG: Record<string, RateLimitConfig> = {
  '/api/ai/external/chat': { windowMs: 60_000, maxRequests: 60 },
  '/api/admin/aurora/chat': { windowMs: 60_000, maxRequests: 30 },
  default: { windowMs: 60_000, maxRequests: 100 },
};

export function createAIMetrics(): AIMetrics {
  return {
    totalRequests: 0,
    totalErrors: 0,
    byProvider: {},
    byModel: {},
    byUser: {},
    byEndpoint: {},
    lastRequestAt: 0,
    lastErrorAt: 0,
    errorRate: 0,
  };
}

export function createRateLimiter(
  config: Record<string, RateLimitConfig> = DEFAULT_CONFIG
) {
  const windows: Map<string, { ts: number[] }> = new Map();

  return function checkRateLimit(
    endpoint: string,
    key: string
  ): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const cfg = config[endpoint] || config.default || { windowMs: 60_000, maxRequests: 100 };
    const windowKey = `${endpoint}:${key}`;
    const window = windows.get(windowKey) || { ts: [] };

    window.ts = window.ts.filter(t => now - t < cfg.windowMs);

    if (window.ts.length >= cfg.maxRequests) {
      windows.set(windowKey, window);
      const oldestTs = window.ts[0];
      const resetMs = oldestTs ? cfg.windowMs - (now - oldestTs) : cfg.windowMs;
      return { allowed: false, remaining: 0, resetMs };
    }

    window.ts.push(now);
    windows.set(windowKey, window);

    return {
      allowed: true,
      remaining: cfg.maxRequests - window.ts.length,
      resetMs: cfg.windowMs,
    };
  };
}

export function sanitizeForLog(data: unknown): unknown {
  const sensitiveKeys = ['apiKey', 'api_key', 'Authorization', 'token', 'password', 'secret'];

  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLog(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = typeof value === 'string' && value.length > 4
        ? `${value.slice(0, 4)}...`
        : '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLog(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export class AIAuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 1000;

  log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    this.logs.push({ ...entry, timestamp: Date.now() });
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getLogs(limit = 100): AuditLogEntry[] {
    return this.logs.slice(-limit);
  }

  getRecentByUser(userId: string, limit = 50): AuditLogEntry[] {
    return this.logs.filter(l => l.userId === userId).slice(-limit);
  }

  getErrors(limit = 100): AuditLogEntry[] {
    return this.logs.filter(l => !l.success).slice(-limit);
  }
}

export function updateMetrics(
  metrics: AIMetrics,
  entry: {
    userId?: string;
    provider?: string;
    model?: string;
    endpoint: string;
    success: boolean;
    durationMs: number;
  }
): void {
  metrics.totalRequests++;
  metrics.lastRequestAt = Date.now();

  if (entry.userId) {
    metrics.byUser[entry.userId] = (metrics.byUser[entry.userId] || 0) + 1;
  }

  if (entry.provider) {
    metrics.byProvider[entry.provider] = (metrics.byProvider[entry.provider] || 0) + 1;
  }

  if (entry.model) {
    metrics.byModel[entry.model] = (metrics.byModel[entry.model] || 0) + 1;
  }

  if (!metrics.byEndpoint[entry.endpoint]) {
    metrics.byEndpoint[entry.endpoint] = { requests: 0, errors: 0 };
  }
  metrics.byEndpoint[entry.endpoint].requests++;

  if (!entry.success) {
    metrics.totalErrors++;
    metrics.lastErrorAt = Date.now();
    metrics.byEndpoint[entry.endpoint].errors++;
  }

  metrics.errorRate = metrics.totalRequests > 0
    ? (metrics.totalErrors / metrics.totalRequests) * 100
    : 0;
}
