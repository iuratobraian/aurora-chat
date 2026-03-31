import React from 'react';
import { ProfileData } from './shared';

interface UserRowProps {
  user: ProfileData;
  onEdit: (user: ProfileData) => void;
  onToggleBan: (userId: string, status: string) => void;
  onDelete: (userId: string) => void;
}

export const UserRow: React.FC<UserRowProps> = ({ user, onEdit, onToggleBan, onDelete }) => {
  const roleNames = ['Free', 'Pro', 'Elite', 'Creator', 'Moderator', 'Admin', 'SuperAdmin'];
  const roleName = roleNames[user.role] || 'User';
  const status = user.status || 'active';

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
          {user.avatar || user.usuario?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <div className="text-sm text-white">@{user.usuario}</div>
          <div className="text-[10px] text-gray-500">{user.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
          roleName === 'Admin' || roleName === 'SuperAdmin' ? 'bg-purple-500/20 text-purple-400' :
          roleName === 'Moderator' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>{roleName}</span>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
          status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
          status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
          'bg-red-500/20 text-red-400'
        }`}>{status === 'active' ? 'Activo' : status === 'pending' ? 'Pendiente' : 'Baneado'}</span>
        <button
          onClick={() => onEdit(user)}
          className="p-1 hover:bg-white/10 rounded"
          title="Editar"
        >
          <span className="material-symbols-outlined text-gray-500 text-sm">edit</span>
        </button>
        <button
          onClick={() => onToggleBan(user.userId, status)}
          className="p-1 hover:bg-white/10 rounded"
          title={status === 'banned' ? 'Desbanear' : 'Banear'}
        >
          <span className={`material-symbols-outlined text-sm ${status === 'banned' ? 'text-emerald-500' : 'text-red-400'}`}>
            {status === 'banned' ? 'lock_open' : 'block'}
          </span>
        </button>
        <button
          onClick={() => onDelete(user.userId)}
          className="p-1 hover:bg-white/10 rounded"
          title="Eliminar"
        >
          <span className="material-symbols-outlined text-gray-500 text-sm">delete</span>
        </button>
      </div>
    </div>
  );
};

interface UserRowLegacyProps {
  user: { name: string; email: string; role: string; status: string; avatar: string };
}

export const UserRowLegacy: React.FC<UserRowLegacyProps> = ({ user }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
        {user.avatar}
      </div>
      <div>
        <div className="text-sm text-white">{user.name}</div>
        <div className="text-[10px] text-gray-500">{user.email}</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
        user.role === 'Admin' ? 'bg-purple-500/20 text-purple-400' :
        user.role === 'Moderator' ? 'bg-blue-500/20 text-blue-400' :
        'bg-gray-500/20 text-gray-400'
      }`}>{user.role}</span>
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
        user.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
        user.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
        'bg-red-500/20 text-red-400'
      }`}>{user.status}</span>
      <button className="p-1 hover:bg-white/10 rounded"><span className="material-symbols-outlined text-gray-500 text-sm">edit</span></button>
      <button className="p-1 hover:bg-white/10 rounded"><span className="material-symbols-outlined text-gray-500 text-sm">delete</span></button>
    </div>
  </div>
);

interface UserManagementProps {
  filteredProfiles: ProfileData[];
  paginatedProfiles: ProfileData[];
  userSearch: string;
  onUserSearchChange: (val: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedUsers: Set<string>;
  selectAll: boolean;
  batchActionLoading: boolean;
  onToggleSelectAll: () => void;
  onToggleUserSelection: (userId: string) => void;
  onBatchBan: () => void;
  onBatchDelete: () => void;
  editingUser: ProfileData | null;
  onEditingUserChange: (user: ProfileData | null) => void;
  onUpdateUser: () => void;
  onToggleBan: (userId: string, status: string) => void;
  showDeleteConfirm: string | null;
  onDeleteConfirm: (userId: string) => void;
  onCancelDelete: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  filteredProfiles, paginatedProfiles, userSearch, onUserSearchChange,
  currentPage, totalPages, onPageChange,
  selectedUsers, selectAll, batchActionLoading,
  onToggleSelectAll, onToggleUserSelection, onBatchBan, onBatchDelete,
  editingUser, onEditingUserChange, onUpdateUser, onToggleBan,
  showDeleteConfirm, onDeleteConfirm, onCancelDelete,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 bg-[#1a1c20] rounded-lg border border-white/5 px-3 py-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-500 text-lg">search</span>
          <input
            type="text"
            placeholder="Buscar usuario..."
            className="bg-transparent text-sm text-white placeholder-gray-500 outline-none flex-1"
            value={userSearch}
            onChange={(e) => onUserSearchChange(e.target.value)}
          />
        </div>
        <button className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30 hover:bg-blue-500/30">
          + Nuevo
        </button>
      </div>

      {filteredProfiles.length > 0 && (
        <div className="flex items-center justify-between bg-[#1a1c20] rounded-lg border border-white/5 px-4 py-2">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={onToggleSelectAll}
                className="rounded bg-gray-700 border-gray-600 w-4 h-4"
              />
              <span className="text-xs text-gray-400">Seleccionar todos</span>
            </label>
            <span className="text-xs text-gray-500">|</span>
            <span className="text-xs text-gray-400">{selectedUsers.size} seleccionados</span>
          </div>
          {selectedUsers.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={onBatchBan}
                disabled={batchActionLoading}
                className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50"
              >
                Banear ({selectedUsers.size})
              </button>
              <button
                onClick={onBatchDelete}
                disabled={batchActionLoading}
                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50"
              >
                Eliminar ({selectedUsers.size})
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-[#1a1c20] rounded-xl border border-white/5">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400 text-lg">group</span>
            <h3 className="text-sm font-bold text-gray-300">{filteredProfiles.length} Usuarios</h3>
          </div>
        </div>
        <div className="p-4">
          {filteredProfiles.length > 0 ? (
            <>
              <div className="flex items-center gap-3 py-2 border-b border-white/5 text-xs text-gray-500">
                <div className="w-6"></div>
                <div className="flex-1">Usuario</div>
                <div className="w-32">Rol / Estado</div>
                <div className="w-28">Acciones</div>
              </div>
              {paginatedProfiles.map((user: ProfileData) => (
                <div key={user._id} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.userId)}
                    onChange={() => onToggleUserSelection(user.userId)}
                    className="rounded bg-gray-700 border-gray-600 w-4 h-4"
                  />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.avatar || user.usuario?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-white">@{user.usuario}</div>
                      <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-32">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                      user.role === 5 || user.role === 6 ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 4 ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>{['Free', 'Pro', 'Elite', 'Creator', 'Moderator', 'Admin', 'SuperAdmin'][user.role] || 'User'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                      user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                      user.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{user.status === 'active' ? 'Activo' : user.status === 'pending' ? 'Pendiente' : 'Baneado'}</span>
                  </div>
                  <div className="flex items-center gap-1 w-28">
                    <button
                      onClick={() => onEditingUserChange(user)}
                      className="p-1 hover:bg-white/10 rounded"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-gray-500 text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => onToggleBan(user.userId, user.status || 'active')}
                      className="p-1 hover:bg-white/10 rounded"
                      title={user.status === 'banned' ? 'Desbanear' : 'Banear'}
                    >
                      <span className={`material-symbols-outlined text-sm ${user.status === 'banned' ? 'text-emerald-500' : 'text-red-400'}`}>
                        {user.status === 'banned' ? 'lock_open' : 'block'}
                      </span>
                    </button>
                    <button
                      onClick={() => onDeleteConfirm(user.userId)}
                      className="p-1 hover:bg-white/10 rounded"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-gray-500 text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {userSearch ? 'No se encontraron usuarios' : 'No hay usuarios'}
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#1a1c20] rounded-lg border border-white/5 px-4 py-3">
          <span className="text-xs text-gray-400">
            Página {currentPage} de {totalPages} ({filteredProfiles.length} usuarios)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-gray-700/30 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-gray-700/30 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1c20] rounded-xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Editar Usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400">Usuario</label>
                <input
                  type="text"
                  value={editingUser.usuario || ''}
                  disabled
                  className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-sm text-gray-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">XP</label>
                <input
                  type="number"
                  value={editingUser.xp || 0}
                  onChange={(e) => onEditingUserChange({...editingUser, xp: parseInt(e.target.value) || 0})}
                  className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Level</label>
                <input
                  type="number"
                  value={editingUser.level || 0}
                  onChange={(e) => onEditingUserChange({...editingUser, level: parseInt(e.target.value) || 0})}
                  className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Reputación</label>
                <input
                  type="number"
                  value={editingUser.reputation || 0}
                  onChange={(e) => onEditingUserChange({...editingUser, reputation: parseInt(e.target.value) || 0})}
                  className="w-full bg-gray-800/50 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => onEditingUserChange(null)}
                className="flex-1 bg-gray-700/30 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={onUpdateUser}
                className="flex-1 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/30"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1c20] rounded-xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">Confirmar Eliminación</h3>
            <p className="text-sm text-gray-400 mb-6">
              ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
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
