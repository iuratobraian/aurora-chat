import React, { memo, useState, useEffect, useMemo } from 'react';

interface Ad {
    id: string;
    titulo?: string;
    descripcion?: string;
    imagenUrl?: string;
    link?: string;
    sector?: string;
    activo?: boolean;
    subtitle?: string;
}

interface LiveTVAdOverlayProps {
    ads: Ad[];
    autoRotate?: boolean;
    rotationInterval?: number;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const LiveTVAdOverlay: React.FC<LiveTVAdOverlayProps> = ({
    ads,
    autoRotate = true,
    rotationInterval = 12000,
    position = 'bottom-right',
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const feedAds = useMemo(() => 
        ads.filter(ad => ad.activo && (ad.sector === 'feed' || ad.sector === 'signals' || !ad.sector)),
        [ads]
    );

    useEffect(() => {
        if (feedAds.length === 0) return;
        
        const showTimer = setTimeout(() => setIsVisible(true), 3000);
        
        return () => clearTimeout(showTimer);
    }, [feedAds.length]);

    useEffect(() => {
        if (!autoRotate || feedAds.length <= 1 || !isVisible) return;

        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % feedAds.length);
                setIsTransitioning(false);
            }, 500);
        }, rotationInterval);

        return () => clearInterval(interval);
    }, [autoRotate, feedAds.length, rotationInterval, isVisible]);

    useEffect(() => {
        if (!isVisible) return;
        
        const hideTimer = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % feedAds.length);
                setIsVisible(true);
            }, 3000);
        }, 15000);

        return () => clearInterval(hideTimer);
    }, [isVisible, feedAds.length]);

    if (feedAds.length === 0) return null;

    const currentAd = feedAds[currentIndex];

    const positionClasses = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
    };

    return (
        <div
            className={`absolute z-50 transition-all duration-500 ${positionClasses[position]} ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
        >
            <div
                className={`relative bg-gradient-to-br from-black/95 via-purple-950/95 to-black/95 rounded-xl overflow-hidden border border-purple-500/30 backdrop-blur-xl transition-all duration-500 ${
                    isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                }`}
                style={{
                    minWidth: '280px',
                    maxWidth: '340px',
                    boxShadow: '0 0 30px rgba(147, 51, 234, 0.3), 0 0 60px rgba(147, 51, 234, 0.1)',
                }}
            >
                {/* Animated LED Top Border */}
                <div className="absolute top-0 left-0 right-0 h-0.5 flex overflow-hidden">
                    {Array.from({ length: 14 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{
                                animation: `ledBlink 0.8s infinite`,
                                animationDelay: `${i * 0.05}s`,
                            }}
                        />
                    ))}
                </div>

                {/* LIVE Badge */}
                <div className="absolute top-2 left-2 z-10">
                    <div className="px-2 py-0.5 bg-red-600 rounded text-[8px] font-black text-white uppercase tracking-wider flex items-center gap-1">
                        <span className="size-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-1 right-1 z-10 size-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                >
                    <span className="material-symbols-outlined text-white text-xs">close</span>
                </button>

                {/* Content */}
                <div className="p-3 pt-4">
                    <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        {currentAd.imagenUrl && (
                            <div className="relative flex-shrink-0">
                                <img
                                    src={currentAd.imagenUrl}
                                    alt=""
                                    className="w-20 h-14 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 rounded-lg border border-purple-500/30" />
                            </div>
                        )}

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300">
                                    PATROCINADO
                                </span>
                            </div>

                            <h4 className="text-sm font-bold text-white truncate leading-tight mb-1">
                                {currentAd.titulo}
                            </h4>

                            <p className="text-[10px] text-gray-400 line-clamp-2">
                                {currentAd.descripcion}
                            </p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    {currentAd.link && (
                        <a
                            href={currentAd.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                        >
                            <span>Ver Ahora</span>
                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </a>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="h-0.5 bg-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                        style={{
                            animation: `adProgress ${rotationInterval / 1000}s linear infinite`,
                        }}
                    />
                </div>

                {/* Animated Bottom Glow */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-50" />

                {/* Scanlines Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-5">
                    <div className="w-full h-full" style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                    }} />
                </div>
            </div>

            <style>{`
                @keyframes ledBlink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.2; }
                }
                @keyframes adProgress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};

// Compact ticker version that slides from bottom
export const LiveTVAdTicker: React.FC<{
    ads: Ad[];
    autoRotate?: boolean;
}> = ({ ads, autoRotate = true }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    const feedAds = useMemo(() => 
        ads.filter(ad => ad.activo),
        [ads]
    );

    useEffect(() => {
        if (feedAds.length === 0) return;
        const timer = setTimeout(() => setIsVisible(true), 5000);
        return () => clearTimeout(timer);
    }, [feedAds.length]);

    useEffect(() => {
        if (!autoRotate || feedAds.length <= 1 || !isVisible) return;
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % feedAds.length);
                setIsVisible(true);
            }, 500);
        }, 15000);
        return () => clearInterval(interval);
    }, [autoRotate, feedAds.length, isVisible]);

    if (feedAds.length === 0) return null;

    const currentAd = feedAds[currentIndex];

    return (
        <div
            className={`absolute bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${
                isVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
        >
            <div className="bg-gradient-to-r from-purple-900/95 via-black/95 to-purple-900/95 backdrop-blur-xl border-t border-purple-500/30 p-3">
                <div className="flex items-center gap-4 max-w-4xl mx-auto">
                    {/* Ad Content */}
                    <div className="flex-1 flex items-center gap-3">
                        {currentAd.imagenUrl && (
                            <img
                                src={currentAd.imagenUrl}
                                alt=""
                                className="w-16 h-10 object-cover rounded"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{currentAd.titulo}</p>
                            <p className="text-[10px] text-gray-400 truncate">{currentAd.descripcion}</p>
                        </div>
                    </div>

                    {/* CTA */}
                    {currentAd.link && (
                        <a
                            href={currentAd.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-[10px] font-bold text-white uppercase flex-shrink-0"
                        >
                            Ver
                        </a>
                    )}

                    {/* Skip */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiveTVAdOverlay;
