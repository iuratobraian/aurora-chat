import React from 'react';

interface ShineCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

const intensityMap = {
  low: '0.1',
  medium: '0.2',
  high: '0.3',
};

export const ShineCard: React.FC<ShineCardProps> = ({
  children,
  className = '',
  intensity = 'medium',
}) => {
  return (
    <div className={`relative glass rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl ${className}`}>
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(
            135deg,
            transparent 0%,
            rgba(255, 255, 255, ${intensityMap[intensity]}) 45%,
            rgba(255, 255, 255, ${parseFloat(intensityMap[intensity]) + 0.1}) 50%,
            rgba(255, 255, 255, ${intensityMap[intensity]}) 55%,
            transparent 100%
          )`,
          transform: 'translateX(-100%)',
          animation: 'shine 3s ease-in-out infinite',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
