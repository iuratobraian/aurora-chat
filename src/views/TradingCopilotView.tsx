import React from 'react';
import { Usuario } from '../types';

interface TradingCopilotProps {
  usuario: Usuario | null;
}

const TradingCopilotView: React.FC<TradingCopilotProps> = ({ usuario }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="glass-morphism p-12 rounded-3xl border border-white/10 max-w-2xl w-full">
        <span className="material-symbols-outlined text-6xl text-primary mb-6">psychology</span>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Research Copilot</h1>
        <p className="text-gray-400 text-lg mb-8">
          Tu asistente de investigación avanzado con IA está siendo calibrado. 
          Pronto podrás analizar mercados con profundidad institucional.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Próximamente en TradeShare
        </div>
      </div>
    </div>
  );
};

export default TradingCopilotView;
