import { useGame } from '../context/GameContext';

export default function StartScreen() {
  const { dispatch } = useGame();

  return (
    <div className="screen">
      <div className="start-background" />
      
      <div className="start-content animate-fadeIn">
        <div className="logo-container">
          <h1 className="title-glitch text-neon-red" data-text="EL SABOTEADOR">
            EL SABOTEADOR
          </h1>
          <h2 className="subtitle text-neon-cyan animate-pulse">
            INVISIBLE
          </h2>
        </div>
        
        <p className="tagline text-md text-secondary mt-lg">
          ¿Quién está saboteando la misión?
        </p>

        <div className="button-group mt-xl flex flex-col flex-gap-md">
          <button 
            className="btn btn-neon-cyan btn-full animate-scaleIn"
            onClick={() => dispatch({ type: 'SET_PHASE', payload: 'setup' })}
          >
            Nueva Partida
          </button>
          
          <button className="btn btn-full" disabled>
            Continuar (Próx.)
          </button>
        </div>

        <div className="rules-hint mt-xl text-center">
          <p className="text-sm text-muted">
            5-10 jugadores · Offline · 30 min
          </p>
        </div>
      </div>

      <style>{`
        .start-background {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(255, 0, 60, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 40%),
            linear-gradient(180deg, var(--bg-primary) 0%, #0d0d10 100%);
          z-index: -1;
        }

        .start-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-lg);
          width: 100%;
          max-width: 500px;
        }

        .logo-container {
          text-align: center;
        }

        .title-glitch {
          font-size: clamp(32px, 10vw, 72px);
          font-weight: 900;
          position: relative;
          animation: glitch 3s infinite;
        }

        .title-glitch::before,
        .title-glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .title-glitch::before {
          left: 2px;
          text-shadow: -2px 0 var(--neon-cyan);
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }

        .title-glitch::after {
          left: -2px;
          text-shadow: -2px 0 var(--neon-red);
          clip: rect(44px, 450px, 56px, 0);
          animation: glitch-anim2 3s infinite linear alternate-reverse;
        }

        @keyframes glitch-anim {
          0% { clip: rect(31px, 9999px, 94px, 0); }
          20% { clip: rect(62px, 9999px, 42px, 0); }
          40% { clip: rect(16px, 9999px, 78px, 0); }
          60% { clip: rect(88px, 9999px, 12px, 0); }
          80% { clip: rect(5px, 9999px, 55px, 0); }
          100% { clip: rect(73px, 9999px, 31px, 0); }
        }

        @keyframes glitch-anim2 {
          0% { clip: rect(65px, 9999px, 21px, 0); }
          25% { clip: rect(12px, 9999px, 88px, 0); }
          50% { clip: rect(44px, 9999px, 35px, 0); }
          75% { clip: rect(3px, 9999px, 67px, 0); }
          100% { clip: rect(81px, 9999px, 14px, 0); }
        }

        .subtitle {
          font-size: clamp(20px, 5vw, 32px);
          margin-top: var(--space-xs);
          letter-spacing: 0.3em;
        }

        .tagline {
          max-width: 280px;
        }

        .button-group {
          width: 100%;
        }

        .button-group .btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          border-color: var(--text-muted);
          color: var(--text-muted);
        }

        .rules-hint {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
