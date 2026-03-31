export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  onRetry?: (attempt: number, error: Error, delay: number) => void;
  retryableErrors?: ((error: unknown) => boolean) | RegExp;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  onRetry: () => {},
  retryableErrors: () => true,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const exponentialDelay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, options.maxDelay);
  
  if (options.jitter) {
    const jitterAmount = cappedDelay * 0.3 * Math.random();
    return Math.floor(cappedDelay + jitterAmount);
  }
  
  return cappedDelay;
}

function isRetryable(error: unknown, retryableErrors: RetryOptions['retryableErrors']): boolean {
  if (!error) return false;
  
  if (typeof retryableErrors === 'function') {
    return retryableErrors(error);
  }
  
  if (retryableErrors instanceof RegExp) {
    const message = error instanceof Error ? error.message : String(error);
    return retryableErrors.test(message);
  }
  
  return true;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts: Required<RetryOptions> = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === opts.maxAttempts) {
        throw lastError;
      }
      
      if (!isRetryable(error, opts.retryableErrors)) {
        throw lastError;
      }
      
      const delay = calculateDelay(attempt, opts);
      opts.onRetry(attempt, lastError, delay);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

export function fetchWithRetry<T>(
  url: string,
  options: RequestInit & RetryOptions = {}
): Promise<T> {
  const { maxAttempts, baseDelay, onRetry, retryableErrors, ...fetchOptions } = options;
  
  return withRetry(
    async () => {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        (error as Error & { status: number }).status = response.status;
        throw error;
      }
      
      return response.json() as Promise<T>;
    },
    { maxAttempts, baseDelay, onRetry, retryableErrors }
  );
}

export class NetworkRetry {
  static readonly RETRYABLE_CODES = new Set([
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'EPIPE',
    'ENETUNREACH',
  ]);

  static readonly RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

  static isRetryableError(error: unknown): boolean {
    if (error === null || error === undefined) {
      return false;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('fetch failed') || 
          message.includes('network error') ||
          message.includes('failed to fetch')) {
        return true;
      }

      if ('code' in error && typeof error.code === 'string') {
        return this.RETRYABLE_CODES.has(error.code);
      }
    }

    if (typeof error === 'object' && error !== null) {
      const err = error as Record<string, unknown>;
      
      if ('status' in err && typeof err.status === 'number') {
        return this.RETRYABLE_STATUSES.has(err.status);
      }
      
      if ('code' in err && typeof err.code === 'string') {
        return this.RETRYABLE_CODES.has(err.code);
      }
    }

    return false;
  }

  static defaultRetry<T>(fn: () => Promise<T>): Promise<T> {
    return withRetry(fn, {
      maxAttempts: 3,
      baseDelay: 1000,
      backoffMultiplier: 2,
      jitter: true,
      onRetry: (attempt, error) => {
        console.warn(`Retry attempt ${attempt} after error:`, error.message);
      },
      retryableErrors: (error) => this.isRetryableError(error),
    });
  }

  static withExponentialBackoff<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelay?: number;
      maxDelay?: number;
    } = {}
  ): Promise<T> {
    return withRetry(fn, {
      maxAttempts: options.maxAttempts ?? 5,
      baseDelay: options.baseDelay ?? 2000,
      maxDelay: options.maxDelay ?? 60000,
      backoffMultiplier: 2,
      jitter: true,
      retryableErrors: (error) => this.isRetryableError(error),
    });
  }
}
