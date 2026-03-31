import React from 'react';
import PostCard from '../../components/PostCard';
import { Usuario, Publicacion } from '../../types';

interface ProfilePostsTabProps {
    userPosts: Publicacion[];
    usuario: Usuario;
    isOwnProfile: boolean;
    onDeletePost: (postId: string) => void;
}

export const ProfilePostsTab: React.FC<ProfilePostsTabProps> = ({
    userPosts,
    usuario,
    isOwnProfile,
    onDeletePost,
}) => {
    if (userPosts.length === 0) {
        return (
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
                <div className="size-20 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-4xl text-white/30">photo_camera</span>
                </div>
                <h3 className="text-lg font-black text-white mb-2">Aún no hay publicaciones</h3>
                <p className="text-sm text-white/40">
                    Cuando {isOwnProfile ? 'compartas' : 'comparta'} fotos o análisis, aparecerán aquí.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {userPosts.map(p => (
                <PostCard
                    key={p.id} 
                    post={p} 
                    usuario={usuario}
                    onLike={() => {}} 
                    onDelete={() => onDeletePost(p.id)}
                    onVisitProfile={() => {}} 
                    onReply={() => {}} 
                    onLikeComment={() => {}}
                    onUpdate={() => {}}
                    onFollow={() => {}}
                />
            ))}
        </div>
    );
};

export default ProfilePostsTab;
