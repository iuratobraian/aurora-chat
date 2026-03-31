import React, { useRef, useEffect, ReactNode } from 'react';

interface VideoProtectionProps {
  children: ReactNode;
  className?: string;
  allowFullscreen?: boolean;
}

/**
 * VideoProtection - Componente de protección anti-robo de links de YouTube
 * 
 * Características:
 * - Bloquea click derecho (contextmenu)
 * - Bloquea atajos de teclado (F, F11, espacio, etc.)
 * - Previene selección de texto
 * - Previene arrastrar elementos
 * - Previene doble click para fullscreen
 * - Opcionalmente deshabilita fullscreen nativo
 */
export const VideoProtection: React.FC<VideoProtectionProps> = ({
  children,
  className = '',
  allowFullscreen = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevenir menu contextual (click derecho)
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevenir atajos de teclado para fullscreen y otras acciones
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear F (fullscreen YouTube), F11 (fullscreen navegador), Espacio (play/pause)
      const blockedKeys = ['KeyF', 'F11', 'Space', 'KeyK', 'ArrowUp', 'ArrowDown'];
      if (blockedKeys.includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Prevenir selección de texto
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevenir arrastrar elementos
    const handleDragStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevenir doble click
    const handleDblClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevenir fullscreen change
    const handleFullscreenChange = () => {
      if (!allowFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };

    // Agregar listeners
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('selectstart', handleSelectStart);
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('dblclick', handleDblClick);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup
    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('selectstart', handleSelectStart);
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('dblclick', handleDblClick);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [allowFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`${className} relative`}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
    >
      {/* Overlay protector transparente - permite ver pero bloquea interacciones directas */}
      <div 
        className="absolute inset-0 z-30 pointer-events-none"
        style={{
          background: 'transparent',
          touchAction: 'none',
        }}
      />
      {children}
    </div>
  );
};

/**
 * ProtectedIframe - Iframe de YouTube con protección integrada
 */
interface ProtectedIframeProps {
  videoId: string;
  autoPlay?: boolean;
  muted?: boolean;
  showControls?: boolean;
  className?: string;
}

export const ProtectedIframe: React.FC<ProtectedIframeProps> = ({
  videoId,
  autoPlay = true,
  muted = false,
  showControls = false,
  className = '',
}) => {
  if (!videoId) return null;

  // Parámetros de YouTube para máxima protección
  const params = new URLSearchParams({
    autoplay: autoPlay ? '1' : '0',
    mute: muted ? '1' : '0',
    controls: showControls ? '1' : '0',
    modestbranding: '1',
    rel: '0',
    disablekb: '1', // Deshabilitar teclado
    iv_load_policy: '3', // Ocultar anotaciones
    playsinline: '1', // Prevenir fullscreen automático en móvil
    fs: '0', // Deshabilitar botón de fullscreen
    cc_load_policy: '0', // Ocultar subtítulos si existen
  });

  return (
    <VideoProtection className={className} allowFullscreen={false}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        // NO permitir fullscreen nativo
        allowFullScreen={false}
        title="Protected Video"
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
        sandbox="allow-same-origin allow-scripts allow-autoplay"
      />
    </VideoProtection>
  );
};

export default VideoProtection;
