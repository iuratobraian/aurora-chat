import React from 'react';

interface DotPatternProps {
  color?: string;
  size?: number;
  spacing?: number;
  opacity?: number;
  className?: string;
}

export const DotPattern: React.FC<DotPatternProps> = ({
  color = '#3b82f6',
  size = 2,
  spacing = 24,
  opacity = 0.1,
  className = '',
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dot-pattern"
            x="0"
            y="0"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={spacing / 2}
              cy={spacing / 2}
              r={size}
              fill={color}
              opacity={opacity}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-pattern)" />
      </svg>
    </div>
  );
};
