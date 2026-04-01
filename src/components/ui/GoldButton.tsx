import React from 'react';

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const GoldButton: React.FC<GoldButtonProps> = ({
  children,
  variant = 'solid',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'font-bold rounded-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2';
  
  const variants = {
    solid: 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400',
    outline: 'border-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizeMap[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
