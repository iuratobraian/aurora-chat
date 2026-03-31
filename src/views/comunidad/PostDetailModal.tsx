import React, { memo } from 'react';
import { Publicacion, Usuario } from '../../types';

interface PostDetailModalProps {
    post: Publicacion | null;
    usuario: Usuario | null;
    onLike: () => void;
    onUpdate: (post: Publicacion) => void;
    onDelete: () => void;
    onFollow: () => void;
    onVisitProfile: (id: string) => void;
    onReply: (postId: string, text: string, parentId?: string) => void;
    onLikeComment: (postId: string, commentId: string) => void;
    onClose: () => void;
}

import PostCard from '../../components/PostCard';

const PostDetailModal: React.FC<PostDetailModalProps> = memo(({
    post,
    usuario,
    onLike,
    onUpdate,
    onDelete,
    onFollow,
    onVisitProfile,
    onReply,
    onLikeComment,
    onClose,
}) => {
    if (!post) return null;

    const handleProfileVisit = (id: string) => {
        onVisitProfile(id);
        onClose();
    };

    const handleDelete = () => {
        onDelete();
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar rounded-t-3xl sm:rounded-3xl bg-[#0f1115] border border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-1 sm:p-2">
                    <PostCard
                        post={post}
                        usuario={usuario}
                        onLike={onLike}
                        onUpdate={onUpdate}
                        onDelete={handleDelete}
                        onFollow={onFollow}
                        onVisitProfile={handleProfileVisit}
                        onReply={onReply}
                        onLikeComment={onLikeComment}
                        fullView={true}
                        onOpen={() => {}}
                    />
                </div>
            </div>
        </div>
    );
});

export default PostDetailModal;
