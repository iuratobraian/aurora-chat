import React, { memo, useState, useCallback } from 'react';
import { Usuario } from '../types';
import DonationModal from './postcard/DonationModal';

interface PostPointsProps {
  usuario: Usuario | null;
  postId: string;
  userPointsGiven: number;
  totalPoints: number;
  onGivePoints: (postId: string, points: number) => void;
  authorName: string;
}

const PostPoints: React.FC<PostPointsProps> = memo(({
  usuario,
  postId,
  userPointsGiven,
  totalPoints,
  onGivePoints,
  authorName
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [animating, setAnimating] = useState<number | null>(null);

  const getAvailableCoins = useCallback((): number => {
    if (!usuario || usuario.id === 'guest') return 0;
    return usuario.dailyFreeCoinsBalance || 0;
  }, [usuario]);

  const handleGiveCoins = useCallback((coins: number) => {
    const available = getAvailableCoins();
    if (coins <= 0 || coins > available) return;
    
    setAnimating(coins);
    setTimeout(() => setAnimating(null), 500);
    
    onGivePoints(postId, coins);
    setShowSelector(false);
    setShowDonationModal(false);
  }, [postId, onGivePoints, getAvailableCoins]);

  const availableCoins = getAvailableCoins();
  const hasCoinsToGive = availableCoins > 0;
  const isLoggedIn = usuario && usuario.id !== 'guest';

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-amber-400 bg-amber-400/10 border border-amber-400/20">
        <span className="material-symbols-outlined text-[14px]">monetization_on</span>
        <span className="text-[10px] font-black">{totalPoints}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowSelector(!showSelector)}
        disabled={!hasCoinsToGive}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all shadow-lg ${
          hasCoinsToGive
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-black hover:scale-105 active:scale-95'
            : 'bg-white/5 text-gray-500 cursor-default grayscale opacity-50'
        }`}
        title={hasCoinsToGive ? `${availableCoins} monedas disponibles` : 'Sin monedas disponibles'}
      >
        <span className={`material-symbols-outlined text-base ${animating ? 'animate-bounce' : 'group-hover:rotate-12 transition-transform'}`}>
          {animating ? 'confirmation_number' : 'monetization_on'}
        </span>
        <span className="text-[10px] font-black uppercase tracking-wider">{totalPoints}</span>
        {userPointsGiven > 0 && (
          <div className="px-1.5 py-0.5 rounded-lg bg-black/20 text-[8px] font-black">
            +{userPointsGiven}
          </div>
        )}
      </button>

      {showSelector && hasCoinsToGive && (
        <>
          <div 
            className="fixed inset-0 z-[1001]" 
            onClick={() => setShowSelector(false)}
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-[1002] w-[200px] glass rounded-2xl border border-amber-400/30 shadow-[0_0_50px_-12px_rgba(251,191,36,0.5)] p-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
               <div className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm">monetization_on</span>
                 Donar Monedas
               </div>
               <div className="text-[9px] font-black text-white/40">
                 {availableCoins} 🪙
               </div>
            </div>
            
            <p className="text-[8px] text-white/60 mb-3 leading-relaxed">
              Muestra tu apoyo regalando tus monedas diarias.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[1, 5, 10, 25].map(amount => (
                <button
                  key={amount}
                  disabled={amount > availableCoins}
                  onClick={() => handleGiveCoins(amount)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black transition-all ${
                    amount <= availableCoins
                      ? 'bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-black border border-amber-400/20'
                      : 'bg-white/5 text-white/10 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px]">add</span>
                  {amount}
                </button>
              ))}
            </div>
            
            <button
               onClick={() => {
                 setShowSelector(false);
                 setShowDonationModal(true);
               }}
               className="mt-3 w-full py-2 bg-white/5 hover:bg-white/10 text-white/40 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all hover:text-white"
            >
              Donación Personalizada
            </button>
          </div>
        </>
      )}

      {showDonationModal && (
        <DonationModal
            isOpen={showDonationModal}
            onClose={() => setShowDonationModal(false)}
            onDonate={handleGiveCoins}
            availableCoins={availableCoins}
            authorName={authorName}
        />
      )}
    </div>
  );
});

export default PostPoints;
