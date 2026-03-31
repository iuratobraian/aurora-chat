import React, { memo, useMemo } from 'react';
import { Avatar } from '../../components/Avatar';

interface LeaderboardUser {
    id: string;
    nombre: string;
    avatar?: string;
    xp?: number;
    nivel?: number;
    streak?: number;
    role?: string;
    stats?: {
        commentsCount?: number;
        sharesCount?: number;
        journalShares?: number;
    };
}

interface Community {
    _id: string;
    name: string;
    slug: string;
    currentMembers: number;
    membersGrowth?: number;
    accessType?: string;
    plan?: string;
}

interface UnifiedSidebarProps {
    topCommunities: Community[];
    revelationCommunity?: Community;
    topTraders: LeaderboardUser[];
    topCommenter?: LeaderboardUser;
    topSharer?: LeaderboardUser;
    journalSharers: LeaderboardUser[];
    currentUserId?: string;
    onVisitProfile: (userId: string) => void;
    onVisitCommunity: (slug: string) => void;
}

export const UnifiedSidebar: React.FC<UnifiedSidebarProps> = memo(({
    topCommunities,
    revelationCommunity,
    topTraders,
    topCommenter,
    topSharer,
    journalSharers,
    currentUserId,
    onVisitProfile,
    onVisitCommunity,
}) => {
    const formatMembers = (count: number) => {
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const getPlanBadge = (plan?: string) => {
        const badges: Record<string, { bg: string; text: string }> = {
            enterprise: { bg: 'bg-gradient-to-r from-yellow-400/20 to-amber-500/10', text: 'text-yellow-300' },
            scale: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
            growth: { bg: 'bg-violet-500/20', text: 'text-violet-400' },
            starter: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
            free: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
        };
        return badges[plan || 'free'] || badges.free;
    };

    return (
        <div className="space-y-4">
            {/* Top 3 Comunidades */}
            <section className="rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">emoji_events</span>
                        Top Comunidades
                    </h2>
                </div>
                <div className="p-2 space-y-1">
                    {topCommunities.slice(0, 3).map((community, index) => {
                        const planBadge = getPlanBadge(community.plan);
                        const medals = ['🥇', '🥈', '🥉'];
                        return (
                            <div
                                key={community._id}
                                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                                onClick={() => onVisitCommunity(community.slug)}
                            >
                                {index < 3 && (
                                    <span className="text-lg">{medals[index]}</span>
                                )}
                                <div className="size-10 rounded-xl bg-gradient-to-br from-primary/30 to-violet-500/20 flex items-center justify-center text-white font-black text-sm shadow-lg">
                                    {community.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{community.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">group</span>
                                            {formatMembers(community.currentMembers)}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${planBadge.bg} ${planBadge.text}`}>
                                            {community.plan || 'free'}
                                        </span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors text-xl">chevron_right</span>
                            </div>
                        );
                    })}
                    {topCommunities.length === 0 && (
                        <p className="text-center text-gray-500 text-xs py-4">No hay comunidades</p>
                    )}
                </div>
            </section>

            {/* Comunidad Revelación */}
            {revelationCommunity && (
                <section className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 overflow-hidden">
                    <div className="p-4 border-b border-amber-500/20">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            Comunidad Revelación
                        </h2>
                    </div>
                    <div className="p-3">
                        <div
                            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                            onClick={() => onVisitCommunity(revelationCommunity.slug)}
                        >
                            <div className="relative">
                                <div className="size-12 rounded-xl bg-gradient-to-br from-amber-500/40 to-orange-500/30 flex items-center justify-center text-white font-black text-lg shadow-lg">
                                    {revelationCommunity.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-amber-500 flex items-center justify-center">
                                    <span className="text-[8px]">🔥</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{revelationCommunity.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400">+{revelationCommunity.membersGrowth || 0} miembros</span>
                                    <span className="text-[10px] text-amber-400 font-medium">esta semana</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-amber-400 group-hover:scale-110 transition-transform">trending_up</span>
                        </div>
                    </div>
                </section>
            )}

            {/* Top Traders */}
            <section className="rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-emerald-400">military_tech</span>
                        Mejores Traders
                    </h2>
                </div>
                <div className="p-2 space-y-1">
                    {topTraders.slice(0, 5).map((user, index) => {
                        const isCurrentUser = user.id === currentUserId;
                        return (
                            <div
                                key={user.id}
                                className={`group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer ${isCurrentUser ? 'bg-primary/10' : ''}`}
                                onClick={() => onVisitProfile(user.id)}
                            >
                                <span className="text-sm font-bold text-gray-500 w-5 text-center">{index + 1}</span>
                                <Avatar src={user.avatar} name={user.nombre} seed={user.id} size="sm" rounded="full" />
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-xs font-bold truncate ${isCurrentUser ? 'text-primary' : 'text-white group-hover:text-primary'}`}>
                                        {user.nombre} {isCurrentUser && '(Tú)'}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[9px] text-gray-500">
                                        <span className="flex items-center gap-0.5">
                                            <span className="material-symbols-outlined text-[10px]">bolt</span>
                                            {user.xp || 0} XP
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-[8px]">
                                            Lv.{user.nivel || 1}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {topTraders.length === 0 && (
                        <p className="text-center text-gray-500 text-xs py-4">Sin datos</p>
                    )}
                </div>
            </section>

            {/* Más Comentado */}
            {topCommenter && (
                <section className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/30 overflow-hidden">
                    <div className="p-3 border-b border-blue-500/20">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">chat</span>
                            Rey de los Comentarios
                        </h2>
                    </div>
                    <div className="p-2">
                        <div
                            className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                            onClick={() => onVisitProfile(topCommenter.id)}
                        >
                            <Avatar src={topCommenter.avatar} name={topCommenter.nombre} seed={topCommenter.id} size="sm" rounded="full" />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{topCommenter.nombre}</h3>
                                <span className="text-[10px] text-blue-400 font-medium">
                                    {topCommenter.stats?.commentsCount || 0} comentarios
                                </span>
                            </div>
                            <span className="text-xl">💬</span>
                        </div>
                    </div>
                </section>
            )}

            {/* Más Comparte */}
            {topSharer && (
                <section className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/30 overflow-hidden">
                    <div className="p-3 border-b border-purple-500/20">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">share</span>
                            Top Sharer
                        </h2>
                    </div>
                    <div className="p-2">
                        <div
                            className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                            onClick={() => onVisitProfile(topSharer.id)}
                        >
                            <Avatar src={topSharer.avatar} name={topSharer.nombre} seed={topSharer.id} size="sm" rounded="full" />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">{topSharer.nombre}</h3>
                                <span className="text-[10px] text-purple-400 font-medium">
                                    {topSharer.stats?.sharesCount || 0} veces compartido
                                </span>
                            </div>
                            <span className="text-xl">📤</span>
                        </div>
                    </div>
                </section>
            )}

            {/* Compartiendo Bitácoras */}
            {journalSharers.length > 0 && (
                <section className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/30 overflow-hidden">
                    <div className="p-3 border-b border-indigo-500/20">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">auto_stories</span>
                            Compartiendo Bitácoras
                        </h2>
                    </div>
                    <div className="p-2 space-y-1">
                        {journalSharers.slice(0, 5).map((user) => (
                            <div
                                key={user.id}
                                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                                onClick={() => onVisitProfile(user.id)}
                            >
                                <Avatar src={user.avatar} name={user.nombre} seed={user.id} size="sm" rounded="full" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{user.nombre}</h3>
                                    <span className="text-[10px] text-gray-400">
                                        {user.stats?.journalShares || 0} entradas
                                    </span>
                                </div>
                                <span className="text-indigo-400 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-lg">menu_book</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
});

UnifiedSidebar.displayName = 'UnifiedSidebar';

export default UnifiedSidebar;
