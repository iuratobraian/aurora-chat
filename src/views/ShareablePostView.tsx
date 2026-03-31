import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Publicacion } from '../types';

interface ShareablePostViewProps {
  postId: string;
  onBack: () => void;
  onVisitProfile?: (userId: string) => void;
  usuario: any;
}

const ShareablePostView: React.FC<ShareablePostViewProps> = ({ postId, onBack, onVisitProfile, usuario }) => {
  const [post, setPost] = useState<Publicacion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const posts = await StorageService.getPosts();
        const found = posts.find((p: Publicacion) => p.id === postId);
        setPost(found || null);
      } catch (err) {
        console.error('Error fetching post:', err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleShare = () => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('¡Enlace copiado al portapapeles!');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-xl">
        <div className="text-center">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando publicación...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-xl">
        <div className="text-center p-8 max-w-md">
          <div className="size-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-red-400">error</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Publicación no encontrada</h2>
          <p className="text-gray-400 mb-6">
            Esta publicación no existe o fue eliminada.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Hace un momento';
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">Volver</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary transition-all"
          >
            <span className="material-symbols-outlined">share</span>
            <span className="text-sm font-medium">Compartir</span>
          </button>
        </div>

        <article className="glass rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="size-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              {post.avatarUsuario ? (
                <img src={post.avatarUsuario} alt="" className="size-full object-cover" />
              ) : (
                post.nombreUsuario?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">{post.nombreUsuario || 'Usuario'}</h3>
                {post.esPro && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">PRO</span>
                )}
                {post.esVerificado && (
                  <span className="material-symbols-outlined text-primary text-sm">verified</span>
                )}
              </div>
              <p className="text-xs text-gray-500">@{post.usuarioManejo || 'usuario'} · {formatDate(post.tiempo || '')}</p>
            </div>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-gray-400">more_vert</span>
            </button>
          </div>

          {post.titulo && (
            <h2 className="text-xl font-bold text-white mb-3">{post.titulo}</h2>
          )}

          <div className="text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed">
            {post.contenido}
          </div>

          {post.par && (
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold">
                {post.par}
              </span>
              {post.categoria && (
                <span className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-sm">
                  {post.categoria}
                </span>
              )}
            </div>
          )}

          {post.imagenUrl && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img 
                src={post.imagenUrl} 
                alt="" 
                className="w-full max-h-96 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 text-gray-400 transition-colors">
              <span className="material-symbols-outlined">favorite_border</span>
              <span className="text-sm">{post.likes?.length || 0}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 text-gray-400 transition-colors">
              <span className="material-symbols-outlined">chat_bubble_outline</span>
              <span className="text-sm">{post.comentarios?.length || 0}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">share</span>
              <span className="text-sm">Compartir</span>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <span>Categoría: {post.categoria || 'General'}</span>
            {post.sentiment && (
              <span className={`px-2 py-0.5 rounded ${
                post.sentiment === 'Bullish' ? 'bg-green-500/20 text-green-400' :
                post.sentiment === 'Bearish' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {post.sentiment}
              </span>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default ShareablePostView;
