import React from 'react';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  category: string;
  rating?: number;
  reviews?: number;
  onAddToCart?: () => void;
  onView?: () => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  description,
  price,
  currency,
  image,
  category,
  rating,
  reviews,
  onAddToCart,
  onView,
  className = '',
}) => {
  return (
    <div className={`glass rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 ${className}`}>
      {image ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-white/30">shopping_bag</span>
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {category}
          </span>
          {rating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-gray-300 text-sm">{rating}</span>
              {reviews && (
                <span className="text-gray-500 text-xs">({reviews})</span>
              )}
            </div>
          )}
        </div>
        
        <h3 className="font-bold text-white text-lg mb-1">{title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">{description}</p>
        
        <div className="flex items-center justify-between gap-3">
          <p className="text-xl font-black text-white">
            ${price.toFixed(2)} <span className="text-sm font-normal text-gray-400">{currency}</span>
          </p>
          
          <div className="flex items-center gap-2">
            {onView && (
              <button
                onClick={onView}
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Ver
              </button>
            )}
            {onAddToCart && (
              <button
                onClick={onAddToCart}
                className="px-4 py-2 bg-primary hover:bg-primary/80 text-white text-sm font-bold rounded-xl transition-all duration-300 active:scale-95"
              >
                Agregar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
