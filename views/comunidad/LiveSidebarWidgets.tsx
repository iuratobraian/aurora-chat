import React, { memo, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Ad } from '../../types';

interface AnimatedAdVariant {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  cta: string;
  theme: 'cyber' | 'stadium' | 'classic';
  colorScheme: {
    primary: string;
    secondary: string;
    glow: string;
    bg: string;
  };
}

interface LiveSidebarAdProps {
  ad: Ad;
  isAdmin?: boolean;
  onEdit?: (ad: Ad) => void;
}

const generateVariants = (ad: Ad): AnimatedAdVariant[] => {
  const variants: AnimatedAdVariant[] = [];
  
  const themes: Array<{ theme: AnimatedAdVariant['theme']; colorScheme: AnimatedAdVariant['colorScheme'] }> = [
    {
      theme: 'cyber',
      colorScheme: {
        primary: '#00d4ff',
        secondary: '#8b5cf6',
        glow: 'rgba(0, 212, 255, 0.5)',
        bg: 'linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(30, 0, 60, 0.9))',
      },
    },
    {
      theme: 'stadium',
      colorScheme: {
        primary: '#10b981',
        secondary: '#f59e0b',
        glow: 'rgba(16, 185, 129, 0.5)',
        bg: 'linear-gradient(135deg, rgba(5, 30, 20, 0.95), rgba(20, 15, 0, 0.9))',
      },
    },
    {
      theme: 'classic',
      colorScheme: {
        primary: '#f472b6',
        secondary: '#ec4899',
        glow: 'rgba(244, 114, 182, 0.5)',
        bg: 'linear-gradient(135deg, rgba(40, 10, 30, 0.95), rgba(60, 0, 30, 0.9))',
      },
    },
  ];

  for (let i = 0; i < 3; i++) {
    const { theme, colorScheme } = themes[i];
    const highlight = i === 0 ? ad.titulo : i === 1 ? ad.descripcion : ad.subtitle;
    
    variants.push({
      title: ad.titulo || 'Título',
      subtitle: ad.subtitle || 'Patrocinado',
      description: ad.descripcion || 'Descripción',
      imageUrl: ad.imagenUrl,
      cta: ad.extra || 'Visitar',
      theme,
      colorScheme,
    });
  }

  return variants;
};

// Cyber Style Ad
const CyberStyleAd = memo(({ variant, link, isAdmin, onEdit, ad }: { variant: AnimatedAdVariant; link: string; isAdmin?: boolean; onEdit?: (ad: Ad) => void; ad: Ad }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => (p + 2) % 100);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block w-full overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02]"
      style={{ background: variant.colorScheme.bg }}
    >
      {/* Animated grid */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(${variant.colorScheme.primary}40 1px, transparent 1px),
            linear-gradient(90deg, ${variant.colorScheme.primary}40 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          animation: 'gridMove 20s linear infinite',
        }}
      />
      
      {/* Scanning line */}
      <div 
        className="absolute w-full h-0.5"
        style={{
          top: `${progress}%`,
          background: `linear-gradient(90deg, transparent, ${variant.colorScheme.primary}, transparent)`,
          boxShadow: `0 0 20px ${variant.colorScheme.glow}`,
          transition: 'top 0.1s linear',
        }}
      />

      {/* Glow orb */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl animate-pulse"
        style={{ background: variant.colorScheme.primary, opacity: 0.3 }}
      />

      {/* Content */}
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div 
            className="size-12 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${variant.colorScheme.primary}, ${variant.colorScheme.secondary})`,
              boxShadow: `0 0 20px ${variant.colorScheme.glow}`,
            }}
          >
            {variant.imageUrl ? (
              <img src={variant.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="material-symbols-outlined text-xl text-white">bolt</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider mb-1"
              style={{ 
                background: `${variant.colorScheme.primary}20`, 
                color: variant.colorScheme.primary,
                border: `1px solid ${variant.colorScheme.primary}40`,
              }}
            >
              <span className="size-1 rounded-full animate-pulse" style={{ background: variant.colorScheme.primary }} />
              {variant.subtitle}
            </div>
            <h4 
              className="text-sm font-black uppercase tracking-wide mb-1 truncate"
              style={{ color: '#fff' }}
            >
              {variant.title}
            </h4>
            <p className="text-[10px] text-gray-400 line-clamp-2">
              {variant.description}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div 
          className="mt-3 py-2 rounded-lg text-center text-[10px] font-bold uppercase tracking-wider text-white transition-all group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${variant.colorScheme.primary}, ${variant.colorScheme.secondary})`,
            boxShadow: `0 0 15px ${variant.colorScheme.glow}`,
          }}
        >
          {variant.cta}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div 
          className="h-full"
          style={{ 
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${variant.colorScheme.primary}, ${variant.colorScheme.secondary})`,
            transition: 'width 0.1s linear',
          }}
        />
      </div>

      {/* Admin edit */}
      {isAdmin && onEdit && (
        <button
          onClick={(e) => { e.preventDefault(); onEdit(ad); }}
          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded hover:bg-primary z-20 transition-colors"
        >
          <span className="material-symbols-outlined text-xs">edit</span>
        </button>
      )}

      <style>{`
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 20px 20px; }
        }
      `}</style>
    </a>
  );
});

// Stadium Style Ad
const StadiumStyleAd = memo(({ variant, link, isAdmin, onEdit, ad }: { variant: AnimatedAdVariant; link: string; isAdmin?: boolean; onEdit?: (ad: Ad) => void; ad: Ad }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block w-full overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02]"
      style={{ background: variant.colorScheme.bg }}
    >
      {/* LED strips */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${variant.colorScheme.primary}, transparent)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${variant.colorScheme.secondary}, transparent)` }} />

      {/* Side glows */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-16 blur-sm"
        style={{ background: variant.colorScheme.primary, opacity: 0.5 }}
      />
      <div 
        className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-16 blur-sm"
        style={{ background: variant.colorScheme.secondary, opacity: 0.5 }}
      />

      {/* Content */}
      <div className="relative p-4">
        <div className="flex items-center gap-3">
          {/* Brand mark */}
          <div 
            className="size-14 rounded-lg flex items-center justify-center shrink-0 border-2"
            style={{
              background: `linear-gradient(135deg, ${variant.colorScheme.primary}30, ${variant.colorScheme.secondary}30)`,
              borderColor: `${variant.colorScheme.primary}50`,
              boxShadow: `inset 0 0 20px ${variant.colorScheme.glow}`,
            }}
          >
            {variant.imageUrl ? (
              <img src={variant.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="material-symbols-outlined text-2xl" style={{ color: variant.colorScheme.primary }}>stadium</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div 
              className="text-[9px] font-black uppercase tracking-widest mb-1"
              style={{ color: variant.colorScheme.primary }}
            >
              {variant.subtitle}
            </div>
            <h4 className="text-sm font-black uppercase text-white truncate">
              {variant.title}
            </h4>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 mt-2 line-clamp-2">
          {variant.description}
        </p>

        {/* CTA Button */}
        <div 
          className="mt-3 py-2.5 rounded-lg text-center text-[10px] font-black uppercase tracking-widest text-white transition-all group-hover:scale-105 flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${variant.colorScheme.primary}, ${variant.colorScheme.secondary})`,
            boxShadow: `0 0 15px ${variant.colorScheme.glow}`,
          }}
        >
          {variant.cta}
          <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </div>
      </div>

      {/* LED corners */}
      <div className="absolute top-2 left-2 size-2 rounded-full animate-pulse" style={{ background: variant.colorScheme.primary, boxShadow: `0 0 8px ${variant.colorScheme.primary}` }} />
      <div className="absolute top-2 right-2 size-2 rounded-full animate-pulse" style={{ background: variant.colorScheme.primary, boxShadow: `0 0 8px ${variant.colorScheme.primary}`, animationDelay: '0.5s' }} />
      <div className="absolute bottom-2 left-2 size-2 rounded-full animate-pulse" style={{ background: variant.colorScheme.secondary, boxShadow: `0 0 8px ${variant.colorScheme.secondary}` }} />
      <div className="absolute bottom-2 right-2 size-2 rounded-full animate-pulse" style={{ background: variant.colorScheme.secondary, boxShadow: `0 0 8px ${variant.colorScheme.secondary}`, animationDelay: '0.5s' }} />

      {isAdmin && onEdit && (
        <button
          onClick={(e) => { e.preventDefault(); onEdit(ad); }}
          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded hover:bg-primary z-20 transition-colors"
        >
          <span className="material-symbols-outlined text-xs">edit</span>
        </button>
      )}
    </a>
  );
});

// Classic Style Ad
const ClassicStyleAd = memo(({ variant, link, isAdmin, onEdit, ad }: { variant: AnimatedAdVariant; link: string; isAdmin?: boolean; onEdit?: (ad: Ad) => void; ad: Ad }) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block w-full overflow-hidden rounded-xl transition-all duration-300"
      style={{ background: variant.colorScheme.bg }}
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic glow following mouse */}
      <div 
        className="absolute w-40 h-40 rounded-full blur-3xl transition-all duration-300 pointer-events-none"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: 'translate(-50%, -50%)',
          background: variant.colorScheme.primary,
          opacity: 0.2,
        }}
      />

      {/* Animated gradient border */}
      <div 
        className="absolute inset-0 rounded-xl opacity-50"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${variant.colorScheme.primary} 60deg, ${variant.colorScheme.secondary} 120deg, transparent 180deg)`,
          animation: 'rotateBorder 4s linear infinite',
          padding: '2px',
        }}
      />
      <div className="absolute inset-0 rounded-xl bg-[#0a0f1a]" />

      {/* Content */}
      <div className="relative p-4">
        {variant.imageUrl && (
          <div className="relative rounded-lg overflow-hidden mb-3">
            <img 
              src={variant.imageUrl} 
              alt="" 
              className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
          </div>
        )}

        <div 
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest mb-2"
          style={{ 
            background: `${variant.colorScheme.primary}20`, 
            color: variant.colorScheme.primary,
            border: `1px solid ${variant.colorScheme.primary}40`,
          }}
        >
          <span className="material-symbols-outlined text-xs">auto_awesome</span>
          {variant.subtitle}
        </div>

        <h4 className="text-sm font-black text-white mb-1 leading-tight">
          {variant.title}
        </h4>
        <p className="text-[10px] text-gray-400 line-clamp-2">
          {variant.description}
        </p>

        <div 
          className="mt-3 py-2.5 rounded-lg text-center text-[10px] font-black uppercase tracking-widest text-white transition-all group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${variant.colorScheme.primary}, ${variant.colorScheme.secondary})`,
            boxShadow: `0 0 20px ${variant.colorScheme.glow}`,
          }}
        >
          {variant.cta}
        </div>
      </div>

      <style>{`
        @keyframes rotateBorder {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {isAdmin && onEdit && (
        <button
          onClick={(e) => { e.preventDefault(); onEdit(ad); }}
          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded hover:bg-primary z-20 transition-colors"
        >
          <span className="material-symbols-outlined text-xs">edit</span>
        </button>
      )}
    </a>
  );
});

// Main Rotating Animated Ad Component
export const LiveSidebarAd: React.FC<LiveSidebarAdProps> = memo(({ ad, isAdmin, onEdit }) => {
  const [currentVariant, setCurrentVariant] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const variants = useMemo(() => generateVariants(ad), [ad]);
  const currentVariantData = variants[currentVariant];

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentVariant(prev => (prev + 1) % variants.length);
        setIsTransitioning(false);
      }, 400);
    }, 20000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [variants.length, isPaused]);

  const renderVariant = () => {
    switch (currentVariantData.theme) {
      case 'cyber':
        return (
          <CyberStyleAd 
            variant={currentVariantData} 
            link={ad.link || '#'} 
            isAdmin={isAdmin}
            onEdit={onEdit}
            ad={ad}
          />
        );
      case 'stadium':
        return (
          <StadiumStyleAd 
            variant={currentVariantData} 
            link={ad.link || '#'} 
            isAdmin={isAdmin}
            onEdit={onEdit}
            ad={ad}
          />
        );
      case 'classic':
        return (
          <ClassicStyleAd 
            variant={currentVariantData} 
            link={ad.link || '#'} 
            isAdmin={isAdmin}
            onEdit={onEdit}
            ad={ad}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`transition-all duration-400 ease-out ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Pause indicator */}
      {isPaused && (
        <div className="flex items-center justify-center gap-1 mb-1">
          <span className="material-symbols-outlined text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>pause</span>
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Pausado</span>
        </div>
      )}
      {renderVariant()}
      
      {/* Variant indicators */}
      <div className="flex justify-center gap-1 mt-2">
        {variants.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentVariant(idx);
                setIsTransitioning(false);
              }, 150);
            }}
            className={`h-1 rounded-full transition-all ${
              idx === currentVariant
                ? 'w-6'
                : 'w-1.5 bg-white/30 hover:bg-white/50'
            }`}
            style={idx === currentVariant ? { background: currentVariantData.colorScheme.primary } : undefined}
          />
        ))}
      </div>
    </div>
  );
});

// Live Poll Widget
interface LivePollWidgetProps {
  question?: string;
  options?: { label: string; votes: number }[];
  userVote?: number;
  onVote?: (optionIndex: number) => void;
}

export const LivePollWidget: React.FC<LivePollWidgetProps> = memo(({
  question = '¿Qué tipo de contenido prefieres?',
  options = [
    { label: 'Análisis Técnico', votes: 234 },
    { label: 'Señales de Trading', votes: 189 },
    { label: 'Educación', votes: 156 },
  ],
  userVote,
  onVote,
}) => {
  const [animatedOptions, setAnimatedOptions] = useState(options.map(() => 0));
  const [isRevealed, setIsRevealed] = useState(false);

  const totalVotes = options.reduce((acc, opt) => acc + opt.votes, 0);

  useEffect(() => {
    if (isRevealed) {
      options.forEach((opt, i) => {
        const targetPercent = (opt.votes / totalVotes) * 100;
        let current = 0;
        const step = targetPercent / 30;
        const interval = setInterval(() => {
          current += step;
          if (current >= targetPercent) {
            current = targetPercent;
            clearInterval(interval);
          }
          setAnimatedOptions(prev => {
            const newOptions = [...prev];
            newOptions[i] = current;
            return newOptions;
          });
        }, 30);
      });
    }
  }, [isRevealed, options, totalVotes]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl animate-pulse"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
        />
      </div>

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm animate-pulse">how_to_vote</span>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Encuesta del Día</h3>
            <div className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-signal-green animate-pulse" />
              <span className="text-[8px] text-signal-green font-bold">VIVA</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <h4 className="text-sm font-bold text-white mb-4 leading-tight">
          {question}
        </h4>

        {/* Options */}
        <div className="space-y-2">
          {options.map((option, idx) => {
            const percent = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            const animatedPercent = animatedOptions[idx] || 0;
            const isSelected = userVote === idx;

            return (
              <button
                key={idx}
                onClick={() => {
                  if (!isRevealed) {
                    setIsRevealed(true);
                    onVote?.(idx);
                  }
                }}
                disabled={isRevealed}
                className={`relative w-full p-3 rounded-lg text-left transition-all ${
                  isSelected 
                    ? 'ring-2 ring-primary' 
                    : 'hover:ring-1 hover:ring-white/20'
                }`}
              >
                {/* Background bar */}
                <div 
                  className="absolute inset-0 rounded-lg transition-all duration-500"
                  style={{ 
                    width: `${isRevealed ? animatedPercent : 0}%`,
                    background: `linear-gradient(90deg, ${isSelected ? '#3b82f6' : '#6366f1'}40, ${isSelected ? '#8b5cf6' : '#a855f7'}20)`,
                  }}
                />
                
                {/* Content */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary' 
                          : 'border-gray-500'
                      }`}
                    >
                      {isSelected && (
                        <span className="size-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {option.label}
                    </span>
                  </div>
                  {isRevealed && (
                    <span className="text-[10px] font-black text-primary">
                      {percent.toFixed(1)}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] text-gray-500">{totalVotes.toLocaleString()} votos</span>
          {!isRevealed && (
            <span className="text-[9px] text-primary font-bold animate-pulse">Toca para votar</span>
          )}
        </div>
      </div>

      {/* Animated border */}
      <div className="absolute top-0 left-0 w-full h-0.5">
        <div 
          className="h-full"
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
            backgroundSize: '200% 100%',
            animation: 'gradientMove 3s linear infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
});

export default LiveSidebarAd;
