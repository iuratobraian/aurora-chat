import React, { memo } from 'react';

interface PostCardZoneProps {
    tipo?: string;
    par?: string;
    zonaOperativa?: { inicio: string; fin: string };
}

export const PostCardZone: React.FC<PostCardZoneProps> = memo(({ tipo, par, zonaOperativa }) => {
    if (!zonaOperativa || (!zonaOperativa.inicio && !zonaOperativa.fin)) return null;

    return (
        <div className={`mx-4 mb-4 px-4 py-3 rounded-xl border backdrop-blur-sm flex items-center justify-between gap-4 ${
            tipo === 'Venta'
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-emerald-500/5 border-emerald-500/20'
        }`}>
            <div className="flex items-center gap-2">
                <div className={`size-7 rounded-lg flex items-center justify-center ${
                    tipo === 'Venta' ? 'bg-red-500/10' : 'bg-emerald-500/10'
                }`}>
                    <span className={`material-symbols-outlined text-sm ${
                        tipo === 'Venta' ? 'text-red-500' : 'text-emerald-500'
                    }`}>
                        {tipo === 'Venta' ? 'trending_down' : 'trending_up'}
                    </span>
                </div>
                <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                        tipo === 'Venta' ? 'text-red-500' : 'text-emerald-500'
                    }`}>
                        {tipo}
                    </span>
                    <span className="text-[9px] text-gray-500 ml-2 font-bold">{par}</span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-center">
                    <span className="text-[8px] font-bold uppercase text-gray-500 tracking-widest block">Entrada</span>
                    <span className={`text-sm font-black tabular-nums ${
                        tipo === 'Venta' ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                        {zonaOperativa.inicio || '-'}
                    </span>
                </div>
                <div className={`size-4 rounded-full ${tipo === 'Venta' ? 'bg-red-500/30' : 'bg-emerald-500/30'}`}>
                    <svg viewBox="0 0 24 24" className={`w-full h-full ${tipo === 'Venta' ? 'text-red-400' : 'text-emerald-400'}`} fill="none" stroke="currentColor" strokeWidth="2">
                        <path
                            d={tipo === 'Venta' ? "M7 17L17 7M17 7H7M17 7V17" : "M7 7l10 10M17 17H7M17 17V7"}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <div className="text-center">
                    <span className="text-[8px] font-bold uppercase text-gray-500 tracking-widest block">Objetivo</span>
                    <span className={`text-sm font-black tabular-nums ${
                        tipo === 'Venta' ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                        {zonaOperativa.fin || '-'}
                    </span>
                </div>
            </div>
        </div>
    );
});

export default PostCardZone;