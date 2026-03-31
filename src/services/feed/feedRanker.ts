import { Publicacion } from '../../types';
import logger from '../../utils/logger';

export interface FeedSignal {
    id: string;
    type: 'signal';
    pair: string;
    direction: 'buy' | 'sell';
    entryPrice: number;
    stopLoss: number;
    takeProfit: number[];
    providerName: string;
    providerAvatar: string;
    providerXp: number;
    winRate: number;
    createdAt: number;
    priorityScore: number;
}

export interface RankedItem {
    id: string;
    type: 'post' | 'signal';
    data: Publicacion | FeedSignal;
    score: number;
    boosted: boolean;
    reason: string;
}

export type FeedDataSignal = 'live' | 'cached' | 'fallback';

export interface FeedSurface {
    items: RankedItem[];
    surface: 'feed';
    total: number;
    hasMore: boolean;
    signal: FeedDataSignal;
}

export interface FeedRankingConfig {
    includeSignals: boolean;
    maxSignalsPerPage: number;
    signalMinWinRate: number;
    userXp: number;
    userInterests: string[];
}

const DEFAULT_CONFIG: FeedRankingConfig = {
    includeSignals: true,
    maxSignalsPerPage: 3,
    signalMinWinRate: 50,
    userXp: 0,
    userInterests: [],
};

function calculateSignalPriority(signal: any, config: FeedRankingConfig): number {
    let score = 50;

    if (signal.providerXp) {
        score += Math.min(signal.providerXp / 100, 20);
    }

    if (signal.winRate) {
        score += (signal.winRate - 50) * 0.5;
    }

    if (signal.direction === 'buy') {
        score += 5;
    }

    const signalAgeHours = (Date.now() - signal.createdAt) / (1000 * 60 * 60);
    if (signalAgeHours < 1) {
        score += 15;
    } else if (signalAgeHours < 4) {
        score += 10;
    } else if (signalAgeHours < 12) {
        score += 5;
    }

    const relevanceScore = config.userInterests.reduce((sum, interest) => {
        if (signal.pair?.toLowerCase().includes(interest.toLowerCase())) {
            return sum + 10;
        }
        return sum;
    }, 0);
    score += relevanceScore;

    if (config.userXp > 1000) {
        score *= 0.9;
    }

    return Math.max(0, Math.min(100, score));
}

function calculatePostPriority(post: Publicacion, config: FeedRankingConfig): number {
    let score = 30;

    const likesCount = post.likes?.length || 0;
    score += Math.min(likesCount * 2, 30);

    const commentsCount = post.comentarios?.length || 0;
    score += Math.min(commentsCount * 3, 25);

    if (post.isAiAgent) {
        score += 15;
    }

    const engagementRate = likesCount + commentsCount * 2;
    const ageHours = (Date.now() - post.ultimaInteraccion) / (1000 * 60 * 60);
    if (ageHours < 1) {
        score += 20;
    } else if (ageHours < 4) {
        score += 15;
    } else if (ageHours < 12) {
        score += 10;
    } else if (ageHours < 24) {
        score += 5;
    }

    if (post.par && post.par !== 'GENERAL') {
        const relevanceScore = config.userInterests.reduce((sum, interest) => {
            if (post.par?.toLowerCase().includes(interest.toLowerCase())) {
                return sum + 10;
            }
            return sum;
        }, 0);
        score += relevanceScore;
    }

    if (post.categoria === 'General') {
        score += 5;
    }

    const postAny = post as any;
    if ((postAny.reputation || 0) > 50) {
        score += 10;
    }

    return Math.max(0, Math.min(100, score));
}

function getBoostReason(post: Publicacion | FeedSignal): string {
    if ('providerXp' in post) {
        return 'Señal de proveedor verificado';
    }

    const postAny = post as any;
    if (postAny.isAiAgent) {
        return 'Contenido generado por IA';
    }

    if ((postAny.reputation || 0) > 50) {
        return `Alta reputación (+${postAny.reputation})`;
    }

    const likesCount = post.likes?.length || 0;
    const commentsCount = post.comentarios?.length || 0;

    if (likesCount > 10) {
        return `Alto engagement (${likesCount} likes)`;
    }

    if (commentsCount > 5) {
        return `Discusión activa (${commentsCount} comentarios)`;
    }

    return 'Contenido popular';
}

export const FeedRanker = {
    rankPosts(posts: Publicacion[], config: Partial<FeedRankingConfig> = {}): RankedItem[] {
        const fullConfig = { ...DEFAULT_CONFIG, ...config };
        
        const ranked: RankedItem[] = posts.map(post => {
            const score = calculatePostPriority(post, fullConfig);
            return {
                id: post.id,
                type: 'post',
                data: post,
                score,
                boosted: score > 70,
                reason: getBoostReason(post),
            };
        });

        return ranked.sort((a, b) => b.score - a.score);
    },

    mergeSignalsIntoFeed(
        rankedPosts: RankedItem[],
        signals: any[],
        config: Partial<FeedRankingConfig> = {}
    ): RankedItem[] {
        const fullConfig = { ...DEFAULT_CONFIG, ...config };
        
        if (!fullConfig.includeSignals) {
            return rankedPosts;
        }

        const validSignals = signals
            .filter(s => s.winRate >= fullConfig.signalMinWinRate)
            .map(signal => {
                const score = calculateSignalPriority(signal, fullConfig);
                return {
                    id: signal._id || signal.id,
                    type: 'signal' as const,
                    data: {
                        id: signal._id || signal.id,
                        type: 'signal',
                        pair: signal.pair || 'UNKNOWN',
                        direction: signal.direction || 'buy',
                        entryPrice: signal.entryPrice || 0,
                        stopLoss: signal.stopLoss || 0,
                        takeProfit: signal.takeProfit || [],
                        providerName: signal.providerName || 'Signal Provider',
                        providerAvatar: signal.providerAvatar || '',
                        providerXp: signal.providerXp || 0,
                        winRate: signal.winRate || 50,
                        createdAt: signal.createdAt || Date.now(),
                        priorityScore: score,
                    } as FeedSignal,
                    score,
                    boosted: score > 75,
                    reason: getBoostReason(signal),
                };
            })
            .slice(0, fullConfig.maxSignalsPerPage);

        const merged = [...rankedPosts, ...validSignals];
        
        merged.sort((a, b) => b.score - a.score);

        return merged;
    },

    getFeedWithSignals(
        posts: Publicacion[],
        signals: any[],
        config: Partial<FeedRankingConfig> = {}
    ): RankedItem[] {
        const rankedPosts = this.rankPosts(posts, config);
        return this.mergeSignalsIntoFeed(rankedPosts, signals, config);
    },

    filterByInterest(items: RankedItem[], interests: string[]): RankedItem[] {
        if (interests.length === 0) {
            return items;
        }

        const hasInterest = (item: RankedItem): boolean => {
            if (item.type === 'signal') {
                const signal = item.data as FeedSignal;
                return interests.some(i => signal.pair?.toLowerCase().includes(i.toLowerCase()));
            }
            
            const post = item.data as Publicacion;
            return interests.some(i => 
                post.par?.toLowerCase().includes(i.toLowerCase()) ||
                post.tags?.some(t => t.toLowerCase().includes(i.toLowerCase()))
            );
        };

        const interested = items.filter(hasInterest);
        const notInterested = items.filter(item => !hasInterest(item));

        return [...interested, ...notInterested];
    },

    getTopItems(items: RankedItem[], limit: number): RankedItem[] {
        return items.slice(0, limit);
    },

    getBoostsCount(items: RankedItem[]): number {
        return items.filter(item => item.boosted).length;
    },

    getSignalsCount(items: RankedItem[]): number {
        return items.filter(item => item.type === 'signal').length;
    },

    surface(
        posts: Publicacion[],
        signals: any[] = [],
        config: Partial<FeedRankingConfig> & { pageSize?: number; page?: number } = {},
        dataSignal: FeedDataSignal = 'live'
    ): FeedSurface {
        const { pageSize = 20, page = 0 } = config;
        const ranked = this.getFeedWithSignals(posts, signals, config);
        const offset = page * pageSize;
        const paged = ranked.slice(offset, offset + pageSize);
        return {
            items: paged,
            surface: 'feed',
            total: ranked.length,
            hasMore: offset + pageSize < ranked.length,
            signal: dataSignal,
        };
    },
};
