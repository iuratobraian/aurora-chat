import React from 'react';

export interface ProfileData {
  _id: string;
  userId: string;
  nombre: string;
  usuario: string;
  email: string;
  rol: string;
  role: number;
  status: string;
  avatar?: string;
  xp?: number;
  level?: number;
  isBlocked?: boolean;
  fechaRegistro?: string;
  ultimoLogin?: string;
  accuracy?: number;
  reputation?: number;
}

export interface CommunityData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  visibility: string;
  status: string;
  ownerId: string;
  memberCount?: number;
  postCount?: number;
  createdAt?: string;
  isPortalExclusive?: boolean;
}

export interface AdminPanelDashboardProps {
  stats?: {
    totalUsers?: number;
    totalPosts?: number;
    totalCommunities?: number;
    activeAds?: number;
  };
  webStats?: {
    pageViews?: number;
    uniqueVisitors?: number;
    bounceRate?: number;
    avgSessionDuration?: number;
  };
  users?: Array<{ name: string; email: string; role: string; status: string; avatar: string }>;
  communities?: Array<{ name: string; members: number; posts: number; status: string }>;
  posts?: Array<{ title: string; author: string; type: string; status: string; date: string }>;
  ads?: Array<{ name: string; position: string; clicks: number; status: string }>;
  loading?: boolean;
  currentUser?: { userId: string; role: number };
}

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-700/30 rounded ${className}`} />
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

export const StatsCard: React.FC<{ label: string; value: string | number; icon?: string; color?: string; subtitle?: string }> = ({ 
  label, value, icon, color = 'blue', subtitle 
}) => {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/10 text-purple-400',
    green: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400',
    orange: 'from-orange-500/20 to-orange-600/10 text-orange-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color] || colorMap.blue} rounded-xl p-4 border border-white/5`}>
      <div className="flex items-center justify-between mb-2">
        {icon && <span className="material-symbols-outlined text-lg">{icon}</span>}
        {subtitle && <span className="text-[10px] opacity-70">{subtitle}</span>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  );
};

export const SectionCard: React.FC<{ title: string; icon?: string; children: React.ReactNode; actions?: React.ReactNode }> = ({ 
  title, icon, children, actions 
}) => (
  <div className="bg-[#1a1c20] rounded-xl border border-white/5">
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
      <div className="flex items-center gap-2">
        {icon && <span className="material-symbols-outlined text-gray-400 text-lg">{icon}</span>}
        <h3 className="text-sm font-bold text-gray-300">{title}</h3>
      </div>
      {actions}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  trend?: string;
}

export interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  badge?: number;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      active
        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
    }`}
  >
    <span className="material-symbols-outlined text-base">{icon}</span>
    <span>{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className="ml-1 bg-red-500/20 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);
