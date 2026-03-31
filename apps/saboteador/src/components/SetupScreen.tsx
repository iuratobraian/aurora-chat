import { useGame } from '../context/GameContext';

export default function SetupScreen() {
  const { state, dispatch } = useGame();
  const { playerCount } = state;

  const decreasePlayers = () => {
    if (playerCount > 5) {
      dispatch({ type: 'SET_PLAYER_COUNT', payload: playerCount - 1 });
    }
  };

  const increasePlayers = () => {
    if (playerCount < 10) {
      dispatch({ type: 'SET_PLAYER_COUNT', payload: playerCount + 1 });
    }
  };

  const getSaboteurCount = (count: number) => Math.ceil(count / 4);

  return (
    <div className="screen">
      <div className="setup-container animate-fadeIn">
        <h1 className="text-2xl text-neon-cyan text-center mb-lg">
          Configuración
        </h1>

        <div className="player-selector card">
          <p className="text-sm text-secondary text-center mb-md">
            Cantidad de Jugadores
          </p>
          
          <div className="counter">
            <button 
              className="counter-btn btn-neon-red"
              onClick={decreasePlayers}
              disabled={playerCount <= 5}
            >
              −
            </button>
            
            <div className="counter-display">
              <span className="counter-number text-3xl text-neon-green">
                {playerCount}
              </span>
              <span className="counter-label text-sm text-muted">
                jugadores
              </span>
            </div>
            
            <button 
              className="counter-btn btn-neon-green"
              onClick={increasePlayers}
              disabled={playerCount >= 10}
            >
              +
            </button>
          </div>

          <div className="role-preview mt-lg">
            <div className="role-item">
              <span className="role-icon text-neon-red">👿</span>
              <span className="role-count">{getSaboteurCount(playerCount)}</span>
              <span className="role-label">Saboteador{getSaboteurCount(playerCount) > 1 ? 'es' : ''}</span>
            </div>
            <div className="role-item">
              <span className="role-icon">🤔</span>
              <span className="role-count">{playerCount - getSaboteurCount(playerCount)}</span>
              <span className="role-label">Equipo</span>
            </div>
          </div>

          {playerCount >= 7 && (
            <div className="special-roles mt-md text-center">
              <span className="badge badge-detective">+ Detective</span>
            </div>
          )}
          {playerCount >= 8 && (
            <div className="special-roles mt-sm text-center">
              <span className="badge badge-double">+ Doble Agente</span>
            </div>
          )}
        </div>

        <button 
          className="btn btn-neon-cyan btn-full mt-xl"
          onClick={() => dispatch({ type: 'SET_PHASE', payload: 'names' })}
        >
          Continuar
        </button>
      </div>

      <style>{`
        .setup-container {
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .player-selector {
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
          width: 100%;
        }

        .counter {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-xl);
        }

        .counter-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          font-size: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border-width: 3px;
          cursor: pointer;
        }

        .counter-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .counter-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 100px;
        }

        .role-preview {
          display: flex;
          justify-content: center;
          gap: var(--space-xl);
          padding: var(--space-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .role-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xs);
        }

        .role-icon {
          font-size: 24px;
        }

        .role-count {
          font-family: 'Orbitron', sans-serif;
          font-size: 24px;
          font-weight: 700;
        }

        .role-label {
          font-size: 12px;
          color: var(--text-muted);
        }

        .special-roles {
          font-size: 12px;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 500;
        }

        .badge-detective {
          background: rgba(0, 212, 255, 0.2);
          color: var(--neon-cyan);
          border: 1px solid var(--neon-cyan);
        }

        .badge-double {
          background: rgba(185, 103, 255, 0.2);
          color: var(--neon-purple);
          border: 1px solid var(--neon-purple);
        }
      `}</style>
    </div>
  );
}
