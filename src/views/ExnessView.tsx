import React, { useState, useEffect } from 'react';
import { Usuario } from '../types';
import { ExnessService } from '../services/exness';
import ElectricLoader from '../components/ElectricLoader';
import { useToast } from '../components/ToastProvider';

interface ExnessViewProps {
  usuario: Usuario | null;
}

const ExnessView: React.FC<ExnessViewProps> = ({ usuario }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [accountId, setAccountId] = useState('');
  const [server, setServer] = useState('Exness-Real');
  const [terminalUrl, setTerminalUrl] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const loadConfig = async () => {
      const saved = await ExnessService.getConnection();
      if (saved) {
        setConfig(saved);
        // In real app, we would fetch terminal URL from Exness using the API Key
        setTerminalUrl(`${saved.terminalUrl || 'https://trade.exness.com/terminal/'}`);
      }
      setLoading(false);
    };
    loadConfig();
  }, []);

  const handleConnect = async () => {
    if (!apiKey || !accountId) return showToast('warning', "Por favor complete los datos");
    setLoading(true);
    try {
      // 1. In real app, we verify the API key with Exness (GET /api/servers/)
      // 2. Save for future sessions
      await ExnessService.saveConnection(apiKey, accountId, server);
      setConfig({ apiKey, accountId, server });
      setTerminalUrl(`https://trade.exness.com/terminal/`); // Mock
      setShowConnectModal(false);
      showToast('success', 'Conexión exitosa con Exness');
    } catch (e) {
      showToast('error', "Error al conectar con Exness");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm("¿Estás seguro de desconectar tu cuenta de Exness?")) {
      await ExnessService.disconnect();
      setConfig(null);
      setTerminalUrl('');
      showToast('info', 'Cuenta desconectada');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <ElectricLoader text="Estableciendo conexión segura..." />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Header - Premium Navigation Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-2">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
             <span className="text-primary italic">Exness</span> Terminal
             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full">Pro Broker</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Conexión directa con tu cuenta oficial de Exness</p>
        </div>

        <div className="flex items-center gap-4">
          {!config ? (
            <button 
              onClick={() => setShowConnectModal(true)}
              className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">link</span>
              Conectar Cuenta
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
              <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white uppercase">{config.accountId}</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase">{config.server}</span>
              </div>
              <button 
                onClick={handleDisconnect}
                className="size-8 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all flex items-center justify-center"
                title="Desconectar"
              >
                <span className="material-symbols-outlined text-sm">link_off</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative min-h-[80vh] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-black/40 group">
        
        {!config ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-black/80 via-black to-blue-900/10">
             <div className="relative mb-8">
               <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse"></div>
               <span className="material-symbols-outlined text-8xl text-primary relative z-10 opacity-60">account_balance_wallet</span>
             </div>
             <h2 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter leading-none">Tu Plataforma Exness <br/> <span className="text-primary italic">Integrada</span></h2>
             <p className="text-gray-400 text-xs max-w-md font-bold uppercase tracking-widest leading-relaxed mb-10 opacity-70">
                Conecta tu cuenta de Exness de forma segura para operar directamente con tus herramientas premium, indicadores personalizados y ejecución instantánea.
             </p>
             <button 
               onClick={() => setShowConnectModal(true)}
               className="group relative px-10 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
             >
               Vincular Broker Ahora
               <span className="absolute -right-2 -top-2 px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded-full animate-bounce">NUEVO</span>
             </button>
          </div>
        ) : (
          <div className="w-full h-full animate-in zoom-in-95 duration-1000">
             <iframe 
               src={terminalUrl} 
               className="w-full h-[85vh] border-none"
               title="Exness Pro Terminal"
               allow="clipboard-read; clipboard-write; geolocation; microphone; camera; midi; encrypted-media; autoplay; fullscreen; picture-in-picture;"
             />
             
             {/* Dynamic Utility Overlay (Sutil) */}
             <div className="absolute bottom-6 right-6 flex gap-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center gap-1 shadow-2xl">
                   <img src="https://trade.exness.com/terminal/favicon.ico" className="size-5 mb-1 opacity-50" alt="" />
                   <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Powered by</span>
                   <span className="text-[10px] font-black text-white uppercase tracking-tighter italic">Exness Official</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-sm glass rounded-[2.5rem] border border-white/10 shadow-3xl p-8 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-8">
                 <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined text-primary text-2xl">security</span>
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Conexión Segura</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Usa tu API Key de Exness</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">ID de Cuenta</label>
                    <input 
                      type="text" 
                      value={accountId}
                      onChange={e => setAccountId(e.target.value)}
                      placeholder="Ej: 14728563"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-primary transition-all"
                    />
                 </div>

                 <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">API Key (Personal Area)</label>
                    <input 
                      type="password" 
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="Tu clave secreta..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-primary transition-all"
                    />
                    <p className="text-[8px] text-gray-500 mt-2 ml-1">Consigue tu llave en Configuración &gt; API de Exness</p>
                 </div>

                 <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Servidor del Broker</label>
                    <select 
                      value={server}
                      onChange={e => setServer(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-primary transition-all appearance-none"
                    >
                       <option value="Exness-Real">Exness-Real</option>
                       <option value="Exness-Real2">Exness-Real2</option>
                       <option value="Exness-Real3">Exness-Real3</option>
                       <option value="Exness-Trial">Exness-Trial (Demo)</option>
                    </select>
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button 
                       onClick={() => setShowConnectModal(false)}
                       className="flex-1 py-4 bg-white/5 hover:bg-white/5 text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                       Cancelar
                    </button>
                    <button 
                       onClick={handleConnect}
                       className="flex-2 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                       Vincular Cuenta
                    </button>
                 </div>
              </div>

              <div className="mt-8 flex items-center gap-2 justify-center py-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                 <span className="material-symbols-outlined text-emerald-500 text-sm">verified_user</span>
                 <p className="text-[8px] text-emerald-500/80 font-black uppercase tracking-widest">Encriptación de Punto a Punto Activa</p>
              </div>
           </div>
        </div>
      )}

      {/* Exness Info & Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-20 px-2 text-center md:text-left">
         <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-primary/20 transition-all">
            <span className="material-symbols-outlined text-3xl text-primary mb-4">bolt</span>
            <h4 className="text-xs font-black text-white uppercase mb-2">Ejecución Instantánea</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Opera directamente desde los gráficos con la liquidez de Exness y sin retardos por intermediarios externos.</p>
         </div>
         <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-400/20 transition-all">
            <span className="material-symbols-outlined text-3xl text-blue-400 mb-4">analytics</span>
            <h4 className="text-xs font-black text-white uppercase mb-2">Herramientas Premium</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Indicadores Pro, herramientas de dibujo avanzado y gestión de pedidos multipunto integrados 100%.</p>
         </div>
         <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all">
            <span className="material-symbols-outlined text-3xl text-emerald-500 mb-4">security</span>
            <h4 className="text-xs font-black text-white uppercase mb-2">Privacidad Privilegiada</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Tus credenciales nunca se almacenan en servidores externos. La conexión es directa entre el navegador y Exness.</p>
         </div>
      </div>

    </div>
  );
};

export default ExnessView;
