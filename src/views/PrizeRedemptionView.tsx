import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { useToast } from '../components/ToastProvider';
import { getSessionUser } from '../utils/sessionManager';
import logger from '../utils/logger';

interface Prize {
  _id: Id<"prizes_catalog">;
  name: string;
  description: string;
  costInCredits: number;
  category: 'subscription' | 'badge' | 'cash' | 'feature' | 'exclusive';
  imageUrl?: string;
  stock?: number;
  isActive: boolean;
  metadata?: any;
}

interface Redemption {
  _id: Id<"prize_redemptions">;
  userId: string;
  prizeId: Id<"prizes_catalog">;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'rejected';
  creditsSpent: number;
  metadata?: any;
  processedBy?: string;
  processedAt?: number;
  rejectionReason?: string;
  createdAt: number;
  updatedAt?: number;
  prize?: {
    name: string;
    description: string;
    imageUrl?: string;
    category: string;
  } | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  subscription: '💎',
  badge: '🏅',
  cash: '💰',
  feature: '⚡',
  exclusive: '👑',
};

const CATEGORY_COLORS: Record<string, string> = {
  subscription: 'from-purple-500 to-indigo-600',
  badge: 'from-yellow-400 to-orange-500',
  cash: 'from-green-400 to-emerald-600',
  feature: 'from-blue-400 to-cyan-500',
  exclusive: 'from-pink-500 to-rose-600',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const PrizeCard: React.FC<{
  prize: Prize;
  userCredits: number;
  onRedeem: (prizeId: Id<"prizes_catalog">) => void;
}> = ({ prize, userCredits, onRedeem }) => {
  const canAfford = userCredits >= prize.costInCredits;
  const isOutOfStock = prize.stock !== undefined && prize.stock !== null && prize.stock <= 0;
  const isDisabled = !prize.isActive || isOutOfStock;

  return (
    <div className="relative group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
      {/* Category Badge */}
      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${CATEGORY_COLORS[prize.category]} text-white shadow-lg`}>
        {CATEGORY_ICONS[prize.category]} {prize.category.charAt(0).toUpperCase() + prize.category.slice(1)}
      </div>

      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-gray-700/50 to-gray-800/50 flex items-center justify-center overflow-hidden">
        {prize.imageUrl ? (
          <img
            src={prize.imageUrl}
            alt={prize.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/prize/400/300';
            }}
          />
        ) : (
          <div className="text-6xl">{CATEGORY_ICONS[prize.category]}</div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
          {prize.name}
        </h3>
        
        <p className="text-gray-400 text-sm line-clamp-2">
          {prize.description}
        </p>

        {/* Stock Info */}
        {prize.stock !== undefined && prize.stock !== null && (
          <div className={`text-sm ${prize.stock <= 5 ? 'text-red-400 font-semibold' : 'text-gray-500'}`}>
            {prize.stock <= 5 ? '🔥 ' : ''}Stock: {prize.stock} {prize.stock <= 5 ? 'remaining!' : ''}
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              {prize.costInCredits.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400">credits</span>
          </div>

          <button
            onClick={() => onRedeem(prize._id)}
            disabled={!canAfford || isDisabled}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
              canAfford && !isDisabled
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-purple-500/50'
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            {!canAfford ? 'Insufficient Credits' : isOutOfStock ? 'Out of Stock' : 'Redeem'}
          </button>
        </div>

        {/* User Credits Indicator */}
        <div className={`text-xs text-center pt-2 ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
          {canAfford ? '✓ You can afford this' : `Need ${prize.costInCredits - userCredits} more credits`}
        </div>
      </div>
    </div>
  );
};

const RedemptionHistory: React.FC<{ redemptions: Redemption[] }> = ({ redemptions }) => {
  if (redemptions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-5xl mb-4">📦</div>
        <p>No redemptions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {redemptions.map((redemption) => (
        <div
          key={redemption._id}
          className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              {redemption.prize?.imageUrl ? (
                <img
                  src={redemption.prize.imageUrl}
                  alt={redemption.prize.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-2xl">
                  {CATEGORY_ICONS[redemption.prize?.category || 'subscription']}
                </div>
              )}
              
              <div className="flex-1">
                <h4 className="font-semibold text-white">{redemption.prize?.name || 'Unknown Prize'}</h4>
                <p className="text-sm text-gray-400 line-clamp-1">{redemption.prize?.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{new Date(redemption.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="text-yellow-400">{redemption.creditsSpent} credits</span>
                </div>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${STATUS_COLORS[redemption.status]}`}>
              {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
            </div>
          </div>

          {redemption.status === 'rejected' && redemption.rejectionReason && (
            <div className="mt-3 pt-3 border-t border-red-500/20">
              <p className="text-xs text-red-400">
                <strong>Reason:</strong> {redemption.rejectionReason}
              </p>
            </div>
          )}

          {redemption.status === 'completed' && redemption.processedAt && (
            <div className="mt-3 pt-3 border-t border-green-500/20">
              <p className="text-xs text-green-400">
                Processed on {new Date(redemption.processedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const PrizeRedemptionView: React.FC = () => {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showHistory, setShowHistory] = useState(false);
  const usuario = getSessionUser();

  // Queries
  const prizes = useQuery(
    api.prizes.getAvailablePrizes,
    selectedCategory !== 'all' ? { category: selectedCategory as any } : {}
  ) || [];
  
  const userCredits = useQuery(
    api.communities.getUserCredits,
    usuario?.id ? { userId: usuario.id } : "skip"
  ) || 0;

  const redemptions = useQuery(
    api.prizes.getUserRedemptions,
    usuario?.id ? { userId: usuario.id } : "skip"
  ) || [];

  // Mutations
  const redeemPrize = useMutation(api.prizes.redeemPrize);

  const handleRedeem = async (prizeId: Id<"prizes_catalog">) => {
    if (!usuario || usuario.id === 'guest') {
      showToast('error', 'Please log in to redeem prizes');
      return;
    }

    try {
      const result = await redeemPrize({ prizeId });
      showToast('success', 'Prize redeemed successfully! Check your redemption history.');
      logger.info('[PrizeRedemption] Redeemed prize:', prizeId, result);
    } catch (error: any) {
      logger.error('[PrizeRedemption] Redemption failed:', error);
      showToast('error', error.message || 'Failed to redeem prize');
    }
  };

  const filteredPrizes = useMemo(() => {
    if (selectedCategory === 'all') return prizes;
    return prizes.filter(p => p.category === selectedCategory);
  }, [prizes, selectedCategory]);

  const categories = ['all', 'subscription', 'badge', 'cash', 'feature', 'exclusive'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mb-4">
            🏆 Prize Redemption
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            Exchange your credits for exclusive rewards
          </p>

          {/* Credits Display */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl px-8 py-4">
            <span className="text-4xl">💰</span>
            <div>
              <div className="text-sm text-gray-400">Your Credits</div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                {userCredits.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setShowHistory(false)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              !showHistory
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            Available Prizes
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              showHistory
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            My Redemptions ({redemptions.filter(r => r.status === 'pending' || r.status === 'processing').length})
          </button>
        </div>

        {!showHistory ? (
          <>
            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {category === 'all' ? '🌟 All' : `${CATEGORY_ICONS[category]} ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                </button>
              ))}
            </div>

            {/* Prizes Grid */}
            {filteredPrizes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrizes.map((prize) => (
                  <PrizeCard
                    key={prize._id}
                    prize={prize}
                    userCredits={userCredits}
                    onRedeem={handleRedeem}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl">No prizes available in this category</p>
              </div>
            )}
          </>
        ) : (
          /* Redemption History */
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Redemption History</h2>
            <RedemptionHistory redemptions={redemptions} />
          </div>
        )}

        {/* Admin Section */}
        {usuario && usuario.rol === 'admin' && (
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">🔧 Admin Panel</h2>
              <p className="text-gray-400">Manage prizes and redemptions</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/admin/prizes"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Manage Prizes Catalog
              </a>
              <a
                href="/admin/redemptions"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all"
              >
                Review Redemptions
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrizeRedemptionView;
