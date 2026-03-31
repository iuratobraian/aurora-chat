import React, { useMemo } from 'react';
import { SectionCard } from './shared';

interface PostManagementProps {
  posts: any[];
  postSearch: string;
  postFilter: 'all' | 'active' | 'pending' | 'draft';
  onPostSearchChange: (val: string) => void;
  onPostFilterChange: (filter: 'all' | 'active' | 'pending' | 'draft') => void;
  onDeletePost: (postId: string) => void;
}

export const PostManagement: React.FC<PostManagementProps> = ({
  posts,
  postSearch,
  postFilter,
  onPostSearchChange,
  onPostFilterChange,
  onDeletePost,
}) => {
  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (postFilter !== 'all') {
      filtered = filtered.filter(p => p.status === postFilter || p.estado === postFilter);
    }
    if (postSearch.trim()) {
      const search = postSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.contenido?.toLowerCase().includes(search) ||
        p.titulo?.toLowerCase().includes(search) ||
        p.nombreUsuario?.toLowerCase().includes(search) ||
        p.usuarioManejo?.toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [posts, postSearch, postFilter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 bg-[#1a1c20] rounded-lg border border-white/5 px-3 py-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-500 text-lg">search</span>
          <input
            type="text"
            placeholder="Buscar contenido..."
            className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
            value={postSearch}
            onChange={(e) => onPostSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPostFilterChange('all')}
            className={`px-3 py-2 rounded-lg text-xs font-medium ${postFilter === 'all' ? 'bg-gray-500/50 text-white' : 'bg-gray-500/20 text-gray-400'}`}
          >
            Todos
          </button>
          <button
            onClick={() => onPostFilterChange('active')}
            className={`px-3 py-2 rounded-lg text-xs font-medium ${postFilter === 'active' ? 'bg-emerald-500/50 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}
          >
            Publicados
          </button>
          <button
            onClick={() => onPostFilterChange('pending')}
            className={`px-3 py-2 rounded-lg text-xs font-medium ${postFilter === 'pending' ? 'bg-amber-500/50 text-white' : 'bg-amber-500/20 text-amber-400'}`}
          >
            Pendientes
          </button>
        </div>
      </div>
      <SectionCard title={`${filteredPosts.length} Contenidos`} icon="article">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post: any) => (
            <div key={post._id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{post.titulo || post.contenido?.slice(0, 50) || 'Sin título'}</div>
                <div className="text-[10px] text-gray-500">{post.autor?.username || post.nombreUsuario || '@user'} · {post.fecha || 'Reciente'}</div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-gray-500/20 text-gray-400">{post.tipo || 'Post'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                  post.estado === 'published' || post.status === 'Published' ? 'bg-emerald-500/20 text-emerald-400' :
                  post.estado === 'pending' || post.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>{post.estado === 'published' ? 'Publicado' : post.estado === 'pending' ? 'Pendiente' : post.status || 'Borrador'}</span>
                <button
                  onClick={() => onDeletePost(post._id)}
                  className="p-1 hover:bg-white/10 rounded"
                  title="Eliminar"
                >
                  <span className="material-symbols-outlined text-gray-500 text-sm">delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {postSearch || postFilter !== 'all' ? 'No se encontraron contenidos' : 'No hay contenidos'}
          </div>
        )}
      </SectionCard>
    </div>
  );
};
