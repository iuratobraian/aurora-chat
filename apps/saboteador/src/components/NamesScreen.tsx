import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function NamesScreen() {
  const { state, dispatch } = useGame();
  const [names, setNames] = useState<string[]>(
    Array(state.playerCount).fill('')
  );

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleStart = () => {
    const validNames = names.map(n => n.trim() || `Jugador ${names.indexOf(n) + 1}`);
    dispatch({ type: 'SET_NAMES', payload: validNames });
  };

  const allFilled = names.some(n => n.trim() !== '');

  return (
    <div className="screen">
      <div className="names-container animate-fadeIn">
        <h1 className="text-xl text-neon-cyan text-center mb-lg">
          Nombres de Jugadores
        </h1>
        <p className="text-sm text-secondary text-center mb-xl">
          Ingresa los nombres (opcional)
        </p>

        <div className="names-grid">
          {names.map((name, index) => (
            <div key={index} className="name-input-wrapper">
              <span className="player-number">{index + 1}</span>
              <input
                type="text"
                className="input name-input"
                placeholder={`Jugador ${index + 1}`}
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                maxLength={20}
              />
            </div>
          ))}
        </div>

        <button 
          className="btn btn-neon-green btn-full mt-xl"
          onClick={handleStart}
          disabled={!allFilled}
        >
          Comenzar
        </button>
      </div>

      <style>{`
        .names-container {
          width: 100%;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .names-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
          width: 100%;
        }

        .name-input-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .player-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--neon-cyan);
          flex-shrink: 0;
        }

        .name-input {
          flex: 1;
        }

        .btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
