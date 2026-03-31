import { useCallback } from 'react';
import { UserSignalsService, type SignalType } from '../services/analytics/userSignals';

interface UseUserSignalsOptions {
  userId?: string;
  enabled?: boolean;
}

interface UseUserSignalsReturn {
  track: (type: SignalType, targetId?: string, metadata?: Record<string, unknown>) => void;
  trackLike: (targetId: string, metadata?: Record<string, unknown>) => void;
  trackComment: (targetId: string, metadata?: Record<string, unknown>) => void;
  trackPostView: (targetId: string, targetType: 'post' | 'comment' | 'signal' | 'user', scrollDepth?: number) => void;
  trackSignalView: (signalId: string, pair: string) => void;
  trackSearch: (query: string) => void;
  trackPostCreated: (targetId: string, metadata?: Record<string, unknown>) => void;
  trackShare: (targetId: string, metadata?: Record<string, unknown>) => void;
  trackFollow: (targetId: string) => void;
  trackSignalTap: (signalId: string, pair: string) => void;
  trackWatchlistAdd: (pair: string) => void;
  trackWatchlistRemove: (pair: string) => void;
  trackCTAClick: (ctaId: string, metadata?: Record<string, unknown>) => void;
  getProfile: () => ReturnType<typeof UserSignalsService.getInterestProfile>;
  getTopInterests: (limit?: number) => ReturnType<typeof UserSignalsService.getTopInterests>;
  getEngagementMetrics: () => ReturnType<typeof UserSignalsService.getEngagementMetrics>;
  flushSignals: () => ReturnType<typeof UserSignalsService.flushSignals>;
  clearProfile: () => void;
}

export function useUserSignals({
  userId,
  enabled = true,
}: UseUserSignalsOptions = {}): UseUserSignalsReturn {
  const track = useCallback(
    (type: SignalType, targetId?: string, metadata?: Record<string, unknown>) => {
      if (!enabled || !userId || userId === 'guest') return;
      UserSignalsService.track(type, userId, targetId, metadata);
    },
    [enabled, userId]
  );

  const trackLike = useCallback(
    (targetId: string, metadata?: Record<string, unknown>) => {
      track('like_given', targetId, metadata);
    },
    [track]
  );

  const trackComment = useCallback(
    (targetId: string, metadata?: Record<string, unknown>) => {
      track('comment_given', targetId, metadata);
    },
    [track]
  );

  const trackPostView = useCallback(
    (targetId: string, targetType: 'post' | 'comment' | 'signal' | 'user' = 'post', scrollDepth = 0) => {
      UserSignalsService.trackPageView(userId || 'guest', targetId, targetType, scrollDepth);
    },
    [userId]
  );

  const trackSignalView = useCallback(
    (signalId: string, pair: string) => {
      if (!enabled || !userId) return;
      UserSignalsService.trackSignalView(userId, signalId, pair);
    },
    [enabled, userId]
  );

  const trackSearch = useCallback(
    (query: string) => {
      if (!enabled || !userId) return;
      UserSignalsService.trackSearch(userId, query);
    },
    [enabled, userId]
  );

  const trackPostCreated = useCallback(
    (targetId: string, metadata?: Record<string, unknown>) => {
      track('post_created', targetId, metadata);
    },
    [track]
  );

  const trackShare = useCallback(
    (targetId: string, metadata?: Record<string, unknown>) => {
      track('post_shared', targetId, metadata);
    },
    [track]
  );

  const trackFollow = useCallback(
    (targetId: string) => {
      track('follow_given', targetId);
    },
    [track]
  );

  const trackSignalTap = useCallback(
    (signalId: string, pair: string) => {
      if (!enabled || !userId) return;
      UserSignalsService.track('signal_tapped', userId, signalId, { pair });
    },
    [enabled, userId]
  );

  const trackWatchlistAdd = useCallback(
    (pair: string) => {
      track('watchlist_added', undefined, { pair });
    },
    [track]
  );

  const trackWatchlistRemove = useCallback(
    (pair: string) => {
      track('watchlist_removed', undefined, { pair });
    },
    [track]
  );

  const trackCTAClick = useCallback(
    (ctaId: string, metadata?: Record<string, unknown>) => {
      track('cta_clicked', undefined, { ctaId, ...metadata });
    },
    [track]
  );

  const getProfile = useCallback(() => {
    if (!userId) return null;
    return UserSignalsService.getInterestProfile(userId);
  }, [userId]);

  const getTopInterests = useCallback(
    (limit = 5) => {
      if (!userId) return { pairs: [], categories: [] };
      return UserSignalsService.getTopInterests(userId, limit);
    },
    [userId]
  );

  const getEngagementMetrics = useCallback(() => {
    if (!userId) return null;
    return UserSignalsService.getEngagementMetrics(userId);
  }, [userId]);

  const flushSignals = useCallback(() => {
    return UserSignalsService.flushSignals();
  }, []);

  const clearProfile = useCallback(() => {
    if (!userId) return;
    UserSignalsService.clearProfile(userId);
  }, [userId]);

  return {
    track,
    trackLike,
    trackComment,
    trackPostView,
    trackSignalView,
    trackSearch,
    trackPostCreated,
    trackShare,
    trackFollow,
    trackSignalTap,
    trackWatchlistAdd,
    trackWatchlistRemove,
    trackCTAClick,
    getProfile,
    getTopInterests,
    getEngagementMetrics,
    flushSignals,
    clearProfile,
  };
}

export default useUserSignals;
