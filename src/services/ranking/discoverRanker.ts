import { Publicacion, Usuario } from '../../types';
import { TrustLayer } from './trustLayer';

export interface DiscoverItem {
    id: string;
    type: 'post' | 'user' | 'community';
    data: Publicacion | Partial<Usuario>;
    score: number;
    boosted: boolean;
    reason: string;
    diversity: number;
    trend: number;
}

export interface DiscoverSurface {
    items: DiscoverItem[];
    surface: 'discover';
    total: number;
    signal: 'live' | 'fallback' | 'empty';
}

export interface DiscoverRankingConfig {
    userId: string;
    userInterests: string[];
    userXp: number;
    excludeSeen: boolean;
    maxDiversity: number;
    trendingWindowHours: number;
}

const DEFAULT_CONFIG: DiscoverRankingConfig = {
    userId: '',
    userInterests: [],
    userXp: 0,
    excludeSeen: true,
    maxDiversity: 0.3,
    trendingWindowHours: 24,
};

function calculateDiversityScore(
    item: DiscoverItem,
    existingItems: DiscoverItem[]
): number {
    if (existingItems.length === 0) return 50;

    const sameCategory = existingItems.filter(i => {
        if (i.type !== item.type) return false;
        if (i.type === 'post' && item.type === 'post') {
            const postA = i.data as Publicacion;
            const postB = item.data as Publicacion;
            return postA.categoria === postB.categoria || postA.par === postB.par;
        }
        return false;
    }).length;

    const diversity = 1 - (sameCategory / existingItems.length);
    return diversity * 100;
}

function calculateTrendScore(
    item: Publicacion | Partial<Usuario>,
    windowHours: number
): number {
    let growth = 0;

    if ('likes' in item && Array.isArray(item.likes)) {
        const likesGrowth = Math.min(item.likes.length * 2, 20);
        growth += likesGrowth;
    }

    if ('comentarios' in item && Array.isArray(item.comentarios)) {
        const commentsGrowth = Math.min((item.comentarios as unknown[]).length * 3, 25);
        growth += commentsGrowth;
    }

    if ('authorFollowers' in item && typeof item.authorFollowers === 'number') {
        const followerGrowth = Math.min(item.authorFollowers * 0.1, 15);
        growth += followerGrowth;
    }

    return Math.min(growth, 50);
}

function getDiscoverReason(
    item: DiscoverItem,
    config: DiscoverRankingConfig
): string {
    if (item.reason) return item.reason;

    if (item.diversity > 0.6) {
        return 'Contenido diverso - fuera de tu burbuja';
    }
    if (item.trend > 30) {
        return 'Tendencia en crecimiento';
    }
    if ('categoria' in item.data) {
        const post = item.data as Publicacion;
        if (config.userInterests.some(i =>
            post.par?.toLowerCase().includes(i.toLowerCase())
        )) {
            return 'Match con tus intereses';
        }
    }
    return 'Contenido recomendado';
}

function scorePost(
    post: Publicacion,
    config: DiscoverRankingConfig,
    existingItems: DiscoverItem[]
): DiscoverItem {
    let score = 30;

    const authorTrust = TrustLayer.getAuthorTrust({
        xp: post.accuracyUser ? post.accuracyUser * 10 : 0,
        accuracy: post.accuracyUser,
        badges: post.badgesSnapshot,
        seguidores: post.seguidoresPost,
    } as Partial<Usuario>);
    score += authorTrust.score * 0.3;

    const trendScore = calculateTrendScore(post, config.trendingWindowHours);
    score += trendScore * 0.3;

    const diversity = calculateDiversityScore({
        id: post.id,
        type: 'post',
        data: post,
        score: 0,
        boosted: false,
        reason: '',
        diversity: 0,
        trend: 0,
    }, existingItems);
    score += diversity * 0.2;

    const relevanceScore = config.userInterests.reduce((sum, interest) => {
        if (post.par?.toLowerCase().includes(interest.toLowerCase())) {
            return sum + 8;
        }
        if (post.tags?.some(t => t.toLowerCase().includes(interest.toLowerCase()))) {
            return sum + 5;
        }
        return sum;
    }, 0);
    score += relevanceScore;

    if (post.categoria === 'Idea' || post.categoria === 'Estrategia') {
        score += 5;
    }

    const finalScore = Math.max(0, Math.min(100, score));

    return {
        id: post.id,
        type: 'post',
        data: post,
        score: finalScore,
        boosted: finalScore > 70 && diversity > 40,
        reason: getDiscoverReason({
            id: post.id,
            type: 'post',
            data: post,
            score: finalScore,
            boosted: finalScore > 70,
            reason: '',
            diversity,
            trend: trendScore,
        }, config),
        diversity,
        trend: trendScore,
    };
}

function scoreUser(
    user: Partial<Usuario>,
    config: DiscoverRankingConfig,
    existingItems: DiscoverItem[]
): DiscoverItem {
    let score = 25;

    const trust = TrustLayer.getAuthorTrust(user);
    score += trust.score * 0.4;

    const diversity = calculateDiversityScore({
        id: user.id || '',
        type: 'user',
        data: user,
        score: 0,
        boosted: false,
        reason: '',
        diversity: 0,
        trend: 0,
    }, existingItems);
    score += diversity * 0.3;

    const relevanceScore = config.userInterests.reduce((sum) => {
        return sum + 5;
    }, 0);
    score += Math.min(relevanceScore, 15);

    const finalScore = Math.max(0, Math.min(100, score));

    return {
        id: user.id || '',
        type: 'user',
        data: user,
        score: finalScore,
        boosted: finalScore > 65 && trust.tier !== 'new',
        reason: trust.tier !== 'new'
            ? `Usuario ${TrustLayer.getTierLabel(trust.tier)}`
            : 'Nuevo usuario activo',
        diversity,
        trend: 0,
    };
}

export const DiscoverRanker = {
    surface(
        posts: Publicacion[],
        users: Partial<Usuario>[],
        config: Partial<DiscoverRankingConfig> = {}
    ): DiscoverSurface {
        const fullConfig = { ...DEFAULT_CONFIG, ...config };

        if (posts.length === 0 && users.length === 0) {
            return {
                items: [],
                surface: 'discover',
                total: 0,
                signal: 'empty',
            };
        }

        const scoredPosts = posts.map(post =>
            scorePost(post, fullConfig, [])
        );
        const scoredUsers = users.map(user =>
            scoreUser(user, fullConfig, [])
        );

        const allItems = [...scoredPosts, ...scoredUsers];

        allItems.sort((a, b) => {
            if (a.boosted !== b.boosted) return a.boosted ? -1 : 1;
            return b.score - a.score;
        });

        const diversified = this.ensureDiversity(allItems, fullConfig.maxDiversity);

        return {
            items: diversified,
            surface: 'discover',
            total: diversified.length,
            signal: diversified.length > 0 ? 'live' : 'fallback',
        };
    },

    ensureDiversity(
        items: DiscoverItem[],
        maxSameTypeRatio: number = 0.3
    ): DiscoverItem[] {
        if (items.length <= 3) return items;

        const result: DiscoverItem[] = [];
        const categories: Map<string, number> = new Map();

        for (const item of items) {
            const category = item.type;

            const currentCount = categories.get(category) || 0;
            const currentRatio = currentCount / (result.length || 1);

            if (currentRatio < maxSameTypeRatio || result.length < 3) {
                result.push(item);
                categories.set(category, currentCount + 1);
            } else {
                const nextCategory = Array.from(categories.entries())
                    .sort((a, b) => a[1] - b[1])[0];

                if (nextCategory && nextCategory[1] < currentCount - 1) {
                    result.push(item);
                    categories.set(category, currentCount + 1);
                }
            }

            if (result.length >= 20) break;
        }

        return result;
    },

    getTrendingPosts(posts: Publicacion[], windowHours: number = 24): Publicacion[] {
        const now = Date.now();
        const windowMs = windowHours * 60 * 60 * 1000;

        return posts
            .filter(post => {
                const age = now - post.ultimaInteraccion;
                return age < windowMs;
            })
            .sort((a, b) => {
                const engagementA = (a.likes?.length || 0) + (a.comentarios?.length || 0) * 2;
                const engagementB = (b.likes?.length || 0) + (b.comentarios?.length || 0) * 2;
                return engagementB - engagementA;
            })
            .slice(0, 10);
    },

    getForYou(
        posts: Publicacion[],
        config: Partial<DiscoverRankingConfig> = {}
    ): DiscoverItem[] {
        const fullConfig = { ...DEFAULT_CONFIG, ...config };
        return posts
            .map(post => scorePost(post, fullConfig, []))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    },

    getExplore(
        posts: Publicacion[],
        users: Partial<Usuario>[],
        config: Partial<DiscoverRankingConfig> = {}
    ): DiscoverItem[] {
        const fullConfig = { ...DEFAULT_CONFIG, ...config };
        const result = this.surface(posts, users, fullConfig);
        return result.items.filter(item => !item.boosted).slice(0, 15);
    },
};
