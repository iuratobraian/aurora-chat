import React, { memo, useState, useEffect } from 'react';

interface AuroraIdea {
  id: string;
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'tip';
  icon: string;
  actionLabel?: string;
  actionUrl?: string;
}

interface AuroraIdeaHubProps {
  isVisible: boolean;
  onClose: () => void;
  userName?: string;
  onAccept?: (idea: AuroraIdea) => void;
  onDismiss?: (idea: AuroraIdea) => void;
}

const DEFAULT_IDEAS: AuroraIdea[] = [
  {
    id: '1',
    title: 'Explora comunidades',
    description: 'Hay nuevas comunidades trending esta semana. Descúbrelas y únete a conversaciones interesantes.',
    category: 'tip',
    icon: 'groups',
    actionLabel: 'Ver comunidades',
    actionUrl: '/discover'
  },
  {
    id: '2',
    title: 'Comparte tu análisis',
    description: '¿Tienes una visión del mercado? Crea un post y gana reconocimiento de la comunidad.',
    category: 'improvement',
    icon: 'trending_up',
    actionLabel: 'Crear post',
    actionUrl: '/comunidad'
  },
  {
    id: '3',
    title: 'Sube de nivel',
    description: 'Interactúa más para ganar XP. Cada like, comentario y post te acerca al siguiente nivel.',
    category: 'tip',
    icon: 'military_tech',
  },
  {
    id: '4',
    title: 'Invita amigos',
    description: 'Recomienda TradeHub y ambos ganan recompensas. Hasta 20% de comisión en compras.',
    category: 'feature',
    icon: 'group_add',
    actionLabel: 'Invitar amigos',
    actionUrl: '/referrals'
  },
];

const getCategoryStyles = (category: AuroraIdea['category']) => {
  switch (category) {
    case 'feature':
      return {
        bg: 'bg-gradient-to-br from-primary/20 to-blue-600/10',
        border: 'border-primary/30',
        icon: 'text-primary',
        label: 'Nueva función'
      };
    case 'improvement':
      return {
        bg: 'bg-gradient-to-br from-emerald-500/20 to-teal-600/10',
        border: 'border-emerald-500/30',
        icon: 'text-emerald-400',
        label: 'Sugerencia'
      };
    case 'tip':
    default:
      return {
        bg: 'bg-gradient-to-br from-violet-500/20 to-purple-600/10',
        border: 'border-violet-500/30',
        icon: 'text-violet-400',
        label: 'Tip'
      };
  }
};

export const AuroraIdeaHub: React.FC<AuroraIdeaHubProps> = memo(({
  isVisible,
  onClose,
  userName,
  onAccept,
  onDismiss
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ideas, setIdeas] = useState<AuroraIdea[]>(DEFAULT_IDEAS);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setCurrentIndex(0);
    }
  }, [isVisible]);

  const currentIdea = ideas[currentIndex];
  const styles = getCategoryStyles(currentIdea.category);

  const handleNext = () => {
    if (currentIndex < ideas.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onClose();
    }
  };

  const handleAccept = () => {
    onAccept?.(currentIdea);
    handleNext();
  };

  const handleDismiss = () => {
    onDismiss?.(currentIdea);
    handleNext();
  };

  if (!isVisible || !currentIdea) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`relative w-full max-w-md ${styles.bg} border ${styles.border} rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-200`}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div className="p-6 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Aurora te sugiere</h2>
              <p className="text-xs text-gray-400">
                {userName ? `Basado en tu actividad, ${userName}` : 'Personalizado para ti'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${styles.icon} bg-white/5 border ${styles.border}`}>
              {styles.label}
            </span>
            <span className="text-[10px] text-gray-500">{currentIndex + 1} de {ideas.length}</span>
          </div>

          <div className="flex items-start gap-4 mb-6">
            <div className={`size-14 rounded-2xl ${styles.bg} border ${styles.border} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined text-3xl ${styles.icon}`}>{currentIdea.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white mb-2">{currentIdea.title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{currentIdea.description}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-bold transition-all border border-white/10"
            >
              Omitir
            </button>
            <button
              onClick={handleAccept}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                currentIdea.actionUrl
                  ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-primary/20'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {currentIdea.actionLabel || 'Entendido'}
            </button>
          </div>

          <div className="flex justify-center gap-1.5 mt-5">
            {ideas.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-6 bg-primary'
                    : idx < currentIndex
                    ? 'w-1.5 bg-primary/40'
                    : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
});

AuroraIdeaHub.displayName = 'AuroraIdeaHub';

export default AuroraIdeaHub;
