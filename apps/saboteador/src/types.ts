export type Role = 'normal' | 'saboteur' | 'detective' | 'double_agent' | 'protector';

export type GamePhase = 
  | 'start'
  | 'setup'
  | 'names'
  | 'reveal'
  | 'team_selection'
  | 'team_vote'
  | 'mission_active'
  | 'mission_vote'
  | 'vote'
  | 'discussion'
  | 'exile'
  | 'game_over';

export type MissionResult = 'success' | 'failure' | 'blocked';

export interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  hasVoted: boolean;
  hasTeamVoted?: boolean;
  voteTarget?: string;
  isCurrentHolder?: boolean;
  usedProtector?: boolean;
}

export interface Mission {
  id: number;
  type: 'sequence' | 'dilemma' | 'intruder' | 'decrypt' | 'choose' | 'react' | 'decide';
  title: string;
  description: string;
  data: Record<string, unknown>;
  result?: MissionResult;
  sabotageVotes: number;
  teamSize: number;
}

export interface MissionHistoryItem {
  round: number;
  result: MissionResult;
  failures: number;
  successes: number;
}

export interface GameState {
  phase: GamePhase;
  playerCount: number;
  players: Player[];
  missions: Mission[];
  currentMissionIndex: number;
  currentRound: number;
  missionHistory: MissionHistoryItem[];
  exiledPlayerIds: string[];
  winner?: 'saboteurs' | 'normals' | 'agent';
  revealedThisRound: string[];
  showReveal: boolean;
  currentPlayerId?: string;
  selectedTeam: string[];
  currentLeaderId: string;
  teamVotes: Record<string, boolean>;
  teamVoteResults: Record<string, 'yes' | 'no' | 'blank'>;
  missionTimer: number;
  discussionTimer: number;
  settings: GameSettings;
}

export interface GameSettings {
  difficulty: 'easy' | 'normal' | 'hard';
  missionTimerSeconds: number;
  discussionTimerSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export type GameAction =
  | { type: 'SET_PLAYER_COUNT'; payload: number }
  | { type: 'SET_NAMES'; payload: string[] }
  | { type: 'START_GAME' }
  | { type: 'SHOW_REVEAL' }
  | { type: 'HIDE_REVEAL' }
  | { type: 'SET_CURRENT_HOLDER'; payload: string }
  | { type: 'TOGGLE_TEAM_MEMBER'; payload: string }
  | { type: 'CONFIRM_TEAM' }
  | { type: 'CAST_TEAM_VOTE'; payload: { playerId: string; vote: 'yes' | 'no' | 'blank' } }
  | { type: 'RESOLVE_TEAM_VOTE' }
  | { type: 'START_MISSION' }
  | { type: 'CAST_SABOTAGE_VOTE' }
  | { type: 'CAST_SUCCESS_VOTE' }
  | { type: 'RESOLVE_MISSION'; payload: MissionResult }
  | { type: 'START_VOTE' }
  | { type: 'CAST_VOTE'; payload: { playerId: string; targetId: string } }
  | { type: 'RESOLVE_EXILE' }
  | { type: 'TICK_TIMER' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'RESET_GAME' }
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'LOAD_STATE'; payload: GameState };
