import React, { memo } from 'react';
import { Usuario } from '../types';

interface SearchBarProps {
  value: string;
  onChange: (term: string) => void;
  results: Usuario[];
  onResultClick: (userId: string) => void;
  showResults: boolean;
}

const SearchBar: React.FC<SearchBarProps> = memo(({ value, onChange, results, onResultClick, showResults }) => {
  return (
    <div className="hidden md:block flex-1 max-w-[200px] relative">
      <div className="relative group">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar..."
          className="w-full bg-gray-100/30 dark:bg-white/5 border border-transparent dark:border-white/5 focus:border-blue-500/30 rounded-lg py-1.5 pl-8 pr-3 text-[9px] font-bold text-gray-900 dark:text-white placeholder:text-gray-500 outline-none transition-all"
        />
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm group-focus-within:text-blue-500 transition-colors">search</span>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1d21] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-[60]">
          {results.map(result => (
            <div
              key={result.id}
              onClick={() => onResultClick(result.id)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer border-b border-gray-100 dark:border-white/5 last:border-none group"
            >
              <img src={result.avatar} className="size-6 rounded-lg" alt="" loading="lazy" />
              <div>
                <p className="text-[10px] font-black text-gray-900 dark:text-white group-hover:text-blue-500">{result.nombre}</p>
                <p className="text-[8px] text-gray-500">@{result.usuario}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
