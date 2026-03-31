import { useEffect } from "react";

interface AdCardProps {
  campaign: {
    _id: string;
    titulo: string;
    descripcion: string;
    imagenUrl: string;
    link: string;
    sector: string;
  };
  onImpression?: () => void;
}

export function AdCard({ campaign, onImpression }: AdCardProps) {
  useEffect(() => {
    // Small delay to ensure it's actually viewed
    const timer = setTimeout(() => {
      onImpression?.();
    }, 1000);
    return () => clearTimeout(timer);
  }, [onImpression]);

  const handleClick = () => {
    window.open(campaign.link, "_blank", "noopener,noreferrer");
  };

  const ctaText = campaign.sector === "sidebar" ? "Ver Más" : 
                  campaign.sector === "cursos" ? "Inscribirse" : 
                  "Saber Más";

  return (
    <div className="ad-card glass-v2 rounded-2xl overflow-hidden my-6 border border-white/5 hover:border-blue-500/30 transition-all group scale-[0.98] hover:scale-100 duration-300">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={campaign.imagenUrl} 
          alt={campaign.titulo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 bg-blue-600/80 backdrop-blur-xl text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-[0.1em] border border-white/20 shadow-lg">
          Promocionado
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-1">
           <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">{campaign.sector}</span>
        </div>
        <h3 className="font-bold text-lg mb-2 text-white/90 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{campaign.titulo}</h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-5 leading-relaxed">
          {campaign.descripcion}
        </p>
        <button 
          onClick={handleClick}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {ctaText}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
        </button>
      </div>
    </div>
  );
}
