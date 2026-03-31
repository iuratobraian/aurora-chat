import React, { useState, lazy, Suspense } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Usuario } from '../../types';
import SubcommunityFeed from './SubcommunityFeed';
import SubcommunityChat from './SubcommunityChat';
import SubcommunityTV from './SubcommunityTV';
import SubcommunitySettings from './SubcommunitySettings';
import ElectricLoader from '../../components/ElectricLoader';

const CursosView = lazy(() => import('../CursosView'));

interface Props {
  usuario: Usuario | null;
  onVisitProfile: (id: string) => void;
  onLoginRequest: () => void;
  parentSlug?: string;
  subSlug?: string;
  onBack?: () => void;
}

type TabType = 'feed' | 'chat' | 'tv' | 'courses' | 'settings';

const SubcommunityView: React.FC<Props> = ({ usuario, onVisitProfile, onLoginRequest, parentSlug: propParentSlug, subSlug: propSubSlug, onBack }) => {
  const parentSlug = propParentSlug || '';
  const subSlug = propSubSlug || '';
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [joining, setJoining] = useState(false);
  const [filterType, setFilterType] = useState<string>('Todos');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'popular'>('recent');

  const parentCommunity = useQuery(
    api.communities.getCommunity,
    parentSlug ? { slug: parentSlug } : "skip"
  );

  const subcommunity = useQuery(
    api.subcommunities.getSubcommunity,
    parentCommunity?._id && subSlug
      ? { parentId: parentCommunity._id, slug: subSlug }
      : "skip"
  );

  const accessInfo = useQuery(
    api.subcommunities.checkAccess,
    subcommunity?._id && usuario?.id
      ? { subcommunityId: subcommunity._id, userId: usuario.id }
      : "skip"
  );

  const subscription = useQuery(
    api.subcommunities.checkSubscription,
    subcommunity?._id && usuario?.id
      ? { subcommunityId: subcommunity._id, userId: usuario.id }
      : "skip"
  );

  const joinMutation = useMutation(api.subcommunities.joinSubcommunity);
  const subscribeMutation = useMutation(api.subcommunities.subscribeToSubcommunity);

  const [joinError, setJoinError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  if (!parentSlug || !subSlug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <span className="material-symbols-outlined text-5xl text-gray-600 mb-4">link_off</span>
        <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">URL Inválida</h2>
        <p className="text-sm text-gray-500">La subcomunidad no fue encontrada.</p>
      </div>
    );
  }

  if (parentCommunity === undefined || subcommunity === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ElectricLoader type="phrase" phrase="Cargando subcomunidad..." />
      </div>
    );
  }

  if (parentCommunity === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
        <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">Comunidad no encontrada</h2>
        <p className="text-sm text-gray-500">La comunidad padre "{parentSlug}" no existe.</p>
      </div>
    );
  }

  if (subcommunity === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <span className="material-symbols-outlined text-5xl text-yellow-400 mb-4">groups_3</span>
        <h2 className="text-xl font-black uppercase tracking-widest text-white mb-2">Subcomunidad no encontrada</h2>
        <p className="text-sm text-gray-500">La subcomunidad "{subSlug}" no existe en {parentCommunity.name}.</p>
      </div>
    );
  }

  const isMember = accessInfo?.hasAccess ?? false;
  const isOwner = accessInfo?.role === 'owner';
  const isAdmin = accessInfo?.role === 'admin' || isOwner;
  const memberCount = subcommunity.currentMembers ?? subcommunity.members?.length ?? 0;
  const isPaid = (subcommunity as any)?.accessType === 'paid';
  const priceMonthly = (subcommunity as any)?.priceMonthly ?? 0;

  const handleJoin = async () => {
    if (!usuario) {
      onLoginRequest();
      return;
    }
    setJoinError(null);
    if (isPaid) {
      setShowPaywall(true);
      return;
    }
    setJoining(true);
    try {
      await joinMutation({ subcommunityId: subcommunity._id, userId: usuario.id });
    } catch (e: any) {
      setJoinError(e?.message || 'Error al unirse');
    } finally {
      setJoining(false);
    }
  };

  const handleSubscribe = async () => {
    if (!usuario) {
      onLoginRequest();
      return;
    }
    setJoining(true);
    try {
      await subscribeMutation({
        subcommunityId: subcommunity._id,
        userId: usuario.id,
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
      setShowPaywall(false);
    } catch (e: any) {
      setJoinError(e?.message || 'Error al suscribirse');
    } finally {
      setJoining(false);
    }
  };

  const isCoursesType = (subcommunity as any)?.type === 'courses';
  
  const chatTab: { id: TabType; label: string; icon: string } = { id: 'chat', label: 'Chat', icon: 'chat' };
  const tvTab: { id: TabType; label: string; icon: string } = { id: 'tv', label: 'TV', icon: 'live_tv' };
  const settingsTab: { id: TabType; label: string; icon: string } = { id: 'settings', label: 'Ajustes', icon: 'settings' };
  const feedTab: { id: TabType; label: string; icon: string } = { id: 'feed', label: 'Feed', icon: 'article' };
  const coursesTab: { id: TabType; label: string; icon: string } = { id: 'courses', label: 'Cursos', icon: 'menu_book' };
  
  const tabs: { id: TabType; label: string; icon: string }[] = isCoursesType
    ? [coursesTab, chatTab, tvTab, ...(isAdmin ? [settingsTab] : [])]
    : [feedTab, chatTab, tvTab, ...(isAdmin ? [settingsTab] : [])];

  const TAG_FILTERS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD', 'ETHUSD', 'NAS100', 'Trading', 'Producto', 'Psicotrading', 'News'];

  const getPlanGradient = (plan?: string) => {
    const gradients: Record<string, string> = {
      free: 'from-gray-500/20 to-gray-600/10',
      starter: 'from-blue-500/20 to-cyan-500/10',
      growth: 'from-violet-500/20 to-purple-500/10',
      scale: 'from-amber-500/20 to-orange-500/10',
      enterprise: 'from-yellow-400/30 via-amber-500/20 to-orange-500/10',
    };
    return gradients[plan || 'free'] || gradients.free;
  };

  const getPlanBadgeStyle = (plan?: string) => {
    const styles: Record<string, string> = {
      free: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      starter: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      growth: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
      scale: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      enterprise: 'bg-gradient-to-r from-yellow-400/30 to-amber-500/20 border-yellow-400/30 text-yellow-300',
    };
    return styles[plan || 'free'] || styles.free;
  };

  const plan = (subcommunity as any)?.plan || 'free';
  const planGradient = getPlanGradient(plan);
  const planBadgeStyle = getPlanBadgeStyle(plan);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Hero Header - VIP Premium Style */}
      <div className="relative overflow-hidden">
        {/* Background Glow Effects */}
        <div className={`absolute inset-0 bg-gradient-to-br ${planGradient} opacity-50`} />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-violet-500/10 blur-[80px] rounded-full" />
        
        {/* Main Header Card */}
        <div className="relative glass rounded-2xl border border-white/10 backdrop-blur-xl p-6 md:p-8">
          {/* Plan Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${planBadgeStyle}`}>
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </span>
              {subcommunity.tvIsLive && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                  <span className="size-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black uppercase text-red-400 tracking-widest">LIVE</span>
                </span>
              )}
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Volver
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Avatar & Info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Premium Avatar */}
              <div className="relative flex-shrink-0">
                <div className="size-16 md:size-20 rounded-2xl bg-gradient-to-br from-primary/40 to-violet-600/30 border-2 border-white/20 flex items-center justify-center shadow-xl shadow-primary/10">
                  <span className="text-2xl md:text-3xl font-black text-white uppercase">
                    {subcommunity.name.charAt(0)}
                  </span>
                </div>
                {/* Online Indicator */}
                <div className="absolute -bottom-1 -right-1 size-4 bg-signal-green rounded-full border-2 border-[#0f1115]" />
                {/* VIP Crown for Enterprise */}
                {plan === 'enterprise' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="material-symbols-outlined text-amber-400 text-lg drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))' }}>workspace_premium</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white truncate">
                    {subcommunity.name}
                  </h1>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">home</span>
                  en <span className="text-primary font-bold">{parentCommunity.name}</span>
                </p>
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex flex-col items-stretch lg:items-end gap-4">
              {/* Stats Row */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="material-symbols-outlined text-sm text-gray-400">group</span>
                  <span className="font-bold text-gray-300">{memberCount}</span>
                  <span className="text-gray-500 hidden sm:inline">miembros</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="material-symbols-outlined text-sm text-gray-400">{subcommunity.visibility === 'private' ? 'lock' : 'link'}</span>
                  <span className="font-bold text-gray-300">{subcommunity.visibility === 'private' ? 'Privada' : 'Invitación'}</span>
                </div>
                {isPaid && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <span className="material-symbols-outlined text-sm text-amber-400">workspace_premium</span>
                    <span className="font-bold text-amber-400">${priceMonthly}/mes</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {!isMember ? (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className={`w-full lg:w-auto px-8 py-3 font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-[10px] shadow-lg ${
                    isPaid
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/30 active:scale-[0.98]'
                      : 'bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white shadow-primary/30 active:scale-[0.98]'
                  }`}
                >
                  {joining ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">{isPaid ? 'workspace_premium' : 'group_add'}</span>
                      {isPaid ? 'Suscribirse' : 'Unirse'}
                    </>
                  )}
                </button>
              ) : (
                <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-signal-green/20 to-emerald-500/10 border border-signal-green/30 text-[10px] font-black uppercase tracking-widest text-signal-green flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Miembro Verificado
                  {isPaid && subscription?.isActive && <span className="text-signal-green/60">• Activo</span>}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {subcommunity.description && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-sm text-gray-400 leading-relaxed">{subcommunity.description}</p>
            </div>
          )}

          {/* VIP Features Bar for Paid Communities */}
          {isPaid && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5 border border-amber-500/10">
              <div className="flex items-center gap-6 flex-wrap">
                {[
                  { icon: 'chat', label: 'Chat Privado' },
                  { icon: 'live_tv', label: 'TV Exclusiva' },
                  { icon: 'trending_up', label: 'Señales Premium' },
                  { icon: 'school', label: 'Contenido VIP' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-amber-400/80">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span className="font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-2xl border border-white/10 backdrop-blur-xl p-1.5 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-300">
        {!isMember && activeTab !== 'feed' ? (
          <div className="glass rounded-2xl border border-white/10 backdrop-blur-xl p-12 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-5xl text-gray-600 mb-4">lock</span>
            <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">Contenido exclusivo</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Únete a esta subcomunidad para acceder al chat, TV y más contenido.
            </p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-sm align-middle mr-2">group_add</span>
              Unirse ahora
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'feed' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar - Filter Controls */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="glass rounded-2xl border border-white/10 backdrop-blur-xl p-4 sticky top-24">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">Explorar</h3>
                    <div className="space-y-1">
                      {['Todos', 'Análisis', 'Señales', 'Educación', 'Discussión'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setFilterType(cat)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                            filterType === cat
                              ? 'bg-white/10 text-white'
                              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">{cat === 'Todos' ? 'dashboard' : cat === 'Análisis' ? 'analytics' : cat === 'Señales' ? 'trending_up' : cat === 'Educación' ? 'school' : 'forum'}</span>
                          {cat}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">Tendencias</h3>
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {TAG_FILTERS.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                            className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${
                              filterTag === tag
                                ? 'bg-primary border border-primary text-white'
                                : 'bg-white/5 border border-white/5 text-gray-500 hover:border-white/10'
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Feed Area */}
                <div className="lg:col-span-10 xl:col-span-7 space-y-4">
                  {/* Feed Controls */}
                  <div className="flex items-center gap-2 px-1">
                    <div className="ml-auto flex items-center gap-1">
                      <span className="text-[9px] text-gray-400 font-medium">Ordenar:</span>
                      <div className="flex bg-white/5 rounded-lg p-0.5">
                        {(['recent', 'popular'] as const).map(sort => (
                          <button
                            key={sort}
                            onClick={() => setSortBy(sort)}
                            className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${
                              sortBy === sort
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            {sort === 'recent' ? 'Recientes' : 'Populares'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <SubcommunityFeed
                    subcommunityId={subcommunity._id}
                    userId={usuario?.id ?? ''}
                    isMember={isMember}
                    filterType={filterType}
                    filterTag={filterTag}
                    sortBy={sortBy}
                  />
                </div>
              </div>
            )}
            {activeTab === 'chat' && (
              <div className="glass rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden">
                <SubcommunityChat
                  subcommunityId={subcommunity._id}
                  usuario={usuario ? { id: usuario.id, nombre: usuario.nombre || usuario.usuario, avatar: usuario.avatar } : null}
                  isMember={isMember}
                />
              </div>
            )}
            {activeTab === 'tv' && (
              <SubcommunityTV
                subcommunityId={subcommunity._id}
                userId={usuario?.id || ''}
                isOwner={isOwner}
                isAdmin={isAdmin}
                isMember={isMember}
              />
            )}
            {activeTab === 'courses' && (
              <div className="min-h-[60vh]">
                <Suspense fallback={<ElectricLoader type="phrase" phrase="Cargando cursos..." />}>
                  <CursosView 
                    usuario={usuario} 
                    onVisitProfile={onVisitProfile}
                    onLoginRequest={onLoginRequest}
                  />
                </Suspense>
              </div>
            )}
            {activeTab === 'settings' && isAdmin && (
              <SubcommunitySettings
                subcommunityId={subcommunity._id}
                communityId={parentCommunity._id}
                userId={usuario?.id || ''}
                subcommunity={subcommunity}
              />
            )}
          </>
        )}
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300"
          onClick={() => setShowPaywall(false)}
        >
          <div className="w-full max-w-md bg-[#15191f] border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative p-8 text-center">
              <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full" />
              <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-orange-500/10 blur-[60px] rounded-full" />
              <div className="relative">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl text-amber-400">workspace_premium</span>
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                  {subcommunity.name}
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  Contenido premium exclusivo para miembros subscriptos.
                </p>
                <div className="bg-black/40 rounded-2xl p-6 mb-6 border border-white/5">
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-black text-white">${priceMonthly}</span>
                    <span className="text-gray-500 font-bold">/mes</span>
                  </div>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Acceso mensual</p>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  {[
                    'Chat privado con miembros',
                    'Contenido exclusivo',
                    'TV en vivo del creador',
                    'Análisis y señales',
                    'Acceso inmediato'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="material-symbols-outlined text-amber-400 text-lg">check_circle</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {joinError && (
                  <div className="mb-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold">
                    {joinError}
                  </div>
                )}
                <button
                  onClick={handleSubscribe}
                  disabled={joining}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                >
                  {joining ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      Procesando...
                    </span>
                  ) : (
                    `Suscribirse — $${priceMonthly}/mes`
                  )}
                </button>
                <button
                  onClick={() => setShowPaywall(false)}
                  className="mt-3 text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {joinError && !showPaywall && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-red-500/90 backdrop-blur-xl border border-red-400/30 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-200">error</span>
            <span className="text-xs font-bold text-white">{joinError}</span>
            <button onClick={() => setJoinError(null)} className="text-red-200 hover:text-white">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcommunityView;
