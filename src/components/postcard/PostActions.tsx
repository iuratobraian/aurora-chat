import React, { memo } from 'react';
import PostPoints from '../PostPoints';
import { Usuario } from '../../types';

interface PostActionsProps {
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
    authorName: string;
    variant?: 'overlay' | 'flat';
}

export const PostActions: React.FC<PostActionsProps> = memo(({
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
    postPoints,
    userPointsGiven,
    usuario,
    onGivePoints,
    authorName,
    variant = 'flat'
}) => {
    const commonBtnClass = variant === 'overlay' 
        ? "bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 text-white hover:bg-black/70 transition-all shadow-lg border border-white/5"
        : "flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-white/60 hover:text-primary dark:hover:text-primary";

    return (
        <div className={`flex items-center gap-2 flex-wrap ${variant === 'overlay' ? 'flex-col' : 'justify-between w-full px-4 py-3'}`}>
            <div className={`flex items-center gap-2 ${variant === 'overlay' ? 'flex-col' : ''}`}>
                <PostPoints
                    usuario={usuario}
                    postId={postId}
                    userPointsGiven={userPointsGiven}
                    totalPoints={postPoints}
                    onGivePoints={onGivePoints}
                    authorName={authorName}
                />
                
                <button
                    onClick={onLike}
                    className={`${commonBtnClass} ${hasLiked ? 'text-red-500 dark:text-red-500' : ''}`}
                >
                    <span className={`material-symbols-outlined text-base ${likeFlash ? 'animate-like-flash' : ''} ${hasLiked ? 'fill-1' : ''}`}>
                        favorite
                    </span>
                    <span className="text-[10px] font-black">{likes.length}</span>
                </button>

                <button
                    onClick={onComments}
                    className={`${commonBtnClass} ${showComments ? 'text-primary dark:text-primary' : ''}`}
                >
                    <span className="material-symbols-outlined text-base">chat_bubble</span>
                    <span className="text-[10px] font-black">{commentsCount}</span>
                </button>

                <button
                    onClick={onShare}
                    className={commonBtnClass}
                >
                    <span className="material-symbols-outlined text-base">share</span>
                    <span className="text-[10px] font-black">{compartidos || 0}</span>
                </button>
            </div>

            <div className={`flex items-center gap-2 ${variant === 'overlay' ? 'flex-col' : ''}`}>
                {onSave && (
                    <button
                        onClick={onSave}
                        className={`${commonBtnClass} ${hasSaved ? 'text-amber-400 dark:text-amber-400' : ''}`}
                    >
                        <span className={`material-symbols-outlined text-base ${hasSaved ? 'fill-1' : ''}`}>
                            bookmark
                        </span>
                        <span className="text-[10px] font-black">{hasSaved ? 'Guardado' : 'Guardar'}</span>
                    </button>
                )}
                
                {canEdit && (
                    <>
                        <button
                            onClick={onEdit}
                            className={commonBtnClass}
                        >
                            <span className="material-symbols-outlined text-base">edit</span>
                            <span className="text-[10px] font-black">Editar</span>
                        </button>
                        <button
                            onClick={onDelete}
                            className={`${commonBtnClass} hover:text-red-500 dark:hover:text-red-500`}
                        >
                            <span className="material-symbols-outlined text-base">delete</span>
                            <span className="text-[10px] font-black">Eliminar</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
});

export default PostActions;
