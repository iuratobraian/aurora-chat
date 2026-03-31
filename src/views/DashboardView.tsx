import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Usuario, Publicacion, Noticia, Estrategia } from '../types';
import { StorageService } from '../services/storage';
import { useNews } from '../hooks/useNews'; 
import CalendarioView from './CalendarioView';
import Ticker from '../components/Ticker';
import TradingViewWidget from '../components/TradingViewWidget';
import MarketTickerWidget from '../components/MarketTickerWidget';
import AIPatternScanner from '../components/AIPatternScanner';
import PostCard from '../components/PostCard';
import { PostCardEditForm } from '../components/postcard/PostCardEditForm';
import { Avatar } from '../components/Avatar';
import { MorningBriefingCard } from '../components/MorningBriefingCard';
import { DailyCoachCard } from '../components/DailyCoachCard';
import { LearningPathService, NextBestAction, RecommendedItem } from '../services/ranking/learningPath';
import { getCursos } from '../services/storage/courses';

type UserTier = 'FREE' | 'PRO' | 'ELITE';

function getUserTier(usuario: Usuario | null): UserTier {
  if (!usuario || usuario.id === 'guest') return 'FREE';
  if (usuario.role >= 2 || usuario.rol === 'vip' || usuario.rol === 'admin' || usuario.rol === 'ceo') return 'ELITE';
  if (usuario.esPro || usuario.role === 1) return 'PRO';
  return 'FREE';
}

function getTierColor(tier: UserTier): string {
  switch (tier) {
    case 'ELITE': return 'from-amber-500 to-orange-600';
    case 'PRO': return 'from-blue-500 to-indigo-600';
    default: return 'from-gray-500 to-gray-600';
  }
}

function getTierLabel(tier: UserTier): string {
  switch (tier) {
    case 'ELITE': return 'ELITE';
    case 'PRO': return 'PRO';
    default: return 'FREE';
  }
}

function getXpProgress(usuario: Usuario): { current: number; next: number; percent: number } {
  const xp = usuario.xp || 0;
  const level = usuario.level || 1;
  const currentLevelXp = Math.floor(100 * Math.pow(level - 1, 1.5));
  const nextLevelXp = Math.floor(100 * Math.pow(level, 1.5));
  const percent = Math.min(100, Math.max(0, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));
  return { current: xp - currentLevelXp, next: nextLevelXp - currentLevelXp, percent };
}

interface DashboardProps {
  usuario: Usuario | null;
  onLoginRequest?: () => void;
}

const DashboardView: React.FC<DashboardProps> = ({ usuario, onLoginRequest }) => {
  const [topPosts, setTopPosts] = useState<Publicacion[]>([]);
  const [viralPost, setViralPost] = useState<Publicacion | null>(null);
  const [topTraders, setTopTraders] = useState<any[]>([]);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [showNewPostsPill, setShowNewPostsPill] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  
  const userTier = useMemo(() => getUserTier(usuario), [usuario]);
  const xpProgress = useMemo(() => usuario ? getXpProgress(usuario) : null, [usuario]);
  
  // Usar Hook de Noticias Reales
  const { noticias, loading: loadingNews } = useNews();
  
  // Selection State
  const [selectedPost, setSelectedPost] = useState<Publicacion | null>(null);
  const [selectedNews, setSelectedNews] = useState<Noticia | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Estrategia | null>(null);
  
  // Quick Access Modals
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Publicacion | null>(null);
  
  // Calculator State
  const [calcSize, setCalcSize] = useState(1000);
  const [calcRisk, setCalcRisk] = useState(1);
  const [calcStop, setCalcStop] = useState(50);

  useEffect(() => {
    const loadContent = async () => {
        // 1. Posts & Viral
        let posts = await StorageService.getPosts();
        
        // Filter out ads and system posts
        posts = posts.filter((p: any) => {
            if (p.esAnuncio) return false;
            if (p.idUsuario === 'system') return false;
            if (p.idUsuario === 'admin_ads') return false;
            if (p.idUsuario === 'system_seed') return false;
            if (p.idUsuario === 'ai_agent_system') return false;
            if (p.idUsuario === 'ai_sentiment_agent') return false;
            return true;
        });
        
        // Randomize for guests
        if (!usuario || usuario.id === 'guest') {
            posts = [...posts].sort(() => Math.random() - 0.5);
        }
        
        // Top 3 Recent for list (More items now that we have space)
        const sortedByDate = [...posts].sort((a, b) => b.ultimaInteraccion - a.ultimaInteraccion).slice(0, 5);
        setTopPosts(sortedByDate);

        // Viral Post (Most Interactions)
        const mostViral = [...posts].sort((a, b) => ((b.likes?.length || 0) + (b.comentarios?.length || 0)) - ((a.likes?.length || 0) + (a.comentarios?.length || 0)))[0];
        setViralPost(mostViral);

        // 2. Top Traders
        const traders = await StorageService.getTopTraders('likes');
        setTopTraders(traders);

        // 3. Courses for Learning Path
        const cursos = await getCursos();
        setCourses(cursos);
    };
    loadContent();
  }, []);

  // Learning Path computed from courses + user profile
  const learningPath = useMemo(() => {
    if (!usuario || usuario.id === 'guest' || courses.length === 0) return null;
    return LearningPathService.getLearningPath(courses, [], usuario as Partial<Usuario>);
  }, [usuario, courses]);

  // Listen for new posts from FloatingBar
  useEffect(() => {
    const handleNewPosts = (e: CustomEvent) => {
      setNewPostsCount(e.detail?.count || 0);
      setShowNewPostsPill(true);
    };
    window.addEventListener('new-posts-available' as any, handleNewPosts);
    return () => window.removeEventListener('new-posts-available' as any, handleNewPosts);
  }, []);

  const handleLoadNewPosts = useCallback(() => {
    setShowNewPostsPill(false);
    setNewPostsCount(0);
    const loadContent = async () => {
      let posts = await StorageService.getPosts();
      if (!usuario || usuario.id === 'guest') {
        posts = [...posts].sort(() => Math.random() - 0.5);
      }
      const sortedByDate = [...posts].sort((a, b) => b.ultimaInteraccion - a.ultimaInteraccion).slice(0, 5);
      setTopPosts(sortedByDate);
    };
    loadContent();
  }, [usuario]);

  const handleUpdatePost = useCallback(async (updatedPost: Publicacion) => {
    const { error } = await StorageService.updatePost(updatedPost);
    if (!error) {
        setTopPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
        if (viralPost && viralPost.id === updatedPost.id) setViralPost(updatedPost);
        if (selectedPost && selectedPost.id === updatedPost.id) setSelectedPost(updatedPost);
    }
  }, [viralPost, selectedPost]);

  const handleEditPost = useCallback((post: Publicacion) => {
    setEditingPost(post);
  }, []);

  const handleSaveEdit = useCallback(async (updatedPost: Publicacion) => {
    await StorageService.updatePost(updatedPost);
    setTopPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    if (viralPost && viralPost.id === updatedPost.id) setViralPost(updatedPost);
    if (selectedPost && selectedPost.id === updatedPost.id) setSelectedPost(updatedPost);
    setEditingPost(null);
  }, [viralPost, selectedPost]);

  const handleDeletePost = useCallback(async (_postId: string) => { /* Only admin or owner in dash usually */ }, []);
  
  const handleLike = useCallback(async (post: Publicacion) => {
    if(!usuario || usuario.id === 'guest') { if(onLoginRequest) onLoginRequest(); return; }
    await StorageService.toggleLikePost(post.id, usuario.id, post.idUsuario);
    const updated = { ...post, likes: (post.likes || []).includes(usuario.id) ? post.likes.filter(id => id !== usuario.id) : [...(post.likes || []), usuario.id] };
    handleUpdatePost(updated);
  }, [usuario, onLoginRequest, handleUpdatePost]);

  const handleFollow = useCallback(async (authorId: string) => {
     if(!usuario || usuario.id === 'guest') { if(onLoginRequest) onLoginRequest(); return; }
     await StorageService.toggleFollowUser(usuario.id, authorId);
  }, [usuario, onLoginRequest]);

  const addComment = async (postId: string, text: string, parentId?: string) => {
      if (!usuario || usuario.id === 'guest') return onLoginRequest && onLoginRequest();
      
      const newComment = { id: Date.now().toString(), idUsuario: usuario.id, nombreUsuario: usuario.nombre, avatarUsuario: usuario.avatar, texto: text, tiempo: 'Ahora', likes: [], respuestas: [] };
      const post = topPosts.find(p => p.id === postId) || viralPost;
      if(post) {
         const updated = { ...post, comentarios: [...post.comentarios, newComment] };
         await handleUpdatePost(updated);
         if (usuario.id !== post.idUsuario) {
             StorageService.addNotification(post.idUsuario, { tipo: 'comment', mensaje: `${usuario.nombre} comentó tu publicación.`, avatarUrl: usuario.avatar, link: postId });
         }
      }
  };

  const lotSize = (calcSize * (calcRisk / 100)) / calcStop;

  return (
    <>
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      
      {/* LEFT COLUMN: News & Expanded Community (8 cols) */}
      <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* Brand Hero Section - Rediseñado */}
          <section className="relative w-full h-40 md:h-48 rounded-xl overflow-hidden group border border-white/10 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-800 to-black"></div>
            <div className="absolute inset-0 opacity-15 mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }}></div>
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center z-10">
              <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight mb-3 animate-in slide-in-from-left-10 duration-1000">
                Tu comunidad de <span className="text-blue-400">trading</span> profesional
              </h2>
              <p className="text-xs md:text-sm text-gray-300 mb-4 max-w-lg font-medium animate-in slide-in-from-left-10 duration-1000 delay-200">
                Análisis reales, señales verificadas y aprendizaje de traders institucionales. Sin ruido, solo señal.
              </p>
              <div className="flex flex-wrap gap-3 animate-in slide-in-from-bottom-10 duration-1000 delay-500">
                <button 
                  onClick={() => {
                    const navEvent = new CustomEvent('navigate', { detail: 'comunidad' });
                    window.dispatchEvent(navEvent);
                  }}
                  className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  Explorar Comunidad
                </button>
                {!usuario && (
                  <button 
                    onClick={onLoginRequest}
                    className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-primary/30 border-2 border-transparent hover:border-white/20"
                  >
                    Crear Cuenta Gratis
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Personalized Welcome & Progress */}
          {usuario && usuario.id !== 'guest' && (
            <section className="relative rounded-xl overflow-hidden border border-white/10 shadow-lg bg-gradient-to-br from-slate-900/80 to-slate-800/40 backdrop-blur-sm">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl bg-gradient-to-br ${getTierColor(userTier)} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-white text-lg">
                        {userTier === 'ELITE' ? 'stars' : userTier === 'PRO' ? 'workspace_premium' : 'person'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">Hola, {usuario.nombre.split(' ')[0]}!</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gradient-to-r ${getTierColor(userTier)} text-white`}>
                        {getTierLabel(userTier)}
                      </span>
                    </div>
                  </div>
                  {xpProgress && (
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400">Nivel {usuario.level}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${getTierColor(userTier)} rounded-full transition-all duration-500`}
                            style={{ width: `${xpProgress.percent}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-gray-500">{Math.floor(xpProgress.percent)}%</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Tier-specific quick stats */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-xs font-black text-white">{usuario.xp?.toLocaleString() || 0}</p>
                    <p className="text-[8px] text-gray-500 uppercase">XP Total</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-xs font-black text-white">{usuario.level || 1}</p>
                    <p className="text-[8px] text-gray-500 uppercase">Nivel</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-xs font-black text-white">{usuario.aportes || 0}</p>
                    <p className="text-[8px] text-gray-500 uppercase">Aportes</p>
                  </div>
                </div>

                {/* Upgrade prompt for FREE users */}
                {userTier === 'FREE' && (
                  <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20">
                    <p className="text-[10px] text-gray-300 mb-2">Desbloquea todo el potencial de tu trading</p>
                    <button 
                      onClick={() => {
                        const navEvent = new CustomEvent('navigate', { detail: 'pricing' });
                        window.dispatchEvent(navEvent);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-blue-500/20"
                    >
                      Mejorar a PRO →
                    </button>
                  </div>
                )}

                {/* PRO features hint */}
                {userTier === 'PRO' && (
                  <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-amber-400 text-sm">workspace_premium</span>
                      <p className="text-[10px] text-amber-300 font-bold">Beneficios PRO Activos</p>
                    </div>
                    <p className="text-[9px] text-gray-400">Señales en vivo, análisis avanzado y contenido exclusivo desbloqueado.</p>
                  </div>
                )}

                {/* ELITE exclusive badge */}
                {userTier === 'ELITE' && (
                  <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-400/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-amber-400 text-sm animate-pulse">stars</span>
                      <p className="text-[10px] text-amber-300 font-bold">Acceso ELITE Exclusivo</p>
                    </div>
                    <p className="text-[9px] text-gray-400">Mentoría 1:1, API Access y soporte prioritario disponibles.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Featured Community (EXPANDED) */}
          <section className="flex-1 flex flex-col">
             {/* Small Static Ticker */}
             <div className="mb-4 rounded-xl overflow-hidden border border-white/10 shadow-lg scale-90 origin-left">
                <Ticker />
             </div>

              <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-sm font-black uppercase tracking-widest dark:text-white text-gray-800 flex items-center gap-2">
                     <span className="material-symbols-outlined text-primary text-base">verified</span>
                     {userTier === 'ELITE' ? 'Análisis Premium' : userTier === 'PRO' ? 'Contenido PRO' : 'Últimas Publicaciones'}
                  </h2>
                  {userTier === 'ELITE' ? (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">stars</span> ELITE
                    </span>
                  ) : userTier === 'PRO' ? (
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">workspace_premium</span> PRO
                    </span>
                  ) : (
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold uppercase animate-pulse">Top Análisis</span>
                  )}
               </div>

              {/* Floating Pill: New Posts */}
              {showNewPostsPill && newPostsCount > 0 && (
                <button
                  onClick={handleLoadNewPosts}
                  className="sticky top-4 z-50 w-full py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/30 flex items-center justify-center gap-2 animate-in slide-in-from-top-4 duration-300 transition-all hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-sm animate-bounce">keyboard_arrow_up</span>
                  {newPostsCount} Nueva{newPostsCount > 1 ? 's' : ''} Publicación{newPostsCount > 1 ? 'es' : ''}
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
              )}
              
              <div className="space-y-4">
                {topPosts.length === 0 && <p className="text-gray-500 text-xs">No hay publicaciones aún.</p>}
                
                {topPosts.map((post) => (
                    <PostCard 
                        key={post.id}
                        post={post}
                        usuario={usuario}
                        onLike={() => handleLike(post)}
                        onUpdate={handleUpdatePost}
                        onDelete={() => handleDeletePost(post.id)}
                        onFollow={() => handleFollow(post.idUsuario)}
                        onVisitProfile={() => {}}
                        onReply={addComment}
                        onLikeComment={() => {}}
                        onEdit={handleEditPost}
                    />
                ))}
             </div>
          </section>

          {/* 3. Calendar (Events) - Moved below Latest Posts */}
          <div className="h-[280px]">
              <CalendarioView />
          </div>

      </div>

      {/* RIGHT COLUMN: Quick Access, Calendar, RESOURCES (4 cols) */}
      <div className="xl:col-span-4 flex flex-col gap-6">
         
         {/* Breaking News Slider (Moved to Right Column, top) */}
         <section className="glass rounded-xl p-5 border border-white/10 overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-white text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-alert-red text-sm animate-pulse">campaign</span>
                  Noticias
               </h2>
               {loadingNews && <span className="text-[8px] text-gray-500 animate-pulse uppercase tracking-widest">Cargando...</span>}
            </div>
            
            <div className="relative h-48 rounded-lg overflow-hidden group">
              {loadingNews && noticias.length === 0 ? (
                 <div className="w-full h-full bg-white/5 animate-pulse rounded-lg"></div>
              ) : (
                <div className="flex w-full h-full transition-transform duration-1000 ease-in-out animate-[slide_15s_infinite]">
                  {/* Duplicate first item at the end for seamless loop if needed, but simple CSS animation works for now */}
                  {noticias.map((news, idx) => (
                     <div 
                         key={`${news.id}-${idx}`}
                         onClick={() => setSelectedNews(news)}
                         className="w-full h-full shrink-0 relative cursor-pointer"
                     >
                         <img src={news.urlImagen} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" onError={(e) => {e.currentTarget.src = 'https://picsum.photos/seed/cyberpunk/300/200'}} />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                         
                         <div className="absolute bottom-0 left-0 right-0 p-4">
                             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded backdrop-blur-md mb-2 inline-block ${news.sentimiento === 'alcista' ? 'bg-signal-green/20 text-signal-green border border-signal-green/30' : news.sentimiento === 'bajista' ? 'bg-alert-red/20 text-alert-red border border-alert-red/30' : 'bg-white/5 text-gray-200 border border-white/10'}`}>
                                     {news.sentimiento}
                             </span>
                             <h4 className="font-bold text-xs text-white leading-tight line-clamp-2 mb-1">
                                 {news.titulo}
                             </h4>
                             <div className="flex justify-between items-center">
                                 <span className="text-[8px] text-gray-400 font-mono">{news.tiempo}</span>
                                 <span className="text-[8px] text-gray-500 font-bold">{news.fuente}</span>
                             </div>
                         </div>
                     </div>
                  ))}
                </div>
              )}
            </div>
            <style>{`
              @keyframes slide {
                0%, 20% { transform: translateX(0); }
                25%, 45% { transform: translateX(-100%); }
                50%, 70% { transform: translateX(-200%); }
                75%, 95% { transform: translateX(-300%); }
                100% { transform: translateX(0); }
              }
             `}</style>
          </section>

          {/* Morning Briefing Card */}
          <MorningBriefingCard usuario={usuario} />

          {/* Market Ticker Widget - Tier-specific */}
          {userTier === 'FREE' && (
            <section className="glass rounded-xl p-5 border border-white/10 bg-gradient-to-br from-emerald-600/10 to-transparent">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">show_chart</span>
                  Mercado
                </h2>
                <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Demo</span>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-emerald-500/10 text-center">
                <p className="text-xs text-gray-400 mb-2">Datos demo disponibles</p>
                <div className="flex justify-center gap-2">
                  <div className="px-3 py-2 rounded bg-white/5">
                    <p className="text-[10px] text-gray-500">AAPL</p>
                    <p className="text-xs font-bold text-white">$178.50</p>
                  </div>
                  <div className="px-3 py-2 rounded bg-white/5">
                    <p className="text-[10px] text-gray-500">BTC</p>
                    <p className="text-xs font-bold text-white">$67,200</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const navEvent = new CustomEvent('navigate', { detail: 'pricing' });
                    window.dispatchEvent(navEvent);
                  }}
                  className="w-full mt-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                >
                  Datos Reales con PRO →
                </button>
              </div>
            </section>
          )}
          {(userTier === 'PRO' || userTier === 'ELITE') && <MarketTickerWidget initialSymbol="AAPL" />}

          {/* Daily Coach Card */}
          <DailyCoachCard usuario={usuario} />

          {/* Learning Path Card - Next Best Action */}
          {learningPath?.nextAction && (
            <section className="glass rounded-xl p-5 border border-white/10 bg-gradient-to-br from-violet-600/10 to-transparent">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">route</span>
                  Tu Próximo Paso
                </h2>
                {learningPath.currentLevel && (
                  <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/20">
                    Nivel: {learningPath.currentLevel}
                  </span>
                )}
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-violet-500/10">
                <div className="size-9 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
                  <span className="material-symbols-outlined text-violet-400 text-lg">
                    {learningPath.nextAction.type === 'start_course' ? 'play_arrow' :
                     learningPath.nextAction.type === 'continue_course' ? 'trending_up' :
                     learningPath.nextAction.type === 'take_quiz' ? 'quiz' :
                     learningPath.nextAction.type === 'practice' ? 'candlestick_chart' : 'school'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-black text-white mb-0.5 leading-tight">{learningPath.nextAction.title}</h4>
                  <p className="text-[9px] text-gray-400 leading-relaxed">{learningPath.nextAction.description}</p>
                </div>
              </div>
              {learningPath.recommendations && learningPath.recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-2">Recomendados para ti</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {learningPath.recommendations.slice(0, 3).map((rec, idx) => (
                      <div key={idx} className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 min-w-[120px]">
                        <p className="text-[8px] font-bold text-white leading-tight truncate">{rec.item.titulo}</p>
                        <span className={`text-[7px] font-black uppercase tracking-wider ${
                          rec.reasonType === 'level_match' ? 'text-signal-green' :
                          rec.reasonType === 'completion_gap' ? 'text-blue-400' :
                          rec.reasonType === 'next_step' ? 'text-amber-400' :
                          'text-gray-500'
                        }`}>{rec.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Ad Panel: Course Promotion (New) */}
         <section className="glass rounded-xl p-5 border border-white/10 bg-gradient-to-br from-blue-600/10 to-transparent">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">school</span>
                  Cursos & Formación
               </h2>
            </div>
            <div className="relative rounded-lg overflow-hidden aspect-video mb-3 group">
               <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Course" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                  <h4 className="text-xs font-black text-white uppercase mb-1">Masterclass Trading Institucional</h4>
                  <p className="text-[9px] text-gray-300">Aprende la metodología de los grandes bancos.</p>
               </div>
            </div>
            <button className="w-full py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
               Ver Contenido
            </button>
         </section>

          {/* 1. Quick Access (Tools) */}
         <section className="glass rounded-xl p-5 border border-white/10">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Herramientas</h3>
           <div className="grid grid-cols-2 gap-3 mb-3">
              <button 
                onClick={() => setShowCalcModal(true)}
                className="bg-white/5 hover:bg-white/5 p-3 rounded-xl flex flex-col items-center gap-2 transition-all group border border-white/5 hover:border-purple-500/30"
              >
                 <span className="material-symbols-outlined text-purple-400 group-hover:scale-110 transition-transform">calculate</span>
                 <span className="text-[9px] font-bold uppercase dark:text-gray-300 text-gray-600">Calculadora</span>
              </button>
              <button 
                onClick={() => setShowChartModal(true)}
                className="bg-white/5 hover:bg-white/5 p-3 rounded-xl flex flex-col items-center gap-2 transition-all group border border-white/5 hover:border-blue-500/30"
              >
                 <span className="material-symbols-outlined text-blue-400 group-hover:scale-110 transition-transform">candlestick_chart</span>
                 <span className="text-[9px] font-bold uppercase dark:text-gray-300 text-gray-600">Gráfico</span>
              </button>
           </div>

           {/* Auto Trading Bot (Moved to Tools) */}
           <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-emerald-600/10 to-transparent border border-emerald-500/20 group hover:border-emerald-500/40 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                 <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <span className="material-symbols-outlined text-emerald-400 text-xl group-hover:animate-spin-slow">smart_toy</span>
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black text-white uppercase">Auto Trading Bot</h4>
                    <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Activo</span>
                 </div>
              </div>
              <p className="text-[9px] text-gray-400 mb-2">IA de alta frecuencia 24/7.</p>
              <button className="w-full py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-emerald-600/30">
                 Configurar
              </button>
           </div>
           
           {usuario && (usuario.rol === 'vip' || usuario.rol === 'admin' || usuario.rol === 'ceo') && (
             <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-signal-green to-emerald-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
               <button 
                  onClick={() => {
                    const navEvent = new CustomEvent('navigate', { detail: 'bitacora' });
                    window.dispatchEvent(navEvent);
                  }}
                  className="relative w-full p-4 rounded-xl bg-[#1a1a1a] flex items-center justify-between gap-2 transition-all border border-white/10"
               >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-signal-green/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-signal-green text-lg">menu_book</span>
                    </div>
                    <div className="text-left">
                      <span className="block text-[10px] font-black uppercase text-white tracking-widest">Bitácora VIP</span>
                      <span className="block text-[8px] text-gray-500 uppercase">Acceso Exclusivo</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-600 text-sm group-hover:text-signal-green transition-colors">arrow_forward</span>
               </button>
             </div>
           )}
         </section>

           {/* AI Pattern Scanner */}
           {userTier === 'ELITE' && <AIPatternScanner />}
           {userTier !== 'ELITE' && (
             <section className="glass rounded-xl p-5 border border-white/10 bg-gradient-to-br from-violet-600/10 to-transparent">
               <div className="flex items-center justify-between mb-3">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    AI Pattern Scanner
                 </h2>
                 <span className="text-[8px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold uppercase">ELITE</span>
               </div>
               <div className="p-4 rounded-lg bg-white/5 border border-violet-500/10 text-center">
                 <span className="material-symbols-outlined text-4xl text-violet-400/50 mb-2 block">lock</span>
                 <p className="text-xs text-gray-400 mb-3">Escanea patrones de mercado con IA avanzada</p>
                 <button 
                   onClick={() => {
                     const navEvent = new CustomEvent('navigate', { detail: 'pricing' });
                     window.dispatchEvent(navEvent);
                   }}
                   className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-amber-500/20"
                 >
                   Desbloquear con ELITE →
                 </button>
               </div>
             </section>
           )}

          {/* TOP TRADERS PODIO */}
          <section className="glass rounded-xl p-4 border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-sm">emoji_events</span>
                Top Traders
              </h2>
              <button 
                onClick={() => {
                  const navEvent = new CustomEvent('navigate', { detail: 'leaderboard' });
                  window.dispatchEvent(navEvent);
                }}
                className="text-[9px] text-primary hover:text-blue-400 font-bold uppercase tracking-widest transition-colors"
              >
                Ver Ranking →
              </button>
            </div>
            
            {/* Podio */}
            <div className="flex items-end justify-center gap-2 py-4">
              {/* 2nd Place - Silver */}
              {topTraders[1] && (
                <div className="flex flex-col items-center flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
                  <div className="relative mb-2">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-gray-400 to-gray-600 opacity-50 blur-sm"></div>
                    <Avatar 
                      src={topTraders[1].avatar}
                      name={topTraders[1].nombre}
                      seed={topTraders[1].id}
                      size="lg"
                      rounded="full"
                      className="relative border-2 border-gray-400"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center border-2 border-gray-700 shadow-lg">
                      <span className="text-[10px] font-black text-gray-800">2</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-300 truncate max-w-[80px] text-center">{topTraders[1].nombre}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[10px] text-gray-400">favorite</span>
                    <span className="text-[9px] text-gray-500">{topTraders[1].totalLikes || 0}</span>
                  </div>
                  <div className="w-full bg-gradient-to-t from-gray-600/30 to-transparent rounded-t-lg mt-2" style={{ height: '40px' }}></div>
                </div>
              )}
              
              {/* 1st Place - Gold */}
              {topTraders[0] && (
                <div className="flex flex-col items-center flex-1 animate-in fade-in slide-in-from-bottom-6 duration-500" style={{ animationDelay: '100ms' }}>
                  <div className="relative mb-2">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 opacity-60 blur-md animate-pulse"></div>
                    <Avatar 
                      src={topTraders[0].avatar}
                      name={topTraders[0].nombre}
                      seed={topTraders[0].id}
                      size="xl"
                      rounded="full"
                      className="relative border-2 border-amber-400 shadow-lg shadow-amber-500/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center border-2 border-amber-600 shadow-lg">
                      <span className="text-[11px] font-black text-amber-900">1</span>
                    </div>
                    {topTraders[0].esVerificado && (
                      <div className="absolute -top-1 -right-1">
                        <span className="material-symbols-outlined text-[14px] text-blue-400 fill-current">verified</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] font-black text-amber-400 truncate max-w-[80px] text-center">{topTraders[0].nombre}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[10px] text-amber-400">favorite</span>
                    <span className="text-[9px] text-amber-300 font-bold">{topTraders[0].totalLikes || 0}</span>
                  </div>
                  <div className="w-full bg-gradient-to-t from-amber-500/30 to-transparent rounded-t-lg mt-2" style={{ height: '60px' }}></div>
                </div>
              )}
              
              {/* 3rd Place - Bronze */}
              {topTraders[2] && (
                <div className="flex flex-col items-center flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
                  <div className="relative mb-2">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-orange-600 to-amber-700 opacity-50 blur-sm"></div>
                    <Avatar 
                      src={topTraders[2].avatar}
                      name={topTraders[2].nombre}
                      seed={topTraders[2].id}
                      size="lg"
                      rounded="full"
                      className="relative border-2 border-orange-600"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center border-2 border-orange-800 shadow-lg">
                      <span className="text-[10px] font-black text-orange-900">3</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-orange-400 truncate max-w-[80px] text-center">{topTraders[2].nombre}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[10px] text-orange-400">favorite</span>
                    <span className="text-[9px] text-orange-300">{topTraders[2].totalLikes || 0}</span>
                  </div>
                  <div className="w-full bg-gradient-to-t from-orange-600/30 to-transparent rounded-t-lg mt-2" style={{ height: '30px' }}></div>
                </div>
              )}
            </div>
            
            {/* Empty state */}
            {(!topTraders || topTraders.length === 0) && (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl text-white/20 mb-2">emoji_events</span>
                <p className="text-xs text-gray-500">No hay traders ranking aún</p>
              </div>
            )}
          </section>

          {/* 5. Resources (Moved Here) */}
         <section className="glass rounded-xl p-5 border border-white/10">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] dark:text-gray-400 text-gray-800 flex items-center gap-2">
                   <span className="material-symbols-outlined text-primary text-sm">extension</span>
                   Recursos
                </h2>
             </div>
             <div className="space-y-3">
                <a href="https://www.metatrader5.com/es/download" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group border border-white/5">
                     <div className="size-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border border-white/10 text-white">
                         <span className="material-symbols-outlined text-xl">terminal</span>
                     </div>
                     <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-[11px] dark:text-white group-hover:text-blue-400 transition-colors truncate">MetaTrader 5</h4>
                         <p className="text-[9px] text-gray-500">Descargar para PC</p>
                     </div>
                     <span className="material-symbols-outlined text-gray-600 text-sm group-hover:text-white transition-colors">download</span>
                </a>
                <a href="https://www.tradingview.com/desktop/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group border border-white/5">
                     <div className="size-10 rounded-lg bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 text-white">
                         <span className="material-symbols-outlined text-xl">candlestick_chart</span>
                     </div>
                     <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-[11px] dark:text-white group-hover:text-gray-300 transition-colors truncate">TradingView</h4>
                         <p className="text-[9px] text-gray-500">Descargar App de Escritorio</p>
                     </div>
                     <span className="material-symbols-outlined text-gray-600 text-sm group-hover:text-white transition-colors">download</span>
                </a>
             </div>
         </section>

      </div>

      {/* Interactive Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-4xl glass rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                 <h3 className="font-black text-lg text-white uppercase tracking-widest">Detalle Análisis</h3>
                 <button onClick={() => setSelectedPost(null)} className="size-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined text-lg text-white">close</span>
                 </button>
              </div>
              <div className="overflow-y-auto no-scrollbar bg-[#111]/80 flex-1 p-6">
                  <PostCard 
                      post={selectedPost}
                      usuario={usuario}
                      onLike={() => handleLike(selectedPost)}
                      onUpdate={handleUpdatePost}
                      onDelete={() => handleDeletePost(selectedPost.id)}
                      onFollow={() => handleFollow(selectedPost.idUsuario)}
                      onVisitProfile={() => {}}
                      onReply={addComment}
                      onLikeComment={() => {}}
                      fullView={true}
                   />
              </div>
           </div>
        </div>
      )}

      {/* Strategy Detail Modal */}
      {selectedStrategy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="w-full max-w-3xl glass rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                 <div className="relative h-48 w-full shrink-0">
                      <img src={selectedStrategy.imagenUrl} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-between p-6">
                          <h2 className="text-2xl font-black text-white">{selectedStrategy.titulo}</h2>
                          <button onClick={() => setSelectedStrategy(null)} className="size-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-white/20 transition-colors"><span className="material-symbols-outlined">close</span></button>
                      </div>
                 </div>
                 <div className="p-8 overflow-y-auto no-scrollbar bg-[#111]/90 flex-1">
                      <div className="flex gap-4 mb-6">
                          <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-gray-300">{selectedStrategy.dificultad}</span>
                          <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-gray-300">{selectedStrategy.lecciones} Lecciones</span>
                      </div>
                      <p className="text-gray-300 mb-6">{selectedStrategy.descripcion}</p>
                      <button className="w-full py-4 bg-primary text-white font-black uppercase rounded-xl hover:bg-blue-600 transition-colors">
                          Comenzar Curso
                      </button>
                 </div>
             </div>
          </div>
      )}

      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-2xl glass rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              <div className="relative h-48 w-full">
                  <img src={selectedNews.urlImagen} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-end p-6">
                      <div>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded mb-2 inline-block ${selectedNews.sentimiento === 'alcista' ? 'bg-signal-green text-black' : selectedNews.sentimiento === 'bajista' ? 'bg-alert-red text-white' : 'bg-gray-500 text-white'}`}>{selectedNews.sentimiento}</span>
                          <h2 className="text-xl md:text-2xl font-black text-white leading-tight">{selectedNews.titulo}</h2>
                      </div>
                  </div>
                  <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 size-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-colors">
                      <span className="material-symbols-outlined text-lg">close</span>
                  </button>
              </div>
              
              <div className="p-8 overflow-y-auto no-scrollbar bg-[#111]/90 flex-1">
                 <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                     <span className="text-[10px] font-bold text-gray-500 uppercase">Fuente: <span className="text-white">{selectedNews.fuente}</span></span>
                     <span className="text-[10px] font-bold text-gray-500 uppercase">Tiempo: <span className="text-white">{selectedNews.tiempo}</span></span>
                     <span className="ml-auto text-[10px] font-bold text-gray-500 uppercase">Impacto en: <span className="text-primary">{selectedNews.pares.join(', ')}</span></span>
                 </div>
                 
                 <p className="text-gray-300 leading-relaxed text-sm font-medium whitespace-pre-wrap mb-8">
                     {selectedNews.contenidoExtenso || selectedNews.resumen}
                 </p>

                 {selectedNews.url && (
                     <button 
                        onClick={() => window.open(selectedNews.url, '_blank')}
                        className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                     >
                         Leer Noticia Completa <span className="material-symbols-outlined text-lg">open_in_new</span>
                     </button>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Calculator Modal */}
      {showCalcModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
             <div className="glass rounded-[2rem] p-6 w-full max-w-sm border border-white/10 shadow-2xl bg-[#1e2329]">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-black uppercase text-white">Calculadora de Posición</h3>
                     <button onClick={() => setShowCalcModal(false)} className="text-gray-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                 </div>
                 <div className="space-y-4">
                     <div>
                         <label className="text-[10px] text-gray-500 font-bold uppercase">Tamaño Cuenta ($)</label>
                         <input type="number" value={calcSize} onChange={e => setCalcSize(Number(e.target.value))} className="w-full bg-black/20 rounded-lg p-2 text-white border border-white/10 mt-1"/>
                     </div>
                     <div>
                         <label className="text-[10px] text-gray-500 font-bold uppercase">Riesgo (%)</label>
                         <input type="number" value={calcRisk} onChange={e => setCalcRisk(Number(e.target.value))} className="w-full bg-black/20 rounded-lg p-2 text-white border border-white/10 mt-1"/>
                     </div>
                     <div>
                         <label className="text-[10px] text-gray-500 font-bold uppercase">Stop Loss (Pips)</label>
                         <input type="number" value={calcStop} onChange={e => setCalcStop(Number(e.target.value))} className="w-full bg-black/20 rounded-lg p-2 text-white border border-white/10 mt-1"/>
                     </div>
                     <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 text-center">
                         <p className="text-[10px] text-primary uppercase font-bold">Lotes Sugeridos</p>
                         <p className="text-2xl font-black text-white">{lotSize.toFixed(2)}</p>
                     </div>
                 </div>
             </div>
          </div>
      )}

      {/* Chart Modal with REAL TradingView Widget */}
      {showChartModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
             <div className="glass rounded-[2rem] p-2 w-full max-w-6xl h-[85vh] border border-white/10 shadow-2xl bg-[#1e2329] flex flex-col relative">
                 <button onClick={() => setShowChartModal(false)} className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors">
                     <span className="material-symbols-outlined">close</span>
                 </button>
                 <div className="flex-1 rounded-xl overflow-hidden bg-black">
                     <TradingViewWidget symbol="BTCUSD" />
                 </div>
             </div>
          </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-white">Editar Publicación</h2>
                      <button onClick={() => setEditingPost(null)} className="p-2 hover:bg-white/10 rounded-lg">
                          <span className="material-symbols-outlined text-white">close</span>
                      </button>
                  </div>
                  <PostCardEditForm
                      post={editingPost}
                      onSave={(updated) => {
                          handleSaveEdit({ ...editingPost, ...updated } as Publicacion);
                      }}
                      onCancel={() => setEditingPost(null)}
                  />
              </div>
          </div>
      )}

    </div>
    </>
  );
};

export default memo(DashboardView);