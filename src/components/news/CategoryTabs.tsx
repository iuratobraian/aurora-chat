import React, { memo } from 'react';
import { NewsCategory } from '../../types/news';

export interface CategoryTabsProps {
  selected: NewsCategory | 'all';
  onSelect: (category: NewsCategory | 'all') => void;
  showAll?: boolean;
}

interface CategoryConfig {
  id: NewsCategory | 'all';
  label: string;
  icon: string;
  color: string;
  activeColor: string;
}

const categories: CategoryConfig[] = [
  { id: 'all', label: 'All', icon: '📊', color: 'text-gray-400', activeColor: 'bg-gray-400/20 text-white' },
  { id: 'forex', label: 'Forex', icon: '💱', color: 'text-blue-400', activeColor: 'bg-blue-500/20 text-blue-300' },
  { id: 'crypto', label: 'Crypto', icon: '₿', color: 'text-orange-400', activeColor: 'bg-orange-500/20 text-orange-300' },
  { id: 'commodities', label: 'Commodities', icon: '🛢️', color: 'text-amber-400', activeColor: 'bg-amber-500/20 text-amber-300' },
  { id: 'indices', label: 'Indices', icon: '📈', color: 'text-green-400', activeColor: 'bg-green-500/20 text-green-300' },
  { id: 'stocks', label: 'Stocks', icon: '🏛️', color: 'text-purple-400', activeColor: 'bg-purple-500/20 text-purple-300' },
  { id: 'general', label: 'General', icon: '📰', color: 'text-gray-400', activeColor: 'bg-gray-500/20 text-gray-300' },
];

const CategoryTabs: React.FC<CategoryTabsProps> = memo(({
  selected,
  onSelect,
  showAll = true,
}) => {
  const displayCategories = showAll
    ? categories
    : categories.filter((c) => c.id !== 'all');

  return (
    <div className="flex flex-wrap gap-2">
      {displayCategories.map((category) => {
        const isActive = selected === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`
              relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider
              transition-all duration-300 flex items-center gap-2
              ${isActive
                ? `${category.activeColor} shadow-lg`
                : `bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-transparent hover:border-white/10`
              }
            `}
          >
            <span className="text-sm">{category.icon}</span>
            <span>{category.label}</span>
            {isActive && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
});

CategoryTabs.displayName = 'CategoryTabs';

export default CategoryTabs;
