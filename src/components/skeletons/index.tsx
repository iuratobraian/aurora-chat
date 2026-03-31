import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
}) => {
  return (
    <div
      className={`
        ${roundedMap[rounded]}
        bg-gradient-to-r from-white/5 via-white/10 to-white/5
        animate-pulse
        ${className}
      `}
      style={{ width, height }}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className = '',
}) => (
  <div className="space-y-2" role="status" aria-label="Loading content">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="0.75rem"
        width={i === lines - 1 ? '75%' : '100%'}
        className={className}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`
      rounded-2xl bg-card-dark/50 border border-white/5 p-4 space-y-3
      animate-pulse
      ${className}
    `}
    role="status"
    aria-label="Loading card"
  >
    <div className="flex items-center gap-3">
      <Skeleton width="40px" height="40px" rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton height="0.75rem" width="60%" />
        <Skeleton height="0.5rem" width="40%" />
      </div>
    </div>
    <Skeleton height="8rem" width="100%" rounded="lg" />
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: string; className?: string }> = ({
  size = '40px',
  className = '',
}) => (
  <Skeleton width={size} height={size} rounded="full" className={className} />
);

export const SkeletonButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Skeleton height="2.5rem" width="8rem" rounded="lg" className={className} />
);

export const SkeletonImage: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Skeleton height="200px" width="100%" rounded="lg" className={className} />
);

export const SkeletonTableRow: React.FC = () => (
  <div className="flex items-center gap-4 py-3 border-b border-white/5" role="status">
    <SkeletonAvatar size="32px" />
    <Skeleton height="0.75rem" width="30%" />
    <Skeleton height="0.75rem" width="20%" />
    <Skeleton height="0.75rem" width="15%" />
    <div className="ml-auto">
      <SkeletonButton />
    </div>
  </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-4 ${className}`} role="status" aria-label="Loading chart">
    <div className="flex items-center justify-between">
      <Skeleton height="1rem" width="30%" />
      <Skeleton height="1rem" width="20%" />
    </div>
    <Skeleton height="200px" width="100%" rounded="lg" />
    <div className="flex gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} height="0.5rem" width="25%" />
      ))}
    </div>
  </div>
);

export const SkeletonGrid: React.FC<{
  columns?: number;
  rows?: number;
  className?: string;
}> = ({ columns = 3, rows = 2, className = '' }) => (
  <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
    {Array.from({ length: columns * rows }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({
  items = 5,
  className = '',
}) => (
  <div className={`space-y-4 ${className}`} role="status" aria-label="Loading list">
    {Array.from({ length: items }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonFeed: React.FC<{ items?: number; className?: string }> = ({
  items = 3,
  className = '',
}) => (
  <div className={`space-y-6 ${className}`} role="status" aria-label="Loading feed">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="rounded-2xl bg-card-dark/30 border border-white/5 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="44px" />
          <div className="space-y-2">
            <Skeleton height="0.75rem" width="120px" />
            <Skeleton height="0.5rem" width="80px" />
          </div>
        </div>
        <SkeletonText lines={3} />
        <SkeletonImage />
        <div className="flex gap-4">
          <SkeletonButton />
          <SkeletonButton />
          <SkeletonButton />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonSidebar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-4 ${className}`} role="status" aria-label="Loading sidebar">
    <Skeleton height="2rem" width="80%" />
    <SkeletonCard />
    <Skeleton height="100px" width="100%" rounded="lg" />
    <Skeleton height="100px" width="100%" rounded="lg" />
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-6" role="status" aria-label="Loading dashboard">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-card-dark/50 border border-white/5 p-4 space-y-3">
          <Skeleton height="0.75rem" width="60%" />
          <Skeleton height="1.5rem" width="80%" />
          <Skeleton height="0.5rem" width="40%" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonChart />
      <SkeletonChart />
    </div>
    <SkeletonList items={3} />
  </div>
);

export const SkeletonSignals: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3" role="status" aria-label="Loading signals">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="rounded-xl bg-card-dark/50 border border-white/5 p-4 flex items-center gap-4">
        <Skeleton width="60px" height="40px" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton height="0.75rem" width="40%" />
          <Skeleton height="0.5rem" width="60%" />
        </div>
        <Skeleton width="80px" height="24px" rounded="full" />
      </div>
    ))}
  </div>
);

export const SkeletonNotifications: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-2" role="status" aria-label="Loading notifications">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="rounded-lg bg-card-dark/30 border border-white/5 p-3 flex items-center gap-3">
        <SkeletonAvatar size="36px" />
        <div className="flex-1 space-y-2">
          <Skeleton height="0.75rem" width="70%" />
          <Skeleton height="0.5rem" width="50%" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonProfile: React.FC = () => (
  <div className="space-y-6" role="status" aria-label="Loading profile">
    <div className="flex items-center gap-6">
      <SkeletonAvatar size="80px" />
      <div className="space-y-3">
        <Skeleton height="1.25rem" width="200px" />
        <Skeleton height="0.75rem" width="150px" />
        <Skeleton height="0.5rem" width="100px" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center space-y-2">
          <Skeleton height="1.5rem" width="60px" className="mx-auto" />
          <Skeleton height="0.5rem" width="80px" className="mx-auto" />
        </div>
      ))}
    </div>
    <SkeletonList items={4} />
  </div>
);

export const SkeletonMarketplace: React.FC<{ items?: number }> = ({ items = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-label="Loading marketplace">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="rounded-xl bg-card-dark/50 border border-white/5 overflow-hidden">
        <Skeleton height="160px" width="100%" rounded="none" />
        <div className="p-4 space-y-3">
          <Skeleton height="0.75rem" width="80%" />
          <SkeletonText lines={2} />
          <div className="flex items-center justify-between">
            <Skeleton height="1rem" width="60px" />
            <SkeletonButton />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonCommunities: React.FC<{ items?: number }> = ({ items = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-label="Loading communities">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="rounded-xl bg-card-dark/50 border border-white/5 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="48px" />
          <div className="space-y-2">
            <Skeleton height="0.75rem" width="100px" />
            <Skeleton height="0.5rem" width="70px" />
          </div>
        </div>
        <SkeletonText lines={2} />
        <div className="flex gap-2">
          <SkeletonButton />
          <SkeletonButton />
        </div>
      </div>
    ))}
  </div>
);
