import React, { memo } from 'react';

interface PartnerCardProps {
    logo: string;
    name: string;
    benefit: string;
    link: string;
}

export const PartnerCard: React.FC<PartnerCardProps> = memo(({ logo, name, benefit, link }) => (
    <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all group"
    >
        <img src={logo} className="size-8 rounded-lg object-cover bg-white" alt={name} />
        <div className="flex-1 min-w-0">
            <h4 className="text-[10px] font-black text-white uppercase truncate">{name}</h4>
            <span className="text-[8px] font-bold text-signal-green uppercase">{benefit}</span>
        </div>
        <span className="material-symbols-outlined text-lg text-gray-600">arrow_outward</span>
    </a>
));

export default PartnerCard;