import { useGame } from '../context/GameContext';

export default function TeamVoteScreen() {
  const { state, dispatch } = useGame();
  
  const alivePlayers = state.players.filter(p => p.isAlive);
  const teamMembers = state.selectedTeam.map(id => state.players.find(p => p.id === id)).filter(Boolean);
  
  const allVoted = alivePlayers.every(p => state.teamVotes[p.id]);
  const yesVotes = Object.values(state.teamVoteResults).filter(v => v === 'yes').length;
  const noVotes = Object.values(state.teamVoteResults).filter(v => v === 'no').length;
  
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  const hasVoted = currentPlayer ? state.teamVotes[currentPlayer.id] : false;
  
  return (
    <div className="screen team-vote-screen">
      <div className="screen-header">
        <p className="round-info">Ronda {state.currentRound}</p>
        <h2 className="screen-title">Votación de Equipo</h2>
      </div>
      
      <div className="team-members-section">
        <h3>Equipo propuesto:</h3>
        <div className="team-members-list">
          {teamMembers.map(player => player && (
            <div key={player.id} className="team-member-badge">
              <span className="member-avatar">{player.name.charAt(0).toUpperCase()}</span>
              <span className="member-name">{player.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="vote-tally">
        <div className="vote-count yes">
          <span className="vote-icon">✓</span>
          <span className="vote-number">{yesVotes}</span>
          <span className="vote-label">Aprobación</span>
        </div>
        <div className="vote-count no">
          <span className="vote-icon">✗</span>
          <span className="vote-number">{noVotes}</span>
          <span className="vote-label">Rechazo</span>
        </div>
      </div>
      
      <div className="players-voting-list">
        {alivePlayers.map(player => {
          const vote = state.teamVoteResults[player.id];
          return (
            <div key={player.id} className={`voting-player ${vote ? 'voted' : ''}`}>
              <span className="player-name">{player.name}</span>
              {vote && (
                <span className={`vote-result ${vote}`}>
                  {vote === 'yes' ? '✓' : vote === 'no' ? '✗' : '—'}
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      {!hasVoted && (
        <div className="vote-buttons">
          <button
            className="btn btn--success"
            onClick={() => dispatch({ 
              type: 'CAST_TEAM_VOTE', 
              payload: { playerId: currentPlayer?.id || '', vote: 'yes' }
            })}
          >
            ✓ Aprobar
          </button>
          <button
            className="btn btn--danger"
            onClick={() => dispatch({ 
              type: 'CAST_TEAM_VOTE', 
              payload: { playerId: currentPlayer?.id || '', vote: 'no' }
            })}
          >
            ✗ Rechazar
          </button>
          <button
            className="btn btn--secondary"
            onClick={() => dispatch({ 
              type: 'CAST_TEAM_VOTE', 
              payload: { playerId: currentPlayer?.id || '', vote: 'blank' }
            })}
          >
            — En blanco
          </button>
        </div>
      )}
      
      {hasVoted && !allVoted && (
        <p className="waiting-message">Esperando a los demás jugadores...</p>
      )}
      
      {allVoted && (
        <button
          className="btn btn--primary"
          onClick={() => dispatch({ type: 'RESOLVE_TEAM_VOTE' })}
        >
          Ver Resultado
        </button>
      )}
    </div>
  );
}
