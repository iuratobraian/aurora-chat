import { describe, it, expect } from 'vitest';
import { getLevelFromXP, getAchievementById, XP_VALUES, ACHIEVEMENTS } from '../../convex/lib/achievements';

describe('Gamification - getLevelFromXP', () => {
  it('should return level 1 for 0 XP', () => {
    const result = getLevelFromXP(0);
    expect(result.level).toBe(1);
    expect(result.name).toBe('Newbie');
    expect(result.xpForCurrentLevel).toBe(0);
    expect(result.progress).toBe(0);
  });

  it('should return level 1 for 499 XP (below Trader threshold)', () => {
    const result = getLevelFromXP(499);
    expect(result.level).toBe(1);
    expect(result.name).toBe('Newbie');
  });

  it('should return level 10 (Trader) for exactly 500 XP', () => {
    const result = getLevelFromXP(500);
    expect(result.level).toBe(10);
    expect(result.name).toBe('Trader');
    expect(result.xpForCurrentLevel).toBe(0);
  });

  it('should return level 10 with progress for 750 XP', () => {
    const result = getLevelFromXP(750);
    expect(result.level).toBe(10);
    expect(result.name).toBe('Trader');
    expect(result.xpForCurrentLevel).toBe(250);
    expect(result.xpNeeded).toBe(1000);
    expect(result.progress).toBe(25);
  });

  it('should return level 20 (Expert) for 1500 XP', () => {
    const result = getLevelFromXP(1500);
    expect(result.level).toBe(20);
    expect(result.name).toBe('Expert');
  });

  it('should return level 35 (Master) for 5000 XP', () => {
    const result = getLevelFromXP(5000);
    expect(result.level).toBe(35);
    expect(result.name).toBe('Master');
  });

  it('should return level 50 (Elite) for 15000 XP', () => {
    const result = getLevelFromXP(15000);
    expect(result.level).toBe(50);
    expect(result.name).toBe('Elite');
  });

  it('should return level 75 (Legend) for 30000 XP', () => {
    const result = getLevelFromXP(30000);
    expect(result.level).toBe(75);
    expect(result.name).toBe('Legend');
  });

  it('should return level 75 (max) for XP beyond Legend threshold', () => {
    const result = getLevelFromXP(99999);
    expect(result.level).toBe(75);
    expect(result.name).toBe('Legend');
    expect(result.progress).toBe(100);
  });

  it('should correctly calculate progress between levels', () => {
    const result = getLevelFromXP(1000);
    expect(result.level).toBe(10);
    expect(result.xpForCurrentLevel).toBe(500);
    expect(result.progress).toBe(50);
  });
});

describe('Gamification - getAchievementById', () => {
  it('should return first_post achievement', () => {
    const achievement = getAchievementById('first_post');
    expect(achievement).toBeDefined();
    expect(achievement!.id).toBe('first_post');
    expect(achievement!.name).toBe('Voz Propia');
    expect(achievement!.xp).toBe(25);
  });

  it('should return streak_7 achievement', () => {
    const achievement = getAchievementById('streak_7');
    expect(achievement).toBeDefined();
    expect(achievement!.name).toBe('Consistente');
    expect(achievement!.xp).toBe(100);
  });

  it('should return streak_30 achievement', () => {
    const achievement = getAchievementById('streak_30');
    expect(achievement).toBeDefined();
    expect(achievement!.name).toBe('Dedicado');
    expect(achievement!.xp).toBe(500);
  });

  it('should return undefined for unknown id', () => {
    const achievement = getAchievementById('nonexistent');
    expect(achievement).toBeUndefined();
  });
});

describe('Gamification - Achievement Conditions', () => {
  describe('streak achievements', () => {
    it('should unlock streak_3 at 3 days', () => {
      const streak3 = getAchievementById('streak_3')!;
      expect(streak3.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 3, daysActive: 3, totalXP: 0 })).toBe(true);
      expect(streak3.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 2, daysActive: 2, totalXP: 0 })).toBe(false);
    });

    it('should unlock streak_7 at 7 days', () => {
      const streak7 = getAchievementById('streak_7')!;
      expect(streak7.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 7, daysActive: 7, totalXP: 0 })).toBe(true);
      expect(streak7.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 6, daysActive: 6, totalXP: 0 })).toBe(false);
    });

    it('should unlock streak_30 at 30 days', () => {
      const streak30 = getAchievementById('streak_30')!;
      expect(streak30.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 30, daysActive: 30, totalXP: 0 })).toBe(true);
      expect(streak30.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 29, daysActive: 29, totalXP: 0 })).toBe(false);
    });
  });

  describe('XP achievements', () => {
    it('should unlock xp_1000 at 1000 XP', () => {
      const xp1000 = getAchievementById('xp_1000')!;
      expect(xp1000.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 1000 })).toBe(true);
      expect(xp1000.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 999 })).toBe(false);
    });

    it('should unlock xp_5000 at 5000 XP', () => {
      const xp5000 = getAchievementById('xp_5000')!;
      expect(xp5000.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 5000 })).toBe(true);
    });

    it('should unlock xp_15000 at 15000 XP', () => {
      const xp15000 = getAchievementById('xp_15000')!;
      expect(xp15000.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 15000 })).toBe(true);
    });

    it('should unlock xp_30000 at 30000 XP', () => {
      const xp30000 = getAchievementById('xp_30000')!;
      expect(xp30000.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 30000 })).toBe(true);
    });
  });

  describe('post achievements', () => {
    it('should unlock first_post at 1 post', () => {
      const first = getAchievementById('first_post')!;
      expect(first.condition({ postsCount: 1, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 0 })).toBe(true);
      expect(first.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 0 })).toBe(false);
    });

    it('should unlock prolific_writer at 10 posts', () => {
      const writer = getAchievementById('prolific_writer')!;
      expect(writer.condition({ postsCount: 10, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 0 })).toBe(true);
      expect(writer.condition({ postsCount: 9, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 0 })).toBe(false);
    });

    it('should unlock influencer at 50 posts', () => {
      const influencer = getAchievementById('influencer')!;
      expect(influencer.condition({ postsCount: 50, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 0 })).toBe(true);
    });
  });

  describe('referral achievements', () => {
    it('should unlock referrer_1 at 1 referral', () => {
      const ref1 = getAchievementById('referrer_1')!;
      expect(ref1.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 1, loginStreak: 0, daysActive: 0, totalXP: 0 })).toBe(true);
      expect(ref1.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 0 })).toBe(false);
    });

    it('should unlock referrer_5 at 5 referrals', () => {
      const ref5 = getAchievementById('referrer_5')!;
      expect(ref5.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 5, loginStreak: 0, daysActive: 0, totalXP: 0 })).toBe(true);
    });

    it('should unlock referrer_10 at 10 referrals', () => {
      const ref10 = getAchievementById('referrer_10')!;
      expect(ref10.condition({ postsCount: 0, commentsCount: 0, likesReceived: 0, referralsCount: 10, loginStreak: 0, daysActive: 0, totalXP: 0 })).toBe(true);
    });
  });

  describe('popularity achievements', () => {
    it('should unlock popular at 10 likes received', () => {
      const popular = getAchievementById('popular')!;
      expect(popular.condition({ postsCount: 0, commentsCount: 0, likesReceived: 10, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 0 })).toBe(true);
      expect(popular.condition({ postsCount: 0, commentsCount: 0, likesReceived: 9, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 0 })).toBe(false);
    });

    it('should unlock celebrity at 100 likes received', () => {
      const celebrity = getAchievementById('celebrity')!;
      expect(celebrity.condition({ postsCount: 0, commentsCount: 0, likesReceived: 100, referralsCount: 0, loginStreak: 0, daysActive: 0, totalXP: 0 })).toBe(true);
    });
  });
});

describe('Gamification - XP_VALUES constants', () => {
  it('should have correct XP values', () => {
    expect(XP_VALUES.DAILY_LOGIN).toBe(10);
    expect(XP_VALUES.CREATE_POST).toBe(25);
    expect(XP_VALUES.POST_LIKED).toBe(2);
    expect(XP_VALUES.COMMENT).toBe(5);
    expect(XP_VALUES.REFERRAL).toBe(100);
    expect(XP_VALUES.STREAK_7).toBe(100);
    expect(XP_VALUES.STREAK_30).toBe(500);
  });
});

describe('Gamification - ACHIEVEMENTS array', () => {
  it('should have all expected achievements', () => {
    const ids = ACHIEVEMENTS.map(a => a.id);
    expect(ids).toContain('first_post');
    expect(ids).toContain('prolific_writer');
    expect(ids).toContain('influencer');
    expect(ids).toContain('streak_3');
    expect(ids).toContain('streak_7');
    expect(ids).toContain('streak_30');
    expect(ids).toContain('popular');
    expect(ids).toContain('celebrity');
    expect(ids).toContain('referrer_1');
    expect(ids).toContain('referrer_5');
    expect(ids).toContain('referrer_10');
    expect(ids).toContain('xp_1000');
    expect(ids).toContain('xp_5000');
    expect(ids).toContain('xp_15000');
    expect(ids).toContain('xp_30000');
    expect(ids).toContain('social_butterfly');
    expect(ids).toContain('first_post');
  });

  it('should have 18 achievements total', () => {
    expect(ACHIEVEMENTS).toHaveLength(18);
  });

  it('all achievements should have a condition function', () => {
    for (const achievement of ACHIEVEMENTS) {
      expect(typeof achievement.condition).toBe('function');
    }
  });
});
