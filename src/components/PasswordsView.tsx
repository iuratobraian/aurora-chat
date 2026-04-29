import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../api';
import { Lock, Plus, Trash2, Edit2, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Copy } from 'lucide-react';

interface PasswordsViewProps {
  userId: string;
  onClose: () => void;
}

const PasswordsView: React.FC<PasswordsViewProps> = ({ userId, onClose }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPasswordTitle, setNewPasswordTitle] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [newPasswordCategory, setNewPasswordCategory] = useState('General');
  const [newPasswordUrl, setNewPasswordUrl] = useState('');
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const passwords = useQuery(api.productivity.getPasswords, isValid(userId) ? { userId: userId as any } : "skip");
  const createPassword = useMutation(api.productivity.createPassword);
  const deletePassword = useMutation(api.productivity.deletePassword);
  const updatePassword = useMutation(api.productivity.updatePassword);

  const isValid = (id: string) => id && id.length > 0;

  const handleCreatePassword = async () => {
    if (!newPasswordTitle.trim() || !newPasswordValue.trim()) return;
    try {
      await createPassword({
        userId: userId as any,
        title: newPasswordTitle,
        password: newPasswordValue,
        category: newPasswordCategory,
        url: newPasswordUrl || undefined,
      });
      setNewPasswordTitle('');
      setNewPasswordValue('');
      setNewPasswordUrl('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating password:', err);
    }
  };

  const handleDelete = async (passwordId: string) => {
    try {
      await deletePassword({ passwordId: passwordId as any, userId: userId as any });
    } catch (err) {
      console.error('Error deleting password:', err);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (err) {
      console.warn('Failed to copy:', err);
    }
  };

  const toggleShowPassword = (id: string) => {
    const newSet = new Set(showPasswords);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setShowPasswords(newSet);
  };

  const categories = ['General', 'Redes Sociales', 'Trabajo', 'Bancos', 'Email', 'Otros'];

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d]">
      {/* Header */}
      <div className="pt-[env(safe-area-inset-top,12px)] pb-3 px-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all theme-hover">
            <ChevronLeft size={18} className="theme-text" />
          </button>
          <h2 className="text-sm font-bold theme-text">Bóveda de Claves</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="p-1.5 rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary/20"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Lista de contraseñas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {!passwords || passwords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full theme-text-muted">
            <Lock size={40} className="mb-3 opacity-30" />
            <p className="text-xs font-bold uppercase tracking-widest">No hay claves guardadas</p>
            <p className="text-[10px] mt-1">Crea tu primera clave para comenzar</p>
          </div>
        ) : (
          passwords.map((pwd: any) => (
            <div key={pwd._id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-xs font-bold theme-text">{pwd.title}</h4>
                  {pwd.category && (
                    <span className="text-[9px] font-bold theme-text-muted uppercase tracking-widest">
                      {pwd.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(pwd.password, pwd._id)}
                    className="p-1 rounded theme-hover"
                    title="Copiar clave"
                  >
                    {copiedId === pwd._id ? (
                      <Check size={12} className="text-emerald-500" />
                    ) : (
                      <Copy size={12} className="theme-text-muted" />
                    )}
                  </button>
                  <button className="p-1 rounded theme-hover" title="Eliminar">
                    <Trash2
                      size={12}
                      className="text-red-400"
                      onClick={() => handleDelete(pwd._id)}
                    />
                  </button>
                </div>
              </div>

              {/* Contraseña */}
              <div className="flex items-center gap-2 bg-white/[0.02] rounded-lg px-3 py-2">
                <code className="flex-1 text-[11px] font-mono theme-text select-all">
                  {showPasswords.has(pwd._id) ? pwd.password : '••••••••••••'}
                </code>
                <button onClick={() => toggleShowPassword(pwd._id)} className="p-0.5 rounded theme-hover">
                  {showPasswords.has(pwd._id) ? (
                    <EyeOff size={12} className="theme-text-muted" />
                  ) : (
                    <Eye size={12} className="theme-text-muted" />
                  )}
                </button>
              </div>

              {/* URL si existe */}
              {pwd.url && (
                <a
                  href={pwd.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[9px] text-primary hover:underline"
                >
                  <Globe size={10} />
                  {pwd.url}
                </a>
              )}

              {/* Fecha */}
              <p className="text-[8px] theme-text-muted">
                Creado: {new Date(pwd._creationTime).toLocaleDateString('es-AR')}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Formulario crear clave */}
      {showCreateForm && (
        <div className="border-t border-white/[0.06] p-4 space-y-3">
          <h4 className="text-[10px] font-bold theme-text uppercase tracking-widest">Nueva Clave</h4>
          <input
            value={newPasswordTitle}
            onChange={e => setNewPasswordTitle(e.target.value)}
            placeholder="Título (ej: Gmail, Facebook)"
            className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-3 py-2 theme-text text-xs outline-none focus:border-primary/50"
          />
          <input
            type={showPasswords.has('new') ? 'text' : 'password'}
            value={newPasswordValue}
            onChange={e => setNewPasswordValue(e.target.value)}
            placeholder="Contraseña"
            className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-3 py-2 theme-text text-xs outline-none focus:border-primary/50"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newSet = new Set(showPasswords);
                if (newSet.has('new')) newSet.delete('new');
                else newSet.add('new');
                setShowPasswords(newSet);
              }}
              className="p-1 rounded theme-hover"
            >
              {showPasswords.has('new') ? (
                <EyeOff size={12} className="theme-text-muted" />
              ) : (
                <Eye size={12} className="theme-text-muted" />
              )}
            </button>
            <span className="text-[9px] theme-text-muted">Mostrar</span>
          </div>
          <select
            value={newPasswordCategory}
            onChange={e => setNewPasswordCategory(e.target.value)}
            className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-3 py-2 theme-text text-xs outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            value={newPasswordUrl}
            onChange={e => setNewPasswordUrl(e.target.value)}
            placeholder="URL (opcional)"
            className="w-full bg-sidebar/5 border border-white/10 rounded-lg px-3 py-2 theme-text text-xs outline-none focus:border-primary/50"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest theme-text-muted theme-hover"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreatePassword}
              className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all"
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordsView;
