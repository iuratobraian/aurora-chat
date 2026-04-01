import React from 'react';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = "", 
  glowColor = "rgba(59, 130, 246, 0.3)",
  onClick,
}) => {
  return (
    <div
      className={`glass glow-card rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_-5px_var(--glow-color)] ${className}`}
      style={{ '--glow-color': glowColor } as React.CSSProperties}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
