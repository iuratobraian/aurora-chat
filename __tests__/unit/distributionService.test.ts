import { describe, it, expect } from 'vitest';
import { distributionService } from '../../src/services/distribution/distributionService';

describe('distributionService', () => {
  describe('getChannels', () => {
    it('should return channels array', () => {
      const channels = distributionService.getChannels();
      
      expect(Array.isArray(channels)).toBe(true);
      expect(channels.length).toBeGreaterThan(0);
    });

    it('should have valid channel properties', () => {
      const channels = distributionService.getChannels();
      
      channels.forEach(channel => {
        expect(channel.id).toBeDefined();
        expect(channel.name).toBeDefined();
        expect(['community', 'social', 'email', 'rss']).toContain(channel.type);
        expect(typeof channel.enabled).toBe('boolean');
        expect(typeof channel.reach).toBe('number');
        expect(typeof channel.engagement).toBe('number');
      });
    });
  });

  describe('getEnabledChannels', () => {
    it('should return only enabled channels', () => {
      const channels = distributionService.getEnabledChannels();
      
      expect(Array.isArray(channels)).toBe(true);
      channels.forEach(channel => {
        expect(channel.enabled).toBe(true);
      });
    });
  });

  describe('enableChannel', () => {
    it('should enable a channel', () => {
      const result = distributionService.enableChannel('community-feed');
      
      expect(typeof result).toBe('boolean');
    });
  });

  describe('disableChannel', () => {
    it('should disable a channel', () => {
      const result = distributionService.disableChannel('community-feed');
      
      expect(typeof result).toBe('boolean');
    });
  });

  describe('calculateReach', () => {
    it('should calculate reach for content', () => {
      const channels = distributionService.getChannels();
      const mockContent = {
        id: 'test-post',
        titulo: 'Test',
        contenido: 'Content',
        autor: 'test',
        likes: [],
        comentarios: [],
        tags: [],
        categoria: 'general',
        tiempo: 'Ahora',
        imagen: '',
        ultimaInteraccion: Date.now(),
        idUsuario: 'user1',
        nombreUsuario: 'Test User',
        avatarUsuario: '',
      };
      
      const reach = distributionService.calculateReach(mockContent as any, channels);
      
      expect(typeof reach).toBe('number');
      expect(reach).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateEngagement', () => {
    it('should calculate engagement for content', () => {
      const channels = distributionService.getChannels();
      const mockContent = {
        id: 'test-post',
        titulo: 'Test',
        contenido: 'Content',
        autor: 'test',
        likes: ['user1', 'user2'],
        comentarios: [],
        tags: [],
        categoria: 'general',
        tiempo: 'Ahora',
        imagen: '',
        ultimaInteraccion: Date.now(),
        idUsuario: 'user1',
        nombreUsuario: 'Test User',
        avatarUsuario: '',
      };
      
      const engagement = distributionService.calculateEngagement(mockContent as any, channels);
      
      expect(typeof engagement).toBe('number');
      expect(engagement).toBeGreaterThanOrEqual(0);
    });
  });

  describe('distribute', () => {
    it('should distribute content', () => {
      const mockContent = {
        id: 'test-dist-' + Date.now(),
        titulo: 'Test',
        contenido: 'Content',
        autor: 'test',
        likes: [],
        comentarios: [],
        tags: [],
        categoria: 'general',
        tiempo: 'Ahora',
        imagen: '',
        ultimaInteraccion: Date.now(),
        idUsuario: 'user1',
        nombreUsuario: 'Test User',
        avatarUsuario: '',
      };
      const targets = [
        { channelId: 'community-feed', includeMedia: true },
      ];
      
      const result = distributionService.distribute(mockContent as any, targets);
      
      expect(result).toBeDefined();
      expect(result.contentId).toBe(mockContent.id);
      expect(Array.isArray(result.distributionTargets)).toBe(true);
      expect(Array.isArray(result.results)).toBe(true);
      expect(typeof result.totalReach).toBe('number');
      expect(typeof result.totalEngagement).toBe('number');
    });
  });

  describe('getFlywheelMetrics', () => {
    it('should return flywheel metrics', () => {
      const mockContent = [{
        id: 'test-post-' + Date.now(),
        titulo: 'Test',
        contenido: 'Content',
        autor: 'test',
        likes: [],
        comentarios: [],
        tags: [],
        categoria: 'general',
        tiempo: 'Ahora',
        imagen: '',
        ultimaInteraccion: Date.now(),
        idUsuario: 'user1',
        nombreUsuario: 'Test User',
        avatarUsuario: '',
      }];
      
      const metrics = distributionService.getFlywheelMetrics(mockContent as any);
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalPosts).toBe('number');
      expect(typeof metrics.totalReach).toBe('number');
      expect(typeof metrics.avgEngagement).toBe('number');
      expect(typeof metrics.topChannel).toBe('string');
      expect(metrics.topContent).toBeDefined();
      expect(typeof metrics.growthRate).toBe('number');
    });

    it('should return zero metrics for empty content', () => {
      const metrics = distributionService.getFlywheelMetrics([]);
      
      expect(metrics.totalPosts).toBe(0);
      expect(metrics.totalReach).toBe(0);
      expect(metrics.avgEngagement).toBe(0);
    });
  });

  describe('getDistributionRecommendations', () => {
    it('should return recommendations based on metrics', () => {
      const mockContent = {
        id: 'test-rec-' + Date.now(),
        titulo: 'Test Post',
        contenido: 'Content for testing',
        autor: 'test',
        likes: [],
        comentarios: [],
        tags: ['trading'],
        categoria: 'general',
        tiempo: 'Ahora',
        imagen: '',
        ultimaInteraccion: Date.now(),
        idUsuario: 'user1',
        nombreUsuario: 'Test User',
        avatarUsuario: '',
      };
      const mockMetrics = {
        totalPosts: 1,
        totalReach: 1000,
        avgEngagement: 0.05,
        topChannel: 'community-feed',
        topContent: { id: 'test', reach: 500 },
        growthRate: 15,
      };
      
      const recommendations = distributionService.getDistributionRecommendations(mockContent as any, mockMetrics);
      
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });
});
