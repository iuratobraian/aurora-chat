import React, { useState, useMemo } from 'react';
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

interface AllCommunitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  communities: Community[];
  usuario: any;
  onLoginRequest?: () => void;
}

const PLAN_FILTERS = ['enterprise', 'scale', 'growth', 'starter', 'free'];
const SIZE_FILTERS = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: '1K-5K', min: 1000, max: 5000 },
  { label: '5K-10K', min: 5000, max: 10000 },
  { label: '10K+', min: 10000, max: Infinity },
];

export const AllCommunitiesModal: React.FC<AllCommunitiesModalProps> = ({
  isOpen,
  onClose,
  communities,
  usuario,
  onLoginRequest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<number>(0);
  const joinMutation = useMutation(api.communities.joinCommunity);
  const { showToast } = useToast();

  const filteredCommunities = useMemo(() => {
    return communities.filter((community) => {
      const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = selectedPlan === 'all' || community.plan === selectedPlan;
      const sizeFilter = SIZE_FILTERS[selectedSize];
      const matchesSize = community.currentMembers >= sizeFilter.min && community.currentMembers <= sizeFilter.max;
      
      return matchesSearch && matchesPlan && matchesSize;
    });
  }, [communities, searchTerm, selectedPlan, selectedSize]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-7xl h-[90vh] bg-[#0f1115] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex">
        {/* Sidebar - Filters */}
        <div className="w-64 flex-shrink-0 border-r border-white/10 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Filtros</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-white">close</span>
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Buscar
            </label>
            <div className="relative">
              <span className="material-symbols-outlined text-gray-500 text-sm absolute left-3 top-1/2 -translate-y-1/2">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-sm text-white outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* Plan Filter */}
          <div className="mb-6">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Plan
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedPlan('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  selectedPlan === 'all'
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Todos
              </button>
              {PLAN_FILTERS.map((plan) => (
                <button
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors capitalize ${
                    selectedPlan === plan
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Tamaño
            </label>
            <div className="space-y-2">
              {SIZE_FILTERS.map((filter, idx) => (
                <button
                  key={filter.label}
                  onClick={() => setSelectedSize(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    selectedSize === idx
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Community Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Todas las Comunidades</h2>
              <p className="text-gray-400 text-sm">{filteredCommunities.length} comunidades encontradas</p>
            </div>
          </div>

          {filteredCommunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">search_off</span>
              <p className="text-gray-400 text-sm">No se encontraron comunidades</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCommunities.map((community) => (
                <div
                  key={community._id}
                  onClick={() => handleVisit(community.slug)}
                  className="group glass rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={community.coverImage || `https://source.unsplash.com/random/400x225/?community`}
                      alt={community.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-sm font-black text-white mb-1">{community.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-xs">group</span>
                        <span className="text-gray-300 text-[10px]">{formatMembers(community.currentMembers)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-gray-400 text-[10px] line-clamp-2 mb-3">{community.description}</p>
                    <button
                      onClick={(e) => handleJoin(community._id, e)}
                      className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Ver Comunidad
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllCommunitiesModal;
