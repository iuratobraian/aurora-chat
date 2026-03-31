import React, { memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Usuario } from '../../types';

interface AdminFABProps {
    usuario: Usuario | null;
}

const ADMIN_SECTIONS = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin' },
    { id: 'users', label: 'Usuarios', icon: 'group', path: '/admin?tab=users' },
    { id: 'posts', label: 'Posts', icon: 'article', path: '/admin?tab=posts' },
    { id: 'communities', label: 'Comunidades', icon: 'groups', path: '/admin?tab=communities' },
    { id: 'signals', label: 'Señales', icon: 'trending_up', path: '/admin?tab=signals' },
    { id: 'propFirms', label: 'Prop Firms', icon: 'account_balance', path: '/admin?tab=propFirms' },
    { id: 'bitacora', label: 'Bitácora', icon: 'menu_book', path: '/admin?tab=bitacora' },
    { id: 'ads', label: 'Publicidad', icon: 'campaign', path: '/admin?tab=ads' },
    { id: 'instagram', label: 'Instagram', icon: 'camera', path: '/admin?tab=instagram' },
    { id: 'config', label: 'Config', icon: 'settings', path: '/admin?tab=config' },
];

export const AdminFAB: React.FC<AdminFABProps> = memo(({ usuario }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    const isAdmin = usuario && (
        usuario.rol === 'admin' ||
        usuario.rol === 'ceo' ||
        (usuario.role && usuario.role >= 5)
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isAdmin) return null;

    return (
        <>
            {/* FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    size-12 rounded-xl
                    bg-white/10 dark:bg-black/40 backdrop-blur-xl
                    border border-white/20 dark:border-white/10
                    shadow-lg shadow-black/20
                    flex items-center justify-center
                    transition-all duration-300
                    hover:bg-white/20 hover:scale-105
                    ${isOpen ? 'rotate-90 bg-primary/20 border-primary' : ''}
                `}
            >
                <span className={`material-symbols-outlined text-white text-xl ${isOpen ? 'text-primary' : ''}`}>
                    {isOpen ? 'close' : 'admin_panel_settings'}
                </span>
            </button>

            {/* Tooltip */}
            {!isOpen && (
                <div 
                    className={`
                        fixed bottom-6 right-24 z-[9998]
                        px-3 py-1.5 rounded-lg
                        bg-black/80 backdrop-blur-md
                        text-white text-xs font-bold
                        transition-all duration-300
                        ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
                    `}
                >
                    Admin Panel
                </div>
            )}

            {/* Menu */}
            {isOpen && (
                <div 
                    className="fixed bottom-24 right-6 z-[9998] animate-in slide-in-from-bottom-5 fade-in duration-300"
                >
                    <div 
                        className="bg-[#0f1115] border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 overflow-hidden backdrop-blur-xl"
                        style={{ minWidth: '200px' }}
                    >
                        <div className="p-3 border-b border-white/10">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Panel Admin</p>
                        </div>
                        <div className="p-2">
                            {ADMIN_SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        navigate(section.path);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-all group"
                                >
                                    <span className="material-symbols-outlined text-lg text-purple-400 group-hover:text-purple-300">
                                        {section.icon}
                                    </span>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                                        {section.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="p-2 border-t border-white/10">
                            <button
                                onClick={() => {
                                    navigate('/');
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-all text-gray-400 hover:text-white"
                            >
                                <span className="material-symbols-outlined text-lg">home</span>
                                <span className="text-sm font-medium">Volver al Inicio</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[9997] bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
});

export default AdminFAB;
