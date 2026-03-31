import React, { useEffect, useState } from 'react';

export interface AdBannerProps {
  title: string;
  subtitle?: string;
  description: string;
  imageUrl?: string;
  link: string;
  cta: string;
  theme: 'blue' | 'purple' | 'emerald' | 'orange';
  variant?: 'default' | 'compact' | 'hero';
}

const themeConfig = {
  blue: {
    gradient: 'from-blue-600 via-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/30',
    border: 'border-blue-400/30',
    badge: 'bg-blue-500/20 border-blue-400/40 text-blue-300',
    accent: '#3b82f6',
    accentSecondary: '#06b6d4',
  },
  purple: {
    gradient: 'from-purple-600 via-violet-500 to-pink-500',
    glow: 'shadow-purple-500/30',
    border: 'border-purple-400/30',
    badge: 'bg-purple-500/20 border-purple-400/40 text-purple-300',
    accent: '#a855f7',
    accentSecondary: '#ec4899',
  },
  emerald: {
    gradient: 'from-emerald-600 via-teal-500 to-cyan-500',
    glow: 'shadow-emerald-500/30',
    border: 'border-emerald-400/30',
    badge: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
    accent: '#10b981',
    accentSecondary: '#06b6d4',
  },
  orange: {
    gradient: 'from-orange-600 via-amber-500 to-yellow-500',
    glow: 'shadow-orange-500/30',
    border: 'border-orange-400/30',
    badge: 'bg-orange-500/20 border-orange-400/40 text-orange-300',
    accent: '#f97316',
    accentSecondary: '#fbbf24',
  },
};

export const AdBanner: React.FC<AdBannerProps> = ({
  title,
  subtitle,
  description,
  imageUrl,
  link,
  cta,
  theme = 'blue',
  variant = 'default',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (clientX / innerWidth) * 100,
        y: (clientY / innerHeight) * 100,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const config = themeConfig[theme];
  const isCompact = variant === 'compact';
  const isHero = variant === 'hero';

  return (
    <div
      className={`
        ad-banner relative overflow-hidden rounded-2xl
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isCompact ? 'p-4' : isHero ? 'p-8' : 'p-6'}
      `}
      style={{
        background: 'rgba(10, 15, 24, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${config.border}`,
        boxShadow: `0 0 40px ${config.glow}`,
      }}
    >
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${config.accent}40 0%, transparent 50%)`,
          transition: 'background 0.3s ease',
        }}
      />
      
      <div 
        className={`
          absolute inset-[-100%] animate-[spin_8s_linear_infinite]
          opacity-20
        `}
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${config.accent} 60deg, transparent 120deg)`,
        }}
      />
      
      <div className="absolute top-0 left-0 w-full h-full">
        <div 
          className={`
            absolute inset-[-50%] 
            animate-[spin_12s_linear_infinite_reverse]
            opacity-10
          `}
          style={{
            background: `conic-gradient(from 180deg at 50% 50%, transparent 0deg, ${config.accentSecondary} 90deg, transparent 180deg)`,
          }}
        />
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
        <div 
          className="absolute inset-0 rounded-full blur-3xl animate-pulse-slow"
          style={{ background: config.accent }}
        />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
        <div className="flex-1 w-full">
          <div className={`
            inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3
            border backdrop-blur-sm ${config.badge}
          `}>
            <span className="material-symbols-outlined text-[14px]">campaign</span>
            {subtitle || 'Patrocinado'}
          </div>
          
          <h3 className={`
            font-black text-white uppercase tracking-tighter leading-tight mb-2
            ${isCompact ? 'text-lg' : isHero ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'}
          `}>
            {title}
          </h3>
          
          <p className={`
            text-gray-400 leading-relaxed
            ${isCompact ? 'text-xs line-clamp-2' : isHero ? 'text-sm max-w-xl' : 'text-xs'}
          `}>
            {description}
          </p>
          
          {!isCompact && (
            <div className="mt-4 flex items-center gap-2">
              <span className="size-2 rounded-full animate-pulse" style={{ background: config.accent }} />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Oferta Limitada</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {imageUrl && !isCompact && (
            <div className={`
              relative overflow-hidden rounded-xl border ${config.border}
              ${isHero ? 'w-48 h-32' : 'w-32 h-20'}
            `}>
              <img 
                src={imageUrl} 
                alt="" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
          
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              relative group flex items-center justify-center gap-2
              bg-gradient-to-r ${config.gradient}
              text-white font-black uppercase tracking-widest
              transition-all duration-300
              hover:scale-105 active:scale-95
              ${isCompact ? 'px-4 py-2 text-[10px] rounded-lg' : isHero ? 'px-8 py-4 text-xs rounded-xl' : 'px-6 py-3 text-[10px] rounded-xl'}
            `}
            style={{
              boxShadow: `0 0 30px ${config.accent}50, 0 0 60px ${config.accent}20`,
            }}
          >
            <span className="absolute inset-0 rounded-inherit bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <span className="relative z-10">{cta}</span>
            <span className="material-symbols-outlined text-sm relative z-10 group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20" 
        style={{ color: config.accent }} 
      />
    </div>
  );
};

export default AdBanner;

// ─── Rotating Ad Banner (Auto-rotate every 10s) ─────────────────────────────────

interface RotatingAdBannerProps {
  ads: AdBannerProps[];
  interval?: number; // seconds, default 10
  className?: string;
}

export const RotatingAdBanner: React.FC<RotatingAdBannerProps> = ({
  ads,
  interval = 10,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (ads.length <= 1) return;

    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
        setIsFading(false);
      }, 300);
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [ads.length, interval]);

  if (!ads.length) return null;

  const currentAd = ads[currentIndex];

  return (
    <div className={`relative ${className}`}>
      <div
        className={`transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}
      >
        <AdBanner {...currentAd} />
      </div>

      {/* Dots indicator */}
      {ads.length > 1 && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsFading(true);
                setTimeout(() => {
                  setCurrentIndex(idx);
                  setIsFading(false);
                }, 150);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-white shadow-lg shadow-white/50'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden rounded-b-2xl">
        <div
          key={`progress-${currentIndex}`}
          className="h-full bg-primary animate-[shrink_10s_linear_forwards]"
          style={{ animationDuration: `${interval}s` }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// ─── Estilo 2: Cartel de Estadio/Cancha (valla publicitaria) ─────────────────────────────────

interface StadiumAdBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  link: string;
  cta: string;
  theme?: 'green' | 'orange' | 'blue' | 'purple';
}

const STADIUM_THEMES = {
  green: {
    bg: 'from-emerald-900/90 to-emerald-950/95',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    accent: 'text-emerald-400',
    glow: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
  },
  orange: {
    bg: 'from-orange-900/90 to-amber-950/95',
    border: 'border-orange-500/40',
    text: 'text-orange-300',
    accent: 'text-orange-400',
    glow: '#f97316',
    gradient: 'from-orange-500 to-amber-500',
  },
  blue: {
    bg: 'from-blue-900/90 to-indigo-950/95',
    border: 'border-blue-500/40',
    text: 'text-blue-300',
    accent: 'text-blue-400',
    glow: '#3b82f6',
    gradient: 'from-blue-500 to-cyan-500',
  },
  purple: {
    bg: 'from-violet-900/90 to-purple-950/95',
    border: 'border-violet-500/40',
    text: 'text-violet-300',
    accent: 'text-violet-400',
    glow: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-500',
  },
};

export const StadiumAdBanner: React.FC<StadiumAdBannerProps> = ({
  title,
  subtitle,
  description,
  imageUrl,
  link,
  cta,
  theme = 'green',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const config = STADIUM_THEMES[theme];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group relative block w-full overflow-hidden
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        hover:scale-[1.02]
      `}
    >
      {/* Background */}
      <div className={`
        relative bg-gradient-to-r ${config.bg}
        border ${config.border}
        rounded-xl p-4 md:p-5
      `}>
        {/* LED strip effect top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30" 
          style={{ color: config.glow }} />

        {/* LED strip effect bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30" 
          style={{ color: config.glow }} />

        {/* Side glow */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-24 blur-xl opacity-50 rounded-full"
          style={{ background: config.glow }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-24 blur-xl opacity-50 rounded-full"
          style={{ background: config.glow }}
        />

        {/* Content */}
        <div className="relative flex items-center gap-4">
          {/* Left side - Brand mark */}
          <div className={`
            shrink-0 size-14 md:size-16
            rounded-lg
            bg-gradient-to-br ${config.gradient}
            flex items-center justify-center
            shadow-lg
            group-hover:shadow-xl transition-shadow duration-300
          `}
          style={{ boxShadow: `0 0 20px ${config.glow}40` }}>
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="" 
                className="w-full h-full object-cover rounded-lg" 
              />
            ) : (
              <span className="material-symbols-outlined text-2xl text-white">campaign</span>
            )}
          </div>

          {/* Center - Content */}
          <div className="flex-1 min-w-0">
            {/* Category badge */}
            <div className={`
              inline-flex items-center gap-1
              px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest
              ${config.text} bg-white/5 border border-white/10 mb-1.5
            `}>
              <span className="material-symbols-outlined text-[10px]">{subtitle?.toLowerCase().includes('trading') ? 'trending_up' : 'star'}</span>
              {subtitle || 'Sponsored'}
            </div>

            {/* Title */}
            <h3 className={`
              font-black uppercase tracking-wide leading-tight
              text-white group-hover:${config.text}
              text-base md:text-lg lg:text-xl
              truncate
            `}>
              {title}
            </h3>

            {/* Description (optional, only on larger screens) */}
            {description && (
              <p className="hidden lg:block text-xs text-gray-400 mt-1 line-clamp-1">
                {description}
              </p>
            )}
          </div>

          {/* Right side - CTA */}
          <div className="shrink-0">
            <div className={`
              relative px-4 py-2.5 rounded-lg
              bg-gradient-to-r ${config.gradient}
              text-white font-black uppercase tracking-wider
              text-[10px] md:text-xs
              shadow-lg
              group-hover:shadow-xl
              transition-all duration-300
              group-hover:scale-105 active:scale-95
            `}
            style={{ boxShadow: `0 0 20px ${config.glow}60` }}>
              <span className="relative z-10 flex items-center gap-2">
                {cta}
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
              {/* Shine effect */}
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="absolute -inset-1/2 w-1/2 h-2/3 bg-white/30 blur-xl rotate-45 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Corner decorations - LED style */}
        <div className="absolute top-2 left-2 size-1.5 rounded-full animate-pulse" style={{ background: config.glow, boxShadow: `0 0 6px ${config.glow}` }} />
        <div className="absolute top-2 right-2 size-1.5 rounded-full animate-pulse" style={{ background: config.glow, boxShadow: `0 0 6px ${config.glow}` }} />
        <div className="absolute bottom-2 left-2 size-1.5 rounded-full animate-pulse" style={{ background: config.glow, boxShadow: `0 0 6px ${config.glow}` }} />
        <div className="absolute bottom-2 right-2 size-1.5 rounded-full animate-pulse" style={{ background: config.glow, boxShadow: `0 0 6px ${config.glow}` }} />
      </div>
    </a>
  );
};

// Rotating Stadium Ads
interface RotatingStadiumAdsProps {
  ads: StadiumAdBannerProps[];
  interval?: number;
  className?: string;
}

export const RotatingStadiumAds: React.FC<RotatingStadiumAdsProps> = ({
  ads,
  interval = 8,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (ads.length <= 1) return;

    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
        setIsFading(false);
      }, 200);
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [ads.length, interval]);

  if (!ads.length) return null;

  return (
    <div className={`relative ${className}`}>
      <div className={`transition-all duration-200 ${isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <StadiumAdBanner {...ads[currentIndex]} />
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden rounded-b-xl">
        <div
          key={`stadium-progress-${currentIndex}`}
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
          style={{ animation: `stadiumShrink ${interval}s linear forwards` }}
        />
      </div>

      {/* Indicators */}
      {ads.length > 1 && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsFading(true);
                setTimeout(() => {
                  setCurrentIndex(idx);
                  setIsFading(false);
                }, 100);
              }}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-emerald-400'
                  : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes stadiumShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// ─── Estilo 3: NeoGlow - Ultra moderno y vivo ─────────────────────────────────

interface NeoAdBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  link: string;
  cta: string;
  theme?: 'cyber' | 'neon' | 'cosmic';
}

const NEO_THEMES = {
  cyber: {
    gradient: 'from-cyan-500 via-blue-500 to-purple-500',
    glow: '#00d4ff',
    accent: 'text-cyan-400',
    bg: 'bg-gradient-to-br from-cyan-950/90 via-blue-950/90 to-purple-950/90',
    border: 'border-cyan-500/30',
    particle: '#00d4ff',
  },
  neon: {
    gradient: 'from-pink-500 via-rose-500 to-orange-500',
    glow: '#f472b6',
    accent: 'text-pink-400',
    bg: 'bg-gradient-to-br from-pink-950/90 via-rose-950/90 to-orange-950/90',
    border: 'border-pink-500/30',
    particle: '#f472b6',
  },
  cosmic: {
    gradient: 'from-violet-500 via-indigo-500 to-blue-500',
    glow: '#8b5cf6',
    accent: 'text-violet-400',
    bg: 'bg-gradient-to-br from-violet-950/90 via-indigo-950/90 to-blue-950/90',
    border: 'border-violet-500/30',
    particle: '#8b5cf6',
  },
};

export const NeoAdBanner: React.FC<NeoAdBannerProps> = ({
  title,
  subtitle,
  description,
  imageUrl,
  link,
  cta,
  theme = 'cyber',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const config = NEO_THEMES[theme];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group relative block w-full overflow-hidden
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        hover:scale-[1.01]
      `}
    >
      <div className={`
        relative ${config.bg}
        border ${config.border}
        rounded-2xl p-5 md:p-6
        overflow-hidden
      `}>
        {/* Animated background grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(${config.glow}20 1px, transparent 1px),
              linear-gradient(90deg, ${config.glow}20 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />
        
        {/* Animated gradient orbs */}
        <div 
          className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl animate-pulse opacity-30"
          style={{ background: config.glow }}
        />
        <div 
          className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl animate-pulse opacity-30"
          style={{ 
            background: config.glow,
            animationDelay: '1s'
          }}
        />
        
        {/* Scanning line effect */}
        <div 
          className="absolute inset-x-0 h-1 opacity-20"
          style={{
            background: `linear-gradient(90deg, transparent, ${config.glow}, transparent)`,
            animation: 'scanLine 3s linear infinite',
            top: '0'
          }}
        />
        
        {/* Content */}
        <div className="relative flex items-center gap-4 md:gap-6">
          {/* Icon/Image */}
          <div className={`
            shrink-0 relative
            size-16 md:size-20
            rounded-2xl
            bg-gradient-to-br ${config.gradient}
            flex items-center justify-center
            shadow-2xl
            overflow-hidden
          `}
          style={{ boxShadow: `0 0 30px ${config.glow}50` }}>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent animate-shine" />
            
            {imageUrl ? (
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-3xl text-white relative z-10">bolt</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <div className={`
              inline-flex items-center gap-1.5
              px-2.5 py-1 rounded-full
              text-[9px] font-black uppercase tracking-widest
              ${config.accent}
              bg-white/5 border border-white/10
              mb-2
            `}>
              <span className="size-1.5 rounded-full animate-pulse" style={{ background: config.glow }} />
              {subtitle || 'Sponsored'}
            </div>

            {/* Title */}
            <h3 className={`
              font-black uppercase tracking-wide leading-tight
              text-white
              text-lg md:text-xl lg:text-2xl
              group-hover:text-transparent
              bg-gradient-to-r from-white via-white to-gray-300
              bg-clip-text
              transition-all duration-300
            `}>
              {title}
            </h3>

            {/* Description */}
            {description && (
              <p className="text-xs text-gray-400 mt-1.5 line-clamp-1 hidden sm:block">
                {description}
              </p>
            )}
          </div>

          {/* CTA Button */}
          <div className="shrink-0">
            <div className={`
              relative px-5 py-3 rounded-xl
              bg-gradient-to-r ${config.gradient}
              text-white font-black uppercase tracking-wider
              text-xs md:text-sm
              shadow-2xl
              overflow-hidden
              group/btn
              hover:scale-105 active:scale-95
              transition-all duration-300
            `}
            style={{ boxShadow: `0 0 25px ${config.glow}60` }}>
              {/* Animated border */}
              <div 
                className="absolute inset-0 rounded-xl opacity-50"
                style={{
                  background: `linear-gradient(90deg, transparent, ${config.glow}, transparent)`,
                  animation: 'borderGlow 2s linear infinite',
                  backgroundSize: '200% 100%'
                }}
              />
              
              {/* Shine sweep */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(90deg, transparent, white, transparent)',
                  animation: 'shineSweep 2s ease-in-out infinite',
                  transform: 'skewX(-20deg) translateX(-100%)'
                }}
              />
              
              <span className="relative z-10 flex items-center gap-2">
                {cta}
                <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Animated particles */}
        <div className="absolute top-4 right-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-float"
              style={{
                background: config.particle,
                boxShadow: `0 0 6px ${config.particle}`,
                top: `${i * 10}px`,
                right: `${i * 5}px`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + i * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Bottom glow line */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{
            background: `linear-gradient(90deg, transparent, ${config.glow}, transparent)`,
          }}
        />
      </div>

      <style>{`
        @keyframes scanLine {
          0% { top: 0; opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes shineSweep {
          0% { transform: skewX(-20deg) translateX(-100%); }
          100% { transform: skewX(-20deg) translateX(200%); }
        }
        @keyframes borderGlow {
          0% { backgroundPosition: '0% 0%'; }
          100% { backgroundPosition: '200% 0%'; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </a>
  );
};

// Rotating Neo Ads
interface RotatingNeoAdsProps {
  ads: NeoAdBannerProps[];
  interval?: number;
  className?: string;
}

export const RotatingNeoAds: React.FC<RotatingNeoAdsProps> = ({
  ads,
  interval = 6,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (ads.length <= 1) return;

    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
        setIsFading(false);
      }, 150);
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [ads.length, interval]);

  if (!ads.length) return null;

  return (
    <div className={`relative ${className}`}>
      <div className={`transition-all duration-200 ${isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <NeoAdBanner {...ads[currentIndex]} />
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden rounded-b-2xl">
        <div
          key={`neo-progress-${currentIndex}`}
          className="h-full"
          style={{
            background: 'linear-gradient(90deg, #00d4ff, #8b5cf6, #f472b6)',
            animation: `neoShrink ${interval}s linear forwards`
          }}
        />
      </div>

      {/* Indicators */}
      {ads.length > 1 && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsFading(true);
                setTimeout(() => {
                  setCurrentIndex(idx);
                  setIsFading(false);
                }, 100);
              }}
              className={`rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-6 h-1.5 bg-gradient-to-r from-cyan-400 to-violet-400'
                  : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes neoShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
