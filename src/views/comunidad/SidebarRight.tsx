import React from 'react';
import RandomTemplateAd from '../../components/ads/RandomTemplateAd';
import { SidebarLeaderboardSection } from './SidebarLeaderboardSection';
import { SidebarCommunitiesSection } from './SidebarCommunitiesSection';
import { CommunitySlider } from './CommunitySlider';
import { DailyPollResults } from './DailyPollResults';
import { VerticalAdBanner, PartnerCard } from './';
import { Ad, Herramienta } from '../../types';

interface SidebarRightProps {
  topUsers: any[];
  trendingCommunities: any[];
  dynamicPartners: any[];
  ads: Ad[];
  coursesAd: Ad;
  botAd: Ad;
  extraSidebarAds: Ad[];
  isVip: boolean;
  isAdmin: boolean;
  usuario: any;
  onNavigate: (path: string) => void;
  onVisitProfile: (id: string) => void;
  onCreateCommunity: () => void;
  onEditAd: (ad: Ad) => void;
  activeSignals?: any[];
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  topUsers,
  trendingCommunities,
  dynamicPartners,
  ads,
  coursesAd,
  botAd,
  extraSidebarAds,
  isVip,
  isAdmin,
  usuario,
  onNavigate,
  onVisitProfile,
  onCreateCommunity,
  onEditAd,
  activeSignals
}) => {
  return (
    <div className="lg:col-span-3 space-y-6">
      {/* Publicidad Rotativa - Plantillas */}
      <RandomTemplateAd className="w-full" interval={8} />

      {/* Membresías - Compacta */}
      <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-amber-400 text-lg">workspace_premium</span>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Membresías</span>
        </div>
        <button
          onClick={() => onNavigate('pricing')}
          className="w-full py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow-lg border border-gray-700/50"
        >
          Ver Planes
        </button>
      </div>

      {/* Top Traders + Communities - Clean Sidebar */}
      {topUsers.length > 0 && (
        <SidebarLeaderboardSection 
          users={topUsers.map(u => ({
            id: u.userId || u.id || '',
            nombre: u.nombre || '',
            avatar: u.avatar || u.avatarUrl,
            xp: u.xp || 0,
            nivel: u.level?.level || u.nivel,
            streak: u.streak,
            role: u.role
          }))}
          currentUserId={usuario?.id}
          onVisitProfile={onVisitProfile} 
        />
      )}

      {/* Daily Poll Results */}
      <DailyPollResults />

      {/* Crear Comunidad Button */}
      <button
        onClick={onCreateCommunity}
        className="w-full glass rounded-xl p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="material-symbols-outlined text-white text-lg">add</span>
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-[11px] font-black text-violet-400 group-hover:text-violet-300 uppercase tracking-tighter">Tu Comunidad</h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Crea tu propio espacio</p>
          </div>
          <span className="material-symbols-outlined text-gray-500 group-hover:text-violet-400 transition-colors">chevron_right</span>
        </div>
      </button>

      {trendingCommunities.length > 0 && (
        <CommunitySlider 
          communities={trendingCommunities} 
          onVisitCommunity={(slug) => onNavigate(`comunidad/${slug}`)} 
        />
      )}

      {/* Dynamic Promo from DB */}
      {coursesAd && (
        <VerticalAdBanner
          title={coursesAd.titulo}
          description={coursesAd.descripcion}
          imageUrl={coursesAd.imagenUrl}
          link={coursesAd.link || "#"}
          label={coursesAd.subtitle || "CURSO VIP"}
          onEdit={() => onEditAd(coursesAd)}
          isAdmin={isAdmin}
        />
      )}

      {botAd && (
        <VerticalAdBanner
          title={botAd.titulo}
          description={botAd.descripcion}
          imageUrl={botAd.imagenUrl}
          link={botAd.link || "#"}
          label={botAd.subtitle || "AUTO TRADING"}
          onEdit={() => onEditAd(botAd)}
          isAdmin={isAdmin}
        />
      )}

      {/* Partners section */}
      {dynamicPartners.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-sm text-gray-500">handshake</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Brokers Asociados</span>
          </div>
          <div className="space-y-2">
            {dynamicPartners.slice(0, 2).map((partner) => (
              <PartnerCard
                key={partner.id || partner._id}
                name={partner.nombre}
                logo={partner.logo || partner.imagen}
                url={partner.link || partner.url}
                benefit={partner.beneficio || partner.metadata?.benefit || partner.descripcion}
              />
            ))}
          </div>
        </div>
      )}

      {/* Extra Ads */}
      {extraSidebarAds.map(ad => (
        <VerticalAdBanner
          key={ad.id}
          title={ad.titulo}
          description={ad.descripcion}
          imageUrl={ad.imagenUrl}
          link={ad.link || "#"}
          label={ad.subtitle || "PROMO"}
          onEdit={() => onEditAd(ad)}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
};
