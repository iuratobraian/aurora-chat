import React, { memo } from 'react';
import { Usuario } from '../types';

interface ProfileMenuProps {
  usuario: Usuario;
  onVisitProfile: () => void;
  onConfiguracion: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  onFollowers: () => void;
  onFollowing: () => void;
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = memo(({
  usuario,
  onVisitProfile,
  onConfiguracion,
  onToggleTheme,
  onLogout,
  onFollowers,
  onFollowing,
  isDark,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl shadow-2xl border border-white/10 py-3 animate-in fade-in slide-in-from-top-2 duration-500 z-[60] bg-white/90 dark:bg-black/90 backdrop-blur-3xl overflow-hidden">
      <div className="px-4 pb-3 border-b border-white/5 mb-2">
        <div className="flex items-center gap-3 mb-3">
          <img src={usuario.avatar} className="size-10 rounded-xl border border-white/10" alt="" loading="lazy" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">{usuario.nombre}</h4>
            <p className="text-[9px] text-gray-500 font-mono">@{usuario.usuario}</p>
          </div>
        </div>
        <div className="flex justify-between gap-1.5">
          <button onClick={onFollowers} className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-blue-500/10 rounded-lg py-1.5 flex flex-col items-center transition-colors">
            <span className="text-xs font-black text-gray-900 dark:text-white">{usuario.seguidores?.length || 0}</span>
            <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest">Seguidores</span>
          </button>
          <button onClick={onFollowing} className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-blue-500/10 rounded-lg py-1.5 flex flex-col items-center transition-colors">
            <span className="text-xs font-black text-gray-900 dark:text-white">{usuario.siguiendo?.length || 0}</span>
            <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest">Siguiendo</span>
          </button>
        </div>
      </div>

      <div className="px-1.5 space-y-0.5">
        <button
          onClick={onVisitProfile}
          className="w-full flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 hover:bg-blue-500/5 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-base">person</span>
          Mi Perfil
        </button>

        <button
          onClick={onConfiguracion}
          className="w-full flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 hover:bg-blue-500/5 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-base">settings</span>
          Configuración
        </button>

        <button
          onClick={onToggleTheme}
          className="w-full flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 hover:bg-blue-500/5 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-base">{isDark ? 'light_mode' : 'dark_mode'}</span>
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </button>

        <div className="h-px bg-gray-200 dark:bg-white/5 my-1.5 mx-3"></div>

        <button
          onClick={() => { onClose(); onLogout(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          Salir
        </button>
      </div>
    </div>
  );
});

ProfileMenu.displayName = 'ProfileMenu';

export default ProfileMenu;
