import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { Usuario, Notificacion } from '../types';
import { StorageService } from '../services/storage';
import { NotificationBell } from './Notifications';
import { Avatar } from './Avatar';

import { NewsFeed } from './agents/NewsFeed';
import { VoiceAgent } from './agents/VoiceAgent';
import { RiskAssistant } from './agents/RiskAssistant';
import { CourseAssistant } from './agents/CourseAssistant';
import { CreatorAssistant } from './agents/CreatorAssistant';

interface NavProps {
  pestañaActiva: string;
  setPestañaActiva: (tab: string) => void;
  usuario: Usuario;
  onLogout: () => void;
  onLoginRequest: () => void;
  onRegisterRequest: () => void;
  onVisitProfile?: (userId: string) => void;
  onUpdateUser?: (u: Usuario) => void;
}

interface DropdownItem {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

interface DropdownSection {
  title: string;
  items: DropdownItem[];
}

const Navigation: React.FC<NavProps> = memo(({ 
  pestañaActiva, 
  setPestañaActiva, 
  usuario, 
  onLogout, 
  onLoginRequest, 
  onRegisterRequest, 
  onVisitProfile, 
  onUpdateUser 
}) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== 'light';
  });
  const [userNotifs, setUserNotifs] = useState<Notificacion[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState({ isLive: false, url: '' });
  const [latestToast, setLatestToast] = useState<Notificacion | null>(null);
  const lastNotifIdRef = useRef<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const [profileMenuPosition, setProfileMenuPosition] = useState({ right: 0, top: 0 });

  const isGuest = usuario.id === 'guest';

  const updateProfileMenuPosition = useCallback(() => {
    if (avatarButtonRef.current) {
      const rect = avatarButtonRef.current.getBoundingClientRect();
      setProfileMenuPosition({
        right: window.innerWidth - rect.right - 16,
        top: rect.bottom + window.scrollY + 8
      });
    }
  }, []);

  useEffect(() => {
    if (!showProfileMenu) return;

    updateProfileMenuPosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node) &&
          !target.closest('button[onClick*="setShowProfileMenu"]') &&
          !target.closest('img[alt="Perfil"]')) {
        setShowProfileMenu(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false);
      }
    };

    const handleScroll = () => {
      setShowProfileMenu(false);
    };

    const autoCloseTimer = setTimeout(() => {
      setShowProfileMenu(false);
    }, 10000);

    const handleInteraction = () => {
      clearTimeout(autoCloseTimer);
      const newTimer = setTimeout(() => {
        setShowProfileMenu(false);
      }, 10000);
      return newTimer;
    };

    let timer = autoCloseTimer;
    const menuElement = profileMenuRef.current;
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateProfileMenuPosition);
    menuElement?.addEventListener('mouseenter', () => { timer = handleInteraction(); });
    menuElement?.addEventListener('mouseleave', () => { timer = handleInteraction(); });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateProfileMenuPosition);
      menuElement?.removeEventListener('mouseenter', () => { timer = handleInteraction(); });
      menuElement?.removeEventListener('mouseleave', () => { timer = handleInteraction(); });
      clearTimeout(timer);
    };
  }, [showProfileMenu, updateProfileMenuPosition]);

  const mainNavItems: { id: string; label: string; dropdown?: DropdownSection; path?: string; icon?: string; description?: string }[] = [
    {
      id: 'comunidad',
      label: 'Explorar',
      dropdown: {
        title: 'Comunidad',
        items: [
          { id: 'comunidad', label: 'Feed Principal', icon: 'groups', description: 'Publicaciones de la comunidad' },
          { id: 'discover', label: 'Comunidades', icon: 'explore', description: 'Encuentra y únete a comunidades' },
          { id: 'leaderboard', label: 'Ranking', icon: 'emoji_events', description: 'Top traders de la semana' },
        ]
      }
    },
    {
      id: 'herramientas',
      label: 'Trading',
      dropdown: {
        title: 'Trading',
        items: [
          { id: 'news', label: 'Noticias', icon: 'newspaper', description: 'Noticias del mercado' },
          { id: 'grafico', label: 'Gráfico', icon: 'candlestick_chart', description: 'Análisis técnico en vivo' },
          { id: 'signals', label: 'Ideas de Trading', icon: 'signal_cellular_alt', description: 'Señales de trading' },
          { id: 'psicotrading', label: 'Psicotrading', icon: 'psychology', description: 'Mentalidad del trader' },
          { id: 'propfirms', label: 'Prop Firms', icon: 'account_balance', description: 'Trading con capital' },
          { id: 'exness', label: 'Broker', icon: 'account_balance_wallet', description: 'Abre tu cuenta' },
          { id: 'bitacora', label: 'Bitácora', icon: 'menu_book', description: 'Registro de operaciones' },
        ]
      }
    },
    {
      id: 'academia',
      label: 'Educación',
      dropdown: {
        title: 'Educación',
        items: []
      }
    },
    {
      id: 'marketplace',
      label: 'Negocios',
      dropdown: {
        title: 'Negocios',
        items: [
          { id: 'marketplace', label: 'Productos', icon: 'shopping_cart', description: 'Compra y vende productos' },
          { id: 'referidos', label: 'Afiliados', icon: 'group_add', description: 'Invita y gana comisiones' },
          { id: 'ads', label: 'Publicidad', icon: 'campaign', description: 'Sistema de subastas' },
        ]
      }
    },
    {
      id: 'mi-comunidad',
      label: 'Mi Comunidad',
      dropdown: {
        title: 'Mi Comunidad',
        items: [
          { id: 'creator-dashboard', label: 'Dashboard Creador', icon: 'dashboard', description: 'Analíticas, revenue & Observatory premium' },
          { id: 'creator', label: 'Creator Studio', icon: 'storefront', description: 'Monetiza tu contenido' },
          { id: 'marketing', label: 'Marketing Pro', icon: 'campaign', description: 'Crea contenido con IA' },
          { id: 'community-admin', label: 'Mi Comunidad', icon: 'groups', description: 'Administra tu comunidad' },
        ]
      }
    },
    {
      id: 'suscripciones',
      label: 'Suscripciones',
      dropdown: {
        title: 'Suscripciones',
        items: [
          { id: 'pricing', label: 'Planes', icon: 'workspace_premium', description: 'Planes y membresías' },
          { id: 'creator', label: 'Creator Studio', icon: 'storefront', description: 'Monetiza tu contenido' },
        ]
      }
    },
    {
      id: 'juegos',
      label: 'Juegos',
      icon: 'sports_esports',
      path: 'juegos',
      description: '• Compite con otros traders\n• Gana premios exclusivos\n• Sube en el ranking'
    },
    {
      id: 'mas',
      label: 'Más',
      dropdown: {
        title: 'Más Opciones',
        items: [
          { id: 'legal', label: 'Legal', icon: 'gavel', description: 'Términos y condiciones' },
        ]
      }
    }
  ];

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (usuario.id !== 'guest') {
      const fetchNotifs = async () => {
        const n = await StorageService.getNotifications(usuario.id);
        if (n.length > 0) {
          const newest = n[0];
          if (lastNotifIdRef.current && newest.id !== lastNotifIdRef.current) {
            setLatestToast(newest);
            setTimeout(() => setLatestToast(null), 6000);
          }
          lastNotifIdRef.current = newest.id;
        }
        setUserNotifs(n);
      };

      fetchNotifs();
      const interval = setInterval(fetchNotifs, 5000);

      const fetchLive = async () => {
        const status = await StorageService.getLiveStatus();
        setLiveStatus(status);
      };
      fetchLive();
      const liveInterval = setInterval(fetchLive, 10000);

      return () => {
        clearInterval(interval);
        clearInterval(liveInterval);
      };
    }
  }, [usuario.id]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const handleNavClick = (id: string) => {
    setPestañaActiva(id);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleReadNotification = async (notif: Notificacion) => {
    await StorageService.markNotificationRead(notif.id);
    setUserNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, leida: true } : n));
    if (notif.link && onVisitProfile) {
      onVisitProfile(notif.link);
    }
    setShowNotifPanel(false);
  };

  const unreadCount = userNotifs.filter(n => !n.leida).length;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f] border-b border-white/10 shadow-lg transition-all duration-300">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setPestañaActiva('comunidad')}
            >
              <div className="relative">
                {/* Simplified hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Logo */}
                <img
                  src="/icons/logo.svg"
                  alt="TradeHub"
                  className="relative size-10 rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <h1 className="text-lg font-bold tracking-wide uppercase leading-[0.9] text-white">
                  TRADE<span className="text-primary font-bold">HUB</span>
                </h1>
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-gray-500 mt-0.5">Trading Community</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 relative" ref={dropdownRef}>
              {mainNavItems.map(item => (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => item.dropdown ? setActiveDropdown(activeDropdown === item.id ? null : item.id) : handleNavClick(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 group relative ${
                      pestañaActiva === item.id || (item.dropdown && activeDropdown === item.id)
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon ? (
                      <span className="material-symbols-outlined text-lg inline-block mr-1 align-text-bottom">{item.icon}</span>
                    ) : null}
                    {item.label}
                    {item.dropdown && (
                      <span className={`material-symbols-outlined text-sm ml-1 inline-block align-middle transition-transform duration-200 ${activeDropdown === item.id ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    )}
                  </button>

                  {/* Dropdown */}
                  {item.dropdown && activeDropdown === item.id && (
                    <div className="absolute top-full left-0 pt-2 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-3 shadow-xl overflow-hidden">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3 px-2">
                          {item.dropdown.title}
                        </h3>
                        <div className="space-y-1">
                          {item.dropdown.items.filter(dropItem => {
                            if (item.id === 'mi-comunidad') {
                              const isCreatorOrAdmin = (usuario?.role && usuario.role >= 4) || usuario?.rol === 'admin' || usuario?.rol === 'ceo';
                              const creatorOnlyItems = ['creator-dashboard', 'marketing', 'community-admin', 'pricing'];
                              if (!isCreatorOrAdmin && creatorOnlyItems.includes(dropItem.id)) {
                                return false;
                              }
                            }
                            return true;
                          }).map(dropItem => (
                            <button
                              key={dropItem.id}
                              onClick={() => handleNavClick(dropItem.id)}
                              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all duration-200 group/item"
                            >
                              <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-primary text-base">{dropItem.icon}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-300 group-hover/item:text-white transition-colors">{dropItem.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              {isGuest ? (
                <>
                  <button
                    onClick={onLoginRequest}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white border border-white/20 hover:border-primary hover:bg-white/5 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    Ingresar
                  </button>
                  <button
                    onClick={onRegisterRequest}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">person_add</span>
                    Registro
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowNotifPanel(!showNotifPanel); setShowProfileMenu(false); }}
                    className="relative size-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-white/5 transition-all"
                  >
                    <NotificationBell count={unreadCount} />
                  </button>
                  {(usuario.rol === 'admin' || usuario.rol === 'ceo' || (usuario.role && usuario.role >= 5)) && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setPestañaActiva('aurora-hive'); setShowProfileMenu(false); setShowNotifPanel(false); }}
                        className="size-9 rounded-lg bg-violet-600 flex items-center justify-center hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20"
                        title="Aurora Hive Mind"
                      >
                        <span className="material-symbols-outlined text-white text-base animate-pulse">hub</span>
                      </button>
                      <button
                        onClick={() => { setPestañaActiva('admin'); setShowProfileMenu(false); setShowNotifPanel(false); }}
                        className="size-9 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/90 transition-all"
                        title="Panel Admin"
                      >
                        <span className="material-symbols-outlined text-white text-base">admin_panel_settings</span>
                      </button>
                    </div>
                  )}
                  <button
                    ref={avatarButtonRef}
                    onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifPanel(false); }}
                    className="size-9 rounded-lg overflow-hidden transition-transform hover:scale-105"
                  >
                    <Avatar
                      src={usuario.avatar}
                      name={usuario.nombre}
                      seed={usuario.usuario}
                      frame={usuario.avatarFrame}
                      size="md"
                      rounded="lg"
                    />
                  </button>
                </div>
              )}

              {/* Hamburger Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden size-9 rounded-lg flex flex-col items-center justify-center gap-1 text-white hover:bg-white/5 transition-all"
              >
                <span className={`w-4 h-0.5 bg-current transition-all duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''}`} />
                <span className={`w-4 h-0.5 bg-current transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`w-4 h-0.5 bg-current transition-all duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-0.5' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Panel */}
        {showNotifPanel && (
          <div className="absolute right-4 top-full mt-2 w-80 bg-[#0a0a0f] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
            <div className="p-3 border-b border-white/10 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Notificaciones</h4>
              <span className="text-[10px] text-primary font-semibold">{unreadCount} nuevas</span>
            </div>
            <div className="max-h-72 overflow-y-auto no-scrollbar">
              {userNotifs.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs font-bold uppercase tracking-wider">Sin novedades</div>
              ) : (
                userNotifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleReadNotification(n)}
                    className={`p-3 border-b border-white/10 flex gap-3 hover:bg-white/5 transition-colors cursor-pointer ${n.leida ? 'opacity-50' : ''}`}
                  >
                    <Avatar src={n.avatarUrl} name={n.mensaje} seed={n.id} size="md" rounded="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 leading-tight">{n.mensaje}</p>
                      <p className="text-[10px] text-gray-500 font-semibold mt-1 uppercase">{n.tiempo}</p>
                    </div>
                    {!n.leida && <div className="size-2 rounded-full bg-primary mt-2 animate-pulse" />}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Profile Menu */}
        {showProfileMenu && (
          <div
            ref={profileMenuRef}
            style={{ right: profileMenuPosition.right, top: profileMenuPosition.top }}
            className="absolute w-64 bg-[#0a0a0f] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60] transition-all duration-300 ease-out"
          >
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Avatar
                  src={usuario.avatar}
                  name={usuario.nombre}
                  seed={usuario.usuario}
                  frame={usuario.avatarFrame}
                  size="lg"
                  rounded="lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">{usuario.nombre}</h4>
                  <p className="text-[10px] text-gray-500 font-mono">@{usuario.usuario}</p>
                </div>
              </div>
              <div className="flex justify-between gap-2">
                <button className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg py-2 flex flex-col items-center transition-colors">
                  <span className="text-sm font-bold text-white">{usuario.seguidores?.length || 0}</span>
                  <span className="text-[8px] text-gray-500 uppercase font-semibold">Seguidores</span>
                </button>
                <button className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg py-2 flex flex-col items-center transition-colors">
                  <span className="text-sm font-bold text-white">{usuario.siguiendo?.length || 0}</span>
                  <span className="text-[8px] text-gray-500 uppercase font-semibold">Siguiendo</span>
                </button>
              </div>
            </div>

            <div className="p-2 space-y-1">
              <button
                onClick={() => { setPestañaActiva('perfil'); setShowProfileMenu(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-lg">person</span>
                Mi Perfil
              </button>
              <button
                onClick={() => { setPestañaActiva('configuracion'); setShowProfileMenu(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
                Configuración
              </button>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-lg">{isDark ? 'light_mode' : 'dark_mode'}</span>
                {isDark ? 'Modo Claro' : 'Modo Oscuro'}
              </button>

              <div className="h-px bg-white/10 my-2" />

              <button
                onClick={() => { setShowProfileMenu(false); setMobileMenuOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[999] lg:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div
          className="absolute inset-0 bg-[#0a0a0f]"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-0 right-0 h-full w-80 max-w-full bg-[#0a0a0f] border-l border-white/10 transition-transform duration-300 z-50 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
            <span className="text-primary font-bold text-lg">MENÚ</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-white active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-64px)]">
            {mainNavItems.map(item => (
              <div key={item.id} className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    item.dropdown ? setActiveDropdown(activeDropdown === item.id ? null : item.id) : handleNavClick(item.id);
                  }}
                  className={`flex items-center justify-between w-full text-base font-semibold transition-all py-2 ${activeDropdown === item.id ? 'text-primary' : 'text-white'} active:opacity-70 cursor-pointer`}
                >
                  <span>{item.label}</span>
                  {item.dropdown && (
                    <span className={`material-symbols-outlined transition-transform duration-200 ${activeDropdown === item.id ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  )}
                </button>

                {item.dropdown && activeDropdown === item.id && (
                  <div className="mt-2 ml-4 pl-3 border-l-2 border-white/10 space-y-2">
                    {item.dropdown.items.filter(dropItem => {
                      if (item.id === 'mi-comunidad') {
                        const isCreatorOrAdmin = (usuario?.role && usuario.role >= 4) || usuario?.rol === 'admin' || usuario?.rol === 'ceo';
                        const creatorOnlyItems = ['creator-dashboard', 'marketing', 'community-admin', 'pricing'];
                        if (!isCreatorOrAdmin && creatorOnlyItems.includes(dropItem.id)) {
                          return false;
                        }
                      }
                      return true;
                    }).map(dropItem => (
                      <button
                        key={dropItem.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleNavClick(dropItem.id);
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                          <span className="material-symbols-outlined text-base">{dropItem.icon}</span>
                        </div>
                        <span className="text-sm font-medium">{dropItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0a0a0f] border-t border-white/10 z-[50] lg:hidden">
        <div className="flex justify-around items-center h-14 px-1">
          {[
            { id: 'comunidad', icon: 'groups', label: 'Feed' },
            { id: 'academia', icon: 'school', label: 'Academia' },
            { id: 'grafico', icon: 'candlestick_chart', label: 'Trading' },
            { id: 'marketplace', icon: 'storefront', label: 'Market' },
            { id: 'menu', icon: 'apps', label: 'Más' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'menu') {
                  setMobileMenuOpen(true);
                } else {
                  setPestañaActiva(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-[60px] ${
                pestañaActiva === item.id ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="text-[9px] font-semibold uppercase">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Toast Notification */}
      {latestToast && (
        <div className="fixed bottom-20 right-4 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div
            className="bg-[#0a0a0f] border border-white/10 rounded-lg p-3 shadow-xl flex items-center gap-3 max-w-sm cursor-pointer hover:scale-105 transition-transform"
            onClick={() => { setShowNotifPanel(true); setLatestToast(null); }}
          >
            <Avatar src={latestToast.avatarUrl} name={latestToast.mensaje} seed={latestToast.id} size="lg" rounded="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h5 className="text-[10px] font-bold uppercase text-primary">Nueva Actividad</h5>
                <span className="text-[9px] text-gray-500 font-semibold">Ahora</span>
              </div>
              <p className="text-xs text-gray-300 font-medium line-clamp-2 leading-tight">{latestToast.mensaje}</p>
            </div>
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      )}
    </>
  );
});

export default Navigation;
