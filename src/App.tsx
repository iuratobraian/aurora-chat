import React, { useState, useEffect, Suspense, lazy, memo, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import ProfileVisitModal from './components/ProfileVisitModal';
import { Usuario } from './types';
import { StorageService } from './services/storage';
import ElectricLoader from './components/ElectricLoader';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ToastProvider } from './components/ToastProvider';
import { ChatBadgeProvider } from './components/ChatBadgeContext';
import SEO from './components/SEO';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalErrorHandler from './components/GlobalErrorHandler';
import AppViewFallback from './components/AppViewFallback';
import { parseDeepLink, navigateToSection, getShareableLink } from './utils/deeplink';
import { FloatingActionsMenu } from './components/FloatingActionsMenu';
import { AgentOrchestrationProvider } from './hooks/useAgentOrchestration';
import { AgentStatusBar } from './components/agents/AgentStatusBar';
import { NewsFeed } from './components/agents/NewsFeed';

const MusicPlayer = lazy(() => import('./components/MusicPlayer'));
const FloatingBar = lazy(() => import('./components/FloatingBar'));
const LiveChatWidget = lazy(() => import('./components/LiveChatWidget'));
const CoursePromoPopup = lazy(() => import('./components/CoursePromoPopup'));
const CheckoutSuccessView = lazy(() => import('./views/CheckoutSuccessView'));
const CheckoutCancelView = lazy(() => import('./views/CheckoutCancelView'));
const AdAuctionView = lazy(() => import('./views/AdAuctionView'));
const MobileInstallPrompt = lazy(() => import('./components/mobile/MobileInstallPrompt'));
const OfflineIndicator = lazy(() => import('./components/mobile/OfflineIndicator'));
const CommunityAdminPanel = lazy(() => import('./components/CommunityAdminPanel'));
const AuroraIdeaHub = lazy(() => import('./components/AuroraIdeaHub').then(m => ({ default: m.AuroraIdeaHub })));
const FeedbackModal = lazy(() => import('./components/FeedbackModal').then(m => ({ default: m.FeedbackModal })));
const VoiceAgent = lazy(() => import('./components/agents/VoiceAgent').then(m => ({ default: m.VoiceAgent })));
const RiskAssistant = lazy(() => import('./components/agents/RiskAssistant').then(m => ({ default: m.RiskAssistant })));
const CourseAssistant = lazy(() => import('./components/agents/CourseAssistant').then(m => ({ default: m.CourseAssistant })));
const CreatorAssistant = lazy(() => import('./components/agents/CreatorAssistant').then(m => ({ default: m.CreatorAssistant })));
const KimiChat = lazy(() => import('./components/agents/KimiChat').then(m => ({ default: m.KimiChat })));

const DEFAULT_PROMO_INTERVAL = 30 * 60 * 1000;
const SAFE_FALLBACK_TAB = 'comunidad';

const initTheme = () => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'system';
  
  const applyTheme = (theme: string) => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  };
  
  applyTheme(savedTheme);
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('theme') === 'system') {
      applyTheme('system');
    }
  });
  
  window.addEventListener('storage', () => {
    const newTheme = localStorage.getItem('theme') || 'system';
    applyTheme(newTheme);
  });
};
initTheme();

const ComunidadView = lazy(() => import('./views/ComunidadView'));
const GraficoView = lazy(() => import('./views/GraficoView'));
const CursosView = lazy(() => import('./views/CursosView'));
const PsicotradingView = lazy(() => import('./views/PsicotradingView'));
const BitacoraView = lazy(() => import('./views/BitacoraView'));
const PerfilView = lazy(() => import('./views/PerfilView'));
const ConfiguracionView = lazy(() => import('./views/ConfiguracionView'));
const AcademiaView = lazy(() => import('./views/AcademiaView'));
const LegalView = lazy(() => import('./views/LegalView'));
const AdminView = lazy(() => import('./views/AdminView'));
const ExnessView = lazy(() => import('./views/ExnessView'));
const PricingView = lazy(() => import('./views/PricingView'));
const CreatorView = lazy(() => import('./views/CreatorView'));
const CreatorDashboard = lazy(() => import('./views/CreatorDashboard'));
const LeaderboardView = lazy(() => import('./views/LeaderboardView'));
const DiscoverCommunities = lazy(() => import('./views/DiscoverCommunities'));
const MarketplaceView = lazy(() => import('./views/MarketplaceView'));
const ReferralView = lazy(() => import('./views/ReferralView'));
const PropFirmsView = lazy(() => import('./views/PropFirmsView'));
const SignalsView = lazy(() => import('./views/SignalsView'));
const ProductView = lazy(() => import('./views/ProductView'));
const ExpertAdvisorsView = lazy(() => import('./views/ExpertAdvisorsView'));
const SubcommunityView = lazy(() => import('./views/subcommunity/SubcommunityView'));
const CommunityDetailView = lazy(() => import('./views/CommunityDetailView'));
const JuegosView = lazy(() => import('./views/JuegosView'));
const SaboteadorInvisibleView = lazy(() => import('./views/SaboteadorInvisibleView'));
const MarketingView = lazy(() => import('./views/MarketingView'));
const NewsView = lazy(() => import('./views/NewsView'));
const PremiumObservatory = lazy(() => import('./views/CommunityCreatorSuite'));

const TRADER_PHRASES = [
  "El mercado perdona a los pacientes...",
  "Trading es gestión de emociones, no de dinero...",
  "Cada operación es una lección...",
  "La disciplina supera al talento...",
  "El riesgo se gestiona, no se evita...",
  "La paciencia es la virtud del trader...",
  "Opera con lógica, no con emoción...",
  "El gráfico cuenta la historia...",
  "Protect your capital first...",
  "Trade the plan, not the news...",
  "La calma es tu mayor aliado...",
  "Los mejores traders respiran profundo...",
  "Sin prisa, sin presión, con propósito...",
  "Cada día es una nueva oportunidad...",
  "La consistencia supera a la velocidad...",
  "El conocimiento es tu mejor inversión...",
  "Los mercados van y vienen, tu disciplina permanece...",
  "Hojea el caos, opera con serenidad...",
];

type LoaderPhase = 'welcome' | 'phrase' | 'done';

const defaultUserIfNull: Usuario = {
  id: 'guest',
  nombre: 'Invitado',
  usuario: 'invitado',
  avatar: '',
  esPro: false,
  esVerificado: false,
  rol: 'user',
  accuracy: 0,
  aportes: 0,
  reputation: 0,
  email: '',
  seguidores: [],
  siguiendo: [],
  saldo: 0,
  fechaRegistro: new Date().toISOString(),
  badges: [],
  watchlist: ['BTC/USD', 'EUR/USD'],
  role: 1,
  xp: 0,
  level: 1,
  estadisticas: { tasaVictoria: 0, factorBeneficio: 0, pnlTotal: 0 }
};

const App: React.FC = memo(() => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pestañaActiva, setPestañaActiva] = useState('comunidad');
  const [loaderPhase, setLoaderPhase] = useState<LoaderPhase>('welcome');
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [modalAuth, setModalAuth] = useState<'login' | 'register' | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatCommunityChannel, setChatCommunityChannel] = useState<string | undefined>(undefined);
  const [chatCommunityName, setChatCommunityName] = useState<string | undefined>(undefined);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCoursePromo, setShowCoursePromo] = useState(false);
  const [showAuroraIdeas, setShowAuroraIdeas] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showKimiChat, setShowKimiChat] = useState(false);
  const [subcommunityParams, setSubcommunityParams] = useState<{ parentSlug: string; subSlug: string } | null>(null);
  const [communitySlug, setCommunitySlug] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Preload critical routes for faster navigation
  useEffect(() => {
    const criticalRoutes = ['/comunidad', '/perfil', '/pricing', '/signals', '/marketplace'];
    const preloadRoute = (route: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
    };
    // Prefetch is handled by Vite automatically with dynamic imports
  }, []);

  useEffect(() => {
    if (location.pathname === '/checkout/success') {
      setPestañaActiva('checkout-success');
    } else if (location.pathname === '/checkout/cancel') {
      setPestañaActiva('checkout-cancel');
    }
  }, [location.pathname]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        StorageService.captureReferralFromUrl();

        const user = await StorageService.getSesion();
        if (user) {
          setUsuario(user);
          await StorageService.trackActiveDay(user.id);
          const hasOnboarded = await StorageService.hasCompletedOnboarding();
          if (!hasOnboarded) {
            setShowOnboarding(true);
          }
          const lastAuroraIdeas = localStorage.getItem('auroraIdeasLastShown');
          const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          if (!lastAuroraIdeas || parseInt(lastAuroraIdeas) < oneWeekAgo) {
            setTimeout(() => setShowAuroraIdeas(true), 2000);
          }
          const lastFeedback = localStorage.getItem(`feedback_last_${user.id}`);
          const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
          if (!lastFeedback || parseInt(lastFeedback) < oneMonthAgo) {
            setTimeout(() => setShowFeedback(true), 5000);
          }
        }
      } catch (error) {
        console.error('Session bootstrap failed, falling back to guest mode:', error);
      }

      const phrase = TRADER_PHRASES[Math.floor(Math.random() * TRADER_PHRASES.length)];
      setCurrentPhrase(phrase);
      setLoaderPhase('phrase');
      setTimeout(() => {
        setLoaderPhase('done');
      }, 3500);
    };
    loadSession();

    const handleNewPosts = (e: any) => setHasNewPosts(e.detail);
    const handleRefreshing = (e: any) => setIsRefreshing(e.detail);
    const handleOpenChat = () => setIsChatOpen(true);
    
    const handleOpenCommunityChat = (e: Event) => {
      const customEvent = e as CustomEvent;
      setChatCommunityChannel(customEvent.detail?.channelId);
      setChatCommunityName(customEvent.detail?.communityName);
      setIsChatOpen(true);
    };
    
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const path = typeof customEvent.detail === 'string' 
        ? customEvent.detail 
        : customEvent.detail?.detail;
      if (!path) return;
      
      // Root path - redirect to communities
      if (path === '/' || path === '') {
        setPestañaActiva('comunidad');
        return;
      }
      
      // New URL patterns
      if (path.startsWith('/u/') || path.startsWith('u/')) {
        const userId = path.replace(/^\/u\//, '').replace(/^u\//, '');
        setViewingProfileId(userId);
        setPestañaActiva('perfil');
      } else if (path.startsWith('/p/') || path.startsWith('p/')) {
        setPestañaActiva('comunidad');
      } else if (path.startsWith('/c/') || path.startsWith('c/')) {
        const parts = path.replace(/^\/c\//, '').replace(/^c\//, '').split('/s/');
        if (parts.length === 2) {
          setSubcommunityParams({ parentSlug: parts[0], subSlug: parts[1] });
          setPestañaActiva('subcommunity');
        } else {
          setCommunitySlug(parts[0]);
          setPestañaActiva('community-detail');
        }
      } else if (path.startsWith('/signal/') || path.startsWith('signal/')) {
        setPestañaActiva('signals');
      } else if (path.startsWith('/course/') || path.startsWith('course/')) {
        setPestañaActiva('cursos');
      } else if (path.startsWith('/creator/') || path.startsWith('creator/')) {
        setPestañaActiva('creator');
      } else if (path.startsWith('/checkout/')) {
        const checkoutPart = path.replace('/checkout/', '');
        if (checkoutPart === 'success') setPestañaActiva('checkout-success');
        else if (checkoutPart === 'cancel') setPestañaActiva('checkout-cancel');
      } else if (path.startsWith('/comunidad/')) {
        setCommunitySlug(path.replace('/comunidad/', ''));
        setPestañaActiva('community-detail');
      } else if (path.startsWith('subcommunity/')) {
        const parts = path.replace('subcommunity/', '').split('/');
        if (parts.length >= 2) {
          setSubcommunityParams({ parentSlug: parts[0], subSlug: parts[1] });
          setPestañaActiva('subcommunity');
        }
      } else if (path === '/crear-comunidad' || path === 'crear-comunidad') {
        setPestañaActiva('community-admin');
      } else if (path === '/discover') {
        setPestañaActiva('discover');
      } else if (path.startsWith('/conexiones') || path === 'conexiones') {
        setPestañaActiva('configuracion');
        sessionStorage.setItem('navigateToConexionesTab', '1');
      } else if (path.startsWith('/admin/') || path.startsWith('admin/') || path.startsWith('admin-') || path === '/admin' || path === 'admin') {
        setPestañaActiva('admin');
        const adminSection = path.replace(/^\/?(admin|admin-panel)\/?/, '');
        if (adminSection) {
          const tab = adminSection.split('?')[0];
          const validTabs = ['dashboard', 'users', 'posts', 'communities', 'signals', 'propFirms', 'propfirms', 'bitacora', 'ads', 'marketing', 'instagram', 'config', 'settings'];
          if (validTabs.includes(tab.toLowerCase())) {
            const normalizedTab = tab.toLowerCase() === 'propfirms' ? 'propFirms' : tab.toLowerCase() === 'settings' ? 'config' : tab.toLowerCase();
            sessionStorage.setItem('adminPanelTab', normalizedTab);
          }
        }
      } else if (path.startsWith('/')) {
        setPestañaActiva(path.slice(1));
      } else {
        setPestañaActiva(path);
      }
    };
    
    const handleDeepLink = (section: string, options?: any) => {
      // Handle new entity-based routes
      if (section === 'u' && options?.id) {
        setViewingProfileId(options.id);
        setPestañaActiva('perfil');
      } else if (section === 'p' && options?.id) {
        setPestañaActiva('comunidad');
      } else if (section === 'c' && options?.id) {
        setCommunitySlug(options.id);
        setPestañaActiva('community-detail');
      } else if (section === 'subcommunity' && options?.id && options?.action) {
        setSubcommunityParams({ parentSlug: options.id, subSlug: options.action });
        setPestañaActiva('subcommunity');
      } else if (section === 'signal' && options?.id) {
        setPestañaActiva('signals');
      } else if (section === 'course' && options?.id) {
        setPestañaActiva('cursos');
      } else if (section === 'creator' && options?.id) {
        setPestañaActiva('creator');
      } else if (section === 'checkout') {
        if (options?.action === 'success') setPestañaActiva('checkout-success');
        else setPestañaActiva('checkout-cancel');
      } else if (section === 'comunidad' && options?.id) {
        setCommunitySlug(options.id);
        setPestañaActiva('community-detail');
      } else if (section === 'post' && options?.id) {
        setPestañaActiva('comunidad');
      } else {
        setPestañaActiva(section);
      }
    };
    
    window.addEventListener('new-posts-found', handleNewPosts);
    window.addEventListener('is-refreshing', handleRefreshing);
    window.addEventListener('open-live-chat', handleOpenChat);
    window.addEventListener('open-community-chat', handleOpenCommunityChat);
    window.addEventListener('navigate', handleNavigate);
    
    const handlePopState = () => {
      const deepLink = parseDeepLink(window.location.href);
      if (deepLink?.section) {
        handleDeepLink(deepLink.section, deepLink);
      }
    };
    window.addEventListener('popstate', handlePopState);
    handlePopState();
    
    return () => {
      window.removeEventListener('new-posts-found', handleNewPosts);
      window.removeEventListener('is-refreshing', handleRefreshing);
      window.removeEventListener('open-live-chat', handleOpenChat);
      window.removeEventListener('open-community-chat', handleOpenCommunityChat);
      window.removeEventListener('navigate', handleNavigate);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    (window as any).navigateToSection = (section: string, options?: any) => {
      navigateToSection(section, options);
      setPestañaActiva(section);
    };
    (window as any).getShareableLink = getShareableLink;
    (window as any).showFeedbackModal = () => setShowFeedback(true);
  }, []);

  const prevPestañaRef = React.useRef<string | null>(null);
  
  useEffect(() => {
    if (pestañaActiva && prevPestañaRef.current !== pestañaActiva) {
      prevPestañaRef.current = pestañaActiva;
      localStorage.setItem('last_stable_tab', pestañaActiva);
      const pathMap: Record<string, string> = {
        comunidad: '/comunidad',
        perfil: '/perfil',
        configuracion: '/configuracion',
        'community-detail': '/comunidad',
        subcommunity: '/comunidad',
        discover: '/descubrir',
        marketplace: '/marketplace',
        pricing: '/precios',
        leaderboard: '/ranking',
        referidos: '/referidos',
        signals: '/senales',
        cursos: '/cursos',
        academia: '/academia',
        admin: '/admin',
        creator: '/creador',
        'creator-dashboard': '/creador/dashboard',
        news: '/noticias',
        voz: '/voz',
        risk: '/risk',
        course: '/course',
        games: '/juegos',
        graf: '/grafico',
        exness: '/exness',
        psicotrading: '/psicotrading',
        bitacora: '/bitacora',
        ads: '/publicidades',
        'expert-advisors': '/asesores',
        propfirms: '/prop-firms',
        'community-admin': '/comunidad/admin',
        'premium-observatory': '/premium-observatory',
      };
      const newPath = pathMap[pestañaActiva] || `/${pestañaActiva}`;
      const currentPath = location.pathname;
      if (currentPath !== newPath && !currentPath.includes(newPath)) {
        navigate(newPath, { replace: true });
      }
    }
  }, [pestañaActiva, navigate, location.pathname]);

  useEffect(() => {
    if (usuario && usuario.id !== 'guest') {
      const coursePromoEnabled = localStorage.getItem('coursePromoEnabled') !== 'false';
      const promoIntervalRaw = localStorage.getItem('coursePromoInterval');
      const promoInterval = promoIntervalRaw ? parseInt(promoIntervalRaw, 10) : DEFAULT_PROMO_INTERVAL;
      const closed = localStorage.getItem('coursePromoClosed');
      const lastShown = localStorage.getItem('coursePromoLastShown');
      
      if (coursePromoEnabled && !closed) {
        const lastShownNum = lastShown ? parseInt(lastShown, 10) : NaN;
        const timeSinceLastShown = !isNaN(lastShownNum) ? Date.now() - lastShownNum : Infinity;
        
        if (timeSinceLastShown > promoInterval) {
          const timer = setTimeout(() => {
            setShowCoursePromo(true);
            localStorage.setItem('coursePromoLastShown', Date.now().toString());
          }, 10000);
          
          return () => clearTimeout(timer);
        }
      }
    }
  }, [usuario]);

  const handleLogout = async () => {
    await StorageService.cerrarSesion();
    setUsuario(null);
    setPestañaActiva('comunidad');
  };

  const handleVisitProfile = (id: string) => {
    setViewingProfileId(id);
    setPestañaActiva('perfil');
  };

  const handleMyProfile = () => {
    if (usuario) {
      setViewingProfileId(usuario.id);
      setPestañaActiva('perfil');
    }
  };

  // Loader sequence: Welcome → Phrase → Done (particles transition)
  if (loaderPhase !== 'done') {
    return (
      <ElectricLoader
        type={loaderPhase === 'welcome' ? 'welcome' : 'phrase'}
        welcomeText="Bienvenido a nuestra comunidad de trading"
        phrase={currentPhrase}
        fullScreen
      />
    );
  }

  return (
    <AgentOrchestrationProvider>
      <ChatBadgeProvider>
        <ToastProvider>
          <SEO />
          <GlobalErrorHandler>
            <div className="min-h-screen bg-[#050608]/95 selection:bg-primary selection:text-white animate-in fade-in duration-700">
            <div className="ambient-bg">
              <div className="orb orb-1"></div>
              <div className="orb orb-2"></div>
              <div className="orb orb-3"></div>
            </div>

          <ErrorBoundary name="Navigation" fallback={
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/10 h-16">
              <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-full flex items-center">
                <button onClick={() => setPestañaActiva('comunidad')} className="flex items-center gap-3">
                  <img src="/icons/logo.svg" alt="TradeHub" className="size-10 rounded-xl object-cover" />
                  <span className="text-base font-black tracking-tighter uppercase text-white">TRADE<span className="text-primary">HUB</span></span>
                </button>
              </div>
            </header>
          }>
          <Navigation
            pestañaActiva={pestañaActiva}
            setPestañaActiva={(tab) => {
              if (tab === 'perfil') handleMyProfile();
              else setPestañaActiva(tab);
            }}
            usuario={usuario || defaultUserIfNull}
            onLogout={handleLogout}
            onLoginRequest={() => setModalAuth('login')}
            onRegisterRequest={() => setModalAuth('register')}
            onVisitProfile={handleVisitProfile}
            onUpdateUser={setUsuario}
          />
          <FloatingActionsMenu usuario={usuario} onOpenKimiChat={() => setShowKimiChat(true)} />
          <Suspense fallback={null}>
            <KimiChat isOpen={showKimiChat} onClose={() => setShowKimiChat(false)} />
          </Suspense>
        </ErrorBoundary>

        <main className="max-w-[1600px] mx-auto p-2 md:px-6 pt-16 min-h-[calc(100vh-80px)]">
          <div key={pestañaActiva} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <ErrorBoundary
              key={pestañaActiva}
              fallback={
                <AppViewFallback
                  onGoSafe={() => setPestañaActiva(localStorage.getItem('last_stable_tab') || SAFE_FALLBACK_TAB)}
                  onRetry={() => window.location.reload()}
                />
              }
            >
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                  <ElectricLoader type="phrase" phrase="Abriendo Módulo..." />
                </div>
              }>
                {pestañaActiva === 'comunidad' && (
                <ComunidadView
                  key={usuario?.id || 'guest'}
                  usuario={usuario}
                  onVisitProfile={handleVisitProfile}
                  onLoginRequest={() => setModalAuth('login')}
                  onRegisterRequest={() => setModalAuth('register')}
                  onUpdateUser={setUsuario}
                />
              )}
              {pestañaActiva === 'grafico' && <GraficoView usuario={usuario} />}
              {pestañaActiva === 'exness' && <ExnessView usuario={usuario} />}
              {pestañaActiva === 'cursos' && <CursosView usuario={usuario} onVisitProfile={handleVisitProfile} onLoginRequest={() => setModalAuth('login')} />}
              {pestañaActiva === 'psicotrading' && usuario && usuario.id !== 'guest' && (
                <PsicotradingView usuario={usuario} onUpdateUser={setUsuario} />
              )}
              {pestañaActiva === 'psicotrading' && (!usuario || usuario.id === 'guest') && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                  <span className="material-symbols-outlined text-6xl text-primary mb-4 animate-pulse">lock</span>
                  <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">Acceso Exclusivo</h2>
                  <p className="text-gray-400 max-w-sm mb-8 text-sm font-bold">La sección de Psicotrading es solo para miembros de la comunidad. Únete para desbloquear estas herramientas.</p>
                  <button onClick={() => setModalAuth('login')} className="px-8 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">Registrarme</button>
                </div>
              )}
              {pestañaActiva === 'bitacora' && usuario && usuario.id !== 'guest' && (
                <BitacoraView usuario={usuario} />
              )}
              {pestañaActiva === 'bitacora' && (!usuario || usuario.id === 'guest') && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                  <span className="material-symbols-outlined text-6xl text-primary mb-4 animate-pulse">lock</span>
                  <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">Diario de Trading</h2>
                  <p className="text-gray-400 max-w-sm mb-8 text-sm font-bold">Lleva el control de tus operaciones y emociones. Inicia sesión para activar tu bitácora personal.</p>
                  <button onClick={() => setModalAuth('login')} className="px-8 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">Acceder ahora</button>
                </div>
              )}
              {pestañaActiva === 'perfil' && usuario && (
                <PerfilView usuario={usuario} onUpdate={setUsuario} viewingUserId={viewingProfileId} onNavigate={setPestañaActiva} />
              )}
              {pestañaActiva === 'configuracion' && (
                <ConfiguracionView usuario={usuario} onUpdateUser={setUsuario} />
              )}
              {pestañaActiva === 'academia' && (
                <AcademiaView usuario={usuario} onLoginRequest={() => setModalAuth('login')} onNavigate={setPestañaActiva} onVisitProfile={handleVisitProfile} />
              )}
              {pestañaActiva === 'legal' && <LegalView />}
              {pestañaActiva === 'admin' && (usuario?.rol === 'admin' || usuario?.rol === 'ceo') && (
                <AdminView onVisitProfile={handleVisitProfile} usuario={usuario} />
              )}
              {pestañaActiva === 'pricing' && (
                <PricingView usuario={usuario} onLoginRequest={() => setModalAuth('login')} onNavigate={setPestañaActiva} />
              )}
              {pestañaActiva === 'suscripciones' && (
                <PricingView usuario={usuario} onLoginRequest={() => setModalAuth('login')} onNavigate={setPestañaActiva} />
              )}
              {pestañaActiva === 'propfirms' && (
                <PropFirmsView usuario={usuario} />
              )}
              {pestañaActiva === 'signals' && (
                <SignalsView usuario={usuario} />
              )}
              {pestañaActiva === 'news' && (
                <NewsView usuario={usuario} />
              )}
              {pestañaActiva === 'voz' && (
                <VoiceAgent />
              )}
              {pestañaActiva === 'risk' && (
                <RiskAssistant />
              )}
              {pestañaActiva === 'course' && (
                <CourseAssistant />
              )}
              {pestañaActiva === 'creator' && (
                <CreatorAssistant />
              )}
              {pestañaActiva === 'expert-advisors' && (
                <ProductView 
                  usuario={usuario}
                  onLoginRequest={() => setModalAuth('login')}
                  onVisitProfile={handleVisitProfile}
                  initialCategory="ea"
                />
              )}
              {pestañaActiva === 'marketplace' && (
                <ProductView 
                  usuario={usuario}
                  onLoginRequest={() => setModalAuth('login')}
                  onVisitProfile={handleVisitProfile}
                />
              )}
              {pestañaActiva === 'creator' && (
                <CreatorView usuario={usuario} onLoginRequest={() => setModalAuth('login')} onNavigate={setPestañaActiva} />
              )}
              {pestañaActiva === 'creator-dashboard' && usuario && usuario.role >= 3 && (
                <CreatorDashboard 
                  usuario={usuario} 
                  onVisitProfile={handleVisitProfile}
                  onNavigate={setPestañaActiva}
                />
              )}
              {pestañaActiva === 'community-admin' && (
                <CommunityAdminPanel 
                  usuario={usuario}
                  onNavigate={setPestañaActiva}
                />
              )}
              {pestañaActiva === 'leaderboard' && <LeaderboardView usuario={usuario} />}
              {pestañaActiva === 'ads' && usuario && (
                <AdAuctionView />
              )}
              {pestañaActiva === 'discover' && (
                <DiscoverCommunities 
                  usuario={usuario}
                  onVisitProfile={handleVisitProfile}
                  onLoginRequest={() => setModalAuth('login')}
                />
              )}
              {pestañaActiva === 'community-detail' && communitySlug && (
                <CommunityDetailView
                  slug={communitySlug}
                  usuario={usuario}
                  onVisitProfile={handleVisitProfile}
                  onLoginRequest={() => setModalAuth('login')}
                  onBack={() => {
                    setCommunitySlug(null);
                    setPestañaActiva('discover');
                  }}
                />
              )}
              {pestañaActiva === 'marketplace' && (
                <MarketplaceView 
                  usuario={usuario}
                  onLoginRequest={() => setModalAuth('login')}
                  onVisitProfile={handleVisitProfile}
                  onNavigate={setPestañaActiva}
                />
              )}
              {pestañaActiva === 'referidos' && (
                <ReferralView usuario={usuario} onLoginRequest={() => setModalAuth('login')} />
              )}
              {pestañaActiva === 'checkout-success' && (
                <CheckoutSuccessView usuario={usuario} onNavigate={(tab) => {
                  setPestañaActiva(tab);
                  navigate(`/${tab === 'checkout-success' ? 'checkout/success' : tab === 'checkout-cancel' ? 'checkout/cancel' : tab === 'pricing' ? 'pricing' : ''}`);
                }} />
              )}
              {pestañaActiva === 'checkout-cancel' && (
                <CheckoutCancelView onNavigate={(tab) => {
                  setPestañaActiva(tab);
                  navigate(`/${tab === 'checkout-success' ? 'checkout/success' : tab === 'checkout-cancel' ? 'checkout/cancel' : tab === 'pricing' ? 'pricing' : ''}`);
                }} />
              )}
                {pestañaActiva === 'subcommunity' && subcommunityParams && (
                <SubcommunityView
                  usuario={usuario}
                  onVisitProfile={handleVisitProfile}
                  onLoginRequest={() => setModalAuth('login')}
                  parentSlug={subcommunityParams.parentSlug}
                  subSlug={subcommunityParams.subSlug}
                  onBack={() => {
                    setSubcommunityParams(null);
                    setPestañaActiva('community-detail');
                  }}
                />
                )}
                {pestañaActiva === 'juegos' && (
                  <JuegosView usuario={usuario} onNavigate={setPestañaActiva} />
                )}
                {pestañaActiva === 'saboteador' && (
                  <SaboteadorInvisibleView 
                    usuario={usuario} 
                    onBack={() => setPestañaActiva('juegos')} 
                  />
                )}
                {pestañaActiva === 'marketing' && (
                  <MarketingView usuario={usuario} />
                )}
                {pestañaActiva === 'premium-observatory' && (
                  <PremiumObservatory usuario={usuario} />
                )}

              </Suspense>
            </ErrorBoundary>
          </div>
        </main>

        <ErrorBoundary name="MusicPlayer" fallback={null}>
          <MusicPlayer />
        </ErrorBoundary>

        <ErrorBoundary name="LiveChatWidget" fallback={null}>
          <Suspense fallback={null}>
            <LiveChatWidget 
              usuario={usuario}
              isOpen={isChatOpen}
              onOpen={() => setIsChatOpen(true)}
              onClose={() => {
                setIsChatOpen(false);
                setChatCommunityChannel(undefined);
                setChatCommunityName(undefined);
              }}
              initialChannel={chatCommunityChannel}
              communityName={chatCommunityName}
            />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary name="MobileInstallPrompt" fallback={null}>
          <Suspense fallback={null}>
            <MobileInstallPrompt />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary name="OfflineIndicator" fallback={null}>
          <Suspense fallback={null}>
            <OfflineIndicator />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary name="FloatingBar" fallback={null}>
          <Suspense fallback={null}>
            <FloatingBar 
              isLoggedIn={!!usuario && usuario.id !== 'guest'}
              usuario={usuario}
              hasNewPosts={hasNewPosts}
              isRefreshing={isRefreshing}
              onRefresh={() => { window.dispatchEvent(new CustomEvent('refresh-feed')); }}
              onOpenCreate={() => { window.dispatchEvent(new CustomEvent('open-create-modal')); }}
              liveStatus={{ isLive: false, url: '' }}
            />
          </Suspense>
        </ErrorBoundary>

        {modalAuth && (
          <ErrorBoundary name="AuthModal" fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl" onClick={() => setModalAuth(null)}>
              <div className="text-center p-8">
                <p className="text-white/60 mb-4 text-sm">Error cargando autenticación</p>
                <button onClick={() => setModalAuth(null)} className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">Cerrar</button>
              </div>
            </div>
          }>
            <AuthModal
              type={modalAuth}
              onClose={() => setModalAuth(null)}
              onSuccess={(u) => {
                setUsuario(u);
                setModalAuth(null);
                const hasOnboarded = localStorage.getItem('onboarding_completed') === 'true';
                if (!hasOnboarded) {
                  setShowOnboarding(true);
                }
              }}
            />
          </ErrorBoundary>
        )}

        {showOnboarding && usuario && (
          <ErrorBoundary name="OnboardingFlow" fallback={null}>
            <OnboardingFlow
              usuario={usuario}
              onComplete={async () => {
                await StorageService.setOnboardingCompleted();
                setShowOnboarding(false);
              }}
              onUpgradeRequest={() => {
                setShowOnboarding(false);
                navigate('/pricing');
              }}
            />
          </ErrorBoundary>
        )}

        {!showOnboarding && showAuroraIdeas && usuario && (
          <Suspense fallback={null}>
            <AuroraIdeaHub
              isVisible={showAuroraIdeas}
              onClose={() => {
                setShowAuroraIdeas(false);
                localStorage.setItem('auroraIdeasLastShown', Date.now().toString());
              }}
              userName={usuario.nombre}
              onAccept={(idea) => {
                if (idea.actionUrl) {
                  navigateToSection(idea.actionUrl.replace('/', ''));
                }
              }}
            />
          </Suspense>
        )}

        {showFeedback && usuario && usuario.id !== 'guest' && (
          <Suspense fallback={null}>
            <FeedbackModal
              isVisible={showFeedback}
              onClose={() => setShowFeedback(false)}
              userId={usuario.id}
              userName={usuario.nombre}
            />
          </Suspense>
        )}

        <ErrorBoundary name="CoursePromoPopup" fallback={null}>
          <Suspense fallback={null}>
            <CoursePromoPopup
              isVisible={showCoursePromo}
              onClose={() => setShowCoursePromo(false)}
              onSubscribe={() => setPestañaActiva('pricing')}
              usuario={usuario}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
      </GlobalErrorHandler>
    </ToastProvider>
    </ChatBadgeProvider>
    </AgentOrchestrationProvider>
    );
  });

  export default App;
