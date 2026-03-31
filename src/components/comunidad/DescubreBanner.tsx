import React, { memo } from 'react';
import { useNavigate } from 'react-router';

interface DiscoverCommunity {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  currentMembers: number;
  accessType: 'free' | 'paid';
  priceMonthly?: number;
  ownerId: string;
}

interface DescubreBannerProps {
  communities: DiscoverCommunity[];
}

export const DescubreBanner: React.FC<DescubreBannerProps> = memo(({ communities }) => {
  const navigate = useNavigate();

  if (!communities || communities.length === 0) {
    return null;
  }

  const formatMembers = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <section className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-amber-400">explore</span>
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-300">
          Descubre
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {communities.slice(0, 2).map((community) => (
          <div
            key={community._id}
            onClick={() => navigate(`/comunidad/${community.slug}`)}
            className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/20"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ 
                backgroundImage: community.coverImage 
                  ? `url(${community.coverImage})` 
                  : `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-lg bg-amber-500/90 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">star</span>
                VIP
              </span>
            </div>
            <div className="relative p-4 h-32 flex flex-col justify-end">
              <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors truncate">
                {community.name}
              </h3>
              <p className="text-[10px] text-gray-300 line-clamp-2 mt-1 opacity-80">
                {community.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <span className="material-symbols-outlined text-sm">group</span>
                  <span>{formatMembers(community.currentMembers)} miembros</span>
                </div>
                {community.accessType === 'paid' && community.priceMonthly ? (
                  <span className="text-[10px] font-bold text-emerald-400">
                    ${community.priceMonthly}/mes
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-primary">
                    Gratis
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

DescubreBanner.displayName = 'DescubreBanner';

export default DescubreBanner;
