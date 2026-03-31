import { Publicacion, Usuario } from '../../types';
import { TrustLayer } from './trustLayer';

export interface SearchResult {
    id: string;
    type: 'post' | 'user' | 'community';
    data: Publicacion | Partial<Usuario>;
    score: number;
    boosted: boolean;
    reason: string;
    matchQuality: 'exact' | 'partial' | 'fuzzy';
}

export interface SearchSurface {
    items: SearchResult[];
    surface: 'search';
    query: string;
    total: number;
    signal: 'live' | 'empty' | 'error';
    error?: string;
}

export interface SearchRankingConfig {
    query: string;
    userId?: string;
    userXp: number;
    limit: number;
    fuzzyMatch: boolean;
    includeUsers: boolean;
    includePosts: boolean;
}

const DEFAULT_CONFIG: SearchRankingConfig = {
    query: '',
    userId: undefined,
    userXp: 0,
    limit: 20,
    fuzzyMatch: true,
    includeUsers: true,
    includePosts: true,
};

function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function calculateTextMatch(
    text: string,
    query: string
): { score: number; quality: SearchResult['matchQuality'] } {
    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(query);

    if (normalizedText === normalizedQuery) {
        return { score: 100, quality: 'exact' };
    }

    if (normalizedText.includes(normalizedQuery)) {
        const position = normalizedText.indexOf(normalizedQuery);
        const positionScore = Math.max(0, 50 - position);
        return { score: 70 + positionScore, quality: 'exact' };
    }

    if (normalizedQuery.length >= 3) {
        const queryWords = normalizedQuery.split(/\s+/);
        const textWords = normalizedText.split(/\s+/);

        let matchCount = 0;
        for (const queryWord of queryWords) {
            for (const textWord of textWords) {
                if (textWord.startsWith(queryWord) || textWord.includes(queryWord)) {
                    matchCount++;
                    break;
                }
            }
        }

        if (matchCount > 0) {
            const matchRatio = matchCount / queryWords.length;
            return {
                score: Math.round(40 + matchRatio * 30),
                quality: 'partial',
            };
        }
    }

    let similarity = 0;
    const maxLen = Math.max(normalizedText.length, normalizedQuery.length);

    for (let i = 0; i < Math.min(normalizedText.length, normalizedQuery.length); i++) {
        if (normalizedText[i] === normalizedQuery[i]) {
            similarity++;
        }
    }

    const similarityRatio = maxLen > 0 ? similarity / maxLen : 0;

    if (similarityRatio > 0.6) {
        return {
            score: Math.round(similarityRatio * 40),
            quality: 'fuzzy',
        };
    }

    return { score: 0, quality: 'fuzzy' };
}

function scorePost(
    post: Publicacion,
    config: SearchRankingConfig
): SearchResult {
    const { score: textScore, quality } = calculateTextMatch(
        `${post.titulo || ''} ${post.contenido} ${post.par} ${post.tags?.join(' ') || ''}`,
        config.query
    );

    if (textScore === 0) {
        return {
            id: post.id,
            type: 'post',
            data: post,
            score: 0,
            boosted: false,
            reason: '',
            matchQuality: 'fuzzy',
        };
    }

    let finalScore = textScore * 0.5;

    const trust = TrustLayer.getContentTrust(post);
    finalScore += trust.score * 0.25;

    const likes = post.likes?.length || 0;
    const comments = post.comentarios?.length || 0;
    const engagement = likes + comments * 2;
    finalScore += Math.min(engagement * 0.5, 15);

    if (post.par === config.query) {
        finalScore += 10;
    }

    let reason = '';

    if (quality === 'exact' && textScore > 80) {
        reason = 'Coincidencia exacta';
    } else if (quality === 'partial') {
        reason = 'Coincidencia parcial';
    } else if (post.par && normalizeText(post.par).includes(normalizeText(config.query))) {
        reason = `Par: ${post.par}`;
    } else if (post.categoria === 'Idea' || post.categoria === 'Estrategia') {
        reason = 'Contenido de trading';
    } else {
        reason = 'Resultado relacionado';
    }

    return {
        id: post.id,
        type: 'post',
        data: post,
        score: Math.max(0, Math.min(100, finalScore)),
        boosted: finalScore > 70,
        reason,
        matchQuality: quality,
    };
}

function scoreUser(
    user: Partial<Usuario>,
    config: SearchRankingConfig
): SearchResult {
    const { score: textScore, quality } = calculateTextMatch(
        `${user.nombre || ''} ${user.usuario || ''} ${user.biografia || ''}`,
        config.query
    );

    if (textScore === 0) {
        return {
            id: user.id || '',
            type: 'user',
            data: user,
            score: 0,
            boosted: false,
            reason: '',
            matchQuality: 'fuzzy',
        };
    }

    let finalScore = textScore * 0.5;

    const trust = TrustLayer.getAuthorTrust(user);
    finalScore += trust.score * 0.3;

    const followers = user.seguidores?.length || 0;
    finalScore += Math.min(followers * 0.05, 15);

    if (user.usuario && normalizeText(user.usuario).includes(normalizeText(config.query))) {
        finalScore += 15;
    }

    let reason = '';

    if (quality === 'exact') {
        reason = 'Usuario encontrado';
    } else if (trust.tier !== 'new') {
        reason = `Usuario ${TrustLayer.getTierLabel(trust.tier)}`;
    } else {
        reason = 'Usuario relacionado';
    }

    return {
        id: user.id || '',
        type: 'user',
        data: user,
        score: Math.max(0, Math.min(100, finalScore)),
        boosted: finalScore > 65,
        reason,
        matchQuality: quality,
    };
}

export const SearchRanker = {
    surface(
        posts: Publicacion[],
        users: Partial<Usuario>[],
        config: Partial<SearchRankingConfig>
    ): SearchSurface {
        const fullConfig = { ...DEFAULT_CONFIG, ...config };

        if (!fullConfig.query || fullConfig.query.length < 2) {
            return {
                items: [],
                surface: 'search',
                query: fullConfig.query,
                total: 0,
                signal: 'empty',
            };
        }

        const results: SearchResult[] = [];

        if (fullConfig.includePosts) {
            for (const post of posts) {
                const result = scorePost(post, fullConfig);
                if (result.score > 0) {
                    results.push(result);
                }
            }
        }

        if (fullConfig.includeUsers) {
            for (const user of users) {
                const result = scoreUser(user, fullConfig);
                if (result.score > 0) {
                    results.push(result);
                }
            }
        }

        results.sort((a, b) => {
            if (a.matchQuality !== b.matchQuality) {
                const qualityOrder = { exact: 0, partial: 1, fuzzy: 2 };
                return qualityOrder[a.matchQuality] - qualityOrder[b.matchQuality];
            }
            if (a.boosted !== b.boosted) return a.boosted ? -1 : 1;
            return b.score - a.score;
        });

        const limited = results.slice(0, fullConfig.limit);

        return {
            items: limited,
            surface: 'search',
            query: fullConfig.query,
            total: results.length,
            signal: limited.length > 0 ? 'live' : 'empty',
        };
    },

    search(
        posts: Publicacion[],
        users: Partial<Usuario>[],
        query: string,
        limit: number = 20
    ): SearchResult[] {
        return this.surface(posts, users, { query, limit }).items;
    },

    getSuggestions(
        posts: Publicacion[],
        users: Partial<Usuario>[],
        partialQuery: string,
        limit: number = 5
    ): string[] {
        const suggestions: Set<string> = new Set();

        const words = normalizeText(partialQuery).split(/\s+/);
        const lastWord = words[words.length - 1];

        if (lastWord.length < 2) return [];

        for (const post of posts) {
            if (normalizeText(post.par).includes(lastWord)) {
                suggestions.add(post.par);
            }
            if (post.tags) {
                for (const tag of post.tags) {
                    if (normalizeText(tag).includes(lastWord)) {
                        suggestions.add(tag);
                    }
                }
            }
        }

        for (const user of users) {
            if (user.usuario && normalizeText(user.usuario).includes(lastWord)) {
                suggestions.add(`@${user.usuario}`);
            }
        }

        return Array.from(suggestions).slice(0, limit);
    },

    highlightMatches(text: string, query: string): string {
        const normalizedQuery = normalizeText(query);
        const words = normalizedQuery.split(/\s+/).filter(w => w.length >= 2);

        if (words.length === 0) return text;

        const pattern = new RegExp(`(${words.join('|')})`, 'gi');

        return text.replace(pattern, '<mark>$1</mark>');
    },
};
