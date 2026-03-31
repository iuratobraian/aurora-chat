import React, { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import logger from '../../utils/logger';

interface AdFeedItemProps {
  campaign: {
    _id: string;
    titulo: string;
    descripcion: string;
    imagenUrl: string;
    link: string;
    sector: string;
  };
  variant?: {
    ctaText?: string;
    ctaColor?: string;
    displayStyle?: string;
  };
  onImpression: () => void;
  onClick: () => void;
}

export const AdFeedItem: React.FC<AdFeedItemProps> = ({
  campaign,
  variant,
  onImpression,
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const recordImpression = useMutation(api.adTracking.recordAdImpression);
  const recordClick = useMutation(api.adTracking.recordAdClick);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      onImpression();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = async () => {
    try {
      await recordClick({
        campaignId: campaign._id,
        userId: 'anonymous', // Should be passed from parent
      });
      onClick();
      window.open(campaign.link, '_blank', 'noopener,noreferrer');
    } catch (error) {
      logger.error('[AdFeedItem] Click tracking failed:', error);
      window.open(campaign.link, '_blank', 'noopener,noreferrer');
    }
  };

  const ctaText = variant?.ctaText || 'Saber Más';
  const ctaColor = variant?.ctaColor || 'from-purple-600 to-indigo-600';
  const displayStyle = variant?.displayStyle || 'standard';

  return (
    <div
      className={`my-6 rounded-2xl overflow-hidden border border-white/10 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${
        displayStyle === 'minimal'
          ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50'
          : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl'
      } hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10`}
    >
      {/* Ad Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Promocionado
          </span>
          {campaign.sector && (
            <span className="text-[8px] text-gray-500 uppercase tracking-wider">
              • {campaign.sector}
            </span>
          )}
        </div>
      </div>

      {/* Ad Content */}
      <div className="p-5">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Image */}
          {campaign.imagenUrl && (
            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={campaign.imagenUrl}
                alt={campaign.titulo}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://picsum.photos/seed/ad/400/300';
                }}
              />
            </div>
          )}

          {/* Text Content */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                {campaign.titulo}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                {campaign.descripcion}
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleClick}
              className={`self-start px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r ${ctaColor} text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95`}
            >
              {ctaText}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline-block ml-2"
              >
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
