import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function VoteScreen() {
  const { state, dispatch } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  
  const alivePlayers = state.players.filter(p => p.isAlive);
  const hasVoted = alivePlayers.every(p => p.hasVoted);

  const handleVote = (playerId: string) => {
    const currentPlayerId = state.currentPlayerId;
    if (!currentPlayerId) return;
    
    dispatch({ 
      type: 'CAST_VOTE', 
      payload: { playerId: currentPlayerId, targetId: playerId } 
    });
    setSelectedPlayer(playerId);
  };

  const handleResolve = () => {
    dispatch({ type: 'RESOLVE_EXILE' });
  };

  return (
    <div className="screen">
      <div className="vote-container animate-fadeIn">
        <h1 className="text-xl text-neon-purple text-center mb-lg">
          Votación de Sospechoso
        </h1>
        <p className="text-sm text-secondary text-center mb-xl">
          ¿Quién crees que es el saboteador?
        </p>

        <div className="players-grid">
          {alivePlayers.map((player) => (
            <button
              key={player.id}
              className={`player-card ${selectedPlayer === player.id ? 'selected' : ''}`}
              onClick={() => handleVote(player.id)}
              disabled={player.hasVoted}
            >
              <span className="player-avatar">
                {player.name.charAt(0).toUpperCase()}
              </span>
              <span className="player-name">{player.name}</span>
              {player.hasVoted && (
                <span className="voted-check">✓</span>
              )}
            </button>
          ))}
        </div>

        {hasVoted && (
          <button 
            className="btn btn-neon-purple btn-full mt-xl animate-scaleIn"
            onClick={handleResolve}
          >
            Ver Resultados
          </button>
        )}
      </div>

      <style>{`
        .vote-container {
          width: 100%;
          max-width: 700px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .players-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-lg);
          width: 100%;
        }

        .player-card {
          background: var(--bg-card);
          border: 2px solid transparent;
          border-radius: var(--radius-md);
          padding: var(--space-xl);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-md);
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .player-card:hover:not(:disabled) {
          border-color: var(--neon-purple);
          transform: scale(1.05);
        }

        .player-card.selected {
          border-color: var(--neon-purple);
          box-shadow: 0 0 30px var(--neon-purple-glow);
        }

        .player-card:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .player-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--neon-purple);
        }

        .player-name {
          font-size: 16px;
          text-align: center;
        }

        .voted-check {
          color: var(--neon-green);
          font-size: 18px;
        }

        @media (min-width: 768px) {
          .players-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
