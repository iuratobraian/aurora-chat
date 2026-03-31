import React from 'react';
import { Usuario } from '../../types';
import { LevelBadge } from '../../components/Gamification';
import { Avatar } from '../../components/Avatar';

interface ProfileHeaderProps {
  profileUser: Usuario;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onVisitProfile: (id: string) => void;
  stats: {
    posts: number;
    followers: number;
    following: number;
    accuracy: number;
  };
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileUser,
  isOwnProfile,
  isFollowing,
  onFollow,
  onVisitProfile,
  stats
}) => {
  const {
    avatar,
    nombre,
    usuario,
    esVerificado,
    esPro,
    biografia,
    instagram,
    fechaRegistro,
    level = 1,
    xp = 0,
    badges = [],
    rol = 'user'
  } = profileUser;

  const isCreator = ['admin', 'ceo', 'colaborador', 'creator'].includes(rol);
  const isPremium = isCreator || esPro;

  return (
    <div className="relative">
      {/* Banner - Premium Creator Style */}
      <div 
        className={`h-32 sm:h-40 md:h-48 rounded-2xl mb-16 sm:mb-20 relative overflow-hidden ${
          isCreator 
            ? 'bg-gradient-to-r from-amber-500/30 via-purple-500/20 to-amber-500/30' 
            : esPro 
            ? 'bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20'
            : 'bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20'
        }`}
      >
        {profileUser.banner ? (
          <img src={profileUser.banner} alt="" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        )}
        
        {/* Creator Badge Overlay */}
        {isCreator && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg shadow-amber-500/30">
            <span className="material-symbols-outlined text-white text-sm">verified</span>
            <span className="text-white text-[10px] font-black uppercase tracking-wider">Creador</span>
          </div>
        )}
        
        {/* Glow Effect for Creator */}
        {isCreator && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        )}
      </div>

      {/* Avatar - Premium Glow for Creators */}
      <div className="absolute top-24 sm:top-28 left-4 sm:left-6">
        <div className="relative">
          {isCreator && (
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-full blur-md animate-pulse" />
          )}
          <Avatar
            src={avatar}
            name={nombre}
            seed={usuario}
            size="2xl"
            rounded="full"
            className={`border-4 relative z-10 ${isCreator ? 'border-amber-500' : 'border-[#0f1115]'}`}
          />
          {isCreator ? (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-1.5 shadow-lg shadow-amber-500/40 z-20">
              <span className="material-symbols-outlined text-white text-sm">star</span>
            </div>
          ) : esPro ? (
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1.5">
              <span className="text-white text-xs">PRO</span>
            </div>
          ) : esVerificado ? (
            <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
              <span className="material-symbols-outlined text-white text-xs">verified</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                {nombre}
              </h1>
              {esVerificado && (
                <span className="text-primary text-xl">✓</span>
              )}
            </div>
            <p className="text-white/50 text-sm mb-2">@{usuario}</p>
            
            {/* Level & XP */}
            <div className="flex items-center gap-2 mb-3">
              <LevelBadge level={level} size="sm" />
              <span className="text-white/60 text-xs">
                {xp.toLocaleString()} XP
              </span>
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex items-center gap-1 mb-3">
                {badges.slice(0, 5).map((badge, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    {typeof badge === 'string' ? badge.charAt(0) : '🏆'}
                  </div>
                ))}
                {badges.length > 5 && (
                  <span className="text-white/40 text-xs">+{badges.length - 5}</span>
                )}
              </div>
            )}

            {/* Bio */}
            {biografia && (
              <p className="text-white/70 text-sm mb-3">{biografia}</p>
            )}

            {/* Instagram */}
            {instagram && (
              <a 
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-white/50 text-xs hover:text-primary transition-colors mb-2"
              >
                <span className="material-symbols-outlined text-sm">alternate_email</span>
                @{instagram}
              </a>
            )}

            {/* Join Date */}
            <p className="text-white/30 text-xs">
              Miembro desde {fechaRegistro ? new Date(fechaRegistro).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : 'recientemente'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isOwnProfile && (
              <button
                onClick={onFollow}
                className={`px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                  isFollowing
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-primary text-white hover:bg-primary/80'
                }`}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            )}
            <button
              onClick={() => onVisitProfile(profileUser.id)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-all"
            >
              <span className="material-symbols-outlined">open_in_new</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 py-3 border-t border-white/5">
          <div className="text-center">
            <p className="text-white font-black text-lg">{stats.posts}</p>
            <p className="text-white/40 text-xs uppercase">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-white font-black text-lg">{stats.followers}</p>
            <p className="text-white/40 text-xs uppercase">Seguidores</p>
          </div>
          <div className="text-center">
            <p className="text-white font-black text-lg">{stats.following}</p>
            <p className="text-white/40 text-xs uppercase">Siguiendo</p>
          </div>
          {stats.accuracy > 0 && (
            <div className="text-center">
              <p className={`font-black text-lg ${
                stats.accuracy >= 60 ? 'text-emerald-400' : 
                stats.accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {stats.accuracy}%
              </p>
              <p className="text-white/40 text-xs uppercase">Accuracy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
