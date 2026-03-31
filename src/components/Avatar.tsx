import React, { useMemo } from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  seed?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  onClick?: () => void;
  frame?: string;
  variant?: 'default' | 'business' | 'premium';
  showBorder?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[8px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
  '2xl': 'w-20 h-20 text-lg',
};

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const frameStyles: Record<string, string> = {
  streak_7_frame: 'ring-2 ring-amber-700/50 shadow-[0_0_10px_rgba(180,83,9,0.3)]',
  streak_30_frame: 'ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-pulse',
  streak_100_frame: 'ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]',
};

const colorPairs: [string, string][] = [
  ['#3b82f6', '#1d4ed8'], ['#8b5cf6', '#6d28d9'], ['#10b981', '#059669'],
  ['#f59e0b', '#d97706'], ['#ef4444', '#dc2626'], ['#ec4899', '#db2777'],
  ['#14b8a6', '#0d9488'], ['#f97316', '#ea580c'], ['#6366f1', '#4f46e5'],
  ['#84cc16', '#65a30d'],
];

function getColorFromSeed(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPairs.length;
  return colorPairs[index];
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  seed,
  size = 'md',
  rounded = 'full',
  className = '',
  onClick,
  frame,
  variant = 'default',
  showBorder = false,
}) => {
  const avatarSeed = seed || name || 'default';
  const [bgColor, textColor] = useMemo(() => getColorFromSeed(avatarSeed), [avatarSeed]);
  const initials = useMemo(() => getInitials(name), [name]);
  const frameClass = frame && frameStyles[frame] ? frameStyles[frame] : '';

  const variantStyles = {
    default: '',
    business: 'ring-1 ring-white/20 shadow-lg shadow-black/20',
    premium: 'ring-2 ring-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
  };

  const renderInner = () => {
    if (src && !src.includes('dicebear') && !src.includes('picsum')) {
      return (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizeClasses[size]} ${roundedClasses[rounded]} object-cover ${className} ${showBorder ? variantStyles[variant] : ''}`}
          loading="lazy"
        />
      );
    }
    return (
      <div
        className={`${sizeClasses[size]} ${roundedClasses[rounded]} flex items-center justify-center font-bold ${className} ${showBorder ? variantStyles[variant] : ''}`}
        style={{ backgroundColor: bgColor, color: textColor }}
        title={name}
      >
        {initials}
      </div>
    );
  };

  return (
    <div 
      className={`relative inline-block transition-all duration-300 ${frameClass} ${roundedClasses[rounded]} cursor-pointer`}
      onClick={onClick}
    >
      {renderInner()}
      {frame === 'streak_100_frame' && (
        <div className="absolute -top-1 -right-1 z-10">
          <span className="text-xs drop-shadow-lg">👑</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;
