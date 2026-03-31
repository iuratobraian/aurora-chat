import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GameAction, Role, Player } from '../types';

const STORAGE_KEY = 'SABOTEADOR_GAME_STATE';

const getTimerForDifficulty = (difficulty: GameState['settings']['difficulty']) => {
  switch (difficulty) {
    case 'easy': return { mission: 90, discussion: 90 };
    case 'normal': return { mission: 60, discussion: 60 };
    case 'hard': return { mission: 30, discussion: 30 };
  }
};

const initialState: GameState = {
  phase: 'start',
  playerCount: 6,
  players: [],
  missions: [],
  currentMissionIndex: 0,
  currentRound: 1,
  missionHistory: [],
  exiledPlayerIds: [],
  winner: undefined,
  revealedThisRound: [],
  showReveal: false,
  currentPlayerId: undefined,
  selectedTeam: [],
  currentLeaderId: '',
  teamVotes: {},
  teamVoteResults: {},
  missionTimer: 60,
  discussionTimer: 60,
  settings: {
    difficulty: 'normal',
    missionTimerSeconds: 60,
    discussionTimerSeconds: 60,
    soundEnabled: true,
    vibrationEnabled: true,
  },
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function assignRoles(playerCount: number): Role[] {
  const roles: Role[] = [];
  const saboteurCount = Math.ceil(playerCount / 4);
  roles.push(...Array(saboteurCount).fill('saboteur'));
  
  if (playerCount >= 9) roles.push('protector');
  if (playerCount >= 8) roles.push('double_agent');
  if (playerCount >= 7) roles.push('detective');
  
  const normalsNeeded = playerCount - roles.length;
  roles.push(...Array(normalsNeeded).fill('normal'));
  
  return shuffle(roles);
}

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

function getNextLeader(state: GameState): string {
  const alivePlayers = state.players.filter(p => p.isAlive);
  const currentIndex = alivePlayers.findIndex(p => p.id === state.currentLeaderId);
  const nextIndex = (currentIndex + 1) % alivePlayers.length;
  return alivePlayers[nextIndex]?.id || alivePlayers[0]?.id;
}

function checkVictory(state: GameState): 'saboteurs' | 'normals' | 'agent' | undefined {
  const alivePlayers = state.players.filter(p => p.isAlive);
  const aliveSaboteurs = alivePlayers.filter(p => p.role === 'saboteur' || p.role === 'double_agent');
  const aliveNormals = alivePlayers.filter(p => p.role !== 'saboteur' && p.role !== 'double_agent');
  
  const failures = state.missionHistory.filter(m => m.result === 'failure').length;
  const successes = state.missionHistory.filter(m => m.result === 'success').length;
  
  if (failures >= 3) {
    return 'saboteurs';
  }
  if (successes >= 3) {
    return 'normals';
  }
  
  if (aliveSaboteurs.length === aliveNormals.length && aliveSaboteurs.length > 0) {
    const doubleAgent = alivePlayers.find(p => p.role === 'double_agent');
    if (doubleAgent) {
      return 'agent';
    }
    return 'saboteurs';
  }
  
  if (state.currentRound > 7) {
    return failures > successes ? 'saboteurs' : successes > failures ? 'normals' : undefined;
  }
  
  return undefined;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER_COUNT':
      return { ...state, playerCount: action.payload };

    case 'SET_NAMES': {
      const roles = assignRoles(state.playerCount);
      const players: Player[] = action.payload.map((name, index) => ({
        id: `player-${index}`,
        name,
        role: roles[index],
        isAlive: true,
        hasVoted: false,
        usedProtector: false,
      }));
      return { 
        ...state, 
        players,
        phase: 'reveal',
        showReveal: true,
        currentPlayerId: players[0]?.id,
        currentLeaderId: players[0]?.id || '',
      };
    }

    case 'SHOW_REVEAL':
      return { ...state, showReveal: true };

    case 'HIDE_REVEAL': {
      const nextPlayer = state.players.find(p => !state.revealedThisRound.includes(p.id) && p.isAlive);
      const revealedThisRound = nextPlayer 
        ? [...state.revealedThisRound, nextPlayer.id]
        : state.revealedThisRound;
      
      const allRevealed = revealedThisRound.length >= state.players.length;
      
      return { 
        ...state, 
        showReveal: false, 
        phase: allRevealed ? 'team_selection' : 'reveal',
        revealedThisRound,
        currentPlayerId: allRevealed ? state.currentLeaderId : nextPlayer?.id,
      };
    }

    case 'SET_CURRENT_HOLDER':
      return { 
        ...state, 
        players: state.players.map(p => ({
          ...p,
          isCurrentHolder: p.id === action.payload,
        })),
        currentPlayerId: action.payload,
      };

    case 'TOGGLE_TEAM_MEMBER': {
      const playerId = action.payload;
      const teamSize = getTeamSize(state.playerCount, state.currentRound);
      const isSelected = state.selectedTeam.includes(playerId);
      
      if (isSelected) {
        return {
          ...state,
          selectedTeam: state.selectedTeam.filter(id => id !== playerId),
        };
      }
      
      if (state.selectedTeam.length >= teamSize) {
        return state;
      }
      
      return {
        ...state,
        selectedTeam: [...state.selectedTeam, playerId],
      };
    }

    case 'CONFIRM_TEAM': {
      const teamSize = getTeamSize(state.playerCount, state.currentRound);
      if (state.selectedTeam.length !== teamSize) {
        return state;
      }
      
      return {
        ...state,
        phase: 'team_vote',
        teamVotes: {},
        teamVoteResults: {},
        players: state.players.map(p => ({ ...p, hasTeamVoted: false })),
      };
    }

    case 'CAST_TEAM_VOTE': {
      const { playerId, vote } = action.payload;
      return {
        ...state,
        teamVotes: { ...state.teamVotes, [playerId]: true },
        teamVoteResults: { ...state.teamVoteResults, [playerId]: vote },
        players: state.players.map(p => 
          p.id === playerId ? { ...p, hasTeamVoted: true } : p
        ),
      };
    }

    case 'RESOLVE_TEAM_VOTE': {
      const alivePlayers = state.players.filter(p => p.isAlive);
      const allVoted = alivePlayers.every(p => p.hasTeamVoted);
      
      if (!allVoted) return state;
      
      const yesVotes = Object.values(state.teamVoteResults).filter(v => v === 'yes').length;
      const noVotes = Object.values(state.teamVoteResults).filter(v => v === 'no').length;
      
      if (yesVotes > noVotes) {
        const timers = getTimerForDifficulty(state.settings.difficulty);
        return {
          ...state,
          phase: 'mission_active',
          missionTimer: timers.mission,
          players: state.players.map(p => ({
            ...p,
            hasVoted: false,
            hasTeamVoted: false,
          })),
        };
      }
      
      const nextLeaderId = getNextLeader({ ...state, currentLeaderId: state.currentLeaderId });
      
      return {
        ...state,
        phase: 'team_selection',
        currentLeaderId: nextLeaderId,
        currentPlayerId: nextLeaderId,
        selectedTeam: [],
        teamVotes: {},
        teamVoteResults: {},
        players: state.players.map(p => ({
          ...p,
          hasTeamVoted: false,
        })),
      };
    }

    case 'START_MISSION': {
      const timers = getTimerForDifficulty(state.settings.difficulty);
      return {
        ...state,
        phase: 'mission_active',
        missionTimer: timers.mission,
        players: state.players.map(p => ({
          ...p,
          hasVoted: false,
        })),
      };
    }

    case 'CAST_SABOTAGE_VOTE': {
      const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
      if (!currentPlayer) return state;
      
      const isSaboteur = currentPlayer.role === 'saboteur' || currentPlayer.role === 'double_agent';
      if (!isSaboteur) return state;
      
      const updatedMissions = state.missions.map((m, i) => 
        i === state.currentMissionIndex 
          ? { ...m, sabotageVotes: m.sabotageVotes + 1 }
          : m
      );
      
      const nextHolder = getNextHolder(state);
      
      return { 
        ...state, 
        missions: updatedMissions,
        currentPlayerId: nextHolder,
        players: state.players.map(p => 
          p.id === state.currentPlayerId ? { ...p, hasVoted: true } : p
        ),
      };
    }

    case 'CAST_SUCCESS_VOTE': {
      const nextHolder = getNextHolder(state);
      
      return {
        ...state,
        currentPlayerId: nextHolder,
        players: state.players.map(p => 
          p.id === state.currentPlayerId ? { ...p, hasVoted: true } : p
        ),
      };
    }

    case 'RESOLVE_MISSION': {
      const result = action.payload;
      const currentMission = state.missions[state.currentMissionIndex];
      
      let finalResult = result;
      if (result === 'failure') {
        const protectorInTeam = state.selectedTeam.some(id => {
          const p = state.players.find(pl => pl.id === id);
          return p?.role === 'protector' && !p.usedProtector;
        });
        
        if (protectorInTeam && currentMission.sabotageVotes > 0) {
          finalResult = 'blocked';
        }
      }
      
      const missionHistory = [
        ...state.missionHistory,
        {
          round: state.currentRound,
          result: finalResult,
          failures: finalResult === 'failure' ? 1 : 0,
          successes: finalResult === 'success' || finalResult === 'blocked' ? 1 : 0,
        },
      ];
      
      const winner = checkVictory({ ...state, missionHistory });
      
      return {
        ...state,
        missions: state.missions.map((m, i) => 
          i === state.currentMissionIndex ? { ...m, result: finalResult } : m
        ),
        missionHistory,
        phase: winner ? 'game_over' : 'discussion',
        winner,
      };
    }

    case 'START_VOTE': {
      const timers = getTimerForDifficulty(state.settings.difficulty);
      return {
        ...state,
        phase: 'vote',
        discussionTimer: timers.discussion,
        players: state.players.map(p => ({ ...p, hasVoted: false })),
      };
    }

    case 'CAST_VOTE':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? { ...p, hasVoted: true, voteTarget: action.payload.targetId }
            : p
        ),
      };

    case 'RESOLVE_EXILE': {
      const votes: Record<string, number> = {};
      state.players.filter(p => p.isAlive).forEach(p => {
        if (p.voteTarget) {
          votes[p.voteTarget] = (votes[p.voteTarget] || 0) + 1;
        }
      });
      
      const maxVotes = Math.max(...Object.values(votes), 0);
      const tied = Object.entries(votes).filter(([_, count]) => count === maxVotes);
      
      if (tied.length > 1) {
        return state;
      }
      
      const exiledId = tied[0]?.[0];
      
      if (exiledId) {
        const exiledPlayer = state.players.find(p => p.id === exiledId);
        const isSaboteur = exiledPlayer?.role === 'saboteur';
        const isAgent = exiledPlayer?.role === 'double_agent';
        
        let winner: 'saboteurs' | 'normals' | 'agent' | undefined;
        if (isAgent) {
          winner = 'normals';
        }
        
        return {
          ...state,
          phase: winner ? 'game_over' : 'team_selection',
          currentRound: state.currentRound + 1,
          exiledPlayerIds: [...state.exiledPlayerIds, exiledId],
          revealedThisRound: isSaboteur ? [...state.revealedThisRound, exiledId] : state.revealedThisRound,
          currentLeaderId: getNextLeader({ ...state, currentLeaderId: state.currentLeaderId }),
          selectedTeam: [],
          winner,
          players: state.players.map(p =>
            p.id === exiledId ? { ...p, isAlive: false } : p
          ),
        };
      }
      
      return state;
    }

    case 'TICK_TIMER': {
      if (state.phase === 'mission_active' && state.missionTimer > 0) {
        return { ...state, missionTimer: state.missionTimer - 1 };
      }
      if (state.phase === 'vote' && state.discussionTimer > 0) {
        return { ...state, discussionTimer: state.discussionTimer - 1 };
      }
      return state;
    }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'SET_PHASE':
      return { ...state, phase: action.payload };

    case 'LOAD_STATE':
      return action.payload;

    case 'RESET_GAME':
      localStorage.removeItem(STORAGE_KEY);
      return initialState;

    default:
      return state;
  }
}

function getNextHolder(state: GameState): string | undefined {
  const teamPlayers = state.selectedTeam.map(id => state.players.find(p => p.id === id)).filter(Boolean);
  const currentIndex = teamPlayers.findIndex(p => p?.id === state.currentPlayerId);
  const nextIndex = (currentIndex + 1) % teamPlayers.length;
  return teamPlayers[nextIndex]?.id;
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  canContinueReveal: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (initial) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phase !== 'start' && parsed.phase !== 'setup') {
          return { ...parsed, showReveal: false };
        }
      }
    } catch {}
    return initial;
  });
  
  useEffect(() => {
    if (state.phase !== 'start' && state.phase !== 'setup') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    }
  }, [state]);

  const canContinueReveal = state.revealedThisRound.length < state.players.length;

  return (
    <GameContext.Provider value={{ state, dispatch, canContinueReveal }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function useTimer() {
  const { state, dispatch } = useGame();
  
  useEffect(() => {
    if (state.phase !== 'mission_active' && state.phase !== 'vote') return;
    
    const interval = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state.phase, dispatch]);
  
  return {
    missionTimer: state.missionTimer,
    discussionTimer: state.discussionTimer,
    isMissionUrgent: state.missionTimer <= 10,
    isMissionCritical: state.missionTimer <= 5,
    isDiscussionUrgent: state.discussionTimer <= 10,
  };
}
