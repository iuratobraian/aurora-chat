import React from 'react';

interface GalaxyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  glow?: boolean;
}

export const GalaxyButton: React.FC<GalaxyButtonProps> = ({ 
  children, 
  variant = 'primary', 
  glow = true,
  className = "", 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "btn-galaxy shadow-lg shadow-primary/20",
    outline: "border border-white/10 hover:bg-white/5 backdrop-blur-md"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
