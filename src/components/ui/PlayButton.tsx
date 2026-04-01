import React from 'react';

interface PlayButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  isPlaying?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

const iconSizeMap = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl',
};

export const PlayButton: React.FC<PlayButtonProps> = ({
  onClick,
  size = 'md',
  isPlaying = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`${sizeMap[size]} rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group ${className}`}
    >
      {isPlaying ? (
        <span className={`material-symbols-outlined text-white ${iconSizeMap[size]} group-hover:text-primary transition-colors`}>
          pause
        </span>
      ) : (
        <span className={`material-symbols-outlined text-white ${iconSizeMap[size]} group-hover:text-primary transition-colors ml-1`}>
          play_arrow
        </span>
      )}
    </button>
  );
};
