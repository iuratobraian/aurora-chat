import React from 'react';

interface Strategy {
  _id?: string;
  id: string;
  authorId: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD' | 'XP';
  category: string;
  tags: string[];
  imageUrl?: string;
  downloads: number;
  rating: number;
  ratingCount?: number;
  isPublished: boolean;
  author?: {
    userId: string;
    nombre: string;
    usuario: string;
    avatar?: string;
    level?: any;
  };
  hasAccess?: boolean;
}

interface MarketplaceHeaderProps {
  searchQuery: string;
  selectedCategory: string;
  selectedSort: string;
  selectedPrice: string;
  showFilters: boolean;
  showMyStrategies: boolean;
  showPurchaseHistory: boolean;
  categories: { value: string; label: string }[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onPriceChange: (price: string) => void;
  onToggleFilters: () => void;
  onToggleMyStrategies: () => void;
  onTogglePurchaseHistory: () => void;
}

export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  searchQuery,
  selectedCategory,
  selectedSort,
  selectedPrice,
  showFilters,
  showMyStrategies,
  showPurchaseHistory,
  categories,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onPriceChange,
  onToggleFilters,
  onToggleMyStrategies,
  onTogglePurchaseHistory,
}) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar estrategias, indicadores, robots..."
          className="w-full bg-dark-200/50 backdrop-blur-xl rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 border border-white/10 focus:border-primary/50 focus:outline-none transition-all"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onToggleFilters}
          className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
            showFilters ? 'bg-primary border-primary text-white' : 'bg-dark-200 border-white/10 text-gray-300 hover:border-primary/50'
          }`}
        >
          <span className="material-symbols-outlined text-sm">filter_list</span>
          Filtros
        </button>

        <button
          onClick={onToggleMyStrategies}
          className={`px-4 py-2 rounded-xl border transition-all ${
            showMyStrategies ? 'bg-primary border-primary text-white' : 'bg-dark-200 border-white/10 text-gray-300 hover:border-primary/50'
          }`}
        >
          <span className="material-symbols-outlined text-sm mr-1">folder</span>
          Mis Estrategias
        </button>

        <button
          onClick={onTogglePurchaseHistory}
          className={`px-4 py-2 rounded-xl border transition-all ${
            showPurchaseHistory ? 'bg-primary border-primary text-white' : 'bg-dark-200 border-white/10 text-gray-300 hover:border-primary/50'
          }`}
        >
          <span className="material-symbols-outlined text-sm mr-1">history</span>
          Mis Compras
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === cat.value
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="glass rounded-2xl p-4 border border-white/10 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase mb-2 block">Ordenar</label>
              <select
                value={selectedSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full bg-dark-300 rounded-xl px-3 py-2 text-sm text-white border border-white/10"
              >
                <option value="popular">Populares</option>
                <option value="recent">Recientes</option>
                <option value="rating">Mejor Valorados</option>
                <option value="price_low">Precio: Menor</option>
                <option value="price_high">Precio: Mayor</option>
                <option value="downloads">Más Descargados</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase mb-2 block">Precio</label>
              <select
                value={selectedPrice}
                onChange={(e) => onPriceChange(e.target.value)}
                className="w-full bg-dark-300 rounded-xl px-3 py-2 text-sm text-white border border-white/10"
              >
                <option value="all">Todos</option>
                <option value="free">Gratuitos</option>
                <option value="under_10">Menos de $10</option>
                <option value="under_50">Menos de $50</option>
                <option value="under_100">Menos de $100</option>
                <option value="over_100">Más de $100</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceHeader;
