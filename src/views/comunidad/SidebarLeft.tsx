import React from 'react';
import { FilterButton, FILTER_CATEGORIES, TAG_FILTERS } from './';
import { CategoriaPost } from '../../types';

interface SidebarLeftProps {
  filterType: CategoriaPost | 'Todos';
  filterTag: string | null;
  filterFollowing: boolean;
  sortBy: 'relevance' | 'recent' | 'popular' | 'top_points';
  onFilterType: (type: CategoriaPost | 'Todos') => void;
  onFilterFollowing: (enabled: boolean) => void;
  onSortBy: (sort: 'relevance' | 'recent' | 'popular' | 'top_points') => void;
  onFilterTag: (tag: string | null) => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  filterType,
  filterTag,
  filterFollowing,
  sortBy,
  onFilterType,
  onFilterFollowing,
  onSortBy,
  onFilterTag
}) => {
  return (
    <div className="glass rounded-2xl p-3 border border-gray-100 dark:border-white/5 bg-white dark:bg-black/40 sticky top-24 shadow-2xl shadow-primary/5 transition-all hover:border-primary/20 hover:backdrop-blur-3xl">
      <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4 px-2">Explorar</h3>
      <div className="space-y-1">
        <FilterButton active={filterType === 'Todos' && !filterFollowing} icon="dashboard" label="Todos" onClick={() => onFilterType('Todos')} />
        <FilterButton active={filterFollowing} icon="person_add" label="Seguidos" activeClass="bg-signal-green text-black shadow-signal-green/20" onClick={() => onFilterFollowing(!filterFollowing)} />
        {FILTER_CATEGORIES.map(({ label, icon }) => (
          <FilterButton key={label} active={filterType === label} icon={icon} label={label} onClick={() => onFilterType(label as any)} />
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-3 px-2">Ordenar</h3>
        <div className="flex flex-wrap gap-1.5 px-2">
          <button
            onClick={() => onSortBy('relevance')}
            className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${sortBy === 'relevance' ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
          >
            Relevante
          </button>
          <button
            onClick={() => onSortBy('recent')}
            className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${sortBy === 'recent' ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
          >
            Recientes
          </button>
          <button
            onClick={() => onSortBy('popular')}
            className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${sortBy === 'popular' ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
          >
            Populares
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4 px-2">Tendencias</h3>
        <div className="flex flex-wrap gap-1.5 px-2">
          {TAG_FILTERS.map(tag => (
            <button
              key={tag}
              onClick={() => onFilterTag(filterTag === tag ? null : tag)}
              className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all ${filterTag === tag ? 'bg-primary border border-primary text-white' : 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-500 hover:border-gray-200 dark:hover:border-white/10'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
