import React from 'react';
import { Usuario } from '../../types';
import LanguageSelector from '../../components/LanguageSelector';
import AppearancePanel from '../../components/AppearancePanel';

interface ProfileConfigProps {
  usuario: Usuario;
  onUpdate: (u: Usuario) => void;
}

export const ProfileConfig: React.FC<ProfileConfigProps> = ({ usuario, onUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Language */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-black uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">translate</span>
          Idioma
        </h3>
        <LanguageSelector />
      </div>

      {/* Appearance */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-black uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">palette</span>
          Apariencia
        </h3>
        <AppearancePanel userId={usuario.id} />
      </div>

      {/* Account Settings */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-black uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">manage_accounts</span>
          Cuenta
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider">
              Email
            </label>
            <p className="text-white mt-1">{usuario.email || 'No configurado'}</p>
          </div>
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider">
              Nombre de usuario
            </label>
            <p className="text-white mt-1">@{usuario.usuario}</p>
          </div>
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider">
              Plan
            </label>
            <p className="text-white mt-1">
              {usuario.esPro ? (
                <span className="text-yellow-400">⭐ PRO</span>
              ) : (
                <span>Gratuito</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-black uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">security</span>
          Privacidad
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/70">Perfil público</span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="toggle toggle-primary"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/70">Mostrar estadísticas</span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="toggle toggle-primary"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white/70">Notificaciones por email</span>
            <input 
              type="checkbox" 
              defaultChecked 
              className="toggle toggle-primary"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProfileConfig;
