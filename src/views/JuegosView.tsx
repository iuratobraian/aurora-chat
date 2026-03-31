import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Usuario } from '../types';
import GamingRoom from '../components/GamingRoom';

interface JuegosViewProps {
  usuario: Usuario | null;
  onNavigate: (tab: string) => void;
}

const JuegosView: React.FC<JuegosViewProps> = ({ usuario, onNavigate }) => {
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [showGame, setShowGame] = useState(false);
  const apps = useQuery(api.apps.listApps, {});
  const seedApps = useMutation(api.apps.seedApps);

  const handleSeedApps = async () => {
    try {
      await seedApps({});
      window.location.reload();
    } catch (e) {
      console.error('Error seeding apps:', e);
    }
  };

  if (selectedApp) {
    if (showGame && selectedApp.appId === 'saboteador_invisible') {
      return (
        <div className="min-h-screen">
          <iframe
            src="/saboteador/index.html"
            className="w-full h-screen"
            title="El Saboteador Invisible"
            allow="fullscreen"
          />
        </div>
      );
    }

    return (
      <GamingRoom
        app={selectedApp}
        usuario={usuario}
        onBack={() => setSelectedApp(null)}
        onShowGame={() => setShowGame(true)}
      />
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">
          Zona de <span className="text-primary">Juegos</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium mb-8">
          Descubre experiencias interactivas y juegos de deducción social diseñados para la comunidad.
        </p>

        <div className="inline-flex flex-col md:flex-row items-center gap-4 p-4 glass bg-primary/10 border border-primary/20 rounded-3xl animate-in slide-in-from-bottom-5 duration-700">
          <div className="flex items-center gap-3 px-4">
            <span className="material-symbols-outlined text-primary text-3xl">android</span>
            <div className="text-left">
              <p className="text-white text-xs font-black uppercase tracking-widest">¿Quieres jugar offline?</p>
              <p className="text-primary text-[10px] font-bold">Descarga nuestra APK para Android</p>
            </div>
          </div>
          <button 
            onClick={() => window.open('/downloads/tradeportal-games.apk', '_blank')}
            className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
          >
            Descargar APK
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps?.map((app) => (
          <div 
            key={app.appId}
            className="group relative glass bg-black/40 border border-white/10 rounded-3xl p-6 hover:border-primary/50 transition-all duration-500 overflow-hidden cursor-pointer"
            onClick={() => setSelectedApp(app)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-4xl text-primary">{app.icon}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  app.status === 'beta' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' : 'text-primary border-primary/30 bg-primary/10'
                }`}>
                  {app.status}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {app.config?.category || app.category}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-primary transition-colors">
                {app.name}
              </h3>
              
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {app.description}
              </p>

              <button 
                className="w-full py-4 bg-white/5 group-hover:bg-primary text-white font-black uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Jugar Ahora</span>
                <span className="material-symbols-outlined text-lg">play_arrow</span>
              </button>
            </div>
          </div>
        ))}

        {!apps && (
          <div className="col-span-full py-20 flex flex-col items-center gap-4">
            <div className="size-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-gray-500 font-bold uppercase tracking-widest">Cargando catálogo...</p>
          </div>
        )}

        {apps?.length === 0 && (
          <div className="col-span-full py-40 text-center glass bg-black/40 rounded-3xl border border-white/5">
            <span className="material-symbols-outlined text-6xl text-gray-700 mb-4">sports_esports</span>
            <h3 className="text-2xl font-black text-gray-500 uppercase tracking-tighter">Próximamente más juegos</h3>
            <p className="text-gray-600 font-medium mb-6">Estamos desarrollando nuevas experiencias para ti.</p>
            {(usuario?.rol === 'admin' || usuario?.rol === 'ceo') && (
              <button
                onClick={handleSeedApps}
                className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-colors"
              >
                Inicializar Juegos
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JuegosView;
