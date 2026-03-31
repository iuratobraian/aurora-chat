/**
 * Circuit Breaker Implementation - AUD-012
 * 
 * Prevents cascading failures in external service calls by implementing
 * the circuit breaker pattern with automatic recovery.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms before attempting recovery */
  resetTimeout: number;
  /** Number of successful calls needed to close circuit from half-open */
  successThreshold: number;
  /** Optional: Monitor function for observability */
  onStateChange?: (state: CircuitState, error?: Error) => void;
}

interface CircuitStats {
  failures: number;
  successes: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  state: CircuitState;
  nextAttempt?: number;
}

/**
 * Circuit Breaker class for resilient external service calls
 * 
 * States:
 * - CLOSED: Normal operation, requests flow through
 * - OPEN: Circuit tripped, requests fail fast
 * - HALF_OPEN: Testing recovery, limited requests allowed
 */
export class CircuitBreaker<T = any> {
  private readonly options: Required<CircuitBreakerOptions>;
  private readonly stats: CircuitStats;
  private readonly name: string;

  constructor(name: string, options?: Partial<CircuitBreakerOptions>) {
    this.name = name;
    this.options = {
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      successThreshold: 2,
      onStateChange: () => {},
      ...options,
    };
    
    this.stats = {
      failures: 0,
      successes: 0,
      state: 'CLOSED',
    };
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute(fn: () => Promise<T>): Promise<T> {
    if (this.stats.state === 'OPEN') {
      if (Date.now() < (this.stats.nextAttempt || 0)) {
        const error = new Error(`Circuit breaker OPEN for ${this.name}`);
        (error as any).code = 'CIRCUIT_OPEN';
        throw error;
      }
      // Try recovery
      this.stats.state = 'HALF_OPEN';
      this.options.onStateChange('HALF_OPEN');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  /**
   * Execute with fallback function on failure
   */
  async executeWithFallback<U>(
    primary: () => Promise<U>,
    fallback: () => Promise<U>
  ): Promise<U> {
    try {
      return await this.executeAsync(primary);
    } catch (error) {
      console.warn(`[${this.name}] Circuit breaker failed, using fallback`);
      return await fallback();
    }
  }

  /**
   * Internal execute that doesn't conflict with generics
   */
  private async executeAsync<U>(fn: () => Promise<U>): Promise<U> {
    if (this.stats.state === 'OPEN') {
      if (Date.now() < (this.stats.nextAttempt || 0)) {
        const error = new Error(`Circuit breaker OPEN for ${this.name}`);
        (error as any).code = 'CIRCUIT_OPEN';
        throw error;
      }
      // Try recovery
      this.stats.state = 'HALF_OPEN';
      this.options.onStateChange('HALF_OPEN');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  private onSuccess(): void {
    this.stats.successes++;
    this.stats.lastSuccessTime = Date.now();

    if (this.stats.state === 'HALF_OPEN') {
      if (this.stats.successes >= this.options.successThreshold) {
        this.closeCircuit();
      }
    } else {
      // Reset failure count on success in CLOSED state
      this.stats.failures = 0;
    }
  }

  private onFailure(error: Error): void {
    this.stats.failures++;
    this.stats.lastFailureTime = Date.now();

    if (this.stats.failures >= this.options.failureThreshold) {
      this.openCircuit(error);
    }
  }

  private openCircuit(error: Error): void {
    this.stats.state = 'OPEN';
    this.stats.nextAttempt = Date.now() + this.options.resetTimeout;
    this.stats.successes = 0;
    this.options.onStateChange('OPEN', error);
    console.warn(`[${this.name}] Circuit breaker OPENED after ${this.stats.failures} failures`);
  }

  private closeCircuit(): void {
    this.stats.state = 'CLOSED';
    this.stats.failures = 0;
    this.stats.successes = 0;
    this.stats.nextAttempt = undefined;
    this.options.onStateChange('CLOSED');
    console.log(`[${this.name}] Circuit breaker CLOSED after successful recovery`);
  }

  /**
   * Get current circuit state and stats
   */
  getState(): { state: CircuitState; stats: CircuitStats } {
    return { state: this.stats.state, stats: { ...this.stats } };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.stats.failures = 0;
    this.stats.successes = 0;
    this.stats.state = 'CLOSED';
    this.stats.nextAttempt = undefined;
    this.options.onStateChange('CLOSED');
  }
}

/**
 * Pre-configured circuit breakers for external services
 */
export const serviceCircuitBreakers = {
  googleOAuth: new CircuitBreaker('GoogleOAuth', {
    failureThreshold: 3,
    resetTimeout: 60000, // 1 minute
    successThreshold: 2,
  }),
  
  mercadoPago: new CircuitBreaker('MercadoPago', {
    failureThreshold: 3,
    resetTimeout: 30000, // 30 seconds
    successThreshold: 2,
  }),
  
  convex: new CircuitBreaker('Convex', {
    failureThreshold: 5,
    resetTimeout: 15000, // 15 seconds
    successThreshold: 3,
  }),
  
  instagram: new CircuitBreaker('Instagram', {
    failureThreshold: 3,
    resetTimeout: 60000, // 1 minute
    successThreshold: 2,
  }),
  
  huggingFace: new CircuitBreaker('HuggingFace', {
    failureThreshold: 3,
    resetTimeout: 30000, // 30 seconds
    successThreshold: 2,
  }),
};

/**
 * Create a circuit breaker middleware for Express
 */
export function createCircuitBreakerMiddleware() {
  return (req: any, res: any, next: any) => {
    // Attach circuit breaker status to request for monitoring
    req.circuitBreakers = serviceCircuitBreakers;
    next();
  };
}
