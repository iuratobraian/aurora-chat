import React, { memo, useMemo } from 'react';

interface TopUser {
    id: string;
    nombre: string;
    avatar?: string;
    xp: number;
    nivel?: number;
    streak?: number;
    role?: string;
}

interface SidebarLeaderboardSectionProps {
    users: TopUser[];
    currentUserId?: string;
    onVisitProfile: (userId: string) => void;
    maxDisplay?: number;
}

export const SidebarLeaderboardSection: React.FC<SidebarLeaderboardSectionProps> = memo(({
    users,
    currentUserId,
    onVisitProfile,
    maxDisplay = 3
}) => {
    const displayUsers = useMemo(() => users.slice(0, maxDisplay), [users, maxDisplay]);

    const getTrophyStyle = (index: number) => {
        const styles = [
            { bg: 'from-yellow-400/30 to-amber-500/20', border: 'border-yellow-400/40', text: 'text-yellow-300', icon: '🥇' },
            { bg: 'from-gray-300/30 to-slate-400/20', border: 'border-gray-300/40', text: 'text-gray-200', icon: '🥈' },
            { bg: 'from-orange-400/30 to-amber-600/20', border: 'border-orange-400/40', text: 'text-orange-300', icon: '🥉' },
        ];
        return styles[index] || null;
    };

    const formatXP = (xp: number) => {
        if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
        if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
        return xp.toString();
    };

    if (!users || users.length === 0) {
        return (
            <section className="glass rounded-2xl p-4 border border-white/10 backdrop-blur-3xl bg-black/40 shadow-2xl shadow-yellow-400/5 transition-all hover:border-yellow-400/20">
                <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-sm text-yellow-400">leaderboard</span>
                    Top Traders
                </h2>
                <div className="text-center py-4">
                    <span className="material-symbols-outlined text-3xl text-gray-600 mb-2 block">trending_up</span>
                    <p className="text-xs text-gray-500">Ranking pronto disponible</p>
                </div>
            </section>
        );
    }

    return (
        <section className="glass rounded-2xl border border-white/10 backdrop-blur-3xl bg-black/40 overflow-hidden shadow-2xl shadow-yellow-400/5 transition-all hover:border-yellow-400/20 group/leaderboard">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-yellow-400">leaderboard</span>
                    Top Traders
                </h2>
            </div>
            <div className="p-2">
                {displayUsers.map((user, index) => {
                    const trophyStyle = getTrophyStyle(index);
                    const isCurrentUser = user.id === currentUserId;
                    return (
                        <div
                            key={user.id}
                            className={`group relative flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer mb-1 last:mb-0 ${isCurrentUser ? 'bg-primary/10 border border-primary/20' : ''}`}
                            onClick={() => onVisitProfile(user.id)}
                        >
                            {trophyStyle && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xl filter drop-shadow-lg">
                                    {trophyStyle.icon}
                                </div>
                            )}
                            
                            <div className="relative z-10 flex items-center gap-2.5 w-full pl-8">
                                <div className="size-9 rounded-full bg-gradient-to-br from-primary/40 to-violet-600/30 border border-white/10 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/10 overflow-hidden shrink-0">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                        user.nombre.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className={`text-[10px] font-bold truncate group-hover:text-primary transition-colors ${isCurrentUser ? 'text-primary' : 'text-white'}`}>
                                            {user.nombre}
                                        </h4>
                                        {user.nivel && (
                                            <span className="px-1 py-0.5 bg-primary/20 rounded text-[7px] font-black text-primary uppercase shrink-0">
                                                Lv.{user.nivel}
                                            </span>
                                        )}
                                        {user.streak && user.streak >= 7 && (
                                            <span className="flex items-center gap-0.5 text-orange-400 shrink-0">
                                                <span className="material-symbols-outlined text-[10px]">local_fire_department</span>
                                                <span className="text-[8px] font-bold">{user.streak}</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[8px] text-gray-500">
                                        <span className="font-bold text-primary/80">{formatXP(user.xp)} XP</span>
                                        {user.role && user.role !== 'usuario' && (
                                            <span className="text-yellow-400/80 uppercase font-bold">{user.role}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="p-3 border-t border-white/5">
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: '/leaderboard' }))}
                    className="w-full py-2 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">leaderboard</span>
                    Ver ranking completo
                </button>
            </div>
        </section>
    );
});

SidebarLeaderboardSection.displayName = 'SidebarLeaderboardSection';

export default SidebarLeaderboardSection;
