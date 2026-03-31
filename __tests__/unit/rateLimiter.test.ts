import { describe, it, expect, beforeEach } from 'vitest';
import {
  createRateLimiter,
  createAIMetrics,
  sanitizeForLog,
  updateMetrics,
  AIAuditLogger,
  type AIMetrics,
} from '../../lib/ai/rateLimiter';

describe('AIMetrics', () => {
  it('should track metrics by user', () => {
    const metrics = createAIMetrics();
    expect(metrics.byUser).toEqual({});
    
    metrics.byUser['user1'] = 10;
    metrics.byUser['user2'] = 5;
    
    expect(metrics.byUser['user1']).toBe(10);
    expect(metrics.byUser['user2']).toBe(5);
  });

  it('should calculate error rate correctly', () => {
    const metrics = createAIMetrics();
    metrics.totalRequests = 100;
    metrics.totalErrors = 5;
    metrics.errorRate = metrics.totalErrors / metrics.totalRequests;
    
    expect(metrics.errorRate).toBe(0.05);
  });
});

describe('sanitizeForLog', () => {
  it('should truncate authorization headers', () => {
    const headers = { 'Authorization': 'Bearer secret-token', 'Content-Type': 'application/json' };
    const sanitized = sanitizeForLog(headers) as Record<string, unknown>;
    
    expect(sanitized['Authorization']).toBe('Bear...');
    expect(sanitized['Content-Type']).toBe('application/json');
  });

  it('should handle cookie headers', () => {
    const headers = { 'Cookie': 'session=abc123', 'Accept': '*/*' };
    const sanitized = sanitizeForLog(headers) as Record<string, unknown>;
    
    expect(sanitized['Accept']).toBe('*/*');
  });

  it('should handle empty headers', () => {
    const sanitized = sanitizeForLog({});
    expect(sanitized).toEqual({});
  });

  it('should sanitize api keys', () => {
    const data = { 'apiKey': 'secret123456', 'name': 'test' };
    const sanitized = sanitizeForLog(data) as Record<string, unknown>;
    
    expect(sanitized['apiKey']).toBe('secr...');
    expect(sanitized['name']).toBe('test');
  });

  it('should handle short sensitive values', () => {
    const data = { 'token': 'abc' };
    const sanitized = sanitizeForLog(data) as Record<string, unknown>;
    
    expect(sanitized['token']).toBe('[REDACTED]');
  });

  it('should sanitize nested objects', () => {
    const data = { 'user': { 'password': 'supersecret' } };
    const sanitized = sanitizeForLog(data) as Record<string, unknown>;
    
    expect((sanitized['user'] as Record<string, unknown>)['password']).toBe('supe...');
  });

  it('should handle arrays', () => {
    const data = [{ 'token': 'abc123' }, { 'token': 'def456' }];
    const sanitized = sanitizeForLog(data) as Array<Record<string, unknown>>;
    
    expect(sanitized[0]['token']).toBe('abc1...');
    expect(sanitized[1]['token']).toBe('def4...');
  });
});

describe('rateLimiter', () => {
  describe('createRateLimiter', () => {
    it('should allow requests within limit', () => {
      const check = createRateLimiter();
      const result = check('/api/test', 'user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should block requests exceeding limit', () => {
      const check = createRateLimiter({ '/api/test': { windowMs: 60_000, maxRequests: 2 } });
      
      expect(check('/api/test', 'user1').allowed).toBe(true);
      expect(check('/api/test', 'user1').allowed).toBe(true);
      
      const blocked = check('/api/test', 'user1');
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });

    it('should track different users separately', () => {
      const check = createRateLimiter({ '/api/test': { windowMs: 60_000, maxRequests: 1 } });
      
      expect(check('/api/test', 'user1').allowed).toBe(true);
      expect(check('/api/test', 'user2').allowed).toBe(true);
    });

    it('should track different endpoints separately', () => {
      const checkA = createRateLimiter({
        '/api/a': { windowMs: 60_000, maxRequests: 1 },
      });
      const checkB = createRateLimiter({
        '/api/b': { windowMs: 60_000, maxRequests: 1 },
      });
      
      expect(checkA('/api/a', 'user1').allowed).toBe(true);
      expect(checkB('/api/b', 'user1').allowed).toBe(true);
      
      expect(checkA('/api/a', 'user1').allowed).toBe(false);
      expect(checkB('/api/b', 'user1').allowed).toBe(false);
    });

    it('should return correct remaining count', () => {
      const check = createRateLimiter({ '/api/test': { windowMs: 60_000, maxRequests: 5 } });
      
      expect(check('/api/test', 'user1').remaining).toBe(4);
      expect(check('/api/test', 'user1').remaining).toBe(3);
      expect(check('/api/test', 'user1').remaining).toBe(2);
    });
  });

  describe('createAIMetrics', () => {
    it('should initialize with zero values', () => {
      const metrics = createAIMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.totalErrors).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.byProvider).toEqual({});
      expect(metrics.byUser).toEqual({});
    });
  });

  describe('updateMetrics', () => {
    it('should increment total requests', () => {
      const metrics = createAIMetrics();
      updateMetrics(metrics, { endpoint: '/api/test', success: true, durationMs: 100 });
      expect(metrics.totalRequests).toBe(1);
    });

    it('should track by user', () => {
      const metrics = createAIMetrics();
      updateMetrics(metrics, { userId: 'user1', endpoint: '/api/test', success: true, durationMs: 100 });
      updateMetrics(metrics, { userId: 'user1', endpoint: '/api/test', success: true, durationMs: 100 });
      updateMetrics(metrics, { userId: 'user2', endpoint: '/api/test', success: true, durationMs: 100 });
      expect(metrics.byUser['user1']).toBe(2);
      expect(metrics.byUser['user2']).toBe(1);
    });

    it('should track by provider', () => {
      const metrics = createAIMetrics();
      updateMetrics(metrics, { provider: 'groq', endpoint: '/api/test', success: true, durationMs: 100 });
      updateMetrics(metrics, { provider: 'openrouter', endpoint: '/api/test', success: true, durationMs: 100 });
      expect(metrics.byProvider['groq']).toBe(1);
      expect(metrics.byProvider['openrouter']).toBe(1);
    });

    it('should track by model', () => {
      const metrics = createAIMetrics();
      updateMetrics(metrics, { model: 'llama-3.3', endpoint: '/api/test', success: true, durationMs: 100 });
      expect(metrics.byModel['llama-3.3']).toBe(1);
    });

    it('should track by endpoint', () => {
      const metrics = createAIMetrics();
      updateMetrics(metrics, { endpoint: '/api/ai/chat', success: true, durationMs: 100 });
      updateMetrics(metrics, { endpoint: '/api/ai/chat', success: false, durationMs: 100 });
      expect(metrics.byEndpoint['/api/ai/chat']).toEqual({ requests: 2, errors: 1 });
    });

    it('should calculate error rate', () => {
      const metrics = createAIMetrics();
      updateMetrics(metrics, { endpoint: '/api/test', success: true, durationMs: 100 });
      updateMetrics(metrics, { endpoint: '/api/test', success: true, durationMs: 100 });
      updateMetrics(metrics, { endpoint: '/api/test', success: true, durationMs: 100 });
      updateMetrics(metrics, { endpoint: '/api/test', success: false, durationMs: 100 });
      expect(metrics.totalRequests).toBe(4);
      expect(metrics.totalErrors).toBe(1);
      expect(metrics.errorRate).toBe(25);
    });

    it('should update lastRequestAt and lastErrorAt', () => {
      const metrics = createAIMetrics();
      const before = Date.now();
      updateMetrics(metrics, { endpoint: '/api/test', success: true, durationMs: 100 });
      expect(metrics.lastRequestAt).toBeGreaterThanOrEqual(before);
      
      updateMetrics(metrics, { endpoint: '/api/test', success: false, durationMs: 100 });
      expect(metrics.lastErrorAt).toBeGreaterThanOrEqual(before);
    });
  });

  describe('sanitizeForLog', () => {
    it('should redact sensitive keys', () => {
      const result = sanitizeForLog({
        apiKey: 'sk-1234567890abcdef',
        username: 'testuser',
      }) as Record<string, unknown>;
      expect(result.apiKey).toBe('sk-1...');
      expect(result.username).toBe('testuser');
    });

    it('should handle nested objects', () => {
      const result = sanitizeForLog({
        config: {
          apiKey: 'secret123',
          setting: 'value',
        },
      }) as Record<string, unknown>;
      const config = result.config as Record<string, unknown>;
      expect(config.apiKey).toBe('secr...');
    });

    it('should handle arrays', () => {
      const result = sanitizeForLog([
        { apiKey: 'secretkey123' },
        { apiKey: 'anotherkey456' },
      ]);
      expect(Array.isArray(result)).toBe(true);
      const arr = result as Record<string, unknown>[];
      expect(arr[0].apiKey).toBe('secr...');
    });
  });

  describe('AIAuditLogger', () => {
    it('should log entries', () => {
      const logger = new AIAuditLogger();
      logger.log({
        requestId: 'req-123',
        endpoint: '/api/ai/chat',
        success: true,
        durationMs: 150,
      });
      expect(logger.getLogs().length).toBe(1);
    });

    it('should limit stored logs', () => {
      const logger = new AIAuditLogger();
      for (let i = 0; i < 1005; i++) {
        logger.log({ requestId: `req-${i}`, endpoint: '/api/test', success: true, durationMs: 100 });
      }
      expect(logger.getLogs(1000).length).toBe(1000);
    });

    it('should filter by user', () => {
      const logger = new AIAuditLogger();
      logger.log({ requestId: '1', userId: 'user1', endpoint: '/api/test', success: true, durationMs: 100 });
      logger.log({ requestId: '2', userId: 'user2', endpoint: '/api/test', success: true, durationMs: 100 });
      logger.log({ requestId: '3', userId: 'user1', endpoint: '/api/test', success: true, durationMs: 100 });
      expect(logger.getRecentByUser('user1').length).toBe(2);
    });

    it('should filter errors', () => {
      const logger = new AIAuditLogger();
      logger.log({ requestId: '1', endpoint: '/api/test', success: true, durationMs: 100 });
      logger.log({ requestId: '2', endpoint: '/api/test', success: false, durationMs: 100, errorMessage: 'fail' });
      logger.log({ requestId: '3', endpoint: '/api/test', success: false, durationMs: 100, errorMessage: 'fail2' });
      const errors = logger.getErrors();
      expect(errors.length).toBe(2);
      expect(errors.every(e => !e.success)).toBe(true);
    });
  });
});
