import React from 'react';
import { AchievementInfo } from '../../components/Gamification';
import { Usuario } from '../../types';

interface ProfileMedalsTabProps {
    profileUser: Usuario;
    userAchievements: AchievementInfo[];
    achievementsProgress: AchievementInfo[];
}

export const ProfileMedalsTab: React.FC<ProfileMedalsTabProps> = ({
    profileUser,
    userAchievements,
    achievementsProgress,
}) => {
    const totalAchievements = userAchievements.length + achievementsProgress.length;
    const totalXP = userAchievements.reduce((sum, a) => sum + (a.points || 0), 0);

    return (
        <div className="space-y-6">
            {/* Achievement Stats */}
            <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">emoji_events</span>
                        Progreso de Logros
                    </h3>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="text-white/60">
                            <span className="font-black text-signal-green">{userAchievements.length}</span> / {totalAchievements}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-400 font-black">
                            {totalXP} XP
                        </span>
                    </div>
                </div>
                
                {/* Unlocked Achievements */}
                {userAchievements.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-signal-green mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            Desbloqueados ({userAchievements.length})
                        </h4>
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {userAchievements.map(a => (
                                <div key={a.id} className="aspect-square glass rounded-xl p-2 border border-white/10 flex items-center justify-center">
                                    <span className="text-3xl">{a.icon}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* In Progress Achievements */}
                {achievementsProgress.length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs">trending_up</span>
                            En Progreso ({achievementsProgress.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {achievementsProgress.slice(0, 6).map(a => (
                                <div 
                                    key={a.id}
                                    className="glass rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-all group"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <span className="text-2xl grayscale opacity-50">{a.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h5 className="text-sm font-black text-white truncate">{a.name}</h5>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase flex-shrink-0 ${
                                                    a.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    a.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                                                    a.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                    {a.rarity}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-white/40 line-clamp-1">{a.desc}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="text-xs font-black text-yellow-400">+{a.points}</span>
                                            <p className="text-[9px] text-white/30">XP</p>
                                        </div>
                                    </div>
                                    {a.progress !== undefined && a.target !== undefined && (
                                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-primary to-signal-green rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min((a.current || 0) / a.target * 100, 100)}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Manual Medals */}
            <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-xs font-black uppercase tracking-widest text-signal-green mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">military_tech</span>
                    Medallas Especiales
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {(profileUser.medallas || []).length > 0 ? (
                        profileUser.medallas?.map(m => (
                            <div 
                                key={m.id} 
                                className="glass rounded-2xl p-6 border border-white/10 text-center flex flex-col items-center justify-center aspect-square group hover:border-signal-green/30 hover:bg-white/5 transition-all hover:scale-105 cursor-default"
                            >
                                <span className="text-5xl mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-all drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{m.icono}</span>
                                <h4 className="text-sm font-black text-white mb-1 leading-tight tracking-widest">{m.nombre}</h4>
                                <p className="text-[10px] text-white/40 line-clamp-2">{m.descripcion}</p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10">
                            <div className="size-16 mx-auto mb-3 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <span className="material-symbols-outlined text-3xl text-white/20">military_tech</span>
                            </div>
                            <p className="text-xs text-white/40">Las medallas otorgadas por la administración aparecerán aquí.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {userAchievements.length === 0 && achievementsProgress.length === 0 && (profileUser.medallas || []).length === 0 && (
                <div className="glass rounded-2xl p-12 text-center border border-white/10">
                    <div className="size-20 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                        <span className="material-symbols-outlined text-4xl text-white/20">emoji_events</span>
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">Sin logros aún</h3>
                    <p className="text-sm text-white/40">Participa activamente para desbloquear logros.</p>
                </div>
            )}
        </div>
    );
};

export default ProfileMedalsTab;
