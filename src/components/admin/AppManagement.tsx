import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const AppManagement: React.FC = () => {
  const apps = useQuery(api.apps.listApps, { isAdmin: true });
  const toggleVisibility = useMutation(api.apps.toggleAppVisibility);
  const updateStatus = useMutation(api.apps.updateAppStatus);

  const handleToggleVisibility = async (appId: string, current: string) => {
    const next = current === 'public' ? 'private' : 'public';
    await toggleVisibility({ appId, visibility: next as any });
  };

  const handleStatusChange = async (appId: string, status: string) => {
    await updateStatus({ appId, status: status as any });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Gestión de Apps & Juegos</h2>
          <p className="text-gray-500 text-sm font-medium">Controla la visibilidad y el estado de los módulos internos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {apps?.map((app) => (
          <div key={app.appId} className="glass bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-white/10">
            <div className="flex items-center gap-4 flex-1">
              <div className="size-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary">{app.icon}</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{app.name}</h4>
                <p className="text-xs text-gray-400 max-w-md line-clamp-1">{app.description}</p>
                <div className="flex gap-2 mt-2">
                   <span className="text-[10px] font-black uppercase text-gray-500 bg-black/40 px-2 py-0.5 rounded border border-white/5">{app.category}</span>
                   <span className="text-[10px] font-black uppercase text-gray-500 bg-black/40 px-2 py-0.5 rounded border border-white/5">Creado: {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 px-6 border-l border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Visibilidad</span>
                <button 
                  onClick={() => handleToggleVisibility(app.appId, app.visibility)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    app.visibility === 'public' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {app.visibility === 'public' ? 'visibility' : 'visibility_off'}
                  </span>
                  {app.visibility.toUpperCase()}
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Estado</span>
                <select 
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.appId, e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white focus:border-primary focus:outline-none transition-all cursor-pointer"
                >
                  <option value="active">ACTIVE</option>
                  <option value="beta">BETA</option>
                  <option value="maintenance">MAINTENANCE</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="size-10 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 flex items-center justify-center transition-all">
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
              <button className="size-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        ))}

        {apps?.length === 0 && (
          <div className="py-20 text-center glass bg-black/20 rounded-2xl border border-white/5">
            <p className="text-gray-500 font-bold uppercase tracking-widest">No hay aplicaciones registradas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppManagement;
