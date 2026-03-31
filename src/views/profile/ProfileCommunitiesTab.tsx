import React from 'react';
import { Usuario } from '../../types';

interface ProfileCommunitiesTabProps {
    profileUser: Usuario;
    userCommunitiesQuery: any[];
    creatorCommunities: any[];
    isOwnProfile: boolean;
    onNavigate?: (tab: string) => void;
}

export const ProfileCommunitiesTab: React.FC<ProfileCommunitiesTabProps> = ({
    profileUser,
    userCommunitiesQuery,
    creatorCommunities,
    isOwnProfile,
    onNavigate,
}) => {
    const navigateToCommunity = (slug: string) => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: `/comunidad/${slug}` }));
    };

    return (
        <div className="space-y-6">
            {/* Comunidades Creadas */}
            <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">groups</span>
                    Comunidades Creadas
                </h3>
                
                {creatorCommunities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {creatorCommunities.map((community: any) => (
                            <div 
                                key={community._id}
                                className="glass rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-all cursor-pointer group"
                                onClick={() => navigateToCommunity(community.slug)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="size-12 rounded-xl bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center text-white font-black text-xl">
                                        {community.name?.charAt(0).toUpperCase() || 'C'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{community.name}</h4>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                                                community.accessType === 'free' 
                                                    ? 'bg-signal-green/20 text-signal-green' 
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {community.accessType === 'free' ? 'Gratis' : 'Premium'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 line-clamp-2">{community.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">group</span>
                                                {community.currentMembers || 0} miembros
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">attach_money</span>
                                                ${community.totalRevenue || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="size-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <span className="material-symbols-outlined text-3xl text-white/20">groups</span>
                        </div>
                        <p className="text-xs text-white/40 mb-2">Este usuario no ha creado comunidades.</p>
                        {isOwnProfile && (
                            <button
                                onClick={() => onNavigate?.('creator')}
                                className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20"
                            >
                                Crear Comunidad
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Comunidades Unidas */}
            <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">group_add</span>
                    Comunidades Unidas
                </h3>
                
                {userCommunitiesQuery && userCommunitiesQuery.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userCommunitiesQuery
                            .filter((c: any) => c.ownerId !== profileUser.id)
                            .map((community: any) => (
                                <div 
                                    key={community._id}
                                    className="glass rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-all cursor-pointer group"
                                    onClick={() => navigateToCommunity(community.slug)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-white font-black text-xl">
                                            {community.name?.charAt(0).toUpperCase() || 'C'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{community.name}</h4>
                                                <span className="text-[9px] px-2 py-0.5 bg-white/10 text-gray-400 rounded-full font-black uppercase">
                                                    {community.membership?.role || 'member'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 line-clamp-2">{community.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">group</span>
                                                    {community.currentMembers || 0} miembros
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="size-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <span className="material-symbols-outlined text-3xl text-white/20">group_add</span>
                        </div>
                        <p className="text-xs text-white/40">Este usuario no ha unido comunidades.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileCommunitiesTab;
