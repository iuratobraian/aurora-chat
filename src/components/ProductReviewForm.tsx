import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ReviewStars } from './ReviewStars';
import { useToast } from './ToastProvider';

interface ProductReviewFormProps {
  strategyId: string;
  userId: string;
  onSuccess?: () => void;
}

export const ProductReviewForm: React.FC<ProductReviewFormProps> = ({
  strategyId,
  userId,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const createReview = useMutation(api.productReviews.createReview);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!comment.trim()) {
      setError('Por favor escribe un comentario');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('La calificación debe estar entre 1 y 5');
      return;
    }

    setIsSubmitting(true);

    try {
      await createReview({
        strategyId,
        rating,
        comment: comment.trim(),
      });

      showToast('success', '¡Reseña publicada exitosamente!');
      setComment('');
      setRating(5);
      onSuccess?.();
    } catch (err: any) {
      showToast('error', err.message || 'Error al publicar reseña');
      setError(err.message || 'Error al publicar reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
          Tu calificación
        </label>
        <ReviewStars rating={rating} interactive onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
          Tu reseña
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comparte tu experiencia con este producto..."
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-primary/50 resize-none placeholder-gray-600"
          maxLength={1000}
        />
        <div className="flex justify-end mt-1">
          <span className="text-[10px] text-gray-600">{comment.length}/1000</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-xs font-bold">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Publicando...' : 'Publicar Reseña'}
        </button>
        <button
          type="button"
          onClick={() => {
            setComment('');
            setRating(5);
            setError('');
          }}
          className="px-6 py-3 bg-white/5 border border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition-all"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
