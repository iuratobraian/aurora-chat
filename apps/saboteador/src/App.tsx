import { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import StartScreen from './components/StartScreen';
import SetupScreen from './components/SetupScreen';
import NamesScreen from './components/NamesScreen';
import RevealScreen from './components/RevealScreen';
import TeamSelectionScreen from './components/TeamSelectionScreen';
import TeamVoteScreen from './components/TeamVoteScreen';
import MissionScreen from './components/MissionScreen';
import VoteScreen from './components/VoteScreen';
import DiscussionScreen from './components/DiscussionScreen';
import ExileScreen from './components/ExileScreen';
import GameOverScreen from './components/GameOverScreen';
import SettingsScreen from './components/SettingsScreen';

function GameRouter() {
  const { state } = useGame();
  
  switch (state.phase) {
    case 'start':
      return <StartScreen />;
    case 'setup':
      return <SetupScreen />;
    case 'names':
      return <NamesScreen />;
    case 'reveal':
      return <RevealScreen />;
    case 'team_selection':
      return <TeamSelectionScreen />;
    case 'team_vote':
      return <TeamVoteScreen />;
    case 'mission_active':
      return <MissionScreen />;
    case 'vote':
      return <VoteScreen />;
    case 'discussion':
      return <DiscussionScreen />;
    case 'exile':
      return <ExileScreen />;
    case 'game_over':
      return <GameOverScreen />;
    default:
      return <StartScreen />;
  }
}

function AppContent() {
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <div className="app-container">
      {showSettings && (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      )}
      <button 
        className="settings-toggle-btn"
        onClick={() => setShowSettings(true)}
        title="Configuración"
      >
        ⚙️
      </button>
      <GameRouter />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
