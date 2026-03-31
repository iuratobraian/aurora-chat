import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Comentario, Publicacion, Usuario } from '../types';
import CommentSection from './CommentSection';
import { PostCardHeader } from './postcard/PostCardHeader';
import { PostCardEditForm } from './postcard/PostCardEditForm';
import { PostCardZone } from './postcard/PostCardZone';
import { PostCardAIAgent } from './postcard/PostCardAIAgent';
import { PostCardMedia } from './postcard/PostCardMedia';
import { PostActions } from './postcard/PostActions';
import { ParticleBurst } from './postcard/ParticleBurst';
import { getTvImage } from './postcard/TradingViewPostWidget';
import { TrustLayer, TrustTier } from '../services/ranking/trustLayer';

export interface PostCardProps {
    post: Publicacion;
    usuario: Usuario | null;
    onLike: () => void;
    onUpdate: (post: Publicacion) => void;
    onDelete: () => void;
    onFollow: () => void;
    onVisitProfile: (id: string) => void;
    onReply: (postId: string, text: string, parentId?: string, imagenUrl?: string) => void;
    onLikeComment: (postId: string, commentId: string) => void;
    onGivePoints?: (postId: string, points: number) => void;
    onOpen?: () => void;
    onEdit?: (post: Publicacion) => void;
    fullView?: boolean;
    isNew?: boolean;
}

export const PostCard: React.FC<PostCardProps> = memo(({
    post,
    usuario,
    onLike,
    onUpdate,
    onDelete,
    onFollow,
    onVisitProfile,
    onReply,
    onLikeComment,
    onGivePoints,
    onOpen,
    onEdit,
    fullView = false,
    isNew = false
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showComments, setShowComments] = useState(fullView);
    const [showShareModal, setShowShareModal] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(false);
    const [loadingLike, setLoadingLike] = useState(false);
    const [isFollowingLocal, setIsFollowingLocal] = useState(
        (usuario?.siguiendo || []).includes(post.idUsuario) || false
    );
    const [showFullCommentsModal, setShowFullCommentsModal] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [showParticles, setShowParticles] = useState(isNew);
    const [hasLikeFlash, setHasLikeFlash] = useState(false);

    useEffect(() => {
        setIsFollowingLocal((usuario?.siguiendo || []).includes(post.idUsuario) || false);
    }, [usuario, post.idUsuario]);

    useEffect(() => {
        if (isNew) {
            setShowParticles(true);
            const t = setTimeout(() => setShowParticles(false), 900);
            return () => clearTimeout(t);
        }
    }, [isNew]);

    const isMe = usuario?.id === post.idUsuario;
    const isAdmin = usuario?.rol === 'admin' || usuario?.rol === 'ceo';
    const hasLiked = (post.likes || []).includes(usuario?.id || '');
    
    const savedPosts = useQuery(api.savedPosts.getSavedPosts, { userId: usuario?.id || '' });
    const hasSaved = savedPosts?.includes(post.id) || false;
    const savePostMutation = useMutation(api.savedPosts.savePost);
    const unsavePostMutation = useMutation(api.savedPosts.unsavePost);
    
    const handleSaveClick = async () => {
        if (!usuario?.id) return;
        try {
            if (hasSaved) {
                await unsavePostMutation({ userId: usuario.id, postId: post.id });
            } else {
                await savePostMutation({ userId: usuario.id, postId: post.id });
            }
        } catch (e) {
            console.error('Error saving post:', e);
        }
    };
    
    const isPinned = post.esAnuncio;
    const isGuest = !usuario || usuario.id === 'guest';
    const canEdit = isMe || isAdmin;

    const contentTrust = useMemo(() =>
        TrustLayer.getContentTrust(post, usuario as Partial<Usuario>),
        [post, usuario]
    );
    const trustTier = contentTrust.boosted
        ? 'expert'
        : (contentTrust.score > 50 ? 'verified' : contentTrust.score > 25 ? 'basic' : 'new') as TrustTier;

    const tvThumbnail = useMemo(() =>
        typeof post.tradingViewUrl === 'string' && post.tradingViewUrl
            ? getTvImage(post.tradingViewUrl)
            : null,
        [post.tradingViewUrl]
    );

    const borderClass = useMemo(() => {
        if (isPinned) return 'border-2 border-amber-300 dark:border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
        if (post.isAiAgent) return 'border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]';
        if (post.isSignal) return 'border-primary/40 shadow-[0_0_25px_rgba(37,99,235,0.15)] bg-gradient-to-br from-primary/[0.03] to-transparent';
        return 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10';
    }, [isPinned, post.isAiAgent, post.isSignal]);

    const animationClass = useMemo(() =>
        fullView ? '' : isNew ? 'animate-post-appear' : 'animate-in fade-in slide-in-from-bottom-2 duration-500',
        [fullView, isNew]
    );

    const handleLikeClick = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (loadingLike) return;
        setLoadingLike(true);
        setHasLikeFlash(true);
        try {
            await onLike();
        } finally {
            setTimeout(() => {
                setLoadingLike(false);
                setHasLikeFlash(false);
            }, 500);
        }
    };

    const handleFollowClick = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (loadingFollow) return;
        setLoadingFollow(true);
        try {
            await onFollow();
            setIsFollowingLocal(!isFollowingLocal);
        } finally {
            setTimeout(() => setLoadingFollow(false), 800);
        }
    };

    const handleDeleteWithEffect = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsExiting(true);
        setTimeout(() => onDelete(), 400);
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/post/${post.id}`;
        const shareText = `${post.nombreUsuario} en @TradeHub: "${post.contenido?.substring(0, 100)}..."`;

        if (navigator.share) {
            navigator.share({
                title: post.titulo || 'TradeShare Post',
                text: shareText,
                url: link,
            }).then(() => {
                setShowShareModal(false);
            }).catch((err) => {
                if (err.name !== 'AbortError') {
                    navigator.clipboard.writeText(link);
                    setShowShareModal(false);
                }
            });
        } else {
            navigator.clipboard.writeText(link);
            setShowShareModal(false);
        }
    };

    return (
        <div
            id={`post-${post.id}`}
            className={`relative glass rounded-[2rem] p-0 transition-all duration-500 ${borderClass} ${animationClass} ${isExiting ? 'animate-post-exit' : ''} overflow-hidden group mb-8 bg-black/40 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.1)] border border-white/5 hover:border-primary/20 hover:-translate-y-1 active:scale-[0.99]`}
        >
            {showParticles && <ParticleBurst />}

            <PostCardHeader
                post={post}
                usuario={usuario}
                isFollowing={isFollowingLocal}
                loadingFollow={loadingFollow}
                onFollow={() => { void handleFollowClick(); }}
                onVisitProfile={onVisitProfile}
                trustTier={trustTier}
                boosted={contentTrust.boosted}
                onEdit={() => setIsEditing(true)}
                onDelete={() => handleDeleteWithEffect()}
                isMe={isMe}
                isAdmin={isAdmin}
                isEditing={isEditing}
            />

            {/* Content Section */}
            <div
                className={`px-4 py-2 ${onOpen ? 'cursor-pointer hover:bg-gray-50/10 transition-colors' : ''} ${isGuest ? 'blur-sensitive relative' : ''}`}
                onClick={() => onOpen?.()}
            >
                {isGuest && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/5 backdrop-blur-[1px] rounded-xl pointer-events-auto">
                        <span className="material-symbols-outlined text-4xl text-primary mb-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">lock</span>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Inicia sesión para ver este contenido</p>
                    </div>
                )}

                {isEditing ? (
                    <PostCardEditForm
                        post={{
                            ...post,
                            zonaOperativa: post.zonaOperativa?.inicio && post.zonaOperativa?.fin
                                ? { inicio: post.zonaOperativa.inicio, fin: post.zonaOperativa.fin }
                                : undefined,
                        }}
                        onSave={(updated) => { onUpdate(updated); setIsEditing(false); }}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : post.isAiAgent ? (
                    <PostCardAIAgent post={post} />
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="flex-1">
                            {post.isSignal && (
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1 shadow-lg shadow-primary/20">
                                        <span className="material-symbols-outlined text-[10px]">analytics</span>
                                        Señal de Trading
                                    </span>
                                    {post.signalDetails?.direction && (
                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded ${post.signalDetails.direction === 'buy' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {post.signalDetails.direction}
                                        </span>
                                    )}
                                </div>
                            )}
                            {post.titulo && post.titulo !== post.contenido && (
                                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-1.5 flex items-center gap-2 group/title">
                                    {post.titulo}
                                </h3>
                            )}
                            <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {post.contenido}
                            </p>

                            {/* Signal Details Visual Box */}
                            {post.isSignal && post.signalDetails && (
                                <div className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-left-2 duration-500">
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-gray-400 uppercase block tracking-widest">Entry</span>
                                        <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">{post.signalDetails.entryPrice || 'PENDING'}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-gray-400 uppercase block tracking-widest">Stop Loss</span>
                                        <span className="text-xs font-mono font-bold text-red-500">{post.signalDetails.stopLoss || 'N/A'}</span>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <span className="text-[8px] font-black text-gray-400 uppercase block tracking-widest">Targets (TP)</span>
                                        <div className="flex flex-wrap gap-2">
                                            {post.signalDetails.takeProfits?.map((tp, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
                                                    <span className="text-[7px] font-black text-emerald-500/60 uppercase">TP{idx+1}</span>
                                                    <span className="text-[10px] font-mono font-bold text-emerald-500">{tp}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Media Section */}
            {!isEditing && (
                <PostCardMedia
                    videoUrl={post.videoUrl}
                    imagenUrl={typeof post.imagenUrl === 'string' ? post.imagenUrl : undefined}
                    titulo={post.titulo}
                    usuarioManejo={post.usuarioManejo}
                    isGuest={isGuest}
                    likes={post.likes || []}
                    commentsCount={post.comentarios?.length || 0}
                    compartidos={post.compartidos}
                    hasLiked={hasLiked}
                    hasSaved={hasSaved}
                    canEdit={isMe || isAdmin}
                    onLike={(e) => { void handleLikeClick(e); }}
                    onComments={() => setShowComments(!showComments)}
                    onShare={() => setShowShareModal(true)}
                    onSave={handleSaveClick}
                    onEdit={() => setIsEditing(true)}
                    onDelete={() => handleDeleteWithEffect()}
                    showComments={showComments}
                    likeFlash={hasLikeFlash}
                    postId={post.id}
                    postPoints={(post as any).puntos || 0}
                    userPointsGiven={(post as any).userPuntosGiven || 0}
                    usuario={usuario}
                    onGivePoints={onGivePoints || (() => {})}
                    allowExpand={fullView}
                />
            )}

            {/* Action Buttons - Premium Action Bar */}
            {!isEditing && (
                <>
                    <PostCardZone
                        tipo={post.tipo}
                        par={post.par}
                        zonaOperativa={post.zonaOperativa?.inicio && post.zonaOperativa?.fin
                            ? { inicio: post.zonaOperativa.inicio, fin: post.zonaOperativa.fin }
                            : undefined}
                    />
                    {/* Solo mostrar PostActions aquí si NO hay media (porque PostCardMedia ya los tiene en overlay) */}
                    {!(post.datosGrafico && post.datosGrafico.length > 0) && (
                        <div className="border-t border-gray-100 dark:border-white/5 bg-gray-50/10 dark:bg-white/[0.01]">
                            <PostActions
                                likes={(post as any).likes || []}
                                commentsCount={(post.comentarios as any[])?.length || 0}
                                compartidos={post.compartidos || 0}
                                 hasLiked={hasLiked}
                                hasSaved={post.id.startsWith('saved_')}
                                canEdit={canEdit}
                                onLike={handleLikeClick}
                                onComments={() => setShowComments(!showComments)}
                                onShare={() => setShowShareModal(true)}
                                onSave={handleSaveClick}
                                onEdit={() => {
                                    if (onEdit) onEdit(post);
                                    else setIsEditing(true);
                                }}
                                onDelete={handleDeleteWithEffect}
                                showComments={showComments}
                                likeFlash={hasLikeFlash}
                                postId={post.id}
                                postPoints={(post as any).puntos || 0}
                                userPointsGiven={(post as any).userPuntosGiven || 0}
                                usuario={usuario}
                                onGivePoints={onGivePoints || (() => {})}
                                authorName={post.usuarioManejo}
                                variant="flat"
                            />
                        </div>
                    )}
                </>
            )}

            {/* Comments Section */}
            {showComments && (
                <div className="px-4 pb-4 bg-gray-50/50 dark:bg-black/5 border-t border-gray-50 dark:border-white/5">
                    <CommentSection
                        comments={(post.comentarios as Comentario[] | undefined) || []}
                        postId={post.id}
                        onReply={onReply}
                        onLikeComment={onLikeComment}
                        cerrados={post.comentariosCerrados}
                        usuario={usuario}
                    />
                    {post.comentarios && post.comentarios.length > 5 && (
                        <button
                            onClick={() => setShowFullCommentsModal(true)}
                            className="w-full py-2 mt-2 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-primary transition-colors border border-dashed border-gray-200 dark:border-white/10 rounded-lg"
                        >
                            Ver todos los {post.comentarios.length} comentarios
                        </button>
                    )}
                </div>
            )}

            {/* Full Comments Modal */}
            {showFullCommentsModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-lg glass rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] bg-white dark:bg-[#111] border border-white/10">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">chat</span>
                                <h3 className="font-black text-xs text-gray-900 dark:text-white uppercase tracking-widest">Comentarios</h3>
                            </div>
                            <button
                                onClick={() => setShowFullCommentsModal(false)}
                                className="size-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-all text-gray-900 dark:text-white"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                            <CommentSection
                                comments={(post.comentarios as Comentario[] | undefined) || []}
                                postId={post.id}
                                onReply={onReply}
                                onLikeComment={onLikeComment}
                                cerrados={post.comentariosCerrados}
                                usuario={usuario}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
                    <div className="bg-white dark:bg-[#1a1d21] rounded-xl p-6 w-full max-w-sm border border-gray-200 dark:border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="font-black text-sm text-gray-900 dark:text-white mb-4 uppercase tracking-widest">Compartir Publicación</h3>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCopyLink}
                                className="flex-1 py-3 bg-primary/10 text-primary rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">link</span>
                                Copiar Link
                            </button>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="px-4 py-3 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-xs font-black"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default PostCard;
