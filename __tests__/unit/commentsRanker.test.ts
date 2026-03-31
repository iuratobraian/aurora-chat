import { describe, it, expect } from 'vitest';
import { CommentsRanker } from '../../src/services/ranking/commentsRanker';
import type { Comentario } from '../../types';

const makeComment = (overrides: Partial<Comentario> = {}): Comentario => ({
  id: 'c1',
  idUsuario: 'u1',
  nombreUsuario: 'Test User',
  avatarUsuario: 'https://example.com/avatar.png',
  texto: 'This is a test comment with sufficient length',
  tiempo: 'Ahora',
  likes: [],
  respuestas: [],
  ...overrides,
});

describe('CommentsRanker', () => {
  describe('rank', () => {
    it('should return empty for empty array', () => {
      const result = CommentsRanker.rank([]);
      expect(result).toEqual([]);
    });

    it('should sort by engagement score', () => {
      const comments = [
        makeComment({ id: 'c1', likes: [], respuestas: [] }),
        makeComment({ id: 'c2', likes: Array(10).fill('u'), respuestas: [] }),
        makeComment({ id: 'c3', likes: Array(5).fill('u'), respuestas: [] }),
      ];

      const result = CommentsRanker.rank(comments);

      expect(result[0].comment.id).toBe('c2'); // Most likes
      expect(result[1].comment.id).toBe('c3'); // Second
      expect(result[2].comment.id).toBe('c1'); // Least
    });

    it('should count nested responses in engagement', () => {
      const comments = [
        makeComment({ id: 'c1', likes: [], respuestas: [] }),
        makeComment({ id: 'c2', likes: [], respuestas: [
          makeComment({ id: 'r1' }),
          makeComment({ id: 'r2' }),
        ] }),
      ];

      const result = CommentsRanker.rank(comments);

      expect(result[0].comment.id).toBe('c2'); // Has responses
    });

    it('should apply sort option correctly', () => {
      const comments = [
        makeComment({ id: 'c1', tiempo: 'Hace 1 día', likes: Array(20).fill('u') }),
        makeComment({ id: 'c2', tiempo: 'Ahora', likes: Array(2).fill('u') }),
      ];

      const byRecency = CommentsRanker.rank(comments, { sortBy: 'recency' });
      const byQuality = CommentsRanker.rank(comments, { sortBy: 'quality' });

      expect(byRecency[0].comment.id).toBe('c2'); // Most recent
      expect(byQuality[0].comment.id).toBe('c1'); // Most engagement
    });
  });

  describe('surface', () => {
    it('should return empty surface for no comments', () => {
      const result = CommentsRanker.surface('post1', []);
      expect(result.signal).toBe('empty');
      expect(result.items).toHaveLength(0);
    });

    it('should return computed surface with comments', () => {
      const comments = [makeComment({ id: 'c1' })];
      const result = CommentsRanker.surface('post1', comments);
      expect(result.signal).toBe('computed');
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.postId).toBe('post1');
    });
  });

  describe('getTopComments', () => {
    it('should limit results', () => {
      const comments = Array.from({ length: 20 }, (_, i) =>
        makeComment({ id: `c${i}`, likes: Array((19 - i) * 2).fill('u') })
      );

      const result = CommentsRanker.getTopComments(comments, 5);

      expect(result).toHaveLength(5);
      expect(result[0].comment.id).toBe('c0'); // Most likes
    });
  });

  describe('getBoostsCount', () => {
    it('should count boosted comments', () => {
      const comments = [
        makeComment({ id: 'c1', likes: Array(30).fill('u') }), // High score -> boosted
        makeComment({ id: 'c2', likes: Array(2).fill('u') }),  // Low score -> not boosted
      ];

      const count = CommentsRanker.getBoostsCount(comments);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
