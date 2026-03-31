import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Usuario } from '../types';
import { STRATEGY_CATEGORIES, SORT_OPTIONS, PRICE_FILTERS } from '../data/strategyCategories';
import ElectricLoader from '../components/ElectricLoader';
import { useToast } from '../components/ToastProvider';
import logger from '../utils/logger';
import { Avatar } from '../components/Avatar';

interface Strategy {
  _id?: string;
  id: string;
  authorId: string;
  title: string;
  description: string;
  content: any;
  price: number;
  currency: 'USD' | 'XP';
  category: string;
  tags: string[];
  imageUrl?: string;
  fileUrl?: string;
  downloads: number;
  rating: number;
  ratingCount?: number;
  isPublished: boolean;
  createdAt: number;
  updatedAt: number;
  author?: {
    userId: string;
    nombre: string;
    usuario: string;
    avatar?: string;
    level?: any;
  };
  hasAccess?: boolean;
  hasPurchased?: boolean;
  previewContent?: string;
}

interface MarketplaceViewProps {
  usuario: Usuario | null;
  onLoginRequest?: () => void;
  onVisitProfile?: (id: string) => void;
  onNavigate?: (tab: string) => void;
}

export default function MarketplaceView({ usuario, onLoginRequest, onVisitProfile, onNavigate }: MarketplaceViewProps) {
  const { showToast } = useToast();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [strategyDetail, setStrategyDetail] = useState<Strategy | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSellerLeaderboard, setShowSellerLeaderboard] = useState(false);
  const [showMyStrategies, setShowMyStrategies] = useState(false);
  const [myStrategies, setMyStrategies] = useState<Strategy[]>([]);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);

  const strategiesQuery = useQuery(api.strategies.getPublishedStrategies, {
    filters: {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      sortBy: selectedSort as any,
      ...(selectedPrice === 'free' && { maxPrice: 0 }),
      ...(selectedPrice === 'under_10' && { maxPrice: 10 }),
      ...(selectedPrice === 'under_50' && { maxPrice: 50 }),
      ...(selectedPrice === 'under_100' && { maxPrice: 100 }),
      ...(selectedPrice === 'over_100' && { minPrice: 100 }),
    },
    limit: 50,
  });

  const topStrategiesQuery = useQuery(api.strategies.getTopStrategies, { limit: 5 });
  const sellerLeaderboardQuery = useQuery(api.strategies.getSellerLeaderboard, { limit: 10 });
  const myStrategiesQuery = useQuery(api.strategies.getUserStrategies, {
    userId: usuario?.id || '',
    includeUnpublished: true,
  });
  const purchaseHistoryQuery = useQuery(api.strategies.getUserPurchases, { 
    userId: usuario?.id || '' 
  });

  const createStrategyMutation = useMutation(api.strategies.createStrategy);
  const purchaseStrategyMutation = useMutation(api.strategies.purchaseStrategy);
  const addToBookLibraryMutation = useMutation(api.strategies.addToBookLibrary);
  const rateStrategyMutation = useMutation(api.strategies.rateStrategy);
  const deleteStrategyMutation = useMutation(api.strategies.deleteStrategy);
  const publishStrategyMutation = useMutation(api.strategies.publishStrategy);

  useEffect(() => {
    if (strategiesQuery) {
      setStrategies(strategiesQuery.strategies || []);
    }
    setLoading(strategiesQuery === undefined);
  }, [strategiesQuery]);

  useEffect(() => {
    if (myStrategiesQuery) {
      setMyStrategies(myStrategiesQuery);
    }
  }, [myStrategiesQuery]);

  useEffect(() => {
    if (purchaseHistoryQuery) {
      setPurchaseHistory(purchaseHistoryQuery);
    }
  }, [purchaseHistoryQuery]);

  const searchStrategies = useCallback(async () => {
    if (searchQuery.length >= 2) {
      try {
        const result = await (window as any).convex.query(api.strategies.searchStrategies, {
          query: searchQuery,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
        });
        if (result) setStrategies(result);
      } catch (error) {
        logger.error('Error searching strategies:', error);
      }
    } else if (searchQuery.length === 0 && strategiesQuery) {
      setStrategies(strategiesQuery.strategies || []);
    }
  }, [searchQuery, selectedCategory, strategiesQuery]);

  useEffect(() => {
    const timeout = setTimeout(searchStrategies, 300);
    return () => clearTimeout(timeout);
  }, [searchStrategies]);

  const handleOpenStrategy = async (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setDetailLoading(true);
    setUserRating(0);
    
    try {
      const result = await (window as any).convex.query(api.strategies.getStrategyByIdWithAccess, {
        strategyId: strategy.id,
        userId: usuario?.id,
      });
      setStrategyDetail(result);
    } catch (error) {
      logger.error('Error loading strategy detail:', error);
      setStrategyDetail(strategy);
    }
    
    setDetailLoading(false);
  };

  const handlePurchase = async () => {
    if (!usuario || !selectedStrategy) return;
    
    try {
      await purchaseStrategyMutation({
        strategyId: selectedStrategy.id,
        userId: usuario.id,
        paymentMethod: selectedStrategy.currency,
      });

      if (selectedStrategy.category === 'books' && selectedStrategy.fileUrl) {
        try {
          await addToBookLibraryMutation({
            userId: usuario.id,
            strategyId: selectedStrategy.id,
            title: selectedStrategy.title,
            fileUrl: selectedStrategy.fileUrl,
            coverUrl: selectedStrategy.imageUrl || undefined,
          });
        } catch (bookError) {
          logger.error('Error adding book to library:', bookError);
        }
      }
      
      if (strategyDetail) {
        setStrategyDetail({ ...strategyDetail, hasAccess: true, hasPurchased: true });
      }
    } catch (error: any) {
      showToast('error', error.message || 'Error al comprar la estrategia');
    }
  };

  const handleRate = async () => {
    if (!usuario || !selectedStrategy || userRating === 0) return;
    
    try {
      await rateStrategyMutation({
        strategyId: selectedStrategy.id,
        userId: usuario.id,
        rating: userRating,
      });
    } catch (error: any) {
      showToast('error', error.message || 'Error al calificar la estrategia');
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (!usuario) return;
    if (!confirm('¿Estás seguro de eliminar esta estrategia?')) return;
    
    try {
      await deleteStrategyMutation({ id: strategyId, authorId: usuario.id });
      showToast('success', 'Estrategia eliminada');
    } catch (error: any) {
      showToast('error', error.message || 'Error al eliminar la estrategia');
    }
  };

  const handleTogglePublish = async (strategyId: string, currentStatus: boolean) => {
    if (!usuario) return;
    
    try {
      await publishStrategyMutation({ id: strategyId, authorId: usuario.id, publish: !currentStatus });
      showToast('success', currentStatus ? 'Estrategia ocultada' : 'Estrategia publicada');
    } catch (error: any) {
      showToast('error', error.message || 'Error al actualizar la estrategia');
    }
  };

  const formatPrice = (price: number, currency: 'USD' | 'XP') => {
    if (price === 0) return 'GRATIS';
    return currency === 'XP' ? `${price} XP` : `$${price}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryInfo = (categoryId: string) => {
    return STRATEGY_CATEGORIES.find(c => c.id === categoryId) || STRATEGY_CATEGORIES[0];
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onSelect?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            disabled={!interactive}
          >
            <span className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}>
              {star <= rating ? '★' : '☆'}
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl p-6 mb-6 border border-primary/30">
              <h1 className="text-3xl font-black text-white mb-2">
                Negocios
              </h1>
              <p className="text-gray-400">
                Descubre y comparte productos de trading con la comunidad
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar estrategias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-200 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-xl border transition-all ${showFilters ? 'bg-primary border-primary text-white' : 'bg-dark-200 border-white/10 text-gray-300 hover:border-primary/50'}`}
                >
                  <span className="material-symbols-outlined">filter_list</span>
                </button>

                {usuario && (
                  <>
                    <button
                      onClick={() => {
                        setShowMyStrategies(!showMyStrategies);
                        setShowPurchaseHistory(false);
                      }}
                      className={`px-4 py-3 rounded-xl border transition-all ${showMyStrategies ? 'bg-primary border-primary text-white' : 'bg-dark-200 border-white/10 text-gray-300 hover:border-primary/50'}`}
                    >
                      <span className="material-symbols-outlined">folder_special</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowPurchaseHistory(!showPurchaseHistory);
                        setShowMyStrategies(false);
                      }}
                      className={`px-4 py-3 rounded-xl border transition-all ${showPurchaseHistory ? 'bg-primary border-primary text-white' : 'bg-dark-200 border-white/10 text-gray-300 hover:border-primary/50'}`}
                    >
                      <span className="material-symbols-outlined">history</span>
                    </button>
                  </>
                )}
                
                {usuario && usuario.role >= 3 && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">add</span>
                    Crear
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setShowSellerLeaderboard(!showSellerLeaderboard);
                  }}
                  className="px-4 py-3 bg-dark-200 border border-white/10 text-gray-300 rounded-xl hover:border-primary/50 transition-all"
                >
                  <span className="material-symbols-outlined">leaderboard</span>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="bg-dark-200 border border-white/10 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Categoría</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-dark-300 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary"
                    >
                      <option value="all">Todas</option>
                      {STRATEGY_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Ordenar por</label>
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                      className="w-full bg-dark-300 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary"
                    >
                      {SORT_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Precio</label>
                    <select
                      value={selectedPrice}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      className="w-full bg-dark-300 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary"
                    >
                      {PRICE_FILTERS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {showSellerLeaderboard && sellerLeaderboardQuery && (
              <div className="bg-dark-200 border border-white/10 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-400">emoji_events</span>
                  Top Vendedores
                </h3>
                <div className="space-y-3">
                  {sellerLeaderboardQuery.map((seller: any, index: number) => (
                    <div
                      key={seller.userId}
                      className="flex items-center gap-4 p-3 bg-dark-300 rounded-lg hover:bg-dark-100 transition-colors cursor-pointer"
                      onClick={() => onVisitProfile?.(seller.userId)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-dark-100 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <Avatar
                        src={seller.avatar}
                        name={seller.nombre}
                        seed={seller.usuario}
                        size="sm"
                        rounded="full"
                      />
                      <div className="flex-1">
                        <p className="text-white font-semibold">{seller.nombre}</p>
                        <p className="text-gray-400 text-sm">@{seller.usuario}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-bold">{seller.totalSales} ventas</p>
                        <p className="text-gray-400 text-sm">{seller.strategyCount} estrategias</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showMyStrategies && myStrategiesQuery && (
              <div className="bg-dark-200 border border-white/10 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">folder_special</span>
                  Mis Estrategias
                </h3>
                {myStrategiesQuery.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Aún no has creado estrategias</p>
                ) : (
                  <div className="space-y-3">
                    {myStrategiesQuery.map((strategy: Strategy) => (
                      <div key={strategy.id} className="flex items-center gap-4 p-3 bg-dark-300 rounded-lg">
                        <div className="flex-1">
                          <p className="text-white font-semibold">{strategy.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs ${strategy.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {strategy.isPublished ? 'Publicado' : 'Borrador'}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {formatPrice(strategy.price, strategy.currency)}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {strategy.downloads} descargas
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTogglePublish(strategy.id, strategy.isPublished)}
                            className={`px-3 py-1.5 rounded-lg text-sm ${strategy.isPublished ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}
                          >
                            {strategy.isPublished ? 'Despublicar' : 'Publicar'}
                          </button>
                          <button
                            onClick={() => handleDeleteStrategy(strategy.id)}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showPurchaseHistory && purchaseHistoryQuery && (
              <div className="bg-dark-200 border border-white/10 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-400">shopping_bag</span>
                  Mis Compras
                </h3>
                {purchaseHistoryQuery.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Aún no has comprado estrategias</p>
                ) : (
                  <div className="space-y-3">
                    {purchaseHistoryQuery.map((purchase: any) => (
                      <div
                        key={purchase._id}
                        className="flex items-center gap-4 p-3 bg-dark-300 rounded-lg cursor-pointer hover:bg-dark-100 transition-colors"
                        onClick={() => purchase.strategy && handleOpenStrategy(purchase.strategy)}
                      >
                        <span className="material-symbols-outlined text-2xl text-primary">description</span>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{purchase.strategy?.title}</p>
                          <p className="text-gray-400 text-sm">
                            {formatPrice(purchase.amountPaid, purchase.currency)} - {new Date(purchase.purchasedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!showMyStrategies && !showPurchaseHistory && topStrategiesQuery && topStrategiesQuery.length > 0 && !searchQuery && selectedCategory === 'all' && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">trending_up</span>
                  Top Estrategias
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {topStrategiesQuery.map((strategy: Strategy, index: number) => (
                    <div
                      key={strategy.id}
                      onClick={() => handleOpenStrategy(strategy)}
                      className="relative bg-dark-200/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all cursor-pointer group"
                    >
                      <div className="relative h-20 bg-gradient-to-br from-primary/30 to-purple-600/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-white/50 group-hover:scale-110 transition-transform">
                          {getCategoryInfo(strategy.category).icon}
                        </span>
                        {index < 3 && (
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            'bg-amber-600 text-white'
                          }`}>
                            #{index + 1}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-white font-semibold text-sm truncate">{strategy.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(Math.round(strategy.rating))}
                          <span className="text-gray-500 text-xs">({strategy.downloads})</span>
                        </div>
                        <p className="text-primary font-bold text-sm mt-1">
                          {formatPrice(strategy.price, strategy.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">grid_view</span>
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Todas las Estrategias'}
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <ElectricLoader type="phrase" phrase="Cargando estrategias..." />
              </div>
            ) : strategies.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">search_off</span>
                <h3 className="text-xl font-bold text-white mb-2">No se encontraron estrategias</h3>
                <p className="text-gray-400">Intenta con otros filtros o crea una nueva estrategia</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {strategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    onClick={() => handleOpenStrategy(strategy)}
                    className="relative bg-dark-200/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all cursor-pointer group"
                  >
                    <div className="relative h-28 bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                      {strategy.imageUrl ? (
                        <img src={strategy.imageUrl} alt={strategy.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-5xl text-white/30 group-hover:scale-110 transition-transform">
                          {getCategoryInfo(strategy.category).icon}
                        </span>
                      )}
                      <div
                        className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold"
                        style={{ backgroundColor: getCategoryInfo(strategy.category).color }}
                      >
                        {getCategoryInfo(strategy.category).name}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-1 line-clamp-1">{strategy.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{strategy.description}</p>
                      
                      {strategy.author && (
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar
                            src={strategy.author.avatar}
                            name={strategy.author.nombre}
                            seed={strategy.author.usuario}
                            size="xs"
                            rounded="full"
                          />
                          <span className="text-gray-400 text-xs">{strategy.author.usuario}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {renderStars(Math.round(strategy.rating))}
                          <span className="text-gray-500 text-xs">({strategy.downloads})</span>
                        </div>
                        <p className="text-primary font-bold">
                          {formatPrice(strategy.price, strategy.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-72">
            <div className="bg-dark-200 border border-white/10 rounded-xl p-4 sticky top-20">
              <h3 className="text-lg font-bold text-white mb-4">Categorías</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-white'
                      : 'hover:bg-dark-100 text-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined">apps</span>
                  <span>Todas</span>
                </button>
                {STRATEGY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-dark-100 text-gray-300'
                    }`}
                  >
                    <span className="material-symbols-outlined">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedStrategy && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedStrategy(null)}>
          <div className="bg-dark-100 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex justify-center items-center h-64">
                <ElectricLoader type="phrase" phrase="Cargando..." />
              </div>
            ) : strategyDetail ? (
              <>
                <div className="relative h-40 bg-gradient-to-br from-primary/40 to-purple-600/40 flex items-center justify-center">
                  {strategyDetail.imageUrl ? (
                    <img src={strategyDetail.imageUrl} alt={strategyDetail.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-7xl text-white/30">
                      {getCategoryInfo(strategyDetail.category).icon}
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedStrategy(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                        style={{ backgroundColor: getCategoryInfo(strategyDetail.category).color }}
                      >
                        {getCategoryInfo(strategyDetail.category).name}
                      </div>
                      <h2 className="text-2xl font-bold text-white">{strategyDetail.title}</h2>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(strategyDetail.price, strategyDetail.currency)}
                    </p>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{strategyDetail.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {strategyDetail.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-dark-200 rounded text-xs text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {strategyDetail.author && (
                    <div
                      className="flex items-center gap-3 p-3 bg-dark-200 rounded-xl mb-4 cursor-pointer hover:bg-dark-300 transition-colors"
                      onClick={() => {
                        onVisitProfile?.(strategyDetail.author?.userId || '');
                        setSelectedStrategy(null);
                      }}
                    >
                      <Avatar
                        src={strategyDetail.author.avatar}
                        name={strategyDetail.author.nombre}
                        seed={strategyDetail.author.usuario}
                        size="lg"
                        rounded="full"
                      />
                      <div>
                        <p className="text-white font-semibold">{strategyDetail.author.nombre}</p>
                        <p className="text-gray-400 text-sm">@{strategyDetail.author.usuario}</p>
                      </div>
                      {strategyDetail.author.level && (
                        <div className="ml-auto text-right">
                          <p className="text-primary text-sm font-bold">Nivel {strategyDetail.author.level.level}</p>
                          <p className="text-gray-500 text-xs">{strategyDetail.author.level.name}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-dark-200 rounded-xl p-3 text-center">
                      <span className="material-symbols-outlined text-lg text-yellow-400">star</span>
                      <p className="text-white font-bold mt-1">{strategyDetail.rating.toFixed(1)}</p>
                      <p className="text-gray-400 text-xs">{strategyDetail.ratingCount || 0} reseñas</p>
                    </div>
                    <div className="bg-dark-200 rounded-xl p-3 text-center">
                      <span className="material-symbols-outlined text-lg text-blue-400">download</span>
                      <p className="text-white font-bold mt-1">{strategyDetail.downloads}</p>
                      <p className="text-gray-400 text-xs">descargas</p>
                    </div>
                    <div className="bg-dark-200 rounded-xl p-3 text-center">
                      <span className="material-symbols-outlined text-lg text-green-400">calendar_today</span>
                      <p className="text-white font-bold mt-1">{formatDate(strategyDetail.createdAt)}</p>
                      <p className="text-gray-400 text-xs">creada</p>
                    </div>
                  </div>
                  
                  {strategyDetail.hasAccess ? (
                    strategyDetail.category === 'books' && strategyDetail.fileUrl ? (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 text-amber-400 mb-3">
                          <span className="material-symbols-outlined">check_circle</span>
                          <span className="font-bold">Libro añadido a tu biblioteca</span>
                        </div>
                        <a
                          href={strategyDetail.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined">menu_book</span>
                          Leer ahora
                        </a>
                        <p className="text-gray-400 text-xs mt-2 text-center">
                          También puedes acceder desde tu perfil
                        </p>
                      </div>
                    ) : (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <span className="material-symbols-outlined">check_circle</span>
                        <span className="font-bold">Tienes acceso completo</span>
                      </div>
                      <div className="text-gray-300 text-sm whitespace-pre-wrap font-mono bg-dark-200 p-3 rounded-lg max-h-60 overflow-y-auto">
                        {typeof strategyDetail.content === 'string'
                          ? strategyDetail.content
                          : JSON.stringify(strategyDetail.content, null, 2)}
                      </div>
                    </div>
                    )
                  ) : (
                    <div className="bg-dark-200 rounded-xl p-4 mb-4">
                      <h4 className="text-white font-semibold mb-2">Vista Previa</h4>
                      <p className="text-gray-400 text-sm">
                        {strategyDetail.previewContent || strategyDetail.description}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        Compra para ver el contenido completo
                      </p>
                    </div>
                  )}
                  
                  {!strategyDetail.hasAccess && !strategyDetail.hasPurchased && strategyDetail.price > 0 && (
                    <button
                      onClick={handlePurchase}
                      className="w-full py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">shopping_cart</span>
                      Comprar por {formatPrice(strategyDetail.price, strategyDetail.currency)}
                    </button>
                  )}
                  
                  {strategyDetail.hasPurchased && !strategyDetail.hasAccess && (
                    <button
                      onClick={handlePurchase}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">lock_open</span>
                      Desbloquear contenido
                    </button>
                  )}
                  
                  {(strategyDetail.hasAccess || strategyDetail.hasPurchased || strategyDetail.price === 0) && (
                    <div className="mt-4">
                      <h4 className="text-white font-semibold mb-2">Calificar estrategia</h4>
                      <div className="flex items-center gap-4">
                        {renderStars(userRating, true, setUserRating)}
                        {userRating > 0 && (
                          <button
                            onClick={handleRate}
                            className="px-4 py-2 bg-primary rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
                          >
                            Enviar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateStrategyModal
          usuario={usuario}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

interface CreateStrategyModalProps {
  usuario: Usuario | null;
  onClose: () => void;
  onSuccess: () => void;
  showToast?: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

function CreateStrategyModal({ usuario, onClose, onSuccess, showToast: showToastProp }: CreateStrategyModalProps) {
  const { showToast: showToastContext } = useToast();
  const showToast = showToastProp || showToastContext;
  const createStrategyMutation = useMutation(api.strategies.createStrategy);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [currency, setCurrency] = useState<'USD' | 'XP'>('XP');
  const [category, setCategory] = useState('swing');
  const [tags, setTags] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (cat === 'books') {
      setIsFree(true);
      setPrice(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    
    if (category === 'books' && !fileUrl) {
      showToast('warning', 'Los libros requieren una URL de PDF');
      return;
    }
    
    setLoading(true);
    try {
      await createStrategyMutation({
        authorId: usuario.id,
        title,
        description,
        content,
        price: isFree ? 0 : price,
        currency,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        imageUrl: imageUrl || undefined,
        fileUrl: fileUrl || undefined,
        isPublished,
      });
      onSuccess();
    } catch (error: any) {
      showToast('error', error.message || 'Error al crear la estrategia');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-dark-100 border border-white/10 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Crear Estrategia</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-dark-200 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-dark-200 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary h-20 resize-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Contenido (estrategia completa)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-dark-200 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary h-40 font-mono text-sm resize-none"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Precio</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-dark-200 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'USD' | 'XP')}
                  className="w-full bg-dark-200 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary"
                >
                  <option value="XP">XP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-dark-200 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary"
              >
                {STRATEGY_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {category === 'books' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">URL del PDF *</label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://ejemplo.com/libro.pdf"
                    className="w-full bg-dark-200 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Sube tu PDF a un hosting y pega la URL aquí</p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">URL de portada (opcional)</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/portada.jpg"
                    className="w-full bg-dark-200 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </>
            )}
            
            {category !== 'books' && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={isFree}
                  onChange={(e) => {
                    setIsFree(e.target.checked);
                    if (e.target.checked) setPrice(0);
                  }}
                  className="w-5 h-5 rounded bg-dark-200 border-white/10 accent-green-500"
                />
                <label htmlFor="isFree" className="text-gray-300">Marcar como gratuito</label>
              </div>
            )}
            
            {category !== 'books' && !isFree && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Precio</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-dark-200 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Moneda</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'USD' | 'XP')}
                    className="w-full bg-dark-200 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="XP">XP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1">Tags (separados por coma)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="swing, forex, indicadores"
                className="w-full bg-dark-200 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-5 h-5 rounded bg-dark-200 border-white/10"
              />
              <label htmlFor="isPublished" className="text-gray-300">Publicar inmediatamente</label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Estrategia'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
