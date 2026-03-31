import React from 'react';
import { Avatar } from '../../components/Avatar';
import LanguageSelector from '../../components/LanguageSelector';
import AppearancePanel from '../../components/AppearancePanel';
import { Usuario } from '../../types';

interface ProfileConfigTabProps {
    usuario: Usuario;
    nombre: string;
    biografia: string;
    avatarUrl: string;
    bannerUrl: string;
    instagram: string;
    isUploadingAvatar: boolean;
    saveStatus: string;
    seedSearch: string;
    instagramUserForAvatar: string;
    onNombreChange: (value: string) => void;
    onBiografiaChange: (value: string) => void;
    onAvatarUrlChange: (value: string) => void;
    onBannerUrlChange: (value: string) => void;
    onInstagramChange: (value: string) => void;
    onSeedSearchChange: (value: string) => void;
    onInstagramUserForAvatarChange: (value: string) => void;
    onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFetchInstagramAvatar: () => void;
    onSave: () => void;
}

export const ProfileConfigTab: React.FC<ProfileConfigTabProps> = ({
    usuario,
    nombre,
    biografia,
    avatarUrl,
    bannerUrl,
    instagram,
    isUploadingAvatar,
    saveStatus,
    seedSearch,
    instagramUserForAvatar,
    onNombreChange,
    onBiografiaChange,
    onAvatarUrlChange,
    onBannerUrlChange,
    onInstagramChange,
    onSeedSearchChange,
    onInstagramUserForAvatarChange,
    onAvatarUpload,
    onFetchInstagramAvatar,
    onSave,
}) => {
    const avatarSeeds = ['Felix', 'Aneka', 'Zac', 'Lola', 'Jack', 'Eden', 'Maria', 'Max', 'Luna', 'Oliver'];
    const filteredSeeds = seedSearch ? avatarSeeds.concat(seedSearch) : avatarSeeds;

    return (
        <div className="glass rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-lg font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">edit</span>
                Editar Perfil
            </h3>

            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Nombre</label>
                    <input
                        value={nombre}
                        onChange={e => onNombreChange(e.target.value)}
                        className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all"
                        placeholder="Tu nombre..."
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Biografía</label>
                    <textarea
                        value={biografia}
                        onChange={e => onBiografiaChange(e.target.value)}
                        className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all resize-none h-32"
                        placeholder="Escribe sobre ti..."
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Avatar Personalizado</label>
                    <div className="flex gap-4 mt-2 mb-4 items-center">
                        <div className="relative group/avatar cursor-pointer">
                            <Avatar 
                                src={avatarUrl}
                                name={nombre}
                                seed={usuario?.usuario || 'default'}
                                size="2xl"
                                rounded="full"
                                frame={usuario?.avatarFrame}
                                className={`border-2 border-white/10 group-hover/avatar:border-primary/50 transition-all ${isUploadingAvatar ? 'opacity-50' : ''}`}
                            />
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white text-xl">upload</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onAvatarUpload}
                                disabled={isUploadingAvatar}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                title="Subir imagen desde PC"
                            />
                            {isUploadingAvatar && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-white/40 font-bold uppercase mb-2">O ingresa URL:</p>
                            <input
                                value={avatarUrl}
                                onChange={e => onAvatarUrlChange(e.target.value)}
                                className="w-full bg-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all"
                                placeholder="URL de imagen..."
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-white/40 font-bold uppercase mt-4 mb-2">Generar desde Instagram:</p>
                    <div className="flex gap-2 mb-4">
                        <input
                            value={instagramUserForAvatar}
                            onChange={e => onInstagramUserForAvatarChange(e.target.value)}
                            className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all"
                            placeholder="Usuario sin @"
                        />
                        <button 
                            onClick={onFetchInstagramAvatar} 
                            className="px-5 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-pink-500/30 hover:scale-105 shadow-lg shadow-pink-500/10"
                        >
                            Extraer
                        </button>
                    </div>

                    <p className="text-[10px] text-white/40 font-bold uppercase mt-4 mb-3">O busca un estilo de avatar:</p>
                    <input
                        value={seedSearch}
                        onChange={e => onSeedSearchChange(e.target.value)}
                        className="w-full bg-white/5 rounded-xl px-4 py-2 mb-4 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all"
                        placeholder="Escribe cualquier nombre para ver opciones..."
                    />
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {filteredSeeds.map(seed => (
                            <Avatar
                                key={seed}
                                name={seed}
                                seed={seed}
                                size="lg"
                                rounded="full"
                                className="cursor-pointer hover:ring-2 ring-primary hover:scale-110 transition-all border border-white/10 hover:border-primary/50"
                                onClick={() => onAvatarUrlChange(seed)}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Banner de Perfil</label>
                    <input
                        value={bannerUrl}
                        onChange={e => onBannerUrlChange(e.target.value)}
                        className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all"
                        placeholder="URL de imagen de fondo..."
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Instagram</label>
                    <div className="relative mt-2">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">@</span>
                        <input
                            value={instagram.replace('https://instagram.com/', '')}
                            onChange={e => onInstagramChange(`https://instagram.com/${e.target.value}`)}
                            className="w-full bg-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none border border-white/10 focus:border-primary/50 focus:bg-white/5 transition-all"
                            placeholder="usuario"
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                    <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">language</span>
                                <div>
                                    <p className="text-sm font-bold text-white">Idioma</p>
                                    <p className="text-xs text-white/40">Selecciona tu idioma preferido</p>
                                </div>
                            </div>
                        </div>
                        <LanguageSelector variant="buttons" className="flex-wrap" />
                    </div>

                    <div className="mb-4">
                        <AppearancePanel userId={usuario.id} />
                    </div>

                    <button
                        onClick={onSave}
                        className="w-full py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] border border-primary/50"
                    >
                        Guardar Cambios
                    </button>
                    {saveStatus && (
                        <div className="text-center mt-4 text-signal-green text-xs font-black uppercase animate-pulse flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {saveStatus}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileConfigTab;
