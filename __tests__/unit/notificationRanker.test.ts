import { describe, it, expect } from 'vitest';
import { NotificationRanker } from '../../src/services/ranking/notificationRanker';
import type { Notificacion } from '../../types';

function makeNotification(overrides: Partial<Notificacion> = {}): Notificacion {
  return {
    id: 'n1',
    tipo: 'like',
    mensaje: 'Someone liked your post',
    leida: false,
    tiempo: 'Hace 10 min',
    ...overrides,
  };
}

describe('NotificationRanker', () => {
  describe('rank', () => {
    it('should sort by score when prioritizeNew is false', () => {
      const notifications = [
        makeNotification({ id: 'n1', tipo: 'like', leida: true }),
        makeNotification({ id: 'n2', tipo: 'moderation', leida: true }),
        makeNotification({ id: 'n3', tipo: 'mention', leida: true }),
      ];
      const ranked = NotificationRanker.rank(notifications, { includeRead: true, prioritizeNew: false });
      expect(ranked[0].notification.id).toBe('n2');
      expect(ranked[0].priority).toBe('urgent');
    });

    it('should mark unread notifications as boosted', () => {
      const notifications = [
        makeNotification({ id: 'n1', leida: false, tipo: 'mention' }),
        makeNotification({ id: 'n2', leida: true, tipo: 'follow' }),
      ];
      const ranked = NotificationRanker.rank(notifications, { prioritizeNew: false });
      expect(ranked.some(n => n.notification.id === 'n1' && n.boosted)).toBe(true);
    });

    it('should filter out read notifications when includeRead is false', () => {
      const notifications = [
        makeNotification({ id: 'n1', leida: true }),
        makeNotification({ id: 'n2', leida: false }),
      ];
      const ranked = NotificationRanker.rank(notifications, { includeRead: false });
      expect(ranked.length).toBe(1);
      expect(ranked[0].notification.id).toBe('n2');
    });

    it('should filter out old notifications beyond maxAgeDays', () => {
      const notifications = [
        makeNotification({ id: 'n1', tiempo: 'Hace 5 días' }),
        makeNotification({ id: 'n2', tiempo: 'Hace 1 hora' }),
      ];
      const ranked = NotificationRanker.rank(notifications, { maxAgeDays: 3, includeRead: true });
      expect(ranked.length).toBe(1);
      expect(ranked[0].notification.id).toBe('n2');
    });

    it('should assign correct priority per type', () => {
      const notifications = [
        makeNotification({ id: 'n1', tipo: 'mention', leida: true }),
        makeNotification({ id: 'n2', tipo: 'follow', leida: true }),
      ];
      const ranked = NotificationRanker.rank(notifications, { includeRead: true, prioritizeNew: false });
      const byId = Object.fromEntries(ranked.map(n => [n.notification.id, n]));
      expect(byId.n1.priority).toBe('urgent');
      expect(byId.n2.priority).toBe('low');
    });
  });

  describe('surface', () => {
    it('should return notification surface with unread count', () => {
      const notifications = [
        makeNotification({ id: 'n1', leida: false }),
        makeNotification({ id: 'n2', leida: true }),
        makeNotification({ id: 'n3', leida: false }),
      ];
      const result = NotificationRanker.surface(notifications);
      expect(result.unreadCount).toBe(2);
      expect(result.total).toBe(3);
      expect(result.signal).toBe('live');
    });

    it('should return empty signal when no notifications', () => {
      const result = NotificationRanker.surface([]);
      expect(result.signal).toBe('empty');
    });
  });

  describe('getUrgent', () => {
    it('should return only urgent priority notifications', () => {
      const notifications = [
        makeNotification({ id: 'n1', tipo: 'moderation' }),
        makeNotification({ id: 'n2', tipo: 'like' }),
        makeNotification({ id: 'n3', tipo: 'suspension' }),
      ];
      const urgent = NotificationRanker.getUrgent(notifications);
      expect(urgent.length).toBe(2);
      expect(urgent.every(n => n.priority === 'urgent')).toBe(true);
    });
  });

  describe('getUnread', () => {
    it('should return only unread notifications', () => {
      const notifications = [
        makeNotification({ id: 'n1', leida: false }),
        makeNotification({ id: 'n2', leida: true }),
        makeNotification({ id: 'n3', leida: false }),
      ];
      const unread = NotificationRanker.getUnread(notifications);
      expect(unread.length).toBe(2);
      expect(unread.every(n => !n.leida)).toBe(true);
    });
  });

  describe('getByType', () => {
    it('should filter notifications by type', () => {
      const notifications = [
        makeNotification({ id: 'n1', tipo: 'like' }),
        makeNotification({ id: 'n2', tipo: 'follow' }),
        makeNotification({ id: 'n3', tipo: 'like' }),
      ];
      const likes = NotificationRanker.getByType(notifications, 'like');
      expect(likes.length).toBe(2);
    });
  });

  describe('groupByPriority', () => {
    it('should group notifications by priority levels', () => {
      const notifications = [
        makeNotification({ id: 'n1', tipo: 'suspension' }),
        makeNotification({ id: 'n2', tipo: 'comment' }),
        makeNotification({ id: 'n3', tipo: 'like' }),
        makeNotification({ id: 'n4', tipo: 'follow' }),
      ];
      const groups = NotificationRanker.groupByPriority(notifications, { includeRead: true, prioritizeNew: false });
      expect(groups.urgent.length).toBe(1);
      expect(groups.high.length).toBe(1);
      expect(groups.medium.length).toBe(1);
      expect(groups.low.length).toBe(1);
    });
  });

  describe('getActionable', () => {
    it('should return actionable notification types', () => {
      const notifications = [
        makeNotification({ id: 'n1', tipo: 'mention' }),
        makeNotification({ id: 'n2', tipo: 'comment' }),
        makeNotification({ id: 'n3', tipo: 'moderation' }),
        makeNotification({ id: 'n4', tipo: 'suspension' }),
      ];
      const actionable = NotificationRanker.getActionable(notifications);
      expect(actionable.length).toBe(2);
      expect(actionable.every(n => ['mention', 'comment', 'follow', 'achievement', 'level_up'].includes(n.notification.tipo))).toBe(true);
    });
  });
});
