import React from 'react';
import { Usuario } from '../types';

interface ExnessBroker_PartnerProps {
  usuario: Usuario | null;
}

const ExnessBroker_Partner: React.FC<ExnessBroker_PartnerProps> = ({ usuario }) => {
  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Banner Próximamente */}
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-cyan-500/20 to-primary/20 border border-primary/30 p-6">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.1),transparent)] animate-[shimmer_2s_infinite] bg-[length:200%_100%]"></div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse">
                <span className="material-symbols-outlined text-white text-2xl">hourglass_empty</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Próximamente</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Funcionalidad Partner en Desarrollo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="size-8 rounded-full bg-primary/30 border-2 border-primary/50 flex items-center justify-center">
                  <span className="text-[8px]">🔧</span>
                </div>
                <div className="size-8 rounded-full bg-cyan-500/30 border-2 border-cyan-500/50 flex items-center justify-center">
                  <span className="text-[8px]">⚡</span>
                </div>
                <div className="size-8 rounded-full bg-emerald-500/30 border-2 border-emerald-500/50 flex items-center justify-center">
                  <span className="text-[8px]">✨</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ETA: Muy Pronto</span>
            </div>
          </div>
        </div>
      </div>

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
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">Exness Partner</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Programa de Afiliados Exclusivo</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <span className="material-symbols-outlined text-amber-500 text-sm">schedule</span>
            <span className="text-[10px] font-black text-amber-500 uppercase">En Desarrollo</span>
          </div>
          <button 
            disabled
            className="px-5 py-2.5 bg-gradient-to-r from-primary/50 to-cyan-500/50 text-white/50 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-not-allowed flex items-center gap-2"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">person_add</span>
              Conviértete en Partner
            </span>
          </button>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="flex gap-6">
        
        {/* Panel Lateral - Info Partner */}
        <div className="hidden lg:block w-72 shrink-0 space-y-4">
          
          {/* Card Info Partner */}
          <div className="glass rounded-3xl p-5 border border-white/10 opacity-60">
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
                <span className="text-xs font-black text-white/50 blur-sm select-none">hasta 40%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">people</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Afiliados</span>
                </div>
                <span className="text-xs font-black text-white/50 blur-sm select-none">Ilimitados</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-sm">payments</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Pagos</span>
                </div>
                <span className="text-xs font-black text-white/50 blur-sm select-none">Instant</span>
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
          <div className="glass rounded-3xl p-5 border border-white/10 opacity-60">
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
          <div className="glass rounded-3xl p-5 border border-white/10 opacity-60">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Enlaces Rápidos</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl opacity-50 cursor-not-allowed">
                <span className="material-symbols-outlined text-gray-500 text-sm">trending_up</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Abrir Trading</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl opacity-50 cursor-not-allowed">
                <span className="material-symbols-outlined text-gray-500 text-sm">account_balance</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Área Personal</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl opacity-50 cursor-not-allowed">
                <span className="material-symbols-outlined text-gray-500 text-sm">calculate</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Calculadora</span>
              </div>
            </div>
          </div>
          
          {/* Notificación Email */}
          <div className="glass rounded-3xl p-5 border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-amber-500">notifications_active</span>
              <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">¡Sé el Primero!</h4>
            </div>
            <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed mb-3">
              Obtén acceso prioritario cuando lancemos el programa partner.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="tu@email.com"
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white placeholder-gray-600 outline-none focus:border-amber-500/50"
                disabled
              />
              <button 
                disabled
                className="px-3 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase rounded-lg cursor-not-allowed"
              >
                OK
              </button>
            </div>
          </div>
        </div>
        
        {/* Iframe Principal Deshabilitado */}
        <div className="flex-1 min-w-0">
          <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black/60 h-[calc(100vh-200px)] min-h-[600px] group">
            
            {/* Overlay Deshabilitado */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-cyan-500/20 z-10"></div>
            
            {/* Placeholder */}
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-black/90 via-[#0a0a0f] to-black">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
                <div className="relative size-24 rounded-3xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 flex items-center justify-center">
                  <svg className="size-12 text-primary/50" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                Plataforma Partner
              </h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-8 max-w-md text-center">
                El panel de control partner estará disponible muy pronto. Prepárate para gestionar tus referidos y comisiones.
              </p>
              
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">group</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Gestión de Afiliados</span>
                </div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-lg">attach_money</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Tracking de Comisiones</span>
                </div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-lg">analytics</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Reportes Avanzados</span>
                </div>
              </div>
              
              {/* Loading Animation */}
              <div className="mt-12 flex items-center gap-3">
                <div className="size-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="size-3 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="size-3 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
            
            {/* Badge Overlay */}
            <div className="absolute top-4 left-4 z-20">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 backdrop-blur-md rounded-full border border-amber-500/30">
                <span className="material-symbols-outlined text-amber-500 text-sm">hourglass_empty</span>
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Próximamente</span>
              </div>
            </div>
          </div>
          
          {/* Info Cards Inferior */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="glass rounded-2xl p-4 border border-white/10 opacity-60">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-500">trending_up</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Comisiones</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Hasta 40% por lote</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 border border-white/10 opacity-60">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">people</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Sub-Afiliados</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Multi-nivel disponible</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 border border-white/10 opacity-60">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-cyan-400">payments</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Pagos</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Múltiples métodos</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 border border-white/10 opacity-60">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-500">support_agent</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Soporte</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">24/7 Dedicado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExnessBroker_Partner;
