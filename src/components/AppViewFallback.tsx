import React from 'react';

// Skeleton card for feed fallback — shows content structure without blocking
const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="size-9 rounded-full bg-white/10" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 bg-white/10 rounded w-28" />
        <div className="h-2 bg-white/5 rounded w-16" />
      </div>
    </div>
    <div className="space-y-2 pl-12">
      <div className="h-2 bg-white/10 rounded w-full" />
      <div className="h-2 bg-white/10 rounded w-4/5" />
      <div className="h-2 bg-white/5 rounded w-3/5" />
    </div>
    <div className="flex gap-4 pl-12 pt-1">
      <div className="h-2 bg-white/5 rounded w-8" />
      <div className="h-2 bg-white/5 rounded w-8" />
    </div>
  </div>
);

interface AppViewFallbackProps {
  title?: string;
  message?: string;
  onGoSafe?: () => void;
  onRetry?: () => void;
}

const AppViewFallback: React.FC<AppViewFallbackProps> = ({ onRetry }) => {
  return (
    <div className="max-w-[680px] mx-auto px-3 pt-4 pb-10 space-y-3">
      {/* Subtle reconnecting indicator */}
      <div className="flex items-center justify-between px-1 py-2">
        <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Cargando feed...</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-[10px] text-primary/60 hover:text-primary font-bold uppercase tracking-widest transition-colors"
          >
            ↻ Reintentar
          </button>
        )}
      </div>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
};

export default AppViewFallback;
