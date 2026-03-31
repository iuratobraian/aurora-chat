import { describe, it, expect } from 'vitest';
import { SearchRanker } from '../../src/services/ranking/searchRanker';
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
    contenido: 'Test post about trading EURUSD',
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

describe('SearchRanker', () => {
  describe('surface', () => {
    it('should return empty for short queries', () => {
      const posts = [makePost({ id: 'p1' })];
      const users = [makeUser({ id: 'u1' })];
      const result = SearchRanker.surface(posts, users, { query: 'a' });
      expect(result.items.length).toBe(0);
      expect(result.signal).toBe('empty');
    });

    it('should score posts by text match', () => {
      const posts = [
        makePost({ id: 'p1', titulo: 'EURUSD Analysis', contenido: 'Bullish trend on EURUSD' }),
        makePost({ id: 'p2', titulo: 'GBPUSD Analysis', contenido: 'Bearish trend on GBPUSD' }),
      ];
      const result = SearchRanker.surface(posts, [], { query: 'EURUSD' });
      expect(result.items[0].id).toBe('p1');
      expect(result.items[0].matchQuality).toBe('exact');
    });

    it('should boost posts with high engagement', () => {
      const posts = [
        makePost({ id: 'p1', likes: [], comentarios: [] }),
        makePost({ id: 'p2', likes: ['u1', 'u2', 'u3', 'u4', 'u5'], comentarios: [{ id: 'c1', idUsuario: 'u1', nombreUsuario: 'U', avatarUsuario: '', texto: 'Great!', tiempo: 'Ahora', likes: [] } as any] }),
      ];
      const result = SearchRanker.surface(posts, [], { query: 'EURUSD' });
      expect(result.items[0].id).toBe('p2');
      expect(result.items[0].boosted).toBe(true);
    });

    it('should include users when includeUsers is true', () => {
      const posts: Publicacion[] = [];
      const users = [makeUser({ id: 'u1', usuario: 'traderjohn' })];
      const result = SearchRanker.surface(posts, users, { query: 'john' });
      expect(result.items.length).toBe(1);
      expect(result.items[0].type).toBe('user');
    });

    it('should return correct surface metadata', () => {
      const posts = [makePost({ id: 'p1' })];
      const result = SearchRanker.surface(posts, [], { query: 'trading' });
      expect(result.surface).toBe('search');
      expect(result.query).toBe('trading');
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should sort by match quality then score', () => {
      const posts = [
        makePost({ id: 'p1', contenido: 'Something else' }),
        makePost({ id: 'p2', titulo: 'EURUSD Trading Strategy', contenido: 'EURUSD strategies' }),
      ];
      const result = SearchRanker.surface(posts, [], { query: 'EURUSD' });
      expect(result.items[0].id).toBe('p2');
    });
  });

  describe('search', () => {
    it('should return search results array', () => {
      const posts = [makePost({ id: 'p1', contenido: 'EURUSD trading' })];
      const results = SearchRanker.search(posts, [], 'EURUSD', 10);
      expect(Array.isArray(results)).toBe(true);
      expect(results[0].id).toBe('p1');
    });
  });

  describe('getSuggestions', () => {
    it('should suggest matching pairs', () => {
      const posts = [
        makePost({ id: 'p1', par: 'EURUSD' }),
        makePost({ id: 'p2', par: 'EURGBP' }),
        makePost({ id: 'p3', par: 'GBPUSD' }),
      ];
      const suggestions = SearchRanker.getSuggestions(posts, [], 'eur', 5);
      expect(suggestions).toContain('EURUSD');
      expect(suggestions).toContain('EURGBP');
    });

    it('should suggest matching tags', () => {
      const posts = [
        makePost({ id: 'p1', tags: ['scalping', 'forex'] }),
      ];
      const suggestions = SearchRanker.getSuggestions(posts, [], 'scal', 5);
      expect(suggestions).toContain('scalping');
    });

    it('should suggest matching usernames', () => {
      const users = [makeUser({ id: 'u1', usuario: 'johntrader' })];
      const suggestions = SearchRanker.getSuggestions([], users, 'john', 5);
      expect(suggestions).toContain('@johntrader');
    });

    it('should return empty for very short partial queries', () => {
      const posts = [makePost({ id: 'p1' })];
      const suggestions = SearchRanker.getSuggestions(posts, [], 'e', 5);
      expect(suggestions).toEqual([]);
    });

    it('should respect limit parameter', () => {
      const posts = [
        makePost({ id: 'p1', par: 'EURUSD' }),
        makePost({ id: 'p2', par: 'EURUSD' }),
        makePost({ id: 'p3', par: 'EURUSD' }),
        makePost({ id: 'p4', par: 'EURUSD' }),
        makePost({ id: 'p5', par: 'EURUSD' }),
        makePost({ id: 'p6', par: 'EURUSD' }),
      ];
      const suggestions = SearchRanker.getSuggestions(posts, [], 'eur', 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('highlightMatches', () => {
    it('should wrap matching words in mark tags', () => {
      const text = 'Trading EURUSD strategies';
      const highlighted = SearchRanker.highlightMatches(text, 'EURUSD');
      expect(highlighted).toContain('<mark>EURUSD</mark>');
    });

    it('should handle multiple word queries', () => {
      const text = 'EURUSD trading strategies';
      const highlighted = SearchRanker.highlightMatches(text, 'EURUSD trading');
      expect(highlighted).toContain('<mark>EURUSD</mark>');
      expect(highlighted).toContain('<mark>trading</mark>');
    });

    it('should be case insensitive', () => {
      const text = 'EURUSD trading';
      const highlighted = SearchRanker.highlightMatches(text, 'eurusd');
      expect(highlighted).toContain('<mark>EURUSD</mark>');
    });

    it('should handle accented characters', () => {
      const text = 'Análisis de trading';
      const highlighted = SearchRanker.highlightMatches(text, 'trading');
      expect(highlighted).toContain('<mark>trading</mark>');
    });

    it('should return original text for empty query', () => {
      const text = 'Some text';
      const highlighted = SearchRanker.highlightMatches(text, '');
      expect(highlighted).toBe(text);
    });

    it('should return original text for very short queries', () => {
      const text = 'Some text';
      const highlighted = SearchRanker.highlightMatches(text, 'a');
      expect(highlighted).toBe(text);
    });
  });
});
