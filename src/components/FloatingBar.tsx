import React, { useState, useEffect, useRef, memo } from 'react';
import { useChatBadge } from './ChatBadgeContext';

interface FloatingBarProps {
  onOpenCreate: () => void;
  onRefresh: () => void;
  hasNewPosts: boolean;
  isRefreshing: boolean;
  usuario: any;
  isLoggedIn: boolean;
  liveStatus?: { isLive: boolean; url: string };
}

interface TooltipProps {
  label: string;
  shortcut?: string;
  description?: string;
}

const ActionTooltip: React.FC<TooltipProps> = ({ label, shortcut, description }) => (
  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-0 translate-x-2">
    <div className="glass bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-white">{label}</span>
        {shortcut && (
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono text-gray-400">{shortcut}</kbd>
        )}
      </div>
      {description && (
        <p className="text-[9px] text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
  </div>
);

const FloatingBar: React.FC<FloatingBarProps> = memo(({ 
  onOpenCreate, 
  onRefresh, 
  hasNewPosts, 
  isRefreshing,
  usuario,
  isLoggedIn,
  liveStatus
}) => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showTVPlayer, setShowTVPlayer] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [pulseGlow, setPulseGlow] = useState<string | null>(null);
  const glowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { unreadMessages, unreadMentions } = useChatBadge();

  const isLive = liveStatus?.isLive || false;

  const triggerGlow = (id: string) => {
    setPulseGlow(id);
    if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
    glowTimeoutRef.current = setTimeout(() => setPulseGlow(null), 600);
  };

  const handleOpenChat = () => window.dispatchEvent(new CustomEvent('open-live-chat'));
  const handleOpenSignals = () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'signals' }));

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'n' || e.key === 'N') { triggerGlow('create'); onOpenCreate(); }
      if (e.key === 'r' && e.ctrlKey) { e.preventDefault(); triggerGlow('refresh'); onRefresh(); }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKey);
      if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
    };
  }, [onOpenCreate, onRefresh]);

  if (!isLoggedIn) return null;

  return (
    <>
      {/* TV Player Modal */}
      {showTVPlayer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowTVPlayer(false)}>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowTVPlayer(false)}
              className="absolute top-4 right-4 z-10 size-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            
            {isLive && liveStatus?.url ? (
              <iframe
                src={liveStatus.url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-5xl text-gray-600">tv_off</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">TV Fuera del Aire</h3>
                <p className="text-gray-500 max-w-md">
                  El streamer no está transmitiendo. Vuelve más tarde.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-48 right-4 sm:bottom-40 sm:right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
        {/* Back to Top */}
        {showBackToTop && (
          <div className="group relative">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`pointer-events-auto size-10 rounded-lg bg-black/40 backdrop-blur border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 animate-in slide-in-from-bottom-4 fade-in duration-500 ${pulseGlow === 'backtop' ? 'ring-2 ring-primary/50' : ''}`}
              onMouseEnter={() => setHoveredButton('backtop')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span className="material-symbols-outlined">expand_less</span>
            </button>
            <ActionTooltip label="Subir" shortcut="Home" />
          </div>
        )}

        {/* Main Action Bar - Minimalist */}
        <div className="pointer-events-auto flex flex-col items-center p-1 glass bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl animate-in slide-in-from-right-4 fade-in duration-500 gap-1">
          
          {/* TV */}
          <div className="group relative">
            <button
              onClick={() => { triggerGlow('tv'); setShowTVPlayer(true); }}
              className={`relative size-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${pulseGlow === 'tv' ? 'ring-2 ring-primary/50' : ''} ${isLive ? 'text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              onMouseEnter={() => setHoveredButton('tv')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {isLive && (
                <div className="absolute -top-0.5 -right-0.5 size-2 bg-red-500 rounded-full animate-pulse" />
              )}
              <span className="material-symbols-outlined">live_tv</span>
            </button>
            <ActionTooltip label={isLive ? 'TV en Vivo' : 'TV'} shortcut="T" />
          </div>

          {/* Refresh */}
          <div className="group relative">
            <button
              onClick={() => { triggerGlow('refresh'); onRefresh(); }}
              className={`size-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${pulseGlow === 'refresh' ? 'ring-2 ring-primary/50' : ''} ${hasNewPosts ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              onMouseEnter={() => setHoveredButton('refresh')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span className={`material-symbols-outlined ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
              {hasNewPosts && (
                <div className="absolute -top-0.5 -right-0.5 size-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
            <ActionTooltip label="Actualizar" shortcut="Ctrl+R" />
          </div>

          {/* Signals */}
          <div className="group relative">
            <button
              onClick={() => { triggerGlow('signals'); handleOpenSignals(); }}
              className={`size-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${pulseGlow === 'signals' ? 'ring-2 ring-primary/50' : ''} text-gray-400 hover:text-signal-green hover:bg-signal-green/10`}
              onMouseEnter={() => setHoveredButton('signals')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span className="material-symbols-outlined">trending_up</span>
            </button>
            <ActionTooltip label="Señales" />
          </div>

          {/* Create */}
          <div className="group relative">
            <button
              onClick={() => { triggerGlow('create'); onOpenCreate(); }}
              className={`size-10 rounded-lg bg-white/10 hover:bg-primary text-gray-300 hover:text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${pulseGlow === 'create' ? 'ring-2 ring-primary/50' : ''}`}
              onMouseEnter={() => setHoveredButton('create')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <span className="material-symbols-outlined">add</span>
            </button>
            <ActionTooltip label="Crear" shortcut="N" />
          </div>
        </div>
      </div>
    </>
  );
});

FloatingBar.displayName = 'FloatingBar';

export default FloatingBar;
