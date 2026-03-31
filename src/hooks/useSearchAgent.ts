import { useState, useCallback, useMemo } from 'react';
import { searchAgent, type SearchIntent, type EnhancedSearchResult, type SearchEnhancement } from '../../lib/ai/searchAgent';
import { SearchRanker } from '../services/ranking/searchRanker';
import type { Publicacion, Usuario } from '../types';

interface UseSearchAgentOptions {
    posts?: Publicacion[];
    users?: Partial<Usuario>[];
    enabled?: boolean;
}

interface UseSearchAgentReturn {
    isAnalyzing: boolean;
    intent: SearchIntent | null;
    enhancement: SearchEnhancement | null;
    error: string | null;
    analyzeQuery: (query: string) => Promise<void>;
    search: (query: string) => Promise<EnhancedSearchResult[]>;
    getSuggestions: (partialQuery: string) => string[];
    clearResults: () => void;
    highlightTerms: (text: string, query: string) => string;
}

export function useSearchAgent({
    posts = [],
    users = [],
    enabled = true,
}: UseSearchAgentOptions = {}): UseSearchAgentReturn {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [intent, setIntent] = useState<SearchIntent | null>(null);
    const [enhancement, setEnhancement] = useState<SearchEnhancement | null>(null);
    const [error, setError] = useState<string | null>(null);

    const analyzeQuery = useCallback(async (query: string) => {
        if (!enabled || !query.trim()) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const analyzedIntent = await searchAgent.analyzeQuery(query);
            setIntent(analyzedIntent);

            const filters = searchAgent.getFiltersForIntent(analyzedIntent);
            const suggestions = searchAgent.getSuggestedSearches(query, analyzedIntent);

            setEnhancement({
                intent: analyzedIntent,
                results: [],
                suggestions,
                filters,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al analizar búsqueda');
        } finally {
            setIsAnalyzing(false);
        }
    }, [enabled]);

    const search = useCallback(async (query: string): Promise<EnhancedSearchResult[]> => {
        if (!enabled || !query.trim()) return [];

        setIsAnalyzing(true);
        setError(null);

        try {
            let filteredPosts = posts;
            let filteredUsers = users;

            const analyzedIntent = await searchAgent.analyzeQuery(query);
            setIntent(analyzedIntent);

            const searchResults = SearchRanker.search(
                filteredPosts,
                filteredUsers,
                query,
                20
            );

            const enhancedResults: EnhancedSearchResult[] = searchResults.map(result => {
                const post = result.data as Partial<Publicacion>;
                const user = result.data as Partial<Usuario>;

                let title = '';
                let snippet = '';

                if (result.type === 'post') {
                    title = post.titulo || `Post de ${post.nombreUsuario}`;
                    snippet = post.contenido?.slice(0, 150) || '';
                    if (post.contenido && post.contenido.length > 150) {
                        snippet += '...';
                    }
                } else {
                    title = user.nombre || user.usuario || 'Usuario';
                    snippet = user.biografia?.slice(0, 100) || '';
                }

                return {
                    id: result.id,
                    type: result.type,
                    title,
                    snippet,
                    relevance: result.score,
                    intentMatch: analyzedIntent.type,
                    suggestedAction: result.boosted ? 'Ver ahora' : undefined,
                };
            });

            const resultsWithActions = await searchAgent.enhanceResults(
                enhancedResults,
                analyzedIntent
            );

            const filters = searchAgent.getFiltersForIntent(analyzedIntent);
            const suggestions = searchAgent.getSuggestedSearches(query, analyzedIntent);

            setEnhancement({
                intent: analyzedIntent,
                results: resultsWithActions,
                suggestions,
                filters,
            });

            return resultsWithActions;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error en búsqueda');
            return [];
        } finally {
            setIsAnalyzing(false);
        }
    }, [enabled, posts, users]);

    const getSuggestions = useCallback((partialQuery: string): string[] => {
        if (!partialQuery.trim()) return [];

        const suggestions = SearchRanker.getSuggestions(
            posts,
            users,
            partialQuery,
            5
        );

        return suggestions;
    }, [posts, users]);

    const clearResults = useCallback(() => {
        setIntent(null);
        setEnhancement(null);
        setError(null);
    }, []);

    const highlightTerms = useCallback((text: string, query: string): string => {
        return searchAgent.highlightQueryTerms(text, query);
    }, []);

    return {
        isAnalyzing,
        intent,
        enhancement,
        error,
        analyzeQuery,
        search,
        getSuggestions,
        clearResults,
        highlightTerms,
    };
}

export default useSearchAgent;
