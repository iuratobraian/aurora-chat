
import React from 'react';
import { Usuario } from '../types';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  usuario: Usuario | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ usuario, onLogin, onRegister, onLogout }) => {
  return (
    <header className="h-20 flex items-center justify-between px-6 lg:px-12 border-b border-border-dark bg-background-dark/50 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-primary/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="material-symbols-outlined text-white font-black text-2xl relative z-10">dynamic_form</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">TradePortal</h1>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-primary font-bold tracking-widest uppercase">Digital Engine v3.0</span>
            {usuario?.rol === 'admin' && <span className="bg-red-500/20 text-red-500 text-[8px] font-black px-1.5 rounded border border-red-500/30">ADMIN</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <LanguageSelector />
        {!usuario ? (
          <div className="flex items-center gap-2">
            <button onClick={onLogin} className="px-5 py-2 text-xs font-bold text-gray-400 hover:text-white transition-all">Log In</button>
            <button onClick={onRegister} className="px-6 py-2.5 text-xs font-bold bg-white text-black rounded-xl shadow-xl hover:scale-105 transition-all">Register</button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col text-right">
                <p className="text-xs font-black text-white">{usuario.nombre}</p>
                <p className="text-[10px] text-gray-500 font-mono">@{usuario.usuario}</p>
             </div>
             <div className="relative group">
                <img src={usuario.avatar} className="size-11 rounded-2xl border-2 border-white/5 group-hover:border-primary transition-all cursor-pointer" alt="Me" />
                <div className="absolute top-full right-0 mt-2 w-48 glass rounded-2xl p-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-2xl border border-white/10">
                   <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                      <span className="material-symbols-outlined text-[18px]">logout</span> Cerrar Sesión
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
