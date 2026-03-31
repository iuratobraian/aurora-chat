import React, { memo, useCallback } from 'react';

interface Community {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    currentMembers: number;
    accessType: 'free' | 'paid';
    plan?: string;
    isVerified?: boolean;
    isCreator?: boolean;
    engagement?: number;
    recentGrowth?: number; // % de crecimiento reciente
}

interface UnifiedCommunitiesSectionProps {
    trending: Community[];
    creators: Community[];
    topEngagement: Community[];
    revelation: Community[];
    topMembers: Community[];
    userCommunities: { _id: string }[];
    usuario: any;
    onVisitCommunity: (slug: string) => void;
    onJoin: (communityId: string) => void;
    onOpenChat?: (communityId: string, communityName: string) => void;
}

export const UnifiedCommunitiesSection: React.FC<UnifiedCommunitiesSectionProps> = memo(({
    trending,
    creators,
    topEngagement,
    revelation,
    topMembers,
    userCommunities,
    onVisitCommunity,
    onJoin,
    onOpenChat,
}) => {
    const isUserMember = useCallback((communityId: string) => {
        return userCommunities.some((uc) => uc._id === communityId);
    }, [userCommunities]);

    const formatMembers = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const CommunityItem = ({ community, showGrowth = false }: { community: Community; showGrowth?: boolean }) => {
        const isMember = isUserMember(community._id);
        
        return (
            <div
                className="group relative flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                onClick={() => onVisitCommunity(community.slug)}
            >
                <div className="relative z-10 flex items-center gap-3 w-full">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary/30 to-violet-600/20 border border-white/10 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/10 shrink-0 overflow-hidden">
                        {community.isVerified ? (
                            <span className="material-symbols-outlined text-primary text-lg">verified</span>
                        ) : community.isCreator ? (
                            <span className="material-symbols-outlined text-amber-400 text-lg">star</span>
                        ) : (
                            community.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                                {community.name}
                            </h4>
                            {community.plan && community.plan !== 'free' && (
                                <span className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase bg-amber-500/20 text-amber-400">
                                    {community.plan}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-gray-500">
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[10px]">group</span>
                                {formatMembers(community.currentMembers)}
                            </span>
                            {showGrowth && community.recentGrowth && (
                                <span className="flex items-center gap-1 text-signal-green">
                                    <span className="material-symbols-outlined text-[10px]">trending_up</span>
                                    +{community.recentGrowth}%
                                </span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded ${
                                community.accessType === 'free' 
                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                    : 'bg-amber-500/10 text-amber-400'
                            }`}>
                                {community.accessType === 'free' ? 'Gratis' : 'Premium'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                        {isMember && onOpenChat && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenChat(community._id, community.name);
                                }}
                                className="size-7 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 flex items-center justify-center transition-all"
                                title="Chat"
                            >
                                <span className="material-symbols-outlined text-xs text-violet-400">chat</span>
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isMember) onJoin(community._id);
                            }}
                            disabled={isMember}
                            className={`size-7 rounded-lg flex items-center justify-center transition-all ${
                                isMember
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                                    : 'bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20 active:scale-95'
                            }`}
                            title={isMember ? 'Ya eres miembro' : 'Unirse'}
                        >
                            <span className="material-symbols-outlined text-xs">{isMember ? 'check' : 'add'}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const CategorySection = ({ 
        title, 
        icon, 
        communities, 
        color = 'primary',
        showGrowth = false 
    }: { 
        title: string; 
        icon: string; 
        communities: Community[]; 
        color?: string;
        showGrowth?: boolean;
    }) => {
        if (!communities || communities.length === 0) return null;
        
        return (
            <div className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <span className={`material-symbols-outlined text-sm text-${color}`}>{icon}</span>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{title}</h3>
                    <span className="text-[9px] text-gray-600">({communities.length})</span>
                </div>
                <div className="space-y-0.5">
                    {communities.slice(0, 3).map(community => (
                        <CommunityItem key={community._id} community={community} showGrowth={showGrowth} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section className="glass rounded-2xl border border-white/10 backdrop-blur-xl bg-black/40 overflow-hidden">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">groups</span>
                    Comunidades
                </h2>
            </div>
            
            <div className="p-3 max-h-[500px] overflow-y-auto scrollbar-thin">
                {/* Trending */}
                <CategorySection 
                    title="Trending" 
                    icon="trending_up" 
                    communities={trending}
                    color="primary"
                />
                
                {/* Creadores Verificados */}
                <CategorySection 
                    title="Creadores" 
                    icon="verified" 
                    communities={creators}
                    color="amber-400"
                />
                
                {/* Más Exitosas */}
                <CategorySection 
                    title="Top Engagement" 
                    icon="insights" 
                    communities={topEngagement}
                    color="emerald-400"
                />
                
                {/* Revelación */}
                <CategorySection 
                    title="Revelación" 
                    icon="bolt" 
                    communities={revelation}
                    color="purple-400"
                    showGrowth
                />
                
                {/* Más Miembros */}
                <CategorySection 
                    title="Más Populares" 
                    icon="group" 
                    communities={topMembers}
                    color="cyan-400"
                />
            </div>
            
            <div className="p-3 border-t border-white/5">
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: '/discover' }))}
                    className="w-full py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">explore</span>
                    Explorar comunidades
                </button>
            </div>
        </section>
    );
});

export default UnifiedCommunitiesSection;
