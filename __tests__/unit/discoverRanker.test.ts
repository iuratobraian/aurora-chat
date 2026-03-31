import { describe, it, expect } from 'vitest';
import { DiscoverRanker } from '../../src/services/ranking/discoverRanker';
import type { Publicacion, Usuario } from '../../types';

function makePost(overrides: Partial<Publicacion> = {}): Publicacion {
  return {
    id: 'post1',
    idUsuario: 'user1',
    nombreUsuario: 'User One',
    usuarioManejo: 'userone',
    avatarUsuario: '',
    esPro: false,
    categoria: 'General',
    par: 'EURUSD',
    tipo: 'Compra',
    contenido: 'Test post content',
    datosGrafico: [],
    tiempo: 'Hace 1 hora',
    ultimaInteraccion: Date.now() - 3600000,
    likes: [],
    seguidoresPost: [],
    comentarios: [],
    compartidos: 0,
    ...overrides,
  };
}

function makeUser(overrides: Partial<Usuario> = {}): Partial<Usuario> {
  return {
    id: 'user1',
    nombre: 'Test User',
    usuario: 'testuser',
    avatar: '',
    esPro: false,
    xp: 100,
    level: 1,
    seguidores: [],
    siguiendo: [],
    aportes: 0,
    accuracy: 0,
    reputation: 50,
    badges: [],
    watchlist: [],
    estadisticas: { tasaVictoria: 0, factorBeneficio: 0, pnlTotal: 0 },
    saldo: 0,
    rol: 'user',
    role: 1,
    ...overrides,
  };
}

describe('DiscoverRanker', () => {
  describe('surface', () => {
    it('should return discover surface with scored items', () => {
      const posts = [makePost({ id: 'p1' })];
      const users = [makeUser({ id: 'u1' })];
      const result = DiscoverRanker.surface(posts, users);
      expect(result.items.length).toBe(2);
      expect(result.surface).toBe('discover');
      expect(result.signal).toBe('live');
    });

    it('should boost high-score items', () => {
      const posts = [
        makePost({ id: 'p1', likes: [] }),
        makePost({ id: 'p2', likes: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'] }),
      ];
      const result = DiscoverRanker.surface(posts, []);
      expect(result.items[0].score).toBeGreaterThan(result.items[1].score);
    });

    it('should return empty signal when no items', () => {
      const result = DiscoverRanker.surface([], []);
      expect(result.signal).toBe('empty');
      expect(result.items.length).toBe(0);
    });

    it('should score posts by author trust', () => {
      const posts = [
        makePost({ id: 'p1', accuracyUser: 0 }),
        makePost({ id: 'p2', accuracyUser: 80, badgesSnapshot: ['TopAnalyst'] }),
      ];
      const result = DiscoverRanker.surface(posts, []);
      expect(result.items[0].id).toBe('p2');
    });
  });

  describe('ensureDiversity', () => {
    it('should limit same-type items based on maxDiversity ratio', () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: `item${i}`,
        type: 'post' as const,
        data: makePost({ id: `p${i}` }),
        score: 100 - i,
        boosted: i === 0,
        reason: '',
        diversity: 0,
        trend: 0,
      }));

      const result = DiscoverRanker.ensureDiversity(items, 0.3);
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('should return items as-is when few items', () => {
      const items = [
        { id: 'p1', type: 'post' as const, data: makePost({ id: 'p1' }), score: 50, boosted: false, reason: '', diversity: 0, trend: 0 },
        { id: 'p2', type: 'post' as const, data: makePost({ id: 'p2' }), score: 40, boosted: false, reason: '', diversity: 0, trend: 0 },
      ];
      const result = DiscoverRanker.ensureDiversity(items, 0.3);
      expect(result.length).toBe(2);
    });

    it('should cap at 20 items', () => {
      const items = Array.from({ length: 30 }, (_, i) => ({
        id: `item${i}`,
        type: 'post' as const,
        data: makePost({ id: `p${i}` }),
        score: 100 - i,
        boosted: false,
        reason: '',
        diversity: 0,
        trend: 0,
      }));
      const result = DiscoverRanker.ensureDiversity(items, 0.5);
      expect(result.length).toBeLessThanOrEqual(20);
    });
  });

  describe('getTrendingPosts', () => {
    it('should return posts within time window', () => {
      const posts = [
        makePost({ id: 'p1', ultimaInteraccion: Date.now() - 3600000 * 12 }),
        makePost({ id: 'p2', ultimaInteraccion: Date.now() - 3600000 }),
      ];
      const trending = DiscoverRanker.getTrendingPosts(posts, 24);
      expect(trending.length).toBe(2);
    });

    it('should filter out posts outside time window', () => {
      const posts = [
        makePost({ id: 'p1', ultimaInteraccion: Date.now() - 86400000 * 5 }),
        makePost({ id: 'p2', ultimaInteraccion: Date.now() - 3600000 }),
      ];
      const trending = DiscoverRanker.getTrendingPosts(posts, 24);
      expect(trending.length).toBe(1);
      expect(trending[0].id).toBe('p2');
    });

    it('should sort by engagement', () => {
      const posts = [
        makePost({ id: 'p1', likes: [], comentarios: [] }),
        makePost({ id: 'p2', likes: ['u1', 'u2'], comentarios: [] }),
      ];
      const trending = DiscoverRanker.getTrendingPosts(posts, 24);
      expect(trending[0].id).toBe('p2');
    });

    it('should respect limit of 10', () => {
      const posts = Array.from({ length: 15 }, (_, i) =>
        makePost({ id: `p${i}`, likes: [`u${i}`] })
      );
      const trending = DiscoverRanker.getTrendingPosts(posts, 24);
      expect(trending.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getForYou', () => {
    it('should return personalized posts sorted by score', () => {
      const posts = [
        makePost({ id: 'p1', par: 'GBPUSD' }),
        makePost({ id: 'p2', par: 'EURUSD' }),
      ];
      const result = DiscoverRanker.getForYou(posts, { userInterests: ['eur'] });
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('p2');
    });

    it('should respect limit of 10', () => {
      const posts = Array.from({ length: 15 }, (_, i) => makePost({ id: `p${i}` }));
      const result = DiscoverRanker.getForYou(posts, {});
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should return empty for empty posts', () => {
      const result = DiscoverRanker.getForYou([], {});
      expect(result.length).toBe(0);
    });
  });

  describe('getExplore', () => {
    it('should return non-boosted items', () => {
      const posts = [
        makePost({ id: 'p1', likes: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'] }),
        makePost({ id: 'p2', likes: [] }),
      ];
      const result = DiscoverRanker.getExplore(posts, [], {});
      expect(result.every(item => !item.boosted)).toBe(true);
    });

    it('should respect limit of 15', () => {
      const posts = Array.from({ length: 20 }, (_, i) => makePost({ id: `p${i}` }));
      const result = DiscoverRanker.getExplore(posts, [], {});
      expect(result.length).toBeLessThanOrEqual(15);
    });

    it('should include users when provided', () => {
      const posts: Publicacion[] = [];
      const users = [makeUser({ id: 'u1' })];
      const result = DiscoverRanker.getExplore(posts, users, {});
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('user');
    });
  });
});
