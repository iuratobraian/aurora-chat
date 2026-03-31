import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface Product {
  _id: any;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  images: string[];
  rating: number;
  ratingCount: number;
  salesCount: number;
  views: number;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  mql5Id?: string;
  mql5Url?: string;
  createdAt: number;
}

interface ProductManagementProps {
  showToast?: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ showToast }) => {
  const products = useQuery(api.products.getAllProductsAdmin) || [];
  const stats = useQuery(api.products.getProductStats);

  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);
  const publishProduct = useMutation(api.products.publishProduct);
  const toggleFeatured = useMutation(api.products.toggleFeatured);
  const importFromMQL5 = useMutation(api.products.importFromMQL5);
  const seedMQL5EAs = useMutation(api.seedProducts.seedMQL5EAs);
  const seedSampleProducts = useMutation(api.seedProducts.seedSampleProducts);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [importForm, setImportForm] = useState({
    mql5Id: '',
    mql5Url: '',
    title: '',
    description: '',
    price: 0,
    currency: 'USD',
    platform: 'MT5',
    tags: '',
    imageUrl: '',
  });

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSeedMQL5 = async () => {
    try {
      setSeeding(true);
      const result = await seedMQL5EAs({});
      showToast?.('success', `¡${result.seeded} EAs de MQL5 importados!`);
    } catch (error: any) {
      showToast?.('error', error.message || 'Error al importar EAs');
    } finally {
      setSeeding(false);
    }
  };

  const handleSeedSample = async () => {
    try {
      setSeeding(true);
      const result = await seedSampleProducts({});
      showToast?.('success', `¡${result.seeded} productos de ejemplo creados!`);
    } catch (error: any) {
      showToast?.('error', error.message || 'Error al crear productos');
    } finally {
      setSeeding(false);
    }
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      await publishProduct({ productId: product._id, publish: !product.isPublished });
      showToast?.('success', product.isPublished ? 'Producto ocultado' : 'Producto publicado');
    } catch (error) {
      showToast?.('error', 'Error al actualizar');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      await toggleFeatured({ productId: product._id, featured: !product.isFeatured });
      showToast?.('success', product.isFeatured ? 'Quitado de destacados' : 'Agregado a destacados');
    } catch (error) {
      showToast?.('error', 'Error al actualizar');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await deleteProduct({ productId: product._id });
      showToast?.('success', 'Producto eliminado');
    } catch (error) {
      showToast?.('error', 'Error al eliminar');
    }
  };

  const handleImport = async () => {
    try {
      const images = importForm.imageUrl ? [importForm.imageUrl] : [];
      await importFromMQL5({
        authorId: 'system',
        authorName: 'TradeShare',
        mql5Id: importForm.mql5Id,
        mql5Url: importForm.mql5Url,
        title: importForm.title,
        description: importForm.description,
        images,
        price: importForm.price,
        currency: importForm.currency as any,
        platform: importForm.platform,
        pairs: [],
        timeframe: [],
        riskLevel: 'Medium',
        tags: importForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      showToast?.('success', 'EA importado exitosamente');
      setShowImportModal(false);
      setImportForm({ mql5Id: '', mql5Url: '', title: '', description: '', price: 0, currency: 'USD', platform: 'MT5', tags: '', imageUrl: '' });
    } catch (error: any) {
      showToast?.('error', error.message || 'Error al importar');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'XP') return `${price} XP`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 
            className="text-2xl font-black uppercase"
            style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}
          >
            Gestión de Productos
          </h2>
          <p className="text-sm" style={{ color: '#86868B' }}>EAs, Indicadores, Templates y más</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSeedMQL5}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(249, 115, 22, 0.2))',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              color: '#fbbf24',
            }}
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            {seeding ? 'Importando...' : 'Seed EAs MQL5'}
          </button>
          <button
            onClick={handleSeedSample}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(236, 72, 153, 0.2))',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              color: '#a78bfa',
            }}
          >
            <span className="material-symbols-outlined">inventory_2</span>
            Seed Productos
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(160, 120, 255, 0.3)',
            }}
          >
            <span className="material-symbols-outlined">download</span>
            Importar Manual
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats?.totalProducts || 0, color: '#e5e2e1' },
          { label: 'Publicados', value: stats?.publishedProducts || 0, color: '#00e676' },
          { label: 'Ventas', value: stats?.totalSales || 0, color: '#d0bcff' },
          { label: 'Ingresos', value: `$${(stats?.totalRevenue || 0).toFixed(0)}`, color: '#fbbf24' },
        ].map((stat, i) => (
          <div 
            key={i}
            className="rounded-xl p-4"
            style={{
              background: 'rgba(32, 31, 31, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(73, 68, 84, 0.15)',
            }}
          >
            <p className="text-xs uppercase" style={{ color: '#86868B' }}>{stat.label}</p>
            <p className="text-2xl font-black" style={{ color: stat.color, fontFamily: '"Space Grotesk", sans-serif' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#86868B' }}>search</span>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl outline-none"
              style={{
                background: 'rgba(19, 19, 19, 0.6)',
                border: '1px solid rgba(73, 68, 84, 0.2)',
                color: '#e5e2e1',
              }}
            />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-xl outline-none cursor-pointer"
          style={{
            background: 'rgba(19, 19, 19, 0.6)',
            border: '1px solid rgba(73, 68, 84, 0.2)',
            color: '#e5e2e1',
          }}
        >
          <option value="all">Todas las categorías</option>
          <option value="ea">Expert Advisors</option>
          <option value="indicator">Indicadores</option>
          <option value="template">Templates</option>
          <option value="course">Cursos</option>
          <option value="signal">Señales</option>
          <option value="vps">VPS</option>
          <option value="tool">Herramientas</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(73, 68, 84, 0.15)' }}>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase" style={{ color: '#86868B' }}>Producto</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase" style={{ color: '#86868B' }}>Categoría</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase" style={{ color: '#86868B' }}>Precio</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase" style={{ color: '#86868B' }}>Ventas</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase" style={{ color: '#86868B' }}>Fecha</th>
              <th className="text-left px-4 py-3 text-xs font-bold uppercase" style={{ color: '#86868B' }}>Estado</th>
              <th className="text-right px-4 py-3 text-xs font-bold uppercase" style={{ color: '#86868B' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product: Product) => (
              <tr key={product._id} className="transition-colors" style={{ borderBottom: '1px solid rgba(73, 68, 84, 0.1)' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-10 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, rgba(160, 120, 255, 0.2), rgba(96, 165, 250, 0.2))' }}
                    >
                      {product.images[0] ? (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined" style={{ color: '#d0bcff' }}>shopping_cart</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#e5e2e1' }}>{product.title}</p>
                      <p className="text-xs" style={{ color: '#86868B' }}>{product.authorName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold uppercase" style={{ background: 'rgba(19, 19, 19, 0.6)', color: '#86868B' }}>
                    {product.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold" style={{ color: '#d0bcff' }}>{formatPrice(product.price, product.currency)}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: '#e5e2e1' }}>{product.salesCount}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs" style={{ color: '#86868B' }}>{formatDate(product.createdAt)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span 
                      className="px-2 py-1 rounded text-[10px] font-bold uppercase w-fit"
                      style={product.isPublished 
                        ? { background: 'rgba(0, 230, 118, 0.2)', color: '#00e676' } 
                        : { background: 'rgba(134, 134, 139, 0.2)', color: '#86868B' }
                      }
                    >
                      {product.isPublished ? 'Publicado' : 'Borrador'}
                    </span>
                    {product.isFeatured && (
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase w-fit" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>
                        ⭐ Destacado
                      </span>
                    )}
                    {product.mql5Id && (
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase w-fit" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                        MQL5
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleTogglePublish(product)}
                      className="size-8 rounded-lg flex items-center justify-center transition-colors"
                      style={product.isPublished
                        ? { background: 'rgba(134, 134, 139, 0.2)', color: '#86868B' }
                        : { background: 'rgba(0, 230, 118, 0.2)', color: '#00e676' }
                      }
                      title={product.isPublished ? 'Ocultar' : 'Publicar'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {product.isPublished ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(product)}
                      className="size-8 rounded-lg flex items-center justify-center transition-colors"
                      style={product.isFeatured
                        ? { background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }
                        : { background: 'rgba(134, 134, 139, 0.2)', color: '#86868B' }
                      }
                      title={product.isFeatured ? 'Quitar de destacados' : 'Marcar como destacado'}
                    >
                      <span className="material-symbols-outlined text-lg">star</span>
                    </button>
                    {product.mql5Url && (
                      <a
                        href={product.mql5Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }}
                        title="Ver en MQL5"
                      >
                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(product)}
                      className="size-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(248, 113, 113, 0.2)', color: '#f87171' }}
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">inventory_2</span>
            <h3 className="text-xl font-bold text-white mb-2">No hay productos</h3>
            <p className="text-gray-500">Los productos aparecerán aquí cuando se creen</p>
          </div>
        )}
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
          <div 
            className="rounded-2xl p-6 max-w-lg w-full"
            style={{
              background: 'rgba(32, 31, 31, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(73, 68, 84, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 
                className="text-xl font-black uppercase"
                style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#e5e2e1' }}
              >
                Importar de MQL5
              </h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="size-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(19, 19, 19, 0.6)', color: '#86868B' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase font-bold block mb-2" style={{ color: '#86868B' }}>ID de MQL5</label>
                <input
                  type="text"
                  value={importForm.mql5Id}
                  onChange={(e) => setImportForm(prev => ({ ...prev, mql5Id: e.target.value }))}
                  placeholder="70796"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{
                    background: 'rgba(19, 19, 19, 0.6)',
                    border: '1px solid rgba(73, 68, 84, 0.2)',
                    color: '#e5e2e1',
                  }}
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold block mb-2" style={{ color: '#86868B' }}>URL de MQL5</label>
                <input
                  type="text"
                  value={importForm.mql5Url}
                  onChange={(e) => setImportForm(prev => ({ ...prev, mql5Url: e.target.value }))}
                  placeholder="https://www.mql5.com/en/code/70796"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{
                    background: 'rgba(19, 19, 19, 0.6)',
                    border: '1px solid rgba(73, 68, 84, 0.2)',
                    color: '#e5e2e1',
                  }}
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold block mb-2" style={{ color: '#86868B' }}>Título</label>
                <input
                  type="text"
                  value={importForm.title}
                  onChange={(e) => setImportForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nombre del EA"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{
                    background: 'rgba(19, 19, 19, 0.6)',
                    border: '1px solid rgba(73, 68, 84, 0.2)',
                    color: '#e5e2e1',
                  }}
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold block mb-2" style={{ color: '#86868B' }}>Descripción</label>
                <textarea
                  value={importForm.description}
                  onChange={(e) => setImportForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del producto..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                  style={{
                    background: 'rgba(19, 19, 19, 0.6)',
                    border: '1px solid rgba(73, 68, 84, 0.2)',
                    color: '#e5e2e1',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase font-bold block mb-2" style={{ color: '#86868B' }}>Precio (USD)</label>
                  <input
                    type="number"
                    value={importForm.price}
                    onChange={(e) => setImportForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{
                      background: 'rgba(19, 19, 19, 0.6)',
                      border: '1px solid rgba(73, 68, 84, 0.2)',
                      color: '#e5e2e1',
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-bold block mb-2" style={{ color: '#86868B' }}>Plataforma</label>
                  <select
                    value={importForm.platform}
                    onChange={(e) => setImportForm(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl outline-none cursor-pointer"
                    style={{
                      background: 'rgba(19, 19, 19, 0.6)',
                      border: '1px solid rgba(73, 68, 84, 0.2)',
                      color: '#e5e2e1',
                    }}
                  >
                    <option value="MT4">MT4</option>
                    <option value="MT5">MT5</option>
                    <option value="Both">Ambos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-bold block mb-2" style={{ color: '#86868B' }}>Tags (separados por coma)</label>
                <input
                  type="text"
                  value={importForm.tags}
                  onChange={(e) => setImportForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="scalping, gold, trending"
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{
                    background: 'rgba(19, 19, 19, 0.6)',
                    border: '1px solid rgba(73, 68, 84, 0.2)',
                    color: '#e5e2e1',
                  }}
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold block mb-2" style={{ color: '#86868B' }}>URL de Imagen</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={importForm.imageUrl}
                    onChange={(e) => setImportForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/imagen.jpg"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary outline-none"
                  />
                  {importForm.imageUrl && (
                    <div className="size-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                      <img src={importForm.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Pega la URL de una imagen para el producto</p>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
