import { describe, it, expect } from 'vitest';
import { LearningPathService } from '../../src/services/ranking/learningPath';
import type { Curso, Estrategia } from '../../types';

const makeCourse = (overrides: Partial<Curso> = {}): Curso => ({
  id: 'c1',
  titulo: 'Trading Basics',
  descripcion: 'Learn the basics',
  nivel: 'Principiante',
  lecciones: 10,
  duracion: '2h',
  emoji: '📚',
  color: '#3b82f6',
  completado: 0,
  ...overrides,
});

const makeStrategy = (overrides: Partial<Estrategia> = {}): Estrategia => ({
  id: 's1',
  titulo: 'Trend Following',
  descripcion: 'Follow trends',
  dificultad: 'Intermedio',
  imagenUrl: 'https://example.com/img.jpg',
  lecciones: 5,
  ...overrides,
});

describe('LearningPathService', () => {
  describe('getRecommendations', () => {
    it('should recommend beginner course for new user', () => {
      const courses = [
        makeCourse({ id: 'c1', nivel: 'Principiante' }),
        makeCourse({ id: 'c2', nivel: 'Avanzado' }),
      ];
      const user = { xp: 0, rol: 'user' as const };

      const result = LearningPathService.getRecommendations(courses, user, 'course', 5);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].item.id).toBe('c1');
    });

    it('should deprioritize completed courses', () => {
      const courses = [
        makeCourse({ id: 'c1', nivel: 'Principiante', completado: 100 }),
        makeCourse({ id: 'c2', nivel: 'Principiante', completado: 0 }),
      ];
      const user = { xp: 50, rol: 'user' as const };

      const result = LearningPathService.getRecommendations(courses, user, 'course', 5);

      expect(result[0].item.id).toBe('c2');
    });

    it('should prioritize unfinished courses', () => {
      const courses = [
        makeCourse({ id: 'c1', completado: 100 }),
        makeCourse({ id: 'c2', completado: 30 }),
      ];
      const user = { xp: 50, rol: 'user' as const };

      const result = LearningPathService.getRecommendations(courses, user, 'course', 5);

      expect(result[0].item.id).toBe('c2');
    });

    it('should filter by type when specified', () => {
      const courses = [
        makeCourse({ id: 'c1', nivel: 'Principiante' }),
      ];
      const strategies = [
        makeStrategy({ id: 's1' }),
      ];
      const user = { xp: 0, rol: 'user' as const };

      const courseResults = LearningPathService.getRecommendations(courses, user, 'course', 5);
      const strategyResults = LearningPathService.getRecommendations(strategies, user, 'strategy', 5);

      expect(courseResults.every(r => r.type === 'course')).toBe(true);
      expect(strategyResults.every(r => r.type === 'strategy')).toBe(true);
    });

    it('should limit results', () => {
      const courses = Array.from({ length: 10 }, (_, i) =>
        makeCourse({ id: `c${i}`, nivel: 'Principiante' })
      );
      const user = { xp: 0, rol: 'user' as const };

      const result = LearningPathService.getRecommendations(courses, user, 'course', 3);

      expect(result.length).toBe(3);
    });
  });

  describe('getLearningPath', () => {
    it('should return null nextAction for user with no courses', () => {
      const result = LearningPathService.getLearningPath([], [], { xp: 0, rol: 'user' as const });
      expect(result.nextAction).toBeNull();
    });

    it('should recommend starting a course when none completed', () => {
      const courses = [makeCourse({ id: 'c1', completado: 0, titulo: 'Start Here' })];
      const user = { xp: 0, rol: 'user' as const };

      const result = LearningPathService.getLearningPath(courses, [], user);

      expect(result.nextAction?.type).toBe('start_course');
      expect(result.nextAction?.itemId).toBe('c1');
    });

    it('should recommend continuing when course in progress', () => {
      const courses = [makeCourse({ id: 'c1', completado: 50, titulo: 'Continue Me' })];
      const user = { xp: 50, rol: 'user' as const };

      const result = LearningPathService.getLearningPath(courses, [], user);

      expect(result.nextAction?.type).toBe('continue_course');
    });

    it('should compute progress percent correctly', () => {
      const courses = [
        makeCourse({ id: 'c1', completado: 100 }),
        makeCourse({ id: 'c2', completado: 0 }),
        makeCourse({ id: 'c3', completado: 100 }),
      ];
      const user = { xp: 100, rol: 'user' as const };

      const result = LearningPathService.getLearningPath(courses, [], user);

      expect(result.progressPercent).toBe(67); // 2/3 completed ≈ 67%
    });
  });

  describe('surface', () => {
    it('should return empty signal when no items', () => {
      const result = LearningPathService.surface([], [], { xp: 0, rol: 'user' as const });
      expect(result.signal).toBe('empty');
      expect(result.items).toHaveLength(0);
    });

    it('should return computed signal with items', () => {
      const courses = [makeCourse({ id: 'c1' })];
      const user = { xp: 0, rol: 'user' as const };

      const result = LearningPathService.surface(courses, [], user);

      expect(result.signal).toBe('computed');
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('should sort by level when specified', () => {
      const courses = [
        makeCourse({ id: 'c1', nivel: 'Avanzado' }),
        makeCourse({ id: 'c2', nivel: 'Principiante' }),
      ];
      const user = { xp: 0, rol: 'user' as const };

      const result = LearningPathService.surface(courses, [], user, 'level');

      expect(result.sortedBy).toBe('level');
    });
  });
});
