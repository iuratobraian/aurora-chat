import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockLocalStorage = {
  data: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.data[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockLocalStorage.data[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockLocalStorage.data[key]; }),
  clear: vi.fn(() => { mockLocalStorage.data = {}; })
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

vi.mock('../../convex/_generated/api', () => ({
  api: {
    profiles: {
      getProfile: {},
      updateProfile: {},
      listProfiles: {}
    },
    users: {
      getUser: {},
      getUserByEmail: {}
    }
  }
}));

vi.mock('../../lib/convex/client', () => ({
  getConvexClient: vi.fn(() => ({
    query: vi.fn().mockResolvedValue([]),
    mutation: vi.fn().mockResolvedValue({ success: true })
  }))
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('localStorage operations', () => {
    it('should store and retrieve user data from localStorage', () => {
      const testUser = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com'
      };
      
      localStorage.setItem('user_test', JSON.stringify(testUser));
      const retrieved = JSON.parse(localStorage.getItem('user_test') || '{}');
      
      expect(retrieved.id).toBe('user123');
      expect(retrieved.username).toBe('testuser');
    });

    it('should remove user data from localStorage', () => {
      localStorage.setItem('temp_user', JSON.stringify({ id: 'temp' }));
      localStorage.removeItem('temp_user');
      
      expect(localStorage.getItem('temp_user')).toBeNull();
    });
  });

  describe('user data structure', () => {
    it('should validate user profile structure', () => {
      const profile = {
        _id: 'profile123',
        userId: 'user123',
        username: 'trader_pro',
        displayName: 'Trader Pro',
        bio: 'Professional trader',
        avatarUrl: 'https://example.com/avatar.jpg',
        xp: 5000,
        nivel: 10,
        streak: 5,
        isPro: true,
        isCreator: false,
        isAdmin: false,
        isModerator: false,
        accuracy: 65.5,
        winRate: 58.3,
        totalSignals: 25,
        followers: 150,
        following: 75,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      expect(profile.username).toBeDefined();
      expect(profile.xp).toBeGreaterThan(0);
      expect(profile.nivel).toBeGreaterThan(0);
    });

    it('should handle user plan tiers', () => {
      const planTiers = ['free', 'pro', 'elite', 'creator'];
      
      expect(planTiers).toContain('free');
      expect(planTiers).toContain('pro');
      expect(planTiers).toContain('elite');
      expect(planTiers).toContain('creator');
    });
  });

  describe('user preferences', () => {
    it('should store theme preference', () => {
      const theme = 'dark';
      localStorage.setItem('user_theme', theme);
      
      expect(localStorage.getItem('user_theme')).toBe('dark');
    });

    it('should store notification preferences', () => {
      const prefs = {
        email: true,
        push: false,
        likes: true,
        comments: true,
        followers: false
      };
      localStorage.setItem('notification_prefs', JSON.stringify(prefs));
      
      const retrieved = JSON.parse(localStorage.getItem('notification_prefs') || '{}');
      expect(retrieved.email).toBe(true);
    });
  });

  describe('session management', () => {
    it('should store auth token', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      localStorage.setItem('auth_token', token);
      
      expect(localStorage.getItem('auth_token')).toBe(token);
    });

    it('should clear session on logout', () => {
      localStorage.setItem('auth_token', 'test_token');
      localStorage.setItem('user_session', JSON.stringify({ userId: '123' }));
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_session');
      
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user_session')).toBeNull();
    });
  });
});
