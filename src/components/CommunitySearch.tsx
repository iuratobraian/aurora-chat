import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Usuario } from '../types';

interface Community {
  _id: any;
  name: string;
  slug: string;
  description: string;
  currentMembers: number;
  maxMembers: number;
  accessType: 'free' | 'paid';
  priceMonthly?: number;
  visibility: string;
}

interface CommunitySearchProps {
  usuario: Usuario | null;
  onVisitCommunity?: (slug: string) => void;
  onLoginRequest?: () => void;
  variant?: 'full' | 'compact' | 'inline';
  initialQuery?: string;
}

const CommunitySearch: React.FC<CommunitySearchProps> = ({
  usuario,
  onVisitCommunity,
  onLoginRequest,
  variant = 'full',
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'trending' | 'recommended'>('trending');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchResults = (useQuery(
    api.communities.searchCommunities,
    { query, limit: 20 }
  ) || []) as Community[];

  const trendingCommunities = (useQuery(
    api.communities.getTrendingCommunities,
    { limit: 10 }
  ) || []) as Community[];

  const recommendedCommunities = (useQuery(
    api.communities.getRecommendedCommunities,
    { limit: 5 }
  ) || []) as Community[];

  const communities = (activeTab === 'search' 
    ? searchResults 
    : activeTab === 'trending' 
      ? trendingCommunities 
      : recommendedCommunities) || [];

  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    setIsSearching(true);
    setActiveTab('search');
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearching(false);
    }, 300);
  }, []);

  const handleCommunityClick = (slug: string) => {
    if (onVisitCommunity) {
      onVisitCommunity(slug);
    } else {
      window.dispatchEvent(new CustomEvent('visit-community', { detail: slug }));
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const formatMembers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const CommunityCard = ({ community }: { community: Community }) => (
    <div 
      onClick={() => handleCommunityClick(community.slug)}
      className="group bg-white dark:bg-[#1a1d21] rounded-xl p-4 border border-gray-100 dark:border-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
              {community.name}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
              community.accessType === 'free' 
                ? 'bg-signal-green/10 text-signal-green border border-signal-green/20' 
                : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
            }`}>
              {community.accessType === 'free' ? 'Gratis' : 'Premium'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {community.description}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">group</span>
              {formatMembers(community.currentMembers)} miembros
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                {community.visibility === 'public' ? 'public' : 'lock'}
              </span>
              {community.visibility === 'public' ? 'Público' : 'Privado'}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary font-black text-lg">
            {community.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingCard = () => (
    <div className="bg-white dark:bg-[#1a1d21] rounded-xl p-4 border border-gray-100 dark:border-white/10 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-3/4" />
          <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-full" />
          <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/2" />
        </div>
        <div className="size-12 bg-gray-200 dark:bg-white/5 rounded-xl" />
      </div>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar comunidades..."
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-primary/50 transition-colors"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            search
          </span>
        </div>
        
        {query && activeTab === 'search' && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1d21] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => <LoadingCard key={i} />)}
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="p-2 space-y-2">
                {searchResults.map(community => (
                  <div 
                    key={community._id} 
                    onClick={() => handleCommunityClick(community.slug)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                  >
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {community.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{community.name}</p>
                      <p className="text-[10px] text-gray-500">{formatMembers(community.currentMembers)} miembros</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600 mb-2">search_off</span>
                <p className="text-xs text-gray-500">No se encontraron comunidades</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar..."
          className="w-full bg-white/50 dark:bg-white/5 border border-transparent dark:border-white/5 focus:border-primary/30 rounded-lg py-1.5 pl-8 pr-3 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-all"
        />
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar comunidades por nombre, descripción o slug..."
            className="w-full bg-white dark:bg-[#1a1d21] border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-white/10">
        {[
          { id: 'trending', label: 'Tendencias', icon: 'trending_up' },
          { id: 'recommended', label: 'Recomendadas', icon: 'star' },
          { id: 'search', label: query ? `Resultados (${searchResults?.length || 0})` : 'Búsqueda', icon: 'search' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <LoadingCard key={i} />)}
          </div>
        ) : communities && communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communities.map(community => (
              <CommunityCard key={community._id} community={community} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="size-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-gray-400">group_off</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {activeTab === 'search' ? 'Sin resultados' : 'No hay comunidades disponibles'}
            </h3>
            <p className="text-xs text-gray-500">
              {activeTab === 'search' 
                ? `No encontramos comunidades para "${query}"`
                : 'Explora más adelante para encontrar comunidades'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitySearch;
