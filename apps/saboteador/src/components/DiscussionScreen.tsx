import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function DiscussionScreen() {
  const { state, dispatch } = useGame();
  const [timeLeft, setTimeLeft] = useState(60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          dispatch({ type: 'START_VOTE' });
          return 0;
        }
        if (prev <= 10) setIsWarning(true);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch]);

  return (
    <div className="screen">
      <div className="discussion-container animate-fadeIn">
        <h1 className="text-xl text-neon-yellow text-center mb-lg">
          Tiempo de Discusión
        </h1>

        <div className={`timer-display ${isWarning ? 'warning' : ''}`}>
          <span className="timer-number">{timeLeft}</span>
          <span className="timer-label">segundos</span>
        </div>

        <div className="mission-result card mb-xl">
          <p className="text-sm text-secondary mb-sm">Resultado de la misión:</p>
          <div className="result-badge">
            {state.missionHistory[state.missionHistory.length - 1]?.result === 'success' ? (
              <span className="text-neon-green text-xl">✓ ÉXITO</span>
            ) : (
              <span className="text-neon-red text-xl">✗ FALLO</span>
            )}
          </div>
        </div>

        <div className="history-summary">
          <p className="text-sm text-muted text-center mb-md">Estado del juego</p>
          <div className="history-stats">
            <div className="stat">
              <span className="stat-value text-neon-green">
                {state.missionHistory.filter(m => m.result === 'success').length}
              </span>
              <span className="stat-label">Éxitos</span>
            </div>
            <div className="stat">
              <span className="stat-value text-neon-red">
                {state.missionHistory.filter(m => m.result === 'failure').length}
              </span>
              <span className="stat-label">Fallos</span>
            </div>
            <div className="stat">
              <span className="stat-value text-neon-cyan">
                {state.currentRound}
              </span>
              <span className="stat-label">Ronda</span>
            </div>
          </div>
        </div>

        <button 
          className="btn btn-neon-purple btn-full mt-xl"
          onClick={() => dispatch({ type: 'START_VOTE' })}
        >
          Forzar Votación
        </button>
      </div>

      <style>{`
        .discussion-container {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .timer-display {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .timer-number {
          font-family: 'Orbitron', sans-serif;
          font-size: 96px;
          font-weight: 900;
          color: var(--neon-yellow);
          text-shadow: 0 0 30px var(--neon-yellow-glow);
          display: block;
        }

        .timer-display.warning .timer-number {
          color: var(--neon-red);
          text-shadow: 0 0 30px var(--neon-red-glow);
          animation: pulse 0.5s infinite;
        }

        .timer-label {
          font-size: 14px;
          color: var(--text-muted);
        }

        .result-badge {
          padding: var(--space-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .history-stats {
          display: flex;
          justify-content: center;
          gap: var(--space-xl);
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-family: 'Orbitron', sans-serif;
          font-size: 32px;
          font-weight: 700;
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
