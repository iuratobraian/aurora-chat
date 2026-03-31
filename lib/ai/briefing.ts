import { api } from "../../convex/_generated/api";
import logger from '../utils/logger';
import { getConvexClient } from '../convex/client';

const convex = getConvexClient();

export interface BriefingItem {
    type: 'news' | 'signal' | 'tip';
    title: string;
    description: string;
    sentiment?: 'bullish' | 'bearish' | 'neutral';
    pair?: string;
    time?: string;
}

export interface MorningBriefing {
    date: string;
    greeting: string;
    items: BriefingItem[];
    watchlist: string[];
    summary: string;
    generatedAt: number;
}

const GREETINGS = [
    "Buenos días, trader",
    "Morning briefing listo",
    "Análisis matutino preparado",
    "Listo para el mercado"
];

const DEFAULT_PAIRS = ['BTC/USD', 'EUR/USD', 'XAU/USD'];

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días, trader ☀️";
    if (hour < 18) return "Buenas tardes 🌤️";
    return "Buenas noches 🌙";
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export const BriefingService = {
    async getMorningBriefing(userWatchlist: string[] = DEFAULT_PAIRS): Promise<MorningBriefing> {
        const pairs = userWatchlist.length > 0 ? userWatchlist : DEFAULT_PAIRS;
        const briefing: MorningBriefing = {
            date: new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
            greeting: getGreeting(),
            items: [],
            watchlist: pairs,
            summary: '',
            generatedAt: Date.now()
        };

        try {
            const recentNews = await convex.query(api.marketNews.getRecentNews, { hours: 12 });
            
            if (recentNews && recentNews.length > 0) {
                const topNews = recentNews.slice(0, 3);
                
                for (const news of topNews) {
                    const sentiment = news.sentiment || 
                        (news.impact === 'high' ? 'bullish' : news.impact === 'low' ? 'bearish' : 'neutral');
                    
                    briefing.items.push({
                        type: 'news',
                        title: news.title || 'Sin título',
                        description: news.summary || news.description || news.content || '',
                        sentiment: sentiment as 'bullish' | 'bearish' | 'neutral',
                        pair: news.relatedPairs?.[0] || news.category,
                        time: news.publishedAt ? new Date(news.publishedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : undefined
                    });
                }
            }

            const bullishCount = briefing.items.filter(i => i.sentiment === 'bullish').length;
            const bearishCount = briefing.items.filter(i => i.sentiment === 'bearish').length;
            
            if (bullishCount > bearishCount) {
                briefing.summary = `Sesión con tono alcista. ${bullishCount} noticias positivas para tu watchlist.`;
            } else if (bearishCount > bullishCount) {
                briefing.summary = `Sesión con tono bajista. ${bearishCount} noticias negativas en ${pairs.join(', ')}.`;
            } else {
                briefing.summary = `Sesión mixta. Mantén vigilancia en ${pairs.slice(0, 2).join(' y ')}.`;
            }

            if (briefing.items.length === 0) {
                briefing.items.push({
                    type: 'tip',
                    title: 'Sin noticias recientes',
                    description: `No hay noticias en las últimas 12 horas. Los mercados pueden estar en calma.`,
                    sentiment: 'neutral',
                    pair: pairs[0]
                });
            }

            briefing.items.unshift({
                type: 'tip',
                title: `Tu Watchlist: ${pairs.join(', ')}`,
                description: ' следи за этими парами hoy',
                sentiment: 'neutral'
            });

        } catch (err) {
            logger.error('[Briefing] Error fetching news:', err);
            briefing.items.push({
                type: 'tip',
                title: 'Sin conexión a noticias',
                description: 'No se pudieron cargar las noticias. Verifica tu conexión.',
                sentiment: 'neutral'
            });
            briefing.summary = 'Briefing básico - noticias no disponibles.';
        }

        return briefing;
    },

    isBriefingStale(briefing: MorningBriefing | null, maxAgeMinutes: number = 30): boolean {
        if (!briefing) return true;
        const ageMs = Date.now() - briefing.generatedAt;
        const maxAgeMs = maxAgeMinutes * 60 * 1000;
        return ageMs > maxAgeMs;
    },

    getTimeUntilRefresh(briefing: MorningBriefing): string {
        const ageMs = Date.now() - briefing.generatedAt;
        const refreshMs = 30 * 60 * 1000 - ageMs;
        if (refreshMs <= 0) return 'Refrescar ahora';
        const mins = Math.floor(refreshMs / 60000);
        return `Próximo refresh en ${mins} min`;
    }
};

export const BRIEFING_STORAGE_KEY = 'morning_briefing_cache';

export function cacheBriefing(briefing: MorningBriefing): void {
    try {
        localStorage.setItem(BRIEFING_STORAGE_KEY, JSON.stringify(briefing));
    } catch (err) {
        logger.warn('[Briefing] Could not cache briefing:', err);
    }
}

export function getCachedBriefing(): MorningBriefing | null {
    try {
        const cached = localStorage.getItem(BRIEFING_STORAGE_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
}

export function clearCachedBriefing(): void {
    localStorage.removeItem(BRIEFING_STORAGE_KEY);
}
