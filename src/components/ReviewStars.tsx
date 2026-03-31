import React from 'react';

interface ReviewStarsProps {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ReviewStars: React.FC<ReviewStarsProps> = ({
  rating,
  interactive = false,
  onChange,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${sizeClasses[size]} transition-all ${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          {star <= rating ? (
            <span className="text-amber-400">★</span>
          ) : (
            <span className="text-gray-600">☆</span>
          )}
        </button>
      ))}
    </div>
  );
};
