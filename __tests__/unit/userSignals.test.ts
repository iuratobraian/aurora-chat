import { describe, it, expect, beforeEach } from 'vitest';
import { UserSignalsService } from '../../src/services/analytics/userSignals';

const STORAGE_KEY = 'user_signals_queue';
const PROFILE_KEY = 'user_interest_profile';
const METRICS_KEY = 'user_engagement_metrics';

describe('UserSignalsService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('track', () => {
    it('should not track for guest user', () => {
      UserSignalsService.track('post_viewed', 'guest');
      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(queue.length).toBe(0);
    });

    it('should add event to queue', () => {
      UserSignalsService.track('post_viewed', 'user123', 'post1');
      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(queue.length).toBe(1);
      expect(queue[0].type).toBe('post_viewed');
      expect(queue[0].userId).toBe('user123');
      expect(queue[0].targetId).toBe('post1');
    });

    it('should cap queue at 50 events', () => {
      for (let i = 0; i < 60; i++) {
        UserSignalsService.track('post_viewed', 'user123', `post${i}`);
      }
      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(queue.length).toBe(50);
    });
  });

  describe('trackOnboardingStarted', () => {
    it('should track onboarding start event', () => {
      UserSignalsService.trackOnboardingStarted('user123', 5);
      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(queue.some((e: any) => e.type === 'onboarding_started')).toBe(true);
    });
  });

  describe('trackOnboardingStep', () => {
    it('should track step viewed with progress metadata', () => {
      UserSignalsService.trackOnboardingStep('user123', 3, 5);
      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const event = queue.find((e: any) => e.type === 'onboarding_step_viewed');
      expect(event).toBeDefined();
      expect(event.metadata.stepId).toBe(3);
      expect(event.metadata.stepProgress).toBe(60); // 3/5 = 60%
    });
  });

  describe('trackOnboardingCompleted', () => {
    it('should track completion with completion rate', () => {
      UserSignalsService.trackOnboardingCompleted('user123', 5, 5);
      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const event = queue.find((e: any) => e.type === 'onboarding_completed');
      expect(event).toBeDefined();
      expect(event.metadata.completionRate).toBe(100);
    });
  });

  describe('trackOnboardingDropped', () => {
    it('should track drop with reason and drop-off rate', () => {
      UserSignalsService.trackOnboardingDropped('user123', 2, 5, 'skip');
      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const event = queue.find((e: any) => e.type === 'onboarding_dropped');
      expect(event).toBeDefined();
      expect(event.metadata.reason).toBe('skip');
      expect(event.metadata.dropOffRate).toBe(40); // 2/5 = 40%
    });
  });

  describe('trackUpgradeCtaViewed', () => {
    it('should track upgrade CTA view', () => {
      UserSignalsService.trackUpgradeCtaViewed('user123', 2, 'signals_cta');
      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const event = queue.find((e: any) => e.type === 'upgrade_cta_viewed');
      expect(event).toBeDefined();
      expect(event.metadata.ctaPosition).toBe('signals_cta');
    });
  });

  describe('trackUpgradeCtaClicked', () => {
    it('should track upgrade CTA click', () => {
      UserSignalsService.trackUpgradeCtaClicked('user123', 2, 'communities_cta');
      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const event = queue.find((e: any) => e.type === 'upgrade_cta_clicked');
      expect(event).toBeDefined();
      expect(event.metadata.ctaPosition).toBe('communities_cta');
    });
  });

  describe('trackUpgradeConverted', () => {
    it('should track conversion', () => {
      UserSignalsService.trackUpgradeConverted('user123', 4, 'onboarding_cta');
      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const event = queue.find((e: any) => e.type === 'upgrade_converted');
      expect(event).toBeDefined();
      expect(event.metadata.method).toBe('onboarding_cta');
    });
  });

  describe('getInterestProfile', () => {
    it('should return null for unknown user', () => {
      const profile = UserSignalsService.getInterestProfile('unknown');
      expect(profile).toBeNull();
    });
  });

  describe('getEngagementMetrics', () => {
    it('should return null for unknown user', () => {
      const metrics = UserSignalsService.getEngagementMetrics('unknown');
      expect(metrics).toBeNull();
    });
  });

  describe('flushSignals', () => {
    it('should return and clear the queue', () => {
      UserSignalsService.track('post_viewed', 'user123', 'post1');
      UserSignalsService.track('post_viewed', 'user123', 'post2');

      const events = UserSignalsService.flushSignals();
      expect(events.length).toBe(2);

      const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      expect(queue.length).toBe(0);
    });
  });

  describe('clearProfile', () => {
    it('should remove user profile and metrics', () => {
      UserSignalsService.track('post_viewed', 'user123', 'post1');
      UserSignalsService.updateEngagementMetrics('user123', 'post_viewed');

      UserSignalsService.clearProfile('user123');

      expect(UserSignalsService.getInterestProfile('user123')).toBeNull();
      expect(UserSignalsService.getEngagementMetrics('user123')).toBeNull();
    });
  });

  describe('getTopInterests', () => {
    it('should return empty for unknown user', () => {
      const interests = UserSignalsService.getTopInterests('unknown');
      expect(interests.pairs).toEqual([]);
      expect(interests.categories).toEqual([]);
    });
  });

  describe('trackUserSignup', () => {
    it('should register new user signup', () => {
      UserSignalsService.trackUserSignup('newuser123', Date.now());
      const metrics = UserSignalsService.getRetentionMetrics('newuser123');
      expect(metrics).not.toBeNull();
      expect(metrics?.signupDate).toBeDefined();
      expect(metrics?.activeDays).toBe(1);
    });

    it('should not duplicate signup for existing user', () => {
      UserSignalsService.trackUserSignup('user123', Date.now());
      const firstSignup = UserSignalsService.getRetentionMetrics('user123');
      const firstActiveDays = firstSignup?.activeDays || 0;
      
      UserSignalsService.trackUserSignup('user123', Date.now());
      const secondSignup = UserSignalsService.getRetentionMetrics('user123');
      expect(secondSignup?.activeDays).toBe(firstActiveDays);
    });
  });

  describe('recordUserActivity', () => {
    it('should record user activity and update active days', () => {
      const now = Date.now();
      UserSignalsService.trackUserSignup('activeuser', now);
      
      UserSignalsService.recordUserActivity('activeuser');
      const metrics = UserSignalsService.getRetentionMetrics('activeuser');
      expect(metrics).not.toBeNull();
    });

    it('should auto-signup if user does not exist', () => {
      UserSignalsService.recordUserActivity('brandnewuser');
      const metrics = UserSignalsService.getRetentionMetrics('brandnewuser');
      expect(metrics).not.toBeNull();
    });
  });

  describe('getRetentionMetrics', () => {
    it('should return null for unknown user', () => {
      const metrics = UserSignalsService.getRetentionMetrics('unknownuser');
      expect(metrics).toBeNull();
    });
  });

  describe('getCohortAnalysis', () => {
    it('should return cohort analysis for weekly period', () => {
      const analysis = UserSignalsService.getCohortAnalysis('weekly');
      expect(Array.isArray(analysis)).toBe(true);
    });

    it('should return cohort analysis for monthly period', () => {
      const analysis = UserSignalsService.getCohortAnalysis('monthly');
      expect(Array.isArray(analysis)).toBe(true);
    });
  });

  describe('getRetentionCurve', () => {
    it('should return null for unknown user', () => {
      const curve = UserSignalsService.getRetentionCurve('unknownuser');
      expect(curve).toBeNull();
    });

    it('should return retention curve for existing user', () => {
      UserSignalsService.trackUserSignup('curveuser', Date.now());
      const curve = UserSignalsService.getRetentionCurve('curveuser');
      expect(curve).not.toBeNull();
      expect(Array.isArray(curve)).toBe(true);
    });
  });

  describe('getWeeklyRetentionCurve', () => {
    it('should return weekly retention rates', () => {
      const curve = UserSignalsService.getWeeklyRetentionCurve();
      expect(typeof curve).toBe('object');
    });
  });

  describe('getCohortRetentionMatrix', () => {
    it('should return cohort retention matrix', () => {
      const matrix = UserSignalsService.getCohortRetentionMatrix();
      expect(Array.isArray(matrix)).toBe(true);
    });
  });

  describe('getUserCohort', () => {
    it('should return null for unknown user', () => {
      const cohort = UserSignalsService.getUserCohort('unknownuser');
      expect(cohort).toBeNull();
    });

    it('should return cohort info for existing user', () => {
      UserSignalsService.trackUserSignup('cohortuser', Date.now());
      const cohort = UserSignalsService.getUserCohort('cohortuser');
      expect(cohort).not.toBeNull();
      expect(cohort).toHaveProperty('week');
      expect(cohort).toHaveProperty('month');
    });
  });

  describe('getInterestProfile', () => {
    it('should build interest profile from track events', () => {
      UserSignalsService.track('like_given', 'interestuser', 'post1', { category: 'Idea', pair: 'EUR/USD' });
      
      const profile = UserSignalsService.getInterestProfile('interestuser');
      expect(profile).not.toBeNull();
      expect(profile?.categories).toHaveProperty('Idea');
      expect(profile?.pairs).toHaveProperty('EUR/USD');
    });
  });

  describe('updateEngagementMetrics', () => {
    it('should update engagement metrics', () => {
      UserSignalsService.updateEngagementMetrics('metricsuser', 'like_given');
      
      const metrics = UserSignalsService.getEngagementMetrics('metricsuser');
      expect(metrics).not.toBeNull();
      expect(metrics?.totalLikesGiven).toBe(1);
    });

    it('should track scroll depth', () => {
      UserSignalsService.updateEngagementMetrics('scrolluser', 'scroll_depth', 75);
      
      const metrics = UserSignalsService.getEngagementMetrics('scrolluser');
      expect(metrics).not.toBeNull();
      expect(typeof metrics?.avgScrollDepth).toBe('number');
    });
  });
});
