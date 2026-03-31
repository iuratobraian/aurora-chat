import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Usuario } from '../types';

interface ExpertAdvisorsViewProps {
  usuario: Usuario | null;
  onLoginRequest?: () => void;
  onVisitProfile?: (userId: string) => void;
}

interface Product {
  _id: any;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  attributes?: {
    platform?: string;
    pairs?: string[];
    timeframe?: string[];
    riskLevel?: string;
    level?: string;
    duration?: string;
    format?: string[];
    frequency?: string;
    specs?: any;
  };
  price: number;
  currency: string;
  images: string[];
  demoFile?: string;
  mainFile?: string;
  fileName?: string;
  rating: number;
  ratingCount: number;
  salesCount: number;
  views: number;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  reviews: Array<{
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: number;
  }>;
  mql5Id?: string;
  mql5Url?: string;
  createdAt: number;
}

const PLATFORMS = ['MT4', 'MT5', 'Both'];
const RISK_LEVELS = ['Low', 'Medium', 'High'];
const TIMEFRAMES = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];
const PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'XAGUSD', 'AUDUSD', 'USDCAD', 'NZDUSD', 'BTCUSD', 'ETHUSD'];

const ExpertAdvisorsView: React.FC<ExpertAdvisorsViewProps> = ({ usuario, onLoginRequest, onVisitProfile }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const [selectedPair, setSelectedPair] = useState<string>('all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEA, setSelectedEA] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const products = useQuery(api.products.getProducts, { category: 'ea' }) || [];
  const purchases = useQuery(api.products.getUserPurchases, { userId: usuario?.id || '' }) || [];
  const userPurchasedIds = useMemo(() => new Set(purchases.map((p: any) => p.productId)), [purchases]);

  const purchaseProduct = useMutation(api.products.purchaseProduct);

  const filteredEAs = useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ea =>
        ea.title.toLowerCase().includes(query) ||
        ea.description.toLowerCase().includes(query) ||
        ea.tags.some(t => t.toLowerCase().includes(query)) ||
        ea.authorName.toLowerCase().includes(query)
      );
    }

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(ea =>
        ea.attributes?.platform === selectedPlatform ||
        ea.attributes?.platform === 'Both'
      );
    }

    if (selectedRisk !== 'all') {
      filtered = filtered.filter(ea => ea.attributes?.riskLevel === selectedRisk);
    }

    if (selectedTimeframe !== 'all') {
      filtered = filtered.filter(ea =>
        ea.attributes?.timeframe?.includes(selectedTimeframe)
      );
    }

    if (selectedPair !== 'all') {
      filtered = filtered.filter(ea =>
        ea.attributes?.pairs?.includes(selectedPair)
      );
    }

    switch (sortBy) {
      case 'popular':
        return filtered.sort((a, b) => b.salesCount - a.salesCount);
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'price_low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price_high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'name':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filtered.sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [products, sortBy, searchQuery, selectedPlatform, selectedRisk, selectedTimeframe, selectedPair]);

  const featuredEAs = useMemo(() => 
    products.filter(ea => ea.isFeatured).sort((a, b) => b.rating - a.rating),
    [products]
  );

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'GRATIS';
    if (currency === 'XP') return `${price} XP`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const getRiskColor = (risk: string | undefined) => {
    switch (risk) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPlatformIcon = (platform: string | undefined) => {
    switch (platform) {
      case 'MT4': return '📉';
      case 'MT5': return '📊';
      case 'Both': return '📈';
      default: return '🤖';
    }
  };

  const handlePurchase = async (ea: Product) => {
    if (!usuario || usuario.id === 'guest') {
      onLoginRequest?.();
      return;
    }

    if (userPurchasedIds.has(ea._id)) return;

    try {
      const platformFee = ea.price * 0.1;
      const authorEarnings = ea.price - platformFee;

      await purchaseProduct({
        productId: ea._id,
        buyerId: usuario.id,
        amount: ea.price,
        currency: ea.currency,
        platformFee,
        authorEarnings,
      });
    } catch (error) {
      console.error('Error purchasing:', error);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/30 blur-[30px] rounded-full"></div>
            <div className="relative size-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="text-3xl">{getPlatformIcon('Both')}</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
              <span className="text-amber-400">EAs</span> & Robots
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Expert Advisors para MetaTrader 4/5</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase">{filteredEAs.length} EAs Disponibles</span>
          </div>
        </div>
      </div>

      {featuredEAs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⭐</span>
            <h2 className="text-lg font-bold text-white uppercase">Los Más Valorados</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredEAs.slice(0, 4).map((ea: Product) => (
              <EACard
                key={ea._id}
                ea={ea}
                isPurchased={userPurchasedIds.has(ea._id)}
                onView={() => setSelectedEA(ea)}
                formatPrice={formatPrice}
                getRiskColor={getRiskColor}
                getPlatformIcon={getPlatformIcon}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
            <input
              type="text"
              placeholder="Buscar EAs, autores, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              showFilters ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined">tune</span>
            Filtros
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-500 outline-none cursor-pointer"
          >
            <option value="latest">Más Recientes</option>
            <option value="popular">Más Populares</option>
            <option value="rating">Mejor Valorados</option>
            <option value="price_low">Precio ↓</option>
            <option value="price_high">Precio ↑</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 glass rounded-2xl bg-black/40 border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Plataforma</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="all">Todas</option>
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Riesgo</label>
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="all">Todos</option>
                {RISK_LEVELS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Timeframe</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="all">Todos</option>
                {TIMEFRAMES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Pares</label>
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="all">Todos</option>
                {PAIRS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setSelectedPlatform('all');
                setSelectedRisk('all');
                setSelectedTimeframe('all');
                setSelectedPair('all');
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredEAs.map((ea: Product) => (
          <EACard
            key={ea._id}
            ea={ea}
            isPurchased={userPurchasedIds.has(ea._id)}
            onView={() => setSelectedEA(ea)}
            formatPrice={formatPrice}
            getRiskColor={getRiskColor}
            getPlatformIcon={getPlatformIcon}
          />
        ))}
      </div>

      {filteredEAs.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <span className="text-6xl mb-4 block">🤖</span>
          <h3 className="text-xl font-bold text-white mb-2">No hay EAs disponibles</h3>
          <p className="text-gray-500">
            {searchQuery || selectedPlatform !== 'all' || selectedRisk !== 'all'
              ? 'No se encontraron EAs para los filtros seleccionados'
              : 'Los Expert Advisors aparecerán aquí pronto'}
          </p>
        </div>
      )}

      {selectedEA && (
        <EADetailModal
          ea={selectedEA}
          isPurchased={userPurchasedIds.has(selectedEA._id)}
          onClose={() => setSelectedEA(null)}
          onPurchase={() => handlePurchase(selectedEA)}
          formatPrice={formatPrice}
          getRiskColor={getRiskColor}
          getPlatformIcon={getPlatformIcon}
          onVisitProfile={onVisitProfile}
        />
      )}
    </div>
  );
};

interface EACardProps {
  ea: Product;
  isPurchased: boolean;
  onView: () => void;
  formatPrice: (price: number, currency: string) => string;
  getRiskColor: (risk: string | undefined) => string;
  getPlatformIcon: (platform: string | undefined) => string;
}

const EACard: React.FC<EACardProps> = ({ ea, isPurchased, onView, formatPrice, getRiskColor, getPlatformIcon }) => {
  return (
    <div
      onClick={onView}
      className="glass rounded-2xl overflow-hidden bg-black/40 border border-white/10 hover:border-amber-500/50 transition-all cursor-pointer group hover:scale-[1.02] duration-300"
    >
      <div className="relative h-32 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-amber-500/5 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative size-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/30 flex items-center justify-center">
              <span className="text-4xl">{getPlatformIcon(ea.attributes?.platform)}</span>
            </div>
          </div>
        </div>
        
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-black/60 backdrop-blur-sm text-amber-400">
            {ea.attributes?.platform || 'MT5'}
          </span>
          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${getRiskColor(ea.attributes?.riskLevel)}`}>
            {ea.attributes?.riskLevel || 'Med'}
          </span>
        </div>
        
        {ea.mql5Id && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-green-500/80 text-white">
              MQL5
            </span>
          </div>
        )}
        
        {isPurchased && (
          <div className="absolute bottom-2 left-2 right-2">
            <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/90 text-white text-center block">
              ✓ Comprado
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white uppercase text-sm mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
          {ea.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="size-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[10px] font-bold text-white">
            {ea.authorName?.charAt(0) || '?'}
          </div>
          <span className="text-xs text-gray-400 truncate">{ea.authorName}</span>
        </div>

        {ea.attributes?.pairs && ea.attributes.pairs.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {ea.attributes.pairs.slice(0, 3).map((pair, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400">
                {pair}
              </span>
            ))}
            {ea.attributes.pairs.length > 3 && (
              <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-500">
                +{ea.attributes.pairs.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
            <span className="text-sm font-bold text-white">{ea.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({ea.ratingCount})</span>
          </div>
          <div className="text-right">
            <span className={`text-lg font-black ${ea.price === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {formatPrice(ea.price, ea.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EADetailModalProps {
  ea: Product;
  isPurchased: boolean;
  onClose: () => void;
  onPurchase: () => void;
  formatPrice: (price: number, currency: string) => string;
  getRiskColor: (risk: string | undefined) => string;
  getPlatformIcon: (platform: string | undefined) => string;
  onVisitProfile?: (userId: string) => void;
}

const EADetailModal: React.FC<EADetailModalProps> = ({
  ea, isPurchased, onClose, onPurchase, formatPrice, getRiskColor, getPlatformIcon, onVisitProfile
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl p-6 bg-black/90 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getPlatformIcon(ea.attributes?.platform)}</span>
            <div>
              <h2 className="text-xl font-black text-white uppercase">{ea.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRiskColor(ea.attributes?.riskLevel)}`}>
                  {ea.attributes?.riskLevel || 'Medium'} Risk
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-400">
                  {ea.attributes?.platform || 'MT5'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="md:col-span-2">
            <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/30 blur-3xl rounded-full animate-pulse" />
                <div className="relative size-24 rounded-2xl bg-gradient-to-br from-amber-500/40 to-orange-500/40 border-2 border-amber-500/30 flex items-center justify-center shadow-2xl shadow-amber-500/20">
                  <span className="text-6xl">{getPlatformIcon(ea.attributes?.platform)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <div
              onClick={() => onVisitProfile?.(ea.authorId)}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="size-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                {ea.authorName?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{ea.authorName}</p>
                <p className="text-xs text-gray-500">Desarrollador</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`material-symbols-outlined text-2xl ${
                    star <= Math.round(ea.rating) ? 'text-amber-400' : 'text-gray-600'
                  }`}
                >
                  star
                </span>
              ))}
              <span className="ml-2 text-lg font-bold text-white">{ea.rating.toFixed(1)}</span>
              <span className="text-gray-500">({ea.ratingCount} reseñas)</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-xl p-3 bg-white/5 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Ventas</p>
                <p className="font-black text-white text-lg">{ea.salesCount}</p>
              </div>
              <div className="glass rounded-xl p-3 bg-white/5 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Vistas</p>
                <p className="font-black text-white text-lg">{ea.views}</p>
              </div>
              <div className="glass rounded-xl p-3 bg-white/5 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Precio</p>
                <p className={`font-black text-lg ${ea.price === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {formatPrice(ea.price, ea.currency)}
                </p>
              </div>
            </div>

            {isPurchased ? (
              <div className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold text-center text-lg">
                ✓ Ya tienes este EA
              </div>
            ) : (
              <button
                onClick={onPurchase}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                Obtener EA - {formatPrice(ea.price, ea.currency)}
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-white uppercase mb-3">Características</h3>
          <div className="grid grid-cols-2 gap-3">
            {ea.attributes?.pairs && ea.attributes.pairs.length > 0 && (
              <div className="glass rounded-xl p-4 bg-white/5">
                <p className="text-[10px] text-gray-500 uppercase mb-2">Pares Compatibles</p>
                <div className="flex flex-wrap gap-1">
                  {ea.attributes.pairs.map((pair, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-bold">
                      {pair}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {ea.attributes?.timeframe && ea.attributes.timeframe.length > 0 && (
              <div className="glass rounded-xl p-4 bg-white/5">
                <p className="text-[10px] text-gray-500 uppercase mb-2">Timeframes</p>
                <div className="flex flex-wrap gap-1">
                  {ea.attributes.timeframe.map((tf, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">
                      {tf}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-[10px] text-gray-500 uppercase mb-2">Plataforma</p>
              <p className="font-bold text-white">{ea.attributes?.platform || 'MT5'}</p>
            </div>
            
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-[10px] text-gray-500 uppercase mb-2">Nivel de Riesgo</p>
              <p className={`font-bold ${ea.attributes?.riskLevel === 'High' ? 'text-red-400' : ea.attributes?.riskLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {ea.attributes?.riskLevel || 'Medium'}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-white uppercase mb-3">Descripción</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {ea.longDescription || ea.description}
          </p>
        </div>

        {ea.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ea.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {ea.mql5Url && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <a
              href={ea.mql5Url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-green-500/30 transition-all"
            >
              <span className="material-symbols-outlined">open_in_new</span>
              Ver en MQL5 Code Base
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertAdvisorsView;
