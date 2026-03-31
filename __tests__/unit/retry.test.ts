import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, NetworkRetry } from '../../src/lib/retry';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return result on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    
    const result = withRetry(fn);
    await vi.runAllTimersAsync();
    
    expect(result).resolves.toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    const promise = withRetry(fn, { maxAttempts: 3 });
    
    await vi.runAllTimersAsync();
    const result = await promise;
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));
    
    const rejection = expect(withRetry(fn, { maxAttempts: 2 })).rejects.toThrow('always fails');
    
    await vi.runAllTimersAsync();
    
    await rejection;
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn();
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    const promise = withRetry(fn, {
      maxAttempts: 3,
      onRetry,
    });
    
    await vi.runAllTimersAsync();
    await promise;
    
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), expect.any(Number));
  });
});

describe('NetworkRetry', () => {
  describe('isRetryableError', () => {
    it('should return false for null/undefined', () => {
      expect(NetworkRetry.isRetryableError(null)).toBe(false);
      expect(NetworkRetry.isRetryableError(undefined)).toBe(false);
    });

    it('should return true for connection errors', () => {
      expect(NetworkRetry.isRetryableError({ code: 'ECONNRESET' })).toBe(true);
      expect(NetworkRetry.isRetryableError({ code: 'ETIMEDOUT' })).toBe(true);
    });

    it('should return true for fetch errors', () => {
      expect(NetworkRetry.isRetryableError(new Error('fetch failed'))).toBe(true);
    });

    it('should return true for 429 and 5xx status', () => {
      expect(NetworkRetry.isRetryableError({ status: 429 })).toBe(true);
      expect(NetworkRetry.isRetryableError({ status: 500 })).toBe(true);
      expect(NetworkRetry.isRetryableError({ status: 503 })).toBe(true);
    });

    it('should return false for 4xx status (except 429)', () => {
      expect(NetworkRetry.isRetryableError({ status: 400 })).toBe(false);
      expect(NetworkRetry.isRetryableError({ status: 404 })).toBe(false);
      expect(NetworkRetry.isRetryableError({ status: 401 })).toBe(false);
    });

    it('should return false for client errors', () => {
      expect(NetworkRetry.isRetryableError(new Error('bad request'))).toBe(false);
    });
  });

  describe('defaultRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should use default retry options', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce({ status: 500 })
        .mockResolvedValue('success');
      
      const promise = NetworkRetry.defaultRetry(fn);
      await vi.runAllTimersAsync();
      
      expect(await promise).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
