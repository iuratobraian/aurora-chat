import { useState, useEffect, useCallback } from 'react';
import { Publicacion } from '../types';

interface UsePostFiltersReturn {
  filterType: Publicacion['categoria'] | 'Todos';
  setFilterType: (type: Publicacion['categoria'] | 'Todos') => void;
  filterTag: string | null;
  setFilterTag: (tag: string | null) => void;
  filterFollowing: boolean;
  setFilterFollowing: (following: boolean) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export function usePostFilters(): UsePostFiltersReturn {
  const [filterType, setFilterType] = useState<Publicacion['categoria'] | 'Todos'>('Todos');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterFollowing, setFilterFollowing] = useState(false);

  const resetFilters = useCallback(() => {
    setFilterType('Todos');
    setFilterTag(null);
    setFilterFollowing(false);
  }, []);

  const hasActiveFilters = filterType !== 'Todos' || filterTag !== null || filterFollowing;

  return {
    filterType,
    setFilterType,
    filterTag,
    setFilterTag,
    filterFollowing,
    setFilterFollowing,
    resetFilters,
    hasActiveFilters,
  };
}

export default usePostFilters;
