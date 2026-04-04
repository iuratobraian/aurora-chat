import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StorageService } from '../services/storage';
import { Publicacion, Usuario, Comentario, CategoriaPost, Ad, LiveStatus, Herramienta, ConvexPost } from '../types';
import PostCard from '../components/PostCard';
import CreatePostInline from '../components/CreatePostInline';
import Ticker from '../components/Ticker';
import { useInView } from 'react-intersection-observer';
import ElectricLoader from '../components/ElectricLoader';
import { useToast } from '../components/ToastProvider';
import AdBanner, { RotatingAdBanner } from '../components/AdBanner';
import { mapConvexPost } from '../utils/postMapper';
import { extractYoutubeId } from '../utils/youtube';
import logger from '../utils/logger';
import { FeedRanker, FeedDataSignal } from '../services/feed/feedRanker';
import {
    FilterButton,
    SidebarAdSection,
    SidebarCommunitiesSection,
    CommunitySlider,
    DailyPollWidget,
    DailyPollModal,
    DailyPollResults,
    LivePollWidget,
    PartnerCard,
    CommunityFeed,
    CommunityHeader,
    LiveTVSection,
    CreatePostModal,
    CreateCommunityModal,
    PostDetailModal,
    FILTER_CATEGORIES,
    TAG_FILTERS,
    DEFAULT_COURSES_AD,
    DEFAULT_BOT_AD,
    injectAds,
    LiveSidebarAd,
    VerticalAdBanner
} from './comunidad';
import { CommunitySpotlight } from './comunidad/CommunitySpotlight';
import { SidebarLeaderboardSection } from './comunidad/SidebarLeaderboardSection';
import { DescubreBanner } from '../components/comunidad/DescubreBanner';
import { SignalCardMini } from './signals';
import { SyncStatusIndicator } from '../components/SyncStatusIndicator';

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
    usuario: Usuario | null;
    onVisitProfile: (id: string) => void;
    onLoginRequest: () => void;
    onRegisterRequest: () => void;
    onUpdateUser?: (u: Usuario) => void;
}

const PAGE_SIZE = 10;

interface ConfigValue {
  value?: string;
}

const ComunidadView: React.FC<Props> = ({ usuario, onVisitProfile, onLoginRequest, onUpdateUser }) => {
    const liveConfig = useQuery(api.config.getConfig, { key: 'live_status' }) as ConfigValue | null;
    const selectedAdConfig = useQuery(api.config.getConfig, { key: 'selected_random_ad' }) as ConfigValue | null;
    const selectedAdId = selectedAdConfig?.value || "";
    
    const trendingCommunities = useQuery(api.communities.getTrendingCommunities, { limit: 5 }) as any[];
    const promotedCommunities = useQuery(api.communities.getPromotedCommunities, { limit: 3 }) as any[];
    const joinMutation = useMutation(api.communities.joinCommunity);
    const userCommunities = useQuery(api.communities.getUserCommunities, { userId: usuario?.id || '' }) as any[];
    
    // Communities queries
    const topByMembers = useQuery(api.communities.getTopCommunitiesByMembers, { limit: 3 }) as any[];
    const topByEngagement = useQuery(api.communities.getTopCommunitiesByEngagement, { limit: 3 }) as any[];
    const revelationCommunities = useQuery(api.communities.getRevelationCommunities, { limit: 3 }) as any[];
    const creatorCommunities = useQuery(api.communities.getCreatorCommunities, { limit: 3 }) as any[];
    
    const [topUsers, setTopUsers] = useState<any[]>([]);
    const leaderboard = useQuery(api.gamification.getLeaderboard, { limit: 10 }) as any[];
    useEffect(() => {
        if (leaderboard) {
            setTopUsers(leaderboard || []);
        }
    }, [leaderboard]);

    const [posts, setPosts] = useState<Publicacion[]>([]);
    const [filterType, setFilterType] = useState<CategoriaPost | 'Todos'>('Todos');
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [filterFollowing, setFilterFollowing] = useState(false);
    const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'popular' | 'viral' | 'top_points'>('relevance');
    const [justPublishedPostId, setJustPublishedPostId] = useState<string | null>(null);

    const { results: rawConvexPosts, status, loadMore } = usePaginatedQuery(
        api.posts.getPostsPaginated, 
        {}, 
        { initialNumItems: PAGE_SIZE }
    );

    const convexPosts = rawConvexPosts as ConvexPost[];
    const loading = status === "LoadingFirstPage";
    const isLoadingMore = status === "LoadingMore";
    const hasMore = status !== "Exhausted";

    
    const signalsFeatureEnabled = import.meta.env.VITE_FEATURE_SIGNALS === 'on';
    const activeSignals = useQuery(
        api.signals.getActiveSignals,
        signalsFeatureEnabled ? {} : "skip"
    ) as any[] | undefined;
    const [showWelcome, setShowWelcome] = useState(false);
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [showNewPostsPill, setShowNewPostsPill] = useState(false);
    const [pendingRawPosts, setPendingRawPosts] = useState<ConvexPost[] | null>(null);
    const [liveStatus, setLiveStatus] = useState<LiveStatus>({ isLive: false, url: '', lastUpdated: '' });
    const [editingLive, setEditingLive] = useState(false);
    const liveIframeRef = useRef<HTMLIFrameElement>(null);
    const [isLiveCinemaMode, setIsLiveCinemaMode] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Publicacion | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const { showToast } = useToast();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
    const [pulsingPostId, setPulsingPostId] = useState<string | null>(null);
    const [newPostId, setNewPostId] = useState<string | null>(null);
    const [newPostsFromTop, setNewPostsFromTop] = useState<Publicacion[]>([]);
    const [herramientasData, setHerramientasData] = useState<Herramienta[]>([]);
    const [isAgentLoading, setIsAgentLoading] = useState(false);
    const [activeCommunityChat, setActiveCommunityChat] = useState<{id: string; name: string} | null>(null);
    const [showXpToast, setShowXpToast] = useState(false);
    const [xpToastAmount, setXpToastAmount] = useState(50);
    const [feedDataSignal, setFeedDataSignal] = useState<FeedDataSignal>('live');

    // Instant feed update when new post is created
    useEffect(() => {
        if (!newPostId || !convexPosts) return;
        
        // Find the newly created post in convexPosts
        const newPost = convexPosts.find((p: any) => p._id === newPostId);
        if (newPost) {
            // Map the post and prepend to displayed posts
            const mapped = mapConvexPost(newPost);
            setPosts(prev => {
                // Avoid duplicates
                if (prev.find(p => p.id === newPostId)) return prev;
                return [mapped, ...prev];
            });
            // Highlight the new post
            setJustPublishedPostId(newPostId);
            setPulsingPostId(newPostId);
            setTimeout(() => setPulsingPostId(null), 4000);
        }
        // Clear the newPostId after processing
        setNewPostId(null);
    }, [newPostId, convexPosts]);

    const mappedPosts = useMemo(() => {
        if (!convexPosts) return [];
        return convexPosts.map(mapConvexPost);
    }, [convexPosts]);

    const openCommunityChat = (communityId: string, communityName: string) => {
        setActiveCommunityChat({ id: communityId, name: communityName });
        window.dispatchEvent(new CustomEvent('open-community-chat', {
            detail: { channelId: communityId, communityName }
        }));
    };

    const { ref: loadMoreRef, inView } = useInView();

    const loadFallbackPosts = useCallback(async () => {
        setFeedDataSignal('fallback');
        // Note: api.posts.getPosts() cannot be called directly as a function in React.
        // Feed relies on usePaginatedQuery - on exhaustion, show empty state.
        setPosts([]);
    }, []);


    // Effect to update final posts display
    useEffect(() => {
        if (convexPosts && convexPosts.length > 0) {
            setPosts(mappedPosts);
            setFeedDataSignal('live');
        } else if (status === 'Exhausted' && posts.length === 0) {
            loadFallbackPosts();
        }
    }, [convexPosts, status, mappedPosts, loadFallbackPosts]);

    const convexAds = useQuery(api.ads.getAds);
    const [ads, setAds] = useState<Ad[]>([]);

    useEffect(() => {
        if (convexAds) {
            setAds(convexAds.map((ad: any) => ({ ...ad, id: ad._id })));
        }
        StorageService.getHerramientas().then(setHerramientasData);
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [convexAds]);

    const [prevLiveState, setPrevLiveState] = useState(false);

    useEffect(() => {
        if (liveConfig && liveConfig.value) {
            try {
                const parsed = JSON.parse(liveConfig.value) as LiveStatus;
                setLiveStatus(parsed);
                if (!prevLiveState && parsed.isLive) {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification("🔴 TradeHub TV EN VIVO", {
                            body: "La transmisión acaba de iniciar. ¡Únete al análisis en tiempo real!",
                        });
                    }
                }
                setPrevLiveState(parsed.isLive);
            } catch {
                setLiveStatus({ isLive: false, url: '', lastUpdated: '' });
            }
        }
    }, [liveConfig, prevLiveState]);

    const postsWithAds = useMemo(() => {
        if (mappedPosts.length === 0) return [];
        return mappedPosts;
    }, [mappedPosts]);

    useEffect(() => {
        const handleRefresh = () => handleApplyNewPosts();
        const handleOpenCreate = () => setIsCreateModalOpen(true);
        const handleOpenCreateCommunity = () => setIsCreateCommunityOpen(true);
        window.addEventListener('refresh-feed', handleRefresh);
        window.addEventListener('open-create-modal', handleOpenCreate);
        window.addEventListener('open-create-community', handleOpenCreateCommunity);
        return () => {
            window.removeEventListener('refresh-feed', handleRefresh);
            window.removeEventListener('open-create-modal', handleOpenCreate);
            window.removeEventListener('open-create-community', handleOpenCreateCommunity);
        };
    }, [pendingRawPosts]); // eslint-disable-line react-hooks/exhaustive-deps

    // Update selected post in real-time when interactions change
    useEffect(() => {
        if (!convexPosts || !selectedPost) return;
        
        const updated = convexPosts.find((p) => p._id === selectedPost.id);
        if (updated) {
            const mapped = mapConvexPost(updated);
            if (JSON.stringify(mapped.comentarios) !== JSON.stringify(selectedPost.comentarios) || 
                mapped.likes.length !== selectedPost.likes.length) {
                setSelectedPost(mapped);
            }
        }
    }, [convexPosts, selectedPost]);

    const filteredPosts = useMemo(() => {
        const filtered = posts.filter(p => {
            if (filterType !== 'Todos' && p.categoria !== filterType) return false;
            if (filterTag && !(p.tags?.includes(filterTag))) return false;
            if (filterFollowing && !(usuario?.siguiendo || []).includes(p.idUsuario)) return false;
            return true;
        });

        let sorted: Publicacion[];

        if (sortBy === 'recent') {
            sorted = [...filtered].sort((a, b) => b.ultimaInteraccion - a.ultimaInteraccion);
        } else if (sortBy === 'popular') {
            sorted = [...filtered].sort((a, b) => {
                const engagementA = (a.likes?.length || 0) + (a.comentarios?.length || 0) * 2;
                const engagementB = (b.likes?.length || 0) + (b.comentarios?.length || 0) * 2;
                return engagementB - engagementA;
            });
        } else if (sortBy === 'viral') {
            // Viral scoring: likes (1x) + comments (2x) + shares (3x) with time decay
            const now = Date.now();
            sorted = [...filtered].sort((a, b) => {
                const hoursSinceA = (now - (a.ultimaInteraccion || a.createdAt || 0)) / (1000 * 60 * 60);
                const hoursSinceB = (now - (b.ultimaInteraccion || b.createdAt || 0)) / (1000 * 60 * 60);
                
                // Viral score: weighted engagement
                const viralScoreA = ((a.likes?.length || 0) * 1 + (a.comentarios?.length || 0) * 2 + (a.compartidos || 0) * 3);
                const viralScoreB = ((b.likes?.length || 0) * 1 + (b.comentarios?.length || 0) * 2 + (b.compartidos || 0) * 3);
                
                // Time decay: exponential with 24h half-life
                const timeDecayA = Math.exp(-hoursSinceA / 24);
                const timeDecayB = Math.exp(-hoursSinceB / 24);
                
                const finalScoreA = viralScoreA * timeDecayA;
                const finalScoreB = viralScoreB * timeDecayB;
                
                return finalScoreB - finalScoreA;
            });
        } else if (sortBy === 'top_points') {
            sorted = [...filtered].sort((a, b) => {
                const pointsA = (a as any).puntos || 0;
                const pointsB = (b as any).puntos || 0;
                return pointsB - pointsA;
            });
        } else {
            const ranked = FeedRanker.rankPosts(filtered, { userXp: usuario?.xp || 0 });
            sorted = ranked.map(item => item.data as Publicacion);
        }

        const pinned = sorted.filter(p => p.esAnuncio && p.idUsuario !== 'system');
        const rest = sorted.filter(p => !(p.esAnuncio && p.idUsuario !== 'system'));

        return [...rest, ...pinned];
    }, [posts, filterType, filterTag, filterFollowing, sortBy, usuario]);

    // Infinite scroll with Intersection Observer
    useEffect(() => {
        if (inView && hasMore && status === "CanLoadMore") {
            loadMore(PAGE_SIZE);
        }
    }, [inView, hasMore, status, loadMore]);

    // Reset filters
    useEffect(() => {
        // usePaginatedQuery handles reset automatically if the query args change, 
        // but here we are filtering locally for now to keep it simple.
        // If we want server-side filtering, we'd add it to query args.
    }, [filterType, filterTag, filterFollowing, sortBy]);

    const coursesAd = useMemo(() => {
        const matching = ads.filter(a => a.activo && a.sector === 'cursos');
        return matching.length > 0 ? matching[Math.floor(Math.random() * matching.length)] : DEFAULT_COURSES_AD;
    }, [ads]);
    const botAd = useMemo(() => {
        const matching = ads.filter(a => a.activo && a.sector === 'noticias');
        return matching.length > 0 ? matching[Math.floor(Math.random() * matching.length)] : DEFAULT_BOT_AD;
    }, [ads]);

    const extraSidebarAds = useMemo(() => {
        return ads.filter(a => a.activo && a.sector === 'sidebar' && a.id !== coursesAd.id && a.id !== botAd.id);
    }, [ads, coursesAd, botAd]);

    const bannerAds = useMemo(() => {
        const availableAds = ads.filter(a => a.activo && (a.sector === 'banner' || a.sector === 'sidebar' || a.sector === 'noticias' || a.sector === 'cursos' || a.sector === 'feed'));
        if (availableAds.length === 0) return [];
        
        return availableAds.map(ad => ({
            title: ad.titulo,
            subtitle: ad.subtitle || "Patrocinado",
            description: ad.descripcion || (ad as any).contenido || '',
            imageUrl: ad.imagenUrl,
            link: ad.link || '#',
            cta: ad.extra || "Ir Ahora",
            theme: (['blue', 'purple', 'emerald', 'orange'] as const)[Math.floor(Math.random() * 4)],
            variant: 'hero' as const
        }));
    }, [ads]);

    const randomBannerAd = useMemo(() => {
        if (bannerAds.length === 0) return null;
        return ads.find(a => a.titulo === bannerAds[0].title); // Keeping this for backward compatibility if needed elsewhere
    }, [ads, bannerAds]);

    const isVip = usuario?.rol === 'vip' || usuario?.rol === 'admin' || usuario?.rol === 'ceo' || usuario?.rol === 'programador' || usuario?.rol === 'cursante';

    const dynamicPartners = useMemo(() => {
        return herramientasData.filter(h => h.activo && (h.categoria === 'Broker' || h.tag === 'PARTNER'));
    }, [herramientasData]);

    const handleApplyNewPosts = () => {
        if (pendingRawPosts && pendingRawPosts.length > 0) {
            window.dispatchEvent(new CustomEvent('is-refreshing', { detail: true }));
            const mappedPending = (pendingRawPosts as ConvexPost[]).map(mapConvexPost);
            setNewPostsFromTop(prev => [...mappedPending, ...prev]);
            setPosts(prev => [...mappedPending, ...prev]);
            setPendingRawPosts([]);
            setShowNewPostsPill(false);
            window.dispatchEvent(new CustomEvent('new-posts-found', { detail: false }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                setNewPostsFromTop([]);
                window.dispatchEvent(new CustomEvent('is-refreshing', { detail: false }));
            }, 500);
        }
    };

    const handleCreatePost = async (data: any) => {
        if (!usuario || usuario.id === 'guest') return onLoginRequest();
        setIsCreateModalOpen(false);
        setIsPublishing(true);
        
        const tempPostId = `temp_${Date.now()}`;
        
        try {
            const createPostMutation = api.posts.createPost;
            const result = await createPostMutation({
                userId: usuario.id,
                titulo: data.titulo || '',
                contenido: data.contenido || '',
                categoria: data.categoria || 'general',
                tags: data.tags || [],
                imagenUrl: data.imagenUrl || '',
                videoUrl: data.videoUrl || '',
                youtubeUrl: data.youtubeUrl || '',
            } as any);
            
            if (result) {
                setJustPublishedPostId(tempPostId);
                setIsRefreshing(true);
                try { await StorageService.awardXP(usuario.id, 10, 'post_created'); } catch {}
            }
        } catch (error: any) {
            console.error('Error creating post:', error);
            showToast('error', error.message || 'Error al crear el post');
        } finally {
            setTimeout(() => {
                setIsPublishing(false);
                setTimeout(() => {
                    setIsRefreshing(false);
                    setJustPublishedPostId(null);
                    if (!newPostId) {
                        const myLatestPost = mappedPosts.find((p: any) => p.idUsuario === usuario.id);
                        if (myLatestPost) {
                            setPulsingPostId(myLatestPost.id);
                            setTimeout(() => setPulsingPostId(null), 4000);
                        }
                    }
                    setXpToastAmount(50);
                    setShowXpToast(true);
                    setTimeout(() => setShowXpToast(false), 3000);
                }, 500);
            }, 800);
        }
    };

    const handleLike = useCallback(async (post: Publicacion) => {
        if (!usuario || usuario.id === 'guest') return onLoginRequest();
        const hasLiked = post.likes.includes(usuario.id);
        const originalLikes = post.likes;
        const newLikes = hasLiked
            ? post.likes.filter(id => id !== usuario.id)
            : [...post.likes, usuario.id];
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));
        try {
            const likePostMutation = api.posts.likePost;
            await likePostMutation({ postId: post.id, userId: usuario.id } as any);
            if (!hasLiked && post.idUsuario && post.idUsuario !== usuario.id) {
                try { await StorageService.awardXP(post.idUsuario, 5, 'post_liked'); } catch {}
            }
        } catch (err) {
            logger.error('[ComunidadView] handleLike failed:', err);
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: originalLikes } : p));
        }
    }, [usuario, onLoginRequest]);

    const handleUpdatePost = useCallback(async (updatedPost: Publicacion) => {
        const updatePostMutation = api.posts.updatePost;
        await updatePostMutation({
            id: updatedPost.id,
            titulo: updatedPost.titulo,
            contenido: updatedPost.contenido,
            categoria: updatedPost.categoria,
            userId: usuario?.id || ''
        } as any);
    }, [usuario]);

    const handleDeletePost = useCallback(async (id: string) => {
        const deletePostMutation = api.posts.deletePost;
        await deletePostMutation({ id, userId: usuario?.id || '' } as any);
        setPosts(prev => prev.filter(p => p.id !== id));
    }, [usuario]);

    const handleFollow = useCallback(async (authorId: string) => {
        if (!usuario || usuario.id === 'guest') return onLoginRequest();
        const toggleFollowMutation = api.profiles.toggleFollow;
        await toggleFollowMutation({ followerId: usuario.id, targetId: authorId });
        const updated = await api.profiles.getProfile({ userId: usuario.id });
        if (updated && onUpdateUser) onUpdateUser(updated as any);
    }, [usuario, onLoginRequest, onUpdateUser]);

    const addComment = async (postId: string, text: string, parentId?: string) => {
        if (!usuario || usuario.id === 'guest') return onLoginRequest();
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const newComment: Comentario = {
            id: Date.now().toString(),
            idUsuario: usuario.id,
            nombreUsuario: usuario.nombre,
            avatarUsuario: usuario.avatar,
            texto: text,
            tiempo: 'Ahora',
            likes: [],
            respuestas: [],
        };

        const addReply = (comments: Comentario[]): Comentario[] =>
            comments.map(c => {
                if (c.id === parentId) return { ...c, respuestas: [...(c.respuestas || []), newComment] };
                if (c.respuestas?.length) return { ...c, respuestas: addReply(c.respuestas) };
                return c;
            });

        const updatedPost = {
            ...post,
            comentarios: parentId ? addReply(post.comentarios) : [newComment, ...post.comentarios],
            ultimaInteraccion: Date.now(),
        };
        await handleUpdatePost(updatedPost);
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
        try { await StorageService.awardXP(usuario.id, 3, 'comment_created'); } catch {}
    };

    const handleLikeComment = useCallback(async (postId: string, commentId: string) => {
        if (!usuario || usuario.id === 'guest') return onLoginRequest();
        const likeCommentMutation = api.posts.likeComment;
        await likeCommentMutation({ postId, commentId, userId: usuario.id } as any);
        setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p;
            const updateC = (comments: Comentario[]): Comentario[] =>
                comments.map(c => {
                    if (c.id === commentId) {
                        const hasLiked = (c.likes || []).includes(usuario.id);
                        return { ...c, likes: hasLiked ? c.likes.filter(id => id !== usuario.id) : [...(c.likes || []), usuario.id] };
                    }
                    if (c.respuestas?.length) return { ...c, respuestas: updateC(c.respuestas) };
                    return c;
                });
            return { ...p, comentarios: updateC(p.comentarios || []) };
        }));
    }, [usuario, onLoginRequest]);

    const handleGivePoints = useCallback(async (postId: string, points: number) => {
        if (!usuario || usuario.id === 'guest') return onLoginRequest();
        
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const originalPoints = post.puntos || 0;
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, puntos: (p.puntos || 0) + points } : p));

        try {
            const givePointsMutation = api.posts.givePoints;
            await givePointsMutation({ postId, points, userId: usuario.id } as any);
        } catch (err) {
            logger.error('[ComunidadView] handleGivePoints failed:', err);
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, puntos: originalPoints } : p));
        }
    }, [usuario, onLoginRequest, posts]);

    const handleQuickEditAd = useCallback((ad: Ad) => {
        if (usuario?.rol === 'admin') setEditingAd(ad);
    }, [usuario]);

    const saveQuickAd = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAd) return;
        const saveAdMutation = api.ads.saveAd;
        await saveAdMutation({
            id: (editingAd as any)._id || editingAd.id,
            titulo: editingAd.titulo,
            descripcion: editingAd.descripcion,
            imagenUrl: editingAd.imagenUrl,
            link: editingAd.link,
            activo: editingAd.activo,
        } as any);
        setEditingAd(null);
        loadFallbackPosts();
    }, [editingAd, loadFallbackPosts]);

    const handleSaveLive = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const updateConfigMutation = api.config.setConfig;
        await updateConfigMutation({ key: 'live_status', value: JSON.stringify(liveStatus) });
        setEditingLive(false);
    }, [liveStatus]);

    const [showSalesChat, setShowSalesChat] = useState(false);
    const isAdmin = usuario?.rol === 'admin' || usuario?.rol === 'ceo';
    const allowedTvRoles = ['cursante', 'trader_inicial', 'trader_experimentado', 'colaborador', 'diseñador', 'programador', 'admin', 'ceo', 'vip'];
    const hasTvAccess = usuario && usuario.id !== 'guest' && allowedTvRoles.includes(usuario?.rol || '');
    const isLoggedIn = usuario && usuario.id !== 'guest';

    return (
        <div className="max-w-[1400px] mx-auto px-3 pt-4 pb-6 relative space-y-6">

            {showNewPostsPill && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[45] animate-in fade-in slide-in-from-top-4 duration-300">
                    <button
                        onClick={handleApplyNewPosts}
                        className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl shadow-primary/40 flex items-center gap-2 hover:bg-blue-600 transition-all border border-white/20 backdrop-blur-md active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm animate-bounce">arrow_upward</span>
                        Nuevas Publicaciones
                    </button>
                </div>
            )}

            {showWelcome && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-[#15191f] border border-primary/20 rounded-[2.5rem] p-10 max-w-lg text-center shadow-2xl shadow-primary/10 relative overflow-hidden group">
                        <div className="absolute -top-24 -left-24 size-48 bg-primary/20 blur-[80px] rounded-full" />
                        <div className="absolute -bottom-24 -right-24 size-48 bg-blue-500/20 blur-[80px] rounded-full" />
                        <div className="size-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                            <span className="material-symbols-outlined text-4xl text-primary animate-bounce">celebration</span>
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                            ¡Bienvenido a <span className="text-primary">TradeHub</span>!
                        </h2>
                        <p className="text-gray-400 text-sm font-bold mb-8 leading-relaxed px-4">
                            Nos alegra tenerte en nuestra comunidad. Aquí encontrarás las mejores ideas y análisis para crecer como trader profesional.
                        </p>
                        <button
                            onClick={() => setShowWelcome(false)}
                            className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-primary/20 active:scale-95"
                        >
                            ¡Vamos a Ganar!
                        </button>
                    </div>
                </div>
            )}

            {editingAd && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#15191f] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
                        <h3 className="text-xl font-bold text-white mb-4">Editar Publicidad</h3>
                        <form onSubmit={saveQuickAd} className="space-y-4">
                            {[
                                { label: 'Título', key: 'titulo', required: true },
                                { label: 'Imagen URL', key: 'imagenUrl' },
                                { label: 'Video URL (Opcional)', key: 'videoUrl', placeholder: 'https://youtube.com/embed/...' },
                                { label: 'Link Destino', key: 'link' },
                                { label: 'Subtítulo / Badge', key: 'subtitle', placeholder: 'Ej: Oficial | Nuevo' },
                                { label: 'Extra (Info/Icono)', key: 'extra', placeholder: 'Metadata extra' },
                            ].map(({ label, key, required, placeholder }) => (
                                <div key={key}>
                                    <label className="text-[10px] uppercase font-bold text-gray-500">{label}</label>
                                    <input
                                        required={required}
                                        value={(editingAd as any)[key] || ''}
                                        onChange={e => setEditingAd({ ...editingAd, [key]: e.target.value })}
                                        placeholder={placeholder}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500">Descripción</label>
                                <textarea
                                    required
                                    value={editingAd.descripcion}
                                    onChange={e => setEditingAd({ ...editingAd, descripcion: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white h-20"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setEditingAd(null)} className="px-4 py-2 text-gray-400">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingLive && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#15191f] border border-red-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-red-500/20">
                        <h3 className="text-xl font-black text-red-500 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined">sensors</span>
                            Configurar Transmisión EN VIVO
                        </h3>
                        <form onSubmit={handleSaveLive} className="space-y-4">
                            <div className="flex items-center gap-3 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                <input
                                    type="checkbox"
                                    checked={liveStatus.isLive}
                                    onChange={e => setLiveStatus({ ...liveStatus, isLive: e.target.checked })}
                                    className="size-5 accent-red-500 cursor-pointer"
                                />
                                <label className="text-sm font-black uppercase text-red-500 cursor-pointer">Activar Transmisión Ahora</label>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500">Link de YouTube / Twitch</label>
                                <input
                                    required={liveStatus.isLive}
                                    value={liveStatus.url}
                                    onChange={e => setLiveStatus({ ...liveStatus, url: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-red-500 transition-colors outline-none"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setEditingLive(false)} className="px-4 py-2 text-gray-400 font-bold">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showSalesChat && (
                <div className="fixed bottom-6 right-6 z-[1000] w-[350px] bg-[#0f1115] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom">
                    <div className="bg-primary px-4 py-3 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-white text-3xl">support_agent</span>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-0.5">Asesor de Academia</h3>
                                <p className="text-[10px] text-white/70 font-bold uppercase">En Línea</p>
                            </div>
                        </div>
                        <button onClick={() => setShowSalesChat(false)} className="text-white hover:text-gray-200">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="flex-1 p-5 bg-black/50 space-y-4">
                        <div className="bg-white/5 p-4 rounded-xl rounded-tl-none border border-white/5 text-xs text-white leading-relaxed">
                            <span className="block font-black text-primary mb-2 uppercase tracking-widest text-[10px]">¡Hola! 👋</span>
                            Te invitamos a comprar el curso directamente desde la plataforma del creador para tener acceso a todo el contenido exclusivo:
                            <br/><br/>
                            <a href="https://portalib.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline hover:text-blue-400 break-all">
                                https://portalib.vercel.app/
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <LiveTVSection
                liveStatus={liveStatus}
                isAdmin={isAdmin}
                isLiveCinemaMode={isLiveCinemaMode}
                usuario={usuario}
                hasTvAccess={hasTvAccess}
                ads={ads}
                onEditLive={() => setEditingLive(true)}
                onCinemaMode={() => setIsLiveCinemaMode(true)}
                onExitCinemaMode={() => setIsLiveCinemaMode(false)}
                onOpenSalesChat={() => setShowSalesChat(true)}
            />

            <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg bg-white dark:bg-black/40">
                    <Ticker />
                </div>
                
                {/* Rotating Ad Banner - Premium VIP Style */}
                {bannerAds.length > 0 ? (
                    <RotatingAdBanner
                        ads={bannerAds}
                        interval={10}
                        className="w-full"
                    />
                ) : (
                    <AdBanner
                        title="Bot Institucional VIP"
                        subtitle="Auto Trading"
                        description="Automatiza tus operativas con algoritmos de precisión institucional. Maximiza ganancias mientras duermes."
                        link="https://portalib.vercel.app/"
                        cta="Obtener Licencia"
                        theme="purple"
                        variant="hero"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass rounded-2xl p-3 border border-gray-100 dark:border-white/5 bg-white dark:bg-black/40 sticky top-24 shadow-2xl shadow-primary/5 transition-all hover:border-primary/20 hover:backdrop-blur-3xl">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4 px-2">Explorar</h3>
                        <div className="space-y-1">
                            <FilterButton active={filterType === 'Todos' && !filterFollowing} icon="dashboard" label="Todos" onClick={() => { setFilterType('Todos'); setFilterFollowing(false); }} />
                            <FilterButton active={filterFollowing} icon="person_add" label="Seguidos" activeClass="bg-signal-green text-black shadow-signal-green/20" onClick={() => { setFilterFollowing(!filterFollowing); setFilterType('Todos'); }} />
                            {FILTER_CATEGORIES.map(({ label, icon }) => (
                                <FilterButton key={label} active={filterType === label} icon={icon} label={label} onClick={() => { setFilterType(label as any); setFilterFollowing(false); }} />
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-3 px-2">Ordenar</h3>
                            <div className="flex flex-wrap gap-1.5 px-2">
                                <button
                                    onClick={() => setSortBy('relevance')}
                                    className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${sortBy === 'relevance' ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                >
                                    Relevante
                                </button>
                                <button
                                    onClick={() => setSortBy('recent')}
                                    className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${sortBy === 'recent' ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                >
                                    Recientes
                                </button>
                                <button
                                    onClick={() => setSortBy('popular')}
                                    className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${sortBy === 'popular' ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                >
                                    Populares
                                </button>
                                <button
                                    onClick={() => setSortBy('viral')}
                                    className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${sortBy === 'viral' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                >
                                    <span className="material-symbols-outlined text-[10px]">local_fire_department</span>
                                    Viral
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4 px-2">Tendencias</h3>
                            <div className="flex flex-wrap gap-1.5 px-2">
                                {TAG_FILTERS.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                                        className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${filterTag === tag ? 'bg-primary border border-primary text-white' : 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-500 hover:border-gray-200 dark:hover:border-white/10'}`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-6 relative">
                    <CommunityHeader
                        filterType={filterType}
                        filterTag={filterTag}
                        filterFollowing={filterFollowing}
                        isAdmin={isAdmin}
                        isAgentLoading={isAgentLoading}
                        onFilterType={setFilterType}
                        onFilterTag={(tag) => setFilterTag(tag)}
                        onFilterFollowing={() => setFilterFollowing(!filterFollowing)}
                        onAgentClick={async () => {
                            try { setIsAgentLoading(true); } catch (e) { logger.error(e) } finally { setIsAgentLoading(false) }
                        }}
                    />

                    {/* Descubre Banner - Comunidades VIP (temp disabled) */}
                    {/* <DescubreBanner communities={promotedCommunities} /> */}

                    <div className="flex items-center gap-2 px-1">
                        <div className="ml-auto flex items-center gap-1">
                            <span className="text-[9px] text-gray-400 font-medium">Ordenar:</span>
                            <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-0.5">
                                <button
                                    onClick={() => setSortBy('relevance')}
                                    className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${
                                        sortBy === 'relevance'
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    Relevante
                                </button>
                                <button
                                    onClick={() => setSortBy('recent')}
                                    className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${
                                        sortBy === 'recent'
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    Recientes
                                </button>
                                <button
                                    onClick={() => setSortBy('popular')}
                                    className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${
                                        sortBy === 'popular'
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    Populares
                                </button>
                                <button
                                    onClick={() => setSortBy('viral')}
                                    className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                                        sortBy === 'viral'
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-xs">local_fire_department</span>
                                    Viral
                                </button>
                                <button
                                    onClick={() => setSortBy('top_points')}
                                    className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                                        sortBy === 'top_points'
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-xs">stars</span>
                                    Top
                                </button>
                            </div>
                        </div>
                    </div>

                    {revelationCommunities && revelationCommunities.length > 0 && (
                        <div className="glass rounded-xl p-2 border border-gray-100/50 dark:border-white/5 bg-white/80 dark:bg-black/40">
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 shrink-0">Descubre:</span>
                                {revelationCommunities.slice(0, 4).map((c: any) => (
                                    <button
                                        key={c._id}
                                        onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: `/comunidad/${c.slug}` }))}
                                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors text-[8px] font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                                    >
                                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-[6px] text-white">
                                            {c.name?.charAt(0) || 'C'}
                                        </span>
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <CommunityFeed
                        posts={posts}
                        loading={loading}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMore}
                        filteredPosts={filteredPosts}
                        usuario={usuario}
                        pulsingPostId={pulsingPostId}
                        newPostId={newPostId}
                        newPostsFromTop={newPostsFromTop}
                        onLike={handleLike}
                        onUpdate={handleUpdatePost}
                        onDelete={handleDeletePost}
                        onFollow={handleFollow}
                        onVisitProfile={onVisitProfile}
                        onReply={addComment}
                        onLikeComment={handleLikeComment}
                        onOpenPost={setSelectedPost}
                        onGivePoints={handleGivePoints}
                        loadMoreRef={loadMoreRef}
                        isRefreshing={isRefreshing}
                        isAdmin={isAdmin}
                    />
                </div>

                <div className="lg:col-span-3 space-y-6">
                    {/* Membresías - Compacta */}
                    <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-amber-400 text-lg">workspace_premium</span>
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Membresías</span>
                        </div>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'pricing' }))}
                            className="w-full py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow-lg border border-gray-700/50"
                        >
                            Ver Planes
                        </button>
                    </div>

                    {/* Top Traders + Communities - Clean Sidebar */}
                    {topUsers.length > 0 && (
                        <SidebarLeaderboardSection
                            users={topUsers.map(u => ({
                                id: u.userId || u.oderId || '',
                                nombre: u.nombre || '',
                                avatar: u.avatar || u.avatarUrl,
                                xp: u.xp || 0,
                                nivel: u.level?.level || u.nivel,
                                streak: u.streak,
                                role: u.role
                            }))}
                            currentUserId={usuario?.id}
                            onVisitProfile={(userId) => onVisitProfile?.(userId)}
                            maxDisplay={5}
                        />
                    )}

                    {/* Resultados Encuesta del Día */}
                    <DailyPollResults />
                    
                    {/* Crear Comunidad - Ancho completo */}
                    <button
                        onClick={() => setIsCreateCommunityOpen(true)}
                        className="glass rounded-xl p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <span className="material-symbols-outlined text-white text-lg">add</span>
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-[11px] font-black text-violet-400 group-hover:text-violet-300">Tu Comunidad</h3>
                                <p className="text-[9px] text-gray-500">Crea tu propio espacio</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-500 group-hover:text-violet-400 transition-colors">chevron_right</span>
                        </div>
                    </button>

                    {trendingCommunities && trendingCommunities.length > 0 && (
                        <CommunitySlider 
                            communities={trendingCommunities} 
                            onVisitCommunity={(slug) => window.dispatchEvent(new CustomEvent('navigate', { detail: `/comunidad/${slug}` }))}
                        />
                    )}
                    
                    {activeSignals && activeSignals.length > 0 && (
                        <div className="glass rounded-xl p-4 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-sm">show_chart</span>
                                    Señales Activas
                                </h3>
                                <button 
                                    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'signals' }))}
                                    className="text-[9px] text-primary hover:text-primary/80 font-bold uppercase transition-colors"
                                >
                                    Ver todas
                                </button>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                                {activeSignals.slice(0, 4).map((signal: any) => (
                                    <SignalCardMini 
                                        key={signal._id} 
                                        signal={signal}
                                        onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'signals' }))}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-4 border-t border-white/5">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 px-2 flex items-center gap-2">
                             <span className="material-symbols-outlined text-xs">handshake</span>
                             Prop Firms Partners
                        </h3>
                        <div className="grid grid-cols-1 gap-3 px-1">
                            {dynamicPartners.map(h => (
                                <PartnerCard key={h.id} logo={h.logo} name={h.nombre} benefit={h.beneficio} link={h.link} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isPublishing && <ElectricLoader fullScreen text="Energizando publicación..." />}

            <CreatePostModal
                isOpen={isCreateModalOpen}
                usuario={usuario}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreatePost}
            />

            <CreateCommunityModal
                isOpen={isCreateCommunityOpen}
                onClose={() => setIsCreateCommunityOpen(false)}
                usuario={usuario}
                onLoginRequest={onLoginRequest}
            />

            <PostDetailModal
                post={selectedPost}
                usuario={usuario}
                onLike={() => selectedPost && handleLike(selectedPost)}
                onUpdate={handleUpdatePost}
                onDelete={() => { if (selectedPost) handleDeletePost(selectedPost.id); setSelectedPost(null); }}
                onFollow={() => selectedPost && handleFollow(selectedPost.idUsuario)}
                onVisitProfile={(id) => { onVisitProfile(id); setSelectedPost(null); }}
                onReply={addComment}
                onLikeComment={handleLikeComment}
                onClose={() => setSelectedPost(null)}
            />

            {/* XP Toast Animation */}
            {showXpToast && (
                <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-right-4 fade-in duration-300">
                    <div className="bg-gradient-to-r from-yellow-500/90 to-amber-600/90 backdrop-blur-md border border-yellow-400/30 rounded-xl px-5 py-3 shadow-xl shadow-yellow-500/20 flex items-center gap-3">
                        <span className="text-2xl animate-bounce">✨</span>
                        <div>
                            <p className="text-white font-black text-sm">+{xpToastAmount} XP</p>
                            <p className="text-yellow-100 text-[10px] font-bold">Primer post del día</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Daily Poll Modal - Se muestra al abrir la app */}
            <DailyPollModal />

            {/* Sync Status Indicator */}
            <SyncStatusIndicator />
        </div>
    );
};

export default memo(ComunidadView);
