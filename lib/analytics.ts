import React from 'react';
import logger from './utils/logger';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN && import.meta.env.PROD) {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }).catch(() => {
    logger.warn('Sentry not loaded');
  });
}

export function initAnalytics() {
  if (import.meta.env.PROD) {
    const analytics = (window as any).plausible;
    if (analytics) {
      analytics('pageview');
    }
  }
}

export function trackEvent(eventName: string, props?: Record<string, any>) {
  if (import.meta.env.PROD) {
    const analytics = (window as any).plausible;
    if (analytics) {
      analytics(eventName, { props });
    }
    const sentry = (window as any).Sentry;
    if (sentry) {
      sentry.captureMessage(eventName, { extra: props });
    }
  }
}

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    initAnalytics();
  }, []);
  return React.createElement(React.Fragment, null, children);
}
