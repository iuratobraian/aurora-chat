import React from 'react';

interface ConfirmCardProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  danger: {
    icon: 'warning',
    iconColor: 'text-red-400',
    confirmBg: 'bg-red-500 hover:bg-red-600',
  },
  success: {
    icon: 'check_circle',
    iconColor: 'text-green-400',
    confirmBg: 'bg-green-500 hover:bg-green-600',
  },
  warning: {
    icon: 'info',
    iconColor: 'text-yellow-400',
    confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
  },
};

export const ConfirmCard: React.FC<ConfirmCardProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'warning',
  className = '',
}) => {
  const styles = variantStyles[variant];

  return (
    <div className={`glass rounded-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-300 ${className}`}>
      <div className="flex flex-col items-center text-center">
        <span className={`material-symbols-outlined text-5xl ${styles.iconColor} mb-4`}>
          {styles.icon}
        </span>
        
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 text-sm mb-6">{message}</p>
        
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 ${styles.confirmBg} text-white font-bold rounded-xl transition-all duration-300 active:scale-95`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
