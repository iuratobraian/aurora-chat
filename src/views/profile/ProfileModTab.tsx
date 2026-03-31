import React from 'react';
import { Usuario, Comentario, Publicacion } from '../../types';
import { useToast } from '../../components/ToastProvider';

interface ProfileModTabProps {
    profileUser: Usuario;
    allPlatformPosts: Publicacion[];
}

export const ProfileModTab: React.FC<ProfileModTabProps> = ({
    profileUser,
    allPlatformPosts,
}) => {
    const { showToast } = useToast();

    const userComments = allPlatformPosts.flatMap(p => 
        (p.comentarios || []).filter((c: Comentario) => c.idUsuario === profileUser.id)
            .map((c: Comentario) => ({...c, postTitulo: p.titulo || 'Post sin título', postId: p.id, postUrl: p.tradingViewUrl}))
    );

    const handleDeleteComment = () => {
        showToast('warning', "La función de eliminar comentarios específicos por admin desde perfil está en beta y requiere actualización de backend. (Simulado)");
    };

    return (
        <div className="space-y-6">
            <div className="glass rounded-2xl p-5 border border-red-500/30 bg-red-500/5">
                <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">shield</span> Panel de Moderación Directa
                </h3>
                <p className="text-xs text-red-200/60">Aquí puedes ver todos los comentarios que realizó este usuario en la plataforma y gestionar su contenido directamente.</p>
            </div>
            
            <div className="grid gap-4">
                {userComments.length === 0 ? (
                    <div className="glass rounded-2xl p-8 text-center border border-white/10">
                        <p className="text-white/40">Este usuario no ha realizado comentarios.</p>
                    </div>
                ) : (
                    <>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">Comentarios Realizados ({userComments.length}):</h4>
                        {userComments.map(c => (
                            <div key={c.id} className="glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest">En post: {c.postTitulo}</span>
                                        <p className="text-sm text-white mt-2">{c.texto}</p>
                                    </div>
                                    <button 
                                        onClick={handleDeleteComment}
                                        className="p-2 text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                                <span className="text-[9px] text-white/30">{c.tiempo}</span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileModTab;
