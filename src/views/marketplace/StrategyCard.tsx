import React from 'react';
import { Avatar } from '../../components/Avatar';

interface Strategy {
  _id?: string;
  id: string;
  authorId: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD' | 'XP';
  category: string;
  tags: string[];
  imageUrl?: string;
  downloads: number;
  rating: number;
  ratingCount?: number;
  isPublished: boolean;
  author?: {
    userId: string;
    nombre: string;
    usuario: string;
    avatar?: string;
    level?: any;
  };
  hasAccess?: boolean;
  hasPurchased?: boolean;
  previewContent?: string;
}

interface StrategyCardProps {
  strategy: Strategy;
  onSelect: (strategy: Strategy) => void;
  onVisitProfile?: (id: string) => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  strategy,
  onSelect,
  onVisitProfile,
}) => {
  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'GRATIS';
    return currency === 'XP' ? `${price} XP` : `$${price}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      indicadores: 'bg-blue-500/20 text-blue-400',
      robots: 'bg-purple-500/20 text-purple-400',
      estrategias: 'bg-green-500/20 text-green-400',
      cursos: 'bg-orange-500/20 text-orange-400',
      templates: 'bg-pink-500/20 text-pink-400',
      scripts: 'bg-yellow-500/20 text-yellow-400',
    };
    return colors[category?.toLowerCase()] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div
      onClick={() => onSelect(strategy)}
      className="glass rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10"
    >
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-purple-500/20">
        {strategy.imageUrl ? (
          <img src={strategy.imageUrl} alt={strategy.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-white/20">analytics</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getCategoryColor(strategy.category)}`}>
            {strategy.category}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-xl text-white">
            {formatPrice(strategy.price, strategy.currency)}
          </span>
        </div>

        {/* Access Badge */}
        {(strategy.hasAccess || strategy.hasPurchased) && (
          <div className="absolute bottom-3 right-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-signal-green/80 backdrop-blur-xl text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Comprado
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
          {strategy.title}
        </h3>
        
        <p className="text-sm text-gray-400 line-clamp-2">
          {strategy.description}
        </p>

        {/* Author */}
        {strategy.author && (
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onVisitProfile?.(strategy.author?.userId || '');
            }}
          >
            <Avatar
              src={strategy.author.avatar}
              name={strategy.author.nombre}
              size="xs"
              rounded="full"
            />
            <span className="text-sm text-gray-400 hover:text-primary transition-colors">
              {strategy.author.nombre}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">download</span>
              {strategy.downloads}
            </span>
            {strategy.ratingCount !== undefined && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-yellow-400">star</span>
                {strategy.rating.toFixed(1)} ({strategy.ratingCount})
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {strategy.tags && strategy.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {strategy.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyCard;
