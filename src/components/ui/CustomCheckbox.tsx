import React from 'react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      className={`flex items-center gap-3 cursor-pointer group ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
            checked
              ? 'bg-primary border-primary shadow-lg shadow-primary/20'
              : 'border-gray-500 group-hover:border-gray-400'
          }`}
        >
          {checked && (
            <span className="material-symbols-outlined text-white text-sm">
              check
            </span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
          {label}
        </span>
      )}
    </label>
  );
};
