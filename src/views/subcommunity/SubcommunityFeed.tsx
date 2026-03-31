import React, { useState, useMemo, memo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface Props {
  subcommunityId: string;
  userId: string;
  isMember: boolean;
  filterType?: string;
  filterTag?: string | null;
  sortBy?: 'relevance' | 'recent' | 'popular';
}

interface Post {
  _id: string;
  userId: string;
  contenido: string;
  titulo?: string;
  categoria: string;
  likes: string[];
  createdAt: number;
  imagenUrl?: string;
  tags?: string[];
}

const formatTime = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const PostCard = memo(({ post, userId }: { post: Post; userId: string }) => {
  const [liked, setLiked] = useState(post.likes?.includes(userId) || false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  
  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const CATEGORY_COLORS: Record<string, string> = {
    General: 'from-gray-500/10 to-gray-600/5 border-gray-500/20 text-gray-400',
    Análisis: 'from-blue-500/10 to-cyan-500/5 border-blue-500/20 text-blue-400',
    Señales: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400',
    Educación: 'from-violet-500/10 to-purple-500/5 border-violet-500/20 text-violet-400',
    Discusión: 'from-amber-500/10 to-orange-500/5 border-amber-500/20 text-amber-400',
  };
  const categoryStyle = CATEGORY_COLORS[post.categoria] || CATEGORY_COLORS.General;

  return (
    <div className="group relative glass rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-primary/5">
      {/* Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative p-5">
        {/* Post Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary/40 to-violet-600/20 border border-white/10 flex items-center justify-center shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-primary text-lg">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate">{post.userId}</span>
              <span className="text-[9px] text-gray-600">·</span>
              <span className="text-[9px] text-gray-500">{formatTime(post.createdAt)}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${categoryStyle}`}>
            {post.categoria}
          </span>
        </div>

        {/* Title */}
        {post.titulo && (
          <h3 className="text-sm font-bold text-white mb-2 leading-snug">{post.titulo}</h3>
        )}
        
        {/* Content */}
        <p className="text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">{post.contenido}</p>

        {/* Image */}
        {post.imagenUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border border-white/5 shadow-lg">
            <img
              src={post.imagenUrl}
              alt="Post"
              className="w-full max-h-96 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[8px] font-bold text-gray-400 uppercase tracking-wider hover:border-primary/30 hover:text-primary transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 mt-4 pt-4 border-t border-white/5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              liked
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                : 'text-gray-500 hover:text-red-400 hover:bg-white/5'
            }`}
          >
            <span className={`material-symbols-outlined text-lg transition-transform ${liked ? 'scale-110' : 'group-hover:scale-110'}`}>
              {liked ? 'favorite' : 'favorite_border'}
            </span>
            <span className="text-[10px] font-bold">{likeCount}</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 hover:text-violet-400 hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-lg">chat_bubble</span>
            <span className="text-[10px] font-bold">Comentar</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 hover:text-emerald-400 hover:bg-white/5 transition-all ml-auto">
            <span className="material-symbols-outlined text-lg">share</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 hover:text-amber-400 hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-lg">bookmark</span>
          </button>
        </div>
      </div>
    </div>
  );
});

const SubcommunityFeed: React.FC<Props> = ({ subcommunityId, userId, isMember, filterType, filterTag, sortBy }) => {
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);

  const postsData = useQuery(api.subcommunities.getSubcommunityPosts, {
    subcommunityId: subcommunityId as any,
    limit: 20,
  });

  const createPost = useMutation(api.posts.createPost);

  const posts = postsData?.page as Post[] | undefined;

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let result = [...posts];

    if (filterType && filterType !== 'Todos') {
      result = result.filter(p => p.categoria === filterType);
    }

    if (filterTag) {
      result = result.filter(p =>
        p.tags?.some(t => t.toLowerCase().includes(filterTag.toLowerCase())) ||
        p.contenido.toLowerCase().includes(filterTag.toLowerCase())
      );
    }

    if (sortBy === 'recent') {
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    }

    return result;
  }, [posts, filterType, filterTag, sortBy]);

  const handleSubmit = async () => {
    if (!postContent.trim() || !userId) return;
    setPosting(true);
    try {
      await createPost({
        userId,
        contenido: postContent.trim(),
        categoria: 'General',
        esAnuncio: false,
      });
      setPostContent('');
    } catch {
      // handled silently
    } finally {
      setPosting(false);
    }
  };

  if (postsData === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <div className="relative flex gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Cargando publicaciones</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Post */}
      {isMember && userId && (
        <div className="glass rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/15">
          {/* Gradient top bar */}
          <div className="h-1 bg-gradient-to-r from-primary via-violet-500 to-primary" />
          
          <div className="p-5">
            <div className="flex gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-primary/30 to-violet-600/20 border border-primary/30 flex items-center justify-center shrink-0 shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined text-primary text-lg">person</span>
              </div>
              <div className="flex-1 space-y-3">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="¿Qué estás pensando? Comparte con la comunidad..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[
                      { icon: 'image', label: 'Imagen' },
                      { icon: 'poll', label: 'Encuesta' },
                      { icon: 'sell', label: 'Tag' },
                    ].map(({ icon, label }) => (
                      <button key={icon} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-primary transition-all group" title={label}>
                        <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">{icon}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!postContent.trim() || posting}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98]"
                  >
                    {posting ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        Publicando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">send</span>
                        Publicar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <div className="glass rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden">
          {/* Gradient top bar */}
          <div className="h-1 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500" />
          
          <div className="p-12 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
              <div className="relative size-20 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-600/10 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary">article</span>
              </div>
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">
              {filterType && filterType !== 'Todos' || filterTag
                ? 'Sin resultados'
                : 'Sin publicaciones'}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mb-6">
              {isMember
                ? filterType !== 'Todos' || filterTag
                  ? 'No hay publicaciones en esta categoría. Intenta con otro filtro.'
                  : 'Sé el primero en compartir algo en esta subcomunidad.'
                : 'Únete para ver y crear publicaciones exclusivas.'}
            </p>
            {isMember && !filterType && !filterTag && (
              <button
                onClick={() => document.querySelector<HTMLTextAreaElement>('textarea')?.focus()}
                className="px-6 py-3 bg-gradient-to-r from-primary to-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Crear primera publicación
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Feed header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">article</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {filteredPosts.length} publicación{filteredPosts.length !== 1 ? 'es' : ''}
              </span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent ml-4" />
          </div>
          
          {filteredPosts.map((post, index) => (
            <div
              key={post._id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <PostCard post={post} userId={userId} />
            </div>
          ))}
        </div>
      )}

      {/* End of feed */}
      {filteredPosts.length > 0 && postsData?.isDone && (
        <div className="flex flex-col items-center gap-4 py-12 animate-in fade-in duration-500">
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-signal-green/50 to-transparent" />
          <div className="flex items-center gap-3 px-6 py-3 rounded-full glass border border-white/10">
            <span className="material-symbols-outlined text-lg text-signal-green">verified</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fin del contenido</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcommunityFeed;
