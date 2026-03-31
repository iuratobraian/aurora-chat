import React, { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import PostActions from './PostActions';
import { Usuario } from '../../types';

interface PostCardMediaProps {
    videoUrl?: string;
    imagenUrl?: string;
    titulo?: string;
    usuarioManejo: string;
    isGuest: boolean;
    likes: string[];
    commentsCount: number;
    compartidos?: number;
    hasLiked: boolean;
    hasSaved?: boolean;
    canEdit: boolean;
    onLike: (e: React.MouseEvent) => void;
    onComments: () => void;
    onShare: () => void;
    onSave?: () => void;
    onEdit: () => void;
    onDelete: () => void;
    showComments: boolean;
    likeFlash: boolean;
    postId: string;
    postPoints: number;
    userPointsGiven: number;
    usuario: Usuario | null;
    onGivePoints: (postId: string, points: number) => void;
    allowExpand?: boolean;
}

export const PostCardMedia: React.FC<PostCardMediaProps> = memo(({
    videoUrl,
    imagenUrl,
    titulo,
    usuarioManejo,
    isGuest,
    likes,
    commentsCount,
    compartidos,
    hasLiked,
    hasSaved,
    canEdit,
    onLike,
    onComments,
    onShare,
    onSave,
    onEdit,
    onDelete,
    showComments,
    likeFlash,
    postId,
    postPoints = 0,
    userPointsGiven = 0,
    usuario,
    onGivePoints,
    allowExpand = true,
}) => {
    const [imgError, setImgError] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOriginalSize, setIsOriginalSize] = useState(false);

    const [currentImgSrc, setCurrentImgSrc] = useState<string | null>(imagenUrl || null);

    const hasImage = currentImgSrc && !imgError;
    const displayImage = hasImage ? currentImgSrc : null;

    const handleImgError = () => {
        if (!imgError && imagenUrl) {
            setImgError(true);
        }
    };

    if (!videoUrl && !displayImage) return null;

    return (
        <>
            <div className={`px-4 pb-3 ${isGuest ? 'blur-md grayscale pointer-events-none select-none' : ''}`}>
                {videoUrl ? (
                    <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-black shadow-lg aspect-video relative group/video">
                        {videoUrl.startsWith('yt:') ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${videoUrl.replace('yt:', '')}?rel=0&modestbranding=1`}
                                className="w-full h-full"
                                allowFullScreen
                                frameBorder="0"
                                title={titulo || 'YouTube video'}
                            />
                        ) : (
                            <video
                                src={videoUrl}
                                controls
                                className="w-full h-full object-contain"
                                poster={imagenUrl}
                            />
                        )}
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 opacity-0 group-hover/video:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-primary text-[14px]">play_circle</span>
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">
                                {videoUrl.startsWith('yt:') ? 'YouTube' : 'Video Share'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 relative group/img shadow-lg max-h-[350px] ${allowExpand ? 'cursor-zoom-in' : 'cursor-default'}`}
                        onClick={() => allowExpand && setIsExpanded(true)}
                    >
                        <img
                            src={displayImage}
                            className="w-full h-full object-contain max-h-[350px] hover:scale-[1.02] transition-transform duration-500 bg-black/40"
                            alt="Post content"
                            loading="lazy"
                            onError={handleImgError}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                             <PostActions
                                likes={likes}
                                commentsCount={commentsCount}
                                compartidos={compartidos}
                                hasLiked={hasLiked}
                                hasSaved={hasSaved}
                                canEdit={canEdit}
                                onLike={onLike}
                                onComments={onComments}
                                onShare={onShare}
                                onSave={onSave}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                showComments={showComments}
                                likeFlash={likeFlash}
                                postId={postId}
                                postPoints={postPoints}
                                userPointsGiven={userPointsGiven}
                                usuario={usuario}
                                onGivePoints={onGivePoints}
                                authorName={usuarioManejo}
                                variant="overlay"
                             />
                        </div>
                        {allowExpand && (
                            <div className="absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-all duration-500 p-4 flex flex-col justify-end pointer-events-none">
                                <div className="flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="size-8 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40">
                                        <span className="material-symbols-outlined text-white text-lg">open_in_full</span>
                                    </div>
                                    <div>
                                        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] block">Ampliar</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {isExpanded && displayImage && createPortal(
                <div
                    className={`fixed inset-0 z-[1000] bg-black/98 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-300 ${isOriginalSize ? 'overflow-auto' : ''}`}
                    onClick={() => { setIsExpanded(false); setIsOriginalSize(false); }}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(false); setIsOriginalSize(false); }}
                        className="fixed top-6 right-6 size-12 rounded-full bg-white/5 hover:bg-white/5 text-white flex items-center justify-center transition-all border border-white/20 z-[1010] shadow-2xl"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>

                    <div className="fixed top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 z-[1010]">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsOriginalSize(!isOriginalSize); }}
                            className={`flex items-center gap-2 ${isOriginalSize ? 'text-primary' : 'text-white'} hover:opacity-80 transition-all`}
                        >
                            <span className="material-symbols-outlined text-sm">{isOriginalSize ? 'zoom_in_map' : 'zoom_out_map'}</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isOriginalSize ? 'Ajustar' : 'Tamaño Original'}</span>
                        </button>
                    </div>

                    <img
                        src={displayImage}
                        className={`transition-all duration-500 shadow-2xl animate-in zoom-in-95 ${isOriginalSize ? 'w-auto h-auto max-w-none max-h-none' : 'max-w-[95vw] max-h-[95vh] object-contain cursor-zoom-in'}`}
                        alt="Zoomed analysis"
                        onError={handleImgError}
                        onClick={e => { e.stopPropagation(); setIsOriginalSize(!isOriginalSize); }}
                    />

                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-4 z-[1010] shadow-2xl">
                        <div className="flex flex-col text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">
                                Análisis compartido por <span className="text-primary">@{usuarioManejo}</span>
                            </p>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">TradePortal Community</p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
});

export default PostCardMedia;