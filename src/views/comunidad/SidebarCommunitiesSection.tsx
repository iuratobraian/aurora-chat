import React, { memo, useCallback } from 'react';

interface SidebarCommunity {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    currentMembers: number;
    accessType: 'free' | 'paid';
    plan?: string;
}

interface SidebarCommunitiesSectionProps {
    communities: SidebarCommunity[];
    onVisitCommunity: (slug: string) => void;
}

export const SidebarCommunitiesSection: React.FC<SidebarCommunitiesSectionProps> = memo(({
    communities,
    onVisitCommunity,
}) => {
    const formatMembers = useCallback((count: number) => {
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    }, []);

    if (!communities || communities.length === 0) {
        return (
            <section className="glass rounded-2xl p-4 border border-white/10 backdrop-blur-3xl bg-black/40 shadow-2xl shadow-primary/5 transition-all hover:border-primary/20">
                <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-sm">groups</span>
                    Comunidades
                </h2>
                <div className="text-center py-6">
                    <span className="material-symbols-outlined text-3xl text-gray-600 mb-2 block">group_add</span>
                    <p className="text-xs text-gray-500">No hay comunidades trending</p>
                </div>
            </section>
        );
    }

    return (
        <section className="glass rounded-2xl border border-white/10 backdrop-blur-3xl bg-black/40 overflow-hidden shadow-2xl shadow-primary/5 transition-all hover:border-primary/20 group/sidebar">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">groups</span>
                    Comunidades Trending
                </h2>
            </div>
            <div className="p-2">
                {communities.slice(0, 4).map((community) => (
                    <div
                        key={community._id}
                        className="group relative flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer mb-1 last:mb-0"
                        onClick={() => onVisitCommunity(community.slug)}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                        
                        <div className="relative z-10 flex items-center gap-3 w-full">
                            <div className="size-9 rounded-lg bg-gradient-to-br from-primary/30 to-violet-600/20 border border-white/10 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/10 shrink-0">
                                {community.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                                    {community.name}
                                </h4>
                                <div className="flex items-center gap-1 text-[9px] text-gray-500">
                                    <span className="material-symbols-outlined text-[10px]">group</span>
                                    {formatMembers(community.currentMembers)} miembros
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-500 text-sm group-hover:text-primary transition-colors">
                                chevron_right
                            </span>
                        </div>
                    </div>
                ))}
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

export default SidebarCommunitiesSection;