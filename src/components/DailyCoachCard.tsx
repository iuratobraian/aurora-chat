import React, { useState, useEffect } from 'react';
import { CoachService, CoachRecommendation, cacheCoachData, getCachedCoachData, isCoachDataStale } from '../../lib/ai/coach';
import { Usuario } from '../types';

interface DailyCoachCardProps {
    usuario: Usuario | null;
    compact?: boolean;
}

export function DailyCoachCard({ usuario, compact = false }: DailyCoachCardProps) {
    const [recommendations, setRecommendations] = useState<CoachRecommendation[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRecommendations = () => {
            const cached = getCachedCoachData();
            if (cached && !isCoachDataStale()) {
                setRecommendations(cached);
                setIsLoading(false);
                return;
            }

            const recs = CoachService.getDailyRecommendations(usuario);
            setRecommendations(recs);
            cacheCoachData(recs);
            setIsLoading(false);
        };

        loadRecommendations();
    }, [usuario]);

    const topRec = recommendations[0];
    const visibleRecs = showAll ? recommendations : recommendations.slice(0, 2);
    const totalXP = recommendations.reduce((sum, r) => sum + r.xpReward, 0);
    const streakMsg = CoachService.getStreakMessage(usuario?.diasActivos || 1);

    const handleCtaClick = (rec: CoachRecommendation) => {
        const event = new CustomEvent('coach-action', { detail: { action: rec.ctaAction } });
        window.dispatchEvent(event);
    };

    if (isLoading) {
        return (
            <div className="glass rounded-xl p-5 border border-white/10 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg"></div>
                    <div className="h-4 bg-white/10 rounded w-24"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 bg-white/5 rounded w-full"></div>
                    <div className="h-3 bg-white/5 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!topRec) return null;

    const priorityColors = {
        high: 'text-alert-red border-alert-red/30 bg-alert-red/10',
        medium: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
        low: 'text-gray-400 border-white/10 bg-white/5',
    };

    const iconBgColors = {
        high: 'bg-gradient-to-br from-red-500/20 to-orange-500/20',
        medium: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20',
        low: 'bg-gradient-to-br from-gray-500/20 to-gray-600/20',
    };

    if (compact) {
        return (
            <div 
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => setShowAll(!showAll)}
            >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgColors[topRec.priority]}`}>
                    <span className="material-symbols-outlined text-lg text-white">{topRec.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{topRec.title}</p>
                    <p className="text-[10px] text-gray-400">{topRec.xpReward > 0 ? `+${topRec.xpReward} XP` : 'PRO'}</p>
                </div>
                <span className="material-symbols-outlined text-sm text-gray-500 group-hover:text-primary transition-colors">
                    {showAll ? 'expand_less' : 'expand_more'}
                </span>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl p-5 border border-white/10 bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="material-symbols-outlined text-white text-lg">psychology</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-white">
                            Daily Coach
                        </h3>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-orange-400">local_fire_department</span>
                            {streakMsg}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-primary">+{totalXP} XP</p>
                    <p className="text-[10px] text-gray-500">disponibles hoy</p>
                </div>
            </div>

            <div className="space-y-3">
                {visibleRecs.map((rec) => (
                    <div 
                        key={rec.id}
                        className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${priorityColors[rec.priority]}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${iconBgColors[rec.priority]}`}>
                                <span className="material-symbols-outlined text-white text-lg">{rec.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                                    {rec.xpReward > 0 && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                                            +{rec.xpReward} XP
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 mb-3 line-clamp-2">{rec.description}</p>
                                <button
                                    onClick={() => handleCtaClick(rec)}
                                    className="text-[10px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider transition-all"
                                >
                                    {rec.ctaLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {recommendations.length > 2 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full mt-4 py-2 text-[10px] text-gray-400 hover:text-white font-bold uppercase tracking-wider transition-colors"
                >
                    {showAll ? 'Ver menos' : `+${recommendations.length - 2} más`}
                </button>
            )}

            {usuario && !usuario.esPro && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] text-gray-400">¿Quieres recomendaciones personalizadas?</p>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('coach-action', { detail: { action: 'navigate_pricing' } }))}
                            className="text-[10px] px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all"
                        >
                            Activar PRO
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DailyCoachCard;
