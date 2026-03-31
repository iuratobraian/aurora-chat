import { useGame } from '../context/GameContext';

export default function ExileScreen() {
  const { state, dispatch } = useGame();

  const exiledPlayer = state.players.find(p => state.exiledPlayerIds.includes(p.id));

  const handleContinue = () => {
    dispatch({ type: 'SET_PHASE', payload: 'mission_active' });
  };

  return (
    <div className="screen">
      <div className="exile-container animate-fadeIn">
        <h1 className="text-xl text-neon-red text-center mb-lg">
          ¡Exiliado!
        </h1>

        {exiledPlayer && (
          <div className="exiled-card card mb-xl">
            <span className="exiled-avatar">
              {exiledPlayer.name.charAt(0).toUpperCase()}
            </span>
            <h2 className="text-2xl text-neon-cyan mt-md">{exiledPlayer.name}</h2>
            <p className="text-secondary mt-md">
              Ha sido eliminado del juego
            </p>
          </div>
        )}

        <button 
          className="btn btn-neon-cyan btn-full"
          onClick={handleContinue}
        >
          Continuar
        </button>
      </div>

      <style>{`
        .exile-container {
          width: 100%;
          max-width: 360px;
          text-align: center;
        }

        .exiled-card {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .exiled-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', sans-serif;
          font-size: 32px;
          font-weight: 700;
          color: var(--neon-red);
          border: 3px solid var(--neon-red);
          box-shadow: 0 0 30px var(--neon-red-glow);
        }
      `}</style>
    </div>
  );
}
