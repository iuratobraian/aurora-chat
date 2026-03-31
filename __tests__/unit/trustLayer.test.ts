import { describe, it, expect } from 'vitest';
import { TrustLayer } from '../../src/services/ranking/trustLayer';
import type { BadgeType } from '../../types';

describe('TrustLayer', () => {
  describe('getAuthorTrust', () => {
    it('should return trust score for verified user with badges', () => {
      const author = {
        accuracy: 80,
        seguidores: Array(150).fill('u') as string[],
        aportes: 20,
        badges: ['Verified', 'TopAnalyst'] as BadgeType[],
        diasActivos: 30,
        esVerificado: true,
        esPro: true,
        fechaRegistro: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = TrustLayer.getAuthorTrust(author);

      expect(result.score).toBeGreaterThan(0);
      expect(['new', 'basic', 'verified', 'expert', 'elite']).toContain(result.tier);
      expect(result.boostReasons.length).toBeGreaterThan(0);
      expect(result.boostReasons).toContain('Cuenta verificada');
    });

    it('should return new tier for user with minimal activity', () => {
      const result = TrustLayer.getAuthorTrust({ seguidores: [], aportes: 0, badges: [], diasActivos: 0, accuracy: 0 });
      expect(result.tier).toBe('new');
      expect(result.score).toBe(0);
    });

    it('should cap scores at 100', () => {
      const author = {
        accuracy: 100,
        seguidores: Array(500).fill('u') as string[],
        aportes: 50,
        badges: ['Verified', 'TopAnalyst', 'Whale', 'Influencer'] as BadgeType[],
        diasActivos: 100,
        fechaRegistro: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = TrustLayer.getAuthorTrust(author);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('getContentTrust', () => {
    it('should boost content with high engagement', () => {
      const post = {
        likes: Array(20).fill('u'),
        comentarios: Array(10).fill({}),
        contenido: 'This is a detailed analysis of the EUR/USD pair with multiple factors considered.',
      };

      const result = TrustLayer.getContentTrust(post);

      expect(result.boosted).toBe(true);
      expect(result.score).toBeGreaterThan(30);
    });

    it('should flag low quality content', () => {
      const post = {
        likes: [],
        comentarios: [],
        contenido: 'Hi',
      };

      const result = TrustLayer.getContentTrust(post);
      expect(result.flags).toContain('low_quality');
    });

    it('should boost AI agent content', () => {
      const post = {
        likes: Array(5).fill('u'),
        comentarios: [],
        contenido: 'AI generated analysis.',
        isAiAgent: true,
      };

      const result = TrustLayer.getContentTrust(post);
      expect(result.reasons).toContain('Contenido IA');
    });
  });

  describe('getTierLabel', () => {
    it('should return correct labels for each tier', () => {
      expect(TrustLayer.getTierLabel('new')).toBe('Nuevo');
      expect(TrustLayer.getTierLabel('basic')).toBe('Básico');
      expect(TrustLayer.getTierLabel('verified')).toBe('Verificado');
      expect(TrustLayer.getTierLabel('expert')).toBe('Experto');
      expect(TrustLayer.getTierLabel('elite')).toBe('Élite');
    });
  });

  describe('getTierColor', () => {
    it('should return distinct colors per tier', () => {
      const colors = ['new', 'basic', 'verified', 'expert', 'elite'].map(t => TrustLayer.getTierColor(t as any));
      const unique = new Set(colors);
      expect(unique.size).toBe(5);
    });
  });

  describe('getTierBadge', () => {
    it('should return badge symbols for higher tiers', () => {
      expect(TrustLayer.getTierBadge('new')).toBe('');
      expect(TrustLayer.getTierBadge('basic')).toBe('');
      expect(TrustLayer.getTierBadge('verified')).toBe('✓');
      expect(TrustLayer.getTierBadge('expert')).toBe('★');
      expect(TrustLayer.getTierBadge('elite')).toBe('★');
    });
  });

  describe('shouldSuppressContent', () => {
    it('should suppress spam content', () => {
      expect(TrustLayer.shouldSuppressContent(['spam'])).toBe(true);
    });

    it('should suppress suspicious content', () => {
      expect(TrustLayer.shouldSuppressContent(['suspicious'])).toBe(true);
    });

    it('should not suppress low quality content alone', () => {
      expect(TrustLayer.shouldSuppressContent(['low_quality'])).toBe(false);
    });
  });
});
