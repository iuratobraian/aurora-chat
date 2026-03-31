import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../../src/services/storage';
import { UserSignalsService } from '../../src/services/analytics/userSignals';

describe('Auth Service Flows', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should reject non-existent user', async () => {
      const { user, error } = await StorageService.login('nonexistent', 'password');
      
      expect(user).toBeNull();
      expect(error).toBeDefined();
    });

    it('should store session in localStorage', () => {
      const testUser = {
        id: 'test123',
        nombre: 'Test User',
        usuario: 'testuser',
        email: 'test@test.com',
        esPro: false,
        rol: 'user' as const,
        xp: 100,
        level: 2,
        accuracy: 0,
        aportes: 5,
        reputation: 50,
        badges: [] as string[],
        seguidores: [],
        siguiendo: [],
        saldo: 0,
        estadisticas: { tasaVictoria: 0, factorBeneficio: 0, pnlTotal: 0 },
        avatar: '',
      };
      
      localStorage.setItem('local_session', JSON.stringify(testUser));
      const stored = localStorage.getItem('local_session');
      const parsed = stored ? JSON.parse(stored) : null;
      
      expect(parsed).not.toBeNull();
      expect(parsed.id).toBe('test123');
    });
  });

  describe('Onboarding Flow', () => {
    it('should track onboarding started', () => {
      UserSignalsService.trackOnboardingStarted('user123', 5);
      const queue = JSON.parse(localStorage.getItem('user_signals_queue') || '[]');
      
      expect(queue.some((e: any) => e.type === 'onboarding_started')).toBe(true);
    });

    it('should track onboarding step completion', () => {
      UserSignalsService.trackOnboardingStep('user123', 2, 5);
      const queue = JSON.parse(localStorage.getItem('user_signals_queue') || '[]');
      const stepEvent = queue.find((e: any) => e.type === 'onboarding_step_viewed');
      
      expect(stepEvent).toBeDefined();
      expect(stepEvent.metadata.stepProgress).toBe(40);
    });

    it('should track onboarding completion', () => {
      UserSignalsService.trackOnboardingCompleted('user123', 5, 5);
      const queue = JSON.parse(localStorage.getItem('user_signals_queue') || '[]');
      const completeEvent = queue.find((e: any) => e.type === 'onboarding_completed');
      
      expect(completeEvent).toBeDefined();
      expect(completeEvent.metadata.completionRate).toBe(100);
    });

    it('should track onboarding drop-off', () => {
      UserSignalsService.trackOnboardingDropped('user123', 2, 5, 'too_complex');
      const queue = JSON.parse(localStorage.getItem('user_signals_queue') || '[]');
      const dropEvent = queue.find((e: any) => e.type === 'onboarding_dropped');
      
      expect(dropEvent).toBeDefined();
      expect(dropEvent.metadata.dropOffRate).toBe(40);
      expect(dropEvent.metadata.reason).toBe('too_complex');
    });

    it('should track onboarding completion via storage', async () => {
      await StorageService.setOnboardingCompleted();
      const completed = await StorageService.hasCompletedOnboarding();
      
      expect(completed).toBe(true);
    });
  });

  describe('Create Post Flow', () => {
    it('should track post creation signal', () => {
      UserSignalsService.track('post_created', 'creator123', 'post456', { category: 'Idea' });
      const queue = JSON.parse(localStorage.getItem('user_signals_queue') || '[]');
      const postEvent = queue.find((e: any) => e.type === 'post_created');
      
      expect(postEvent).toBeDefined();
      expect(postEvent.targetId).toBe('post456');
      expect(postEvent.metadata.category).toBe('Idea');
    });

    it('should update interest profile on post creation', () => {
      UserSignalsService.track('post_created', 'author123', 'post789', { category: 'Estrategia' });
      const profile = UserSignalsService.getInterestProfile('author123');
      
      expect(profile).not.toBeNull();
      expect(profile?.categories).toHaveProperty('Estrategia');
    });

    it('should track post viewed', () => {
      UserSignalsService.trackPageView('viewer123', 'post456', 'post');
      const queue = JSON.parse(localStorage.getItem('user_signals_queue') || '[]');
      const viewEvent = queue.find((e: any) => e.type === 'post_viewed');
      
      expect(viewEvent).toBeDefined();
      expect(viewEvent.targetId).toBe('post456');
    });

    it('should track post like', () => {
      UserSignalsService.track('like_given', 'liker123', 'post456', { category: 'General' });
      const queue = JSON.parse(localStorage.getItem('user_signals_queue') || '[]');
      const likeEvent = queue.find((e: any) => e.type === 'like_given');
      
      expect(likeEvent).toBeDefined();
      expect(likeEvent.targetId).toBe('post456');
    });
  });

  describe('Subscribe Flow', () => {
    it('should track upgrade CTA viewed', () => {
      UserSignalsService.trackUpgradeCtaViewed('user123', 1, 'pricing_page');
      const queue = JSON.parse(localStorage.getItem('user_signals_queue') || '[]');
      const viewEvent = queue.find((e: any) => e.type === 'upgrade_cta_viewed');
      
      expect(viewEvent).toBeDefined();
      expect(viewEvent.metadata.ctaPosition).toBe('pricing_page');
    });

    it('should track upgrade CTA clicked', () => {
      UserSignalsService.trackUpgradeCtaClicked('user123', 1, 'pricing_page');
      const queue = JSON.parse(localStorage.getItem('user_signals_queue') || '[]');
      const clickEvent = queue.find((e: any) => e.type === 'upgrade_cta_clicked');
      
      expect(clickEvent).toBeDefined();
      expect(clickEvent.metadata.ctaPosition).toBe('pricing_page');
    });

    it('should track conversion', () => {
      UserSignalsService.trackUpgradeConverted('user123', 1, 'pricing_cta');
      const queue = JSON.parse(localStorage.getItem('user_signals_queue') || '[]');
      const convertEvent = queue.find((e: any) => e.type === 'upgrade_converted');
      
      expect(convertEvent).toBeDefined();
      expect(convertEvent.metadata.method).toBe('pricing_cta');
    });

    it('should track engagement metrics on interaction', () => {
      UserSignalsService.updateEngagementMetrics('user123', 'like_given');
      const metrics = UserSignalsService.getEngagementMetrics('user123');
      
      expect(metrics).not.toBeNull();
      expect(metrics?.totalLikesGiven).toBe(1);
    });
  });

  describe('Referral Code Flow', () => {
    it('should store and retrieve referral code', () => {
      StorageService.setPendingReferralCode('TEST123');
      const code = StorageService.getPendingReferralCode();
      
      expect(code).toBe('TEST123');
    });

    it('should clear pending referral code', () => {
      StorageService.setPendingReferralCode('REFCODE');
      StorageService.clearPendingReferralCode();
      const code = StorageService.getPendingReferralCode();
      
      expect(code).toBeNull();
    });
  });
});
