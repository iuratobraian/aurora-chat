import { aiService, type AIRequest } from './aiService';
import logger from '../utils/logger';
import { SearchRanker } from '../../src/services/ranking/searchRanker';
import type { Publicacion, Usuario } from '../types';

export interface SearchIntent {
    type: 'trading' | 'community' | 'educational' | 'user' | 'general';
    entities: string[];
    sentiment?: 'positive' | 'negative' | 'neutral';
    urgency?: 'high' | 'medium' | 'low';
}

export interface EnhancedSearchResult {
    id: string;
    type: 'post' | 'user' | 'community';
    title: string;
    snippet: string;
    relevance: number;
    intentMatch: SearchIntent['type'];
    suggestedAction?: string;
}

export interface SearchEnhancement {
    intent: SearchIntent;
    results: EnhancedSearchResult[];
    suggestions: string[];
    filters: {
        type?: 'post' | 'user' | 'community';
        timeframe?: 'day' | 'week' | 'month' | 'all';
        sortBy?: 'relevance' | 'recent' | 'popular';
    };
}

const SEARCH_AGENT_PROMPT = `Eres el asistente de búsqueda de TradePortal. Analizas las consultas de los usuarios para proporcionar resultados más relevantes.

CAPACIDADES:
1. Detectar intención de búsqueda (trading, comunidad, educativo, usuario)
2. Extraer entidades (pares, estrategias, nombres de usuario)
3. Sugerir búsquedas relacionadas
4. Mejorar snippets de resultados

REGLAS:
1. Para consultas de trading (EUR/USD, BTC, etc.), enfoca en contenido técnico
2. Para nombres de usuario (@usuario), prioriza perfiles
3. Para términos generales, mezcla tipos de contenido
4. Sugiere filtros cuando sea útil
5. Usa emoji sparingly para destacar resultados importantes

IDIOMA: Responde en español, excepto que el usuario use otro idioma.`;

export class SearchAgent {
    private static instance: SearchAgent;

    static getInstance(): SearchAgent {
        if (!SearchAgent.instance) {
            SearchAgent.instance = new SearchAgent();
        }
        return SearchAgent.instance;
    }

    async analyzeQuery(query: string): Promise<SearchIntent> {
        try {
            const request: AIRequest = {
                messages: [
                    { role: 'system', content: SEARCH_AGENT_PROMPT },
                    { 
                        role: 'user', 
                        content: `Analiza esta búsqueda: "${query}"\n\nDevuelve SOLO un JSON con:\n{\n  "type": "trading|community|educational|user|general",\n  "entities": ["lista de entidades encontradas"],\n  "sentiment": "positive|negative|neutral",\n  "urgency": "high|medium|low"\n}` 
                    },
                ],
                temperature: 0.3,
                maxTokens: 200,
            };

            const result = await aiService.complete(request);
            
            try {
                const parsed = JSON.parse(result.content);
                return {
                    type: parsed.type || 'general',
                    entities: parsed.entities || [],
                    sentiment: parsed.sentiment || 'neutral',
                    urgency: parsed.urgency || 'medium',
                };
            } catch {
                return this.fallbackAnalyzeQuery(query);
            }
        } catch (error) {
            logger.error('[SearchAgent] Error analyzing query:', error);
            return this.fallbackAnalyzeQuery(query);
        }
    }

    private fallbackAnalyzeQuery(query: string): SearchIntent {
        const q = query.toLowerCase();
        const entities: string[] = [];

        const tradingPairs = ['eur/usd', 'gbp/usd', 'usd/jpy', 'btc/usd', 'eth/usd', 'bnb/usd'];
        for (const pair of tradingPairs) {
            if (q.includes(pair.replace('/', '')) || q.includes(pair)) {
                entities.push(pair.toUpperCase());
            }
        }

        const indicators = ['rsi', 'macd', 'ema', 'sma', 'bollinger', 'fibonacci'];
        for (const indicator of indicators) {
            if (q.includes(indicator)) {
                entities.push(indicator.toUpperCase());
            }
        }

        if (q.startsWith('@')) {
            entities.push(q.slice(1));
        }

        let type: SearchIntent['type'] = 'general';
        if (tradingPairs.some(p => q.includes(p.replace('/', '')))) type = 'trading';
        else if (q.includes('curso') || q.includes('aprender') || q.includes('estrategia')) type = 'educational';
        else if (q.includes('comunidad') || q.includes('grupo')) type = 'community';
        else if (q.startsWith('@') || entities.length > 0) type = 'user';

        return {
            type,
            entities,
            sentiment: 'neutral',
            urgency: 'medium',
        };
    }

    async enhanceResults(
        results: EnhancedSearchResult[],
        intent: SearchIntent
    ): Promise<EnhancedSearchResult[]> {
        if (results.length === 0) return results;

        try {
            const request: AIRequest = {
                messages: [
                    { role: 'system', content: SEARCH_AGENT_PROMPT },
                    { 
                        role: 'user', 
                        content: `Mejora estos resultados para una búsqueda de tipo "${intent.type}":\n\n${JSON.stringify(results.slice(0, 5))}\n\nPara cada resultado, sugiere una acción útil si es relevante.` 
                    },
                ],
                temperature: 0.5,
                maxTokens: 500,
            };

            const result = await aiService.complete(request);
            
            return results.map((r, i) => ({
                ...r,
                suggestedAction: i < 3 ? this.extractAction(result.content, i) : undefined,
            }));
        } catch (error) {
            logger.error('[SearchAgent] Error enhancing results:', error);
            return results;
        }
    }

    private extractAction(content: string, index: number): string | undefined {
        const lines = content.split('\n').filter(l => l.trim());
        const relevantLine = lines[index];

        if (!relevantLine) return undefined;

        if (relevantLine.includes('ver post')) return 'Ver post';
        if (relevantLine.includes('seguir')) return 'Seguir usuario';
        if (relevantLine.includes('unirse')) return 'Unirse a comunidad';
        if (relevantLine.includes('contactar')) return 'Contactar';

        return undefined;
    }

    getSuggestedSearches(query: string, intent: SearchIntent): string[] {
        const suggestions: string[] = [];
        const q = query.toLowerCase();

        if (intent.type === 'trading') {
            suggestions.push(`${q} análisis técnico`);
            suggestions.push(`${q} señales`);
            if (!q.includes('estrategia')) {
                suggestions.push(`estrategia ${q}`);
            }
        }

        if (intent.type === 'educational') {
            suggestions.push(`curso ${q}`);
            suggestions.push(`${q} para principiantes`);
            if (!q.includes('estrategia')) {
                suggestions.push(`${q} estrategia`);
            }
        }

        if (intent.type === 'community') {
            suggestions.push(`${q} trading`);
            suggestions.push(`${q} forex`);
            suggestions.push(`${q} crypto`);
        }

        if (suggestions.length < 3) {
            suggestions.push(`${q} pro`);
            suggestions.push(`${q} 2024`);
        }

        return suggestions.slice(0, 4);
    }

    getFiltersForIntent(intent: SearchIntent): SearchEnhancement['filters'] {
        switch (intent.type) {
            case 'trading':
                return {
                    type: 'post',
                    timeframe: 'month',
                    sortBy: 'relevance',
                };
            case 'educational':
                return {
                    type: 'post',
                    timeframe: 'all',
                    sortBy: 'popular',
                };
            case 'user':
                return {
                    type: 'user',
                    sortBy: 'relevance',
                };
            case 'community':
                return {
                    type: 'community',
                    sortBy: 'popular',
                };
            default:
                return {
                    sortBy: 'relevance',
                };
        }
    }

    highlightQueryTerms(text: string, query: string): string {
        const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
        
        let result = text;
        for (const term of terms) {
            const regex = new RegExp(`(${term})`, 'gi');
            result = result.replace(regex, '**$1**');
        }

        return result;
    }
}

export const searchAgent = SearchAgent.getInstance();
