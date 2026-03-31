import React, { memo } from 'react';

interface FilterButtonProps {
    active: boolean;
    icon: string;
    label: string;
    onClick: () => void;
    activeClass?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = memo(({
    active,
    icon,
    label,
    onClick,
    activeClass = 'bg-primary text-white shadow-primary/20'
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            active
                ? `${activeClass} shadow-lg`
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 dark:hover:text-white'
        }`}
    >
        <span className="material-symbols-outlined text-base">{icon}</span>
        {label}
    </button>
));

export default FilterButton;