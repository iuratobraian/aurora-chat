import React from 'react';
import { StatsCard, SectionCard } from './shared';

interface AIAgentManagementProps {
  aiConfig: any;
  pendingPosts: any[];
  onToggleAgent: () => void;
  onApprovePost: (postId: string) => void;
  onRejectPost: (postId: string) => void;
}

export const AIAgentManagement: React.FC<AIAgentManagementProps> = ({
  aiConfig, pendingPosts, onToggleAgent, onApprovePost, onRejectPost,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatsCard label="Posts IA" value={pendingPosts?.length || 0} icon="auto_awesome" color="purple" subtitle="Pendientes" />
      <StatsCard label="Estado IA" value={aiConfig?.enabled ? "ACTIVO" : "INACTIVO"} icon="smart_toy" color={aiConfig?.enabled ? "green" : "red"} subtitle="Sistema" />
      <StatsCard label="Schedules" value={aiConfig?.schedules?.filter((s:any) => s.enabled).length || 0} icon="schedule" color="blue" subtitle="Activos" />
      <StatsCard label="Reputación" value="98%" icon="verified" color="green" subtitle="Precisión" />
    </div>
    <SectionCard
      title="AI Agent Control Central"
      icon="smart_toy"
      actions={
        <button
          onClick={onToggleAgent}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            aiConfig?.enabled
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {aiConfig?.enabled ? 'DESACTIVAR AGENTE' : 'ACTIVAR AGENTE'}
        </button>
      }
    >
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Posts Pendientes de Aprobación</h4>
        {pendingPosts && pendingPosts.length > 0 ? (
          pendingPosts.map((post: any) => (
            <div key={post._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 group hover:border-white/10 transition-all">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{post.titulo}</div>
                <div className="text-[10px] text-gray-500">{post.categoria} · Programado: {new Date(post.programedAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onApprovePost(post._id)}
                  className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                  title="Aprobar y Publicar"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                </button>
                <button
                  onClick={() => onRejectPost(post._id)}
                  className="p-1.5 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all"
                  title="Rechazar"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm italic">No hay posts pendientes de la IA</div>
        )}
      </div>
    </SectionCard>
  </div>
);

interface MarketingManagementProps {
  ads: any[];
  onDeleteAd: (adId: string) => void;
}

export const MarketingManagement: React.FC<MarketingManagementProps> = ({
  ads, onDeleteAd,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatsCard label="Ads Activas" value={ads.filter((a: any) => a.activo).length} icon="campaign" color="blue" />
      <StatsCard label="Sectores" value={new Set(ads.map((a: any) => a.sector)).size} icon="grid_view" color="purple" />
      <StatsCard label="Enlace Clics" value="2.4k" icon="ads_click" color="green" />
      <StatsCard label="Impresiones" value="12.8k" icon="visibility" color="orange" />
    </div>
    <SectionCard title="Gestión de Anuncios / Banners" icon="campaign">
      {ads.length > 0 ? (
        <div className="space-y-3">
          {ads.map((ad: any) => (
            <div key={ad._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 group hover:border-white/10 transition-all">
              <div className="w-16 h-10 bg-gray-800 rounded border border-white/10 overflow-hidden shrink-0">
                {ad.imagenUrl ? (
                  <img src={ad.imagenUrl} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="flex items-center justify-center h-full"><span className="material-symbols-outlined text-xs text-gray-600">image</span></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{ad.titulo}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{ad.sector} · {ad.activo ? 'ACTIVO' : 'INACTIVO'}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDeleteAd(ad._id)}
                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-all"
                  title="Eliminar"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 italic">No hay anuncios configurados</div>
      )}
    </SectionCard>
  </div>
);

interface ModerationManagementProps {
  spamReports: any[];
  currentUser: { userId: string; role: number } | undefined;
  onModerateContent: (contentId: string, contentType: string, action: 'dismiss' | 'delete', moderatorId: string) => void;
}

export const ModerationManagement: React.FC<ModerationManagementProps> = ({
  spamReports, currentUser, onModerateContent,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatsCard label="Reports" value={spamReports?.length || 0} icon="flag" color="orange" subtitle="Pendientes" />
      <StatsCard label="Posts Totales" value="3,842" icon="article" color="blue" />
      <StatsCard label="Usuarios" value="12,458" icon="group" color="green" />
      <StatsCard label="Seguridad" value="Protegido" icon="security" color="green" />
    </div>
    <SectionCard title="Reportes de Spam (Pendientes)" icon="gavel">
      {spamReports && spamReports.length > 0 ? (
        <div className="space-y-3">
          {spamReports.map((report: any) => (
            <div key={report._id} className="flex flex-col p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[9px] font-bold uppercase">{report.reason}</span>
                  <span className="text-[10px] text-gray-500">Reportado por @{report.userProfile?.usuario}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onModerateContent(report.contentId, report.contentType, 'dismiss', currentUser?.userId || '')}
                    className="text-[10px] text-gray-400 hover:text-white"
                  >DESCARTAR</button>
                  <button
                    onClick={() => onModerateContent(report.contentId, report.contentType, 'delete', currentUser?.userId || '')}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                  >ELIMINAR</button>
                </div>
              </div>
              <p className="text-xs text-gray-300 italic">"{report.content}"</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 italic">No hay reportes de moderación pendientes</div>
      )}
    </SectionCard>
  </div>
);

interface BitacoraManagementProps {
  verifications: any[];
  onUpdateVerification: (userId: string, updates: { kycStatus?: string; tradingVerified?: boolean }) => void;
}

export const BitacoraManagement: React.FC<BitacoraManagementProps> = ({
  verifications, onUpdateVerification,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatsCard label="Traders Sol." value={verifications.length} icon="person" color="blue" subtitle="Total" />
      <StatsCard label="Pendientes" value={verifications.filter((v:any) => v.kycStatus === 'pending').length} icon="pending" color="orange" />
      <StatsCard label="Verificados" value={verifications.filter((v:any) => v.kycStatus === 'approved').length} icon="verified" color="green" />
      <StatsCard label="Revisión" value={verifications.filter((v:any) => v.kycStatus === 'reviewing').length} icon="hourglass_empty" color="purple" />
    </div>
    <SectionCard title="Bitácora: Verificaciones KYC & Trading" icon="verified">
      {verifications.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 pb-2 border-b border-white/5">
            <span>Usuario ID</span>
            <span>Nivel</span>
            <span>Estado KYC</span>
            <span>Trading</span>
            <span className="text-right">Acciones</span>
          </div>
          {verifications.map((v: any) => (
            <div key={v._id} className="grid grid-cols-5 items-center gap-4 py-2 px-2 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0 text-xs text-white">
              <span className="truncate">@{v.userId.split('|')[0] || v.userId}</span>
              <span className="capitalize">{v.level}</span>
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  v.kycStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                  v.kycStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {v.kycStatus?.toUpperCase() || 'NONE'}
                </span>
              </div>
              <span className={v.tradingVerified ? "text-emerald-400" : "text-gray-500"}>
                {v.tradingVerified ? "VERIFICADO" : "PENDIENTE"}
              </span>
              <div className="text-right flex items-center justify-end gap-1">
                <button
                  onClick={() => onUpdateVerification(v.userId, { kycStatus: 'approved', tradingVerified: true })}
                  className="p-1 hover:bg-white/10 rounded text-emerald-400"
                  title="Aprobar Todo"
                >
                  <span className="material-symbols-outlined text-sm">how_to_reg</span>
                </button>
                <button
                  onClick={() => onUpdateVerification(v.userId, { kycStatus: 'rejected' })}
                  className="p-1 hover:bg-white/10 rounded text-red-500"
                  title="Rechazar"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 italic">No hay solicitudes de verificación activas</div>
      )}
    </SectionCard>
  </div>
);

interface WhatsAppManagementProps {
  waStats: any;
  waNotifications: any[];
  currentUser: { userId: string; role: number } | undefined;
  onRetryNotification: (id: string, moderatorId: string) => void;
}

export const WhatsAppManagement: React.FC<WhatsAppManagementProps> = ({
  waStats, waNotifications, currentUser, onRetryNotification,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatsCard label="Total" value={waStats?.total || 0} icon="send" color="blue" />
      <StatsCard label="Enviados" value={waStats?.sent || 0} icon="check_circle" color="green" />
      <StatsCard label="Fallidos" value={waStats?.failed || 0} icon="error" color="red" />
      <StatsCard label="Cola" value={waStats?.pending || 0} icon="schedule" color="orange" />
    </div>
    <SectionCard title="Historial de Notificaciones WhatsApp" icon="chat">
      {waNotifications && waNotifications.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-5 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 pb-2 border-b border-white/5">
            <span>Usuario</span>
            <span>Tipo</span>
            <span>Destino</span>
            <span>Estado</span>
            <span className="text-right">Acción</span>
          </div>
          {waNotifications.map((n: any) => (
            <div key={n._id} className="grid grid-cols-5 items-center gap-4 py-2 px-2 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0 text-xs">
              <span className="text-white truncate">@{n.userName}</span>
              <span className="text-gray-400 capitalize">{n.type}</span>
              <span className="text-gray-400">{n.phoneNumber || 'N/A'}</span>
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  n.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' :
                  n.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {n.status.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                {n.status === 'failed' && (
                  <button
                    onClick={() => onRetryNotification(n._id, currentUser?.userId || '')}
                    className="text-emerald-400 hover:text-emerald-300 font-bold"
                    title="Reintentar envio"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 italic">No hay historial de notificaciones</div>
      )}
    </SectionCard>
  </div>
);

export const ConfigSection: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {[
      { icon: 'apps', label: 'Apps', desc: 'Aplicaciones' },
      { icon: 'backup', label: 'Backup', desc: 'Respaldo' },
      { icon: 'download', label: 'Export', desc: 'Exportar' },
      { icon: 'language', label: 'Idiomas', desc: 'i18n' },
      { icon: 'palette', label: 'Apariencia', desc: 'Tema' },
      { icon: 'security', label: 'Seguridad', desc: 'Auth' },
    ].map((item, i) => (
      <div key={i} className="bg-[#1a1c20] rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all cursor-pointer">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-blue-400">{item.icon}</span>
        </div>
        <div className="text-sm font-medium text-white">{item.label}</div>
        <div className="text-[10px] text-gray-500">{item.desc}</div>
      </div>
    ))}
  </div>
);
