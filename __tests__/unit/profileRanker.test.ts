import { describe, it, expect } from 'vitest';
import { ProfileRanker } from '../../src/services/ranking/profileRanker';
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

describe('ProfileRanker', () => {
  describe('surface', () => {
    it('should return profile surface with ranked posts', () => {
      const user = makeUser({ id: 'u1' });
      const posts = [
        makePost({ id: 'p1' }),
        makePost({ id: 'p2' }),
      ];
      const result = ProfileRanker.surface(user, posts);
      expect(result.user.id).toBe('u1');
      expect(result.posts.length).toBe(2);
      expect(result.signal).toBe('live');
      expect(result.posts[0].post.id).toBeDefined();
    });

    it('should calculate profile stats', () => {
      const user = makeUser({ id: 'u1', seguidores: ['f1', 'f2', 'f3'] });
      const posts = [
        makePost({ id: 'p1', likes: ['u1', 'u2'], comentarios: [{ id: 'c1', idUsuario: 'u1', nombreUsuario: 'U', avatarUsuario: '', texto: 'Good', tiempo: 'Ahora', likes: [] } as any] }),
        makePost({ id: 'p2', likes: ['u3'], comentarios: [] }),
      ];
      const result = ProfileRanker.surface(user, posts);
      expect(result.stats.totalPosts).toBe(2);
      expect(result.stats.totalLikes).toBe(3);
      expect(result.stats.totalComments).toBe(1);
      expect(result.stats.totalFollowers).toBe(3);
    });

    it('should assign badges based on user badges', () => {
      const user = makeUser({ id: 'u1', badges: ['TopAnalyst', 'Verified'] });
      const result = ProfileRanker.surface(user, []);
      expect(result.badges.length).toBeGreaterThanOrEqual(2);
      const analystBadge = result.badges.find(b => b.name === 'TopAnalyst');
      expect(analystBadge).toBeDefined();
      expect(analystBadge?.tier).toBe('gold');
    });

    it('should boost high-engagement posts', () => {
      const user = makeUser({ id: 'u1' });
      const posts = [
        makePost({ id: 'p1', likes: ['u1', 'u2'] }),
        makePost({ id: 'p2', likes: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'] }),
      ];
      const result = ProfileRanker.surface(user, posts);
      expect(result.posts[0].boosted).toBe(true);
    });

    it('should sort by engagement by default', () => {
      const user = makeUser({ id: 'u1' });
      const posts = [
        makePost({ id: 'p1', likes: [] }),
        makePost({ id: 'p2', likes: ['u1', 'u2', 'u3', 'u4'] }),
      ];
      const result = ProfileRanker.surface(user, posts);
      expect(result.posts[0].post.id).toBe('p2');
    });

    it('should sort by recency when configured', () => {
      const user = makeUser({ id: 'u1' });
      const posts = [
        makePost({ id: 'p1', ultimaInteraccion: Date.now() - 86400000 * 3 }),
        makePost({ id: 'p2', ultimaInteraccion: Date.now() - 3600000 }),
      ];
      const result = ProfileRanker.surface(user, posts, { sortBy: 'recency' });
      expect(result.posts[0].post.id).toBe('p2');
    });

    it('should return empty signal when no posts', () => {
      const user = makeUser({ id: 'u1' });
      const result = ProfileRanker.surface(user, []);
      expect(result.signal).toBe('empty');
    });
  });

  describe('getTopPosts', () => {
    it('should return top posts by score', () => {
      const posts = [
        makePost({ id: 'p1', likes: [] }),
        makePost({ id: 'p2', likes: ['u1', 'u2', 'u3', 'u4'] }),
        makePost({ id: 'p3', likes: ['u1'] }),
      ];
      const top = ProfileRanker.getTopPosts(posts, 2);
      expect(top.length).toBe(2);
      expect(top[0].post.id).toBe('p2');
    });
  });

  describe('getTradingPosts', () => {
    it('should filter trading category posts', () => {
      const posts = [
        makePost({ id: 'p1', categoria: 'Idea' }),
        makePost({ id: 'p2', categoria: 'Estrategia' }),
        makePost({ id: 'p3', categoria: 'General' }),
        makePost({ id: 'p4', categoria: 'Idea' }),
      ];
      const trading = ProfileRanker.getTradingPosts(posts, 10);
      expect(trading.length).toBe(3);
      expect(trading.every(p => p.highlight === 'trading')).toBe(true);
    });

    it('should respect limit', () => {
      const posts = [
        makePost({ id: 'p1', categoria: 'Idea' }),
        makePost({ id: 'p2', categoria: 'Estrategia' }),
      ];
      const trading = ProfileRanker.getTradingPosts(posts, 1);
      expect(trading.length).toBe(1);
    });
  });

  describe('getPopularPosts', () => {
    it('should filter posts with more than 5 likes', () => {
      const posts = [
        makePost({ id: 'p1', likes: ['u1', 'u2', 'u3'] }),
        makePost({ id: 'p2', likes: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'] }),
      ];
      const popular = ProfileRanker.getPopularPosts(posts, 10);
      expect(popular.length).toBe(1);
      expect(popular[0].post.id).toBe('p2');
    });
  });

  describe('compareUsers', () => {
    it('should compare two users and determine winner', () => {
      const userA = makeUser({ id: 'u1', xp: 1000, seguidores: ['f1'], badges: ['TopAnalyst'] });
      const postsA = [makePost({ id: 'p1', likes: ['u1', 'u2'] })];
      const userB = makeUser({ id: 'u2', xp: 200, seguidores: ['f1', 'f2', 'f3', 'f4', 'f5'], badges: [] });
      const postsB = [makePost({ id: 'p2', likes: [] })];

      const result = ProfileRanker.compareUsers(userA, postsA, userB, postsB);
      expect(['A', 'B', 'tie']).toContain(result.winner);
      expect(result.metrics.totalPosts).toBeDefined();
      expect(result.metrics.trustScore).toBeDefined();
    });

    it('should return tie when users are equal', () => {
      const userA = makeUser({ id: 'u1' });
      const postsA: Publicacion[] = [];
      const userB = makeUser({ id: 'u2' });
      const postsB: Publicacion[] = [];
      const result = ProfileRanker.compareUsers(userA, postsA, userB, postsB);
      expect(result.winner).toBe('tie');
    });
  });
});
