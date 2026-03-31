import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Usuario } from '../types';
import { useToast } from '../components/ToastProvider';
import { CommunityFeed, CreatePostModal } from './comunidad';
import { CreateSubcomunidadModal } from './comunidad/CreateSubcomunidadModal';
import { Publicacion } from '../types';

interface Subcommunity {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  currentMembers: number;
  maxMembers: number;
  visibility?: string;
  plan?: string;
  status: string;
  tvIsLive?: boolean;
}

interface CommunityMember {
  _id: string;
  role: string;
  userId: string;
}

interface Community {
  _id: string;
  name: string;
  slug: string;
  description: string;
  currentMembers: number;
  maxMembers: number;
  accessType: 'free' | 'paid';
  priceMonthly?: number;
  visibility: string;
  coverImage?: string;
  ownerId?: string;
  plan?: string;
  ownerTrustScore?: number;
  members?: CommunityMember[];
}

interface Props {
  slug?: string;
  usuario: Usuario | null;
  onVisitProfile: (id: string) => void;
  onLoginRequest: () => void;
  onBack: () => void;
}

const PLAN_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  enterprise: { color: 'from-yellow-500 via-amber-500 to-orange-500', label: 'Enterprise', icon: 'workspace_premium' },
  scale: { color: 'from-purple-500 via-violet-500 to-fuchsia-500', label: 'Scale', icon: 'trending_up' },
  growth: { color: 'from-blue-500 via-cyan-500 to-teal-500', label: 'Growth', icon: 'show_chart' },
  starter: { color: 'from-emerald-500 via-green-500 to-teal-500', label: 'Starter', icon: 'rocket_launch' },
  free: { color: 'from-gray-500 via-gray-400 to-gray-300', label: 'Free', icon: 'public' },
};

function getCoverUrl(name: string, index: number): string {
  const covers = [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80',
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80',
    'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80',
    'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=1200&q=80',
  ];
  return covers[index % covers.length];
}

const CommunityDetailView: React.FC<Props> = ({
  slug,
  usuario,
  onVisitProfile,
  onLoginRequest,
  onBack,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast } = useToast();

  const community = useQuery(
    api.communities.getCommunity,
    slug ? { slug } : "skip"
  ) as Community | null | undefined;

  const subcommunities = useQuery(
    api.subcommunities.getSubcommunities,
    community?._id ? { parentId: community._id as any } : "skip"
  ) as Subcommunity[] | undefined;

  const joinMutation = useMutation(api.communities.joinCommunity);
  const createPostMutation = useMutation(api.communities.createPost);
  const likePostMutation = useMutation(api.communities.likePost);
  const deletePostMutation = useMutation(api.communities.deletePost);
  
  const [joining, setJoining] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateSubcomunidad, setShowCreateSubcomunidad] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const posts = useQuery(
    api.communities.getCommunityPosts,
    community?._id ? { communityId: community._id as any } : "skip"
  ) as any[];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const isMember = useMemo(() => {
    if (!community?.members || !usuario) return false;
    return community.members.some(m => m.userId === usuario.id);
  }, [community?.members, usuario]);

  const owner = useMemo(() => {
    if (!community?.ownerId) return null;
    return community.members?.find(m => m.role === 'owner');
  }, [community]);

  const planConfig = PLAN_CONFIG[community?.plan || 'free'];

  const handleJoin = async () => {
    if (!usuario) {
      onLoginRequest();
      return;
    }
    if (!community?._id) return;
    setJoining(true);
    try {
      await joinMutation({ communityId: community._id as any, userId: usuario.id } as any);
      showToast('success', `¡Te uniste a ${community.name}!`);
    } catch (err: any) {
      showToast('error', err.message || 'Error al unirse');
    } finally {
      setJoining(false);
    }
  };

  const handleVisitSubcommunity = (subSlug: string) => {
    window.dispatchEvent(new CustomEvent('navigate', {
      detail: { detail: `subcommunity/${community?.slug}/${subSlug}` }
    }));
  };

  const handleLike = async (post: Publicacion) => {
    if (!usuario) {
      onLoginRequest();
      return;
    }
    try {
      await likePostMutation({ postId: post.id as any, userId: usuario.id });
    } catch (err: any) {
      showToast('error', err.message || 'Error al dar like');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!usuario) return;
    try {
      await deletePostMutation({ postId: postId as any, userId: usuario.id });
      showToast('success', 'Publicación eliminada');
    } catch (err: any) {
      showToast('error', err.message || 'Error al eliminar');
    }
  };

  const handleCreatePost = async (data: any) => {
    if (!usuario || !community?._id) return;
    try {
      await createPostMutation({
        communityId: community._id as any,
        userId: usuario.id,
        titulo: data.titulo,
        contenido: data.contenido,
        imagenUrl: data.imagenUrl,
        tipo: data.tipo || 'text',
        tags: data.tags,
      });
      showToast('success', '¡Publicación creada con éxito!');
      setShowCreatePost(false);
    } catch (err: any) {
      showToast('error', err.message || 'Error al crear publicación');
    }
  };

  const formatMembers = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count?.toString() || '0';
  };

  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <span className="material-symbols-outlined text-5xl text-gray-600 mb-4">link_off</span>
        <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">Comunidad no encontrada</h2>
        <p className="text-sm text-gray-500">La comunidad no existe o fue eliminada.</p>
        <button onClick={onBack} className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-wider">
          Volver
        </button>
      </div>
    );
  }

  if (community === undefined || subcommunities === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Cargando comunidad...</p>
      </div>
    );
  }

  if (community === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <span className="material-symbols-outlined text-5xl text-gray-600 mb-4">search_off</span>
        <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">Comunidad no encontrada</h2>
        <p className="text-sm text-gray-500 mb-6">Esta comunidad no existe o fue eliminada.</p>
        <button onClick={onBack} className="px-6 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-wider">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-[1600px] mx-auto px-4 pt-16 pb-8 space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver a comunidades
        </button>

        {/* Hero Section - Premium VIP Style */}
        <div className="relative overflow-hidden rounded-2xl">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={community.coverImage || getCoverUrl(community.name, community.name.charCodeAt(0) % 6)}
              className="w-full h-64 md:h-80 object-cover"
              alt={community.name}
              onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${community.slug}/1200/400`; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/60 to-[#0a0c10]/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-violet-500/10" />
          </div>
          
          {/* Glow Effects */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[80px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500/10 blur-[80px] rounded-full" />

          {/* Content */}
          <div className="relative p-6 md:p-8">
            {/* Plan Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg bg-gradient-to-r ${planConfig.color} text-white border border-white/10`}>
                  <span className="material-symbols-outlined text-[10px] align-text-bottom mr-1">{planConfig.icon}</span>
                  {planConfig.label}
                </span>
                <span className={`text-[9px] font-bold uppercase px-3 py-1 rounded-lg ${
                  community.accessType === 'free'
                    ? 'bg-signal-green/20 text-signal-green border border-signal-green/30'
                    : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {community.accessType === 'free' ? 'Gratis' : `Premium $${community.priceMonthly}/mes`}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              {/* Avatar & Info */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="size-16 md:size-20 rounded-2xl bg-gradient-to-br from-primary/60 to-violet-600/40 border-2 border-white/20 flex items-center justify-center shadow-xl shadow-primary/20">
                    <span className="text-3xl font-black text-white uppercase">{community.name.charAt(0)}</span>
                  </div>
                  {/* Online Indicator */}
                  <div className="absolute -bottom-1 -right-1 size-4 bg-signal-green rounded-full border-2 border-[#0a0c10]" />
                  {/* VIP Crown for Enterprise */}
                  {community.plan === 'enterprise' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="material-symbols-outlined text-amber-400 text-xl drop-shadow-lg">workspace_premium</span>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-1">{community.name}</h1>
                  <p className="text-xs text-gray-400 font-medium">/c/{community.slug}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isMember && community.visibility !== 'public' && (
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-community-chat', { detail: { channelId: community._id, communityName: community.name } }))}
                    className="px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/30 hover:from-violet-500/30 hover:to-purple-500/30"
                  >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    Chat
                  </button>
                )}
                <button
                  onClick={handleJoin}
                  disabled={isMember || joining}
                  className={`w-full md:w-auto px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isMember
                      ? 'bg-gradient-to-r from-signal-green/20 to-emerald-500/10 text-signal-green border border-signal-green/30 cursor-default'
                      : 'bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white shadow-lg shadow-primary/30 active:scale-[0.98]'
                  }`}
                >
                  {joining ? (
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-lg">{isMember ? 'verified' : 'group_add'}</span>
                  )}
                  {joining ? 'Procesando...' : isMember ? 'Ya eres miembro' : 'Unirse'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Description Card */}
        <div className="glass rounded-2xl border border-white/10 backdrop-blur-xl p-6">
          <p className="text-sm text-gray-400 leading-relaxed mb-6">{community.description}</p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">group</span>
              </div>
              <div>
                <span className="text-lg font-black text-white">{formatMembers(community.currentMembers)}</span>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Miembros</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
              <div className="size-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-violet-400">subdirectory_arrow_right</span>
              </div>
              <div>
                <span className="text-lg font-black text-white">{subcommunities?.length || 0}</span>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Sub-comunidades</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
              <div className="size-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-cyan-400">{community.visibility === 'public' ? 'public' : 'lock'}</span>
              </div>
              <div>
                <span className="text-sm font-black text-white capitalize">{community.visibility === 'public' ? 'Pública' : community.visibility === 'private' ? 'Privada' : 'No listada'}</span>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Visibilidad</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
              <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400">trending_up</span>
              </div>
              <div>
                <span className="text-sm font-black text-white">{community.maxMembers}</span>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Máximo</p>
              </div>
            </div>
          </div>
        </div>

        {subcommunities && subcommunities.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">subdirectory_arrow_right</span>
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Sub-Comunidades</h2>
                  <p className="text-xs text-gray-500">{subcommunities.length} comunidades dentro</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(community.ownerId === usuario?.id || (owner && (owner as any).role === 'admin')) && (
                  <button
                    onClick={() => setShowCreateSubcomunidad(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-xs font-bold transition-all border border-purple-500/30"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Crear
                  </button>
                )}
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400">
                  {subcommunities.length} total
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {subcommunities.map((sub, index) => {
                const subPlan = (sub as any).plan || 'free';
                const subType = (sub as any).type || 'general';
                const typeIcons: Record<string, string> = {
                  general: 'groups',
                  support: 'support_agent',
                  help: 'help',
                  group: 'school',
                  courses: 'menu_book',
                };
                const typeColors: Record<string, string> = {
                  general: 'from-primary/20 to-violet-500/20 border-primary/30',
                  support: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
                  help: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
                  group: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
                  courses: 'from-rose-500/20 to-pink-500/20 border-rose-500/30',
                };
                const planColors: Record<string, string> = {
                  free: 'from-gray-500/10 to-gray-600/5 border-gray-500/20',
                  starter: 'from-blue-500/10 to-cyan-500/5 border-blue-500/20',
                  growth: 'from-violet-500/10 to-purple-500/5 border-violet-500/20',
                  scale: 'from-amber-500/10 to-orange-500/5 border-amber-500/20',
                  enterprise: 'from-yellow-400/20 to-amber-500/10 border-yellow-400/30',
                };
                const planBadge: Record<string, string> = {
                  free: 'bg-gray-500/20 text-gray-400',
                  starter: 'bg-blue-500/20 text-blue-400',
                  growth: 'bg-violet-500/20 text-violet-400',
                  scale: 'bg-amber-500/20 text-amber-400',
                  enterprise: 'bg-gradient-to-r from-yellow-400/30 to-amber-500/20 text-yellow-300',
                };
                return (
                  <div
                    key={sub._id}
                    onClick={() => handleVisitSubcommunity(sub.slug)}
                    className={`group relative overflow-hidden bg-gradient-to-br ${typeColors[subType] || typeColors.general} rounded-2xl p-6 hover:scale-[1.01] transition-all cursor-pointer border backdrop-blur-xl`}
                  >
                    <div className="flex items-start gap-5">
                      <div className="size-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-2xl text-white">{typeIcons[subType] || 'groups'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">{sub.name}</h3>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${planBadge[subPlan] || planBadge.free} border`}>
                            {subPlan}
                          </span>
                          {subType !== 'general' && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-white/10 text-white/70 border border-white/10">
                              {subType}
                            </span>
                          )}
                          {(sub as any).visibility === 'private' && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-400">
                              <span className="material-symbols-outlined text-sm">lock</span>
                            </span>
                          )}
                          {(sub as any).visibility === 'invite_only' && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-400">
                              <span className="material-symbols-outlined text-sm">person_add</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{sub.description}</p>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span className="material-symbols-outlined text-sm">group</span>
                            <span className="font-medium">{formatMembers(sub.currentMembers)} miembros</span>
                          </span>
                          {(sub as any).tvIsLive && (
                            <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                              <span className="size-1.5 bg-red-500 rounded-full animate-pulse" />
                              EN VIVO
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors text-2xl">chevron_right</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {subcommunities && subcommunities.length === 0 && (
          <div className="bg-white dark:bg-black/40 rounded-2xl p-8 border border-gray-100 dark:border-white/5 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-600 mb-3 block">group_add</span>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Sin sub-comunidades aún</h3>
            <p className="text-xs text-gray-500">Esta comunidad aún no tiene sub-comunidades. ¡Sé el primero en crear una!</p>
          </div>
        )}

        {/* Community Feed Section */}
        <div className="space-y-6 pt-8 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">feed</span>
              Feed de la Comunidad
            </h2>
            {isMember && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-primary/20"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Publicar
              </button>
            )}
          </div>

          <CommunityFeed
            posts={posts || []}
            loading={posts === undefined}
            isLoadingMore={false}
            hasMore={false}
            filteredPosts={posts || []}
            usuario={usuario}
            pulsingPostId={null}
            newPostId={null}
            newPostsFromTop={[]}
            onLike={handleLike}
            onUpdate={() => {}}
            onDelete={handleDelete}
            onFollow={() => {}}
            onVisitProfile={onVisitProfile}
            onReply={() => {}}
            onLikeComment={() => {}}
            onOpenPost={() => {}}
            onGivePoints={() => {}}
            isRefreshing={isRefreshing}
            isAdmin={community.ownerId === usuario?.id}
          />
        </div>

        {showCreatePost && (
          <CreatePostModal
            isOpen={showCreatePost}
            onClose={() => setShowCreatePost(false)}
            onSubmit={handleCreatePost}
            usuario={usuario}
          />
        )}

        {showCreateSubcomunidad && community && usuario && (
          <CreateSubcomunidadModal
            isOpen={showCreateSubcomunidad}
            onClose={() => setShowCreateSubcomunidad(false)}
            parentCommunityId={community._id as string}
            parentCommunitySlug={community.slug}
            ownerId={usuario.id}
            onSuccess={() => setShowCreateSubcomunidad(false)}
          />
        )}

        <div className="flex justify-center pt-4">
          <button
            onClick={handleJoin}
            disabled={isMember || joining}
            className={`px-8 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all ${
              isMember
                ? 'bg-signal-green/20 text-signal-green cursor-default'
                : 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/30'
            }`}
          >
            {joining ? '...' : isMember ? 'Ya eres miembro' : `Unirse a ${community.name}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetailView;
