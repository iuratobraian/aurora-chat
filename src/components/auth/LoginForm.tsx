import React from 'react';
import { GlowCard } from '../ui/GlowCard';
import { GalaxyButton } from '../ui/GalaxyButton';

interface LoginFormProps {
  onLogin: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  formData,
  setFormData,
  onSwitchToRegister,
  onForgotPassword
}) => {
  return (
    <form onSubmit={onLogin} className="space-y-4 w-full animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Identidad</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-lg">terminal</span>
          <input
            type="text"
            required
            value={formData.usuario}
            onChange={e => setFormData({ ...formData, usuario: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all"
            placeholder="Usuario o Email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contraseña</label>
          <button 
            type="button" 
            onClick={onForgotPassword}
            className="text-[9px] font-bold text-primary hover:text-blue-400 transition-colors"
          >
            ¿Olvidaste tu acceso?
          </button>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-lg">lock</span>
          <input
            type="password"
            required
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <GalaxyButton type="submit" className="w-full mt-4">
        <span className="material-symbols-outlined text-lg">login</span>
        Conectar Terminal
      </GalaxyButton>

      <div className="text-center pt-4">
        <button 
          type="button"
          onClick={onSwitchToRegister}
          className="text-[11px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
        >
          ¿No tienes cuenta? <span className="text-primary">Registrarse</span>
        </button>
      </div>
    </form>
  );
};
