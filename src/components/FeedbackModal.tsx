import React, { memo, useState, useCallback } from 'react';
import {
  FeedbackCategory,
  getFeedbackQuestions,
  submitFeedback,
  FeedbackSubmission,
} from '../services/feedback';
import { StorageService } from '../services/storage';

interface FeedbackModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = memo(({
  isVisible,
  onClose,
  userId,
  userName,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = getFeedbackQuestions();
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = useCallback((answer: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  }, [currentQuestion.id]);

  const handleNext = useCallback(() => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, questions.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const submission: FeedbackSubmission = {
        userId,
        rating: answers.overall || 3,
        category: (answers.category as FeedbackCategory) || 'general',
        comments: answers.comments || answers.missing,
        featuresUsed: Array.isArray(answers.features) ? answers.features : [],
        wouldRecommend: answers.recommend?.includes('sí') || answers.recommend?.includes('Si'),
        timestamp: Date.now(),
      };

      await submitFeedback(submission, localStorage);
      localStorage.setItem(`feedback_last_${userId}`, Date.now().toString());
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Feedback submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, userId, onClose]);

  const canProceed = currentQuestion.required ? !!answers[currentQuestion.id] : true;
  const isLastQuestion = currentStep === questions.length - 1;

  if (!isVisible) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="relative w-full max-w-md bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/30 rounded-2xl shadow-2xl p-8 text-center">
          <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-emerald-400 text-4xl">check_circle</span>
          </div>
          <h2 className="text-xl font-black text-white mb-2">¡Gracias por tu feedback!</h2>
          <p className="text-sm text-gray-300">Tu opinión nos ayuda a mejorar TradeHub.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#0f1115] to-[#1a1d21] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-primary">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div className="p-6 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="material-symbols-outlined text-white text-xl">rate_review</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Tu Feedback</h2>
              <p className="text-xs text-gray-400">
                {userName ? `Hola ${userName}, ayúdanos a mejorar` : 'Ayúdanos a mejorar'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-200 font-medium mb-4">
              {currentQuestion.question}
            </p>

            {currentQuestion.type === 'rating' && (
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleAnswer(rating)}
                    className={`size-12 rounded-xl border-2 flex items-center justify-center text-lg font-black transition-all ${
                      answers[currentQuestion.id] === rating
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'select' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                      answers[currentQuestion.id] === option
                        ? 'border-primary bg-primary/20 text-white'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Escribe tus comentarios aquí..."
                className="w-full h-24 p-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder-gray-500 resize-none focus:outline-none focus:border-primary transition-colors"
              />
            )}
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-bold transition-all border border-white/10"
              >
                Atrás
              </button>
            )}
            <button
              onClick={isLastQuestion ? handleSubmit : handleNext}
              disabled={!canProceed || isSubmitting}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                canProceed && !isSubmitting
                  ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-primary/20'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : isLastQuestion ? (
                'Enviar Feedback'
              ) : (
                'Continuar'
              )}
            </button>
          </div>

          <p className="text-center text-[10px] text-gray-500 mt-4">
            {currentStep + 1} de {questions.length}
          </p>
        </div>
      </div>
    </div>
  );
});

FeedbackModal.displayName = 'FeedbackModal';

export default FeedbackModal;
