import { useGame } from '../context/GameContext';

export default function TeamSelectionScreen() {
  const { state, dispatch } = useGame();
  
  const alivePlayers = state.players.filter(p => p.isAlive);
  const currentLeader = alivePlayers.find(p => p.id === state.currentLeaderId);
  const teamSize = getTeamSize(state.playerCount, state.currentRound);
  
  function getTeamSize(playerCount: number, round: number): number {
    const teamSizes: Record<number, number[]> = {
      5: [2, 3, 2, 3, 3],
      6: [2, 3, 2, 3, 3],
      7: [2, 3, 4, 4, 4],
      8: [2, 3, 4, 4, 5],
      9: [3, 4, 4, 5, 5],
      10: [3, 4, 4, 5, 5],
    };
    const sizes = teamSizes[Math.min(playerCount, 10)] || teamSizes[6];
    return sizes[Math.min(round - 1, 4)];
  }
  
  const isLeader = state.currentPlayerId === state.currentLeaderId;
  const canConfirm = state.selectedTeam.length === teamSize;
  
  return (
    <div className="screen team-selection-screen">
      <div className="screen-header">
        <p className="round-info">Ronda {state.currentRound}</p>
        <h2 className="screen-title">Selección de Equipo</h2>
        <p className="leader-info">
          Líder: <span className="leader-name">{currentLeader?.name}</span>
        </p>
      </div>
      
      <div className="team-size-indicator">
        <span className="team-size-label">Tamaño del equipo:</span>
        <span className="team-size-value">{teamSize}</span>
        <span className="team-size-progress">
          {state.selectedTeam.length}/{teamSize}
        </span>
      </div>
      
      <div className="players-grid">
        {alivePlayers.map(player => {
          const isSelected = state.selectedTeam.includes(player.id);
          const isCurrentHolder = player.id === state.currentPlayerId;
          
          return (
            <button
              key={player.id}
              className={`player-card ${isSelected ? 'selected' : ''} ${isCurrentHolder ? 'current' : ''}`}
              onClick={() => {
                if (isLeader) {
                  dispatch({ type: 'TOGGLE_TEAM_MEMBER', payload: player.id });
                }
              }}
              disabled={!isLeader}
            >
              <span className="player-avatar">{player.name.charAt(0).toUpperCase()}</span>
              <span className="player-name">{player.name}</span>
              {isSelected && <span className="selected-check">✓</span>}
            </button>
          );
        })}
      </div>
      
      <div className="action-buttons">
        {!isLeader ? (
          <p className="waiting-message">Esperando que {currentLeader?.name} seleccione el equipo...</p>
        ) : (
          <>
            <button
              className="btn btn--primary"
              disabled={!canConfirm}
              onClick={() => dispatch({ type: 'CONFIRM_TEAM' })}
            >
              Confirmar Equipo ({state.selectedTeam.length}/{teamSize})
            </button>
            <button
              className="btn btn--secondary"
              onClick={() => dispatch({ type: 'SET_PHASE', payload: 'start' })}
            >
              Abandonar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
