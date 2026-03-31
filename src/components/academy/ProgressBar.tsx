import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'green' | 'purple';
}

const SIZE_CONFIG = {
  sm: { height: 'h-1', text: 'text-[8px]' },
  md: { height: 'h-2', text: 'text-[10px]' },
  lg: { height: 'h-3', text: 'text-xs' },
};

const COLOR_CONFIG = {
  primary: 'from-primary to-violet-500',
  green: 'from-green-500 to-emerald-500',
  purple: 'from-purple-500 to-pink-500',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showLabel = true,
  size = 'md',
  color = 'primary',
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const config = SIZE_CONFIG[size];
  const colorClass = COLOR_CONFIG[color];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className={`${config.text} text-gray-400 uppercase tracking-wider font-bold`}>
            Progreso
          </span>
          <span className={`${config.text} text-white font-black`}>
            {current}/{total} ({percentage}%)
          </span>
        </div>
      )}
      <div className={`w-full ${config.height} bg-white/5 rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
