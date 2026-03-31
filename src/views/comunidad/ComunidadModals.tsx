import React from 'react';
import { Ad, LiveStatus, Publicacion } from '../../types';
import CreatePostModal from '../../components/CreatePostModal';
import { CreateCommunityModal } from './Modals';
import PostDetailModal from './PostDetailModal';
import { DailyPollModal } from './DailyPollModal';

interface ComunidadModalsProps {
  showWelcome: boolean;
  onCloseWelcome: () => void;
  editingAd: Ad | null;
  setEditingAd: (ad: Ad | null) => void;
  onSaveQuickAd: (e: React.FormEvent) => void;
  editingLive: boolean;
  setEditingLive: (editing: boolean) => void;
  liveStatus: LiveStatus;
  setLiveStatus: (status: LiveStatus) => void;
  onSaveLive: (e: React.FormEvent) => void;
  showSalesChat: boolean;
  setShowSalesChat: (show: boolean) => void;
  
  // New Modal Props
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  setNewPostId: (id: string) => void;
  showToast: (type: any, message: string) => void;
  
  isCreateCommunityOpen: boolean;
  setIsCreateCommunityOpen: (open: boolean) => void;
  usuario: any;
  onLoginRequest: () => void;
  
  selectedPost: any;
  setSelectedPost: (post: any) => void;
  handleLike: (post: any) => void;
  handleUpdatePost: (post: Publicacion) => void;
  handleDeletePost: (id: string) => void;
  handleFollow: (id: string) => void;
  onVisitProfile: (id: string) => void;
  addComment: (id: string, text: string) => void;
  handleLikeComment: (id: string, cid: string) => void;
}

export const ComunidadModals: React.FC<ComunidadModalsProps> = ({
  showWelcome,
  onCloseWelcome,
  editingAd,
  setEditingAd,
  onSaveQuickAd,
  editingLive,
  setEditingLive,
  liveStatus,
  setLiveStatus,
  onSaveLive,
  showSalesChat,
  setShowSalesChat,
  isCreateModalOpen,
  setIsCreateModalOpen,
  setNewPostId,
  showToast,
  isCreateCommunityOpen,
  setIsCreateCommunityOpen,
  usuario,
  onLoginRequest,
  selectedPost,
  setSelectedPost,
  handleLike,
  handleUpdatePost,
  handleDeletePost,
  handleFollow,
  onVisitProfile,
  addComment,
  handleLikeComment
}) => {
  return (
    <>
      <DailyPollModal />
      
      {showWelcome && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-[#15191f] border border-primary/20 rounded-[2.5rem] p-10 max-w-lg text-center shadow-2xl shadow-primary/10 relative overflow-hidden group">
            <div className="absolute -top-24 -left-24 size-48 bg-primary/20 blur-[80px] rounded-full" />
            <div className="absolute -bottom-24 -right-24 size-48 bg-blue-500/20 blur-[80px] rounded-full" />
            <div className="size-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-4xl text-primary animate-bounce">celebration</span>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
              ¡Bienvenido a <span className="text-primary">TradeHub</span>!
            </h2>
            <p className="text-gray-400 text-sm font-bold mb-8 leading-relaxed px-4">
              Nos alegra tenerte en nuestra comunidad. Aquí encontrarás las mejores ideas y análisis para crecer como trader profesional.
            </p>
            <button
              onClick={onCloseWelcome}
              className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-primary/20 active:scale-95"
            >
              ¡Vamos a Ganar!
            </button>
          </div>
        </div>
      )}

      {editingAd && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#15191f] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">Editar Publicidad</h3>
            <form onSubmit={onSaveQuickAd} className="space-y-4">
              {[
                { label: 'Título', key: 'titulo', required: true },
                { label: 'Imagen URL', key: 'imagenUrl' },
                { label: 'Video URL (Opcional)', key: 'videoUrl', placeholder: 'https://youtube.com/embed/...' },
                { label: 'Link Destino', key: 'link' },
                { label: 'Subtítulo / Badge', key: 'subtitle', placeholder: 'Ej: Oficial | Nuevo' },
                { label: 'Extra (Info/Icono)', key: 'extra', placeholder: 'Metadata extra' },
              ].map(({ label, key, required, placeholder }) => (
                <div key={key}>
                  <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest leading-relaxed">{label}</label>
                  <input
                    required={required}
                    value={(editingAd as any)[key] || ''}
                    onChange={e => setEditingAd({ ...editingAd, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-primary/50 transition-colors outline-none font-bold text-xs"
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Descripción</label>
                <textarea
                  required
                  value={editingAd.descripcion}
                  onChange={e => setEditingAd({ ...editingAd, descripcion: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white h-24 focus:border-primary/50 outline-none font-bold text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setEditingAd(null)} className="px-6 py-3 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingLive && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#15191f] border border-red-500/30 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl shadow-red-500/20">
            <h3 className="text-xl font-black text-red-500 mb-6 flex items-center gap-2 uppercase tracking-tighter">
              <span className="material-symbols-outlined text-3xl">sensors</span>
              Transmisión EN VIVO
            </h3>
            <form onSubmit={onSaveLive} className="space-y-4">
              <div className="flex items-center gap-4 bg-red-500/10 p-5 rounded-2xl border border-red-500/20 group cursor-pointer active:scale-95 transition-all">
                <input
                  type="checkbox"
                  id="isLiveToggle"
                  checked={liveStatus.isLive}
                  onChange={e => setLiveStatus({ ...liveStatus, isLive: e.target.checked })}
                  className="size-6 accent-red-500 cursor-pointer"
                />
                <label htmlFor="isLiveToggle" className="text-sm font-black uppercase text-red-500 cursor-pointer select-none">Transmitir en Vivo Ahora</label>
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-2 block">ID / Link de YouTube o Twitch</label>
                <div className="relative">
                  <input
                    required={liveStatus.isLive}
                    value={liveStatus.url}
                    onChange={e => setLiveStatus({ ...liveStatus, url: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:border-red-500 transition-all outline-none font-bold text-sm pl-12"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">link</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setEditingLive(false)} className="px-6 py-3 text-gray-500 font-black uppercase tracking-widest text-[10px]">Cerrar</button>
                <button type="submit" className="px-10 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 transition-all active:scale-95">Publicar VIVO</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSalesChat && (
        <div className="fixed bottom-6 right-6 z-[1000] w-[380px] bg-[#0f1115] border border-white/20 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 slide-in-from-right-10 duration-500 backdrop-blur-xl">
          <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <span className="material-symbols-outlined text-white text-3xl animate-pulse">support_agent</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">Asesor de Academia</h3>
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">En Línea</p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowSalesChat(false)} className="size-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-8 bg-black/40 space-y-6">
            <div className="bg-white/5 p-6 rounded-3xl rounded-tl-none border border-white/5 text-sm text-gray-200 leading-relaxed font-medium">
              <span className="block font-black text-primary mb-3 uppercase tracking-[0.2em] text-[11px] bg-primary/10 w-fit px-3 py-1 rounded-full border border-primary/20">Atención Personalizada</span>
              ¡Hola trader! 🚀 Para acceder al contenido exclusivo de la academia y nuestras herramientas profesionales, completa tu suscripción en nuestro portal oficial:
              <br/><br/>
              <div className="p-4 bg-black/50 rounded-2xl border border-white/10 group cursor-pointer hover:border-primary/50 transition-all">
                <a href="https://portalib.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary font-black text-xs underline hover:text-white break-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  portalib.vercel.app
                </a>
              </div>
              <p className="mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">¿Tienes dudas? Consulta a soporte desde el menú principal.</p>
            </div>
          </div>
        </div>
      )}

      {/* Legacy Modals Integrated */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(postId) => {
          setNewPostId(postId);
          showToast('success', '¡Publicación creada con éxito!');
        }}
      />

      <CreateCommunityModal
        isOpen={isCreateCommunityOpen}
        onClose={() => setIsCreateCommunityOpen(false)}
        usuario={usuario}
        onLoginRequest={onLoginRequest}
      />

      <PostDetailModal
        post={selectedPost}
        usuario={usuario}
        onLike={() => selectedPost && handleLike(selectedPost)}
        onUpdate={handleUpdatePost}
        onDelete={() => { if (selectedPost) handleDeletePost(selectedPost.id); setSelectedPost(null); }}
        onFollow={() => selectedPost && handleFollow(selectedPost.idUsuario)}
        onVisitProfile={(id) => { onVisitProfile(id); setSelectedPost(null); }}
        onReply={addComment}
        onLikeComment={handleLikeComment}
        onClose={() => setSelectedPost(null)}
      />
    </>
  );
};
