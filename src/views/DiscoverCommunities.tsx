import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import CommunitySearch from '../components/CommunitySearch';
import { Usuario } from '../types';
import { useToast } from '../components/ToastProvider';

interface Community {
  _id: any;
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
}

type CommunityTrustTier = 'new' | 'basic' | 'verified' | 'expert' | 'elite';

const PLAN_SCORE: Record<string, number> = {
  enterprise: 50, scale: 40, growth: 30, starter: 15, free: 5,
};

function getCommunityTrustScore(community: Community): number {
  const planScore = PLAN_SCORE[community.plan || 'free'] || 5;
  const memberScore = Math.min(community.currentMembers || 0, 500) * 0.05;
  const descScore = Math.min((community.description?.length || 0) * 0.1, 10);
  return Math.min(100, planScore + memberScore + descScore);
}

function getCommunityTrustTier(score: number): CommunityTrustTier {
  if (score >= 85) return 'elite';
  if (score >= 65) return 'expert';
  if (score >= 40) return 'verified';
  if (score >= 15) return 'basic';
  return 'new';
}

const TRUST_TIER_CONFIG: Record<CommunityTrustTier, { label: string; color: string; icon: string }> = {
  new: { label: 'Nueva', color: 'text-gray-400 bg-gray-500/15 border-gray-500/20', icon: 'fiber_new' },
  basic: { label: 'Básica', color: 'text-blue-400 bg-blue-500/15 border-blue-500/20', icon: 'verified' },
  verified: { label: 'Verificada', color: 'text-green-400 bg-green-500/15 border-green-500/20', icon: 'verified' },
  expert: { label: 'Experta', color: 'text-purple-400 bg-purple-500/15 border-purple-500/20', icon: 'workspace_premium' },
  elite: { label: 'Élite', color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/20', icon: 'workspace_premium' },
};

interface DiscoverCommunitiesProps {
  usuario: Usuario | null;
  onVisitProfile?: (id: string) => void;
  onLoginRequest?: () => void;
}

const DiscoverCommunities: React.FC<DiscoverCommunitiesProps> = ({
  usuario,
  onVisitProfile,
  onLoginRequest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const { showToast } = useToast();

  const trendingCommunities = useQuery(api.communities.getTrendingCommunities, { limit: 6 }) as Community[] | undefined;
  const listCommunities = useQuery(api.communities.listPublicCommunities, { limit: 20 }) as Community[] | undefined;
  const joinMutation = useMutation(api.communities.joinCommunity);
  const userCommunities = usuario ? (useQuery(api.communities.getUserCommunities, { userId: usuario.id }) || []) : [];
  const userSubcommunities = usuario ? useQuery(api.subcommunities.getUserSubcommunities, { userId: usuario.id }) : [];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (trendingCommunities && trendingCommunities.length > 0) {
      setCommunities(trendingCommunities);
    } else if (listCommunities && listCommunities.length > 0) {
      setCommunities(listCommunities);
    }
  }, [trendingCommunities, listCommunities]);

  const rankedCommunities = useMemo(() => {
    if (!communities || communities.length === 0) return [];
    
    const promoted = communities.filter((c: any) => c.isPromoted);
    const regular = communities.filter((c: any) => !c.isPromoted);
    
    const sortByTrust = (arr: any[]) => 
      [...arr].sort((a, b) => {
        const scoreA = getCommunityTrustScore(a);
        const scoreB = getCommunityTrustScore(b);
        return scoreB - scoreA;
      });
    
    return [...sortByTrust(promoted), ...sortByTrust(regular)];
  }, [communities]);

  const handleVisitCommunity = (slug: string) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: `/comunidad/${slug}` }));
  };

  const handleJoinCommunity = async (communityId: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!usuario) {
      onLoginRequest?.();
      return;
    }
    try {
      await joinMutation({ communityId, userId: usuario.id } as any);
      showToast('success', '¡Te has unido a la comunidad!');
    } catch (err: any) {
      showToast('error', err.message || 'Error al unirse');
    }
  };

  const isUserMember = (communityId: any) => {
    return userCommunities.some((uc: any) => uc._id === communityId);
  };

  const formatMembers = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count?.toString() || '0';
  };

  const getCoverImage = (name: string, index: number) => {
    const covers = [
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
      'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80',
      'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&q=80',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
      'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800&q=80',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    ];
    return covers[index % covers.length];
  };

  const isCommunityOwner = (communityOwnerId: string) => {
    return usuario?.id === communityOwnerId;
  };

  const handleGoToAdminPanel = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('navigate', { detail: `/comunidad/${slug}/admin` }));
  };

  const handleCreatePost = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('navigate', { detail: `/comunidad/${slug}?newPost=true` }));
  };

  const CommunityCard = ({ community, index }: { community: Community; index: number }) => {
    const isMember = isUserMember(community._id);
    const trustScore = getCommunityTrustScore(community);
    const trustTier = getCommunityTrustTier(trustScore);
    const tierConfig = TRUST_TIER_CONFIG[trustTier];
    const isOwner = isCommunityOwner(community.ownerId || '');
    
    const PLAN_COLORS: Record<string, { bg: string; border: string; text: string }> = {
      enterprise: { bg: 'from-yellow-400/20 to-amber-500/10', border: 'border-yellow-400/30', text: 'text-yellow-300' },
      scale: { bg: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
      growth: { bg: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
      starter: { bg: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
      free: { bg: 'from-gray-500/20 to-gray-600/10', border: 'border-gray-500/30', text: 'text-gray-400' },
    };
    const planStyle = PLAN_COLORS[community.plan || 'free'] || PLAN_COLORS.free;

    return (
      <div
        onClick={() => handleVisitCommunity(community.slug)}
        className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10"
      >
        {/* Glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Background Card */}
        <div className="relative glass rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden bg-black/40">
          {/* Cover Image */}
          <div className="relative h-32 overflow-hidden">
            <img
              src={getCoverImage(community.name, index)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              alt={community.name}
              onError={(e) => { e.currentTarget.src = 'https://picsum.photos/seed/' + community.slug + '/800/400'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/60 to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {community.plan && community.plan !== 'free' && (
                <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-gradient-to-r ${planStyle.bg} ${planStyle.border} ${planStyle.text} border`}>
                  {community.plan}
                </span>
              )}
              <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                community.accessType === 'free'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {community.accessType === 'free' ? 'Gratis' : 'Premium'}
              </span>
            </div>
            
            {/* Avatar */}
            <div className="absolute -bottom-6 left-4">
              <div className="size-12 rounded-xl bg-gradient-to-br from-primary/60 to-violet-600/40 border-2 border-white/20 flex items-center justify-center shadow-xl shadow-primary/20">
                <span className="text-xl font-black text-white">{community.name.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="relative p-5 pt-12">
            {/* Trust Tier */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${tierConfig.color}`}>
                <span className="material-symbols-outlined text-[10px]">{tierConfig.icon}</span>
                {tierConfig.label}
              </span>
              <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${trustScore}%` }}
                />
              </div>
            </div>
            
            {/* Title */}
            <h3 className="text-base font-black text-white uppercase tracking-wide mb-1 group-hover:text-primary transition-colors">
              {community.name}
            </h3>
            <p className="text-[10px] text-gray-600 font-medium mb-3">/c/{community.slug}</p>
            
            {/* Description */}
            <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
              {community.description}
            </p>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="material-symbols-outlined text-sm">group</span>
                  <span className="font-bold text-white">{formatMembers(community.currentMembers)}</span>
                </span>
              </div>
              {isOwner ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCreatePost(community.slug, e)}
                    className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-600/90 hover:to-purple-600/90 text-white shadow-lg shadow-purple-500/20"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Publicar
                  </button>
                  <button
                    onClick={(e) => handleGoToAdminPanel(community.slug, e)}
                    className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500/90 hover:to-orange-500/90 text-white shadow-lg shadow-amber-500/20"
                  >
                    <span className="material-symbols-outlined text-sm">settings</span>
                    Admin
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => handleJoinCommunity(community._id, e)}
                  disabled={isMember}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                    isMember
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                      : 'bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white shadow-lg shadow-primary/20 active:scale-95'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{isMember ? 'check' : 'add'}</span>
                  {isMember ? 'Miembro' : 'Unirse'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const top3Communities = rankedCommunities.slice(0, 3);
  const mediumCommunities = rankedCommunities.slice(3, 10);
  const remainingCommunities = rankedCommunities.slice(10);

  const handleCreateCommunity = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: '/creator-studio' }));
  };

  const FeaturedCommunityBanner = ({ community, index }: { community: Community; index: number }) => {
    const isMember = isUserMember(community._id);
    const isOwner = isCommunityOwner(community.ownerId || '');
    
    return (
      <div
        onClick={() => handleVisitCommunity(community.slug)}
        className="relative overflow-hidden rounded-2xl cursor-pointer group"
      >
        {/* Banner Image */}
        <div className="relative h-48 md:h-56 overflow-hidden">
          <img
            src={community.coverImage || getCoverImage(community.name, index)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt={community.name}
            onError={(e) => { e.currentTarget.src = getCoverImage(community.name, index); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          
          {/* Rank Badge */}
          <div className="absolute top-4 left-4">
            <div className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
              index === 0 ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' :
              index === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/30' :
              'bg-amber-600/20 text-amber-500 border border-amber-600/30'
            }`}>
              <span className="material-symbols-outlined text-sm">
                {index === 0 ? 'emoji_events' : index === 1 ? 'military_tech' : 'workspace_premium'}
              </span>
              #{index + 1}
            </div>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-xl bg-gradient-to-br from-primary/60 to-violet-600/40 border-2 border-white/30 flex items-center justify-center shadow-xl">
                <span className="text-2xl font-black text-white">{community.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wide group-hover:text-primary transition-colors">
                  {community.name}
                </h3>
                <p className="text-xs text-gray-400 font-medium">/c/{community.slug}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Miembros</p>
                <p className="text-lg font-black text-white">{formatMembers(community.currentMembers)}</p>
              </div>
              {isOwner ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleCreatePost(community.slug, e)}
                    className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-600/90 hover:to-purple-600/90 text-white shadow-lg shadow-purple-500/25"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Publicar
                  </button>
                  <button
                    onClick={(e) => handleGoToAdminPanel(community.slug, e)}
                    className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500/90 hover:to-orange-500/90 text-white shadow-lg shadow-amber-500/25"
                  >
                    <span className="material-symbols-outlined text-sm">settings</span>
                    Admin
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => handleJoinCommunity(community._id, e)}
                  disabled={isMember}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    isMember
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : 'bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white shadow-lg shadow-primary/25'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{isMember ? 'check' : 'add'}</span>
                  {isMember ? 'Miembro' : 'Unirse'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-[1600px] mx-auto px-4 pt-16 pb-8 space-y-8">
        {/* Header - Premium VIP Style */}
        <div className="relative overflow-hidden rounded-2xl">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[80px] rounded-full" />
          
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/30 to-violet-600/20 border border-primary/30 flex items-center justify-center shadow-xl shadow-primary/10">
                  <span className="material-symbols-outlined text-primary text-2xl">explore</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest">
                    Descubrir Comunidades
                  </h1>
                  <p className="text-sm text-gray-400 font-medium mt-1">
                    Explora y únete a comunidades de trading premium
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateCommunity}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Crear Comunidad
                </button>
                <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400">
                  {rankedCommunities.length} comunidades
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass rounded-2xl border border-white/10 backdrop-blur-xl p-4">
          <CommunitySearch
            usuario={usuario}
            onVisitCommunity={handleVisitCommunity}
            onLoginRequest={onLoginRequest}
            variant="full"
          />
        </div>

        {communities && communities.length > 0 ? (
          <div className="space-y-8">
            {/* Top 3 Featured Communities - Banner Style */}
            {top3Communities.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-500/10 border border-yellow-400/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-yellow-400 text-xl">emoji_events</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">
                      Top 3 Comunidades
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      Las comunidades más destacadas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {top3Communities.map((community, index) => (
                    <FeaturedCommunityBanner key={community._id} community={community} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Positions 4-10: Medium Banners */}
            {mediumCommunities.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 border border-violet-400/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-violet-400 text-xl">stars</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">
                      Comunidades Destacadas
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      Crecimiento rápido y alta actividad
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mediumCommunities.map((community, index) => (
                    <div
                      key={community._id}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CommunityCard community={community} index={index + 3} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Position 11+: Elegant List */}
            {remainingCommunities.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-violet-600/10 border border-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-xl">groups</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white uppercase tracking-wider">
                        Todas las Comunidades
                      </h2>
                      <p className="text-xs text-gray-500 font-medium">
                        Explora más comunidades
                      </p>
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-violet-600/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                    {remainingCommunities.length} comunidades
                  </span>
                </div>

                <div className="glass rounded-xl border border-white/10 divide-y divide-white/5">
                  {remainingCommunities.map((community, index) => {
                    const isMember = isUserMember(community._id);
                    const trustScore = getCommunityTrustScore(community);
                    const trustTier = getCommunityTrustTier(trustScore);
                    const tierConfig = TRUST_TIER_CONFIG[trustTier];
                    
                    return (
                      <div
                        key={community._id}
                        onClick={() => handleVisitCommunity(community.slug)}
                        className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer group animate-in fade-in duration-300"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="size-10 rounded-lg bg-gradient-to-br from-primary/40 to-violet-600/30 flex items-center justify-center shrink-0">
                          <span className="text-sm font-black text-white">{community.name.charAt(0).toUpperCase()}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                              {community.name}
                            </h4>
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${tierConfig.color}`}>
                              {tierConfig.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{community.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">group</span>
                            {formatMembers(community.currentMembers)}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleJoinCommunity(community._id, e); }}
                            disabled={isMember}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                              isMember
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                            }`}
                          >
                            {isMember ? 'Miembro' : 'Unirse'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Empty State */}
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-transparent" />
              
              <div className="relative glass rounded-2xl border border-white/10 backdrop-blur-xl p-16 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full mx-auto w-32 h-32" />
                  <div className="relative size-20 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-600/10 border border-white/10 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-primary text-4xl">groups</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">
                  No hay comunidades todavía
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
                  ¡Sé el primero en crear una comunidad y lidera la próxima revolución del trading social!
                </p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: '/crear-comunidad' }))}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 mx-auto"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Crear Primera Comunidad
                </button>
              </div>
            </div>
          </div>
        )}

        {userSubcommunities && userSubcommunities.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 border border-violet-400/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-violet-400 text-xl">groups</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest">Mis Subcomunidades</h2>
                <p className="text-xs text-white/50">{userSubcommunities.length} subcomunidades activas</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSubcommunities.map((sub: any) => (
                <div
                  key={sub._id}
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: `/subcommunity/${sub.parentId}/${sub.slug}` }))}
                  className="glass rounded-xl border border-white/10 p-4 cursor-pointer hover:border-violet-400/30 hover:bg-violet-500/5 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">{sub.name}</h3>
                    {sub.tvIsLive && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[8px] font-black uppercase rounded-full animate-pulse">EN VIVO</span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 mb-3 line-clamp-2">{sub.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span>{sub.currentMembers} miembros</span>
                    <span className={`px-2 py-0.5 rounded-full ${sub.memberRole === 'owner' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/50'}`}>
                      {sub.memberRole}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="trending_up"
            title="Comunidades Trending"
            description="Las comunidades más activas y con más miembros"
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon="verified"
            title="Creadores Verificados"
            description="Únete a comunidades de traders profesionales"
            gradient="from-emerald-500 to-teal-500"
          />
          <FeatureCard
            icon="lock_open"
            title="Acceso Libre"
            description="Muchas comunidades son completamente gratuitas"
            gradient="from-purple-500 to-pink-500"
          />
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-2xl p-6 border border-primary/10">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl">tips_and_updates</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                ¿No encuentras lo que buscas?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Crea tu propia comunidad y empieza a construir tu audiencia
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: '/crear-comunidad' }))}
                className="px-4 py-2 bg-primary hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-primary/20"
              >
                Crear Comunidad
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradient }) => (
  <div className="bg-white dark:bg-[#1a1d21] rounded-xl p-5 border border-gray-100 dark:border-white/10 hover:shadow-lg transition-shadow">
    <div className={`size-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg`}>
      <span className="material-symbols-outlined text-white text-lg">{icon}</span>
    </div>
    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
  </div>
);

export default DiscoverCommunities;
