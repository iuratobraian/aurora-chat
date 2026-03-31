import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { missionsData } from '../data/missions';

export default function MissionScreen() {
  const { state, dispatch } = useGame();
  const [isSaboteurVoting, setIsSaboteurVoting] = useState(false);
  const [sabotageConfirmed, setSabotageConfirmed] = useState(false);

  const currentPlayer = state.players.find(p => p.isCurrentHolder);
  const currentMission = missionsData[state.currentMissionIndex % missionsData.length];
  const options = (currentMission.data as { options?: string[] }).options;

  const handleSabotage = () => {
    if (currentPlayer?.role === 'saboteur') {
      setIsSaboteurVoting(true);
    }
  };

  const confirmSabotage = () => {
    dispatch({ type: 'CAST_SABOTAGE_VOTE' });
    setSabotageConfirmed(true);
  };

  const handleMissionComplete = () => {
    const sabotageVotes = state.missions[state.currentMissionIndex]?.sabotageVotes || 0;
    const result = sabotageVotes > 0 ? 'failure' : 'success';
    dispatch({ type: 'RESOLVE_MISSION', payload: result });
  };

  const getRoleDisplay = () => {
    if (!currentPlayer) return '???';
    switch (currentPlayer.role) {
      case 'saboteur': return '👿 SABOTEADOR';
      case 'detective': return '🔍 DETECTIVE';
      case 'double_agent': return '🎭 DOBLE AGENTE';
      default: return '🧑 EQUIPO';
    }
  };

  return (
    <div className="screen">
      <div className="mission-container animate-fadeIn">
        <div className="round-indicator flex flex-center mb-lg">
          <span className="round-badge">
            Ronda {state.currentRound}
          </span>
        </div>

        <div className="mission-status card mb-lg">
          <p className="text-sm text-secondary mb-sm">Portador actual:</p>
          <h2 className="text-xl text-neon-cyan">{currentPlayer?.name || '???'}</h2>
          <p className="role-display text-md mt-sm">{getRoleDisplay()}</p>
        </div>

        <div className="mission-card card mb-xl">
          <h3 className="text-lg text-center mb-md">{currentMission.title}</h3>
          <p className="text-secondary text-center">{currentMission.description}</p>
          
          {currentMission.type === 'choose' && options && (
            <div className="choice-buttons mt-lg flex flex-col flex-gap-md">
              {options.map((opt: string, i: number) => (
                <button key={i} className="btn">
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {currentPlayer?.role === 'saboteur' && !sabotageConfirmed && (
          <div className="sabotage-section">
            {isSaboteurVoting ? (
              <div className="sabotage-confirm animate-scaleIn">
                <p className="text-neon-red text-center mb-md">¿Sabotear la misión?</p>
                <div className="flex flex-gap-md">
                  <button className="btn btn-neon-red flex-1" onClick={confirmSabotage}>
                    Sí, Sabotear
                  </button>
                  <button className="btn btn-neon-green flex-1" onClick={() => setIsSaboteurVoting(false)}>
                    No
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-neon-red btn-full" onClick={handleSabotage}>
                🎯 Opciones de Saboteador
              </button>
            )}
          </div>
        )}

        <button 
          className="btn btn-neon-green btn-full mt-lg"
          onClick={handleMissionComplete}
        >
          Completar Misión
        </button>

        <div className="mission-history mt-xl">
          <p className="text-sm text-muted text-center mb-md">Historial de Misiones</p>
          <div className="history-dots flex flex-center flex-gap-sm">
            {state.missionHistory.map((m, i) => (
              <span 
                key={i} 
                className={`history-dot ${m.result}`}
              />
            ))}
            {state.missionHistory.length < 6 && (
              Array(6 - state.missionHistory.length).fill(null).map((_, i) => (
                <span key={`pending-${i}`} className="history-dot pending" />
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .mission-container {
          width: 100%;
          max-width: 400px;
        }

        .round-badge {
          background: var(--bg-elevated);
          padding: var(--space-sm) var(--space-lg);
          border-radius: 20px;
          font-family: 'Orbitron', sans-serif;
          font-size: 14px;
          color: var(--neon-cyan);
        }

        .role-display {
          font-family: 'Orbitron', sans-serif;
        }

        .sabotage-section {
          margin-top: var(--space-lg);
        }

        .history-dots {
          gap: var(--space-sm);
        }

        .history-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--bg-elevated);
          border: 2px solid var(--text-muted);
        }

        .history-dot.success {
          background: var(--neon-green);
          border-color: var(--neon-green);
          box-shadow: 0 0 10px var(--neon-green-glow);
        }

        .history-dot.failure {
          background: var(--neon-red);
          border-color: var(--neon-red);
          box-shadow: 0 0 10px var(--neon-red-glow);
        }

        .history-dot.pending {
          opacity: 0.4;
        }
      `}</style>
    </div>
  );
}
