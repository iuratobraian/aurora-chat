import React, { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { Publicacion, Usuario } from '../../types';
import PostCard from '../../components/PostCard';
import { useInView } from 'react-intersection-observer';

interface CommunityFeedProps {
    posts: Publicacion[];
    loading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    filteredPosts: Publicacion[];
    usuario: Usuario | null;
    pulsingPostId: string | null;
    newPostId: string | null;
    newPostsFromTop: Publicacion[];
    onLike: (post: Publicacion) => void;
    onUpdate: (post: Publicacion) => void;
    onDelete: (id: string) => void;
    onFollow: (authorId: string) => void;
    onVisitProfile: (id: string) => void;
    onReply: (postId: string, text: string, parentId?: string) => void;
    onLikeComment: (postId: string, commentId: string) => void;
    onOpenPost: (post: Publicacion) => void;
    onGivePoints: (postId: string, points: number) => void;
    loadMoreRef?: (node?: Element | null) => void;
    isRefreshing: boolean;
    isAdmin: boolean;
    totalPosts?: number;
}

const PostSkeleton: React.FC<{ index: number }> = memo(({ index }) => (
    <div 
        className="glass rounded-2xl overflow-hidden border border-white/5 animate-pulse"
        style={{ animationDelay: `${index * 150}ms` }}
    >
        <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/10 rounded w-1/3" />
                    <div className="h-2 bg-white/5 rounded w-1/4" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-white/5 rounded w-full" />
                <div className="h-4 bg-white/5 rounded w-3/4" />
            </div>
            <div className="h-32 bg-white/5 rounded-xl" />
            <div className="flex gap-4 pt-2">
                <div className="h-6 bg-white/5 rounded w-16" />
                <div className="h-6 bg-white/5 rounded w-16" />
                <div className="h-6 bg-white/5 rounded w-16" />
            </div>
        </div>
    </div>
));

const EndOfContent: React.FC<{ totalCount: number }> = memo(({ totalCount }) => (
    <div className="flex flex-col items-center gap-4 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative">
            <div className="absolute inset-0 bg-signal-green/20 rounded-full blur-xl animate-pulse" />
            <div className="relative glass-subtle rounded-full px-8 py-4 flex items-center gap-4 border border-signal-green/20">
                <span className="material-symbols-outlined text-2xl text-signal-green">celebration</span>
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Fin del contenido</span>
                    <span className="text-sm font-black text-white">{totalCount} publicaciones</span>
                </div>
            </div>
        </div>
        <p className="text-[10px] text-gray-600 font-medium tracking-wide">
            ¡Has visto todo! Vuelve pronto para más contenido.
        </p>
    </div>
));

const LoadingMore: React.FC = memo(() => (
    <div className="flex flex-col items-center gap-4 py-8">
        <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
            <div className="relative flex items-center gap-3 bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-white/5">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                </div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Cargando contenido</span>
            </div>
        </div>
    </div>
));

const ScrollHint: React.FC = memo(() => (
    <div className="flex flex-col items-center gap-3 py-8 animate-in fade-in duration-700">
        <div className="flex items-center gap-2 text-gray-500 group cursor-pointer hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-2xl animate-bounce">expand_more</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider">Desliza para cargar más</span>
        </div>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
));

const EmptyState: React.FC<{ isFiltered: boolean; onCreatePost?: () => void }> = memo(({ isFiltered, onCreatePost }) => (
    <div className="flex flex-col items-center gap-6 py-20 px-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
            <div className="relative size-24 rounded-full bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-primary/60">
                    {isFiltered ? 'search_off' : 'article'}
                </span>
            </div>
        </div>
        
        <div className="space-y-2">
            <h3 className="text-xl font-black text-white uppercase tracking-wide">
                {isFiltered ? 'Sin resultados' : 'El feed está vacío'}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
                {isFiltered 
                    ? 'No hay publicaciones que coincidan con tus filtros. Intenta con otros criterios de búsqueda.' 
                    : 'Sé el primero en compartir tu análisis. La comunidad espera tu perspectiva.'}
            </p>
        </div>
        
        {!isFiltered && onCreatePost && (
            <button 
                onClick={onCreatePost}
                className="px-8 py-4 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/30 text-white rounded-xl font-black uppercase tracking-widest transition-all hover:scale-105"
            >
                Crear primera publicación
            </button>
        )}
    </div>
));

const NewPostsBanner: React.FC<{ count: number; onClick: () => void }> = memo(({ count, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full py-3 bg-gradient-to-r from-primary/90 to-blue-600/90 backdrop-blur-md text-white rounded-xl font-bold text-sm animate-in slide-in-from-top-4 fade-in shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
    >
        <span className="material-symbols-outlined text-lg animate-pulse">keyboard_arrow_up</span>
        {count} nueva{count !== 1 ? 's' : ''} publicación{count !== 1 ? 'es' : ''}
        <span className="material-symbols-outlined text-lg">keyboard_arrow_up</span>
    </button>
));

const PostItem: React.FC<{
    post: Publicacion;
    index: number;
    usuario: Usuario | null;
    isPulsing: boolean;
    isNewFromTop: boolean;
    onLike: () => void;
    onUpdate: (post: Publicacion) => void;
    onDelete: () => void;
    onFollow: () => void;
    onVisitProfile: (id: string) => void;
    onReply: (postId: string, text: string, parentId?: string) => void;
    onLikeComment: (postId: string, commentId: string) => void;
    onOpen: () => void;
    onGivePoints: (postId: string, points: number) => void;
}> = memo(({
    post, index, usuario, isPulsing, isNewFromTop, onLike, onUpdate, onDelete, onFollow, 
    onVisitProfile, onReply, onLikeComment, onOpen, onGivePoints
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isNewAnimating, setIsNewAnimating] = useState(isNewFromTop);
    const { ref } = useInView({
        threshold: 0.1,
        triggerOnce: true,
    });

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 80);
        return () => clearTimeout(timer);
    }, [index]);

    useEffect(() => {
        if (isNewFromTop) {
            setIsNewAnimating(true);
            const timer = setTimeout(() => setIsNewAnimating(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [isNewFromTop]);

    return (
        <div 
            ref={ref}
            className={`
                transform transition-all duration-500 ease-out
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
                ${isNewAnimating ? 'animate-slide-in-from-top' : ''}
                ${isPulsing ? 'z-30' : ''}
            `}
        >
            <div 
                className={`
                    rounded-2xl overflow-hidden border transition-all duration-300
                    ${isPulsing 
                        ? 'border-primary/50 shadow-[0_0_40px_rgba(59,130,246,0.4)] scale-[1.02] animate-pulse' 
                        : isNewAnimating
                            ? 'border-signal-green/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-[1.01]'
                            : 'border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20'}
                `}
            >
                <PostCard
                    post={post}
                    usuario={usuario}
                    onLike={onLike}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onFollow={onFollow}
                    onVisitProfile={onVisitProfile}
                    onReply={onReply}
                    onLikeComment={onLikeComment}
                    onOpen={onOpen}
                    onGivePoints={onGivePoints}
                />
            </div>
        </div>
    );
});

const CommunityFeed: React.FC<CommunityFeedProps> = ({
    posts,
    loading,
    isLoadingMore,
    hasMore,
    filteredPosts,
    usuario,
    pulsingPostId,
    newPostId,
    newPostsFromTop,
    onLike,
    onUpdate,
    onDelete,
    onFollow,
    onVisitProfile,
    onReply,
    onLikeComment,
    onOpenPost,
    onGivePoints,
    loadMoreRef,
    isRefreshing,
    isAdmin,
    totalPosts = 0,
}) => {
    const [showNewPostsCount, setShowNewPostsCount] = useState(0);
    const newPostIds = useMemo(() => new Set([newPostId, ...newPostsFromTop.map(p => p.id)]), [newPostId, newPostsFromTop]);

    const { ref: autoRef, inView } = useInView({
        threshold: 0,
        rootMargin: '200px',
    });

    const handleRef = useCallback((node?: Element | null) => {
        if (loadMoreRef) {
            loadMoreRef(node);
        }
    }, [loadMoreRef]);

    const mergedRef = useCallback((node?: Element | null) => {
        (autoRef as any)(node);
        handleRef(node);
    }, [autoRef, handleRef]);

    const isFiltered = filteredPosts.length < posts.length;

    useEffect(() => {
        if (pulsingPostId || newPostId) {
            const timer = setTimeout(() => {
                setShowNewPostsCount(prev => prev + 1);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [pulsingPostId, newPostId]);

    return (
        <div className="space-y-4 relative">
            {isRefreshing && (
                <div className="absolute inset-0 z-20 flex items-start justify-center pt-6 pointer-events-none">
                    <div className="flex items-center gap-4 bg-black/80 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-top-4 fade-in">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/30 rounded-full blur animate-pulse" />
                            <div className="relative size-8 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                        </div>
                        <span className="text-sm font-bold text-white">Publicando...</span>
                    </div>
                </div>
            )}

            {showNewPostsCount > 0 && !isRefreshing && (
                <NewPostsBanner 
                    count={showNewPostsCount} 
                    onClick={() => {
                        setShowNewPostsCount(0);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                />
            )}

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <PostSkeleton key={i} index={i} />)}
                </div>
            ) : filteredPosts.length === 0 ? (
                <EmptyState isFiltered={isFiltered} />
            ) : (
                <>
                    <div className="space-y-4">
                        {filteredPosts.map((post, index) => (
                            <PostItem
                                key={post.id}
                                post={post}
                                index={index}
                                usuario={usuario}
                                isPulsing={pulsingPostId === post.id}
                                isNewFromTop={newPostIds.has(post.id)}
                                onLike={() => onLike(post)}
                                onUpdate={onUpdate}
                                onDelete={() => onDelete(post.id)}
                                onFollow={() => onFollow(post.idUsuario)}
                                onVisitProfile={onVisitProfile}
                                onReply={onReply}
                                onLikeComment={onLikeComment}
                                onOpen={() => onOpenPost(post)}
                                onGivePoints={onGivePoints}
                            />
                        ))}
                    </div>

                    {isLoadingMore && <LoadingMore />}

                    <div ref={mergedRef} className="min-h-20 w-full flex items-center justify-center">
                        {!hasMore && filteredPosts.length > 0 ? (
                            <EndOfContent totalCount={filteredPosts.length} />
                        ) : hasMore ? (
                            <ScrollHint />
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );
};

export default memo(CommunityFeed);
