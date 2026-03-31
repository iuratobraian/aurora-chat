import React, { memo, useState, useEffect } from 'react';
import { extractYoutubeId } from '../../utils/youtube';
import { Usuario } from '../../types';
import { ProtectedIframe } from '../../components/VideoProtection';

interface CommunityTVSectionProps {
  communityId: string;
  communityName: string;
  tvShareUrl?: string;
  isAdmin: boolean;
  isMember: boolean;
  usuario: Usuario | null;
  onEditTV?: () => void;
}

const VideoIframe: React.FC<{ url: string; autoPlay: boolean }> = memo(({ url, autoPlay }) => {
  const videoId = extractYoutubeId(url);

  if (!videoId) return null;

  // Usar ProtectedIframe con protección completa anti-robo
  return (
    <ProtectedIframe
      videoId={videoId}
      autoPlay={autoPlay}
      muted={false}
      showControls={false}
      className="w-full h-full"
    />
  );
});

const LockOverlay: React.FC<{ isGuest: boolean; onJoin: () => void }> = memo(({ isGuest, onJoin }) => (
  <div className="absolute inset-0 z-10 bg-black/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl">
    <div className="size-20 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
      <span className="material-symbols-outlined text-4xl text-primary animate-pulse">lock</span>
    </div>
    <h3 className="text-2xl md:text-3xl font-black uppercase text-white tracking-widest mb-3">
      TV Share Privado
    </h3>
    <p className="text-sm text-gray-400 font-bold max-w-md mx-auto mb-8">
      {isGuest
        ? "Este contenido es exclusivo para miembros de la comunidad. Únete para acceder a las transmisiones privadas."
        : "Este contenido es exclusivo para miembros confirmados de la comunidad."}
    </p>
    <button
      onClick={onJoin}
      className="px-8 py-4 bg-primary hover:bg-blue-600 border border-primary/50 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
    >
      <span className="material-symbols-outlined">login</span>
      <span>{isGuest ? 'Iniciar Sesión' : 'Solicitar Acceso'}</span>
    </button>
  </div>
));

const TVOffMessage: React.FC = memo(() => (
  <div className="p-8 text-center bg-[#0a0000] min-h-[300px] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <span className="material-symbols-outlined text-4xl text-gray-600">tv_off</span>
      <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">TV Share Apagado</h3>
      <p className="text-xs text-gray-600">El administrador no ha iniciado una transmisión</p>
    </div>
  </div>
));

const EditTVButton: React.FC<{ onClick: () => void }> = memo(({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-4 right-4 z-30 px-4 py-2 bg-black/50 hover:bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest border border-white/10 transition-all backdrop-blur-md flex items-center gap-2"
  >
    <span className="material-symbols-outlined">edit</span>
    Editar TV
  </button>
));

const CommunityTVSection: React.FC<CommunityTVSectionProps> = ({
  communityId,
  communityName,
  tvShareUrl,
  isAdmin,
  isMember,
  usuario,
  onEditTV,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const isGuest = !usuario || usuario.id === 'guest';
  const hasAccess = !isGuest && isMember;
  const isLive = !!tvShareUrl;

  // Autoplay al cargar
  useEffect(() => {
    if (isLive && hasAccess) {
      setAutoPlay(true);
    }
  }, [isLive, hasAccess, tvShareUrl]);

  if (!hasAccess && !isAdmin) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0a0000]">
        <LockOverlay isGuest={isGuest} onJoin={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))} />
      </div>
    );
  }

  return (
    <>
      {/* Contenedor Principal */}
      <div className={`relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0a0000] transition-all ${isFullscreen ? '' : ''}`}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">live_tv</span>
              <div>
                <h3 className="text-white font-black uppercase tracking-widest text-sm">
                  {communityName} TV
                </h3>
                <p className="text-xs text-gray-400 font-bold">
                  {isLive ? 'Transmitiendo ahora' : 'TV Share Privado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              {isAdmin && onEditTV && (
                <EditTVButton onClick={onEditTV} />
              )}
              <button
                onClick={() => setIsFullscreen(true)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-black uppercase tracking-widest border border-white/10 transition-all backdrop-blur-md flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">fullscreen</span>
              </button>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className={`${isFullscreen ? '' : 'aspect-video'} bg-black relative`}>
          {isLive && hasAccess ? (
            <>
              <VideoIframe url={tvShareUrl!} autoPlay={autoPlay} />
              {/* Live Badge */}
              <div className="absolute top-16 left-6 z-30 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-2 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                <span className="size-2 bg-white rounded-full shadow-[0_0_10px_white]" />
                EN VIVO
              </div>
            </>
          ) : (
            <TVOffMessage />
          )}
        </div>
      </div>

      {/* Fullscreen Popup Modal con Backdrop Blur */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Contenedor del Video */}
          <div 
            className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute -top-12 right-0 z-[60] size-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/20"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            {/* Video */}
            <div className="relative w-full h-full max-w-7xl max-h-[85vh] bg-black rounded-xl overflow-hidden shadow-2xl">
              {isLive ? (
                <>
                  <VideoIframe url={tvShareUrl!} autoPlay={autoPlay} />
                  {/* Live Badge en Fullscreen */}
                  <div className="absolute top-6 left-6 z-30 px-4 py-2 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-md flex items-center gap-2 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                    <span className="size-2.5 bg-white rounded-full shadow-[0_0_15px_white]" />
                    EN VIVO
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <TVOffMessage />
                </div>
              )}
            </div>

            {/* Info Bar en Fullscreen */}
            {isLive && (
              <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                  <div className="flex items-center gap-3">
                    <span className="size-2 bg-red-600 rounded-full animate-pulse" />
                    <span className="text-sm text-white font-bold uppercase tracking-widest">
                      {communityName} TV
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    Solo miembros
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default memo(CommunityTVSection);
