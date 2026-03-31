import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'amber';
  trend?: string;
}

const colorClasses = {
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  orange: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  red: 'bg-red-500/10 border-red-500/20 text-red-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
};

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, subtitle, icon, color, trend }) => {
  return (
    <div className="bg-[#1a1c20] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400">
          <span className="material-symbols-outlined text-xs">trending_up</span>
          <span>{trend}</span>
        </div>
      )}
      {subtitle && <div className="mt-1 text-[9px] text-gray-600 uppercase tracking-wider">{subtitle}</div>}
    </div>
  );
};
