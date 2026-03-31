import { describe, it, expect, beforeEach } from 'vitest';
import { FeedRanker } from '../../src/services/feed/feedRanker';
import type { Publicacion } from '../../types';

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

describe('FeedRanker', () => {
  describe('rankPosts', () => {
    it('should rank posts by priority score', () => {
      const posts = [
        makePost({ id: 'p1', likes: [] }),
        makePost({ id: 'p2', likes: ['u1', 'u2', 'u3', 'u4', 'u5'] }),
        makePost({ id: 'p3', likes: ['u1'] }),
      ];
      const ranked = FeedRanker.rankPosts(posts);
      expect(ranked[0].id).toBe('p2');
      expect(ranked[1].id).toBe('p3');
      expect(ranked[2].id).toBe('p1');
    });

    it('should boost posts with high engagement', () => {
      const posts = [
        makePost({ id: 'p1', likes: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'] }),
        makePost({ id: 'p2', likes: [] }),
      ];
      const ranked = FeedRanker.rankPosts(posts);
      expect(ranked[0].boosted).toBe(true);
      expect(ranked[1].boosted).toBe(false);
    });

    it('should prioritize recent posts', () => {
      const posts = [
        makePost({ id: 'p1', ultimaInteraccion: Date.now() - 86400000 * 3 }),
        makePost({ id: 'p2', ultimaInteraccion: Date.now() - 3600000 }),
      ];
      const ranked = FeedRanker.rankPosts(posts);
      expect(ranked[0].id).toBe('p2');
    });

    it('should boost AI agent posts', () => {
      const posts = [
        makePost({ id: 'p1', isAiAgent: false }),
        makePost({ id: 'p2', isAiAgent: true }),
      ];
      const ranked = FeedRanker.rankPosts(posts);
      expect(ranked[0].id).toBe('p2');
    });

    it('should use custom config', () => {
      const posts = [makePost({ id: 'p1' })];
      const ranked = FeedRanker.rankPosts(posts, { userInterests: ['eur'] });
      expect(ranked.length).toBe(1);
    });
  });

  describe('mergeSignalsIntoFeed', () => {
    it('should include signals when includeSignals is true', () => {
      const posts = [makePost({ id: 'p1' })];
      const signals = [{ _id: 's1', pair: 'EURUSD', direction: 'buy', entryPrice: 1.1, stopLoss: 1.0, takeProfit: [1.2], winRate: 65, providerXp: 500, createdAt: Date.now() }];
      const merged = FeedRanker.mergeSignalsIntoFeed(FeedRanker.rankPosts(posts), signals);
      const signalItems = merged.filter(i => i.type === 'signal');
      expect(signalItems.length).toBe(1);
    });

    it('should filter signals by minimum win rate', () => {
      const posts = [makePost({ id: 'p1' })];
      const signals = [
        { _id: 's1', pair: 'EURUSD', direction: 'buy', entryPrice: 1.1, stopLoss: 1.0, takeProfit: [1.2], winRate: 60, providerXp: 500, createdAt: Date.now() },
        { _id: 's2', pair: 'GBPUSD', direction: 'sell', entryPrice: 1.3, stopLoss: 1.4, takeProfit: [1.2], winRate: 40, providerXp: 300, createdAt: Date.now() },
      ];
      const merged = FeedRanker.mergeSignalsIntoFeed(FeedRanker.rankPosts(posts), signals, { signalMinWinRate: 50 });
      expect(merged.length).toBe(2);
      const signalItems = merged.filter(i => i.type === 'signal');
      expect(signalItems.length).toBe(1);
    });

    it('should cap signals per page', () => {
      const posts = [makePost({ id: 'p1' })];
      const signals = [
        { _id: 's1', pair: 'EURUSD', direction: 'buy', entryPrice: 1.1, stopLoss: 1.0, takeProfit: [1.2], winRate: 70, providerXp: 500, createdAt: Date.now() },
        { _id: 's2', pair: 'GBPUSD', direction: 'buy', entryPrice: 1.3, stopLoss: 1.4, takeProfit: [1.2], winRate: 70, providerXp: 400, createdAt: Date.now() },
        { _id: 's3', pair: 'USDJPY', direction: 'buy', entryPrice: 150, stopLoss: 149, takeProfit: [151], winRate: 70, providerXp: 600, createdAt: Date.now() },
        { _id: 's4', pair: 'AUDUSD', direction: 'buy', entryPrice: 0.7, stopLoss: 0.69, takeProfit: [0.72], winRate: 70, providerXp: 700, createdAt: Date.now() },
      ];
      const merged = FeedRanker.mergeSignalsIntoFeed(FeedRanker.rankPosts(posts), signals, { maxSignalsPerPage: 2 });
      const signalItems = merged.filter(i => i.type === 'signal');
      expect(signalItems.length).toBe(2);
    });

    it('should return only posts when includeSignals is false', () => {
      const posts = [makePost({ id: 'p1' })];
      const signals = [{ _id: 's1', pair: 'EURUSD', direction: 'buy', entryPrice: 1.1, stopLoss: 1.0, takeProfit: [1.2], winRate: 65, providerXp: 500, createdAt: Date.now() }];
      const merged = FeedRanker.mergeSignalsIntoFeed(FeedRanker.rankPosts(posts), signals, { includeSignals: false });
      const signalItems = merged.filter(i => i.type === 'signal');
      expect(signalItems.length).toBe(0);
    });
  });

  describe('filterByInterest', () => {
    it('should filter by pair interest', () => {
      const items = [
        { id: 'p1', type: 'post' as const, data: makePost({ par: 'EURUSD' }), score: 50, boosted: false, reason: '' },
        { id: 'p2', type: 'post' as const, data: makePost({ par: 'GBPUSD' }), score: 50, boosted: false, reason: '' },
      ];
      const filtered = FeedRanker.filterByInterest(items, ['eur']);
      expect(filtered[0].id).toBe('p1');
      expect(filtered[1].id).toBe('p2');
    });

    it('should return all items when no interests provided', () => {
      const items = [
        { id: 'p1', type: 'post' as const, data: makePost({ par: 'EURUSD' }), score: 50, boosted: false, reason: '' },
      ];
      const filtered = FeedRanker.filterByInterest(items, []);
      expect(filtered.length).toBe(1);
    });
  });

  describe('getTopItems', () => {
    it('should return limited items', () => {
      const items = [
        { id: 'p1', type: 'post' as const, data: makePost(), score: 80, boosted: true, reason: '' },
        { id: 'p2', type: 'post' as const, data: makePost(), score: 60, boosted: false, reason: '' },
        { id: 'p3', type: 'post' as const, data: makePost(), score: 40, boosted: false, reason: '' },
      ];
      const top = FeedRanker.getTopItems(items, 2);
      expect(top.length).toBe(2);
      expect(top[0].id).toBe('p1');
    });
  });

  describe('getBoostsCount', () => {
    it('should count boosted items', () => {
      const items = [
        { id: 'p1', type: 'post' as const, data: makePost(), score: 80, boosted: true, reason: '' },
        { id: 'p2', type: 'post' as const, data: makePost(), score: 60, boosted: false, reason: '' },
        { id: 'p3', type: 'post' as const, data: makePost(), score: 90, boosted: true, reason: '' },
      ];
      expect(FeedRanker.getBoostsCount(items)).toBe(2);
    });
  });

  describe('getSignalsCount', () => {
    it('should count signal items', () => {
      const items = [
        { id: 'p1', type: 'post' as const, data: makePost(), score: 80, boosted: true, reason: '' },
        { id: 's1', type: 'signal' as const, data: {} as any, score: 75, boosted: true, reason: '' },
      ];
      expect(FeedRanker.getSignalsCount(items)).toBe(1);
    });
  });

  describe('surface', () => {
    it('should return feed surface with pagination', () => {
      const posts = Array.from({ length: 25 }, (_, i) => makePost({ id: `p${i}`, likes: [String(i)] }));
      const result = FeedRanker.surface(posts, [], { pageSize: 10, page: 0 });
      expect(result.items.length).toBe(10);
      expect(result.total).toBe(25);
      expect(result.hasMore).toBe(true);
      expect(result.surface).toBe('feed');
    });

    it('should return signal metadata', () => {
      const posts = [makePost({ id: 'p1' })];
      const result = FeedRanker.surface(posts, [], {}, 'cached');
      expect(result.signal).toBe('cached');
    });
  });
});
