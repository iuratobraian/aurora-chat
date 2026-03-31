import React, { memo, useState } from 'react';
import { Usuario, BadgeType } from '../../types';
import { Avatar } from '../Avatar';
import { TrustTier } from '../../services/ranking/trustLayer';

interface PostCardHeaderProps {
    post: {
        idUsuario: string;
        nombreUsuario: string;
        usuarioManejo: string;
        avatarUsuario?: string;
        avatarFrame?: string;
        tiempo?: string;
        categoria?: string;
        esVerificado?: boolean;
        isAiAgent?: boolean;
        esAnuncio?: boolean;
        reputationSnapshot?: number;
        badgesSnapshot?: BadgeType[];
    };
    usuario: Usuario | null;
    isFollowing: boolean;
    loadingFollow: boolean;
    onFollow: () => void;
    onVisitProfile: (id: string) => void;
    onEdit: () => void;
    onDelete: () => void;
    isMe: boolean;
    isAdmin: boolean;
    isEditing: boolean;
    trustTier?: TrustTier;
    boosted?: boolean;
}

const renderBadges = (badges: BadgeType[]) => {
    return badges.map(b => {
        switch (b) {
            case 'TopAnalyst': return <span key={b} title="Top Analyst" className="material-symbols-outlined text-[10px] text-amber-500">trophy</span>;
            case 'Verified': return <span key={b} title="Verified Trader" className="material-symbols-outlined text-[10px] text-blue-500">verified</span>;
            case 'EarlyBird': return <span key={b} title="Early Adopter" className="material-symbols-outlined text-[10px] text-teal-500">flight_takeoff</span>;
            case 'Whale': return <span key={b} title="Whale" className="material-symbols-outlined text-[10px] text-purple-500">water</span>;
            case 'Influencer': return <span key={b} title="Influencer" className="material-symbols-outlined text-[10px] text-pink-500">groups</span>;
            case 'RisingStar': return <span key={b} title="Rising Star" className="material-symbols-outlined text-[10px] text-signal-green">trending_up</span>;
            default: return null;
        }
    });
};

export const PostCardHeader: React.FC<PostCardHeaderProps> = memo(({
    post,
    usuario,
    isFollowing,
    loadingFollow,
    onFollow,
    onVisitProfile,
    onEdit,
    onDelete,
    isMe,
    isAdmin,
    isEditing,
    trustTier,
    boosted
}) => {
    const reputation = post.reputationSnapshot || 50;
    const badges = post.badgesSnapshot || [];
    const isPinned = post.esAnuncio;
    const isAd = post.esAnuncio && post.idUsuario === 'system';

    return (
        <div className="p-4 pb-2 flex items-start justify-between">
            <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center size-10 mt-1 ml-1 mr-1">
                    {/* Electric Loader ring */}
                    <div className="absolute -inset-[3px] rounded-full border-[2px] border-transparent border-t-primary border-r-violet-500 animate-[spin_3s_linear_infinite] opacity-60 z-0 pointer-events-none" />
                    <div className="absolute -inset-[3px] rounded-full border-[2px] border-transparent border-b-cyan-400 border-l-primary animate-[spin_4s_linear_infinite_reverse] opacity-60 z-0 pointer-events-none" />

                    <div onClick={() => onVisitProfile(post.idUsuario)} className="cursor-pointer relative z-10">
                        <Avatar
                            src={post.avatarUsuario}
                            name={post.nombreUsuario}
                            seed={post.idUsuario}
                            size="md"
                            rounded="full"
                            frame={post.avatarFrame}
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-black/90 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full border border-white/20 z-20 shadow-lg shadow-black/50">
                        {reputation}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-1.5">
                        <h4
                            className="font-black text-[13px] text-gray-900 dark:text-white cursor-pointer flex items-center gap-1"
                            onClick={() => onVisitProfile(post.idUsuario)}
                        >
                            {post.nombreUsuario}
                            {(post.esVerificado || badges.includes('Verified')) && (
                                <div className="relative flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[16px] text-blue-500 fill-current animate-pulse-slow" title="Usuario Verificado">verified</span>
                                    <div className="absolute inset-0 bg-blue-500/20 blur-[4px] rounded-full"></div>
                                </div>
                            )}
                            {post.isAiAgent && (
                                <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[7px] font-black uppercase tracking-widest rounded flex items-center gap-0.5 shadow-sm">
                                    <span className="material-symbols-outlined text-[9px]">smart_toy</span>
                                    IA
                                </span>
                            )}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium">@{post.usuarioManejo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            (post.categoria as string) === 'Analisis' ? 'bg-blue-500/10 text-blue-500' :
                            (post.categoria as string) === 'Idea' ? 'bg-amber-500/10 text-amber-500' :
                            (post.categoria as string) === 'Estrategia' ? 'bg-emerald-500/10 text-emerald-500' :
                            (post.categoria as string) === 'Psicología' ? 'bg-purple-500/10 text-purple-500' :
                            'bg-gray-500/10 text-gray-500'
                        }`}>
                            <span className="material-symbols-outlined text-[10px]">
                                {(post.categoria as string) === 'Analisis' ? 'bar_chart' :
                                 (post.categoria as string) === 'Idea' ? 'lightbulb' :
                                 (post.categoria as string) === 'Estrategia' ? 'trending_up' :
                                 (post.categoria as string) === 'Psicología' ? 'psychology' :
                                 (post.categoria as string) === 'Noticia' ? 'newspaper' :
                                 (post.categoria as string) === 'Recurso' ? 'folder' :
                                 (post.categoria as string) === 'Ayuda' ? 'help' :
                                 (post.categoria as string) === 'Comunidad' ? 'group' : 'apps'}
                            </span>
                            {post.categoria}
                        </span>
                        {isAd && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-500/15 text-purple-400 text-[8px] font-black uppercase tracking-widest rounded border border-purple-500/20">
                                <span className="material-symbols-outlined text-[10px]">campaign</span>
                                Patrocinado
                            </span>
                        )}
                        {isPinned && !isAd && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/15 text-amber-500 text-[8px] font-black uppercase tracking-widest rounded border border-amber-500/20">
                                <span className="material-symbols-outlined text-[10px]">push_pin</span>
                                Destacado
                            </span>
                        )}
                        {boosted && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-cyan-500/15 text-cyan-400 text-[8px] font-black uppercase tracking-widest rounded border border-cyan-500/20">
                                <span className="material-symbols-outlined text-[10px]">rocket_launch</span>
                                Boost
                            </span>
                        )}
                        {trustTier && trustTier !== 'new' && (
                            <span className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded border ${
                                trustTier === 'elite' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' :
                                trustTier === 'expert' ? 'bg-purple-500/15 text-purple-400 border-purple-500/20' :
                                trustTier === 'verified' ? 'bg-green-500/15 text-green-400 border-green-500/20' :
                                'bg-blue-500/15 text-blue-400 border-blue-500/20'
                            }`}>
                                <span className="material-symbols-outlined text-[10px]">workspace_premium</span>
                                {trustTier === 'elite' ? 'Élite' : trustTier === 'expert' ? 'Experto' : trustTier === 'verified' ? 'Verificado' : 'Básico'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                {!isMe && usuario && !post.isAiAgent && (
                    <button
                        onClick={onFollow}
                        disabled={loadingFollow}
                        title={isFollowing ? 'Dejar de seguir' : 'Seguir'}
                        className={`px-3 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all duration-200 ${
                            loadingFollow ? 'animate-electric ring-2 ring-primary/50' : ''
                        } ${
                            isFollowing
                                ? 'bg-signal-green/20 text-signal-green hover:bg-red-500/20 hover:text-red-400 border border-signal-green/30'
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/30'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-sm ${loadingFollow ? 'animate-spin' : ''}`}>
                            {loadingFollow ? 'sync' : (isFollowing ? 'check' : 'person_add')}
                        </span>
                        <span>{isFollowing ? 'Siguiendo' : 'Seguir'}</span>
                    </button>
                )}

                {(isMe || isAdmin) && !isEditing && !isAd && (
                    <div className="flex items-center gap-1 opacity-0 group-hover/btn:opacity-100 transition-opacity">
                        <button onClick={onEdit} className="p-1 px-2 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={onDelete} className="p-1 px-2 hover:bg-alert-red/10 rounded text-gray-400 hover:text-alert-red transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </div>
                )}
                {isAd && isAdmin && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={onDelete} className="p-1 px-2 hover:bg-alert-red/10 rounded text-gray-400 hover:text-alert-red transition-colors" title="Eliminar (edita desde Admin)">
                            <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default PostCardHeader;