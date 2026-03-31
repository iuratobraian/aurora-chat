import React from 'react';
import { Usuario } from '../types';

interface ExnessBrokerProps {
  usuario: Usuario | null;
}

const ExnessBroker: React.FC<ExnessBrokerProps> = ({ usuario }) => {
  const isAdmin = usuario && ((usuario.role || 0) >= 5 || usuario.rol === 'ceo' || usuario.rol === 'programador');

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-200px)] animate-in fade-in duration-700">
        <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <span className="material-symbols-outlined text-4xl text-gray-500">lock</span>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">Acceso Restringido</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          La integración con el broker está temporalmente en mantenimiento y configuración de Partner. Solo el personal de administración tiene acceso en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Header con Logo Exness + Branding */}
      <div className="flex items-center justify-between gap-4 mb-6 px-2">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-[30px] rounded-full"></div>
            <div className="relative size-14 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 flex items-center justify-center">
              <svg className="size-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <span className="text-primary">TradePortal</span>
              <span className="text-gray-500 text-sm">×</span>
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">Exness</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Plataforma de Trading Oficial</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase">Plataforma Activa</span>
          </div>
          <a 
            href="https://www.exness.com/partner/tradeportal" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-gradient-to-r from-primary to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">person_add</span>
              Conviértete en Partner
            </span>
          </a>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="flex gap-6">
        
        {/* Panel Lateral - Info Partner */}
        <div className="hidden lg:block w-72 shrink-0 space-y-4">
          
          {/* Card Info Partner */}
          <div className="glass rounded-3xl p-5 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-lg">workspace_premium</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase">Programa Partner</h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase">Exness & TradePortal</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Comisión</span>
                </div>
                <span className="text-xs font-black text-white">hasta 40%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">people</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Afiliados</span>
                </div>
                <span className="text-xs font-black text-white">Ilimitados</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-sm">payments</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Pagos</span>
                </div>
                <span className="text-xs font-black text-white">Instant</span>
              </div>
            </div>
            
            <button 
              disabled
              className="w-full mt-4 px-4 py-3 bg-white/5 border border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              Panel Partner (Próximamente)
            </button>
          </div>
          
          {/* Stats Card */}
          <div className="glass rounded-3xl p-5 border border-white/10">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tu Progreso</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-gray-500 font-bold uppercase">Referidos</span>
                  <span className="text-gray-400">0</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-primary to-cyan-400 rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-gray-500 font-bold uppercase">Ganancias</span>
                  <span className="text-gray-400">$0.00</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="glass rounded-3xl p-5 border border-white/10">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Enlaces Rápidos</h4>
            <div className="space-y-2">
              <a href="https://www.exness.com/trading/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/5 rounded-xl transition-all group">
                <span className="material-symbols-outlined text-gray-500 group-hover:text-primary text-sm">trending_up</span>
                <span className="text-[10px] text-gray-400 group-hover:text-white font-bold uppercase">Abrir Trading</span>
              </a>
              <a href="https://www.exness.com/personal-area/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/5 rounded-xl transition-all group">
                <span className="material-symbols-outlined text-gray-500 group-hover:text-primary text-sm">account_balance</span>
                <span className="text-[10px] text-gray-400 group-hover:text-white font-bold uppercase">Área Personal</span>
              </a>
              <a href="https://www.exness.com/calculator/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/5 rounded-xl transition-all group">
                <span className="material-symbols-outlined text-gray-500 group-hover:text-primary text-sm">calculate</span>
                <span className="text-[10px] text-gray-400 group-hover:text-white font-bold uppercase">Calculadora</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* Iframe Principal */}
        <div className="flex-1 min-w-0">
          <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black/60 h-[calc(100vh-200px)] min-h-[600px] group">
            
            {/* Overlay de Carga */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10 z-10 pointer-events-none"></div>
            
            {/* Marco del iframe */}
            <iframe 
              src="https://www.exness.com/trading/"
              className="w-full h-full border-none"
              title="Exness Trading Platform"
              allow="clipboard-read; clipboard-write; geolocation; microphone; camera; midi; encrypted-media; autoplay; fullscreen; picture-in-picture;"
            />
            
            {/* Badge Overlay */}
            <div className="absolute top-4 left-4 z-20">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-white/10">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Live Trading</span>
              </div>
            </div>
            
            {/* Info Overlay inferior */}
            <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2 shadow-xl">
                <span className="text-[8px] text-gray-500 font-bold uppercase">Plataforma oficial de</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter italic">Exness</span>
              </div>
            </div>
          </div>
          
          {/* Info Cards Inferior */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="glass rounded-2xl p-4 border border-white/10 hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-500">speed</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Ejecución Ultra Rápida</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">0.1s de latencia promedio</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 border border-white/10 hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">security</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Fondos Protegidos</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Seguros de hasta $1M USD</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 border border-white/10 hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-cyan-400">public</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Cobertura Global</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">+180 países atendidos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExnessBroker;
