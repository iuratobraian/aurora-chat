import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const GamingStatsPanel: React.FC = () => {
  const allGamesStats = useQuery(api.gaming.getAllGamesStats, {});

  const totalPartidas = allGamesStats?.reduce((sum, g) => sum + g.totalSessions, 0) || 0;
  const totalJugadores = new Set(
    allGamesStats?.flatMap(g => g.uniquePlayers) || []
  ).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-2xl text-primary">sports_esports</span>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Estadísticas de Juegos
        </h2>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-xl text-primary">sports_esports</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Total Partidas</span>
          </div>
          <p className="text-4xl font-black text-white">{totalPartidas}</p>
        </div>

        <div className="glass bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-xl text-green-400">people</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Jugadores únicos</span>
          </div>
          <p className="text-4xl font-black text-white">{allGamesStats?.reduce((sum, g) => sum + g.uniquePlayers, 0) || 0}</p>
        </div>

        <div className="glass bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-xl text-purple-400">apps</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Juegos activos</span>
          </div>
          <p className="text-4xl font-black text-white">{allGamesStats?.length || 0}</p>
        </div>
      </div>

      {/* Detalle por juego */}
      <div className="glass bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">Partidas por Juego</h3>
        </div>

        <div className="divide-y divide-white/5">
          {allGamesStats?.map((game) => (
            <div key={game.appId} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
              <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-primary">{game.icon}</span>
              </div>

              <div className="flex-1">
                <h4 className="font-bold text-white">{game.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    game.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    game.status === 'beta' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {game.status}
                  </span>
                  <span className="text-xs text-gray-500">{game.uniquePlayers} jugadores únicos</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-black text-primary">{game.totalSessions}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Partidas</p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-black text-green-400">{game.completedSessions}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Completadas</p>
              </div>

              <div className="w-32">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full"
                    style={{ 
                      width: `${Math.min((game.completedSessions / Math.max(game.totalSessions, 1)) * 100, 100)}%` 
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 text-right mt-1">
                  {Math.round((game.completedSessions / Math.max(game.totalSessions, 1)) * 100)}% completado
                </p>
              </div>
            </div>
          ))}

          {!allGamesStats && (
            <div className="p-8 text-center text-gray-500">
              <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              <p>Cargando estadísticas...</p>
            </div>
          )}

          {allGamesStats?.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <span className="material-symbols-outlined text-4xl text-gray-700 mb-4 block">sports_esports</span>
              <p>No hay datos de juegos aún</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamingStatsPanel;
