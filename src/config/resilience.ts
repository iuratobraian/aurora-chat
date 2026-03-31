/**
 * Resilience Configuration
 * 
 * Centralized configuration for error handling, caching, and retry logic
 * across the TradeShare application.
 */

export const RESILIENCE_CONFIG = {
  // Time to consider data "stale" (in milliseconds)
  STALE_THRESHOLD: 5 * 60 * 1000, // 5 minutes

  // Interval between automatic retries (in milliseconds)
  RETRY_INTERVAL: 10 * 1000, // 10 seconds

  // Maximum number of retries before permanent error
  MAX_RETRIES: 5,

  // Cache time-to-live (automatic cleanup)
  CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours

  // Auto-dismiss time for error toasts (in milliseconds)
  TOAST_AUTO_DISMISS: 5 * 1000, // 5 seconds

  // Badge colors based on data freshness
  BADGE_COLORS: {
    FRESH: 'text-green-400',      // < 5 min
    STALE: 'text-yellow-400',     // 5-15 min
    OLD: 'text-red-400',          // > 15 min
  },

  // Z-index for error toasts (must be high)
  TOAST_Z_INDEX: 9999,

  // Enable/disable error logging
  LOG_ERRORS: true,

  // Enable/disable automatic reporting to external services (e.g., Sentry)
  REPORT_TO_EXTERNAL: false,
} as const;

/**
 * Cache time thresholds for visual indicators
 */
export const CACHE_THRESHOLDS = {
  FRESH: 5 * 60 * 1000,      // 5 minutes - Green
  STALE: 15 * 60 * 1000,     // 15 minutes - Yellow
  // > 15 minutes - Red
} as const;

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  INTERVAL: RESILIENCE_CONFIG.RETRY_INTERVAL,
  MAX_ATTEMPTS: RESILIENCE_CONFIG.MAX_RETRIES,
} as const;
