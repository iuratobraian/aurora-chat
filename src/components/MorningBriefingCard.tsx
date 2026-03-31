import React, { useState, useEffect } from 'react';
import { MorningBriefing, BriefingService, getCachedBriefing, cacheBriefing } from '../../lib/ai/briefing';
import { Usuario } from '../types';

interface MorningBriefingCardProps {
    usuario: Usuario | null;
}

export function MorningBriefingCard({ usuario }: MorningBriefingCardProps) {
    const [briefing, setBriefing] = useState<MorningBriefing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadBriefing = async () => {
            setLoading(true);
            setError(false);

            const cached = getCachedBriefing();
            if (cached && !BriefingService.isBriefingStale(cached)) {
                setBriefing(cached);
                setLoading(false);
                return;
            }

            try {
                const watchlist = usuario?.watchlist || ['BTC/USD', 'EUR/USD', 'XAU/USD'];
                const freshBriefing = await BriefingService.getMorningBriefing(watchlist);
                setBriefing(freshBriefing);
                cacheBriefing(freshBriefing);
            } catch (err) {
                console.error('[Briefing] Failed to load:', err);
                setError(true);
                if (cached) {
                    setBriefing(cached);
                }
            } finally {
                setLoading(false);
            }
        };

        loadBriefing();
    }, [usuario]);

    if (loading) {
        return (
            <div className="glass rounded-xl p-5 border border-white/10 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg"></div>
                    <div className="h-4 bg-white/10 rounded w-32"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 bg-white/5 rounded w-full"></div>
                    <div className="h-3 bg-white/5 rounded w-3/4"></div>
                    <div className="h-3 bg-white/5 rounded w-5/6"></div>
                </div>
            </div>
        );
    }

    if (error && !briefing) {
        return null;
    }

    if (!briefing) return null;

    const sentimentColors = {
        bullish: 'text-signal-green bg-signal-green/20 border-signal-green/30',
        bearish: 'text-alert-red bg-alert-red/20 border-alert-red/30',
        neutral: 'text-gray-400 bg-white/5 border-white/10'
    };

    const sentimentIcons = {
        bullish: '📈',
        bearish: '📉',
        neutral: '📊'
    };

    return (
        <div className="glass rounded-xl p-5 border border-white/10 bg-gradient-to-br from-blue-900/20 to-indigo-900/20">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <span className="text-white text-lg">☀️</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-white">
                            Morning Briefing
                        </h3>
                        <p className="text-[10px] text-gray-400">{briefing.date}</p>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        const watchlist = usuario?.watchlist || ['BTC/USD', 'EUR/USD', 'XAU/USD'];
                        const fresh = await BriefingService.getMorningBriefing(watchlist);
                        setBriefing(fresh);
                        cacheBriefing(fresh);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Actualizar"
                >
                    <span className="material-symbols-outlined text-sm text-gray-400">refresh</span>
                </button>
            </div>

            <div className="mb-4">
                <p className="text-sm font-medium text-white/90">{briefing.greeting}</p>
                <p className="text-xs text-gray-400 mt-1">{briefing.summary}</p>
            </div>

            <div className="space-y-3">
                {briefing.items.slice(0, 4).map((item, idx) => (
                    <div 
                        key={idx}
                        className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center">
                            <span className="text-sm">
                                {item.type === 'news' ? sentimentIcons[item.sentiment || 'neutral'] : 
                                 item.type === 'signal' ? '📡' : '💡'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 truncate">
                                    {item.pair || item.type.toUpperCase()}
                                </span>
                                {item.sentiment && item.type === 'news' && (
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold border ${sentimentColors[item.sentiment]}`}>
                                        {item.sentiment}
                                    </span>
                                )}
                                {item.time && (
                                    <span className="text-[8px] text-gray-500">{item.time}</span>
                                )}
                            </div>
                            <p className="text-xs text-white/80 leading-relaxed line-clamp-2">
                                {item.title}
                            </p>
                            {item.description && (
                                <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {usuario?.esPro && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-[10px] text-primary">
                        <span className="material-symbols-outlined text-xs">auto_awesome</span>
                        <span className="font-medium">Modo PRO: Análisis IA actualizado</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MorningBriefingCard;
