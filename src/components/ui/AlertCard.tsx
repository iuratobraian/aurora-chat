import React from 'react';

interface AlertCardProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  className?: string;
}

const typeStyles = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'info',
    iconColor: 'text-blue-400',
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: 'check_circle',
    iconColor: 'text-green-400',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon: 'warning',
    iconColor: 'text-yellow-400',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'error',
    iconColor: 'text-red-400',
  },
};

export const AlertCard: React.FC<AlertCardProps> = ({
  type,
  title,
  message,
  action,
  onClose,
  className = '',
}) => {
  const styles = typeStyles[type];
  
  return (
    <div className={`${styles.bg} ${styles.border} border rounded-xl p-4 transition-all duration-300 ${className}`}>
      <div className="flex items-start gap-3">
        <span className={`material-symbols-outlined ${styles.iconColor} flex-shrink-0`}>
          {styles.icon}
        </span>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm">{title}</h4>
          <p className="text-gray-300 text-sm mt-1">{message}</p>
          
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>
    </div>
  );
};
