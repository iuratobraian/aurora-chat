import React, { useState } from 'react';
import { Usuario } from '../types';
import RiskAssistant from '../components/agents/RiskAssistant';

interface BitacoraViewProps {
  usuario: Usuario;
}

const BitacoraView: React.FC<BitacoraViewProps> = ({ usuario }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showRiskChat, setShowRiskChat] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-black p-6 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)' }}></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors duration-700"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Bitácora <span className="text-primary">VIP</span></h1>
          </div>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">Registro avanzado de operaciones institucionales</p>
        </div>

        <a
          href="https://bitacora-de-trading.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/5 border border-white/5 rounded-xl text-white font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
          Abrir en nueva pestaña
        </a>
      </div>

      <div className="flex-1 min-h-[600px] glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative size-12">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Cargando Bitácora VIP...</p>
            </div>
          </div>
        )}
        <iframe
          src="https://bitacora-de-trading.vercel.app/"
          className="w-full h-full absolute inset-0 border-0"
          title="Bitácora VIP"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Panel Bot de Auto Trading */}
      <div className="mt-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-[2.5rem] p-8 border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)] relative overflow-hidden group">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-600/30 rounded-full blur-[80px] group-hover:bg-purple-500/40 transition-colors duration-700"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[60px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 text-[10px] font-black uppercase tracking-widest mb-4">
              <span className="material-symbols-outlined text-[14px]">smart_toy</span>
              Nueva Herramienta
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2 leading-tight">
              Bot de Auto Trading <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Institucional</span>
            </h2>
            <p className="text-gray-300 text-sm max-w-xl mb-6 leading-relaxed">
              Automatiza tus operativas con algoritmos de precisión institucional. Maximiza tus ganancias y minimiza el riesgo mientras duermes. Configuración simple, resultados profesionales.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <span className="material-symbols-outlined text-green-400 text-[16px]">check_circle</span>
                Operativa 24/5
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <span className="material-symbols-outlined text-green-400 text-[16px]">check_circle</span>
                Gestión de Riesgo
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <span className="material-symbols-outlined text-green-400 text-[16px]">check_circle</span>
                Estrategias Probadas
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <span className="block text-gray-400 text-xs uppercase tracking-widest mb-1">Precio de Lanzamiento</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl text-gray-500 line-through font-bold">$1500</span>
                <span className="text-5xl font-black text-white">$1000</span>
              </div>
            </div>
            <a
              href="https://portalib.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-black uppercase tracking-wider overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
              <span className="material-symbols-outlined relative z-10 animate-bounce">shopping_cart</span>
              <span className="relative z-10">Comprar Ahora</span>
            </a>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Licencia de por vida. Cupos limitados.</p>
          </div>
        </div>
      </div>

      {/* Chat Flotante de Riesgo */}
      <button
        onClick={() => setShowRiskChat(!showRiskChat)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <span className="text-2xl">🛡️</span>
      </button>

      {showRiskChat && (
        <div className="fixed bottom-24 right-6 z-50 w-96 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <button
            onClick={() => setShowRiskChat(false)}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold hover:scale-110 transition-transform"
          >
            ✕
          </button>
          <RiskAssistant />
        </div>
      )}
    </div>
  );
};

export default BitacoraView;
