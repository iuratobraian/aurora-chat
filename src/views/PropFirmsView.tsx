import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Usuario } from '../types';

interface PropFirmsViewProps {
  usuario: Usuario | null;
}

interface PropFirm {
  _id: any;
  name: string;
  description: string;
  logoUrl?: string;
  coverUrl?: string;
  affiliateLink: string;
  isActive: boolean;
  order: number;
  characteristics?: string[];
  profitSplit?: string;
  minDeposit?: string;
  maxProfit?: string;
  createdAt: number;
}

const PropFirmsView: React.FC<PropFirmsViewProps> = ({ usuario }) => {
  const propFirms = useQuery(api.propFirms.getPropFirms);
  const [selectedFirm, setSelectedFirm] = useState<PropFirm | null>(null);

  if (!propFirms || propFirms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh] animate-in fade-in duration-700">
        <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <span className="material-symbols-outlined text-4xl text-primary">business</span>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Prop Firms</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Las principales firmas de trading profesional pronto disponibles. Mantente atento.
        </p>
        
        <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
          <div className="size-2 bg-amber-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-gray-400 uppercase">Pronto disponible</span>
        </div>
      </div>
    );
  }

  const sortedFirms = [...propFirms].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-[30px] rounded-full"></div>
            <div className="relative size-14 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary">account_balance</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
              <span className="text-primary">Prop</span> Firms
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Firmas de Trading Profesional</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase">{sortedFirms.length} Firms Disponibles</span>
          </div>
        </div>
      </div>

      {/* Grid de Firms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFirms.map((firm) => (
          <div
            key={firm._id}
            className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] group"
          >
            {/* Cover Image */}
            {firm.coverUrl && (
              <div className="h-32 bg-gradient-to-br from-primary/20 to-violet-500/20 overflow-hidden">
                <img 
                  src={firm.coverUrl} 
                  alt={firm.name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
              </div>
            )}
            
            <div className="p-5">
              {/* Logo + Name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="size-14 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                  {firm.logoUrl ? (
                    <img src={firm.logoUrl} alt={firm.name} className="size-10 object-contain" />
                  ) : (
                    <span className="material-symbols-outlined text-3xl text-primary">{firm.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">{firm.name}</h3>
                  <div className="flex items-center gap-1">
                    <div className="size-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase">Activo</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 mb-4 line-clamp-2">{firm.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {firm.profitSplit && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase block">Profit Split</span>
                    <span className="text-sm font-black text-primary">{firm.profitSplit}</span>
                  </div>
                )}
                {firm.minDeposit && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase block">Min. Depósito</span>
                    <span className="text-sm font-black text-white">{firm.minDeposit}</span>
                  </div>
                )}
                {firm.maxProfit && (
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase block">Max. Profit</span>
                    <span className="text-sm font-black text-signal-green">{firm.maxProfit}</span>
                  </div>
                )}
              </div>

              {/* Characteristics */}
              {firm.characteristics && firm.characteristics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {firm.characteristics.slice(0, 4).map((char, i) => (
                    <span key={i} className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-[9px] text-primary font-bold uppercase">
                      {char}
                    </span>
                  ))}
                  {firm.characteristics.length > 4 && (
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-gray-400 font-bold">
                      +{firm.characteristics.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* CTA Button */}
              <a
                href={firm.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-gradient-to-r from-primary to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
              >
                <span>Ir a {firm.name}</span>
                <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-12 p-6 glass rounded-2xl border border-white/10">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl text-amber-500">info</span>
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide mb-1">Sobre las Prop Firms</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Las firmas de trading profesional (Prop Firms) te permiten operar con capital de la empresa. 
              Ganancias split hasta 90% para traders. Cada firma tiene sus propios criterios de evaluación 
              y reglas de operación. Usa nuestros links de afiliado para support el desarrollo de TradeHub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropFirmsView;
