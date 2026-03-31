import logger from '../../utils/logger';

export type SignalType =
  | 'like_given'
  | 'comment_given'
  | 'post_created'
  | 'post_viewed'
  | 'post_shared'
  | 'follow_given'
  | 'signal_viewed'
  | 'signal_tapped'
  | 'search_query'
  | 'watchlist_added'
  | 'watchlist_removed'
  | 'scroll_depth'
  | 'time_on_page'
  | 'cta_clicked'
  | 'onboarding_started'
  | 'onboarding_step_viewed'
  | 'onboarding_completed'
  | 'onboarding_dropped'
  | 'upgrade_cta_viewed'
  | 'upgrade_cta_clicked'
  | 'upgrade_converted';

export interface UserSignalEvent {
  id: string;
  userId: string;
  type: SignalType;
  targetId?: string;
  targetType?: 'post' | 'comment' | 'signal' | 'user' | 'course' | 'search';
  metadata?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

export interface UserInterestProfile {
  userId: string;
  pairs: Record<string, number>;
  categories: Record<string, number>;
  authors: Record<string, number>;
  signals: Record<string, number>;
  lastUpdated: number;
}

export interface UserEngagementMetrics {
  userId: string;
  totalLikesGiven: number;
  totalCommentsGiven: number;
  totalPostsCreated: number;
  totalSignalsViewed: number;
  totalSignalsTapped: number;
  avgTimeOnFeed: number;
  avgScrollDepth: number;
  lastSeen: number;
  streak: number;
  activeDays: number;
}

export interface CohortData {
  cohortId: string;
  cohortLabel: string;
  cohortDate: number;
  userCount: number;
  retentionByDay: Record<number, number>;
}

export interface RetentionMetrics {
  userId: string;
  signupDate: number;
  activeDays: number;
  retentionByDay: Record<number, boolean>;
  lastRetentionCheck: number;
}

export interface CohortAnalysisResult {
  cohort: CohortData;
  totalUsers: number;
  retainedUsers: Record<number, number>;
  retentionRate: Record<number, number>;
}

const SIGNALS_KEY = 'user_signals_queue';
const PROFILE_KEY = 'user_interest_profile';
const METRICS_KEY = 'user_engagement_metrics';
const MAX_SIGNALS_BATCH = 50;
const PROFILE_TTL_MS = 24 * 60 * 60 * 1000;
const RETENTION_KEY = 'user_retention_data';
const COHORT_KEY = 'user_cohort_data';
const RETENTION_CHECK_INTERVAL_MS = 60 * 60 * 1000;

const RETENTION_DAYS = [1, 3, 7, 14, 30, 60, 90];

function getWeekKey(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getDaysSinceDate(timestamp: number): number {
  return Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
}

function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch { return defaultVal; }
}

function setLocalItem(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    logger.warn('[UserSignals] Failed to write to localStorage:', e);
  }
}

function getSessionId(): string {
  let sid = sessionStorage.getItem('session_id');
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('session_id', sid);
  }
  return sid;
}

export const UserSignalsService = {
  track(type: SignalType, userId: string, targetId?: string, metadata?: Record<string, unknown>): void {
    if (!userId || userId === 'guest') return;

    const queue = getLocalItem<UserSignalEvent[]>(SIGNALS_KEY, []);
    const event: UserSignalEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId,
      type,
      targetId,
      metadata,
      timestamp: Date.now(),
      sessionId: getSessionId(),
    };

    queue.push(event);
    if (queue.length > MAX_SIGNALS_BATCH) queue.shift();
    setLocalItem(SIGNALS_KEY, queue);

    this.updateInterestProfile(userId, type, targetId, metadata);
  },

  trackPageView(userId: string, targetId: string, targetType: UserSignalEvent['targetType'], scrollDepth = 0): void {
    this.track('post_viewed', userId, targetId, { targetType, scrollDepth });
  },

  trackSearch(userId: string, query: string): void {
    this.track('search_query', userId, undefined, { query });
  },

  trackSignalView(userId: string, signalId: string, pair: string): void {
    this.track('signal_viewed', userId, signalId, { pair });
  },

  updateInterestProfile(
    userId: string,
    type: SignalType,
    targetId?: string,
    metadata?: Record<string, unknown>
  ): void {
    const profiles = getLocalItem<Record<string, UserInterestProfile>>(PROFILE_KEY, {});
    const profile = profiles[userId] || {
      userId,
      pairs: {},
      categories: {},
      authors: {},
      signals: {},
      lastUpdated: Date.now(),
    };

    const now = Date.now();
    if (now - profile.lastUpdated > PROFILE_TTL_MS) {
      const decay = 0.7;
      for (const key of Object.keys(profile.pairs)) profile.pairs[key] *= decay;
      for (const key of Object.keys(profile.categories)) profile.categories[key] *= decay;
      for (const key of Object.keys(profile.authors)) profile.authors[key] *= decay;
      for (const key of Object.keys(profile.signals)) profile.signals[key] *= decay;
    }

    const weight = 1;
    const pair = metadata?.pair as string | undefined;
    if (pair) profile.pairs[pair] = (profile.pairs[pair] || 0) + weight;

    const category = metadata?.category as string | undefined;
    if (category) profile.categories[category] = (profile.categories[category] || 0) + weight;

    const authorId = metadata?.authorId as string | undefined || targetId;
    if (authorId) profile.authors[authorId] = (profile.authors[authorId] || 0) + weight * 0.5;

    switch (type) {
      case 'like_given':
      case 'comment_given':
        if (targetId) profile.signals[targetId] = (profile.signals[targetId] || 0) + 2;
        break;
      case 'post_created':
        if (targetId) profile.signals[targetId] = (profile.signals[targetId] || 0) + 3;
        break;
      case 'signal_viewed':
      case 'signal_tapped':
        if (pair) profile.pairs[pair] = (profile.pairs[pair] || 0) + 0.5;
        break;
    }

    profile.lastUpdated = now;
    profiles[userId] = profile;
    setLocalItem(PROFILE_KEY, profiles);
  },

  getInterestProfile(userId: string): UserInterestProfile | null {
    const profiles = getLocalItem<Record<string, UserInterestProfile>>(PROFILE_KEY, {});
    return profiles[userId] || null;
  },

  getTopInterests(userId: string, limit = 5): { pairs: string[]; categories: string[] } {
    const profile = this.getInterestProfile(userId);
    if (!profile) return { pairs: [], categories: [] };

    const pairs = (Object.entries(profile.pairs) as [string, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([k]) => k);

    const categories = (Object.entries(profile.categories) as [string, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([k]) => k);

    return { pairs, categories };
  },

  updateEngagementMetrics(userId: string, type: SignalType, value?: number): void {
    const metricsMap = getLocalItem<Record<string, UserEngagementMetrics>>(METRICS_KEY, {});
    const metrics = metricsMap[userId] || {
      userId,
      totalLikesGiven: 0,
      totalCommentsGiven: 0,
      totalPostsCreated: 0,
      totalSignalsViewed: 0,
      totalSignalsTapped: 0,
      avgTimeOnFeed: 0,
      avgScrollDepth: 0,
      lastSeen: Date.now(),
      streak: 0,
      activeDays: 0,
    };

    switch (type) {
      case 'like_given': metrics.totalLikesGiven++; break;
      case 'comment_given': metrics.totalCommentsGiven++; break;
      case 'post_created': metrics.totalPostsCreated++; break;
      case 'signal_viewed': metrics.totalSignalsViewed++; break;
      case 'signal_tapped': metrics.totalSignalsTapped++; break;
      case 'scroll_depth':
        if (typeof value === 'number') {
          metrics.avgScrollDepth = (metrics.avgScrollDepth + value) / 2;
        }
        break;
      case 'time_on_page':
        if (typeof value === 'number') {
          metrics.avgTimeOnFeed = (metrics.avgTimeOnFeed + value) / 2;
        }
        break;
    }

    metrics.lastSeen = Date.now();
    metricsMap[userId] = metrics;
    setLocalItem(METRICS_KEY, metricsMap);
  },

  getEngagementMetrics(userId: string): UserEngagementMetrics | null {
    const metricsMap = getLocalItem<Record<string, UserEngagementMetrics>>(METRICS_KEY, {});
    return metricsMap[userId] || null;
  },

  flushSignals(): UserSignalEvent[] {
    const queue = getLocalItem<UserSignalEvent[]>(SIGNALS_KEY, []);
    setLocalItem(SIGNALS_KEY, []);
    return queue;
  },

  trackOnboardingStarted(userId: string, stepCount: number): void {
    this.track('onboarding_started', userId, undefined, { stepCount });
  },

  trackOnboardingStep(userId: string, stepId: number, totalSteps: number): void {
    this.track('onboarding_step_viewed', userId, String(stepId), { stepId, totalSteps, stepProgress: Math.round((stepId / totalSteps) * 100) });
  },

  trackOnboardingCompleted(userId: string, stepsViewed: number, totalSteps: number): void {
    this.track('onboarding_completed', userId, undefined, { stepsViewed, totalSteps, completionRate: Math.round((stepsViewed / totalSteps) * 100) });
  },

  trackUpgradeCtaViewed(userId: string, stepId: number, ctaPosition: string): void {
    this.track('upgrade_cta_viewed', userId, String(stepId), { stepId, ctaPosition });
  },

  trackUpgradeCtaClicked(userId: string, stepId: number, ctaPosition: string): void {
    this.track('upgrade_cta_clicked', userId, String(stepId), { stepId, ctaPosition });
  },

  trackUpgradeConverted(userId: string, sourceStep: number, method: string): void {
    this.track('upgrade_converted', userId, String(sourceStep), { sourceStep, method });
  },

  trackOnboardingDropped(userId: string, lastStep: number, totalSteps: number, reason: string): void {
    this.track('onboarding_dropped', userId, String(lastStep), { lastStep, totalSteps, reason, dropOffRate: Math.round((lastStep / totalSteps) * 100) });
  },

  clearProfile(userId: string): void {
    const profiles = getLocalItem<Record<string, UserInterestProfile>>(PROFILE_KEY, {});
    delete profiles[userId];
    setLocalItem(PROFILE_KEY, profiles);

    const metricsMap = getLocalItem<Record<string, UserEngagementMetrics>>(METRICS_KEY, {});
    delete metricsMap[userId];
    setLocalItem(METRICS_KEY, metricsMap);
  },

  trackUserSignup(userId: string, signupDate?: number): void {
    const retentionMap = getLocalItem<Record<string, RetentionMetrics>>(RETENTION_KEY, {});
    const date = signupDate || Date.now();
    
    if (!retentionMap[userId]) {
      retentionMap[userId] = {
        userId,
        signupDate: date,
        activeDays: 1,
        retentionByDay: { 0: true },
        lastRetentionCheck: Date.now(),
      };
      setLocalItem(RETENTION_KEY, retentionMap);
      
      this.addUserToCohort(userId, date);
    }
  },

  addUserToCohort(userId: string, signupDate: number): void {
    const cohortMap = getLocalItem<Record<string, RetentionMetrics>>(COHORT_KEY, {});
    if (!cohortMap[userId]) {
      cohortMap[userId] = {
        userId,
        signupDate,
        activeDays: 1,
        retentionByDay: { 0: true },
        lastRetentionCheck: Date.now(),
      };
      setLocalItem(COHORT_KEY, cohortMap);
    }
  },

  recordUserActivity(userId: string): void {
    const retentionMap = getLocalItem<Record<string, RetentionMetrics>>(RETENTION_KEY, {});
    const retention = retentionMap[userId];
    
    if (!retention) {
      this.trackUserSignup(userId);
      return;
    }

    const daysSinceSignup = getDaysSinceDate(retention.signupDate);
    retention.retentionByDay[daysSinceSignup] = true;
    retention.lastRetentionCheck = Date.now();
    
    const newActiveDays = Object.keys(retention.retentionByDay).length;
    retention.activeDays = newActiveDays;
    
    retentionMap[userId] = retention;
    setLocalItem(RETENTION_KEY, retentionMap);
  },

  getRetentionMetrics(userId: string): RetentionMetrics | null {
    const retentionMap = getLocalItem<Record<string, RetentionMetrics>>(RETENTION_KEY, {});
    return retentionMap[userId] || null;
  },

  getCohortAnalysis(period: 'weekly' | 'monthly' = 'weekly'): CohortAnalysisResult[] {
    const retentionMap = getLocalItem<Record<string, RetentionMetrics>>(COHORT_KEY, {});
    const cohorts: Record<string, RetentionMetrics[]> = {};

    for (const retention of Object.values(retentionMap)) {
      const date = new Date(retention.signupDate);
      const key = period === 'weekly' ? getWeekKey(date) : getMonthKey(date);
      
      if (!cohorts[key]) cohorts[key] = [];
      cohorts[key].push(retention);
    }

    const results: CohortAnalysisResult[] = [];
    
    for (const [cohortLabel, users] of Object.entries(cohorts)) {
      const retainedUsers: Record<number, number> = {};
      const retentionRate: Record<number, number> = {};
      
      for (const day of RETENTION_DAYS) {
        const retained = users.filter(u => u.retentionByDay[day] !== undefined).length;
        retainedUsers[day] = retained;
        retentionRate[day] = users.length > 0 ? Math.round((retained / users.length) * 100) : 0;
      }

      const firstUser = users[0];
      results.push({
        cohort: {
          cohortId: cohortLabel,
          cohortLabel,
          cohortDate: firstUser?.signupDate || Date.now(),
          userCount: users.length,
          retentionByDay: retainedUsers as Record<number, number>,
        },
        totalUsers: users.length,
        retainedUsers,
        retentionRate,
      });
    }

    return results.sort((a, b) => a.cohort.cohortDate - b.cohort.cohortDate);
  },

  getRetentionCurve(userId: string): { day: number; retained: boolean }[] | null {
    const retention = this.getRetentionMetrics(userId);
    if (!retention) return null;

    const maxDay = Math.min(getDaysSinceDate(retention.signupDate), 90);
    return RETENTION_DAYS.filter(d => d <= maxDay).map(day => ({
      day,
      retained: retention.retentionByDay[day] === true,
    }));
  },

  getWeeklyRetentionCurve(): Record<string, number> {
    const retentionMap = getLocalItem<Record<string, RetentionMetrics>>(RETENTION_KEY, {});
    const activeUsers: Record<number, number> = {};
    const totalUsers = Object.keys(retentionMap).length;
    
    if (totalUsers === 0) return {};

    for (const day of RETENTION_DAYS) {
      const activeCount = Object.values(retentionMap).filter(r => r.retentionByDay[day] !== undefined).length;
      activeUsers[day] = totalUsers > 0 ? Math.round((activeCount / totalUsers) * 100) : 0;
    }

    return activeUsers;
  },

  getCohortRetentionMatrix(): { cohort: string; users: number; d1: number; d7: number; d30: number }[] {
    const analysis = this.getCohortAnalysis('weekly');
    return analysis.map(a => ({
      cohort: a.cohort.cohortLabel,
      users: a.totalUsers,
      d1: a.retentionRate[1] || 0,
      d7: a.retentionRate[7] || 0,
      d30: a.retentionRate[30] || 0,
    }));
  },

  getUserCohort(userId: string): { week: string; month: string } | null {
    const retention = this.getRetentionMetrics(userId);
    if (!retention) return null;

    const date = new Date(retention.signupDate);
    return {
      week: getWeekKey(date),
      month: getMonthKey(date),
    };
  },
};
