import React, { useState } from 'react';
import { GalaxyButton } from '../ui/GalaxyButton';

interface RegisterFormProps {
  onRegister: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  onSwitchToLogin: () => void;
  checkingUsername: boolean;
  usernameAvailable: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegister,
  formData,
  setFormData,
  onSwitchToLogin,
  checkingUsername,
  usernameAvailable
}) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <form onSubmit={onRegister} className="space-y-4 w-full animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          required
          value={formData.nombre}
          onChange={e => setFormData({ ...formData, nombre: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all"
          placeholder="Nombre"
        />
        <div className="relative">
          <input
            type="text"
            required
            value={formData.usuario}
            onChange={e => setFormData({ ...formData, usuario: e.target.value.toLowerCase() })}
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all ${!usernameAvailable && formData.usuario.length >= 3 ? 'border-red-500/50' : 'border-white/10'}`}
            placeholder="Usuario"
          />
          {checkingUsername && <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin material-symbols-outlined text-xs text-primary">sync</span>}
        </div>
      </div>

      <input
        type="email"
        required
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all"
        placeholder="Email@ejemplo.com"
      />

      <input
        type="password"
        required
        value={formData.password}
        onChange={e => setFormData({ ...formData, password: e.target.value })}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none transition-all"
        placeholder="Contraseña (mín 6 carac.)"
      />

      <div className="flex items-center gap-3 px-1">
        <input 
          type="checkbox" 
          id="terms" 
          checked={agreed} 
          onChange={e => setAgreed(e.target.checked)} 
          className="accent-primary size-4 rounded"
        />
        <label htmlFor="terms" className="text-[10px] text-gray-400 font-bold leading-tight">
          Acepto los <span className="text-primary hover:underline cursor-pointer">Términos y Condiciones</span> de TradeShare.
        </label>
      </div>

      <GalaxyButton type="submit" className="w-full" disabled={!agreed}>
        <span className="material-symbols-outlined text-lg">person_add</span>
        Unirse a la Comunidad
      </GalaxyButton>

      <div className="text-center pt-2">
        <button 
          type="button"
          onClick={onSwitchToLogin}
          className="text-[11px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
        >
          ¿Ya tienes cuenta? <span className="text-primary">Conectar</span>
        </button>
      </div>
    </form>
  );
};
