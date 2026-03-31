import React from 'react';
import { StatsCard, SectionCard } from './shared';

interface AdsManagementProps {
  adsList: any[];
  activeAds: any[];
  totalClicks: number;
  totalImpressions: number;
  onDeleteAd: (adId: string) => void;
}

export const AdsManagement: React.FC<AdsManagementProps> = ({
  adsList, activeAds, totalClicks, totalImpressions, onDeleteAd,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-3">
      <StatsCard label="Clicks Totales" value={totalClicks.toLocaleString()} icon="touch_app" color="blue" />
      <StatsCard label="Impresiones" value={totalImpressions.toLocaleString()} icon="visibility" color="purple" />
      <StatsCard label="Campañas Activas" value={activeAds.length} icon="campaign" color="green" />
    </div>
    <SectionCard title={`${adsList.length} Campañas`} icon="campaign" actions={<button className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-xs font-medium">+ Nueva</button>}>
      {adsList.length > 0 ? (
        adsList.map((ad: any) => (
          <div key={ad._id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div>
              <div className="text-sm text-white">{ad.titulo || 'Anuncio'}</div>
              <div className="text-[10px] text-gray-500">{ad.sector || 'General'} · {(ad.clicks || 0).toLocaleString()} clicks</div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
              ad.activo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
            }`}>{ad.activo ? 'Activa' : 'Inactiva'}</span>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">No hay campañas</div>
      )}
    </SectionCard>
  </div>
);

interface PropFirmsManagementProps {
  propFirmsList: any[];
  activePropFirms: any[];
}

export const PropFirmsManagement: React.FC<PropFirmsManagementProps> = ({
  propFirmsList, activePropFirms,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatsCard label="Prop Firms" value={propFirmsList.length} icon="account_balance" color="blue" />
      <StatsCard label="Activos" value={activePropFirms.length} icon="check_circle" color="green" />
      <StatsCard label="Inactivos" value={propFirmsList.length - activePropFirms.length} icon="cancel" color="orange" />
      <StatsCard label="Total" value={propFirmsList.length} icon="business" color="purple" />
    </div>
    <SectionCard title={`${propFirmsList.length} Prop Firms`} icon="business">
      {propFirmsList.length > 0 ? (
        propFirmsList.map((firm: any) => (
          <div key={firm._id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              {firm.logoUrl && <img src={firm.logoUrl} alt={firm.name} className="w-8 h-8 rounded object-cover" loading="lazy" decoding="async" />}
              <div>
                <div className="text-sm text-white">{firm.name}</div>
                <div className="text-[10px] text-gray-500">{firm.description?.slice(0, 50)}...</div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
              firm.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
            }`}>{firm.isActive ? 'Activo' : 'Inactivo'}</span>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">No hay prop firms</div>
      )}
    </SectionCard>
  </div>
);

interface ReferralsManagementProps {
  referrals: any[];
  onCompleteReferral: (referralId: string) => void;
}

export const ReferralsManagement: React.FC<ReferralsManagementProps> = ({
  referrals, onCompleteReferral,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatsCard label="Referidos" value={referrals.length} icon="group_add" color="blue" subtitle="Total" />
      <StatsCard label="Completados" value={referrals.filter((r:any) => r.status === 'completed').length} icon="check_circle" color="green" />
      <StatsCard label="Pendientes" value={referrals.filter((r:any) => r.status === 'pending').length} icon="pending" color="orange" />
      <StatsCard label="Comisiones" value={`$${referrals.reduce((sum:number, r:any) => sum + (r.referrerReward || 0), 0)}`} icon="payments" color="purple" subtitle="Total XP/Saldo" />
    </div>
    <SectionCard title="Gestión de Referidos" icon="group_add">
      {referrals.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 pb-2 border-b border-white/5">
            <span>Referente</span>
            <span>Referido</span>
            <span>Estado</span>
            <span className="text-right">Acción</span>
          </div>
          {referrals.map((r: any) => (
            <div key={r._id} className="grid grid-cols-4 items-center gap-4 py-2 px-2 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">@{r.referrerProfile?.usuario?.charAt(0)}</div>
                <span className="text-white">@{r.referrerProfile?.usuario || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px]">@{r.referredProfile?.usuario?.charAt(0)}</div>
                <span className="text-white">@{r.referredProfile?.usuario || 'N/A'}</span>
              </div>
              <div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  r.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  r.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                {r.status === 'pending' && (
                  <button
                    onClick={() => onCompleteReferral(r._id)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold"
                    title="Marcar como completado"
                  >
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 italic">No hay registros de referidos</div>
      )}
    </SectionCard>
  </div>
);
