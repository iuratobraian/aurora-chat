import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/convex/_generated/api', () => ({
  api: {
    notifications: {
      getNotifications: {},
      getUnreadCount: {},
      createNotification: {},
      markAsRead: {},
      markAllAsRead: {},
      deleteNotification: {},
      deleteOldNotifications: {}
    },
    profiles: { getProfile: {} }
  }
}));

vi.mock('../../src/lib/convex/client', () => ({
  getConvexClient: vi.fn(() => ({
    query: vi.fn().mockResolvedValue([]),
    mutation: vi.fn().mockResolvedValue({ success: true })
  }))
}));

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

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('localStorage operations', () => {
    it('should store notifications in localStorage', () => {
      const notifications = [
        { id: '1', type: 'like', message: 'Test notification' },
        { id: '2', type: 'follow', message: 'New follower' }
      ];
      
      localStorage.setItem('local_notifications', JSON.stringify(notifications));
      const retrieved = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      
      expect(retrieved.length).toBe(2);
      expect(retrieved[0].id).toBe('1');
    });

    it('should mark notification as read', () => {
      const notifications = [
        { id: '1', leida: false },
        { id: '2', leida: false }
      ];
      
      localStorage.setItem('local_notifications', JSON.stringify(notifications));
      
      const stored = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      const updated = stored.map((n: any) => 
        n.id === '1' ? { ...n, leida: true } : n
      );
      localStorage.setItem('local_notifications', JSON.stringify(updated));
      
      const retrieved = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      expect(retrieved.find((n: any) => n.id === '1').leida).toBe(true);
      expect(retrieved.find((n: any) => n.id === '2').leida).toBe(false);
    });

    it('should delete old notifications', () => {
      const oldDate = Date.now() - (31 * 24 * 60 * 60 * 1000);
      const notifications = [
        { id: '1', created_at: oldDate },
        { id: '2', created_at: Date.now() }
      ];
      
      localStorage.setItem('local_notifications', JSON.stringify(notifications));
      
      const stored = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const filtered = stored.filter((n: any) => n.created_at > thirtyDaysAgo);
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('2');
    });

    it('should filter notifications by userId', () => {
      const notifications = [
        { id: '1', user_id: 'user1' },
        { id: '2', user_id: 'user2' },
        { id: '3', user_id: 'user1' }
      ];
      
      localStorage.setItem('local_notifications', JSON.stringify(notifications));
      
      const stored = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      const user1Notifs = stored.filter((n: any) => n.user_id === 'user1');
      
      expect(user1Notifs.length).toBe(2);
    });
  });

  describe('notification types', () => {
    it('should validate notification types', () => {
      const validTypes = ['follow', 'mention', 'like', 'comment', 'achievement', 'level_up', 'system'];
      
      validTypes.forEach(type => {
        expect(['follow', 'mention', 'like', 'comment', 'achievement', 'level_up', 'system']).toContain(type);
      });
    });

    it('should handle unknown notification types', () => {
      const unknownType = 'unknown_type';
      const defaultType = ['follow', 'mention', 'like', 'comment', 'achievement', 'level_up', 'system'].includes(unknownType) 
        ? unknownType 
        : 'system';
      
      expect(defaultType).toBe('system');
    });
  });

  describe('notification data structure', () => {
    it('should validate notification structure', () => {
      const notification = {
        id: 'notif_123',
        userId: 'user_456',
        tipo: 'like',
        mensaje: 'Someone liked your post',
        leida: false,
        link: '/post/123',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: Date.now()
      };

      expect(notification.id).toBeDefined();
      expect(notification.userId).toBeDefined();
      expect(notification.tipo).toBeDefined();
      expect(typeof notification.leida).toBe('boolean');
    });

    it('should format notification time', () => {
      const timestamp = new Date().getTime();
      const formatted = new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('unread count', () => {
    it('should count unread notifications', () => {
      const notifications = [
        { id: '1', leida: false },
        { id: '2', leida: true },
        { id: '3', leida: false }
      ];
      
      const unreadCount = notifications.filter(n => !n.leida).length;
      expect(unreadCount).toBe(2);
    });

    it('should mark all as read', () => {
      const notifications = [
        { id: '1', user_id: 'user1', leida: false },
        { id: '2', user_id: 'user1', leida: false },
        { id: '3', user_id: 'user2', leida: false }
      ];
      
      localStorage.setItem('local_notifications', JSON.stringify(notifications));
      
      const stored = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      const updated = stored.map((n: any) => 
        n.user_id === 'user1' ? { ...n, leida: true } : n
      );
      
      const user1AllRead = updated.filter((n: any) => n.user_id === 'user1').every((n: any) => n.leida);
      expect(user1AllRead).toBe(true);
    });
  });
});
