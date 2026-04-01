import React from 'react';

export const NeonLoader: React.FC<{ size?: number; color?: string }> = ({ 
  size = 48, 
  color = 'var(--primary)' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div 
        className="neon-loader" 
        style={{ width: size, height: size, borderTopColor: color } as React.CSSProperties}
      />
      <span className="text-primary/70 animate-pulse text-sm font-medium tracking-widest uppercase">
        Sincronizando...
      </span>
    </div>
  );
};

export const Starfield: React.FC = () => {
  return <div className="starfield absolute inset-0 z-[-1]" />;
};

export const DotPattern: React.FC = () => {
  return <div className="dot-pattern absolute inset-0 z-[-1] opacity-50" />;
};
