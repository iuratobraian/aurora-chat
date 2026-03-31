import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import logger from '../utils/logger';

interface AuctionWithSlot {
  _id: any;
  auctionId: string;
  slotId: any;
  auctionType: string;
  currentBid: number;
  currency: string;
  startsAt: number;
  endsAt: number;
  status: string;
  winnerId?: string;
  targeting: any;
  slot?: any;
}

const AdAuctionView: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'auctions' | 'campaigns' | 'create'>('auctions');
  const [bidAmount, setBidAmount] = useState<Record<string, string>>({});

  const auctions = useQuery(api.adAuction.getActiveAuctions) || [];
  const slots = useQuery(api.adAuction.getActiveSlots) || [];
  const stats = useQuery(api.adAuction.getAuctionStats);

  const placeBid = useMutation(api.adAuction.placeBid);
  const createCampaign = useMutation(api.adAuction.createCampaign);

  const formatTimeRemaining = (endsAt: number) => {
    const diff = endsAt - Date.now();
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const handlePlaceBid = async (auctionId: any, slotId: any) => {
    const amount = parseFloat(bidAmount[auctionId] || '0');
    if (amount <= 0) return;

    try {
      await placeBid({
        auctionId: auctionId as any,
        campaignId: auctionId as any,
        amount,
        bidType: 'cpm',
        bidderId: 'demo_advertiser',
      });
      setBidAmount((prev: Record<string, string>) => ({ ...prev, [auctionId]: '' }));
    } catch (error) {
      logger.error('Error placing bid:', error);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            📢 Publicidad
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sistema de subastas publicitarias
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass rounded-xl px-4 py-2 bg-white/5">
            <p className="text-xs text-gray-500 uppercase">Subastas Activas</p>
            <p className="text-xl font-black text-primary">{stats?.activeAuctions || 0}</p>
          </div>
          <div className="glass rounded-xl px-4 py-2 bg-white/5">
            <p className="text-xs text-gray-500 uppercase">Total Gastado</p>
            <p className="text-xl font-black text-green-400">
              {formatCurrency(stats?.totalSpent || 0, 'USD')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'auctions', label: 'Subastas', icon: 'gavel' },
          { id: 'campaigns', label: 'Campañas', icon: 'campaign' },
          { id: 'create', label: 'Crear', icon: 'add' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === 'auctions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {auctions.map((auction: AuctionWithSlot) => (
              <div
                key={auction._id}
                className="glass rounded-2xl p-4 bg-black/40 border border-white/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {auction.slot?.name || 'Ad Slot'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        auction.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : auction.status === 'scheduled'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {auction.status}
                      </span>
                      <span className="text-xs text-gray-500 uppercase">
                        {auction.auctionType?.toUpperCase() || 'CPM'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Bid Actual</p>
                    <p className="text-xl font-black text-primary">
                      {formatCurrency(auction.currentBid, auction.currency)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="glass rounded-lg p-2 bg-white/5">
                    <p className="text-gray-500">Slot Size</p>
                    <p className="font-bold text-white">
                      {auction.slot?.size?.width}x{auction.slot?.size?.height}
                    </p>
                  </div>
                  <div className="glass rounded-lg p-2 bg-white/5">
                    <p className="text-gray-500">Termina en</p>
                    <p className="font-bold text-white">
                      {formatTimeRemaining(auction.endsAt)}
                    </p>
                  </div>
                </div>

                {auction.slot?.type && (
                  <div className="flex gap-2 mb-4">
                    <span className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400 capitalize">
                      {auction.slot.type}
                    </span>
                    <span className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400">
                      {auction.slot.page}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={`Min ${(auction.currentBid || 0) + 0.01}`}
                    value={bidAmount[auction._id] || ''}
                    onChange={(e) => setBidAmount((prev: Record<string, string>) => ({
                      ...prev,
                      [auction._id]: e.target.value
                    }))}
                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-primary outline-none"
                  />
                  <button
                    onClick={() => handlePlaceBid(auction._id, auction.slotId)}
                    disabled={auction.status !== 'active'}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Pujar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {auctions.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">gavel</span>
              <h3 className="text-xl font-bold text-white mb-2">No hay subastas activas</h3>
              <p className="text-gray-500">Crea una nueva campaña para comenzar a pujar</p>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'campaigns' && (
        <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Mis Campañas</h3>
            <button
              onClick={() => setSelectedTab('create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold"
            >
              <span className="material-symbols-outlined">add</span>
              Nueva Campaña
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-xs text-gray-500 uppercase">Campañas Activas</p>
              <p className="text-2xl font-black text-white">{stats?.totalCampaigns || 0}</p>
            </div>
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-xs text-gray-500 uppercase">Impresiones Totales</p>
              <p className="text-2xl font-black text-white">
                {(stats?.totalImpressions || 0).toLocaleString()}
              </p>
            </div>
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-xs text-gray-500 uppercase">CTR Promedio</p>
              <p className="text-2xl font-black text-primary">{stats?.avgCTR || 0}%</p>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'create' && (
        <CreateCampaignForm onSuccess={() => setSelectedTab('campaigns')} onCancel={() => setSelectedTab('auctions')} slots={slots} />
      )}
    </div>
  );
};

interface CreateCampaignFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  slots: any[];
}

const CreateCampaignForm: React.FC<CreateCampaignFormProps> = ({ onSuccess, onCancel, slots }) => {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('100');
  const [targeting, setTargeting] = useState({
    countries: ['US', 'ES', 'MX'],
    subscriptionTiers: ['free', 'pro', 'elite'],
  });

  const createCampaign = useMutation(api.adAuction.createCampaign);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createCampaign({
        advertiserId: 'demo_advertiser',
        name,
        ads: [{
          adId: `ad_${Date.now()}`,
          title: 'Sample Ad',
          description: 'Sample description',
          imageUrl: 'https://picsum.photos/600/400',
          link: '/',
          ctaText: 'Learn More',
        }],
        budget: parseFloat(budget),
        budgetType: 'total',
        targeting,
      });
      onSuccess();
    } catch (error) {
      logger.error('Error creating campaign:', error);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 bg-black/40 border border-white/10 max-w-2xl">
      <h3 className="text-lg font-bold text-white mb-6">Crear Nueva Campaña</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 uppercase font-bold block mb-2">
            Nombre de Campaña
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi primera campaña"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase font-bold block mb-2">
            Presupuesto Total (USD)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            min="10"
            step="10"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase font-bold block mb-2">
            Targeting
          </label>
          <div className="glass rounded-xl p-4 bg-white/5 space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-2">Países</p>
              <div className="flex flex-wrap gap-2">
                {['US', 'ES', 'MX', 'BR', 'AR', 'CO'].map(country => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => {
                      const countries = targeting.countries.includes(country)
                        ? targeting.countries.filter(c => c !== country)
                        : [...targeting.countries, country];
                      setTargeting(prev => ({ ...prev, countries }));
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      targeting.countries.includes(country)
                        ? 'bg-primary text-white'
                        : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            Crear Campaña
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdAuctionView;
