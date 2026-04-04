import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useToast } from '../ToastProvider';

export const SavedPostsView: React.FC<{ userId: string }> = ({ userId }) => {
  const { showToast } = useToast();
  const savedPosts = useQuery(api.savedPosts.getSavedPosts, { userId }) || [];
  const unsavePost = useMutation(api.savedPosts.unsavePost);

  const handleUnsave = async (postId: string) => {
    try {
      await unsavePost({ postId, userId });
      showToast('success', 'Post removido de guardados');
    } catch (e) {
      showToast('error', 'Error al remover');
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">bookmark</span>
        Posts Guardados
      </h3>
      {savedPosts.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">bookmark_border</span>
          <p className="text-sm text-gray-500">No tienes posts guardados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedPosts.map((sp: any) => (
            <div key={sp._id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{sp.postTitle || 'Post sin título'}</p>
                <p className="text-[10px] text-gray-500">{new Date(sp.savedAt).toLocaleDateString('es-AR')}</p>
              </div>
              <button
                onClick={() => handleUnsave(sp.postId)}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const RecursosView: React.FC<{ userId: string }> = ({ userId }) => {
  const { showToast } = useToast();
  const recursos = useQuery(api.recursos.getRecursosByUser, { userId }) || [];
  const [showCreate, setShowCreate] = useState(false);
  const [newRecurso, setNewRecurso] = useState({ titulo: '', tipo: 'pdf', url: '', descripcion: '' });
  const createRecurso = useMutation(api.recursos.createRecurso);

  const handleCreate = async () => {
    try {
      await createRecurso({
        userId,
        titulo: newRecurso.titulo,
        descripcion: newRecurso.descripcion,
        categoria: newRecurso.tipo,
        plataforma: 'web',
        precio: 0,
        version: '1.0',
        tags: [],
        archivoUrl: newRecurso.url,
      });
      showToast('success', 'Recurso creado');
      setNewRecurso({ titulo: '', tipo: 'pdf', url: '', descripcion: '' });
      setShowCreate(false);
    } catch (e) {
      showToast('error', 'Error al crear recurso');
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">folder</span>
          Mis Recursos
        </h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
        >
          {showCreate ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {showCreate && (
        <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
          <input
            value={newRecurso.titulo}
            onChange={(e) => setNewRecurso({ ...newRecurso, titulo: e.target.value })}
            placeholder="Título"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-primary outline-none"
          />
          <select
            value={newRecurso.tipo}
            onChange={(e) => setNewRecurso({ ...newRecurso, tipo: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-primary outline-none"
          >
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="link">Link</option>
          </select>
          <input
            value={newRecurso.url}
            onChange={(e) => setNewRecurso({ ...newRecurso, url: e.target.value })}
            placeholder="URL del recurso"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-primary outline-none"
          />
          <input
            value={newRecurso.descripcion}
            onChange={(e) => setNewRecurso({ ...newRecurso, descripcion: e.target.value })}
            placeholder="Descripción"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-primary outline-none"
          />
          <button
            onClick={handleCreate}
            className="w-full py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-all"
          >
            Crear Recurso
          </button>
        </div>
      )}

      {recursos.length === 0 ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">folder_open</span>
          <p className="text-sm text-gray-500">No tienes recursos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recursos.map((r: any) => (
            <div key={r._id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  {r.tipo === 'video' ? 'video_library' : r.tipo === 'audio' ? 'audio_file' : 'description'}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{r.titulo}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{r.tipo}</p>
                </div>
              </div>
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
                  Abrir
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
