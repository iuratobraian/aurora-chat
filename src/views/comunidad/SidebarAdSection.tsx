import React, { memo, useMemo } from 'react';
import { Ad } from '../../types';

interface SidebarAdSectionProps {
    ad: Ad;
    theme: 'blue' | 'emerald';
    subtitle: string;
    btnLabel: string;
    isAdmin: boolean;
    onEdit: (ad: Ad) => void;
}

export const SidebarAdSection: React.FC<SidebarAdSectionProps> = memo(({
    ad,
    theme,
    subtitle,
    btnLabel,
    isAdmin,
    onEdit
}) => {
    const colors = useMemo(() => ({
        blue: {
            text: 'text-primary',
            bg: 'bg-primary/5',
            btn: 'bg-primary hover:bg-blue-600'
        },
        emerald: {
            text: 'text-signal-green',
            bg: 'bg-signal-green/5',
            btn: 'bg-signal-green hover:bg-emerald-500'
        },
    }), []);

    const colorSet = colors[theme];

    return (
        <section className={`glass rounded-2xl p-4 border border-gray-100 dark:border-white/5 bg-white dark:bg-black/40 overflow-hidden group relative transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]`}>
            {isAdmin && (
                <button
                    onClick={() => onEdit(ad)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded hover:bg-primary z-20 transition-colors"
                >
                    <span className="material-symbols-outlined text-xs">edit</span>
                </button>
            )}
            <h2 className={`text-[9px] font-black uppercase tracking-[0.2em] ${colorSet.text} flex items-center gap-2 mb-4`}>
                <span className="material-symbols-outlined text-sm">
                    {(ad as any).extra || (theme === 'blue' ? 'school' : 'smart_toy')}
                </span>
                {(ad as any).subtitle || subtitle}
            </h2>
            {ad.imagenUrl && (
                <div className="relative rounded-lg overflow-hidden aspect-video mb-3">
                    <img
                        src={ad.imagenUrl}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={ad.titulo}
                        referrerPolicy="no-referrer"
                    />
                </div>
            )}
            <div className="mb-3">
                <h4 className="text-[9px] font-black text-gray-900 dark:text-white uppercase mb-1">{ad.titulo}</h4>
                <p className="text-[8px] text-gray-500 dark:text-gray-400 font-medium">{ad.descripcion}</p>
            </div>
            <a
                href={ad.link || '#'}
                className={`block w-full text-center py-2 ${colorSet.btn} text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all`}
            >
                {btnLabel}
            </a>
        </section>
    );
});

export default SidebarAdSection;