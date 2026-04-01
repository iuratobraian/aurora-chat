import React from 'react';
import { GlowCard } from './ui/GlowCard';
import { GalaxyButton } from './ui/GalaxyButton';

interface TermsModalProps {
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in zoom-in-95 duration-300">
      <GlowCard className="max-w-2xl w-full max-h-[80vh] flex flex-col p-0">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-widest text-white">Términos y Condiciones</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar text-gray-300 space-y-6 text-sm leading-relaxed">
          <section>
            <h4 className="text-primary font-bold uppercase tracking-widest mb-2 text-xs">1. Aceptación del Riesgo</h4>
            <p>TradeShare es una plataforma de análisis y comunidad. No somos asesores financieros. El trading conlleva un riesgo significativo de pérdida de capital.</p>
          </section>
          
          <section>
            <h4 className="text-primary font-bold uppercase tracking-widest mb-2 text-xs">2. Protocolo Aurora</h4>
            <p>Al unirte, aceptas que tus interacciones pueden ser procesadas por el sistema Aurora para mejorar la experiencia de la comunidad y la precisión de los datos.</p>
          </section>
          
          <section>
            <h4 className="text-primary font-bold uppercase tracking-widest mb-2 text-xs">3. Conducta de la Comunidad</h4>
            <p>Queda estrictamente prohibido el spam, el acoso o la promoción de servicios fraudulentos. El incumplimiento resultará en la baja inmediata de la terminal.</p>
          </section>
          
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl italic text-[11px] text-primary/70">
            "En TradeShare no solo operamos mercados, construimos el futuro del trading social."
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end">
          <GalaxyButton onClick={onClose} variant="primary" className="!py-2 !px-8">
            Entendido
          </GalaxyButton>
        </div>
      </GlowCard>
    </div>
  );
};
