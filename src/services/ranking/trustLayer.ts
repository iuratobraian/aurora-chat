import { Usuario, Publicacion } from '../../types';
import logger from '../../utils/logger';

export interface TrustScore {
  score: number;
  tier: TrustTier;
  signals: TrustSignals;
  boostReasons: string[];
}

export type TrustTier = 'new' | 'basic' | 'verified' | 'expert' | 'elite';

export interface TrustSignals {
  accuracyScore: number;
  followerScore: number;
  engagementScore: number;
  badgeScore: number;
  consistencyScore: number;
  ageScore: number;
}

export interface ContentTrustScore {
  score: number;
  boosted: boolean;
  reasons: string[];
  flags: ContentFlag[];
}

export type ContentFlag = 'spam' | 'low_quality' | 'duplicate' | 'report' | 'suspicious';

const TIER_THRESHOLDS = {
  new: 0,
  basic: 25,
  verified: 50,
  expert: 75,
  elite: 90,
};

function getTier(score: number): TrustTier {
  if (score >= TIER_THRESHOLDS.elite) return 'elite';
  if (score >= TIER_THRESHOLDS.expert) return 'expert';
  if (score >= TIER_THRESHOLDS.verified) return 'verified';
  if (score >= TIER_THRESHOLDS.basic) return 'basic';
  return 'new';
}

function calculateAuthorTrust(author: Partial<Usuario>): TrustScore {
  const signals: TrustSignals = {
    accuracyScore: Math.min((author.accuracy ?? 50) * 0.5, 30),
    followerScore: Math.min((author.seguidores?.length ?? 0) * 0.1, 25),
    engagementScore: Math.min((author.aportes ?? 0) * 0.5, 20),
    badgeScore: 0,
    consistencyScore: Math.min((author.diasActivos ?? 0) * 0.2, 15),
    ageScore: 0,
  };

  if (author.badges?.length) {
    const badgeWeight = author.badges.reduce((sum, b) => {
      if (b === 'Verified' || b === 'TopAnalyst') return sum + 8;
      if (b === 'Influencer' || b === 'Whale') return sum + 5;
      if (b === 'EarlyBird' || b === 'RisingStar') return sum + 3;
      return sum + 1;
    }, 0);
    signals.badgeScore = Math.min(badgeWeight, 10);
  }

  const accountAge = author.fechaRegistro
    ? Math.min((Date.now() - new Date(author.fechaRegistro).getTime()) / (1000 * 60 * 60 * 24 * 30), 12)
    : 0;
  signals.ageScore = Math.min(accountAge, 5);

  const totalScore = Math.max(0, Math.min(100,
    signals.accuracyScore +
    signals.followerScore +
    signals.engagementScore +
    signals.badgeScore +
    signals.consistencyScore +
    signals.ageScore
  ));

  const boostReasons: string[] = [];
  if (author.esVerificado) boostReasons.push('Cuenta verificada');
  if (author.esPro) boostReasons.push('Usuario Pro');
  if ((author.badges?.length ?? 0) >= 3) boostReasons.push('Multi-badge');
  if ((author.seguidores?.length ?? 0) >= 100) boostReasons.push('Alta followers');
  if ((author.accuracy ?? 0) >= 70) boostReasons.push('Alto accuracy');

  return {
    score: Math.round(totalScore),
    tier: getTier(totalScore),
    signals,
    boostReasons,
  };
}

function calculateContentTrust(
  post: Partial<Publicacion>,
  authorTrust?: TrustScore
): ContentTrustScore {
  const flags: ContentFlag[] = [];
  const reasons: string[] = [];

  let score = 30;

  const likes = post.likes?.length ?? 0;
  score += Math.min(likes * 2, 30);

  const comments = (post.comentarios as unknown[] ?? []).length;
  score += Math.min(comments * 3, 25);

  const authorXp = authorTrust?.score ?? 0;
  score += Math.min(authorXp * 0.3, 15);

  const textLength = post.contenido?.length ?? 0;
  if (textLength > 100) score += 5;
  if (textLength > 300) score += 5;
  if (textLength < 20) flags.push('low_quality');

  if (post.imagenUrl || post.tradingViewUrl) score += 5;

  if (post.par && post.par !== 'GENERAL') score += 5;

  if (authorTrust?.tier === 'elite') {
    score += 10;
    reasons.push('Autor élite');
  } else if (authorTrust?.tier === 'expert') {
    score += 7;
    reasons.push('Autor experto');
  } else if (authorTrust?.tier === 'verified') {
    score += 5;
    reasons.push('Autor verificado');
  }

  if (likes > 10) reasons.push('Alto engagement');
  if (comments > 5) reasons.push('Discusión activa');
  if (post.isAiAgent) {
    score += 5;
    reasons.push('Contenido IA');
  }

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    score: finalScore,
    boosted: finalScore > 70,
    reasons,
    flags,
  };
}

export const TrustLayer = {
  getAuthorTrust(author: Partial<Usuario>): TrustScore {
    try {
      return calculateAuthorTrust(author);
    } catch (err) {
      logger.warn('[TrustLayer] getAuthorTrust failed:', err);
      return {
        score: 0,
        tier: 'new',
        signals: {
          accuracyScore: 0,
          followerScore: 0,
          engagementScore: 0,
          badgeScore: 0,
          consistencyScore: 0,
          ageScore: 0,
        },
        boostReasons: [],
      };
    }
  },

  getContentTrust(post: Partial<Publicacion>, author?: Partial<Usuario>): ContentTrustScore {
    try {
      const authorTrust = author ? this.getAuthorTrust(author) : undefined;
      return calculateContentTrust(post, authorTrust);
    } catch (err) {
      logger.warn('[TrustLayer] getContentTrust failed:', err);
      return {
        score: 0,
        boosted: false,
        reasons: [],
        flags: [],
      };
    }
  },

  getTierLabel(tier: TrustTier): string {
    const labels: Record<TrustTier, string> = {
      new: 'Nuevo',
      basic: 'Básico',
      verified: 'Verificado',
      expert: 'Experto',
      elite: 'Élite',
    };
    return labels[tier];
  },

  getTierColor(tier: TrustTier): string {
    const colors: Record<TrustTier, string> = {
      new: 'text-gray-400',
      basic: 'text-blue-400',
      verified: 'text-green-400',
      expert: 'text-purple-400',
      elite: 'text-yellow-400',
    };
    return colors[tier];
  },

  getTierBadge(tier: TrustTier): string {
    const badges: Record<TrustTier, string> = {
      new: '',
      basic: '',
      verified: '✓',
      expert: '★',
      elite: '★',
    };
    return badges[tier];
  },

  shouldSuppressContent(flags: ContentFlag[]): boolean {
    return flags.includes('spam') || flags.includes('suspicious');
  },
};
