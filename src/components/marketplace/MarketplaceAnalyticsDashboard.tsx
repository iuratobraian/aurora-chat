import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Usuario } from '../../types';

interface MarketplaceAnalyticsDashboardProps {
  usuario: Usuario;
}

type Period = 'week' | 'month' | 'quarter' | 'year';
type Tab = 'overview' | 'products' | 'earnings' | 'sales';

export const MarketplaceAnalyticsDashboard: React.FC<MarketplaceAnalyticsDashboardProps> = ({ usuario }) => {
  const [period, setPeriod] = useState<Period>('month');
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const analytics = useQuery(api.marketplaceAnalytics.getSellerAnalytics, {
    sellerId: usuario.id,
    period,
  });

  const earnings = useQuery(api.marketplaceAnalytics.getSellerEarnings, {
    sellerId: usuario.id,
  });

  const products = useQuery(api.marketplaceAnalytics.getProductPerformance, {
    sellerId: usuario.id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num);
  };

  const periodLabel = period === 'week' ? 'Esta semana' : period === 'month' ? 'Este mes' : period === 'quarter' ? 'Este trimestre' : 'Este año';

  if (!analytics || !earnings || !products) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { overview, topProducts, revenueTrend, salesTrend, revenueByCategory, recentSales } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics del Marketplace</h2>
          <p className="text-gray-400 text-sm">Métricas de ventas para vendedores</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                period === p
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {p === 'week' ? '7D' : p === 'month' ? '30D' : p === 'quarter' ? '90D' : '1A'}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ingresos Totales"
          value={formatCurrency(overview.totalRevenue)}
          subtitle={`${periodLabel}: ${formatCurrency(overview.periodRevenue)}`}
          icon="payments"
          color="green"
        />
        <StatCard
          title="Ventas Totales"
          value={formatNumber(overview.totalSales)}
          subtitle={`${periodLabel}: ${formatNumber(overview.periodSales)}`}
          icon="shopping_cart"
          color="blue"
        />
        <StatCard
          title="Ticket Promedio"
          value={formatCurrency(overview.avgOrderValue)}
          subtitle={`${overview.totalProducts} productos`}
          icon="receipt_long"
          color="purple"
        />
        <StatCard
          title="Comisión Plataforma"
          value={formatCurrency(overview.totalPlatformFees)}
          subtitle="15% por venta"
          icon="account_balance"
          color="orange"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {([
          { id: 'overview' as Tab, label: 'Resumen', icon: 'dashboard' },
          { id: 'products' as Tab, label: 'Productos', icon: 'inventory_2' },
          { id: 'earnings' as Tab, label: 'Ganancias', icon: 'wallet' },
          { id: 'sales' as Tab, label: 'Ventas', icon: 'receipt' },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">trending_up</span>
              Ingresos por Día
            </h3>
            {revenueTrend.length > 0 ? (
              <div className="space-y-2">
                {revenueTrend.slice(-14).map((day) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20">{day.date.slice(5)}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (day.revenue / Math.max(...revenueTrend.map((d) => d.revenue))) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-white font-bold w-20 text-right">
                      {formatCurrency(day.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Sin datos de ingresos en este período</p>
            )}
          </div>

          {/* Top Products */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400">emoji_events</span>
              Top Productos
            </h3>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.slice(0, 8).map((product, idx) => (
                  <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                    <span className={`text-sm font-black w-6 text-center ${
                      idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-gray-600'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{product.category} • {product.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">{formatCurrency(product.revenue)}</p>
                      <p className="text-xs text-gray-500">{product.sales} ventas</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Sin ventas aún</p>
            )}
          </div>

          {/* Revenue by Category */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">category</span>
              Ingresos por Categoría
            </h3>
            {revenueByCategory.length > 0 ? (
              <div className="space-y-3">
                {revenueByCategory.map((cat) => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-24 capitalize">{cat.category}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-8 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500/80 to-purple-500 rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{
                          width: `${Math.min(100, (cat.revenue / Math.max(...revenueByCategory.map((c) => c.revenue))) * 100)}%`,
                        }}
                      >
                        <span className="text-xs font-bold text-white">
                          {formatCurrency(cat.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Sin datos por categoría</p>
            )}
          </div>

          {/* Sales Trend */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">bar_chart</span>
              Ventas por Día
            </h3>
            {salesTrend.length > 0 ? (
              <div className="space-y-2">
                {salesTrend.slice(-14).map((day) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20">{day.date.slice(5)}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500/80 to-blue-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (day.count / Math.max(...salesTrend.map((d) => d.count))) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-white font-bold w-12 text-right">
                      {day.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Sin datos de ventas en este período</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Rendimiento por Producto</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase">Producto</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase">Categoría</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-400 uppercase">Precio</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-400 uppercase">Ventas</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-400 uppercase">Ingresos</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-400 uppercase">Vistas</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-400 uppercase">Rating</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-sm font-bold text-white truncate max-w-[200px]">{product.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{product.type}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400 capitalize">{product.category}</td>
                    <td className="py-3 px-4 text-sm text-white text-right">{formatCurrency(product.price)}</td>
                    <td className="py-3 px-4 text-sm text-white text-right">{formatNumber(product.sales)}</td>
                    <td className="py-3 px-4 text-sm text-green-400 font-bold text-right">{formatCurrency(product.revenue)}</td>
                    <td className="py-3 px-4 text-sm text-gray-400 text-right">{formatNumber(product.views)}</td>
                    <td className="py-3 px-4 text-sm text-yellow-400 text-right">
                      {product.rating > 0 ? `⭐ ${product.rating.toFixed(1)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="space-y-6">
          {/* Earnings Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <EarningsCard label="Disponible" value={formatCurrency(earnings.available)} icon="account_balance_wallet" color="green" />
            <EarningsCard label="Pendiente" value={formatCurrency(earnings.pending)} icon="schedule" color="yellow" />
            <EarningsCard label="Reservado" value={formatCurrency(earnings.reserved)} icon="lock" color="orange" />
            <EarningsCard label="Pagado" value={formatCurrency(earnings.paid)} icon="check_circle" color="blue" />
          </div>

          {/* Payout History */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Historial de Pagos</h3>
            {earnings.payouts.length > 0 ? (
              <div className="space-y-3">
                {earnings.payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {payout.period || 'Retiro'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payout.paidAt ? new Date(payout.paidAt).toLocaleDateString('es-AR') : 'Pendiente'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">{formatCurrency(payout.netAmount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        payout.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                        payout.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        payout.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Sin historial de pagos</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Ventas Recientes</h3>
          {recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">
                      Venta #{sale.id.toString().slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sale.date ? new Date(sale.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Reciente'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">{formatCurrency(sale.amount)}</p>
                    <p className="text-xs text-gray-500">Tu ganancia: {formatCurrency(sale.authorEarnings)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Sin ventas recientes</p>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
}> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses: Record<string, string> = {
    green: 'from-green-500/20 to-green-500/5 text-green-400',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400',
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-400',
    yellow: 'from-yellow-500/20 to-yellow-500/5 text-yellow-400',
  };

  return (
    <div className="glass rounded-2xl p-5 bg-gradient-to-br from-white/5 to-transparent">
      <div className="flex items-start justify-between mb-3">
        <span className={`material-symbols-outlined text-2xl ${colorClasses[color]?.split(' ').pop()}`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  );
};

const EarningsCard: React.FC<{
  label: string;
  value: string;
  icon: string;
  color: string;
}> = ({ label, value, icon, color }) => {
  const colorClasses: Record<string, string> = {
    green: 'text-green-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    yellow: 'text-yellow-400',
  };

  return (
    <div className="glass rounded-xl p-4 bg-white/5">
      <div className="flex items-center gap-2 mb-2">
        <span className={`material-symbols-outlined text-lg ${colorClasses[color]}`}>{icon}</span>
        <span className="text-xs text-gray-400 uppercase font-bold">{label}</span>
      </div>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
};
