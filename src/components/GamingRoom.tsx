import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Usuario } from '../types';

interface GamingRoomProps {
  app: {
    appId: string;
    name: string;
    description: string;
    icon: string;
  };
  usuario: Usuario | null;
  onBack: () => void;
  onShowGame: () => void;
}

const GamingRoom: React.FC<GamingRoomProps> = ({ app, usuario, onBack, onShowGame }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const createSession = useMutation(api.gaming.createGameSession);
  const completeSession = useMutation(api.gaming.completeGameSession);
  const recordGamePlayed = useMutation(api.gaming.recordGamePlayed);
  const leaderboard = useQuery(api.gaming.getLeaderboard, { appId: app.appId, limit: 5 });
  const stats = useQuery(api.gaming.getGameStats, { appId: app.appId });

  const startGame = async () => {
    if (!usuario || usuario.id === 'guest') return;
    
    try {
      const sid = await createSession({
        userId: usuario.id,
        appId: app.appId,
        gameMode: 'classic',
      });
      setSessionId(sid as string);
      setGameStarted(true);
      await recordGamePlayed({ appId: app.appId, playerCount: 5 });
      onShowGame();
    } catch (err) {
      console.error('Error al crear sesión:', err);
    }
  };

  const handleGameEnd = async (score: number, isWinner: boolean) => {
    if (!sessionId) return;
    
    try {
      const result = await completeSession({
        sessionId: sessionId as any,
        score,
        won: isWinner,
      });
      setXpEarned(result.xpEarned);
      setWon(isWinner);
      setShowResult(true);
      setGameStarted(false);
    } catch (err) {
      console.error('Error al completar sesión:', err);
    }
  };

  const handlePlayAgain = () => {
    setSessionId(null);
    setXpEarned(null);
    setWon(null);
    setShowResult(false);
  };

  if (!gameStarted && !showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0b] to-[#111114] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Volver al catálogo
          </button>

          <div className="glass bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="size-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary">{app.icon}</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                  {app.name}
                </h1>
                <p className="text-gray-400 mt-1">{app.description}</p>
              </div>
            </div>

            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-primary">{stats.totalSessions}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Partidas</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-green-400">{stats.uniquePlayers}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Jugadores</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-yellow-400">{stats.winRate}%</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Victorias</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-purple-400">{stats.totalXP}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">XP Total</p>
                </div>
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!usuario || usuario.id === 'guest'}
              className="w-full py-5 bg-gradient-to-r from-primary to-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {usuario && usuario.id !== 'guest' ? '🎮 Iniciar Partida' : 'Inicia sesión para jugar'}
            </button>
          </div>

          {leaderboard && leaderboard.length > 0 && (
            <div className="glass bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-400">emoji_events</span>
                Top Jugadores
              </h2>
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div
                    key={player.userId}
                    className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-white/10 text-gray-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-white">{player.username}</p>
                      <p className="text-xs text-gray-500">{player.sessions} partidas · {player.wins} victorias</p>
                    </div>
                    <p className="font-black text-primary text-lg">{player.totalScore} pts</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0b] to-[#111114] p-4 md:p-8 flex items-center justify-center">
        <div className="glass bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center max-w-md w-full animate-in zoom-in-95 fade-in duration-500">
          <div className="text-8xl mb-6">{won ? '🏆' : '🎮'}</div>
          
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
            {won ? '¡Victoria!' : '¡Buena partida!'}
          </h1>
          
          <p className="text-gray-400 mb-8">
            {won ? 'Has ganado la partida' : 'La próxima vez será'}
          </p>

          <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-2xl p-6 mb-8">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">XP Ganada</p>
            <p className="text-5xl font-black text-primary">+{xpEarned}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Puntuación</p>
              <p className="text-2xl font-black text-white">150</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest">Duración</p>
              <p className="text-2xl font-black text-white">8:32</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePlayAgain}
              className="flex-1 py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Jugar de nuevo
            </button>
            <button
              onClick={onBack}
              className="px-6 py-4 bg-white/5 text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GamingRoom;
