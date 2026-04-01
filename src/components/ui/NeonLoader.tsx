import React from 'react';

interface NeonLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export const NeonLoader: React.FC<NeonLoaderProps> = ({
  size = 'md',
  color = '#3b82f6',
  text,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]}`}>
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: '3px solid transparent',
            borderTopColor: color,
            borderRightColor: color,
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
        <div
          className="absolute inset-1 rounded-full animate-spin"
          style={{
            border: '2px solid transparent',
            borderBottomColor: color,
            opacity: 0.6,
            animationDirection: 'reverse',
            animationDuration: '0.8s',
          }}
        />
      </div>
      {text && (
        <p className="text-sm text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );
};
