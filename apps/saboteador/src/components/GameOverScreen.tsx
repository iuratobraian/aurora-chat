import { useGame } from '../context/GameContext';

export default function GameOverScreen() {
  const { state, dispatch } = useGame();

  const winners = state.winner === 'saboteurs' ? 'Los Saboteadores' : 'El Equipo';
  const winnerColor = state.winner === 'saboteurs' ? 'neon-red' : 'neon-green';
  const winnerEmoji = state.winner === 'saboteurs' ? '👿' : '🧑';

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const saboteurs = state.players.filter(p => p.role === 'saboteur');
  const exiledSaboteurs = saboteurs.filter(p => !p.isAlive);

  return (
    <div className="screen">
      <div className="gameover-container animate-scaleIn">
        <div className={`winner-display ${winnerColor}`}>
          <span className="winner-emoji">{winnerEmoji}</span>
          <h1 className={`text-3xl text-${winnerColor} mt-lg`}>
            {winners}
          </h1>
          <p className="text-lg mt-md">¡Ganan!</p>
        </div>

        <div className="final-stats card mt-xl mb-xl">
          <h2 className="text-lg text-center mb-lg">Resumen</h2>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Rondas jugadas</span>
              <span className="stat-value">{state.currentRound}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Saboteadores</span>
              <span className="stat-value">{saboteurs.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Saboteadores eliminados</span>
              <span className="stat-value">{exiledSaboteurs.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Exitos</span>
              <span className="stat-value text-neon-green">
                {state.missionHistory.filter(m => m.result === 'success').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Fallos</span>
              <span className="stat-value text-neon-red">
                {state.missionHistory.filter(m => m.result === 'failure').length}
              </span>
            </div>
          </div>
        </div>

        <div className="players-reveal card">
          <h3 className="text-md text-center mb-md">Roles secretos</h3>
          <div className="players-list">
            {state.players.map((player) => (
              <div key={player.id} className="player-reveal-item">
                <span className={`player-status ${player.isAlive ? 'alive' : 'dead'}`}>
                  {player.isAlive ? '✓' : '✗'}
                </span>
                <span className="player-name">{player.name}</span>
                <span className={`player-role ${player.role}`}>
                  {player.role === 'saboteur' && '👿'}
                  {player.role === 'detective' && '🔍'}
                  {player.role === 'double_agent' && '🎭'}
                  {player.role === 'normal' && '🧑'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button 
          className="btn btn-neon-cyan btn-full mt-xl"
          onClick={handlePlayAgain}
        >
          Nueva Partida
        </button>
      </div>

      <style>{`
        .gameover-container {
          width: 100%;
          max-width: 600px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .winner-display {
          padding: var(--space-2xl);
        }

        .winner-emoji {
          font-size: 120px;
          display: block;
        }

        .final-stats {
          text-align: left;
          width: 100%;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-lg);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-muted);
        }

        .stat-value {
          font-family: 'Orbitron', sans-serif;
          font-size: 28px;
          font-weight: 700;
        }

        .players-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
          width: 100%;
        }

        .player-reveal-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .player-status {
          width: 32px;
          text-align: center;
          font-size: 18px;
        }

        .player-status.alive {
          color: var(--neon-green);
        }

        .player-status.dead {
          color: var(--neon-red);
        }

        .player-name {
          flex: 1;
          text-align: left;
        }

        .player-role {
          font-size: 24px;
        }

        @media (min-width: 768px) {
          .winner-emoji {
            font-size: 160px;
          }
          
          .stat-value {
            font-size: 36px;
          }
        }
      `}</style>
    </div>
  );
}
