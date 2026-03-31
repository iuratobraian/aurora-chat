import { useState, useCallback } from 'react';
import { communitySupportAgent, type SupportQuery, type SupportResponse, type CommunityContext } from '../../lib/ai/communityAgent';

interface UseCommunitySupportOptions {
    communityContext?: CommunityContext;
    userXp?: number;
    enabled?: boolean;
}

interface UseCommunitySupportReturn {
    isLoading: boolean;
    response: SupportResponse | null;
    error: string | null;
    askQuestion: (query: string, context?: SupportQuery['context']) => Promise<void>;
    getQuickHelp: (category: string) => string;
    clearResponse: () => void;
}

export function useCommunitySupport({
    communityContext,
    userXp,
    enabled = true,
}: UseCommunitySupportOptions = {}): UseCommunitySupportReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<SupportResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const askQuestion = useCallback(async (query: string, context?: SupportQuery['context']) => {
        if (!enabled || !query.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const supportQuery: SupportQuery = {
                query,
                context: context || 'general',
                communityContext,
                userXp,
            };

            const result = await communitySupportAgent.getResponse(supportQuery);
            setResponse(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al procesar consulta');
            setResponse(null);
        } finally {
            setIsLoading(false);
        }
    }, [enabled, communityContext, userXp]);

    const getQuickHelp = useCallback((category: string) => {
        return communitySupportAgent.getQuickHelp(category);
    }, []);

    const clearResponse = useCallback(() => {
        setResponse(null);
        setError(null);
    }, []);

    return {
        isLoading,
        response,
        error,
        askQuestion,
        getQuickHelp,
        clearResponse,
    };
}

export default useCommunitySupport;
