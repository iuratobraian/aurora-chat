import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import logger from '../utils/logger';
import { Avatar } from './Avatar';

interface CommunityReviewsProps {
  communityId: string;
  userId?: string;
  isMember?: boolean;
}

interface Review {
  _id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: number;
  profile?: {
    nombre: string;
    usuario: string;
    avatar?: string;
  } | null;
}

const StarRating: React.FC<{ rating: number; interactive?: boolean; onChange?: (rating: number) => void }> = ({ 
  rating, 
  interactive = false, 
  onChange 
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`text-xl transition-all ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          {star <= rating ? (
            <span className="text-amber-400">★</span>
          ) : (
            <span className="text-gray-600">☆</span>
          )}
        </button>
      ))}
    </div>
  );
};

const CommunityReviews: React.FC<CommunityReviewsProps> = ({ communityId, userId, isMember = false }) => {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const reviews = useQuery(api.reviews.getCommunityReviews, { 
    communityId: communityId as any 
  }) as Review[] | undefined;

  const ratingInfo = useQuery(api.reviews.getCommunityRating, { 
    communityId: communityId as any 
  });

  const userReview = useQuery(api.reviews.getUserReview, { 
    communityId: communityId as any 
  });

  const createReview = useMutation(api.reviews.createReview);
  const deleteReview = useMutation(api.reviews.deleteReview);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!comment.trim()) {
      setError('Escribe una reseña');
      return;
    }
    
    try {
      await createReview({
        communityId: communityId as any,
        rating,
        comment: comment.trim()
      });
      setComment('');
      setRating(5);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Error al enviar');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('¿Eliminar tu reseña?')) return;
    try {
      await deleteReview({ reviewId: reviewId as any });
    } catch (err) {
      logger.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-white">
              {ratingInfo?.average?.toFixed(1) || '0.0'}
            </span>
            <StarRating rating={Math.round(ratingInfo?.average || 0)} />
            <span className="text-sm text-gray-500">
              ({ratingInfo?.count || 0} reseñas)
            </span>
          </div>
        </div>
        {userId && isMember && !userReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 transition-all"
          >
            Escribir reseña
          </button>
        )}
        {userReview && (
          <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-500">
            Ya reseñaste
          </span>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Tu calificación
            </label>
            <StarRating rating={rating} interactive onChange={setRating} />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Tu reseña
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte tu experiencia con esta comunidad..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-emerald-500/50 resize-none placeholder-gray-600"
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs font-bold">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all"
            >
              Publicar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setComment('');
                setRating(5);
                setError('');
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 text-gray-400 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {reviews?.map((review) => (
          <div key={review._id} className="p-4 rounded-xl bg-white/5 border border-white/10">
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
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                {userId && review.userId === userId && (
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {review.comment}
            </p>
            <p className="text-[10px] text-gray-600 mt-2">
              {new Date(review.createdAt).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        ))}
        {(!reviews || reviews.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2">rate_review</span>
            <p className="text-sm">No hay reseñas todavía</p>
            <p className="text-xs text-gray-600 mt-1">Sé el primero en calificar esta comunidad</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityReviews;
