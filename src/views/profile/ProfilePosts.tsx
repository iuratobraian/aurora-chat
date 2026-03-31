import React from 'react';
import { Publicacion, Usuario } from '../../types';
import PostCard from '../../components/PostCard';

interface ProfilePostsProps {
  posts: Publicacion[];
  loading: boolean;
  onVisitProfile: (id: string) => void;
  onLoginRequest: () => void;
  usuario: Usuario | null;
  emptyMessage?: string;
}

export const ProfilePosts: React.FC<ProfilePostsProps> = ({
  posts,
  loading,
  onVisitProfile,
  onLoginRequest,
  usuario,
  emptyMessage = "No hay posts todavía"
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-2xl p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                <div className="h-3 w-20 bg-white/10 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-3/4 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4 opacity-20">📝</div>
        <p className="text-white/50 font-bold uppercase tracking-wider">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          usuario={usuario}
          onLike={() => {}}
          onUpdate={() => {}}
          onDelete={() => {}}
          onFollow={() => onLoginRequest()}
          onVisitProfile={onVisitProfile}
          onReply={() => {}}
          onLikeComment={() => {}}
        />
      ))}
    </div>
  );
};

export default ProfilePosts;
