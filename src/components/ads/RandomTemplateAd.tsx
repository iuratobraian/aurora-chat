import React, { memo, useState, useEffect } from 'react';

const TEMPLATE_ADS = [
    {
        id: 'ad-1',
        imageUrl: '/ads/2955045.jpg',
        link: '#',
        title: 'TradeHub Premium',
    },
    {
        id: 'ad-2',
        imageUrl: '/ads/2617401.jpg',
        link: '#',
        title: 'TradeHub Pro',
    },
];

interface RandomTemplateAdProps {
    className?: string;
    interval?: number;
}

export const RandomTemplateAd: React.FC<RandomTemplateAdProps> = memo(({
    className = '',
    interval = 8,
}) => {
    const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * TEMPLATE_ADS.length));
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % TEMPLATE_ADS.length);
                setIsTransitioning(false);
            }, 300);
        }, interval * 1000);

        return () => clearInterval(timer);
    }, [interval]);

    const currentAd = TEMPLATE_ADS[currentIndex];

    return (
        <div className={`relative overflow-hidden rounded-xl ${className}`}>
            <a
                href={currentAd.link}
                className={`block transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            >
                <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                    <img
                        src={currentAd.imageUrl}
                        alt={currentAd.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/60">
                            Patrocinado
                        </span>
                    </div>
                </div>
            </a>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
                <div
                    key={`progress-${currentIndex}`}
                    className="h-full bg-gradient-to-r from-primary to-purple-500 animate-[shrink_8s_linear_forwards]"
                    style={{ animationDuration: `${interval}s` }}
                />
            </div>

            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
});

RandomTemplateAd.displayName = 'RandomTemplateAd';

export default RandomTemplateAd;
