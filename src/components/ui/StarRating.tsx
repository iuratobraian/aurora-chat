import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = interactive
          ? (hoverRating || rating) >= starValue
          : rating >= starValue;
        const isHalf = !interactive && rating >= starValue - 0.5 && rating < starValue;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${sizeMap[size]} transition-all duration-200 ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
          >
            <span
              className={isFilled ? 'text-yellow-400' : isHalf ? 'text-yellow-400/50' : 'text-gray-600'}
            >
              ★
            </span>
          </button>
        );
      })}
      {interactive && (
        <span className="ml-2 text-sm text-gray-400">
          {hoverRating || rating}/{maxRating}
        </span>
      )}
    </div>
  );
};
