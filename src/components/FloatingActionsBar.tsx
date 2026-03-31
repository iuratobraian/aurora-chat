import React, { useState, useEffect } from 'react';
import { CreatorAssistantChat } from './agents/CreatorAssistantChat';

interface FloatingBarProps {
    onOpenCreate: () => void;
    onRefresh: () => void;
    hasNewPosts: boolean;
    isRefreshing: boolean;
    usuario: any;
    isLoggedIn: boolean;
}

const FloatingActionsBar: React.FC<FloatingBarProps> = ({ 
    onOpenCreate, 
    onRefresh, 
    hasNewPosts, 
    isRefreshing,
    usuario,
    isLoggedIn 
}) => {
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [showCreatorChat, setShowCreatorChat] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isAdmin = usuario?.rol === 'admin';

    const handleOpenSignals = () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'signals' }));
    const handleOpenAdmin = () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'admin-panel' }));

    if (!isLoggedIn) return null;

    return (
        <>
            <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none">
                
                {/* Quick Access Buttons */}
                <div className="pointer-events-auto flex flex-col items-center p-1.5 glass bg-black/40 dark:bg-black/60 rounded-full border border-white/10 shadow-2xl animate-in slide-in-from-right-8 duration-700 gap-1.5 backdrop-blur-xl">
                    
                    {/* Back to Top */}
                    {showBackToTop && (
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="size-8 sm:size-10 rounded-full bg-white/5 hover:bg-white/5 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                            title="Subir arriba"
                        >
                            <span className="material-symbols-outlined text-lg sm:text-xl">expand_less</span>
                        </button>
                    )}

                    {/* Creator Assistant Chat */}
                    <button
                        onClick={() => setShowCreatorChat(true)}
                        className="size-8 sm:size-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-600 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-orange-500/20"
                        title="Asistente Creador"
                    >
                        <span className="material-symbols-outlined text-lg sm:text-xl">smart_toy</span>
                    </button>

                    {/* Admin Panel */}
                    {isAdmin && (
                        <button
                            onClick={handleOpenAdmin}
                            className="size-8 sm:size-10 rounded-full bg-gradient-to-r from-purple-600 to-violet-700 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-purple-500/20"
                            title="Administración"
                        >
                            <span className="material-symbols-outlined text-lg sm:text-xl">admin_panel_settings</span>
                        </button>
                    )}

                    {/* Signals */}
                    <button
                        onClick={handleOpenSignals}
                        className="size-8 sm:size-10 rounded-full bg-gradient-to-r from-signal-green to-emerald-600 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-signal-green/20"
                        title="Señales"
                    >
                        <span className="material-symbols-outlined text-lg sm:text-xl">trending_up</span>
                    </button>

                    {/* Refresh Feed */}
                    <button
                        onClick={onRefresh}
                        className={`size-10 sm:size-12 rounded-full flex items-center justify-center transition-all relative group shadow-lg ${hasNewPosts ? 'bg-primary text-white animate-bounce-slow shadow-primary/40' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/5'}`}
                        title="Actualizar Feed"
                    >
                        <span className={`material-symbols-outlined text-xl sm:text-2xl ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
                        {hasNewPosts && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-sm">NUEVO</div>
                        )}
                    </button>

                    {/* Create Post */}
                    <button
                        onClick={onOpenCreate}
                        className="size-10 sm:size-12 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center shadow-xl shadow-primary/20 transition-all hover:scale-110 hover:rotate-90 active:scale-90 group"
                        title="Crear Publicación"
                    >
                        <span className="material-symbols-outlined text-2xl sm:text-3xl">add</span>
                    </button>
                </div>
            </div>

            {/* Creator Assistant Chat Modal */}
            {showCreatorChat && (
                <div className="fixed inset-0 z-[250]" onClick={() => setShowCreatorChat(false)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className="flex items-end justify-end p-4 h-full" onClick={e => e.stopPropagation()}>
                        <div onClick={e => e.stopPropagation()}>
                            <CreatorAssistantChat isOpen={true} onClose={() => setShowCreatorChat(false)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingActionsBar;
