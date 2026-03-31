import React, { memo, useState, useEffect, useMemo } from 'react';

interface SpotlightCommunity {
    _id: string;
    name: string;
    slug: string;
    description: string;
    currentMembers: number;
    coverImage?: string;
    plan?: string;
}

interface CommunitySpotlightProps {
    communities: SpotlightCommunity[];
    onVisitCommunity: (slug: string) => void;
}

export const CommunitySpotlight: React.FC<CommunitySpotlightProps> = memo(({
    communities,
    onVisitCommunity,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const spotlightCommunities = useMemo(() => {
        if (!communities || communities.length === 0) return [];
        const shuffled = [...communities].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 5);
    }, [communities]);

    useEffect(() => {
        if (spotlightCommunities.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % spotlightCommunities.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [spotlightCommunities.length]);

    const community = spotlightCommunities[currentIndex];
    const nextCommunity = spotlightCommunities[(currentIndex + 1) % spotlightCommunities.length];

    if (!community) return null;

    const getPlanGradient = (plan?: string) => {
        switch (plan) {
            case 'enterprise': return 'from-yellow-500 to-amber-500';
            case 'scale': return 'from-amber-500 to-orange-500';
            case 'growth': return 'from-purple-500 to-pink-500';
            case 'starter': return 'from-blue-500 to-cyan-500';
            default: return 'from-gray-500 to-slate-500';
        }
    };

    const formatMembers = (count: number) => {
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
            
            <div 
                className="h-40 relative bg-cover bg-center transition-all duration-700"
                style={{
                    backgroundImage: community.coverImage 
                        ? `url(${community.coverImage})` 
                        : `linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)`
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30" />
            </div>

            <div className="relative p-4 z-20 -mt-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-gradient-to-r from-primary to-purple-500 text-white">
                        Destacada
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-gradient-to-r ${getPlanGradient(community.plan)} text-white`}>
                        {community.plan || 'free'}
                    </span>
                </div>

                <h3 className="text-lg font-black text-white mb-1 group-hover:text-primary transition-colors">
                    {community.name}
                </h3>
                
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                    {community.description}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <span className="material-symbols-outlined text-sm">group</span>
                            {formatMembers(community.currentMembers)}
                        </span>
                    </div>
                    <button
                        onClick={() => onVisitCommunity(community.slug)}
                        className="px-4 py-1.5 bg-white/10 hover:bg-primary text-white text-xs font-bold rounded-lg transition-all"
                    >
                        Ver
                    </button>
                </div>

                {spotlightCommunities.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-white/10">
                        {spotlightCommunities.slice(0, Math.min(5, spotlightCommunities.length)).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-1.5 rounded-full transition-all ${
                                    i === currentIndex 
                                        ? 'w-6 bg-primary' 
                                        : 'w-1.5 bg-white/20 hover:bg-white/40'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="absolute bottom-2 right-2 z-30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px] text-white/40">auto_awesome</span>
                <span className="text-[8px] text-white/40 uppercase tracking-wider">Comunidad Rotativa</span>
            </div>
        </section>
    );
});

CommunitySpotlight.displayName = 'CommunitySpotlight';

export default CommunitySpotlight;
