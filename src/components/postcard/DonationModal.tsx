import React, { useState } from 'react';
import { Usuario } from '../../types';

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDonate: (amount: number) => void;
    availableCoins: number;
    authorName: string;
}

export const DonationModal: React.FC<DonationModalProps> = ({
    isOpen,
    onClose,
    onDonate,
    availableCoins,
    authorName
}) => {
    const [amount, setAmount] = useState<number>(10);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
            <div className="w-full max-w-sm glass rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-[#111] border border-white/10 ring-1 ring-amber-400/20" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center border-b border-white/5">
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20 mb-4 animate-bounce duration-[2s]">
                        <span className="material-symbols-outlined text-black text-3xl">monetization_on</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">Hacer una Donación</h3>
                    <p className="text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-widest font-bold">Apoya a <span className="text-primary">@{authorName}</span></p>
                </div>

                <div className="p-6">
                    <div className="flex flex-col gap-4">
                        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cantidad</span>
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{availableCoins} disponibles</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-black text-gray-900 dark:text-white">🪙</span>
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Math.min(availableCoins, Math.max(1, parseInt(e.target.value) || 0)))}
                                    className="flex-1 bg-transparent text-3xl font-black text-gray-900 dark:text-white border-none focus:ring-0 placeholder:text-gray-200 dark:placeholder:text-white/5"
                                    min="1"
                                    max={availableCoins}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {[5, 10, 25, 50].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    disabled={val > availableCoins}
                                    className={`py-2 rounded-xl text-[10px] font-black transition-all ${
                                        amount === val 
                                            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' 
                                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                                    } ${val > availableCoins ? 'opacity-20 cursor-not-allowed' : ''}`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => onDonate(amount)}
                            disabled={amount <= 0 || amount > availableCoins}
                            className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl text-xs font-black text-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            Confirmar Envío
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-stone-50/50 dark:bg-black/20 text-center">
                    <button onClick={onClose} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 dark:hover:text-white transition-colors">
                        Cancelar y Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DonationModal;
