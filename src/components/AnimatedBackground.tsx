import React from 'react';

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
  variant?: 'default' | 'minimal' | 'hero';
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  children, 
  variant = 'default' 
}) => {
  return (
    <div className="animated-bg-root">
      <div className="animated-bg-grid" />
      <div className="animated-bg-mesh" />
      <div className="animated-bg-radial-1" />
      <div className="animated-bg-radial-2" />
      <div className="animated-bg-radial-3" />
      {variant !== 'minimal' && (
        <>
          <div className="animated-particle-container">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="animated-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${8 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
          <div className="animated-grid-lines">
            {[...Array(5)].map((_, i) => (
              <div 
                key={`h-${i}`} 
                className="grid-line-horizontal"
                style={{ top: `${20 + i * 15}%`, animationDelay: `${i * 0.5}s` }}
              />
            ))}
            {[...Array(5)].map((_, i) => (
              <div 
                key={`v-${i}`} 
                className="grid-line-vertical"
                style={{ left: `${15 + i * 18}%`, animationDelay: `${i * 0.7}s` }}
              />
            ))}
          </div>
        </>
      )}
      {variant === 'hero' && (
        <div className="animated-glow-ring glow-ring-1" />
      )}
      {children && <div className="animated-bg-content">{children}</div>}
    </div>
  );
};

export default AnimatedBackground;
