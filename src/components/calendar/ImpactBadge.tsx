import React from 'react';

type ImpactLevel = 'high' | 'medium' | 'low';

interface ImpactBadgeProps {
  impact: ImpactLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const impactConfig: Record<ImpactLevel, { color: string; bg: string; border: string; label: string }> = {
  high: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/40',
    label: 'High'
  },
  medium: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/40',
    label: 'Medium'
  },
  low: {
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/40',
    label: 'Low'
  }
};

const sizeConfig = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
  lg: 'text-sm px-3 py-1.5'
};

const ImpactBadge: React.FC<ImpactBadgeProps> = ({ 
  impact, 
  showLabel = true, 
  size = 'md' 
}) => {
  const config = impactConfig[impact];
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1 font-bold rounded-lg border
        ${config.bg} ${config.color} ${config.border}
        ${sizeConfig[size]}
        ${impact === 'high' ? 'animate-pulse' : ''}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${impact === 'high' ? 'animate-pulse' : ''}`} />
      {showLabel && config.label}
    </span>
  );
};

export default ImpactBadge;
