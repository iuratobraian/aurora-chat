import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ReviewStars } from './ReviewStars';
import { Avatar } from './Avatar';

interface ProductReviewListProps {
  strategyId: string;
  userId?: string;
}

interface Review {
  _id: string;
  userId: string;
  strategyId: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: number;
  profile?: {
    nombre: string;
    usuario: string;
    avatar?: string;
  } | null;
}

export const ProductReviewList: React.FC<ProductReviewListProps> = ({
  strategyId,
  userId,
}) => {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');

  const reviews = useQuery(api.productReviews.getReviewsByStrategy, {
    strategyId,
  }) as Review[] | undefined;

  const ratingInfo = useQuery(api.productReviews.getStrategyRating, {
    strategyId,
  });

  const markHelpful = useMutation(api.productReviews.markReviewHelpful);

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await markHelpful({ reviewId });
    } catch (err: any) {
      console.error('Error marking helpful:', err);
    }
  };

  const filteredReviews = reviews?.filter((review) => {
    if (filterRating && review.rating !== filterRating) return false;
    return true;
  });

  const sortedReviews = filteredReviews?.sort((a, b) => {
    if (sortBy === 'helpful') {
      return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    }
    return b.createdAt - a.createdAt;
  });

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews?.filter((r) => r.rating === rating).length || 0;
    const total = reviews?.length || 0;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-5xl font-black text-white mb-2">
              {ratingInfo?.average?.toFixed(1) || '0.0'}
            </div>
            <ReviewStars rating={Math.round(ratingInfo?.average || 0)} size="lg" />
            <div className="text-sm text-gray-500 mt-1">
              {ratingInfo?.count || 0} reseñas
            </div>
          </div>

          <div className="flex-1 space-y-1">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className={`w-full flex items-center gap-2 transition-all ${
                  filterRating === rating ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <span className="text-xs font-bold text-gray-400 w-3">{rating}★</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/10">
          <span className="text-xs font-bold text-gray-500 uppercase">Filtrar:</span>
          <div className="flex gap-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterRating === rating
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {rating}★
              </button>
            ))}
            {filterRating && (
              <button
                onClick={() => setFilterRating(null)}
                className="px-3 py-1 bg-white/5 text-gray-400 hover:bg-white/10 rounded-lg text-xs font-bold"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'helpful')}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs font-bold text-white outline-none focus:border-primary/50"
            >
              <option value="recent">Más recientes</option>
              <option value="helpful">Más útiles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {sortedReviews?.map((review) => (
          <div
            key={review._id}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={review.profile?.avatar}
                  name={review.profile?.nombre || 'Usuario'}
                  seed={review.userId}
                  size="md"
                  rounded="lg"
                  className="bg-white/5"
                />
                <div>
                  <p className="font-bold text-white text-sm">
                    {review.profile?.nombre || 'Usuario'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    @{review.profile?.usuario || 'unknown'}
                  </p>
                </div>
                {review.isVerifiedPurchase && (
                  <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Compra verificada
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ReviewStars rating={review.rating} size="sm" />
                <span className="text-[10px] text-gray-600">
                  {new Date(review.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">{review.comment}</p>

            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => handleMarkHelpful(review._id)}
                className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-sm">thumb_up</span>
                <span className="text-xs font-bold">{review.helpfulCount || 0}</span>
              </button>
            </div>
          </div>
        ))}

        {(!sortedReviews || sortedReviews.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2">rate_review</span>
            <p className="text-sm">No hay reseñas todavía</p>
            <p className="text-xs text-gray-600 mt-1">Sé el primero en calificar este producto</p>
          </div>
        )}
      </div>
    </div>
  );
};
