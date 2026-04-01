import React, { memo } from 'react';

export interface PartnerCardProps {
    logo: string;
    name: string;
    benefit: string;
    link?: string;
    url?: string;
    tag?: string;
}

export const PartnerCard: React.FC<PartnerCardProps> = memo(({ logo, name, benefit, link, url, tag }) => (
    <a
        href={link || url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group relative"
    >
        {tag && (
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-primary/20 border-b border-l border-primary/20 rounded-bl-lg">
                <span className="text-[7px] font-black text-primary uppercase tracking-tighter">{tag}</span>
            </div>
        )}
        <img src={logo} className="size-8 rounded-lg object-cover bg-white" alt={name} />
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 overflow-hidden">
                <h4 className="text-[10px] font-black text-white uppercase truncate">{name}</h4>
            </div>
            <span className="text-[8px] font-bold text-signal-green uppercase">{benefit}</span>
        </div>
        <span className="material-symbols-outlined text-lg text-gray-600">arrow_outward</span>
    </a>
));

export default PartnerCard;