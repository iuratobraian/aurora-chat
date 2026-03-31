import React, { useState, useMemo } from 'react';
import { Usuario } from '../types';

interface PremiumObservatoryProps {
  usuario: Usuario | null;
  onLoginRequest?: () => void;
  onNavigate?: (tab: string) => void;
}

interface MetricCard {
  id: string;
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

interface AlertItem {
  id: string;
  type: 'opportunity' | 'warning' | 'success';
  title: string;
  description: string;
  action?: string;
}

const initialMetrics: MetricCard[] = [
  { id: 'members', label: 'Miembros Totales', value: 1247, change: 12.5, trend: 'up', icon: 'groups', color: 'emerald' },
  { id: 'revenue', label: 'Ingresos Mensuales', value: '$8,432', change: 8.3, trend: 'up', icon: 'payments', color: 'amber' },
  { id: 'engagement', label: 'Engagement Rate', value: '67%', change: -2.1, trend: 'down', icon: 'trending_up', color: 'blue' },
  { id: 'retention', label: 'Retención 30d', value: '84%', change: 1.4, trend: 'up', icon: 'autorenew', color: 'purple' },
  { id: 'churn', label: 'Churn Rate', value: '3.2%', change: -0.8, trend: 'up', icon: 'Person_remove', color: 'red' },
  { id: 'arpu', label: 'ARPU', value: '$6.76', change: 5.2, trend: 'up', icon: 'attach_money', color: 'cyan' },
];

const initialAlerts: AlertItem[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Peak Engagement Window',
    description: 'Tus miembros están más activos entre 18:00-21:00 UTC. Considera programar contenido premium en este horario.',
    action: 'Programar Ahora'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Churn Risk: 23 miembros',
    description: '23 miembros no han interactuado en 14+ días. Implementa una estrategia de re-engagement.',
    action: 'Ver Miembros'
  },
  {
    id: '3',
    type: 'success',
    title: 'Récord de Ingresos',
    description: 'Superaste tu meta de $8,000 este mes. Tu comunidad está creciendo saludablemente.',
  },
];

const marketSignals = [
  { pair: 'EUR/USD', sentiment: 'bullish', strength: 78, news: 'ECB mantiene tasas' },
  { pair: 'GBP/USD', sentiment: 'neutral', strength: 52, news: 'Brexit news mixed' },
  { pair: 'USD/JPY', sentiment: 'bearish', strength: 65, news: 'BOJ intervention' },
  { pair: 'BTC/USD', sentiment: 'bullish', strength: 82, news: 'ETF inflows surge' },
  { pair: 'ETH/USD', sentiment: 'bullish', strength: 75, news: 'Network upgrade' },
];

const growthOpportunities = [
  { title: 'Optimizar Precio', description: 'Tu ARPU está 15% debajo del benchmark', potential: '+$1,200/mes', action: 'Ajustar' },
  { title: 'Cross-sell SignalRoom', description: '12% de miembros podrían升级 a SignalRoom', potential: '+$420/mes', action: 'Promover' },
  { title: 'Referral Boost', description: 'Solo 4% usa tu código de referido', potential: '+$800/mes', action: 'Activar' },
  { title: 'Content Calendar', description: 'Publicaciones en horarios peak generan 2x engagement', potential: '+15% retention', action: 'Verificar' },
];

const CommunityCreatorSuite: React.FC<PremiumObservatoryProps> = ({ usuario, onLoginRequest, onNavigate }) => {
  const [metrics] = useState<MetricCard[]>(initialMetrics);
  const [alerts] = useState<AlertItem[]>(initialAlerts);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'opportunities'>('overview');

  const colorClasses = {
    emerald: { bg: 'from-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'bg-emerald-500/20' },
    amber: { bg: 'from-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'bg-amber-500/20' },
    blue: { bg: 'from-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'bg-blue-500/20' },
    purple: { bg: 'from-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: 'bg-purple-500/20' },
    red: { bg: 'from-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'bg-red-500/20' },
    cyan: { bg: 'from-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', icon: 'bg-cyan-500/20' },
  };

  const sentimentColors = {
    bullish: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    bearish: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
    neutral: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', dot: 'bg-gray-400' },
  };

  const alertColors = {
    opportunity: { bg: 'from-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'bg-cyan-500/20', iconName: 'auto_awesome' },
    warning: { bg: 'from-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'bg-amber-500/20', iconName: 'warning' },
    success: { bg: 'from-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'bg-emerald-500/20', iconName: 'check_circle' },
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass rounded-3xl p-8 mb-8 border border-white/10 bg-gradient-to-br from-[#131313] to-[#1a1a1a]/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-violet-400">radar</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                Premium Observatory
                <span className="px-2 py-0.5 bg-violet-500/20 border border-violet-500/30 rounded-full text-[10px] font-black text-violet-400 uppercase">Creator</span>
              </h1>
              <p className="text-sm text-gray-500 font-medium">Análisis de inteligencia para tu comunidad de trading</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
              {(['7d', '30d', '90d'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedTimeframe === tf 
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="size-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00e676]" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-white/5 pb-4">
          {[
            { id: 'overview', label: 'Overview', icon: 'dashboard' },
            { id: 'signals', label: 'Market Signals', icon: 'show_chart' },
            { id: 'opportunities', label: 'Opportunities', icon: 'lightbulb' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {metrics.map(metric => {
              const colors = colorClasses[metric.color as keyof typeof colorClasses];
              return (
                <div
                  key={metric.id}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${colors.bg} to-transparent border ${colors.border} backdrop-blur-xl hover:scale-[1.02] transition-all cursor-pointer group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`size-10 rounded-xl ${colors.icon} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined text-lg">{metric.icon}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold ${
                      metric.trend === 'up' ? 'text-emerald-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {metric.trend === 'up' ? 'arrow_drop_up' : metric.trend === 'down' ? 'arrow_drop_down' : 'remove'}
                      </span>
                      {Math.abs(metric.change)}%
                    </div>
                  </div>
                  <h3 className={`text-2xl font-black ${colors.text} mb-1`}>{metric.value}</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{metric.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-[#131313] to-[#1a1a1a]/50 border border-white/10 p-6 backdrop-blur-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-violet-400">insights</span>
                Tendencia de Crecimiento
              </h3>
              <div className="h-48 flex items-end gap-2">
                {[65, 72, 68, 78, 85, 82, 90, 88, 95, 92, 98, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col justify-end h-36 group">
                      <div 
                        className="w-full bg-gradient-to-t from-violet-600 to-violet-400/50 rounded-t-lg transition-all hover:from-violet-500 hover:to-violet-300/60"
                        style={{ height: `${h}%` }}
                      />
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute mt-2 px-2 py-1 bg-black/90 rounded text-[10px] text-white font-bold">
                        {h}%
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold">
                      {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#131313] to-[#1a1a1a]/50 border border-white/10 p-6 backdrop-blur-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">campaign</span>
                Alertas Inteligentes
              </h3>
              <div className="space-y-3">
                {alerts.map(alert => {
                  const colors = alertColors[alert.type as keyof typeof alertColors];
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl ${colors.bg} border ${colors.border} backdrop-blur-xl`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`size-8 rounded-lg ${colors.icon} flex items-center justify-center flex-shrink-0`}>
                          <span className="material-symbols-outlined text-sm">{colors.iconName}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-bold ${colors.text} mb-1`}>{alert.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{alert.description}</p>
                          {alert.action && (
                            <button className={`text-[10px] font-black uppercase tracking-widest ${colors.text} hover:underline`}>
                              {alert.action} →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-[#131313] to-[#1a1a1a]/50 border border-white/10 p-6 backdrop-blur-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">pie_chart</span>
                Distribución de Miembros
              </h3>
              <div className="flex items-center gap-8">
                <div className="relative size-32">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="62 38" className="text-emerald-500" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="-62" className="text-violet-500" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="10 90" strokeDashoffset="-87" className="text-amber-500" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">1,247</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total</span>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  {[
                    { label: 'Activos', value: 62, color: 'bg-emerald-500' },
                    { label: 'Engaged', value: 25, color: 'bg-violet-500' },
                    { label: 'At Risk', value: 10, color: 'bg-amber-500' },
                    { label: 'Churned', value: 3, color: 'bg-red-500' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`size-2 rounded-full ${item.color}`} />
                      <span className="text-xs text-gray-400 flex-1">{item.label}</span>
                      <span className="text-xs font-bold text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#131313] to-[#1a1a1a]/50 border border-white/10 p-6 backdrop-blur-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">schedule</span>
                Mejores Horarios de Actividad
              </h3>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                  <div key={d} className="text-center text-[10px] text-gray-500 font-bold">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }).map((_, i) => {
                  const intensity = Math.random();
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg transition-all hover:scale-110 ${
                        intensity > 0.7 ? 'bg-emerald-500/50 border border-emerald-500/30' :
                        intensity > 0.4 ? 'bg-emerald-500/20 border border-emerald-500/10' :
                        'bg-white/5 border border-white/5'
                      }`}
                      title={`Intensidad: ${Math.round(intensity * 100)}%`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-4 text-[10px] text-gray-500">
                <span>Menos activo</span>
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded bg-white/5" />
                  <div className="size-2 rounded bg-emerald-500/20" />
                  <div className="size-2 rounded bg-emerald-500/50" />
                </div>
                <span>Más activo</span>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'signals' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-[#131313] to-[#1a1a1a]/50 border border-white/10 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">currency_bitcoin</span>
              Market Intelligence - Tu Comunidad
            </h3>
            <div className="space-y-3">
              {marketSignals.map(signal => {
                const colors = sentimentColors[signal.sentiment as keyof typeof sentimentColors];
                return (
                  <div
                    key={signal.pair}
                    className={`p-4 rounded-xl ${colors.bg} border ${colors.border} backdrop-blur-xl hover:scale-[1.01] transition-all cursor-pointer`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`size-3 rounded-full ${colors.dot} ${signal.sentiment === 'bullish' ? 'animate-pulse' : ''}`} />
                        <div>
                          <h4 className="text-lg font-black text-white">{signal.pair}</h4>
                          <p className="text-xs text-gray-500">{signal.news}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-500 uppercase">Signal</span>
                          <span className={`text-lg font-black ${colors.text}`}>{signal.strength}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden w-24">
                          <div 
                            className={`h-full ${colors.dot} rounded-full transition-all`}
                            style={{ width: `${signal.strength}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-2xl text-emerald-400">trending_up</span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Sentimiento Bull</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">3 pares con momentum positivo fuerte. Ideal para contenido educativo bullish.</p>
              <div className="text-2xl font-black text-emerald-400">73%</div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">de señales</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-2xl text-amber-400">psychology</span>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Volatilidad</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">Alta volatilidad en JPY. Oportunidad para contenido de gestión de riesgo.</p>
              <div className="text-2xl font-black text-amber-400">Elevada</div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">nivel actual</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-2xl text-violet-400">auto_graph</span>
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Best Topic</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">Crypto content genera 2.4x más engagement que forex.</p>
              <div className="text-2xl font-black text-violet-400">BTC/ETH</div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">recomendado</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {growthOpportunities.map((opp, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-gradient-to-br from-[#131313] to-[#1a1a1a]/50 border border-white/10 backdrop-blur-xl hover:border-violet-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="size-12 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                    <span className="material-symbols-outlined text-xl text-violet-400">
                      {i === 0 ? 'tune' : i === 1 ? 'upgrade' : i === 2 ? 'group_add' : 'calendar_month'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-400">{opp.potential}</div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Potential</p>
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-2">{opp.title}</h4>
                <p className="text-sm text-gray-500 mb-4">{opp.description}</p>
                <button className="w-full py-3 bg-violet-500/10 border border-violet-500/30 rounded-xl text-xs font-bold text-violet-400 uppercase tracking-widest hover:bg-violet-500/20 transition-all">
                  {opp.action}
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#131313] to-[#1a1a1a]/50 border border-white/10 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-violet-400">compare</span>
              Benchmark vs Comunidades Similares
            </h3>
            <div className="space-y-4">
              {[
                { label: 'ARPU', your: 6.76, benchmark: 8.24 },
                { label: 'Retención 30d', your: 84, benchmark: 79 },
                { label: 'Engagement Rate', your: 67, benchmark: 58 },
                { label: 'Churn Rate', your: 3.2, benchmark: 4.1 },
                { label: 'Posts/Miembro/Mes', your: 4.2, benchmark: 3.8 },
              ].map(metric => (
                <div key={metric.label} className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 w-40 text-right">{metric.label}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-600 to-violet-400/50 rounded-lg flex items-center justify-end pr-2"
                        style={{ width: `${Math.min(100, (metric.your / metric.benchmark) * 50)}%` }}
                      >
                        <span className="text-[10px] font-black text-white">{metric.your}</span>
                      </div>
                    </div>
                    <div className="size-6 rounded bg-violet-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xs text-violet-400">arrow_forward</span>
                    </div>
                    <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-gray-600 to-gray-500/50 rounded-lg flex items-center justify-start pl-2"
                        style={{ width: '50%' }}
                      >
                        <span className="text-[10px] font-black text-gray-400">{metric.benchmark}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityCreatorSuite;
