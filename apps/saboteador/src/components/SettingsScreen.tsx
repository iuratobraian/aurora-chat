import { useGame } from '../context/GameContext';

interface SettingsScreenProps {
  onClose: () => void;
}

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { state, dispatch } = useGame();
  
  const handleDifficultyChange = (difficulty: 'easy' | 'normal' | 'hard') => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { difficulty } });
  };
  
  const handleToggle = (setting: 'soundEnabled' | 'vibrationEnabled') => {
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: { [setting]: !state.settings[setting] }
    });
  };
  
  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2 className="settings-title">Configuración</h2>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">Dificultad</h3>
          <div className="difficulty-options">
            {(['easy', 'normal', 'hard'] as const).map(diff => (
              <button
                key={diff}
                className={`difficulty-btn ${state.settings.difficulty === diff ? 'active' : ''}`}
                onClick={() => handleDifficultyChange(diff)}
              >
                <span className="diff-label">
                  {diff === 'easy' ? 'Fácil' : diff === 'normal' ? 'Normal' : 'Difícil'}
                </span>
                <span className="diff-timer">
                  {diff === 'easy' ? '90s' : diff === 'normal' ? '60s' : '30s'}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">Sonido y Vibración</h3>
          <div className="toggle-options">
            <label className="toggle-item">
              <span>Sonido</span>
              <button 
                className={`toggle-switch ${state.settings.soundEnabled ? 'on' : 'off'}`}
                onClick={() => handleToggle('soundEnabled')}
              >
                <span className="toggle-knob" />
              </button>
            </label>
            <label className="toggle-item">
              <span>Vibración</span>
              <button 
                className={`toggle-switch ${state.settings.vibrationEnabled ? 'on' : 'off'}`}
                onClick={() => handleToggle('vibrationEnabled')}
              >
                <span className="toggle-knob" />
              </button>
            </label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">Juego</h3>
          <button
            className="btn btn--danger"
            onClick={() => {
              if (confirm('¿Estás seguro de que quieres reiniciar el juego?')) {
                dispatch({ type: 'RESET_GAME' });
              }
            }}
          >
            Reiniciar Partida
          </button>
        </div>
        
        <div className="settings-footer">
          <button 
            className="btn btn--secondary"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
