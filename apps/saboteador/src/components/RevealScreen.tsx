import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function RevealScreen() {
  const { state, dispatch } = useGame();
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedRoles, setRevealedRoles] = useState<Set<string>>(new Set());

  const currentPlayer = state.players[currentIndex];

  const handleReveal = () => {
    setIsRevealing(true);
    setTimeout(() => {
      setRevealedRoles(prev => new Set([...prev, currentPlayer.id]));
      setIsRevealing(false);
    }, 1500);
  };

  const handleNext = () => {
    if (currentIndex < state.players.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      dispatch({ type: 'SET_PHASE', payload: 'mission_active' });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'saboteur': return 'var(--neon-red)';
      case 'detective': return 'var(--neon-cyan)';
      case 'double_agent': return 'var(--neon-purple)';
      default: return 'var(--neon-green)';
    }
  };

  const getRoleEmoji = (role: string) => {
    switch (role) {
      case 'saboteur': return '👿';
      case 'detective': return '🔍';
      case 'double_agent': return '🎭';
      default: return '🧑';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'saboteur': return 'SABOTEADOR';
      case 'detective': return 'DETECTIVE';
      case 'double_agent': return 'DOBLE AGENTE';
      default: return 'EQUIPO';
    }
  };

  return (
    <div className="screen">
      <div className="reveal-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentIndex + 1) / state.players.length) * 100}%` }}
          />
        </div>

        <p className="progress-text text-sm text-muted mb-lg">
          {currentIndex + 1} de {state.players.length}
        </p>

        <div className="reveal-card card animate-scaleIn">
          <p className="instruction text-secondary mb-md">
            Jugador actual:
          </p>
          
          <h2 className="player-name text-2xl text-neon-cyan mb-xl">
            {currentPlayer?.name}
          </h2>

          <div className={`role-container ${isRevealing ? 'revealing' : ''}`}>
            {revealedRoles.has(currentPlayer.id) ? (
              <div className="role-revealed">
                <span 
                  className="role-emoji"
                  style={{ filter: `drop-shadow(0 0 20px ${getRoleColor(currentPlayer.role)})` }}
                >
                  {getRoleEmoji(currentPlayer.role)}
                </span>
                <p 
                  className="role-name"
                  style={{ color: getRoleColor(currentPlayer.role) }}
                >
                  {getRoleName(currentPlayer.role)}
                </p>
              </div>
            ) : (
              <div className="role-hidden">
                <button 
                  className="btn btn-neon-red reveal-btn"
                  onClick={handleReveal}
                  disabled={isRevealing}
                >
                  {isRevealing ? 'Revelando...' : '🎭 Revelar Mi Rol'}
                </button>
                <p className="hold-text">Haz clic para ver tu rol secreto</p>
              </div>
            )}
          </div>
        </div>

        {revealedRoles.has(currentPlayer.id) && (
          <button 
            className="btn btn-neon-cyan btn-full mt-xl"
            onClick={handleNext}
          >
            {currentIndex < state.players.length - 1 ? 'Siguiente' : 'Comenzar Juego'}
          </button>
        )}
      </div>

      <style>{`
        .reveal-container {
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: var(--bg-elevated);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: var(--space-md);
        }

        .progress-fill {
          height: 100%;
          background: var(--neon-cyan);
          transition: width 0.3s ease;
          box-shadow: 0 0 10px var(--neon-cyan-glow);
        }

        .reveal-card {
          width: 100%;
          text-align: center;
          padding: var(--space-2xl);
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
        }

        .player-name {
          font-size: 2.5rem;
        }

        .role-container {
          min-height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .role-revealed {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: scaleIn 0.3s ease;
        }

        .role-emoji {
          font-size: 120px;
          margin-bottom: var(--space-lg);
          animation: glow 2s ease-in-out infinite;
        }

        .role-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 32px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .role-hidden {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xl);
        }

        .reveal-btn {
          min-width: 250px;
          padding: var(--space-lg) var(--space-2xl);
          font-size: 18px;
        }

        .reveal-btn:hover {
          transform: scale(1.05);
        }

        .hold-text {
          font-size: 16px;
          color: var(--text-muted);
        }

        @media (min-width: 768px) {
          .reveal-container {
            max-width: 600px;
          }
          
          .role-emoji {
            font-size: 160px;
          }
          
          .role-name {
            font-size: 42px;
          }
          
          .reveal-card {
            padding: var(--space-2xl) var(--space-2xl);
          }
        }
      `}</style>
    </div>
  );
}
