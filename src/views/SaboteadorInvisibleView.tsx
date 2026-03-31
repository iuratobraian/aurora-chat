import React, { useState } from 'react';
import { Usuario } from '../types';

interface SaboteadorInvisibleViewProps {
  usuario: Usuario | null;
  onBack: () => void;
}

const SaboteadorInvisibleView: React.FC<SaboteadorInvisibleViewProps> = ({ usuario, onBack }) => {
  const [phase, setPhase] = useState<'lobby' | 'setup' | 'playing' | 'results'>('lobby');
  const [gameMode, setGameMode] = useState<'classic' | 'teams' | 'survival'>('classic');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [players, setPlayers] = useState<string[]>(() => {
    const saved = localStorage.getItem('saboteador_players');
    return saved ? JSON.parse(saved) : [];
  });
  const [newPlayer, setNewPlayer] = useState('');
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
  const [gameHistory, setGameHistory] = useState<{winner: string; date: number}[]>(() => {
    const saved = localStorage.getItem('saboteador_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [gameRoles, setGameRoles] = useState<Record<string, 'good' | 'saboteur'>>({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [revealedRoles, setRevealedRoles] = useState<Set<string>>(new Set());
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Persist players
  React.useEffect(() => {
    localStorage.setItem('saboteador_players', JSON.stringify(players));
  }, [players]);

  const addPlayer = () => {
    if (newPlayer.trim() && !players.includes(newPlayer.trim())) {
      setPlayers([...players, newPlayer.trim()]);
      setNewPlayer('');
    }
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const assignRoles = (playerList: string[]) => {
    const shuffled = shuffleArray(playerList);
    const saboteurIndex = Math.floor(Math.random() * shuffled.length);
    const roles: Record<string, 'good' | 'saboteur'> = {};
    shuffled.forEach((name, i) => {
      roles[name] = i === saboteurIndex ? 'saboteur' : 'good';
    });
    return roles;
  };

  const handleStartGame = () => {
    const roles = assignRoles(players);
    setGameRoles(roles);
    setCurrentPlayerIndex(0);
    setRevealedRoles(new Set());
    setShowRoleModal(false);
    setGameStarted(false);
    setPhase('playing');
  };

  const handleRevealRole = (playerName: string) => {
    setShowRoleModal(true);
  };

  const handleNextPlayer = () => {
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    setShowRoleModal(false);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 size-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 size-96 bg-blue-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        {phase === 'lobby' && (
          <>
            <div className="mb-12">
              <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-black border border-primary/50 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] mb-8 transform hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-5xl text-primary animate-pulse">visibility_off</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-2 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                El Saboteador <br />
                <span className="text-primary italic">Invisible</span>
              </h1>
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">
                Descubrí quién está saboteando... antes de que sea tarde
              </p>
            </div>

            <div className="space-y-4 w-full px-4">
              <button 
                onClick={() => setPhase('setup')}
                className="w-full py-6 glass bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xl rounded-3xl shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.6)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <span>Jugar</span>
                <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">play_arrow</span>
              </button>

              <button 
                className="w-full py-5 glass bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                Cómo Jugar
              </button>

              <div className="flex gap-4">
                <button 
                   onClick={onBack}
                   className="flex-1 py-4 glass bg-black/60 hover:bg-black/80 text-gray-500 hover:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl border border-white/5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Volver al Catálogo
                </button>
                <button className="size-14 glass bg-black/60 hover:bg-black/80 text-gray-500 hover:text-primary rounded-2xl border border-white/5 transition-all duration-300 flex items-center justify-center">
                  <span className="material-symbols-outlined">settings</span>
                </button>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/5 w-full flex items-center justify-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Versión</span>
                <span className="text-xs font-bold text-primary">BETA 0.1</span>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Modo</span>
                <span className="text-xs font-bold text-white">OFFLINE</span>
              </div>
            </div>
          </>
        )}

        {phase === 'setup' && (
          <div className="animate-in slide-in-from-right-10 duration-500">
             <h2 className="text-3xl font-black text-white uppercase mb-8">Configurar Partida</h2>
             
             <div className="glass bg-black/40 rounded-3xl p-6 border border-white/10 mb-6">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Modo de Juego</h3>
               <div className="grid grid-cols-3 gap-2">
                 {(['classic', 'teams', 'survival'] as const).map((mode) => (
                   <button
                     key={mode}
                     onClick={() => setGameMode(mode)}
                     className={`py-3 px-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                       gameMode === mode ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                     }`}
                   >
                     {mode === 'classic' ? 'Clásico' : mode === 'teams' ? 'Equipos' : 'Supervivencia'}
                   </button>
                 ))}
               </div>
             </div>

             <div className="glass bg-black/40 rounded-3xl p-6 border border-white/10 mb-6">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Dificultad</h3>
               <div className="grid grid-cols-3 gap-2">
                 {(['easy', 'normal', 'hard'] as const).map((diff) => (
                   <button
                     key={diff}
                     onClick={() => setDifficulty(diff)}
                     className={`py-3 px-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                       difficulty === diff 
                         ? diff === 'easy' ? 'bg-signal-green text-white' 
                           : diff === 'normal' ? 'bg-yellow-500 text-black' 
                           : 'bg-alert-red text-white'
                         : 'bg-white/5 text-gray-400 hover:bg-white/10'
                     }`}
                   >
                     {diff === 'easy' ? 'Fácil' : diff === 'normal' ? 'Normal' : 'Difícil'}
                   </button>
                 ))}
               </div>
             </div>
             
             <div className="glass bg-black/40 rounded-3xl p-6 border border-white/10 mb-6 max-h-[40vh] overflow-y-auto space-y-2">
                {players.map((name, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                    <span className="font-bold text-white uppercase tracking-widest text-sm">{name}</span>
                    <button onClick={() => removePlayer(i)} className="text-red-400 hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ))}
                {players.length === 0 && (
                  <p className="text-gray-600 text-xs italic py-4">Añade al menos 4 jugadores...</p>
                )}
             </div>

             <div className="glass bg-black/40 rounded-3xl p-6 border border-white/10 mb-8">
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={newPlayer}
                   onChange={(e) => setNewPlayer(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                   placeholder="Nombre del jugador..." 
                   className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-primary transition-colors font-bold uppercase tracking-wider"
                 />
                 <button 
                   onClick={addPlayer}
                   className="bg-primary/20 hover:bg-primary/30 text-primary p-4 rounded-2xl transition-all"
                 >
                   <span className="material-symbols-outlined">add</span>
                 </button>
               </div>
             </div>

             <div className="space-y-4">
                <button 
                  disabled={players.length < 4}
                  onClick={handleStartGame}
                  className="w-full py-5 bg-primary disabled:bg-gray-800 disabled:text-gray-600 text-white font-black uppercase tracking-widest rounded-3xl shadow-lg transition-all"
                >
                 Comenzar ({players.length}/10)
               </button>
               
               <button 
                 onClick={() => setPhase('lobby')}
                 className="text-gray-500 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors"
               >
                 Volver al Menú
               </button>
             </div>
          </div>
        )}

        {phase === 'playing' && (
          <div className="animate-in zoom-in-50 duration-500">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Asignación de Roles</h2>
              <p className="text-primary text-xs font-bold uppercase tracking-widest mt-2">Pásale el celular al jugador indicado</p>
            </div>
            <div className="glass bg-black/40 rounded-[2.5rem] p-10 border border-primary/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]">
              <span className="material-symbols-outlined text-6xl text-primary animate-bounce mb-6">swipe_right</span>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Siguiente Turno:</p>
              <h3 className="text-4xl font-black text-white uppercase">{players[currentPlayerIndex]}</h3>
              <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-gray-500 text-xs italic">Toca el botón solo cuando tengas el celular en la mano y nadie más esté mirando.</p>
              </div>
            </div>
            <div className="mt-12 space-y-4">
              {!revealedRoles.has(players[currentPlayerIndex]) ? (
                <button
                  onClick={() => handleRevealRole(players[currentPlayerIndex])}
                  className="w-full py-6 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl hover:scale-[1.02] transition-transform"
                >
                  Ver Mi Rol Oculto
                </button>
              ) : (
                <button
                  onClick={handleNextPlayer}
                  className="w-full py-6 bg-green-600 text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl hover:scale-[1.02] transition-transform"
                >
                  Siguiente Jugador
                </button>
              )}
              <button
                onClick={() => { setPhase('lobby'); setShowRoleModal(false); setGameStarted(false); }}
                className="text-gray-600 hover:text-white font-bold uppercase tracking-widest text-[10px] transition-colors"
              >
                Finalizar Partida
              </button>
            </div>
            {showRoleModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="glass bg-black/90 rounded-[2rem] p-10 border border-primary/30 shadow-[0_0_60px_rgba(var(--primary-rgb),0.3)] max-w-sm w-full text-center animate-in zoom-in-50 duration-300">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Tu rol secreto es:</p>
                  <div className={`text-5xl font-black uppercase tracking-widest mb-6 ${gameRoles[players[currentPlayerIndex]] === 'saboteur' ? 'text-red-500' : 'text-green-400'}`}>
                    {gameRoles[players[currentPlayerIndex]] === 'saboteur' ? '🎭 Saboteador' : '✅ Buen Trader'}
                  </div>
                  {gameRoles[players[currentPlayerIndex]] === 'saboteur' ? (
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                      Tu misión es <strong className="text-red-400">sabotear las decisiones de inversión</strong> del equipo sin que te descubran.
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                      Eres un <strong className="text-green-400">Buen Trader</strong>. Tu misión es identificar al Saboteador.
                    </p>
                  )}
                  <button
                    onClick={() => { setRevealedRoles(prev => new Set([...prev, players[currentPlayerIndex]])); setShowRoleModal(false); }}
                    className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
                  >
                    Entendido — Pasar al siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SaboteadorInvisibleView;
