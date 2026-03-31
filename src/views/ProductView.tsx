import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Usuario } from '../types';

interface ProductViewProps {
  usuario: Usuario | null;
  onLoginRequest?: () => void;
  onVisitProfile?: (userId: string) => void;
  initialCategory?: string;
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

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: 'apps' },
  { id: 'ea', label: 'Expert Advisors', icon: 'smart_toy' },
  { id: 'indicator', label: 'Indicadores', icon: 'analytics' },
  { id: 'template', label: 'Templates', icon: 'dashboard' },
  { id: 'course', label: 'Cursos', icon: 'school' },
  { id: 'signal', label: 'Señales', icon: 'signal_cellular_alt' },
  { id: 'vps', label: 'VPS', icon: 'cloud' },
  { id: 'tool', label: 'Herramientas', icon: 'build' },
];

const SORT_OPTIONS = [
  { id: 'latest', label: 'Más Recientes' },
  { id: 'popular', label: 'Más Populares' },
  { id: 'rating', label: 'Mejor Valorados' },
  { id: 'price_low', label: 'Precio: Menor a Mayor' },
  { id: 'price_high', label: 'Precio: Mayor a Menor' },
];

const ProductView: React.FC<ProductViewProps> = ({ usuario, onLoginRequest, onVisitProfile, initialCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPurchases, setShowPurchases] = useState(false);

  const products = useQuery(api.products.getProducts, { category: selectedCategory }) || [];
  const featuredProducts = useQuery(api.products.getFeaturedProducts) || [];
  const purchases = useQuery(api.products.getUserPurchases, { userId: usuario?.id || '' }) || [];
  const userPurchasedIds = useMemo(() => new Set(purchases.map((p: any) => p.productId)), [purchases]);

  const addToWishlist = useMutation(api.products.addToWishlist);
  const removeFromWishlist = useMutation(api.products.removeFromWishlist);
  const purchaseProduct = useMutation(api.products.purchaseProduct);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const sortedProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
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
      default:
        return filtered.sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [products, sortBy, searchQuery]);

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'XP') return `${price} XP`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.icon || 'shopping_cart';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ea: 'from-amber-500/20 to-orange-500/20 text-amber-400',
      indicator: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
      template: 'from-purple-500/20 to-pink-500/20 text-purple-400',
      course: 'from-green-500/20 to-emerald-500/20 text-green-400',
      signal: 'from-primary/20 to-blue-500/20 text-primary',
      vps: 'from-gray-500/20 to-slate-500/20 text-gray-400',
      tool: 'from-red-500/20 to-rose-500/20 text-red-400',
    };
    return colors[category] || 'from-gray-500/20 to-slate-500/20 text-gray-400';
  };

  const handlePurchase = async (product: Product) => {
    if (!usuario || usuario.id === 'guest') {
      onLoginRequest?.();
      return;
    }

    if (userPurchasedIds.has(product._id)) return;

    try {
      const platformFee = product.price * 0.1;
      const authorEarnings = product.price - platformFee;

      await purchaseProduct({
        productId: product._id,
        buyerId: usuario.id,
        amount: product.price,
        currency: product.currency,
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
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            🤖 Marketplace
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            EAs, Indicadores, Templates y más para MT4/MT5
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowPurchases(!showPurchases)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              showPurchases
                ? 'bg-primary text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            Mis Compras
          </button>
          {usuario && usuario.id !== 'guest' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              <span className="material-symbols-outlined">add</span>
              Crear Producto
            </button>
          )}
        </div>
      </div>

      {showPurchases ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase">Mis Compras</h2>
          {purchases.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">shopping_bag</span>
              <h3 className="text-xl font-bold text-white mb-2">Sin compras aún</h3>
              <p className="text-gray-500">Explora el marketplace para encontrar productos increíbles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchases.map((purchase: any) => (
                <div
                  key={purchase._id}
                  className="glass rounded-2xl p-4 bg-black/40 border border-white/10 hover:border-primary/40 transition-all cursor-pointer"
                  onClick={() => purchase.product && setSelectedProduct(purchase.product)}
                >
                  {purchase.product?.images?.[0] && (
                    <div className="h-40 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-primary/20 to-blue-500/20">
                      <img
                        src={purchase.product.images[0]}
                        alt={purchase.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-white uppercase">{purchase.product?.title || 'Producto'}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Comprado el {new Date(purchase.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {featuredProducts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white uppercase mb-4">⭐ Destacados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredProducts.slice(0, 4).map((product: Product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isPurchased={userPurchasedIds.has(product._id)}
                    onView={() => setSelectedProduct(product)}
                    formatPrice={formatPrice}
                    getCategoryIcon={getCategoryIcon}
                    getCategoryColor={getCategoryColor}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="flex-1">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary outline-none"
                />
              </div>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedProducts.map((product: Product) => (
              <ProductCard
                key={product._id}
                product={product}
                isPurchased={userPurchasedIds.has(product._id)}
                onView={() => setSelectedProduct(product)}
                formatPrice={formatPrice}
                getCategoryIcon={getCategoryIcon}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">inventory_2</span>
              <h3 className="text-xl font-bold text-white mb-2">No hay productos</h3>
              <p className="text-gray-500">
                {searchQuery ? 'No se encontraron productos para tu búsqueda' : 'Los productos aparecerán aquí'}
              </p>
            </div>
          )}
        </>
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isPurchased={userPurchasedIds.has(selectedProduct._id)}
          onClose={() => setSelectedProduct(null)}
          onPurchase={handlePurchase}
          formatPrice={formatPrice}
          getCategoryColor={getCategoryColor}
          usuario={usuario}
          onVisitProfile={onVisitProfile}
        />
      )}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  isPurchased: boolean;
  onView: () => void;
  formatPrice: (price: number, currency: string) => string;
  getCategoryIcon: (category: string) => string;
  getCategoryColor: (category: string) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isPurchased,
  onView,
  formatPrice,
  getCategoryIcon,
  getCategoryColor,
}) => {
  const addToWishlist = useMutation(api.products.addToWishlist);
  const [wishlisted, setWishlisted] = useState(false);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (wishlisted) {
        await addToWishlist({ productId: product._id, userId: 'guest' });
      }
      setWishlisted(!wishlisted);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <div
      onClick={onView}
      className="glass rounded-2xl overflow-hidden bg-black/40 border border-white/10 hover:border-primary/40 transition-all cursor-pointer group"
    >
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-blue-500/20 overflow-hidden">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`material-symbols-outlined text-6xl ${getCategoryColor(product.category).split(' ')[1]}`}>
              {getCategoryIcon(product.category)}
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-black/50 backdrop-blur-sm ${
            getCategoryColor(product.category).split(' ')[1]
          }`}>
            {product.category}
          </span>
        </div>
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 size-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:text-red-400 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">
            {wishlisted ? 'favorite' : 'favorite_border'}
          </span>
        </button>
        {isPurchased && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-signal-green/80 backdrop-blur-sm text-[10px] font-bold text-white uppercase">
            Comprado
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white uppercase text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="size-6 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
            {product.authorName?.charAt(0) || '?'}
          </div>
          <span className="text-xs text-gray-400">{product.authorName}</span>
        </div>

        {product.attributes && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.attributes.platform && (
              <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400">
                {product.attributes.platform}
              </span>
            )}
            {product.attributes.riskLevel && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                product.attributes.riskLevel === 'High' ? 'bg-red-500/20 text-red-400' :
                product.attributes.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {product.attributes.riskLevel}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
            <span className="text-sm font-bold text-white">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({product.ratingCount})</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-primary">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProductDetailModalProps {
  product: Product;
  isPurchased: boolean;
  onClose: () => void;
  onPurchase: (product: Product) => void;
  formatPrice: (price: number, currency: string) => string;
  getCategoryColor: (category: string) => string;
  usuario: Usuario | null;
  onVisitProfile?: (userId: string) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isPurchased,
  onClose,
  onPurchase,
  formatPrice,
  getCategoryColor,
  usuario,
  onVisitProfile,
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
          <h2 className="text-xl font-black text-white uppercase">{product.title}</h2>
          <button
            onClick={onClose}
            className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-blue-500/20">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-8xl text-primary">smart_toy</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                onClick={() => onVisitProfile?.(product.authorId)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="size-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                  {product.authorName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{product.authorName}</p>
                  <p className="text-xs text-gray-500">Vendedor</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`material-symbols-outlined text-lg ${
                      star <= product.rating ? 'text-amber-400' : 'text-gray-600'
                    }`}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-sm text-white">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({product.ratingCount} reseñas)</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="glass rounded-lg p-2 bg-white/5 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Ventas</p>
                <p className="font-bold text-white">{product.salesCount}</p>
              </div>
              <div className="glass rounded-lg p-2 bg-white/5 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Vistas</p>
                <p className="font-bold text-white">{product.views}</p>
              </div>
              <div className="glass rounded-lg p-2 bg-white/5 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Precio</p>
                <p className="font-bold text-primary">{formatPrice(product.price, product.currency)}</p>
              </div>
            </div>

            {isPurchased ? (
              <div className="w-full py-3 rounded-xl bg-signal-green text-white font-bold text-center">
                ✓ Ya tienes este producto
              </div>
            ) : (
              <button
                onClick={() => onPurchase(product)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                Comprar ahora - {formatPrice(product.price, product.currency)}
              </button>
            )}
          </div>
        </div>

        {product.attributes && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-white uppercase mb-3">Características</h3>
            <div className="grid grid-cols-2 gap-3">
              {product.attributes.platform && (
                <div className="glass rounded-lg p-3 bg-white/5">
                  <p className="text-[10px] text-gray-500 uppercase">Plataforma</p>
                  <p className="font-bold text-white">{product.attributes.platform}</p>
                </div>
              )}
              {product.attributes.riskLevel && (
                <div className="glass rounded-lg p-3 bg-white/5">
                  <p className="text-[10px] text-gray-500 uppercase">Nivel de Riesgo</p>
                  <p className={`font-bold ${
                    product.attributes.riskLevel === 'High' ? 'text-red-400' :
                    product.attributes.riskLevel === 'Medium' ? 'text-amber-400' :
                    'text-green-400'
                  }`}>
                    {product.attributes.riskLevel}
                  </p>
                </div>
              )}
              {product.attributes.pairs && product.attributes.pairs.length > 0 && (
                <div className="glass rounded-lg p-3 bg-white/5 col-span-2">
                  <p className="text-[10px] text-gray-500 uppercase">Pares</p>
                  <p className="font-bold text-white">{product.attributes.pairs.join(', ')}</p>
                </div>
              )}
              {product.attributes.timeframe && product.attributes.timeframe.length > 0 && (
                <div className="glass rounded-lg p-3 bg-white/5 col-span-2">
                  <p className="text-[10px] text-gray-500 uppercase">Timeframes</p>
                  <p className="font-bold text-white">{product.attributes.timeframe.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm font-bold text-white uppercase mb-3">Descripción</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {product.longDescription || product.description}
          </p>
        </div>

        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {product.mql5Url && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <a
              href={product.mql5Url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all"
            >
              <span className="material-symbols-outlined">open_in_new</span>
              Ver en MQL5
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductView;
