import React from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '../ToastProvider';

interface Community {
  _id: string;
  name: string;
  slug: string;
  description: string;
  currentMembers: number;
  plan?: string;
  coverImage?: string;
}

interface CommunityTopSectionProps {
  communities: Community[];
  usuario: any;
  onVisitProfile?: (id: string) => void;
  onLoginRequest?: () => void;
}

const PLAN_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  enterprise: { color: 'from-yellow-500 via-amber-500 to-orange-500', label: 'Enterprise', icon: 'workspace_premium' },
  scale: { color: 'from-purple-500 via-violet-500 to-fuchsia-500', label: 'Scale', icon: 'trending_up' },
  growth: { color: 'from-blue-500 via-cyan-500 to-teal-500', label: 'Growth', icon: 'show_chart' },
  starter: { color: 'from-emerald-500 via-green-500 to-teal-500', label: 'Starter', icon: 'rocket_launch' },
  free: { color: 'from-gray-500 via-gray-400 to-gray-300', label: 'Free', icon: 'public' },
};

export const CommunityTopSection: React.FC<CommunityTopSectionProps> = ({
  communities,
  usuario,
  onVisitProfile,
  onLoginRequest,
}) => {
  const joinMutation = useMutation(api.communities.joinCommunity);
  const { showToast } = useToast();

  const handleJoin = async (communityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!usuario) {
      onLoginRequest?.();
      return;
    }
    try {
      await joinMutation({ communityId, userId: usuario.id } as any);
      showToast('success', '¡Te has unido a la comunidad!');
    } catch (err: any) {
      showToast('error', err.message || 'Error al unirse');
    }
  };

  const handleVisit = (slug: string) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: `/comunidad/${slug}` }));
  };

  const formatMembers = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (!communities || communities.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary text-3xl">emoji_events</span>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Top Comunidades</h2>
          <p className="text-gray-400 text-sm">Las comunidades más destacadas de la plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.slice(0, 3).map((community, index) => {
          const plan = PLAN_CONFIG[community.plan || 'free'];
          
          return (
            <div
              key={community._id}
              onClick={() => handleVisit(community.slug)}
              className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20"
            >
              {/* Cover Image */}
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={community.coverImage || `https://source.unsplash.com/random/800x450/?community,${index}`}
                  alt={community.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Plan Badge */}
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${plan.color} text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1`}>
                    <span className="material-symbols-outlined text-xs">{plan.icon}</span>
                    {plan.label}
                  </div>
                </div>

                {/* Trending Badge */}
                {index === 0 && (
                  <div className="absolute top-3 left-3">
                    <div className="px-3 py-1.5 rounded-full bg-yellow-500 text-white text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">trending_up</span>
                      #1 Trending
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-xl font-black text-white mb-1 group-hover:text-primary transition-colors">
                  {community.name}
                </h3>
                <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                  {community.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400 text-sm">group</span>
                    <span className="text-gray-300 text-xs font-bold">{formatMembers(community.currentMembers)} miembros</span>
                  </div>
                  
                  <button
                    onClick={(e) => handleJoin(community._id, e)}
                    className="px-4 py-2 bg-primary hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-primary/50"
                  >
                    {usuario ? 'Unirse' : 'Ver'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CommunityTopSection;
