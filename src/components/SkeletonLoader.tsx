import React, { memo } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = memo(({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'wave'
}) => {
  const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800';
  
  const variantClasses = {
    text: 'rounded h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'circular' ? width ?? 40 : undefined)
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
});

Skeleton.displayName = 'Skeleton';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'chart' | 'profile' | 'feed' | 'table';
  count?: number;
  className?: string;
}

export const SkeletonCard: React.FC = memo(() => (
  <div className="bg-white dark:bg-[#1a1d21] rounded-2xl p-4 border border-gray-100 dark:border-white/5 animate-in fade-in duration-300">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" height={14} className="mb-2" />
        <Skeleton variant="text" width="40%" height={10} />
      </div>
    </div>
    <Skeleton variant="text" width="100%" height={12} className="mb-2" />
    <Skeleton variant="text" width="90%" height={12} className="mb-2" />
    <Skeleton variant="text" width="75%" height={12} className="mb-4" />
    <Skeleton variant="rounded" width="100%" height={120} className="mb-4" />
    <div className="flex gap-2">
      <Skeleton variant="rounded" width={60} height={28} />
      <Skeleton variant="rounded" width={60} height={28} />
      <Skeleton variant="rounded" width={60} height={28} />
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonList: React.FC = memo(() => (
  <div className="bg-white dark:bg-[#1a1d21] rounded-2xl p-4 border border-gray-100 dark:border-white/5 animate-in fade-in duration-300">
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton variant="circular" width={36} height={36} />
          <div className="flex-1">
            <Skeleton variant="text" width="50%" height={12} className="mb-1" />
            <Skeleton variant="text" width="30%" height={10} />
          </div>
          <Skeleton variant="rounded" width={60} height={24} />
        </div>
      ))}
    </div>
  </div>
));

SkeletonList.displayName = 'SkeletonList';

export const SkeletonChart: React.FC = memo(() => (
  <div className="bg-white dark:bg-[#1a1d21] rounded-2xl p-4 border border-gray-100 dark:border-white/5 animate-in fade-in duration-300">
    <div className="flex items-center justify-between mb-4">
      <div>
        <Skeleton variant="text" width={120} height={16} className="mb-2" />
        <Skeleton variant="text" width={80} height={12} />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={40} height={28} />
        <Skeleton variant="rounded" width={40} height={28} />
        <Skeleton variant="rounded" width={40} height={28} />
      </div>
    </div>
    <Skeleton variant="rounded" width="100%" height={200} className="mb-4" />
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton variant="text" width="60%" height={20} className="mx-auto mb-2" />
          <Skeleton variant="text" width="80%" height={10} className="mx-auto" />
        </div>
      ))}
    </div>
  </div>
));

SkeletonChart.displayName = 'SkeletonChart';

export const SkeletonProfile: React.FC = memo(() => (
  <div className="bg-white dark:bg-[#1a1d21] rounded-2xl border border-gray-100 dark:border-white/5 animate-in fade-in duration-300 overflow-hidden">
    <Skeleton variant="rectangular" width="100%" height={120} />
    <div className="p-4 -mt-12 relative">
      <Skeleton variant="circular" width={80} height={80} className="border-4 border-white dark:border-[#1a1d21] mx-auto mb-3" />
      <Skeleton variant="text" width="50%" height={18} className="mx-auto mb-2" />
      <Skeleton variant="text" width="30%" height={12} className="mx-auto mb-4" />
      <div className="flex justify-center gap-6 mb-4">
        <div className="text-center">
          <Skeleton variant="text" width={40} height={16} className="mx-auto mb-1" />
          <Skeleton variant="text" width={60} height={10} className="mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton variant="text" width={40} height={16} className="mx-auto mb-1" />
          <Skeleton variant="text" width={60} height={10} className="mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton variant="text" width={40} height={16} className="mx-auto mb-1" />
          <Skeleton variant="text" width={60} height={10} className="mx-auto" />
        </div>
      </div>
      <Skeleton variant="rounded" width="100%" height={36} />
    </div>
  </div>
));

SkeletonProfile.displayName = 'SkeletonProfile';

export const SkeletonFeed: React.FC = memo(() => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
));

SkeletonFeed.displayName = 'SkeletonFeed';

export const SkeletonTable: React.FC = memo(() => (
  <div className="bg-white dark:bg-[#1a1d21] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden animate-in fade-in duration-300">
    <div className="p-4 border-b border-gray-100 dark:border-white/5">
      <Skeleton variant="text" width={150} height={16} />
    </div>
    <div className="p-4">
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-2">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="text" width="25%" height={12} />
            <Skeleton variant="text" width="15%" height={12} />
            <Skeleton variant="text" width="20%" height={12} />
            <Skeleton variant="rounded" width={60} height={24} />
          </div>
        ))}
      </div>
    </div>
  </div>
));

SkeletonTable.displayName = 'SkeletonTable';

const SkeletonLoader: React.FC<SkeletonLoaderProps> = memo(({
  variant = 'card',
  count = 1,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return <SkeletonCard />;
      case 'list':
        return <SkeletonList />;
      case 'chart':
        return <SkeletonChart />;
      case 'profile':
        return <SkeletonProfile />;
      case 'feed':
        return <SkeletonFeed />;
      case 'table':
        return <SkeletonTable />;
      default:
        return <SkeletonCard />;
    }
  };

  if (count === 1) {
    return <div className={className}>{renderSkeleton()}</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;
