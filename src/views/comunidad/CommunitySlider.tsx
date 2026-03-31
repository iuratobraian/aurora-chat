import React, { memo, useState } from 'react';

interface CommunitySliderProps {
    communities: {
        _id: string;
        name: string;
        slug: string;
        coverImage?: string;
        currentMembers: number;
        plan?: string;
    }[];
    onVisitCommunity: (slug: string) => void;
}

const COVERS = [
    'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
    'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
    'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    'linear-gradient(135deg, #134e4a 0%, #0f172a 100%)',
    'linear-gradient(135deg, #450a0a 0%, #1e1b4b 100%)',
];

const PLAN_COLORS: Record<string, string> = {
    enterprise: 'from-yellow-500 to-amber-500',
    scale: 'from-purple-500 to-pink-500',
    growth: 'from-blue-500 to-cyan-500',
    starter: 'from-emerald-500 to-teal-500',
    free: 'from-gray-500 to-slate-500',
};

export const CommunitySlider: React.FC<CommunitySliderProps> = memo(({
    communities,
    onVisitCommunity,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % communities.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + communities.length) % communities.length);
    };

    if (!communities || communities.length === 0) return null;

    const community = communities[currentIndex];
    const gradient = community.coverImage 
        ? `url(${community.coverImage})`
        : COVERS[currentIndex % COVERS.length];
    const planGradient = PLAN_COLORS[community.plan || 'free'];

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">groups</span>
                    Comunidades
                </h3>
                <div className="flex gap-1">
                    <button
                        onClick={prevSlide}
                        className="size-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm text-gray-400">chevron_left</span>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="size-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm text-gray-400">chevron_right</span>
                    </button>
                </div>
            </div>

            <div 
                className="relative h-24 rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => onVisitCommunity(community.slug)}
                style={{ background: gradient }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <span className="material-symbols-outlined text-white text-3xl">arrow_forward</span>
                </div>

                <div className="absolute inset-0 flex items-center p-3">
                    <div className="flex-1 flex items-end">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {community.plan && community.plan !== 'free' && (
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase bg-gradient-to-r ${planGradient} text-white`}>
                                        {community.plan}
                                    </span>
                                )}
                            </div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-1 drop-shadow-lg">
                                {community.name}
                            </h4>
                            <span className="text-[10px] text-gray-300 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[10px]">group</span>
                                {community.currentMembers} miembros
                            </span>
                        </div>
                    </div>
                    
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onVisitCommunity(community.slug);
                        }}
                        className="px-4 py-2 bg-white/20 hover:bg-primary backdrop-blur-sm rounded-lg text-white text-[10px] font-black uppercase tracking-wider transition-colors"
                    >
                        Entrar
                    </button>
                </div>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {communities.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(idx);
                            }}
                            className={`h-1 rounded-full transition-all ${
                                idx === currentIndex ? 'w-4 bg-white' : 'w-1 bg-white/30'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

CommunitySlider.displayName = 'CommunitySlider';

export default CommunitySlider;
