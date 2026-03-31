import React from 'react';

export const ProfileComprasTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-black uppercase tracking-widest text-white mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">shopping_bag</span>
                    Mis Compras
                </h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">workspace_premium</span>
                            </div>
                            <div>
                                <p className="font-bold text-white">Plan Pro</p>
                                <p className="text-xs text-white/40">Membresía activa</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-signal-green/20 text-signal-green text-xs font-bold rounded-full">Activo</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-400">school</span>
                            </div>
                            <div>
                                <p className="font-bold text-white">Curso de Price Action</p>
                                <p className="text-xs text-white/40">Adquirido el 15/02/2026</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-signal-green/20 text-signal-green text-xs font-bold rounded-full">Completado</span>
                    </div>
                    
                    <div className="text-center py-8">
                        <span className="material-symbols-outlined text-4xl text-white/20 mb-2">receipt_long</span>
                        <p className="text-white/40 text-sm">No tienes más compras</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileComprasTab;
