import React, { memo } from 'react';
import { Ad } from '../../types';

interface VerticalAdBannerProps {
    ad?: Ad;
    imageUrl?: string;
    link?: string;
    title?: string;
    subtitle?: string;
    ctaLabel?: string;
    theme?: 'default' | 'gradient' | 'minimal';
    isAdmin?: boolean;
    onEdit?: (ad: Ad) => void;
}

const DEFAULT_VALUES = {
    imageUrl: 'https://picsum.photos/seed/ad300x600/300/600',
    link: '#',
    title: 'Tu Publicidad Aquí',
    subtitle: 'Llega a miles de traders activos',
    ctaLabel: 'Saber Más',
};

export const VerticalAdBanner: React.FC<VerticalAdBannerProps> = memo(({
    ad,
    imageUrl,
    link,
    title,
    subtitle,
    ctaLabel,
    theme = 'default',
    isAdmin = false,
    onEdit
}) => {
    const imgSrc = imageUrl || ad?.imagenUrl || DEFAULT_VALUES.imageUrl;
    const adLink = link || ad?.link || DEFAULT_VALUES.link;
    const adTitle = title || ad?.titulo || DEFAULT_VALUES.title;
    const adSubtitle = subtitle || ad?.descripcion || DEFAULT_VALUES.subtitle;
    const adCta = ctaLabel || DEFAULT_VALUES.ctaLabel;

    if (!imgSrc) return null;

    return (
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 group">
            {isAdmin && onEdit && ad && (
                <button
                    onClick={() => onEdit(ad)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-lg hover:bg-primary z-20 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">edit</span>
                </button>
            )}
            
            <a 
                href={adLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
            >
                <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
                    <img
                        src={imgSrc}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt={adTitle || 'Publicidad'}
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {theme === 'gradient' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-500/30" />
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        {adTitle && (
                            <h4 className="text-xs font-black text-white mb-1 drop-shadow-lg">
                                {adTitle}
                            </h4>
                        )}
                        {adSubtitle && (
                            <p className="text-[9px] text-white/70 font-medium line-clamp-2 mb-3">
                                {adSubtitle}
                            </p>
                        )}
                        {theme !== 'minimal' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-[9px] font-bold text-white uppercase tracking-wider hover:bg-white/30 transition-all">
                                {adCta}
                                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </span>
                        )}
                    </div>
                </div>
            </a>
            
            <div className="absolute top-3 left-3">
                <span className="text-[7px] font-medium text-white/40 uppercase tracking-wider">
                    Anuncio
                </span>
            </div>
        </section>
    );
});

VerticalAdBanner.displayName = 'VerticalAdBanner';

export default VerticalAdBanner;
