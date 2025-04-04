import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PlayerData, ManaPool, GameSettings, DEFAULT_GAME_SETTINGS, Land } from '../types';

interface GameContextType {
  // Game state
  gameStarted: boolean;
  players: PlayerData[];
  activePlayerIndex: number;
  displayedPlayerIndex: number;
  timerRunning: boolean;
  hasSavedGame: boolean;
  isSinglePlayerMode: boolean;
  isPhantomTurn: boolean;
  actualPlayerIndex: number;
  visiblePlayers: PlayerData[];
  phantomPlayers: PlayerData[]; // New property to access phantom players
  isPhantomPhase: boolean; // New property to indicate the combined phantom phase
  
  // Game actions
  startGame: (players: PlayerData[], singlePlayerMode?: boolean, actualPlayerIndex?: number) => void;
  resetGame: () => void;
  addPlayer: () => void;
  removePlayer: (id: number) => void;
  updatePlayer: (id: number, updatedData: Partial<PlayerData>) => void;
  nextTurn: () => void;
  advancePhantomTurn: () => void;
  setTimerRunning: (isRunning: boolean) => void;
  setDisplayedPlayerIndex: (index: number) => void;
  endGame: () => void;
  continueSavedGame: () => void;
  
  // Settings
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
}

// Store keys for localStorage
const GAME_STATE_KEY = 'auto-magic-ator-game-state';
const GAME_SETTINGS_KEY = 'auto-magic-ator-game-settings';

const defaultManaPool: ManaPool = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };

// Type for the saved game state structure
interface SavedGameState {
  players: PlayerData[];
  activePlayerIndex: number;
  displayedPlayerIndex: number;
  isSinglePlayerMode: boolean;
  actualPlayerIndex: number;
  isPhantomPhase: boolean; // Add the new property to saved state
  timestamp: number;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

// Helper function to get settings from localStorage with defaults
const getStoredSettings = (): GameSettings => {
  try {
    const storedSettings = localStorage.getItem(GAME_SETTINGS_KEY);
    if (storedSettings) {
      return { ...DEFAULT_GAME_SETTINGS, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_GAME_SETTINGS;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load settings first, as we need them for defaultPlayers
  const [settings, setSettings] = useState<GameSettings>(getStoredSettings());
  
  // Create defaultPlayers using settings value instead of hardcoded life
  const createDefaultPlayers = (): PlayerData[] => [
    { id: 1, name: 'Player 1', life: settings.startingLife, lands: [], manaPool: { ...defaultManaPool } },
    { id: 2, name: 'Player 2', life: settings.startingLife, lands: [], manaPool: { ...defaultManaPool } },
  ];

  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<PlayerData[]>(() => createDefaultPlayers());
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [displayedPlayerIndex, setDisplayedPlayerIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isSinglePlayerMode, setIsSinglePlayerMode] = useState(false);
  const [actualPlayerIndex, setActualPlayerIndex] = useState(0);
  const [isPhantomPhase, setIsPhantomPhase] = useState(false);
  
  // Derived state for phantom turns
  const isPhantomTurn = isSinglePlayerMode && 
    (isPhantomPhase || activePlayerIndex !== actualPlayerIndex);
  
  // Visible players (filter out phantom players in single player mode)
  const visiblePlayers = isSinglePlayerMode 
    ? [players[actualPlayerIndex]] 
    : players;
    
  // Get all phantom players in single player mode
  const phantomPlayers = isSinglePlayerMode
    ? players.filter((_, index) => index !== actualPlayerIndex)
    : [];

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
        isSinglePlayerMode,
        actualPlayerIndex,
        isPhantomPhase,
        timestamp: Date.now()
      };
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
      setHasSavedGame(true);
    }
  }, [gameStarted, players, activePlayerIndex, displayedPlayerIndex, isSinglePlayerMode, actualPlayerIndex, isPhantomPhase]);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(settings));
    
    // If there are existing players and the game hasn't started yet,
    // update their life totals to match the new settings
    if (!gameStarted && players.length > 0) {
      console.log("Settings changed, updating player life totals to:", settings.startingLife);
      
      // Only update if the current life values don't match settings
      const needsUpdate = players.some(player => player.life !== settings.startingLife);
      
      if (needsUpdate) {
        setPlayers(prevPlayers => 
          prevPlayers.map(player => ({
            ...player,
            life: settings.startingLife
          }))
        );
      }
    }
  }, [settings]); // Only react to settings changes

  // Check if a saved game exists in localStorage
  const checkForSavedGame = () => {
    const savedGameJSON = localStorage.getItem(GAME_STATE_KEY);
    setHasSavedGame(!!savedGameJSON);
  };

  // Reset mana pools for all players
  const resetManaPools = (playerIndices: number[]) => {
    const updatedPlayers = [...players];
    
    playerIndices.forEach(index => {
      if (index >= 0 && index < updatedPlayers.length) {
        updatedPlayers[index] = {
          ...updatedPlayers[index],
          manaPool: { ...defaultManaPool }
        };
      }
    });
    
    setPlayers(updatedPlayers);
  };

  // Fill the mana pool for a player based on their lands
  const fillManaPool = (playerIndex: number) => {
    const player = players[playerIndex];
    if (!player) return;

    // Create a new mana pool starting with zero
    const newManaPool = { ...defaultManaPool };
    
    // Add mana for each land
    player.lands.forEach((land: Land) => {
      newManaPool[land.produces as keyof typeof newManaPool]++;
    });
    
    // Update the player with the filled mana pool
    const updatedPlayer = {
      ...player,
      manaPool: newManaPool,
      // Set all lands as tapped to represent they've been used
      lands: player.lands.map((land: Land) => ({ ...land, tapped: true }))
    };
    
    // Update player in the players array
    setPlayers(prevPlayers => 
      prevPlayers.map((p, i) => i === playerIndex ? updatedPlayer : p)
    );
  };

  // Start a new game with the given players
  const startGame = (
    configuredPlayers: PlayerData[], 
    singlePlayerMode: boolean = false, 
    playerPosition: number = 0
  ) => {
    // Clear any saved game state first
    localStorage.removeItem(GAME_STATE_KEY);
    
    console.log("Starting game with players:", 
      configuredPlayers.map(p => `${p.name} (life: ${p.life})`));
    
    // Use the players as they are configured (including life values)
    setPlayers(configuredPlayers);
    
    const startingPlayerIndex = singlePlayerMode ? playerPosition : 0;
    
    setActivePlayerIndex(startingPlayerIndex);
    setDisplayedPlayerIndex(startingPlayerIndex);
    setTimerRunning(false);
    setIsSinglePlayerMode(singlePlayerMode);
    setActualPlayerIndex(playerPosition);
    setIsPhantomPhase(false);
    setGameStarted(true);
    
    // Fill mana pool for the starting player after game starts
    // We need to use setTimeout to ensure this runs after the players state has been updated
    setTimeout(() => {
      fillManaPool(startingPlayerIndex);
    }, 0);
  };

  // Reset the game to initial state and clear saved game
  const resetGame = () => {
    setGameStarted(false);
    setPlayers(createDefaultPlayers());
    setActivePlayerIndex(0);
    setDisplayedPlayerIndex(0);
    setTimerRunning(false);
    setIsSinglePlayerMode(false);
    setActualPlayerIndex(0);
    setIsPhantomPhase(false);
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
        setIsSinglePlayerMode(savedGame.isSinglePlayerMode || false);
        setActualPlayerIndex(savedGame.actualPlayerIndex || 0);
        setIsPhantomPhase(savedGame.isPhantomPhase || false);
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
      life: settings.startingLife,  // Use the current setting
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
    
    // Update actual player index in single player mode if necessary
    if (isSinglePlayerMode && indexToRemove <= actualPlayerIndex && actualPlayerIndex > 0) {
      setActualPlayerIndex(actualPlayerIndex - 1);
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
    // In single player mode, toggle between real player and phantom phase
    if (isSinglePlayerMode) {
      if (activePlayerIndex === actualPlayerIndex) {
        // End real player's turn, start phantom phase
        resetManaPools([actualPlayerIndex]);
        setIsPhantomPhase(true);
      } else {
        // End phantom phase, start real player's turn
        // Reset mana pools for all phantom players
        const phantomIndices = players.map((_, i) => i).filter(i => i !== actualPlayerIndex);
        resetManaPools(phantomIndices);
        setActivePlayerIndex(actualPlayerIndex);
        setDisplayedPlayerIndex(actualPlayerIndex);
        setIsPhantomPhase(false);
        
        // Fill mana pool for the real player at the start of their turn
        fillManaPool(actualPlayerIndex);
      }
    } else {
      // Regular multi-player mode - cycle through players normally
      const nextActivePlayerIndex = (activePlayerIndex + 1) % players.length;
      resetManaPools([activePlayerIndex]);
      setActivePlayerIndex(nextActivePlayerIndex);
      setDisplayedPlayerIndex(nextActivePlayerIndex);
      
      // Fill mana pool for the next player
      fillManaPool(nextActivePlayerIndex);
    }
  };
  
  // Special function to advance from phantom phase back to real player in single player mode
  const advancePhantomTurn = () => {
    if (!isPhantomTurn) return; // Only works during phantom turns
    
    // Reset mana pools for all phantom players
    const phantomIndices = players.map((_, i) => i).filter(i => i !== actualPlayerIndex);
    resetManaPools(phantomIndices);
    
    // Switch back to real player's turn
    setActivePlayerIndex(actualPlayerIndex);
    setDisplayedPlayerIndex(actualPlayerIndex);
    setIsPhantomPhase(false);
    
    // Fill mana pool for the real player at the start of their turn
    fillManaPool(actualPlayerIndex);
  };

  // Update settings and save to localStorage
  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  const value = {
    // State
    gameStarted,
    players,
    activePlayerIndex,
    displayedPlayerIndex,
    timerRunning,
    hasSavedGame,
    isSinglePlayerMode,
    isPhantomTurn,
    actualPlayerIndex,
    visiblePlayers,
    phantomPlayers,
    isPhantomPhase,
    
    // Actions
    startGame,
    resetGame,
    addPlayer,
    removePlayer,
    updatePlayer,
    nextTurn,
    advancePhantomTurn,
    setTimerRunning,
    setDisplayedPlayerIndex,
    endGame,
    continueSavedGame,
    
    // Settings
    settings,
    updateSettings
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