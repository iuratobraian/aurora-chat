import React from 'react';

interface DeleteButtonProps {
  onConfirm: () => void;
  onCancel?: () => void;
  label?: string;
  confirmText?: string;
  variant?: 'danger' | 'warning';
  className?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onConfirm,
  onCancel,
  label = 'Eliminar',
  confirmText = '¿Estás seguro?',
  variant = 'danger',
  className = '',
}) => {
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleConfirm = () => {
    onConfirm();
    setShowConfirm(false);
  };

  const variantStyles = {
    danger: 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
    warning: 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10',
  };

  if (showConfirm) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-300">{confirmText}</span>
        <button
          onClick={handleConfirm}
          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Sí, eliminar
        </button>
        {onCancel && (
          <button
            onClick={() => {
              setShowConfirm(false);
              onCancel();
            }}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${variantStyles[variant]} ${className}`}
    >
      <span className="material-symbols-outlined text-lg">delete</span>
      {label}
    </button>
  );
};
