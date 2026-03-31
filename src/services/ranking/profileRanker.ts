import { Publicacion, Usuario } from '../../types';
import { TrustLayer } from './trustLayer';

export interface RankedProfilePost {
    post: Publicacion;
    score: number;
    boosted: boolean;
    reason: string;
    highlight: 'popular' | 'recent' | 'quality' | 'trading';
}

export interface ProfileSurface {
    user: Partial<Usuario>;
    posts: RankedProfilePost[];
    stats: ProfileStats;
    badges: ProfileBadge[];
    signal: 'live' | 'empty';
}

export interface ProfileStats {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalFollowers: number;
    engagementRate: number;
    avgLikesPerPost: number;
    tradingPosts: number;
}

export interface ProfileBadge {
    name: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold';
    earned: boolean;
    reason: string;
}

export interface ProfileRankingConfig {
    userId: string;
    visitorId?: string;
    sortBy: 'engagement' | 'recency' | 'quality' | 'mixed';
    maxPosts: number;
    highlightTypes: ('trading' | 'general' | 'educational' | 'popular' | 'recent')[];
}

const DEFAULT_CONFIG: ProfileRankingConfig = {
    userId: '',
    visitorId: undefined,
    sortBy: 'engagement',
    maxPosts: 20,
    highlightTypes: ['trading', 'general', 'educational'],
};

function calculateProfilePostScore(
    post: Publicacion,
    config: ProfileRankingConfig
): { score: number; reason: string; highlight: RankedProfilePost['highlight'] } {
    let score = 30;

    const likes = post.likes?.length || 0;
    const comments = post.comentarios?.length || 0;
    const engagement = likes + comments * 2;

    score += Math.min(engagement * 1.5, 40);

    const trust = TrustLayer.getContentTrust(post);
    score += trust.score * 0.3;

    const ageHours = (Date.now() - post.ultimaInteraccion) / (1000 * 60 * 60);
    if (ageHours < 1) score += 15;
    else if (ageHours < 24) score += 10;
    else if (ageHours < 72) score += 5;

    let highlight: RankedProfilePost['highlight'] = 'quality';
    let reason = 'Publicación';

    if (post.categoria === 'Idea' || post.categoria === 'Estrategia') {
        score += 10;
        highlight = 'trading';
        reason = 'Idea de trading';
    } else if (post.categoria === 'Curso' || post.categoria === 'Recurso') {
        score += 5;
        highlight = 'quality';
        reason = 'Contenido educativo';
    }

    if (likes > 10) {
        reason = `Popular (${likes} likes)`;
    } else if (comments > 5) {
        reason = `Discusión activa (${comments} comments)`;
    }

    if (trust.boosted) {
        reason = `${reason} - Alta calidad`;
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        reason,
        highlight,
    };
}

function calculateProfileStats(
    posts: Publicacion[],
    user: Partial<Usuario>
): ProfileStats {
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comentarios?.length || 0), 0);
    const totalFollowers = user.seguidores?.length || 0;

    const avgLikesPerPost = totalPosts > 0 ? totalLikes / totalPosts : 0;
    const engagementRate = totalFollowers > 0
        ? ((totalLikes + totalComments) / totalFollowers) * 100
        : 0;

    const tradingPosts = posts.filter(p =>
        p.categoria === 'Idea' || p.categoria === 'Estrategia'
    ).length;

    return {
        totalPosts,
        totalLikes,
        totalComments,
        totalFollowers,
        engagementRate: Math.round(engagementRate * 100) / 100,
        avgLikesPerPost: Math.round(avgLikesPerPost * 10) / 10,
        tradingPosts,
    };
}

function getProfileBadges(user: Partial<Usuario>): ProfileBadge[] {
    const badges: ProfileBadge[] = [];

    if (user.badges?.length) {
        for (const badge of user.badges) {
            let tier: ProfileBadge['tier'] = 'bronze';
            if (badge === 'Verified' || badge === 'TopAnalyst') tier = 'gold';
            else if (badge === 'Influencer' || badge === 'Whale') tier = 'silver';

            badges.push({
                name: badge,
                icon: getBadgeIcon(badge),
                tier,
                earned: true,
                reason: getBadgeReason(badge),
            });
        }
    }

    const xpBadges: { minXp: number; name: string; tier: ProfileBadge['tier'] }[] = [
        { minXp: 1000, name: 'Veterano', tier: 'bronze' },
        { minXp: 5000, name: 'Experto', tier: 'silver' },
        { minXp: 10000, name: 'Maestro', tier: 'gold' },
    ];

    for (const xpBadge of xpBadges) {
        if ((user.xp || 0) >= xpBadge.minXp) {
            const exists = badges.some(b => b.name === xpBadge.name);
            if (!exists) {
                badges.push({
                    name: xpBadge.name,
                    icon: getBadgeIcon(xpBadge.name),
                    tier: xpBadge.tier,
                    earned: true,
                    reason: `${xpBadge.minXp}+ XP`,
                });
            }
        }
    }

    return badges;
}

function getBadgeIcon(badge: string): string {
    const icons: Record<string, string> = {
        TopAnalyst: '🏆',
        Verified: '✓',
        EarlyBird: '🐦',
        Whale: '🐋',
        Influencer: '⭐',
        RisingStar: '🌟',
        Veterano: '🎖️',
        Experto: '🎓',
        Maestro: '👑',
    };
    return icons[badge] || '🏅';
}

function getBadgeReason(badge: string): string {
    const reasons: Record<string, string> = {
        TopAnalyst: 'Mejor analista del mes',
        Verified: 'Cuenta verificada',
        EarlyBird: 'Usuario temprano',
        Whale: 'Gran inversor',
        Influencer: 'Alta influencia',
        RisingStar: 'Estrella emergente',
        Veterano: '1,000+ XP acumulados',
        Experto: '5,000+ XP acumulados',
        Maestro: '10,000+ XP acumulados',
    };
    return reasons[badge] || 'Badge especial';
}

export const ProfileRanker = {
    surface(
        user: Partial<Usuario>,
        posts: Publicacion[],
        config: Partial<ProfileRankingConfig> = {}
    ): ProfileSurface {
        const fullConfig = { ...DEFAULT_CONFIG, ...config };

        const rankedPosts: RankedProfilePost[] = posts.map(post => {
            const { score, reason, highlight } = calculateProfilePostScore(post, fullConfig);
            return {
                post,
                score,
                boosted: score > 70,
                reason,
                highlight,
            };
        });

        if (fullConfig.sortBy === 'engagement') {
            rankedPosts.sort((a, b) => b.score - a.score);
        } else if (fullConfig.sortBy === 'recency') {
            rankedPosts.sort((a, b) => b.post.ultimaInteraccion - a.post.ultimaInteraccion);
        } else if (fullConfig.sortBy === 'quality') {
            rankedPosts.sort((a, b) => {
                const trustA = TrustLayer.getContentTrust(a.post);
                const trustB = TrustLayer.getContentTrust(b.post);
                return trustB.score - trustA.score;
            });
        }

        const limited = rankedPosts.slice(0, fullConfig.maxPosts);

        const stats = calculateProfileStats(posts, user);
        const badges = getProfileBadges(user);

        return {
            user,
            posts: limited,
            stats,
            badges,
            signal: posts.length > 0 ? 'live' : 'empty',
        };
    },

    getTopPosts(posts: Publicacion[], limit: number = 5): RankedProfilePost[] {
        return posts
            .map(post => {
                const { score, reason, highlight } = calculateProfilePostScore(post, DEFAULT_CONFIG);
                return { post, score, boosted: score > 70, reason, highlight };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    },

    getTradingPosts(posts: Publicacion[], limit: number = 10): RankedProfilePost[] {
        return posts
            .filter(p => p.categoria === 'Idea' || p.categoria === 'Estrategia')
            .map(post => {
                const { score, reason, highlight } = calculateProfilePostScore(post, DEFAULT_CONFIG);
                return { post, score, boosted: score > 70, reason, highlight };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    },

    getPopularPosts(posts: Publicacion[], limit: number = 10): RankedProfilePost[] {
        return posts
            .map(post => {
                const { score, reason, highlight } = calculateProfilePostScore(post, DEFAULT_CONFIG);
                return { post, score, boosted: score > 70, reason, highlight };
            })
            .filter(p => p.post.likes?.length && p.post.likes.length > 5)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    },

    compareUsers(
        userA: Partial<Usuario>,
        postsA: Publicacion[],
        userB: Partial<Usuario>,
        postsB: Publicacion[]
    ): { winner: 'A' | 'B' | 'tie'; metrics: Record<string, { a: number; b: number }> } {
        const statsA = calculateProfileStats(postsA, userA);
        const statsB = calculateProfileStats(postsB, userB);

        const trustA = TrustLayer.getAuthorTrust(userA);
        const trustB = TrustLayer.getAuthorTrust(userB);

        const metrics = {
            totalPosts: { a: statsA.totalPosts, b: statsB.totalPosts },
            totalFollowers: { a: statsA.totalFollowers, b: statsB.totalFollowers },
            engagementRate: { a: statsA.engagementRate, b: statsB.engagementRate },
            avgLikes: { a: statsA.avgLikesPerPost, b: statsB.avgLikesPerPost },
            trustScore: { a: trustA.score, b: trustB.score },
            tradingPosts: { a: statsA.tradingPosts, b: statsB.tradingPosts },
        };

        let scoreA = 0;
        let scoreB = 0;

        for (const [key, values] of Object.entries(metrics)) {
            if (key !== 'engagementRate' && values.a > values.b) scoreA++;
            else if (key !== 'engagementRate' && values.b > values.a) scoreB++;
            else if (key === 'engagementRate' && values.a > values.b) scoreA++;
            else if (key === 'engagementRate' && values.b > values.a) scoreB++;
        }

        const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie';

        return { winner, metrics };
    },
};
