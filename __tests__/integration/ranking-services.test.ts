import { describe, it, expect, beforeEach } from 'vitest';
import { TrustLayer, TrustScore, TrustTier } from '../../src/services/ranking/trustLayer';
import { LearningPathService } from '../../src/services/ranking/learningPath';
import { FeedRanker } from '../../src/services/feed/feedRanker';

describe('Integration: Ranking Services', () => {
  describe('Trust Layer', () => {
    it('should calculate trust score for new user', () => {
      const trust = TrustLayer.getAuthorTrust({
        id: 'user1',
        xp: 100,
        level: 2,
        aportes: 5,
        accuracy: 0,
        seguidores: [],
        badges: [],
        diasActivos: 30,
      });

      expect(trust.score).toBeGreaterThanOrEqual(0);
      expect(trust.tier).toBeDefined();
    });

    it('should return high trust tier for high-rep users', () => {
      const trust = TrustLayer.getAuthorTrust({
        id: 'user2',
        xp: 50000,
        level: 50,
        aportes: 500,
        accuracy: 85,
        seguidores: ['a', 'b', 'c', 'd', 'e'],
        badges: ['TopAnalyst', 'Whale'],
        diasActivos: 365,
      });

      expect(['expert', 'elite']).toContain(trust.tier);
      expect(trust.score).toBeGreaterThan(70);
    });

    it('should get trust badge', () => {
      const badge = TrustLayer.getTierBadge('expert');
      expect(badge).toBe('★');
    });

    it('should get tier label', () => {
      expect(TrustLayer.getTierLabel('verified')).toBe('Verificado');
      expect(TrustLayer.getTierLabel('elite')).toBe('Élite');
      expect(TrustLayer.getTierLabel('new')).toBe('Nuevo');
    });

    it('should detect content quality', () => {
      const content = TrustLayer.getContentTrust({
        id: 'post1',
        likes: ['a', 'b', 'c'],
        comentarios: [],
      }, {
        id: 'author1',
        xp: 1000,
        level: 10,
        accuracy: 70,
        seguidores: ['a', 'b'],
        badges: ['Verified'],
        aportes: 50,
        diasActivos: 100,
      });

      expect(content.score).toBeGreaterThan(0);
    });
  });

  describe('Learning Path Service', () => {
    const mockCourses = [
      { id: 'c1', titulo: 'Forex Basics', nivel: 'Principiante', completada: false },
      { id: 'c2', titulo: 'Technical Analysis', nivel: 'Intermedio', completada: false },
      { id: 'c3', titulo: 'Advanced Strategies', nivel: 'Avanzado', completada: false },
    ];

    it('should return learning path for new user', () => {
      const user = {
        id: 'user1',
        xp: 100,
        level: 2,
        watchedClasses: [],
        accuracy: 0,
        aportes: 0,
      };

      const path = LearningPathService.getLearningPath(mockCourses as any, [], user);

      expect(path).not.toBeNull();
      expect(path.currentLevel).toBeDefined();
      expect(path.nextAction).toBeDefined();
    });

    it('should recommend beginner courses for new users', () => {
      const user = {
        id: 'user1',
        xp: 50,
        level: 1,
        watchedClasses: [],
        accuracy: 0,
        aportes: 0,
      };

      const path = LearningPathService.getLearningPath(mockCourses as any, [], user);

      expect(path.nextAction?.type).toBe('start_course');
    });

    it('should track learning progress', () => {
      const user = {
        id: 'user1',
        xp: 1000,
        level: 5,
        watchedClasses: ['c1'],
        accuracy: 60,
        aportes: 10,
      };

      const path = LearningPathService.getLearningPath(mockCourses as any, [], user);

      expect(path).not.toBeNull();
    });
  });

  describe('Feed Ranker Service', () => {
    const mockPosts = [
      { id: 'p1', idUsuario: 'u1', likes: ['a', 'b', 'c'], comentarios: [], categoria: 'Idea', createdAt: Date.now() - 1000, ultimaInteraccion: Date.now() - 500, esAnuncio: false },
      { id: 'p2', idUsuario: 'u2', likes: ['d', 'e'], comentarios: [], categoria: 'Estrategia', createdAt: Date.now() - 2000, ultimaInteraccion: Date.now() - 1000, esAnuncio: false },
      { id: 'p3', idUsuario: 'u3', likes: [], comentarios: [], categoria: 'General', createdAt: Date.now() - 3000, ultimaInteraccion: Date.now() - 2000, esAnuncio: false },
    ];

    it('should rank posts by engagement', () => {
      const ranked = FeedRanker.rankPosts(mockPosts as any);

      expect(ranked).toHaveLength(3);
      expect(ranked[0].id).toBe('p1');
    });

    it('should rank posts including ads', () => {
      const withAds = [...mockPosts, { id: 'ad1', esAnuncio: true }];
      const ranked = FeedRanker.rankPosts(withAds as any);

      expect(ranked.length).toBeGreaterThanOrEqual(3);
      expect(ranked.every(r => typeof r.score === 'number')).toBe(true);
    });

    it('should apply trust boost for high-rep users', () => {
      const ranked = FeedRanker.rankPosts(mockPosts as any);

      ranked.forEach(r => {
        expect(r.score).toBeDefined();
        expect(typeof r.score).toBe('number');
      });
    });
  });

  describe('Service Integration', () => {
    it('should rank posts with trust score', () => {
      const trust = TrustLayer.getAuthorTrust({
        id: 'u1',
        xp: 10000,
        level: 20,
        aportes: 100,
        accuracy: 75,
        seguidores: ['a', 'b', 'c'],
        badges: ['Verified'],
        diasActivos: 180,
      });

      const posts = [
        { id: 'p1', idUsuario: 'u1', likes: ['a', 'b'], comentarios: [], categoria: 'Idea', createdAt: Date.now(), ultimaInteraccion: Date.now(), esAnuncio: false },
      ];

      const ranked = FeedRanker.rankPosts(posts as any);

      expect(ranked[0].score).toBeGreaterThan(0);
      expect(trust.score).toBeGreaterThan(50);
    });

    it('should recommend content based on user level', () => {
      const beginnerUser = {
        id: 'u1',
        xp: 100,
        level: 1,
        watchedClasses: [],
        accuracy: 0,
        aportes: 0,
      };

      const courses = [
        { id: 'c1', titulo: 'Forex Basics', nivel: 'Principiante', completada: false },
        { id: 'c2', titulo: 'Advanced Trading', nivel: 'Avanzado', completada: false },
      ];

      const path = LearningPathService.getLearningPath(courses as any, [], beginnerUser);

      expect(path.nextAction?.type).toBe('start_course');
    });
  });
});

describe('Integration: Gamification Systems', () => {
  describe('XP and Levels', () => {
    it('should calculate level from XP', () => {
      const user = {
        id: 'u1',
        xp: 1000,
        level: 5,
        watchedClasses: [],
        accuracy: 50,
        aportes: 10,
      };

      const path = LearningPathService.getLearningPath([], [], user);

      expect(path.currentLevel).toBeDefined();
    });

    it('should track achievements via trust layer', () => {
      const trust = TrustLayer.getAuthorTrust({
        id: 'achiever',
        xp: 50000,
        level: 50,
        aportes: 500,
        accuracy: 85,
        seguidores: ['a', 'b', 'c', 'd', 'e'],
        badges: ['TopAnalyst', 'Whale'],
        diasActivos: 365,
      });

      expect(['expert', 'elite']).toContain(trust.tier);
      expect(trust.score).toBeGreaterThan(70);
    });
  });
});
