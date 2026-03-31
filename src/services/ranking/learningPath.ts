import { Curso, Estrategia, Usuario } from '../../types';

export interface RecommendedItem {
  item: Curso | Estrategia;
  type: 'course' | 'strategy';
  score: number;
  reason: string;
  reasonType: 'level_match' | 'completion_gap' | 'popular' | 'relevant' | 'next_step';
}

export interface LearningPath {
  recommendations: RecommendedItem[];
  nextAction: NextBestAction | null;
  currentLevel: string;
  recommendedLevel: string;
  progressPercent: number;
}

export interface NextBestAction {
  type: 'start_course' | 'continue_course' | 'review_strategy' | 'take_quiz' | 'practice';
  title: string;
  description: string;
  itemId?: string;
  confidence: number;
}

export interface AcademiaSurface {
  items: RecommendedItem[];
  surface: 'academia';
  userLevel: number;
  sortedBy: 'recommended' | 'level' | 'popular';
  signal: 'computed' | 'empty';
}

const NIVEL_ORDER = ['Principiante', 'Intermedio', 'Avanzado', 'Esencial', 'Pro'];

function levelToNumber(level: string): number {
  const idx = NIVEL_ORDER.indexOf(level);
  return idx >= 0 ? idx : 0;
}

function numberToLevel(n: number): string {
  return NIVEL_ORDER[Math.min(Math.max(0, Math.round(n)), NIVEL_ORDER.length - 1)];
}

function calculateMatchScore(
  item: Curso | Estrategia,
  user: Partial<Usuario>
): { score: number; reason: string; reasonType: RecommendedItem['reasonType'] } {
  let score = 50;
  let reason = '';
  let reasonType: RecommendedItem['reasonType'] = 'relevant';

  const itemLevel = 'nivel' in item ? levelToNumber(item.nivel) : 0;
  const userLevel = levelToNumber(user.role ? numberToLevel(user.role) : 'Principiante');
  const userXp = user.xp ?? 0;

  if (userXp < 100 && itemLevel === 0) {
    score += 20;
    reason = 'Ideal para empezar';
    reasonType = 'level_match';
  } else if (Math.abs(itemLevel - userLevel) <= 1) {
    score += 15;
    reason = 'Nivel adecuado';
    reasonType = 'level_match';
  } else if (itemLevel > userLevel + 1) {
    score -= 10;
    reason = 'Nivel avanzado — considera prerequisites';
    reasonType = 'level_match';
  }

  const completed = 'completado' in item ? item.completado : 0;
  if (completed === undefined || completed === 0) {
    score += 15;
    reason = reason || 'No iniciado —有空';
    reasonType = 'completion_gap';
  } else if (completed < 50) {
    score += 10;
    reason = reason || 'En progreso — continua';
    reasonType = 'next_step';
  } else if (completed >= 100) {
    score -= 30;
    reason = 'Ya completado';
  }

  const lecciones = 'lecciones' in item ? item.lecciones : 0;
  if (lecciones > 0 && lecciones <= 5) {
    score += 8;
    reason = reason || 'Lección corta — rápido de completar';
  } else if (lecciones > 15) {
    score -= 3;
  }

  if ('lecciones' in item && userXp > 500) {
    const completionScore = Math.min(completed ?? 0, 100) / 100;
    const value = (lecciones * (1 - completionScore)) / (userXp / 100);
    if (value > 0.3) {
      score += 5;
      reason = reason || 'Alto valor por esfuerzo';
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reason: reason || 'Recomendado',
    reasonType,
  };
}

function getNextBestAction(
  recommendations: RecommendedItem[],
  user: Partial<Usuario>
): NextBestAction | null {
  const top = recommendations[0];
  if (!top) return null;

  const userXp = user.xp ?? 0;
  const completed = 'completado' in top.item ? top.item.completado : 0;

  if (completed === undefined || completed === 0) {
    return {
      type: 'start_course',
      title: `Empezar: ${top.item.titulo}`,
      description: top.reason,
      itemId: top.item.id,
      confidence: Math.min(top.score / 100, 0.95),
    };
  } else if (completed < 100) {
    return {
      type: 'continue_course',
      title: `Continuar: ${top.item.titulo}`,
      description: `Tienes ${completed}% completado`,
      itemId: top.item.id,
      confidence: 0.9,
    };
  } else if (userXp < 200) {
    return {
      type: 'take_quiz',
      title: 'Practica lo aprendido',
      description: 'Un quiz rápido te ayudará a consolidar el conocimiento',
      confidence: 0.7,
    };
  } else {
    return {
      type: 'practice',
      title: 'Aplica en una operación demo',
      description: 'Practica en paper trading antes de operar real',
      confidence: 0.65,
    };
  }
}

export const LearningPathService = {
  getRecommendations(
    items: (Curso | Estrategia)[],
    user: Partial<Usuario>,
    type?: 'course' | 'strategy',
    limit = 5
  ): RecommendedItem[] {
    const filtered = type
      ? items.filter(item => ('nivel' in item ? 'course' : 'strategy') === type)
      : items;

    const scored = filtered.map(item => {
      const { score, reason, reasonType } = calculateMatchScore(item, user);
      return {
        item,
        type: ('nivel' in item ? 'course' : 'strategy') as 'course' | 'strategy',
        score,
        reason,
        reasonType,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  },

  getLearningPath(
    courses: Curso[],
    strategies: Estrategia[],
    user: Partial<Usuario>
  ): LearningPath {
    const allItems: (Curso | Estrategia)[] = [...courses, ...strategies];
    const recommendations = this.getRecommendations(allItems, user, undefined, 5);
    const nextAction = getNextBestAction(recommendations, user);

    const userXp = user.xp ?? 0;
    const currentLevel = numberToLevel(Math.floor(userXp / 100));
    const recommendedLevel = numberToLevel(Math.floor((userXp + 200) / 100));

    const completed = courses
      .filter(c => (c.completado ?? 0) >= 100)
      .length;
    const progressPercent = courses.length > 0
      ? Math.round((completed / courses.length) * 100)
      : 0;

    return {
      recommendations,
      nextAction,
      currentLevel,
      recommendedLevel,
      progressPercent,
    };
  },

  surface(
    courses: Curso[],
    strategies: Estrategia[],
    user: Partial<Usuario>,
    sortedBy: 'recommended' | 'level' | 'popular' = 'recommended'
  ): AcademiaSurface {
    const allItems: (Curso | Estrategia)[] = [...courses, ...strategies];
    let items: RecommendedItem[];

    if (sortedBy === 'recommended') {
      items = this.getRecommendations(allItems, user);
    } else if (sortedBy === 'level') {
      items = allItems
        .map(item => {
          const itemLevel = 'nivel' in item ? levelToNumber(item.nivel) : 0;
          const userLevel = levelToNumber(user.role ? numberToLevel(user.role) : 'Principiante');
          return {
            item,
            type: ('nivel' in item ? 'course' : 'strategy') as 'course' | 'strategy',
            score: 100 - Math.abs(itemLevel - userLevel) * 20,
            reason: 'Nivel cercano',
            reasonType: 'level_match' as const,
          };
        })
        .sort((a, b) => b.score - a.score);
    } else {
      items = allItems
        .map(item => ({
          item,
          type: ('nivel' in item ? 'course' : 'strategy') as 'course' | 'strategy',
          score: ('lecciones' in item ? item.lecciones : 10) * 5,
          reason: 'Popular',
          reasonType: 'popular' as const,
        }))
        .sort((a, b) => b.score - a.score);
    }

    return {
      items,
      surface: 'academia',
      userLevel: user.xp ?? 0,
      sortedBy,
      signal: items.length > 0 ? 'computed' : 'empty',
    };
  },
};
