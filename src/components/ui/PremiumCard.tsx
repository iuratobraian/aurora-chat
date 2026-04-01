import React from 'react';

interface PremiumCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  badge?: string;
  className?: string;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  title,
  description,
  children,
  badge,
  className = '',
}) => {
  return (
    <div className={`relative glass rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 ${className}`}>
      {badge && (
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
            {badge}
          </span>
        </div>
      )}
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">{title}</h3>
        {description && (
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        )}
        <div className="mt-4">
          {children}
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
};
