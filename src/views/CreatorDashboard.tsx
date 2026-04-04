import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Usuario } from '../types';
import CommunityReviews from '../components/CommunityReviews';
import { Avatar } from '../components/Avatar';
import { CommunityAnalyticsService } from '../services/analytics/communityAnalytics';
import { distributionService, DistributionChannel, FlywheelMetrics, DistributionTarget } from '../services/distribution/distributionService';

interface CreatorDashboardProps {
  usuario: Usuario | null;
  onVisitProfile?: (id: string) => void;
  onNavigate?: (tab: string) => void;
}

type DashboardSection = 'overview' | 'observatory' | 'members' | 'posts' | 'settings' | 'earnings' | 'analytics' | 'reviews' | 'distribution' | 'calendar' | 'flywheel';

interface CommunityStats {
  name: string;
  members: number;
  revenue: number;
  visibility: string;
}

interface CreatorStats {
  totalCommunities: number;
  activeCommunities: number;
  totalMembers: number;
  totalRevenue: number;
  memberOfCommunities: number;
  communityStats: CommunityStats[];
  weeklyPosts: number;
  activeMembers: number;
  growthRate: number;
}

interface CommunityMember {
  _id: string;
  userId: string;
  communityId: string;
  role: string;
  subscriptionStatus?: string;
  joinedAt: number;
  profile: {
    nombre: string;
    usuario: string;
    avatar: string;
    email?: string;
    esPro?: boolean;
  } | null;
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ usuario, onVisitProfile, onNavigate }) => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  const [communitySettings, setCommunitySettings] = useState({
    name: '',
    description: '',
    logo: '',
    visibility: 'public' as 'public' | 'unlisted' | 'private',
    priceMonthly: 9.99,
    allowMemberPosts: true,
    requireApproval: false,
  });

  const creatorStats = useQuery(api.creatorDashboard.getCreatorStats, { 
    userId: usuario?.id || '' 
  });

  const userCommunities = useQuery(api.communities.getUserCommunities, { 
    userId: usuario?.id || '' 
  });

  const validCommunityId = selectedCommunityId && typeof selectedCommunityId === 'string' && selectedCommunityId.length > 0 
    ? selectedCommunityId as any 
    : undefined;

  const communityMembersResult = useQuery(
    api.communities.getCommunityMembers,
    validCommunityId ? { communityId: validCommunityId, limit: 50 } : 'skip'
  );
  const communityMembers = communityMembersResult?.members as CommunityMember[] | undefined;

  useEffect(() => {
    if (userCommunities && userCommunities.length > 0 && !selectedCommunityId) {
      setSelectedCommunityId(userCommunities[0]._id);
      setCommunitySettings({
        name: userCommunities[0].name || '',
        description: userCommunities[0].description || '',
        logo: (userCommunities[0] as any).logo || '',
        visibility: userCommunities[0].visibility || 'public',
        priceMonthly: userCommunities[0].priceMonthly || 9.99,
        allowMemberPosts: true,
        requireApproval: false,
      });
    }
  }, [userCommunities, selectedCommunityId]);

  const filteredMembers = useMemo(() => {
    if (!communityMembers) return [];
    return communityMembers.filter(m => {
      const matchesSearch = !searchTerm || 
        m.profile?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.profile?.usuario?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [communityMembers, searchTerm, roleFilter]);

  const stats: CreatorStats = creatorStats || {
    totalCommunities: 0,
    activeCommunities: 0,
    totalMembers: 0,
    totalRevenue: 0,
    memberOfCommunities: 0,
    communityStats: [],
  };

  // Use real KPIs from Convex
  const weeklyPosts = stats.communityStats?.reduce((sum: number, cs: any) => sum + (cs.postsThisWeek || 0), 0) || 0;
  const activeMembers = stats.activeMembers || 0;
  const growthRate = stats.growthRate || 0;

  const [funnelStats, setFunnelStats] = useState({
    views: 0, visits: 0, registrations: 0, joins: 0, conversionRate: 0
  });
  const [roiStats, setRoiStats] = useState({
    referredUsers: 0, referredConversions: 0, subscriptionRevenue: 0,
    referralEarnings: 0, roi: 0, referrerCommission: 20
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      const communityId = selectedCommunityId || userCommunities?.[0]?._id || '';
      const communityName = userCommunities?.find(c => c._id === communityId)?.name || 'Tu Comunidad';
      const members = communityMembers?.length || stats.totalMembers;
      const revenue = stats.totalRevenue;
      
      const analytics = await CommunityAnalyticsService.getCommunityAnalytics(
        communityId, communityName, members, revenue
      );
      setFunnelStats(analytics.conversionFunnel);
      setRoiStats(analytics.roiAnalytics);
    };
    
    if (stats.totalMembers > 0) {
      loadAnalytics();
    }
  }, [selectedCommunityId, userCommunities, stats.totalMembers, stats.totalRevenue]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'observatory', label: 'Observatory', icon: 'radar' },
    { id: 'members', label: 'Members', icon: 'group' },
    { id: 'posts', label: 'Posts', icon: 'article' },
    { id: 'flywheel', label: 'Flywheel', icon: 'cycle' },
    { id: 'distribution', label: 'Distribución', icon: 'share' },
    { id: 'calendar', label: 'Calendario', icon: 'calendar_month' },
    { id: 'earnings', label: 'Earnings', icon: 'payments' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'reviews', label: 'Reviews', icon: 'star' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-2xl text-emerald-400">groups</span>
            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-500/10 px-2 py-1 rounded-full">{growthRate}</span>
          </div>
          <h3 className="text-3xl font-black text-white">{stats.totalMembers}</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Miembros</p>
          <div className="mt-4 h-12 flex items-end gap-1">
            {[40, 55, 45, 60, 50, 70, 65, 80, 75, 90, 85, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-emerald-500/30 rounded-t" style={{ height: `${h}%` }}>
                <div className="w-full bg-emerald-500 rounded-t h-full" style={{ height: `${h * 0.7}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-2xl text-purple-400">payments</span>
          </div>
          <h3 className="text-3xl font-black text-white">${stats.totalRevenue.toFixed(0)}</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Ingreso Total</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-2xl text-blue-400">article</span>
          </div>
          <h3 className="text-3xl font-black text-white">{weeklyPosts}</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Posts esta Semana</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-2xl text-amber-400">trending_up</span>
          </div>
          <h3 className="text-3xl font-black text-white">{activeMembers}</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Miembros Activos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Mis Comunidades</h3>
          <div className="space-y-3">
            {stats.communityStats.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-bold text-white">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.members} miembros</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-black">${c.revenue.toFixed(0)}</p>
                  <p className="text-[10px] text-gray-500 uppercase">{c.visibility}</p>
                </div>
              </div>
            ))}
            {stats.communityStats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2">group_add</span>
                <p className="text-sm">Crea tu primera comunidad</p>
                <button 
                  onClick={() => setActiveSection('settings')}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-black font-bold text-xs rounded-lg"
                >
                  Crear Comunidad
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Resumen Rápido</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Comunidades Activas</span>
              <span className="text-white font-bold">{stats.activeCommunities}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Comunidades Totales</span>
              <span className="text-white font-bold">{stats.totalCommunities}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Comunidades como Miembro</span>
              <span className="text-white font-bold">{stats.memberOfCommunities}</span>
            </div>
            <div className="h-px bg-white/5 my-4"></div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Ingreso Mensual Est.</span>
              <span className="text-emerald-400 font-black text-lg">${(stats.totalRevenue / Math.max(1, stats.totalMembers)).toFixed(0)}/miembro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderObservatory = () => (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-[#131113] to-[#1a1a1a]/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-violet-400">radar</span>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                Premium Observatory
                <span className="px-2 py-0.5 bg-violet-500/20 border border-violet-500/30 rounded-full text-[10px] font-black text-violet-400 uppercase">Creator</span>
              </h2>
              <p className="text-sm text-gray-500 font-medium">Análisis de inteligencia para tu comunidad de trading</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="size-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00e676]" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="material-symbols-outlined text-xl text-emerald-400">groups</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-2xl font-black text-white">{stats.totalMembers}</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Miembros Totales</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="material-symbols-outlined text-xl text-amber-400">payments</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">+8%</span>
            </div>
            <h3 className="text-2xl font-black text-white">${(stats.totalRevenue).toFixed(0)}</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ingresos Mensuales</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="material-symbols-outlined text-xl text-blue-400">trending_up</span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">67%</span>
            </div>
            <h3 className="text-2xl font-black text-white">Engagement</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Tasa de Interacción</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="material-symbols-outlined text-xl text-purple-400">autorenew</span>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">+2%</span>
            </div>
            <h3 className="text-2xl font-black text-white">84%</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Retención 30d</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-lg">auto_awesome</span>
              Oportunidades de Crecimiento
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">Optimizar Precio</p>
                    <p className="text-xs text-gray-400 mt-1">Tu ARPU está 15% debajo del benchmark</p>
                  </div>
                  <span className="text-emerald-400 font-black text-sm">+$1,200/mes</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">Cross-sell Señales</p>
                    <p className="text-xs text-gray-400 mt-1">12% de miembros podrían upgrade</p>
                  </div>
                  <span className="text-emerald-400 font-black text-sm">+$420/mes</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">Peak Engagement</p>
                    <p className="text-xs text-gray-400 mt-1">Miembros más activos 18:00-21:00 UTC</p>
                  </div>
                  <span className="text-emerald-400 font-black text-sm">+15%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-lg">warning</span>
              Alertas
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="font-bold text-white text-sm">Riesgo de Churn</p>
                <p className="text-xs text-gray-400 mt-1">23 miembros sin actividad en 14+ días</p>
                <button className="mt-2 px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg">
                  Ver Miembros
                </button>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  Récord de Ingresos
                </p>
                <p className="text-xs text-gray-400 mt-1">Superaste tu meta de ${stats.totalRevenue.toFixed(0)} este mes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
          >
            <option value="all">Todos los Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="member">Member</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={selectedCommunityId || ''}
            onChange={(e) => setSelectedCommunityId(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
          >
            {userCommunities?.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar miembro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white placeholder-gray-500 outline-none focus:border-emerald-500/50"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5 text-[10px] uppercase font-black text-gray-500 tracking-widest">
            <tr>
              <th className="p-4 text-left">Miembro</th>
              <th className="p-4 text-left">Rol</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-left">Unido</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredMembers?.map(member => (
              <tr key={member._id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={member.profile?.avatar}
                      name={member.profile?.nombre || 'Usuario'}
                      seed={member.userId}
                      size="md"
                      rounded="lg"
                      className="bg-white/5"
                    />
                    <div>
                      <p className="font-bold text-white text-sm">{member.profile?.nombre || 'Usuario'}</p>
                      <p className="text-[10px] text-gray-500">@{member.profile?.usuario || 'unknown'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    member.role === 'owner' ? 'bg-purple-500/20 text-purple-400' :
                    member.role === 'admin' || member.role === 'moderator' ? 'bg-blue-500/20 text-blue-400' :
                    member.role === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    member.subscriptionStatus === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    member.subscriptionStatus === 'canceled' ? 'bg-red-500/20 text-red-400' :
                    member.role === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {member.subscriptionStatus || member.role === 'pending' ? 'Pendiente' : 'Activo'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-xs text-gray-500">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onVisitProfile?.(member.userId)}
                      className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                      title="Ver Perfil"
                    >
                      <span className="material-symbols-outlined text-sm">person</span>
                    </button>
                    {member.role !== 'owner' && member.role !== 'admin' && (
                      <button
                        className="p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
                        title="Hacer Admin"
                      >
                        <span className="material-symbols-outlined text-sm">shield</span>
                      </button>
                    )}
                    {member.role !== 'owner' && (
                      <button
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Remover"
                      >
                        <span className="material-symbols-outlined text-sm">person_remove</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMembers?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
            <p className="text-sm">No se encontraron miembros</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPosts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black uppercase tracking-widest text-white">Moderación de Posts</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/5 transition-all">
            Pendientes <span className="ml-1 text-amber-400">0</span>
          </button>
          <button className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 transition-all">
            Aprobados
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-12 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">fact_check</span>
        <h4 className="text-lg font-black text-white mb-2">No hay posts pendientes</h4>
        <p className="text-sm text-gray-500">Los posts de la comunidad aparecerán aquí para su revisión.</p>
      </div>
    </div>
  );

  const renderEarnings = () => {
    const monthlyRevenue = stats.totalRevenue;
    const projectedMonthly = monthlyRevenue * 1.1;
    const projectedYearly = projectedMonthly * 12;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
            <span className="material-symbols-outlined text-2xl text-emerald-400 mb-4 block">account_balance_wallet</span>
            <h3 className="text-4xl font-black text-white">${monthlyRevenue.toFixed(2)}</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Ingreso Este Mes</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
            <span className="material-symbols-outlined text-2xl text-blue-400 mb-4 block">trending_up</span>
            <h3 className="text-4xl font-black text-white">${projectedMonthly.toFixed(2)}</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Proyectado Mes</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
            <span className="material-symbols-outlined text-2xl text-purple-400 mb-4 block">savings</span>
            <h3 className="text-4xl font-black text-white">${projectedYearly.toFixed(2)}</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Proyectado Año</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Detalle de Ingresos</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
              <span className="text-gray-400 text-sm">Suscripciones Activas</span>
              <span className="text-white font-bold">{stats.totalMembers}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
              <span className="text-gray-400 text-sm">Precio Promedio</span>
              <span className="text-white font-bold">$9.99/mes</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
              <span className="text-gray-400 text-sm">Comisión Plataforma</span>
              <span className="text-red-400 font-bold">-15%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <span className="text-emerald-400 font-bold">Ingreso Neto</span>
              <span className="text-emerald-400 font-black text-xl">${(monthlyRevenue * 0.85).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Crecimiento de Miembros</h3>
          <div className="h-48 flex items-end gap-2">
            {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'].map((mes, i) => {
              const heights = [30, 45, 40, 60, 55, 80];
              return (
                <div key={mes} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end h-36">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all hover:opacity-80"
                      style={{ height: `${heights[i]}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold">{mes}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Engagement Rate</h3>
          <div className="flex items-center justify-center h-48">
            <div className="relative size-32">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
                <circle 
                  cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" 
                  strokeDasharray="75 100" className="text-emerald-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">75%</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Engagement</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-lg font-black text-white">{stats.totalMembers}</p>
              <p className="text-[10px] text-gray-500 uppercase">Miembros</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-blue-400">{weeklyPosts}</p>
              <p className="text-[10px] text-gray-500 uppercase">Posts/Sem</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-purple-400">{activeMembers}</p>
              <p className="text-[10px] text-gray-500 uppercase">Activos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Métricas de Retención</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <p className="text-2xl font-black text-emerald-400">85%</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Retención Mensual</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <p className="text-2xl font-black text-blue-400">4.2</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Posts/Miembro/Sem</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <p className="text-2xl font-black text-purple-400">12:30</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Tiempo en App</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl text-center">
            <p className="text-2xl font-black text-amber-400">68%</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Tasa de Renovación</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">funnel</span>
            Conversion Funnel
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Vistas', value: funnelStats.views, color: 'from-blue-500 to-blue-400', width: 100 },
              { label: 'Visitas', value: funnelStats.visits, color: 'from-blue-600 to-blue-500', width: funnelStats.views > 0 ? (funnelStats.visits / funnelStats.views) * 100 : 0 },
              { label: 'Registros', value: funnelStats.registrations, color: 'from-purple-500 to-purple-400', width: funnelStats.visits > 0 ? (funnelStats.registrations / funnelStats.visits) * 100 : 0 },
              { label: 'Miembros', value: funnelStats.joins, color: 'from-emerald-500 to-emerald-400', width: funnelStats.registrations > 0 ? (funnelStats.joins / funnelStats.registrations) * 100 : 0 },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{step.label}</span>
                  <span className="font-black text-white">{step.value}</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${step.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, step.width)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 uppercase">Tasa de Conversión</span>
              <span className="text-lg font-black text-blue-400">{funnelStats.conversionRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">account_balance</span>
            ROI Analytics
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <p className="text-2xl font-black text-emerald-400">${roiStats.subscriptionRevenue.toFixed(0)}</p>
              <p className="text-[10px] text-gray-500 uppercase mt-1">Ingreso Suscripciones</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <p className="text-2xl font-black text-amber-400">${roiStats.referralEarnings.toFixed(0)}</p>
              <p className="text-[10px] text-gray-500 uppercase mt-1">Ingreso Referidos</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Referidos traídos</span>
              <span className="font-black text-white">{roiStats.referredUsers}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Conversiones de referidos</span>
              <span className="font-black text-white">{roiStats.referredConversions}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Comisión referidor</span>
              <span className="font-black text-amber-400">{roiStats.referrerCommission}%</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 uppercase">ROI</span>
              <span className={`text-lg font-black ${roiStats.roi >= 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {roiStats.roi.toFixed(1)}x
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviews = () => {
    const selectedCommunity = userCommunities?.find(c => c._id === selectedCommunityId);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase tracking-widest text-white">Reseñas de Comunidad</h3>
          <select
            value={selectedCommunityId || ''}
            onChange={(e) => setSelectedCommunityId(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
          >
            {userCommunities?.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        {selectedCommunityId && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <CommunityReviews 
              communityId={selectedCommunityId}
              userId={usuario?.id}
              isMember={true}
            />
          </div>
        )}
        
        {!selectedCommunityId && (
          <div className="text-center py-12 text-gray-500">
            <span className="material-symbols-outlined text-6xl mb-4">group_add</span>
            <p className="text-sm">Selecciona una comunidad para ver sus reseñas</p>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Configuración de Comunidad</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Nombre</label>
              <input
                type="text"
                value={communitySettings.name}
                onChange={(e) => setCommunitySettings({...communitySettings, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Descripción</label>
              <textarea
                value={communitySettings.description}
                onChange={(e) => setCommunitySettings({...communitySettings, description: e.target.value})}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Logo URL</label>
              <input
                type="text"
                value={communitySettings.logo}
                onChange={(e) => setCommunitySettings({...communitySettings, logo: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Visibilidad y Precios</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Visibilidad</label>
              <select
                value={communitySettings.visibility}
                onChange={(e) => setCommunitySettings({...communitySettings, visibility: e.target.value as any})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none"
              >
                <option value="public">Público</option>
                <option value="unlisted">No listado</option>
                <option value="private">Privado</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Precio Mensual ($)</label>
              <input
                type="number"
                value={communitySettings.priceMonthly}
                onChange={(e) => setCommunitySettings({...communitySettings, priceMonthly: parseFloat(e.target.value) || 0})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Permisos</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="font-bold text-white text-sm">Permitir Posts de Miembros</p>
              <p className="text-xs text-gray-500">Los miembros pueden crear publicaciones</p>
            </div>
            <button
              onClick={() => setCommunitySettings({...communitySettings, allowMemberPosts: !communitySettings.allowMemberPosts})}
              className={`w-12 h-6 rounded-full transition-all ${communitySettings.allowMemberPosts ? 'bg-emerald-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${communitySettings.allowMemberPosts ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="font-bold text-white text-sm">Requiere Aprobación</p>
              <p className="text-xs text-gray-500">Revisar posts antes de publicar</p>
            </div>
            <button
              onClick={() => setCommunitySettings({...communitySettings, requireApproval: !communitySettings.requireApproval})}
              className={`w-12 h-6 rounded-full transition-all ${communitySettings.requireApproval ? 'bg-emerald-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${communitySettings.requireApproval ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      <button className="px-6 py-3 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all">
        Guardar Cambios
      </button>
    </div>
  );

  const [flywheelMetrics, setFlywheelMetrics] = useState<FlywheelMetrics>({
    totalPosts: 0,
    totalReach: 0,
    avgEngagement: 0,
    topChannel: 'community-feed',
    topContent: { id: '', reach: 0 },
    growthRate: 0,
  });

  const [distributionChannels, setDistributionChannels] = useState<DistributionChannel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set(['community-feed', 'communities']));
  const [autoDistribute, setAutoDistribute] = useState(true);

  useEffect(() => {
    setDistributionChannels(distributionService.getChannels());
    setFlywheelMetrics(distributionService.getFlywheelMetrics([], new Map()));
  }, []);

  useEffect(() => {
    if (stats.totalMembers > 0) {
      setFlywheelMetrics(prev => ({
        ...prev,
        totalPosts: stats.weeklyPosts || 0,
        growthRate: stats.growthRate || 0,
      }));
    }
  }, [stats.weeklyPosts, stats.growthRate, stats.totalMembers]);

  const toggleChannel = useCallback((channelId: string) => {
    setSelectedChannels(prev => {
      const next = new Set(prev);
      if (next.has(channelId)) {
        next.delete(channelId);
      } else {
        next.add(channelId);
      }
      return next;
    });
  }, []);

  const getChannelIcon = (type: DistributionChannel['type']) => {
    switch (type) {
      case 'community': return 'groups';
      case 'social': return 'public';
      case 'email': return 'email';
      case 'rss': return 'rss_feed';
      default: return 'share';
    }
  };

  const renderFlywheel = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-2xl text-orange-400">cycle</span>
            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${flywheelMetrics.growthRate >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {flywheelMetrics.growthRate >= 0 ? '+' : ''}{flywheelMetrics.growthRate}%
            </span>
          </div>
          <h3 className="text-3xl font-black text-white">{flywheelMetrics.totalPosts}</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Posts Distribuidos</p>
          <div className="mt-4 h-12 flex items-end gap-1">
            {[30, 45, 40, 55, 50, 65, 60, 75, 70, 85, 80, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-orange-500/30 rounded-t" style={{ height: `${h}%` }}>
                <div className="w-full bg-gradient-to-t from-orange-500 to-yellow-500 rounded-t" style={{ height: `${h * 0.7}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-2xl text-cyan-400">visibility</span>
          </div>
          <h3 className="text-3xl font-black text-white">{flywheelMetrics.totalReach.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Alcance Total</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20">
          <div className="flex items-center justify-between mb-4">
            <span className="material-symbols-outlined text-2xl text-pink-400">favorite</span>
          </div>
          <h3 className="text-3xl font-black text-white">{(flywheelMetrics.avgEngagement * 100).toFixed(1)}%</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Engagement Promedio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-400">cycle</span>
            Flywheel Loop
          </h3>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/10" />
            </div>
            <div className="relative grid grid-cols-3 gap-4 py-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-emerald-400">edit</span>
                </div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase">Crear</p>
                <p className="text-[8px] text-gray-500">Contenido</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-cyan-400">share</span>
                </div>
                <p className="text-[10px] font-bold text-cyan-400 uppercase">Distribuir</p>
                <p className="text-[8px] text-gray-500">Multi-canal</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/30 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-pink-400">group_add</span>
                </div>
                <p className="text-[10px] font-bold text-pink-400 uppercase">Crecer</p>
                <p className="text-[8px] text-gray-500">Audiencia</p>
              </div>
            </div>
            <div className="absolute top-1/2 left-0 w-full flex justify-center">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30">
                <span className="text-[10px] font-black text-orange-400">Autopropulsión</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Top Contenido</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <span className="text-2xl font-black text-orange-400">1</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Estrategia EUR/USD</p>
                <p className="text-[10px] text-gray-500">3.2K alcance</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-emerald-400">+24%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <span className="text-2xl font-black text-gray-400">2</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Análisis Semanal</p>
                <p className="text-[10px] text-gray-500">2.8K alcance</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-emerald-400">+18%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <span className="text-2xl font-black text-amber-600">3</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Tips Trading</p>
                <p className="text-[10px] text-gray-500">2.1K alcance</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-emerald-400">+12%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Recomendaciones del Flywheel</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <span className="material-symbols-outlined text-purple-400 mb-2 block">lightbulb</span>
            <p className="text-xs text-white font-bold">Publica 3x/semana</p>
            <p className="text-[10px] text-gray-500 mt-1">Maximiza el alcance orgánico</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <span className="material-symbols-outlined text-purple-400 mb-2 block">schedule</span>
            <p className="text-xs text-white font-bold">Horarios óptimos</p>
            <p className="text-[10px] text-gray-500 mt-1">8AM y 6PM tienen mayor engagement</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <span className="material-symbols-outlined text-purple-400 mb-2 block">trending_up</span>
            <p className="text-xs text-white font-bold">Contenido viral</p>
            <p className="text-[10px] text-gray-500 mt-1">Las estrategias performan 2x mejor</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDistribution = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black uppercase tracking-widest text-white">Distribución Multi-Canal</h3>
          <p className="text-xs text-gray-500 mt-1">Distribuye tu contenido automáticamente</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-gray-400 font-bold">Auto-distribuir</span>
            <button
              onClick={() => setAutoDistribute(!autoDistribute)}
              className={`w-12 h-6 rounded-full transition-all ${autoDistribute ? 'bg-emerald-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${autoDistribute ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Canales de Distribución</h3>
          <div className="space-y-3">
            {distributionChannels.map(channel => (
              <div
                key={channel.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedChannels.has(channel.id)
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                onClick={() => toggleChannel(channel.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedChannels.has(channel.id) ? 'bg-emerald-500/20' : 'bg-white/5'
                    }`}>
                      <span className={`material-symbols-outlined ${
                        selectedChannels.has(channel.id) ? 'text-emerald-400' : 'text-gray-400'
                      }`}>
                        {getChannelIcon(channel.type)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{channel.name}</p>
                      <p className="text-[10px] text-gray-500">
                        Alcance: {channel.reach.toLocaleString()} · Engagement: {(channel.engagement * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedChannels.has(channel.id)
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-gray-500'
                  }`}>
                    {selectedChannels.has(channel.id) && (
                      <span className="material-symbols-outlined text-xs text-black">check</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Configuración de Distribución</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Contenido a Distribuir</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none">
                <option value="">Selecciona un post...</option>
                <option value="1">Estrategia EUR/USD - Análisis técnico</option>
                <option value="2">Weekly Outlook - Mercados</option>
                <option value="3">Tips para principiantes</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Programar</label>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400">
                  Ahora
                </button>
                <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:border-white/20">
                  Programar
                </button>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-xl border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-cyan-400 text-sm">info</span>
                <span className="text-xs font-bold text-cyan-400">Alcance Estimado</span>
              </div>
              <p className="text-2xl font-black text-white">
                {(Array.from(selectedChannels).reduce((sum, id) => {
                  const ch = distributionChannels.find(c => c.id === id);
                  return sum + (ch?.reach || 0);
                }, 0)).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500">usuarios potenciales</p>
            </div>

            <button className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-all">
              Distribuir Ahora
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Historial de Distribución</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400">check</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Estrategia EUR/USD</p>
                <p className="text-[10px] text-gray-500">Feed Principal + Mis Comunidades</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-emerald-400">+2.4K</p>
              <p className="text-[10px] text-gray-500">Hace 2 horas</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400">check</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Weekly Outlook</p>
                <p className="text-[10px] text-gray-500">Feed Principal + Trending</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-emerald-400">+3.8K</p>
              <p className="text-[10px] text-gray-500">Ayer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [scheduledPosts] = useState([
      { id: '1', title: 'Análisis Técnico', date: new Date(Date.now() + 86400000), time: '09:00' },
      { id: '2', title: 'Estrategia Trading', date: new Date(Date.now() + 172800000), time: '18:00' },
      { id: '3', title: 'Tips Semanales', date: new Date(Date.now() + 432000000), time: '12:00' },
    ]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const prevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getPostsForDay = (day: number) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      return scheduledPosts.filter(p => 
        p.date.getDate() === date.getDate() &&
        p.date.getMonth() === date.getMonth() &&
        p.date.getFullYear() === date.getFullYear()
      );
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-gray-400">chevron_left</span>
              </button>
              <h3 className="text-lg font-black uppercase tracking-widest text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-gray-400">chevron_right</span>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center text-[10px] font-black uppercase text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const posts = getPostsForDay(day);
                const isToday = new Date().getDate() === day && 
                  new Date().getMonth() === currentDate.getMonth() &&
                  new Date().getFullYear() === currentDate.getFullYear();
                
                return (
                  <div
                    key={day}
                    className={`aspect-square p-2 rounded-xl border transition-all ${
                      isToday
                        ? 'bg-emerald-500/20 border-emerald-500/50'
                        : 'bg-white/5 border-transparent hover:border-white/20'
                    }`}
                  >
                    <span className={`text-xs font-bold ${isToday ? 'text-emerald-400' : 'text-gray-300'}`}>
                      {day}
                    </span>
                    {posts.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {posts.slice(0, 2).map(post => (
                          <div key={post.id} className="text-[8px] truncate bg-orange-500/20 text-orange-400 px-1 py-0.5 rounded">
                            {post.title}
                          </div>
                        ))}
                        {posts.length > 2 && (
                          <div className="text-[8px] text-gray-500">+{posts.length - 2}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Programar Post</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Título del post..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-emerald-500/50"
                />
                <input
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none"
                />
                <input
                  type="time"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none"
                />
                <button className="w-full px-4 py-3 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all">
                  Agregar
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">Posts Programados</h3>
              <div className="space-y-3">
                {scheduledPosts.map(post => (
                  <div key={post.id} className="p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-white">{post.title}</p>
                      <button className="text-gray-500 hover:text-red-400">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      {post.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · {post.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate?.('comunidad')}
            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">Creator Dashboard</h1>
            <p className="text-xs text-gray-500">Gestiona tu comunidad y contenido</p>
          </div>
        </div>
        {usuario?.role && usuario.role >= 3 && (
          <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase text-emerald-400">
            Creator Activo
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="sticky top-28 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as DashboardSection)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeSection === item.id 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
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
          {activeSection === 'observatory' && renderObservatory()}
          {activeSection === 'members' && renderMembers()}
          {activeSection === 'posts' && renderPosts()}
          {activeSection === 'flywheel' && renderFlywheel()}
          {activeSection === 'distribution' && renderDistribution()}
          {activeSection === 'calendar' && renderCalendar()}
          {activeSection === 'earnings' && renderEarnings()}
          {activeSection === 'analytics' && renderAnalytics()}
          {activeSection === 'reviews' && renderReviews()}
          {activeSection === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
