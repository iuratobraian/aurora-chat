import React from 'react';
import { StatsCard } from './StatsCards';
import { SectionCard } from './shared';
import { ProfileData } from './shared';
import { UserRow, UserRowLegacy } from './UserManagement';

interface DashboardOverviewProps {
  stats?: { totalUsers?: number; totalPosts?: number; totalCommunities?: number; activeAds?: number };
  webStats?: { pageViews?: number; uniqueVisitors?: number; bounceRate?: number; avgSessionDuration?: number };
  profiles: ProfileData[];
  legacyUsers?: Array<{ name: string; email: string; role: string; status: string; avatar: string }>;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
  globalSearchResults: { users: any[]; communities: any[]; posts: any[]; total: number } | null;
  onNavigateToTab: (tab: string, searchVal?: string) => void;
  onEditUser: (user: ProfileData) => void;
  onToggleBan: (userId: string, status: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats, webStats, profiles, legacyUsers,
  globalSearch, onGlobalSearchChange, globalSearchResults, onNavigateToTab,
  onEditUser, onToggleBan, onDeleteUser,
}) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="bg-[#1a1c20] rounded-lg border border-white/5 px-3 py-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-500 text-lg">search</span>
          <input
            type="text"
            placeholder="Búsqueda global: usuarios, comunidades, posts..."
            className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
          />
          {globalSearch && (
            <button onClick={() => onGlobalSearchChange('')} className="text-gray-500 hover:text-white">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
        {globalSearchResults && globalSearchResults.total > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-[#1a1c20] rounded-lg border border-white/10 shadow-xl max-h-96 overflow-y-auto">
            {globalSearchResults.users.length > 0 && (
              <div className="p-2 border-b border-white/5">
                <div className="text-xs text-gray-500 px-2 py-1">Usuarios</div>
                {globalSearchResults.users.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => { onNavigateToTab('users', r.data.usuario || ''); }}>
                    <span className="material-symbols-outlined text-gray-400 text-sm">person</span>
                    <span className="text-sm text-white">{r.data.usuario}</span>
                    <span className="text-xs text-gray-500">{r.data.email}</span>
                  </div>
                ))}
              </div>
            )}
            {globalSearchResults.communities.length > 0 && (
              <div className="p-2 border-b border-white/5">
                <div className="text-xs text-gray-500 px-2 py-1">Comunidades</div>
                {globalSearchResults.communities.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => { onNavigateToTab('communities', r.data.name || ''); }}>
                    <span className="material-symbols-outlined text-gray-400 text-sm">groups</span>
                    <span className="text-sm text-white">{r.data.name}</span>
                    <span className="text-xs text-gray-500">@{r.data.slug}</span>
                  </div>
                ))}
              </div>
            )}
            {globalSearchResults.posts.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-gray-500 px-2 py-1">Posts</div>
                {globalSearchResults.posts.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => { onNavigateToTab('posts', r.data.titulo || ''); }}>
                    <span className="material-symbols-outlined text-gray-400 text-sm">article</span>
                    <span className="text-sm text-white truncate">{r.data.titulo}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Usuarios" value={stats?.totalUsers || '12,458'} icon="person" color="blue" trend="+8%" subtitle="Registrados" />
        <StatsCard label="Comunidades" value={stats?.totalCommunities || '24'} icon="groups" color="green" trend="+2" subtitle="Activas" />
        <StatsCard label="Publicaciones" value={stats?.totalPosts || '3,842'} icon="article" color="purple" trend="+15%" subtitle="Total" />
        <StatsCard label="Ads Activas" value={stats?.activeAds || '8'} icon="campaign" color="orange" subtitle="Campañas" />
      </div>

      <SectionCard title="Web Stats" icon="public">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-[#0f1115] rounded-lg border border-white/5">
            <div className="text-lg font-bold text-white">{webStats?.pageViews?.toLocaleString() || '24.5k'}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Pageviews</div>
            <div className="text-[9px] text-emerald-400 mt-1">+18% vs ayer</div>
          </div>
          <div className="text-center p-3 bg-[#0f1115] rounded-lg border border-white/5">
            <div className="text-lg font-bold text-white">{webStats?.uniqueVisitors?.toLocaleString() || '8.2k'}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Visitantes</div>
            <div className="text-[9px] text-emerald-400 mt-1">+12% vs ayer</div>
          </div>
          <div className="text-center p-3 bg-[#0f1115] rounded-lg border border-white/5">
            <div className="text-lg font-bold text-white">{webStats?.avgSessionDuration ? `${Math.floor(webStats.avgSessionDuration / 60)}:${(webStats.avgSessionDuration % 60).toString().padStart(2, '0')}` : '3:42'}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Tiempo/Sesión</div>
            <div className="text-[9px] text-emerald-400 mt-1">+5s vs ayer</div>
          </div>
          <div className="text-center p-3 bg-[#0f1115] rounded-lg border border-white/5">
            <div className="text-lg font-bold text-white">{webStats?.bounceRate ? `${webStats.bounceRate}%` : '42%'}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Bounce Rate</div>
            <div className="text-[9px] text-emerald-400 mt-1">-3% vs ayer</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Analytics" icon="analytics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Crecimiento de Usuarios</span>
              <span className="text-xs text-emerald-400">+12.5%</span>
            </div>
            <div className="h-24 flex items-end gap-1">
              {[65, 78, 82, 75, 88, 95, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-500/30 rounded-t hover:bg-blue-500/50 transition-colors relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 opacity-0 group-hover:opacity-100">{h}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-gray-600">
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Actividad Semanal</span>
              <span className="text-xs text-purple-400">+156 posts</span>
            </div>
            <div className="h-24 flex items-end gap-1">
              {[45, 62, 58, 70, 85, 92, 78].map((h, i) => (
                <div key={i} className="flex-1 bg-purple-500/30 rounded-t hover:bg-purple-500/50 transition-colors relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 opacity-0 group-hover:opacity-100">{h}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-gray-600">
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Suscripciones</span>
              <span className="text-xs text-emerald-400">$2,450</span>
            </div>
            <div className="h-24 flex items-end gap-1">
              {[30, 45, 55, 48, 62, 75, 88].map((h, i) => (
                <div key={i} className="flex-1 bg-emerald-500/30 rounded-t hover:bg-emerald-500/50 transition-colors relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 opacity-0 group-hover:opacity-100">${h*10}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-gray-600">
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/5">
          <div className="text-center"><div className="text-lg font-bold text-white">78%</div><div className="text-[10px] text-gray-500">Retención Semanal</div></div>
          <div className="text-center"><div className="text-lg font-bold text-white">4.2</div><div className="text-[10px] text-gray-500">Avg. Posts/Día</div></div>
          <div className="text-center"><div className="text-lg font-bold text-white">2.4k</div><div className="text-[10px] text-gray-500">Engagement</div></div>
          <div className="text-center"><div className="text-lg font-bold text-white">$19</div><div className="text-[10px] text-gray-500">ARPPU</div></div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Últimos Usuarios" icon="person" actions={<button className="text-xs text-blue-400 hover:text-blue-300">Ver todos</button>}>
          {profiles.length > 0 ? (
            profiles.slice(0, 4).map((user) => (
              <UserRow
                key={user._id}
                user={user}
                onEdit={onEditUser}
                onToggleBan={onToggleBan}
                onDelete={onDeleteUser}
              />
            ))
          ) : (
            (legacyUsers?.slice(0, 4) || []).map((user, i) => <UserRowLegacy key={i} user={user} />)
          )}
        </SectionCard>
        <SectionCard title="Actividad Reciente" icon="history">
          {[
            { icon: 'person_add', text: 'Nuevo usuario registrado', time: 'Hace 2m' },
            { icon: 'article', text: 'Nuevo post publicado', time: 'Hace 5m' },
            { icon: 'campaign', text: 'Campaña iniciada', time: 'Hace 15m' },
            { icon: 'groups', text: 'Comunidad alcanzó 500', time: 'Hace 1h' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <span className="material-symbols-outlined text-blue-400 text-sm">{item.icon}</span>
              <span className="text-xs text-gray-400 flex-1">{item.text}</span>
              <span className="text-[10px] text-gray-600">{item.time}</span>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
};
