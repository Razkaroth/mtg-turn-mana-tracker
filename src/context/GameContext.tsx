import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PlayerData, ManaPool } from '../types';

interface GameContextType {
  // Game state
  gameStarted: boolean;
  players: PlayerData[];
  activePlayerIndex: number;
  displayedPlayerIndex: number;
  timerRunning: boolean;
  hasSavedGame: boolean;
  
  // Game actions
  startGame: (players: PlayerData[]) => void;
  resetGame: () => void;
  addPlayer: () => void;
  removePlayer: (id: number) => void;
  updatePlayer: (id: number, updatedData: Partial<PlayerData>) => void;
  nextTurn: () => void;
  setTimerRunning: (isRunning: boolean) => void;
  setDisplayedPlayerIndex: (index: number) => void;
  endGame: () => void;
  continueSavedGame: () => void;
}

// Store keys for localStorage
const GAME_STATE_KEY = 'mtg-game-state';

const defaultManaPool: ManaPool = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };

const defaultPlayers: PlayerData[] = [
  { id: 1, name: 'Player 1', life: 20, lands: [], manaPool: { ...defaultManaPool } },
  { id: 2, name: 'Player 2', life: 20, lands: [], manaPool: { ...defaultManaPool } },
];

// Type for the saved game state structure
interface SavedGameState {
  players: PlayerData[];
  activePlayerIndex: number;
  displayedPlayerIndex: number;
  timestamp: number;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<PlayerData[]>(defaultPlayers);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [displayedPlayerIndex, setDisplayedPlayerIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // Check for saved game on initial load
  useEffect(() => {
    checkForSavedGame();
  }, []);

  // Save game state to localStorage whenever relevant state changes
  useEffect(() => {
    if (gameStarted) {
      const gameState: SavedGameState = {
        players,
        activePlayerIndex,
        displayedPlayerIndex,
        timestamp: Date.now()
      };
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
      setHasSavedGame(true);
    }
  }, [gameStarted, players, activePlayerIndex, displayedPlayerIndex]);

  // Check if a saved game exists in localStorage
  const checkForSavedGame = () => {
    const savedGameJSON = localStorage.getItem(GAME_STATE_KEY);
    setHasSavedGame(!!savedGameJSON);
  };

  // Start a new game with the given players
  const startGame = (configuredPlayers: PlayerData[]) => {
    setPlayers(configuredPlayers);
    setActivePlayerIndex(0);
    setDisplayedPlayerIndex(0);
    setTimerRunning(false);
    setGameStarted(true);
  };

  // Reset the game to initial state and clear saved game
  const resetGame = () => {
    setGameStarted(false);
    setPlayers(defaultPlayers);
    setActivePlayerIndex(0);
    setDisplayedPlayerIndex(0);
    setTimerRunning(false);
    localStorage.removeItem(GAME_STATE_KEY);
    setHasSavedGame(false);
  };

  // End the current game and return to main menu (keeping the saved game)
  const endGame = () => {
    setGameStarted(false);
    setTimerRunning(false);
  };

  // Continue a previously saved game
  const continueSavedGame = () => {
    const savedGameJSON = localStorage.getItem(GAME_STATE_KEY);
    if (savedGameJSON) {
      try {
        const savedGame = JSON.parse(savedGameJSON) as SavedGameState;
        setPlayers(savedGame.players);
        setActivePlayerIndex(savedGame.activePlayerIndex);
        setDisplayedPlayerIndex(savedGame.displayedPlayerIndex);
        setGameStarted(true);
        setTimerRunning(false);
      } catch (error) {
        console.error('Failed to load saved game:', error);
        // If loading fails, start a new game
        resetGame();
      }
    }
  };

  // Add a new player to the game
  const addPlayer = () => {
    const newId = players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
    setPlayers([...players, { 
      id: newId, 
      name: `Player ${newId}`, 
      life: 20, 
      lands: [], 
      manaPool: { ...defaultManaPool } 
    }]);
  };

  // Remove a player from the game
  const removePlayer = (id: number) => {
    if (players.length <= 1) return; // Prevent removing the last player
    
    const indexToRemove = players.findIndex(p => p.id === id);
    setPlayers(players.filter(player => player.id !== id));
    
    // Update active and displayed player indices if necessary
    if (indexToRemove <= activePlayerIndex && activePlayerIndex > 0) {
      setActivePlayerIndex(activePlayerIndex - 1);
    }
    if (indexToRemove <= displayedPlayerIndex && displayedPlayerIndex > 0) {
      setDisplayedPlayerIndex(displayedPlayerIndex - 1);
    }
  };

  // Update a player's data
  const updatePlayer = (id: number, updatedData: Partial<PlayerData>) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, ...updatedData } : player
    ));
  };

  // Move to the next player's turn
  const nextTurn = () => {
    // Reset mana pool for current player
    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex] = {
      ...updatedPlayers[activePlayerIndex],
      manaPool: { ...defaultManaPool }
    };
    setPlayers(updatedPlayers);
    
    // Move to next player
    const nextActivePlayerIndex = (activePlayerIndex + 1) % players.length;
    setActivePlayerIndex(nextActivePlayerIndex);
    // Also display the new active player
    setDisplayedPlayerIndex(nextActivePlayerIndex);
  };

  const value = {
    // State
    gameStarted,
    players,
    activePlayerIndex,
    displayedPlayerIndex,
    timerRunning,
    hasSavedGame,
    
    // Actions
    startGame,
    resetGame,
    addPlayer,
    removePlayer,
    updatePlayer,
    nextTurn,
    setTimerRunning,
    setDisplayedPlayerIndex,
    endGame,
    continueSavedGame
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook for using the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 