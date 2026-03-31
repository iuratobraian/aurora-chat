import React, { useState, useRef, useCallback } from 'react';

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  pullThreshold?: number;
}

const MobilePullToRefresh: React.FC<MobilePullToRefreshProps> = ({
  onRefresh,
  children,
  pullThreshold = 80,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const isTouched = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      isTouched.current = true;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTouched.current || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      e.preventDefault();
      setIsPulling(true);
      const resistance = Math.min(diff * 0.5, pullThreshold * 1.5);
      setPullDistance(resistance);
    }
  }, [isRefreshing, pullThreshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isTouched.current) return;
    isTouched.current = false;
    
    if (pullDistance >= pullThreshold) {
      setIsRefreshing(true);
      setPullDistance(pullThreshold);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [pullDistance, pullThreshold, onRefresh]);

  const pullProgress = Math.min(pullDistance / pullThreshold, 1);

  return (
    <div
      className="md:hidden overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative transition-transform duration-200"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-20 flex items-center justify-center overflow-hidden"
          style={{
            opacity: pullDistance > 10 ? 1 : 0,
            transform: `translateY(${-80 + pullDistance}px)`,
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center"
              style={{
                borderColor: pullProgress >= 1 ? '#00e676' : '#3b82f6',
                transition: 'border-color 0.2s',
              }}
            >
              {isRefreshing ? (
                <span className="material-symbols-outlined text-primary text-lg animate-spin">
                  progress_activity
                </span>
              ) : (
                <span
                  className="material-symbols-outlined text-lg transition-transform duration-200"
                  style={{
                    color: pullProgress >= 1 ? '#00e676' : '#3b82f6',
                    transform: `rotate(${pullProgress * 180}deg)`,
                  }}
                >
                  arrow_downward
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-gray-400">
              {isRefreshing
                ? 'Actualizando...'
                : pullProgress >= 1
                ? '¡Suelta para actualizar!'
                : 'Desliza para actualizar'}
            </span>
          </div>
        </div>

        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobilePullToRefresh;
