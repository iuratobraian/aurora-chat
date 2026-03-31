import React, { useState, useRef, useCallback, useEffect } from 'react';

interface GestureNavItem {
  id: string;
  icon: string;
  label: string;
}

interface MobileGestureNavProps {
  items: GestureNavItem[];
  activeIndex: number;
  onNavigate: (index: number) => void;
  children: React.ReactNode;
}

const MobileGestureNav: React.FC<MobileGestureNavProps> = ({
  items,
  activeIndex,
  onNavigate,
  children,
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const swipeHistory = useRef<number[]>([]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    swipeHistory.current = [];
    setShowIndicator(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;

    swipeHistory.current.push(diffX);
    if (swipeHistory.current.length > 10) {
      swipeHistory.current.shift();
    }

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipe.current) {
      e.preventDefault();
      setIsDragging(true);
      
      const maxOffset = 100;
      const dampedOffset = diffX * 0.4;
      const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, dampedOffset));
      setSwipeOffset(clampedOffset);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isHorizontalSwipe.current) {
      setSwipeOffset(0);
      setIsDragging(false);
      setShowIndicator(false);
      return;
    }

    const avgSwipe = swipeHistory.current.reduce((a, b) => a + b, 0) / swipeHistory.current.length;
    const swipeThreshold = 80;

    if (avgSwipe < -swipeThreshold && activeIndex < items.length - 1) {
      onNavigate(activeIndex + 1);
    } else if (avgSwipe > swipeThreshold && activeIndex > 0) {
      onNavigate(activeIndex - 1);
    }

    setSwipeOffset(0);
    setIsDragging(false);
    setShowIndicator(false);
    isHorizontalSwipe.current = null;
  }, [activeIndex, items.length, onNavigate]);

  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => document.removeEventListener('touchmove', preventDefault);
  }, [isDragging]);

  return (
    <div className="md:hidden relative">
      <div
        ref={containerRef}
        className="relative overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div
          className="transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${swipeOffset}px)`,
          }}
        >
          {children}
        </div>
      </div>

      {showIndicator && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none flex justify-between px-4">
          <div
            className={`w-12 h-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all duration-200 ${
              activeIndex > 0 && swipeOffset > 20 ? 'scale-110 opacity-100' : 'scale-75 opacity-30'
            }`}
          >
            <span className="material-symbols-outlined text-white">chevron_left</span>
          </div>
          <div
            className={`w-12 h-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all duration-200 ${
              activeIndex < items.length - 1 && swipeOffset < -20 ? 'scale-110 opacity-100' : 'scale-75 opacity-30'
            }`}
          >
            <span className="material-symbols-outlined text-white">chevron_right</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => onNavigate(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'w-8 bg-primary'
                : 'w-1.5 bg-white/30'
            }`}
            aria-label={`Navegar a ${items[index].label}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileGestureNav;
