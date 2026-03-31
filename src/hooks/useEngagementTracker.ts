import { useEffect, useRef, useCallback, useState } from 'react';
import { UserSignalsService } from '../services/analytics/userSignals';

interface UseEngagementTrackerOptions {
  userId?: string;
  enabled?: boolean;
  trackScrollDepth?: boolean;
  trackTimeOnPage?: boolean;
  trackIdleTime?: boolean;
  idleThresholdMs?: number;
  onEngagementChange?: (engagement: EngagementState) => void;
}

export interface EngagementState {
  scrollDepth: number;
  timeOnPage: number;
  isIdle: boolean;
  lastActivityAt: number;
}

interface UseEngagementTrackerReturn {
  scrollDepth: number;
  timeOnPage: number;
  isIdle: boolean;
  engagement: EngagementState;
  recordActivity: () => void;
  resetTimer: () => void;
}

export function useEngagementTracker({
  userId,
  enabled = true,
  trackScrollDepth = true,
  trackTimeOnPage = true,
  trackIdleTime = false,
  idleThresholdMs = 30000,
  onEngagementChange,
}: UseEngagementTrackerOptions = {}): UseEngagementTrackerReturn {
  const [scrollDepth, setScrollDepth] = useState(0);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const [lastActivityAt, setLastActivityAt] = useState(Date.now());

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxScrollRef = useRef<number>(0);

  const recordActivity = useCallback(() => {
    setLastActivityAt(Date.now());
    if (isIdle) setIsIdle(false);
  }, [isIdle]);

  const resetTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setTimeOnPage(0);
    maxScrollRef.current = 0;
    setScrollDepth(0);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    if (trackTimeOnPage) {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const seconds = Math.floor(elapsed / 1000);
        setTimeOnPage(seconds);

        if (userId && userId !== 'guest') {
          UserSignalsService.updateEngagementMetrics(userId, 'time_on_page', seconds);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, trackTimeOnPage, userId]);

  useEffect(() => {
    if (!enabled || !trackScrollDepth) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      if (scrollPercentage > maxScrollRef.current) {
        maxScrollRef.current = scrollPercentage;
        setScrollDepth(scrollPercentage);

        if (userId && userId !== 'guest') {
          UserSignalsService.updateEngagementMetrics(userId, 'scroll_depth', scrollPercentage);
          UserSignalsService.track('scroll_depth', userId, undefined, { depth: scrollPercentage });
        }
      }

      recordActivity();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled, trackScrollDepth, userId, recordActivity]);

  useEffect(() => {
    if (!enabled || !trackIdleTime) return;

    const checkIdle = () => {
      const idleTime = Date.now() - lastActivityAt;
      if (idleTime >= idleThresholdMs && !isIdle) {
        setIsIdle(true);
      }
    };

    idleTimerRef.current = setInterval(checkIdle, 5000);

    const handleActivity = () => recordActivity();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [enabled, trackIdleTime, idleThresholdMs, lastActivityAt, isIdle, recordActivity]);

  useEffect(() => {
    if (!enabled || !onEngagementChange) return;

    const engagement: EngagementState = {
      scrollDepth,
      timeOnPage,
      isIdle,
      lastActivityAt,
    };

    onEngagementChange(engagement);
  }, [enabled, scrollDepth, timeOnPage, isIdle, lastActivityAt, onEngagementChange]);

  const engagement: EngagementState = {
    scrollDepth,
    timeOnPage,
    isIdle,
    lastActivityAt,
  };

  return {
    scrollDepth,
    timeOnPage,
    isIdle,
    engagement,
    recordActivity,
    resetTimer,
  };
}

export default useEngagementTracker;
