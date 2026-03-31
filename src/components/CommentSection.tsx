import React, { useState, useMemo } from 'react';
import { Usuario, Comentario } from '../types';
import { ImageUploadService } from '../services/imageUpload';
import { escapeHTML } from '../services/sanitize';
import { useToast } from './ToastProvider';
import { CommentsRanker, CommentSortOption } from '../services/ranking/commentsRanker';

const FALLBACK_IMAGE = 'https://picsum.photos/seed/comment/400/300';

const COMMENT_SORT_KEY = 'comment_sort_preference';

interface CommentSectionProps {
    comments: Comentario[];
    postId: string;
    onReply: (postId: string, text: string, parentId?: string, imagenUrl?: string) => void;
    onLikeComment: (postId: string, commentId: string) => void;
    cerrados?: boolean;
    usuario: Usuario | null;
}

const SORT_LABELS: Record<CommentSortOption, string> = {
    engagement: 'Populares',
    recency: 'Recientes',
    quality: 'Mejor valorados',
};

const getSortPreference = (): CommentSortOption => {
    try {
        const stored = localStorage.getItem(COMMENT_SORT_KEY);
        if (stored === 'engagement' || stored === 'recency' || stored === 'quality') return stored;
    } catch {}
    return 'engagement';
};

const CommentSection: React.FC<CommentSectionProps> = React.memo(({
    comments,
    postId,
    onReply,
    onLikeComment,
    cerrados,
    usuario
}) => {
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<CommentSortOption>(getSortPreference);
    const { showToast } = useToast();

    const rankedComments = useMemo(
        () => CommentsRanker.rank(comments, { sortBy }),
        [comments, sortBy]
    );

    const handleSortChange = (newSort: CommentSortOption) => {
        setSortBy(newSort);
        try { localStorage.setItem(COMMENT_SORT_KEY, newSort); } catch {}
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !usuario) return;
        setUploading(true);
        try {
            const url = await ImageUploadService.uploadImage(file);
            setAttachedImage(url);
        } catch { 
            showToast('error', "Error al subir imagen"); 
        } finally { 
            setUploading(false); 
        }
    };

    const handleSubmit = (parentId?: string) => {
        if (!replyText.trim() && !attachedImage) return;
        onReply(postId, replyText, parentId, attachedImage || undefined);
        setReplyText('');
        setAttachedImage(null);
        setReplyingTo(null);
    };

    const formatCommentText = (text: string) => {
        const escaped = escapeHTML(text);
        return escaped.split(/(@\w+)/g).map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className="text-primary font-black bg-primary/10 px-1 rounded">{part}</span>;
            }
            return part;
        });
    };

    return (
        <div className="space-y-4 pt-4">
            {!cerrados && usuario && (
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <img src={usuario.avatar} className="size-8 rounded-full bg-gray-100 dark:bg-white/5 border border-white/5" alt="" loading="lazy" />
                        <div className="flex-1 flex flex-col gap-2">
                            {attachedImage && (
                                <div className="relative size-16 rounded-xl overflow-hidden ring-2 ring-primary">
                                    <img src={attachedImage} className="w-full h-full object-cover" alt="" loading="lazy" />
                                    <button onClick={() => setAttachedImage(null)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg">
                                        <span className="material-symbols-outlined text-[10px]">close</span>
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 px-3 py-1.5 focus-within:border-primary transition-all">
                                <input
                                    type="file"
                                    id={`comment-img-${postId}`}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <button 
                                    onClick={() => document.getElementById(`comment-img-${postId}`)?.click()}
                                    className={`text-gray-400 hover:text-primary transition-colors ${uploading ? 'animate-pulse' : ''}`}
                                    disabled={uploading}
                                >
                                    <span className="material-symbols-outlined text-lg">{uploading ? 'sync' : 'image'}</span>
                                </button>
                                <input
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    placeholder="Escribe un comentario..."
                                    className="flex-1 bg-transparent text-xs text-gray-900 dark:text-white outline-none"
                                />
                                <button
                                    onClick={() => handleSubmit()}
                                    disabled={(!replyText.trim() && !attachedImage) || uploading}
                                    className="text-primary disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-sm">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {comments.length > 3 && (
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-white/10">
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Ordenar:</span>
                    {(Object.keys(SORT_LABELS) as CommentSortOption[]).map((option) => (
                        <button
                            key={option}
                            onClick={() => handleSortChange(option)}
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full transition-colors ${
                                sortBy === option
                                    ? 'bg-primary text-white'
                                    : 'text-gray-400 hover:text-primary'
                            }`}
                        >
                            {SORT_LABELS[option]}
                        </button>
                    ))}
                </div>
            )}
            
            <div className={`space-y-4 ${comments.length > 5 ? 'max-h-[400px] overflow-y-auto no-scrollbar' : ''}`}>
                {rankedComments.map((item) => (
                    <CommentItem
                        key={item.comment.id}
                        comment={item.comment}
                        postId={postId}
                        usuario={usuario}
                        cerrados={cerrados}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        onSubmitReply={handleSubmit}
                        onLikeComment={onLikeComment}
                        formatText={formatCommentText}
                        boosted={item.boosted}
                        score={item.score}
                    />
                ))}
            </div>
        </div>
    );
});

CommentSection.displayName = 'CommentSection';

interface CommentItemProps {
    comment: Comentario;
    postId: string;
    usuario: Usuario | null;
    cerrados?: boolean;
    replyingTo: string | null;
    setReplyingTo: (id: string | null) => void;
    replyText: string;
    setReplyText: (text: string) => void;
    onSubmitReply: (parentId?: string) => void;
    onLikeComment: (postId: string, commentId: string) => void;
    formatText: (text: string) => React.ReactNode;
    boosted?: boolean;
    score?: number;
}

const CommentItem: React.FC<CommentItemProps> = React.memo(({
    comment,
    postId,
    usuario,
    cerrados,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    onSubmitReply,
    onLikeComment,
    formatText,
}) => {
    const [imgError, setImgError] = useState(false);
    
    return (
        <div className="group/comment animate-in slide-in-from-bottom-1">
            <div className="flex gap-3">
                <img src={comment.avatarUsuario} className="size-8 rounded-full bg-gray-100 dark:bg-white/5 border border-white/5" alt="" loading="lazy" />
                <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-[10px] text-gray-900 dark:text-white uppercase tracking-widest">{comment.nombreUsuario}</span>
                            <span className="text-[8px] text-gray-400 font-bold">{comment.tiempo}</span>
                        </div>
                        {comment.imagenUrl && (
                            <div className="mb-2 rounded-xl overflow-hidden ring-1 ring-white/5 shadow-lg">
                                <img 
                                    src={imgError ? FALLBACK_IMAGE : comment.imagenUrl} 
                                    className="w-full h-auto max-h-[200px] object-contain bg-black/20" 
                                    alt="" 
                                    loading="lazy" 
                                    onError={() => setImgError(true)}
                                    onClick={() => window.open(comment.imagenUrl!, '_blank')} 
                                />
                            </div>
                        )}
                        <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{formatText(comment.texto)}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 ml-2">
                        <button
                            onClick={() => onLikeComment(postId, comment.id)}
                            className={`text-[9px] font-black uppercase tracking-widest transition-colors ${comment.likes.includes(usuario?.id || '') ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                        >
                            Like ({comment.likes?.length || 0})
                        </button>
                        {!cerrados && usuario && (
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-primary"
                            >
                                Responder
                            </button>
                        )}
                    </div>

                    {replyingTo === comment.id && (
                        <div className="mt-3 animate-in fade-in zoom-in-95">
                             <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 px-2.5 py-1.5 focus-within:border-primary transition-all">
                                <input
                                    autoFocus
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && onSubmitReply(comment.id)}
                                    placeholder={`Respondiendo a ${comment.nombreUsuario}...`}
                                    className="flex-1 bg-transparent text-[10px] text-gray-900 dark:text-white outline-none"
                                />
                                <button onClick={() => onSubmitReply(comment.id)} className="text-primary"><span className="material-symbols-outlined text-sm">send</span></button>
                             </div>
                        </div>
                    )}

                    {comment.respuestas && comment.respuestas.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-primary/10 space-y-4">
                            {comment.respuestas.map((reply) => (
                                <div key={reply.id} className="flex gap-3">
                                    <img src={reply.avatarUsuario} className="size-6 rounded-full bg-gray-100 dark:bg-white/5 border border-white/5" alt="" loading="lazy" />
                                    <div className="flex-1">
                                        <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-3 py-2">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="font-black text-[9px] text-gray-900 dark:text-white uppercase tracking-widest">{reply.nombreUsuario}</span>
                                                <span className="text-[7px] text-gray-400 font-bold">{reply.tiempo}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{formatText(reply.texto)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

CommentItem.displayName = 'CommentItem';

export default CommentSection;
export { CommentItem };
