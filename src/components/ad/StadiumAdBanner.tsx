import React, { useState, useEffect, useMemo } from 'react';

interface StadiumAdBannerProps {
    ads: Ad[];
    maxVisible?: number;
    autoRotate?: boolean;
    rotationInterval?: number;
}

export interface Ad {
    id: string;
    titulo?: string;
    descripcion?: string;
    imagenUrl?: string;
    link?: string;
    sector?: string;
    activo?: boolean;
    subtitle?: string;
    contenido?: string;
    extra?: string;
}

const StadiumAdBanner: React.FC<StadiumAdBannerProps> = ({
    ads,
    maxVisible,
    autoRotate = true,
    rotationInterval = 8000,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const activeAds = useMemo(() => {
        const filtered = ads.filter(ad => ad.activo && (ad.sector === 'feed' || !ad.sector));
        return maxVisible ? filtered.slice(0, maxVisible) : filtered;
    }, [ads, maxVisible]);

    useEffect(() => {
        if (!autoRotate || activeAds.length <= 1) return;

        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % activeAds.length);
                setIsAnimating(false);
            }, 300);
        }, rotationInterval);

        return () => clearInterval(interval);
    }, [autoRotate, activeAds.length, rotationInterval]);

    if (activeAds.length === 0) return null;

    const currentAd = activeAds[currentIndex];

    return (
        <div className="relative w-full overflow-hidden rounded-xl border border-white/10" style={{ minHeight: '120px' }}>
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-black to-purple-900/40" />
                <div className="stadium-scanlines" />
                <div className="stadium-glow" />
                
                {/* LED strips */}
                <div className="absolute top-0 left-0 w-full h-1 flex">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{
                                animation: `ledBlink ${0.5 + Math.random() * 0.5}s infinite`,
                                animationDelay: `${i * 0.05}s`,
                            }}
                        />
                    ))}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 flex">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500"
                            style={{
                                animation: `ledBlink ${0.5 + Math.random() * 0.5}s infinite`,
                                animationDelay: `${i * 0.07}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className={`relative z-10 p-4 transition-all duration-300 ${isAnimating ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-white/10 text-gray-400 uppercase tracking-wider">
                                {currentAd.sector || 'Sponsored'}
                            </span>
                            <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
                        </div>
                        
                        <h3 className="text-lg font-black mb-1 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent uppercase tracking-wider">
                            {currentAd.titulo}
                        </h3>
                        
                        <p className="text-xs text-gray-300 line-clamp-2 mb-3">
                            {currentAd.descripcion}
                        </p>

                        {currentAd.link && (
                            <a
                                href={currentAd.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold uppercase tracking-wider hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                            >
                                <span>Ver más</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </a>
                        )}
                    </div>

                    {currentAd.imagenUrl && (
                        <div className="relative w-32 h-24 flex-shrink-0">
                            <div className="absolute inset-0 rounded-lg overflow-hidden">
                                <img src={currentAd.imagenUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-purple-400" />
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-purple-400" />
                            <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-purple-400" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-purple-400" />
                        </div>
                    )}
                </div>

                <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                        style={{ animation: `progressBar ${rotationInterval}ms linear infinite` }}
                    />
                </div>
            </div>

            {activeAds.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {activeAds.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setIsAnimating(true);
                                setTimeout(() => {
                                    setCurrentIndex(i);
                                    setIsAnimating(false);
                                }, 150);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-purple-400 w-6' : 'bg-white/30 hover:bg-white/50'}`}
                        />
                    ))}
                </div>
            )}

            <div className="absolute left-0 top-4 bottom-4 w-1 flex flex-col gap-1">
                <div className="flex-1 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full animate-pulse" />
            </div>
            <div className="absolute right-0 top-4 bottom-4 w-1 flex flex-col gap-1">
                <div className="flex-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full animate-pulse" />
            </div>

            <style>{`
                @keyframes ledBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                @keyframes progressBar { from { width: 0%; } to { width: 100%; } }
                .stadium-scanlines { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px); pointer-events: none; }
                .stadium-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(147, 51, 234, 0.2) 0%, transparent 70%); pointer-events: none; }
            `}</style>
        </div>
    );
};

export const StadiumAdInline: React.FC<{ ad: Ad }> = ({ ad }) => {
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setPulse(p => !p), 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative overflow-hidden rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-900/30 via-black to-purple-900/30">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-pink-500/20 ${pulse ? 'opacity-100' : 'opacity-50'}`} />
            </div>

            <div className="relative p-3 flex items-center gap-3">
                {ad.imagenUrl && (
                    <img src={ad.imagenUrl} className="w-16 h-12 object-cover rounded" alt="" />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300">AD</span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{ad.titulo}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{ad.descripcion}</p>
                </div>
                {ad.link && (
                    <a href={ad.link} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded bg-purple-600 text-white text-[10px] font-bold hover:bg-purple-500 transition-colors">
                        Ver
                    </a>
                )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 flex">
                <div className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500" style={{ animation: 'ledBlink 0.5s infinite' }} />
            </div>
        </div>
    );
};

export const RotatingStadiumAds: React.FC<{
    ads: Ad[];
    position?: string;
    count?: number;
}> = ({ ads, position, count }) => {
    const [currentAd, setCurrentAd] = useState(0);

    const filteredAds = useMemo(() => {
        if (position) {
            return ads.filter(ad => ad.activo && ad.sector === position);
        }
        return ads.filter(ad => ad.activo);
    }, [ads, position]);

    useEffect(() => {
        if (filteredAds.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentAd(prev => (prev + 1) % filteredAds.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [filteredAds.length]);

    if (filteredAds.length === 0) return null;

    return (
        <StadiumAdBanner
            ads={filteredAds}
            maxVisible={count}
            rotationInterval={6000}
        />
    );
};

export default StadiumAdBanner;
