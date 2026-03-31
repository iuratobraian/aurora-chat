import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { PaymentModal } from '../PaymentModal';
import { useToast } from '../ToastProvider';

interface UserWalletProps {
  userId: string;
  email: string;
}

export const UserWallet: React.FC<UserWalletProps> = ({ userId, email }) => {
  const profile = useQuery(api.profiles.getProfile, { userId });
  const { showToast } = useToast();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [showDepositInput, setShowDepositInput] = useState(false);
  const [depositAmount, setDepositAmount] = useState('10');

  const saldo = profile?.saldo || 0;

  const handleWithdraw = () => {
    showToast('info', 'Los retiros se procesan manualmente. Por favor, contacta a soporte para iniciar el trámite.');
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/40 p-6 backdrop-blur-xl transition-all hover:border-violet-500/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">Total Balance</p>
          <h2 className="mt-1 text-4xl font-black text-white">
            ${saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            <span className="ml-2 text-sm font-bold text-white/30 truncate uppercase">USD</span>
          </h2>
        </div>
        <div className="size-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/10 shadow-inner">
          <span className="material-symbols-outlined text-3xl text-violet-400">account_balance_wallet</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowDepositInput(!showDepositInput)}
          className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all py-4 overflow-hidden ${
            showDepositInput 
              ? 'bg-violet-500 border-violet-400 shadow-lg shadow-violet-500/20' 
              : 'border-white/10 bg-white/5 hover:bg-violet-500/10 hover:border-violet-500/30'
          }`}
        >
          <span className={`material-symbols-outlined transition-colors ${showDepositInput ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
            {showDepositInput ? 'close' : 'add_circle'}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${showDepositInput ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>
            {showDepositInput ? 'Cancelar' : 'Depositar'}
          </span>
        </button>

        <button 
          onClick={handleWithdraw}
          className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 transition-all hover:bg-cyan-500/10 hover:border-cyan-500/30 overflow-hidden"
        >
          <span className="material-symbols-outlined text-white/60 group-hover:text-cyan-400 transition-colors">payments</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-cyan-400 transition-colors">Retirar</span>
        </button>
      </div>

      <AnimatePresence>
        {showDepositInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-white/5">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2 px-1">Monto (USD)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">$</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-bold focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  className="px-6 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  Ir al Pago
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                {['10', '50', '100', '500'].map(val => (
                  <button
                    key={val}
                    onClick={() => setDepositAmount(val)}
                    className="flex-1 py-1.5 rounded-lg border border-white/5 bg-white/5 text-[10px] font-bold text-white/40 hover:bg-white/10 hover:text-white transition-all"
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40 font-medium">Estado de cuenta</span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
            <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
            Activa
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40 font-medium">Tasa de cambio</span>
          <span className="text-[10px] font-bold text-white/60 uppercase">1 USD = 1.00 TS</span>
        </div>
      </div>

       <PaymentModal
         isOpen={isDepositModalOpen}
         onClose={() => setIsDepositModalOpen(false)}
         userId={userId}
         email={email}
         type="deposit"
         depositAmount={parseFloat(depositAmount)}
         onSuccess={() => {
           setIsDepositModalOpen(false);
           setShowDepositInput(false);
         }}
       />
    </div>
  );
};

export default UserWallet;
