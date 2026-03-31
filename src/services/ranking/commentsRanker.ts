import { Comentario } from '../../types';

export interface RankedComment {
  comment: Comentario;
  score: number;
  boosted: boolean;
  reason: string;
  depth: number;
}

export interface CommentsSurface {
  items: RankedComment[];
  surface: 'comments';
  postId: string;
  total: number;
  sortedBy: CommentSortOption;
  signal: 'computed' | 'empty';
}

export type CommentSortOption = 'engagement' | 'recency' | 'quality';

export interface CommentsRankingConfig {
  sortBy: CommentSortOption;
  userId?: string;
  includeReplies: boolean;
  maxDepth: number;
}

const DEFAULT_CONFIG: CommentsRankingConfig = {
  sortBy: 'engagement',
  includeReplies: true,
  maxDepth: 3,
};

function parseCommentTime(tiempo: string): number {
  const now = Date.now();
  if (tiempo === 'Ahora') return now;
  if (tiempo === 'Hace un momento') return now - 60000;
  if (tiempo.includes('min')) {
    const mins = parseInt(tiempo.replace(/\D/g, ''), 10);
    return now - mins * 60000;
  }
  if (tiempo.includes('hora')) {
    const hours = parseInt(tiempo.replace(/\D/g, ''), 10);
    return now - hours * 3600000;
  }
  if (tiempo.includes('día') || tiempo.includes('dia')) {
    const days = parseInt(tiempo.replace(/\D/g, ''), 10);
    return now - days * 86400000;
  }
  try {
    const parsed = new Date(tiempo).getTime();
    return isNaN(parsed) ? now - 86400000 : parsed;
  } catch {
    return now - 86400000;
  }
}

function calculateCommentScore(comment: Comentario, sortBy: CommentSortOption): number {
  const likes = comment.likes?.length || 0;
  const replies = (comment.respuestas as Comentario[] | undefined)?.length || 0;
  const recency = parseCommentTime(comment.tiempo);
  const ageHours = (Date.now() - recency) / (1000 * 60 * 60);

  switch (sortBy) {
    case 'engagement': {
      let score = 30;
      score += Math.min(likes * 4, 40);
      score += Math.min(replies * 5, 30);
      if (ageHours < 1) score += 20;
      else if (ageHours < 4) score += 15;
      else if (ageHours < 12) score += 10;
      else if (ageHours < 24) score += 5;
      return Math.max(0, Math.min(100, score));
    }
    case 'recency': {
      let score = 100 - Math.min(ageHours * 2, 95);
      score += Math.min(likes * 2, 20);
      score += Math.min(replies * 3, 15);
      return Math.max(0, Math.min(100, score));
    }
    case 'quality': {
      let score = 40;
      score += Math.min(likes * 3, 35);
      score += Math.min(replies * 4, 25);
      const textLength = comment.texto?.length || 0;
      if (textLength > 50) score += 10;
      if (comment.imagenUrl) score += 5;
      return Math.max(0, Math.min(100, score));
    }
    default:
      return 50;
  }
}

function getCommentBoostReason(comment: Comentario): string {
  const likes = comment.likes?.length || 0;
  const replies = (comment.respuestas as Comentario[] | undefined)?.length || 0;

  if (likes >= 10) return `Alto engagement (${likes} likes)`;
  if (replies >= 5) return `Discusión activa (${replies} respuestas)`;
  if (likes >= 5) return `Contenido popular (${likes} likes)`;
  if (comment.imagenUrl) return 'Comentario con imagen';
  return 'Contenido relevante';
}

function rankCommentsRecursive(
  comments: Comentario[],
  sortBy: CommentSortOption,
  depth: number = 0,
  maxDepth: number = 3
): RankedComment[] {
  if (!comments || comments.length === 0) return [];

  const ranked: RankedComment[] = comments.map(comment => {
    const score = calculateCommentScore(comment, sortBy);
    return {
      comment,
      score,
      boosted: score > 70,
      reason: getCommentBoostReason(comment),
      depth,
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  if (maxDepth > 0 && depth < maxDepth) {
    for (const item of ranked) {
      if (item.comment.respuestas && item.comment.respuestas.length > 0) {
        const childRanked = rankCommentsRecursive(
          item.comment.respuestas as Comentario[],
          sortBy,
          depth + 1,
          maxDepth - 1
        );
        item.comment = { ...item.comment, respuestas: childRanked.map(r => r.comment) as unknown as Comentario[] };
      }
    }
  }

  return ranked;
}

export const CommentsRanker = {
  rank(comments: Comentario[], config: Partial<CommentsRankingConfig> = {}): RankedComment[] {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    return rankCommentsRecursive(comments, fullConfig.sortBy, 0, fullConfig.maxDepth);
  },

  surface(postId: string, comments: Comentario[], config: Partial<CommentsRankingConfig> = {}): CommentsSurface {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    const ranked = this.rank(comments, fullConfig);
    return {
      items: ranked,
      surface: 'comments',
      postId,
      total: countAllComments(comments),
      sortedBy: fullConfig.sortBy,
      signal: ranked.length > 0 ? 'computed' : 'empty',
    };
  },

  getTopComments(comments: Comentario[], limit: number, config?: Partial<CommentsRankingConfig>): RankedComment[] {
    return this.rank(comments, config).slice(0, limit);
  },

  getBoostsCount(comments: Comentario[], config?: Partial<CommentsRankingConfig>): number {
    return this.rank(comments, config).filter(item => item.boosted).length;
  },
};

function countAllComments(comments: Comentario[]): number {
  if (!comments) return 0;
  let count = comments.length;
  for (const c of comments) {
    if (c.respuestas) {
      count += countAllComments(c.respuestas as Comentario[]);
    }
  }
  return count;
}
