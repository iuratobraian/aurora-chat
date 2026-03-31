import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

type ExportCategory = 'all' | 'profiles' | 'posts' | 'comments' | 'communities' | 'ads';

interface ExportResult {
  success: boolean;
  filename?: string;
  count?: number;
  error?: string;
}

export const ExportDataPanel: React.FC = () => {
  const [category, setCategory] = useState<ExportCategory>('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importData, setImportData] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  const dbStats = useQuery(api.dataExport.getDatabaseStats);
  const profilesData = useQuery(api.dataExport.exportProfiles, { includeDeleted: true });
  const postsData = useQuery(api.dataExport.exportPosts, { includeTrash: true });
  const commentsData = useQuery(api.dataExport.exportComments);
  const communitiesData = useQuery(api.dataExport.exportCommunities, { includeDeleted: true });
  const allData = useQuery(api.dataExport.exportAllData, { includeDeleted: true });

  const importProfiles = useMutation(api.dataExport.importProfiles);
  const importPosts = useMutation(api.dataExport.importPosts);
  const importCommunities = useMutation(api.dataExport.importCommunities);

  const getData = () => {
    switch (category) {
      case 'profiles': return profilesData;
      case 'posts': return postsData;
      case 'comments': return commentsData;
      case 'communities': return communitiesData;
      case 'all': 
      default: return allData;
    }
  };

  const getFilename = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    return `tradeportal_${category}_${timestamp}`;
  };

  const getItemCount = () => {
    const data = getData();
    if (!data) return 0;
    if (category === 'all') return (data as any)?.stats?.totalProfiles + (data as any)?.stats?.totalPosts || 0;
    return Array.isArray(data) ? data.length : 0;
  };

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const data = getData();
      if (!data) {
        throw new Error('No hay datos para exportar');
      }

      let blob: Blob;
      let filename: string;

      const exportData = category === 'all' 
        ? data 
        : { [category]: data, exportedAt: new Date().toISOString() };

      blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      filename = `${getFilename()}.json`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: `Exportados ${getItemCount()} elementos` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al exportar' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      setMessage({ type: 'error', text: 'Pegá datos JSON para importar' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const data = JSON.parse(importData);
      let result: any = { imported: 0, skipped: 0, errors: [] };

      if (data.profiles && Array.isArray(data.profiles)) {
        result = await importProfiles({ profiles: data.profiles, mode: importMode });
        setMessage({ type: 'success', text: `Importados ${result.imported} perfiles` });
      } else if (data.posts && Array.isArray(data.posts)) {
        result = await importPosts({ posts: data.posts, mode: importMode });
        setMessage({ type: 'success', text: `Importados ${result.imported} posts` });
      } else if (data.communities && Array.isArray(data.communities)) {
        result = await importCommunities({ communities: data.communities });
        setMessage({ type: 'success', text: `Importadas ${result.imported} comunidades` });
      } else {
        throw new Error('Formato JSON no reconocido');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al importar' });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'Todo', icon: 'folder_zip', count: dbStats ? dbStats.profiles.total + dbStats.posts.total + dbStats.communities.total : 0 },
    { id: 'profiles', label: 'Usuarios', icon: 'people', count: dbStats?.profiles.total || 0 },
    { id: 'posts', label: 'Publicaciones', icon: 'article', count: dbStats?.posts.total || 0 },
    { id: 'comments', label: 'Comentarios', icon: 'chat', count: dbStats?.comments.total || 0 },
    { id: 'communities', label: 'Comunidades', icon: 'groups', count: dbStats?.communities.total || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Exportar / Importar Datos</h2>
        {message && (
          <div className={`px-4 py-2 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id as ExportCategory)}
            className={`p-4 rounded-xl border text-left transition-all ${
              category === cat.id
                ? 'bg-primary/20 border-primary/50 text-white'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-2xl mb-2">{cat.icon}</span>
            <div className="text-sm font-medium">{cat.label}</div>
            <div className="text-xs text-white/50">{cat.count} elementos</div>
          </button>
        ))}
      </div>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-medium">Exportar {categories.find(c => c.id === category)?.label}</h3>
            <p className="text-sm text-white/50">Descargar todos los datos en formato JSON</p>
          </div>
          <button
            onClick={handleExport}
            disabled={loading}
            className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">download</span>
            {loading ? 'Exportando...' : 'Exportar'}
          </button>
        </div>

        <div className="bg-black/20 rounded-lg p-4 text-sm text-white/60">
          <p>Se exportarán: {getItemCount()} elementos</p>
          {category === 'all' && dbStats && (
            <ul className="mt-2 space-y-1">
              <li>• {dbStats.profiles.total} perfiles ({dbStats.profiles.deleted} eliminados)</li>
              <li>• {dbStats.posts.total} posts ({dbStats.posts.trash} en papelera)</li>
              <li>• {dbStats.comments.total} comentarios</li>
              <li>• {dbStats.communities.total} comunidades ({dbStats.communities.deleted} eliminadas)</li>
              <li>• {dbStats.ads.total} anuncios ({dbStats.ads.active} activos)</li>
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-medium">Importar Datos</h3>
            <p className="text-sm text-white/50">Importar datos desde archivo JSON exportado</p>
          </div>
          <div className="flex gap-2">
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
              className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="merge">mezclar</option>
              <option value="replace">reemplazar</option>
            </select>
          </div>
        </div>

        <textarea
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder="Pegá el JSON aquí..."
          className="w-full h-40 bg-black/30 border border-white/10 rounded-lg p-4 text-sm text-white placeholder-white/30 font-mono"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleImport}
            disabled={loading || !importData.trim()}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 border border-emerald-500/30"
          >
            <span className="material-symbols-outlined">upload</span>
            {loading ? 'Importando...' : 'Importar'}
          </button>
          <button
            onClick={() => setImportData('')}
            className="bg-white/5 hover:bg-white/10 text-white/70 px-4 py-3 rounded-lg font-medium"
          >
            Limpiar
          </button>
        </div>

        <p className="text-xs text-white/40 mt-3">
          ⚠️ La importación respects los campos de auditoría (createdAt, deletedAt, etc.) para mantener el historial completo
        </p>
      </div>

      <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
        <div className="flex items-center gap-2 text-amber-400 mb-2">
          <span className="material-symbols-outlined">info</span>
          <span className="font-medium">Información de Seguridad</span>
        </div>
        <ul className="text-sm text-white/70 space-y-1">
          <li>• Los datos eliminados (soft delete) se pueden exportar con la opción "incluir eliminados"</li>
          <li>• Cada exportación incluye marca de tiempo para auditoría</li>
          <li>• La importación guarda el historial completo de ediciones</li>
          <li>• Se recomienda hacer backup antes de importar grandes cantidades</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportDataPanel;
