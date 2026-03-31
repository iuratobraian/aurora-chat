import React, { useState, useEffect, useMemo } from 'react';
import { PlatformAnalyticsService, DAUMAUMetrics, EngagementRate, PlatformConversionFunnel } from '../services/analytics/platformAnalytics';
import { Usuario } from '../types';

interface AnalyticsDashboardProps {
  usuario: Usuario | null;
  onNavigate?: (tab: string) => void;
}

type AnalyticsSection = 'overview' | 'engagement' | 'retention' | 'funnel' | 'realtime';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: number;
  color: 'emerald' | 'blue' | 'purple' | 'orange' | 'pink';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon, trend, color }) => {
  const colors = {
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400',
    orange: 'from-orange-500/10 to-transparent border-orange-500/20 text-orange-400',
    pink: 'from-pink-500/10 to-transparent border-pink-500/20 text-pink-400',
  };

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-center justify-between mb-4">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
        {trend !== undefined && (
          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
            trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-3xl font-black text-white">{value}</h3>
      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{title}</p>
      {subtitle && <p className="text-[10px] text-gray-600 mt-1">{subtitle}</p>}
    </div>
  );
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ usuario, onNavigate }) => {
  const [activeSection, setActiveSection] = useState<AnalyticsSection>('overview');
  const [dauMau, setDauMau] = useState<DAUMAUMetrics | null>(null);
  const [engagementRates, setEngagementRates] = useState<EngagementRate[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<PlatformConversionFunnel | null>(null);
  const [retentionRates, setRetentionRates] = useState({ d1: 0, d7: 0, d30: 0 });
  const [activeUsersRealTime, setActiveUsersRealTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const totalUsers = 10000;
        const dauMauData = PlatformAnalyticsService.getDAUMAU(totalUsers);
        const engagementData = PlatformAnalyticsService.getEngagementRates();
        const funnelData = PlatformAnalyticsService.getConversionFunnel(totalUsers);
        const retentionData = PlatformAnalyticsService.getRetentionRates();

        setDauMau(dauMauData);
        setEngagementRates(engagementData);
        setConversionFunnel(funnelData);
        setRetentionRates(retentionData);
        setActiveUsersRealTime(PlatformAnalyticsService.getActiveUsersToday());
      } catch (error) {
        console.error('[AnalyticsDashboard] Failed to load analytics:', error);
      }
      setIsLoading(false);
    };

    loadAnalytics();
    
    const interval = setInterval(() => {
      setActiveUsersRealTime(prev => prev + Math.floor(Math.random() * 10 - 5));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'engagement', label: 'Engagement', icon: 'favorite' },
    { id: 'retention', label: 'Retención', icon: 'autorenew' },
    { id: 'funnel', label: 'Embudo', icon: 'filter_alt' },
    { id: 'realtime', label: 'Tiempo Real', icon: 'speed' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="DAU"
          value={activeUsersRealTime}
          subtitle="Daily Active Users"
          icon="person"
          trend={12}
          color="emerald"
        />
        <MetricCard
          title="MAU"
          value={dauMau?.mau || 0}
          subtitle="Monthly Active Users"
          icon="groups"
          trend={8}
          color="blue"
        />
        <MetricCard
          title="DAU/MAU"
          value={`${dauMau?.ratio || 0}%`}
          subtitle="Engagement Ratio"
          icon="trending_up"
          trend={5}
          color="purple"
        />
        <MetricCard
          title="Engagement"
          value={`${engagementRates[0]?.rate || 0}%`}
          subtitle="Avg. Rate"
          icon="favorite"
          trend={15}
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">DAU/MAU Trend (30 días)</h3>
          <div className="h-48 flex items-end gap-2">
            {[40, 55, 45, 60, 50, 70, 65, 80, 75, 90, 85, 100, 95, 88, 92, 98, 94, 89, 96, 99, 95, 97, 100, 98, 96, 99, 97, 95, 98, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-36">
                  <div 
                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${h}%` }}
                  />
                </div>
                {i % 7 === 0 && (
                  <span className="text-[10px] text-gray-500 font-bold">
                    {['Ene', 'Feb', 'Mar', 'Abr', 'May'].includes(['Ene', 'Feb', 'Mar', 'Abr', 'May'][Math.floor(i / 7)]) 
                      ? ['Ene', 'Feb', 'Mar', 'Abr', 'May'][Math.floor(i / 7)] 
                      : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Engagement Overview</h3>
          <div className="space-y-4">
            {engagementRates.slice(0, 5).map((metric, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-20">{metric.type}</span>
                  <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      style={{ width: `${Math.min(100, metric.rate * 5)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-black text-white">{metric.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Métricas Clave</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <p className="text-2xl font-black text-emerald-400">{retentionRates.d1}%</p>
            <p className="text-[10px] text-gray-500 uppercase mt-1">D1 Retention</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <p className="text-2xl font-black text-blue-400">{retentionRates.d7}%</p>
            <p className="text-[10px] text-gray-500 uppercase mt-1">D7 Retention</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <p className="text-2xl font-black text-purple-400">{retentionRates.d30}%</p>
            <p className="text-[10px] text-gray-500 uppercase mt-1">D30 Retention</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <p className="text-2xl font-black text-orange-400">{conversionFunnel?.overallConversion || 0}%</p>
            <p className="text-[10px] text-gray-500 uppercase mt-1">Conversion</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEngagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Posts" value={156} subtitle="Esta semana" icon="article" trend={18} color="blue" />
        <MetricCard title="Comentarios" value={892} subtitle="Esta semana" icon="chat" trend={12} color="purple" />
        <MetricCard title="Likes" value={3420} subtitle="Esta semana" icon="thumb_up" trend={25} color="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Engagement por Tipo</h3>
          <div className="space-y-4">
            {engagementRates.map((metric, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-white">{metric.type}</span>
                  <span className="text-sm font-black text-emerald-400">{metric.rate}%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      i === 0 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' :
                      i === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      i === 2 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                      'bg-gradient-to-r from-orange-500 to-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, metric.rate * 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Engagement Timeline</h3>
          <div className="h-48 flex items-end gap-1">
            {[65, 72, 68, 78, 82, 75, 88, 92, 85, 95, 88, 98, 92, 96, 100, 94, 97, 99, 95, 98, 100, 96, 99, 97, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-emerald-500/20 rounded-t hover:bg-emerald-500/40 transition-all">
                <div 
                  className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-500">
            <span>Hace 25 días</span>
            <span>Hoy</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRetention = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-4">D1 Retention</h3>
          <div className="relative h-48 flex items-center justify-center">
            <svg className="size-32 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
              <circle 
                cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" 
                strokeDasharray={`${retentionRates.d1} 100`} 
                className="text-emerald-500 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{retentionRates.d1}%</span>
              <span className="text-[10px] text-gray-500 uppercase">Día 1</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">Usuarios activos al día siguiente</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
          <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-4">D7 Retention</h3>
          <div className="relative h-48 flex items-center justify-center">
            <svg className="size-32 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
              <circle 
                cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" 
                strokeDasharray={`${retentionRates.d7} 100`} 
                className="text-blue-500 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{retentionRates.d7}%</span>
              <span className="text-[10px] text-gray-500 uppercase">Día 7</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">Usuarios activos después de 7 días</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
          <h3 className="text-sm font-black uppercase tracking-widest text-purple-400 mb-4">D30 Retention</h3>
          <div className="relative h-48 flex items-center justify-center">
            <svg className="size-32 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
              <circle 
                cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" 
                strokeDasharray={`${retentionRates.d30} 100`} 
                className="text-purple-500 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{retentionRates.d30}%</span>
              <span className="text-[10px] text-gray-500 uppercase">Día 30</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">Usuarios activos después de 30 días</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Curva de Retención</h3>
        <div className="h-64 flex items-end gap-4">
          {['D1', 'D3', 'D7', 'D14', 'D21', 'D30'].map((day, i) => {
            const values = [100, 65, 45, 35, 28, 22];
            const heights = [100, 65, 45, 35, 28, 22];
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-48">
                  <div 
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${heights[i]}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-purple-400">{day}</span>
                <span className="text-xs text-gray-500">{values[i]}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderFunnel = () => (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Embudo de Conversión</h3>
        <div className="space-y-4">
          {[
            { label: 'Vistas', value: conversionFunnel?.views || 0, width: 100, color: 'from-blue-500 to-blue-400' },
            { label: 'Visitas', value: conversionFunnel?.visits || 0, width: conversionFunnel?.viewsToVisit || 50, color: 'from-cyan-500 to-cyan-400' },
            { label: 'Registros', value: conversionFunnel?.registrations || 0, width: conversionFunnel?.visitToRegistration || 40, color: 'from-purple-500 to-purple-400' },
            { label: 'Activaciones', value: conversionFunnel?.joins || 0, width: conversionFunnel?.registrationToActivation || 30, color: 'from-emerald-500 to-emerald-400' },
            { label: 'Engagement', value: Math.round((conversionFunnel?.views || 0) * (conversionFunnel?.overallConversion || 0) / 100), width: conversionFunnel?.overallConversion || 10, color: 'from-orange-500 to-orange-400' },
          ].map((step, idx) => (
            <div key={idx} className="relative">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{step.label}</span>
                <span className="font-black text-white">{step.value.toLocaleString()}</span>
              </div>
              <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${step.color} rounded-lg transition-all duration-500 flex items-center justify-end pr-3`}
                  style={{ width: `${Math.min(100, step.width)}%` }}
                >
                  <span className="text-[10px] font-black text-white">{step.width.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Métricas del Embudo</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-xs text-gray-400">Vista → Visita</span>
              <span className="text-sm font-black text-blue-400">{conversionFunnel?.viewsToVisit || 0}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-xs text-gray-400">Visita → Registro</span>
              <span className="text-sm font-black text-cyan-400">{conversionFunnel?.visitToRegistration || 0}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-xs text-gray-400">Registro → Activación</span>
              <span className="text-sm font-black text-purple-400">{conversionFunnel?.registrationToActivation || 0}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
              <span className="text-xs text-gray-400">Activación → Engagement</span>
              <span className="text-sm font-black text-emerald-400">{conversionFunnel?.activationToEngagement || 0}%</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Conversión General</h3>
          <div className="flex items-center justify-center h-40">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border-4 border-dashed border-white/10" />
              </div>
              <svg className="size-40 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
                <circle 
                  cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" 
                  strokeDasharray={`${conversionFunnel?.overallConversion || 0} 100`} 
                  className="text-orange-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{conversionFunnel?.overallConversion || 0}%</span>
                <span className="text-[10px] text-gray-500 uppercase">Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRealtime = () => (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black uppercase tracking-widest text-white">Usuarios Activos Ahora</h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400 font-bold">EN VIVO</span>
          </div>
        </div>
        <div className="flex items-end gap-4 mb-4">
          <span className="text-6xl font-black text-white">{activeUsersRealTime}</span>
          <span className="text-lg text-gray-500 mb-2">usuarios</span>
        </div>
        <div className="h-32 flex items-end gap-1">
          {Array.from({ length: 60 }, (_, i) => (
            <div 
              key={i} 
              className="flex-1 bg-emerald-500/40 rounded-t"
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h4 className="text-xs font-black uppercase text-gray-500 mb-4">Dispositivos</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">smartphone</span>
                <span className="text-xs text-gray-400">Mobile</span>
              </div>
              <span className="text-sm font-black text-white">62%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400">computer</span>
                <span className="text-xs text-gray-400">Desktop</span>
              </div>
              <span className="text-sm font-black text-white">35%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400">tablet</span>
                <span className="text-xs text-gray-400">Tablet</span>
              </div>
              <span className="text-sm font-black text-white">3%</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h4 className="text-xs font-black uppercase text-gray-500 mb-4">Geografía</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Latinoamérica</span>
              <span className="text-sm font-black text-white">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Europa</span>
              <span className="text-sm font-black text-white">28%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Norteamérica</span>
              <span className="text-sm font-black text-white">20%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Otros</span>
              <span className="text-sm font-black text-white">7%</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h4 className="text-xs font-black uppercase text-gray-500 mb-4">Páginas Activas</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Feed</span>
              <span className="text-sm font-black text-emerald-400">34%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Dashboard</span>
              <span className="text-sm font-black text-blue-400">22%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Comunidades</span>
              <span className="text-sm font-black text-purple-400">18%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Signals</span>
              <span className="text-sm font-black text-orange-400">12%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">Analytics Dashboard</h1>
            <p className="text-xs text-gray-500">Métricas de uso, engagement y DAU/MAU</p>
          </div>
        </div>
        <span className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-black uppercase text-blue-400">
          Live Data
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="sticky top-28 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as AnalyticsSection)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeSection === item.id 
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'engagement' && renderEngagement()}
          {activeSection === 'retention' && renderRetention()}
          {activeSection === 'funnel' && renderFunnel()}
          {activeSection === 'realtime' && renderRealtime()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
