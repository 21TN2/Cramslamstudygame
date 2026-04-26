import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Question } from '../data/questions';

export interface Player {
  id: string;
  name: string;
  emoji: string;
  colorClass: string;
  score: number;
  isBot: boolean;
  isHost: boolean;
  streak: number;
}

export interface GameState {
  roomCode: string;
  gameName: string;
  players: Player[];
  questions: Question[];
  myPlayerId: string;
  isHost: boolean;
  questionCount: number;
}

const PLAYER_CONFIGS = [
  { emoji: '🦊', colorClass: 'bg-orange-500' },
  { emoji: '⚡', colorClass: 'bg-yellow-500' },
  { emoji: '🔮', colorClass: 'bg-purple-600' },
  { emoji: '🌿', colorClass: 'bg-emerald-500' },
  { emoji: '💙', colorClass: 'bg-blue-500' },
  { emoji: '🌸', colorClass: 'bg-pink-500' },
];

export const BOT_PLAYERS: Array<{
  name: string;
  accuracy: number;
  minDelay: number;
  maxDelay: number;
  configIndex: number;
}> = [
  { name: 'Zoe', accuracy: 0.52, minDelay: 1.2, maxDelay: 4.0, configIndex: 1 },
  { name: 'Marcus', accuracy: 0.70, minDelay: 3.0, maxDelay: 8.0, configIndex: 2 },
  { name: 'Jordan', accuracy: 0.82, minDelay: 5.0, maxDelay: 12.0, configIndex: 3 },
  { name: 'Riley', accuracy: 0.63, minDelay: 2.5, maxDelay: 7.0, configIndex: 4 },
];

function generateRoomCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 4; i++) code += digits[Math.floor(Math.random() * digits.length)];
  return code.slice(0, 4) + '-' + code.slice(4);
}

const defaultState: GameState = {
  roomCode: '',
  gameName: '',
  players: [],
  questions: [],
  myPlayerId: 'player-me',
  isHost: true,
  questionCount: 10,
};

type GameAction =
  | { type: 'INIT_GAME'; payload: { gameName: string; questions: Question[]; myName: string; questionCount: number } }
  | { type: 'JOIN_GAME'; payload: { roomCode: string; myName: string } }
  | { type: 'UPDATE_SCORES'; payload: Record<string, number> }
  | { type: 'RESET_GAME' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_GAME': {
      const { gameName, questions, myName, questionCount } = action.payload;
      const roomCode = generateRoomCode();

      const myPlayer: Player = {
        id: 'player-me',
        name: myName || 'You',
        emoji: PLAYER_CONFIGS[0].emoji,
        colorClass: PLAYER_CONFIGS[0].colorClass,
        score: 0,
        isBot: false,
        isHost: true,
        streak: 0,
      };

      const bots: Player[] = BOT_PLAYERS.map((bot, i) => ({
        id: `bot-${i}`,
        name: bot.name,
        emoji: PLAYER_CONFIGS[bot.configIndex].emoji,
        colorClass: PLAYER_CONFIGS[bot.configIndex].colorClass,
        score: 0,
        isBot: true,
        isHost: false,
        streak: 0,
      }));

      return {
        ...state,
        roomCode,
        gameName,
        players: [myPlayer, ...bots],
        questions: questions.slice(0, questionCount),
        myPlayerId: 'player-me',
        isHost: true,
        questionCount,
      };
    }
    case 'UPDATE_SCORES': {
      return {
        ...state,
        players: state.players.map(p => ({
          ...p,
          score: action.payload[p.id] ?? p.score,
        })),
      };
    }
    case 'RESET_GAME':
      return defaultState;
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  initGame: (gameName: string, questions: Question[], myName: string, questionCount: number) => void;
  updateScores: (scores: Record<string, number>) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, defaultState);

  const initGame = (gameName: string, questions: Question[], myName: string, questionCount: number) => {
    dispatch({ type: 'INIT_GAME', payload: { gameName, questions, myName, questionCount } });
  };

  const updateScores = (scores: Record<string, number>) => {
    dispatch({ type: 'UPDATE_SCORES', payload: scores });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  return (
    <GameContext.Provider value={{ state, initGame, updateScores, resetGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
