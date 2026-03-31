import React, { useState } from 'react';
import { PaymentModal } from '../PaymentModal';

interface PremiumCommunity {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
  imageUrl?: string;
  memberCount?: number;
}

interface CommunityCardProps {
  community: PremiumCommunity;
  hasAccess: boolean;
  onPurchase: (communityId: string) => void;
}

function CommunityCard({ community, hasAccess, onPurchase }: CommunityCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-white/10">
      {community.imageUrl && (
        <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${community.imageUrl})` }} />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-white">{community.name}</h3>
          {hasAccess && (
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
              Miembro
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-4">{community.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {community.features.slice(0, 3).map((feature, i) => (
            <span key={i} className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded">
              {feature}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-white">
              ${community.price.toLocaleString('es-AR')}
            </span>
            <span className="text-gray-400 text-sm"> / {community.durationDays} días</span>
          </div>
          {!hasAccess && (
            <button
              onClick={() => onPurchase(community._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Unirse
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface PremiumCommunitiesProps {
  communities: PremiumCommunity[];
  userAccess: string[];
  userId: string;
  email: string;
  onPurchaseSuccess?: () => void;
}

export function PremiumCommunitiesSelector({
  communities,
  userAccess,
  userId,
  email,
  onPurchaseSuccess,
}: PremiumCommunitiesProps) {
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  const handlePurchase = (communityId: string) => {
    setSelectedCommunity(communityId);
  };

  const handleSuccess = () => {
    setSelectedCommunity(null);
    onPurchaseSuccess?.();
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <CommunityCard
            key={community._id}
            community={community}
            hasAccess={userAccess.includes(community._id)}
            onPurchase={handlePurchase}
          />
        ))}
      </div>

      {selectedCommunity && (
        <PaymentModal
          isOpen={true}
          onClose={() => setSelectedCommunity(null)}
          userId={userId}
          email={email}
          type="subscription"
          itemId={selectedCommunity}
          itemName={
            communities.find(c => c._id === selectedCommunity)?.name || 'Comunidad Premium'
          }
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
