import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface Video {
  _id: string;
  titulo: string;
  embedUrl: string;
  duracion: string;
  thumbnail: string;
  autor: string;
}

interface PsychotradingShortsPlayerProps {
  onClose?: () => void;
}

export const PsychotradingShortsPlayer: React.FC<PsychotradingShortsPlayerProps> = ({ onClose }) => {
  const shorts = useQuery(api.videos.getShorts, { limit: 10 }) as Video[] | undefined;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto-play next short
  useEffect(() => {
    if (!isPlaying || !shorts?.length) return;

    setProgress(0);
    const duration = 15000; // 15 seconds per short
    const interval = 100; // Update every 100ms
    const step = 100 / (duration / interval);

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, isPlaying, shorts?.length]);

  const handleNext = useCallback(() => {
    if (!shorts?.length) return;
    setCurrentIndex((prev) => (prev + 1) % shorts.length);
    setProgress(0);
  }, [shorts?.length]);

  const handlePrevious = useCallback(() => {
    if (!shorts?.length) return;
    setCurrentIndex((prev) => (prev - 1 + shorts.length) % shorts.length);
    setProgress(0);
  }, [shorts?.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, onClose]);

  // Touch/swipe support
  const touchStartY = useRef<number>(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  if (!shorts?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass rounded-2xl p-8">
        <span className="material-symbols-outlined text-6xl text-gray-500 mb-4">slow_motion_video</span>
        <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No hay Shorts disponibles</h3>
        <p className="text-gray-400 text-sm">Vuelve más tarde para ver contenido nuevo</p>
      </div>
    );
  }

  const currentShort = shorts[currentIndex];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-red-500 text-2xl">slow_motion_video</span>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Shorts de Psicotrading</h3>
            <p className="text-xs text-gray-400">{currentIndex + 1} de {shorts.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
            >
              <span className="material-symbols-outlined text-white">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-2xl shadow-primary/20 border border-white/10"
      >
        {/* YouTube Iframe */}
        <iframe
          width="100%"
          height="100%"
          src={`${currentShort.embedUrl}?autoplay=${isPlaying ? 1 : 0}&mute=1&loop=1&playlist=${currentShort.embedUrl.split('/').pop()}&controls=0&modestbranding=1&rel=0`}
          title={currentShort.titulo}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full object-cover"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Video Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h4 className="text-white font-bold text-sm mb-1 line-clamp-2">{currentShort.titulo}</h4>
          <p className="text-gray-300 text-xs">{currentShort.autor}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-gray-400 bg-white/10 px-2 py-1 rounded-full">
              {currentShort.duracion}
            </span>
          </div>
        </div>

        {/* Navigation Hints */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-white text-xl">keyboard_arrow_up</span>
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-white text-xl">keyboard_arrow_down</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Navigation Instructions */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-gray-500 uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">swipe_vertical</span>
          Swipe
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">keyboard</span>
          Flechas
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">space_bar</span>
          Pausa
        </span>
      </div>
    </div>
  );
};

export default PsychotradingShortsPlayer;
