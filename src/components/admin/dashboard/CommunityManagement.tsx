import React from 'react';
import { CommunityData } from './shared';

interface CommunityManagementProps {
  filteredCommunities: CommunityData[];
  communitySearch: string;
  onCommunitySearchChange: (val: string) => void;
  showCommunityModal: boolean;
  onShowCommunityModal: (show: boolean) => void;
  newCommunity: { name: string; description: string; isPrivate: boolean };
  onNewCommunityChange: (community: { name: string; description: string; isPrivate: boolean }) => void;
  onCreateCommunity: () => void;
  editingCommunity: { id: string; name: string; description: string; visibility: string; isPortalExclusive?: boolean } | null;
  onEditingCommunityChange: (community: { id: string; name: string; description: string; visibility: string; isPortalExclusive?: boolean } | null) => void;
  onUpdateCommunity: () => void;
  onDeleteCommunity: (communityId: string) => void;
  showDeleteConfirm: string | null;
  onDeleteConfirm: (id: string) => void;
  onCancelDelete: () => void;
  deleteType: 'user' | 'community' | 'post';
  onDeleteTypeChange: (type: 'user' | 'community' | 'post') => void;
}

export const CommunityManagement: React.FC<CommunityManagementProps> = ({
  filteredCommunities, communitySearch, onCommunitySearchChange,
  showCommunityModal, onShowCommunityModal,
  newCommunity, onNewCommunityChange, onCreateCommunity,
  editingCommunity, onEditingCommunityChange, onUpdateCommunity,
  onDeleteCommunity, showDeleteConfirm, onDeleteConfirm, onCancelDelete, deleteType, onDeleteTypeChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 bg-[#1a1c20] rounded-lg border border-white/5 px-3 py-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-500 text-lg">search</span>
          <input
            type="text"
            placeholder="Buscar comunidad..."
            className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
            value={communitySearch}
            onChange={(e) => onCommunitySearchChange(e.target.value)}
          />
        </div>
        <button
          onClick={() => onShowCommunityModal(true)}
          className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30 hover:bg-blue-500/30"
        >
          + Nueva
        </button>
      </div>
      <div className="bg-[#1a1c20] rounded-xl border border-white/5">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400 text-lg">groups</span>
            <h3 className="text-sm font-bold text-gray-300">{filteredCommunities.length} Comunidades</h3>
          </div>
        </div>
        <div className="p-4">
          {filteredCommunities.length > 0 ? (
            filteredCommunities.map((c) => (
              <div key={c._id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-sm text-white">{c.name}</div>
                  <div className="text-[10px] text-gray-500">@{c.slug}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                    c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>{c.status === 'active' ? 'Activa' : 'Inactiva'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-gray-500/20 text-gray-400">
                    {c.visibility}
                  </span>
                  <button
                    onClick={() => window.open(`/comunidad/${c.slug}`, '_blank')}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Ver"
                  >
                    <span className="material-symbols-outlined text-gray-500 text-sm">visibility</span>
                  </button>
                  <button
                    onClick={() => onEditingCommunityChange({ id: c._id, name: c.name, description: c.description || '', visibility: c.visibility || 'public', isPortalExclusive: c.isPortalExclusive })}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-gray-500 text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => { onDeleteTypeChange('community'); onDeleteConfirm(c._id); }}
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
              {communitySearch ? 'No se encontraron comunidades' : 'No hay comunidades'}
            </div>
          )}
        </div>
      </div>

      {showCommunityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1c20] rounded-xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Crear Nueva Comunidad</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400">Nombre</label>
                <input
                  type="text"
                  placeholder="Nombre de la comunidad"
                  value={newCommunity.name}
                  onChange={(e) => onNewCommunityChange({...newCommunity, name: e.target.value})}
                  className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Descripción</label>
                <textarea
                  placeholder="Descripción de la comunidad"
                  value={newCommunity.description}
                  onChange={(e) => onNewCommunityChange({...newCommunity, description: e.target.value})}
                  className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-sm text-white h-24 resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={newCommunity.isPrivate}
                  onChange={(e) => onNewCommunityChange({...newCommunity, isPrivate: e.target.checked})}
                  className="rounded bg-gray-800 border-gray-600"
                />
                <label htmlFor="isPrivate" className="text-sm text-gray-300">Comunidad privada</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => onShowCommunityModal(false)}
                className="flex-1 bg-gray-700/30 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={onCreateCommunity}
                className="flex-1 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCommunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1c20] rounded-xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Editar Comunidad</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
                <input
                  type="text"
                  value={editingCommunity.name}
                  onChange={(e) => onEditingCommunityChange({...editingCommunity, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Descripción</label>
                <textarea
                  value={editingCommunity.description}
                  onChange={(e) => onEditingCommunityChange({...editingCommunity, description: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white h-20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Visibilidad</label>
                <select
                  value={editingCommunity.visibility}
                  onChange={(e) => onEditingCommunityChange({...editingCommunity, visibility: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="public">Pública</option>
                  <option value="unlisted">No listada</option>
                  <option value="private">Privada</option>
                </select>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <input
                  type="checkbox"
                  id="isPortalExclusive"
                  checked={editingCommunity.isPortalExclusive || false}
                  onChange={(e) => onEditingCommunityChange({...editingCommunity, isPortalExclusive: e.target.checked})}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="isPortalExclusive" className="text-sm text-purple-300">
                  Excluir del feed global del Portal
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => onEditingCommunityChange(null)}
                className="flex-1 bg-gray-700/30 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={onUpdateCommunity}
                className="flex-1 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && deleteType === 'community' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1c20] rounded-xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">Confirmar Eliminación</h3>
            <p className="text-sm text-gray-400 mb-6">
              ¿Estás seguro de que quieres eliminar esta comunidad? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancelDelete}
                className="flex-1 bg-gray-700/30 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => onDeleteConfirm(showDeleteConfirm)}
                className="flex-1 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium border border-red-500/30"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
