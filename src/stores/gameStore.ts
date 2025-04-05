import { create } from 'zustand'
import { 
  PlayerData, 
  ManaPool, 
  GameSettings, 
  DEFAULT_GAME_SETTINGS,
  Land
} from '../types'

// Store keys for localStorage
const GAME_STATE_KEY = 'auto-magic-ator-game-state'
const GAME_SETTINGS_KEY = 'auto-magic-ator-game-settings'

const defaultManaPool: ManaPool = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }

// Type for the saved game state structure
interface SavedGameState {
  players: PlayerData[]
  activePlayerIndex: number
  displayedPlayerIndex: number
  isSinglePlayerMode: boolean
  actualPlayerIndex: number
  isPhantomPhase: boolean
  timestamp: number
}

// Helper function to get settings from localStorage with defaults
const getStoredSettings = (): GameSettings => {
  try {
    const storedSettings = localStorage.getItem(GAME_SETTINGS_KEY)
    if (storedSettings) {
      return { ...DEFAULT_GAME_SETTINGS, ...JSON.parse(storedSettings) }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  return DEFAULT_GAME_SETTINGS
}

// Helper to check if a saved game exists
const checkForSavedGame = (): boolean => {
  try {
    const savedGameJSON = localStorage.getItem(GAME_STATE_KEY)
    return !!savedGameJSON
  } catch (error) {
    console.error('Failed to check for saved game:', error)
    return false
  }
}

// Helper to load saved game state
const loadSavedGame = (): SavedGameState | null => {
  try {
    const savedGameJSON = localStorage.getItem(GAME_STATE_KEY)
    if (savedGameJSON) {
      return JSON.parse(savedGameJSON)
    }
  } catch (error) {
    console.error('Failed to load saved game:', error)
  }
  return null
}

interface GameState {
  // Game state
  gameStarted: boolean
  players: PlayerData[]
  activePlayerIndex: number
  displayedPlayerIndex: number
  timerRunning: boolean
  hasSavedGame: boolean
  isSinglePlayerMode: boolean
  actualPlayerIndex: number
  isPhantomPhase: boolean
  settings: GameSettings

  // Computed properties
  isPhantomTurn: boolean
  visiblePlayers: PlayerData[]
  phantomPlayers: PlayerData[]

  // Game actions
  startGame: (players: PlayerData[], singlePlayerMode?: boolean, actualPlayerIndex?: number) => void
  resetGame: () => void
  addPlayer: () => void
  removePlayer: (id: number) => void
  updatePlayer: (id: number, updatedData: Partial<PlayerData>) => void
  nextTurn: () => void
  advancePhantomTurn: () => void
  setTimerRunning: (isRunning: boolean) => void
  setDisplayedPlayerIndex: (index: number) => void
  endGame: () => void
  continueSavedGame: () => void
  updateSettings: (newSettings: Partial<GameSettings>) => void
  
  // Mana-related actions
  resetManaPools: (playerIndices: number[]) => void
  fillManaPool: (playerIndex: number) => void
  
  // Helper action
  saveGameState: () => void
}

// Create the game store
export const useGameStore = create<GameState>()((set, get) => {
  // Initialize the settings first, as we need them to create default players
  const initialSettings = getStoredSettings()
  
  // Create default players using settings value
  const createDefaultPlayers = (): PlayerData[] => [
    { id: 1, name: 'Player 1', life: initialSettings.startingLife, lands: [], manaPool: { ...defaultManaPool } },
    { id: 2, name: 'Player 2', life: initialSettings.startingLife, lands: [], manaPool: { ...defaultManaPool } },
  ]

  // Helper function to handle advancing to the next player (used by both nextTurn and advancePhantomTurn)
  const advanceToNextPlayer = (nextPlayerIndex: number) => {
    const { players } = get()
    
    // Create copy of players
    const updatedPlayers = [...players];
    
    // MAGIC THE GATHERING RULES: Mana pools only empty at the beginning of a player's turn,
    // not when they end their turn. So we reset the mana for the player who is about to start their turn.
    
    // Reset mana pool for the player who is starting their turn
    updatedPlayers[nextPlayerIndex] = {
      ...updatedPlayers[nextPlayerIndex],
      manaPool: { ...defaultManaPool },
      lands: updatedPlayers[nextPlayerIndex].lands.map((land: Land) => ({
        ...land,
        tapped: false
      }))
    };
    
    // Check if it's a phantom phase
    let isPhantomPhase = false;
    if (get().isSinglePlayerMode) {
      const actualPlayerIndex = get().actualPlayerIndex;
      if (nextPlayerIndex !== actualPlayerIndex) {
        // It's a phantom player's turn
        isPhantomPhase = true;
      }
    }
    
    set({
      players: updatedPlayers,
      activePlayerIndex: nextPlayerIndex,
      displayedPlayerIndex: nextPlayerIndex,
      isPhantomPhase
    });
    
    // Fill mana pool for next player
    get().fillManaPool(nextPlayerIndex)
    
    // Save game state
    get().saveGameState()
  }

  return {
    // Initial state
    gameStarted: false,
    players: createDefaultPlayers(),
    activePlayerIndex: 0,
    displayedPlayerIndex: 0,
    timerRunning: false,
    hasSavedGame: checkForSavedGame(),
    isSinglePlayerMode: false,
    actualPlayerIndex: 0,
    isPhantomPhase: false,
    settings: initialSettings,

    // Computed properties (getters)
    get isPhantomTurn() {
      const state = get()
      return state.isSinglePlayerMode && 
        (state.isPhantomPhase || state.activePlayerIndex !== state.actualPlayerIndex)
    },
    
    get visiblePlayers() {
      const state = get()
      return state.isSinglePlayerMode 
        ? [state.players[state.actualPlayerIndex]] 
        : state.players
    },
    
    get phantomPlayers() {
      const state = get()
      return state.isSinglePlayerMode
        ? state.players.filter((_, index) => index !== state.actualPlayerIndex)
        : []
    },

    // Game actions
    startGame: (configuredPlayers, singlePlayerMode = false, playerPosition = 0) => {
      // Clear any saved game state first
      localStorage.removeItem(GAME_STATE_KEY)
      
      const startingPlayerIndex = singlePlayerMode ? playerPosition : 0

      set({
        players: configuredPlayers,
        activePlayerIndex: startingPlayerIndex,
        displayedPlayerIndex: startingPlayerIndex,
        timerRunning: false,
        isSinglePlayerMode: singlePlayerMode,
        actualPlayerIndex: playerPosition,
        isPhantomPhase: false,
        gameStarted: true
      });
      
      // After setting the game state, fill the mana pool for the starting player
      setTimeout(() => {
        get().fillManaPool(startingPlayerIndex)
      }, 0)
    },

    resetGame: () => {
      const { settings } = get()
      
      // Clear localStorage
      localStorage.removeItem(GAME_STATE_KEY)
      
      // Reset players
      const resetPlayers = get().players.map((_, index: number) => ({
        id: index + 1,
        name: `Player ${index + 1}`,
        life: settings.startingLife,
        lands: [],
        manaPool: { ...defaultManaPool }
      }));
      
      set({
        gameStarted: false,
        activePlayerIndex: 0,
        displayedPlayerIndex: 0,
        timerRunning: false,
        isSinglePlayerMode: false,
        actualPlayerIndex: 0,
        isPhantomPhase: false,
        hasSavedGame: false,
        players: resetPlayers
      });
    },

    addPlayer: () => {
      const { players, settings } = get()
      
      // Find the next available ID (max ID + 1)
      const nextId = Math.max(0, ...players.map((p: PlayerData) => p.id)) + 1
      
      // Create a new player
      const newPlayer: PlayerData = {
        id: nextId,
        name: `Player ${nextId}`,
        life: settings.startingLife,
        lands: [],
        manaPool: { ...defaultManaPool }
      }
      
      // Add to the players array
      set({ players: [...players, newPlayer] });
    },

    removePlayer: (id) => {
      const { players, activePlayerIndex } = get()
      
      // Find the index of the player to remove
      const playerIndex = players.findIndex((p: PlayerData) => p.id === id)
      if (playerIndex === -1) return // Player not found
      
      // Remove the player
      const newPlayers = [...players];
      newPlayers.splice(playerIndex, 1);
      
      let newActivePlayerIndex = activePlayerIndex;
      let newDisplayedPlayerIndex = get().displayedPlayerIndex;
      
      // Adjust active player index if needed
      if (newPlayers.length > 0) {
        // If active player was removed or is now out of bounds
        if (activePlayerIndex >= newPlayers.length) {
          newActivePlayerIndex = 0;
          newDisplayedPlayerIndex = 0;
        }
      }
      
      set({
        players: newPlayers,
        activePlayerIndex: newActivePlayerIndex,
        displayedPlayerIndex: newDisplayedPlayerIndex
      });
    },

    updatePlayer: (id, updatedData) => {
      const players = [...get().players];
      const playerIndex = players.findIndex((p: PlayerData) => p.id === id)
      
      if (playerIndex !== -1) {
        // Update player data
        players[playerIndex] = {
          ...players[playerIndex],
          ...updatedData
        }
        
        set({ players });
      }
      
      // Save game state after update
      get().saveGameState()
    },

    nextTurn: () => {
      const { players, activePlayerIndex } = get()
      
      if (players.length === 0) return
      
      // Move to next player
      const nextPlayerIndex = (activePlayerIndex + 1) % players.length
      
      // Use the shared helper to advance turns
      advanceToNextPlayer(nextPlayerIndex)
    },

    advancePhantomTurn: () => {
      const { players, activePlayerIndex } = get()
      
      if (players.length <= 1) return
      
      // Get the next player index
      const nextPlayerIndex = (activePlayerIndex + 1) % players.length
      
      // Use the shared helper to advance turns
      advanceToNextPlayer(nextPlayerIndex)
    },

    setTimerRunning: (isRunning) => {
      set({ timerRunning: isRunning });
    },

    setDisplayedPlayerIndex: (index) => {
      set({ displayedPlayerIndex: index });
      
      // Save game state
      get().saveGameState()
    },

    endGame: () => {
      // Clear saved game state
      try {
        localStorage.removeItem(GAME_STATE_KEY)
      } catch (error) {
        console.error('Failed to clear saved game:', error)
      }
      
      set({
        gameStarted: false,
        hasSavedGame: false
      });
    },

    continueSavedGame: () => {
      const savedGame = loadSavedGame()
      if (!savedGame) return
      
      set({
        players: savedGame.players,
        activePlayerIndex: savedGame.activePlayerIndex,
        displayedPlayerIndex: savedGame.displayedPlayerIndex,
        isSinglePlayerMode: savedGame.isSinglePlayerMode,
        actualPlayerIndex: savedGame.actualPlayerIndex,
        isPhantomPhase: savedGame.isPhantomPhase,
        gameStarted: true
      });
    },

    updateSettings: (newSettings) => {
      const updatedSettings = {
        ...get().settings,
        ...newSettings
      };
      
      set({ settings: updatedSettings });
      
      // Save settings to localStorage
      try {
        localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(updatedSettings));
      } catch (error) {
        console.error('Failed to save settings:', error)
      }
      
      // Update player life totals if game hasn't started
      const { gameStarted, players } = get()
      if (!gameStarted && players.length > 0) {
        const needsUpdate = players.some((player: PlayerData) => player.life !== updatedSettings.startingLife)
        
        if (needsUpdate) {
          const updatedPlayers = players.map((player: PlayerData) => ({
            ...player,
            life: updatedSettings.startingLife
          }));
          
          set({ players: updatedPlayers });
        }
      }
    },

    // Mana-related actions
    resetManaPools: (playerIndices) => {
      const players = [...get().players];
      
      playerIndices.forEach(index => {
        if (index >= 0 && index < players.length) {
          players[index] = {
            ...players[index],
            manaPool: { ...defaultManaPool }
          };
        }
      });
      
      set({ players });
    },

    fillManaPool: (playerIndex) => {
      const { players } = get()
      const player = players[playerIndex]
      if (!player) return
      
      // Create a new mana pool starting with zero
      const newManaPool = { ...defaultManaPool }
      
      // Add mana for each land
      player.lands.forEach((land: Land) => {
        newManaPool[land.produces]++
      })
      
      // Update the player with the filled mana pool and tap all lands
      const updatedPlayers = [...players];
      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        manaPool: newManaPool,
        lands: updatedPlayers[playerIndex].lands.map((land: Land) => ({
          ...land,
          tapped: true
        }))
      };
      
      set({ players: updatedPlayers });
    },
    
    // Helper function to save game state to localStorage
    saveGameState: () => {
      const { 
        gameStarted, 
        players, 
        activePlayerIndex, 
        displayedPlayerIndex, 
        isSinglePlayerMode, 
        actualPlayerIndex, 
        isPhantomPhase 
      } = get()
      
      if (gameStarted) {
        const gameState: SavedGameState = {
          players,
          activePlayerIndex,
          displayedPlayerIndex,
          isSinglePlayerMode,
          actualPlayerIndex,
          isPhantomPhase,
          timestamp: Date.now()
        }
        
        try {
          localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState))
          set({ hasSavedGame: true });
        } catch (error) {
          console.error('Failed to save game state:', error)
        }
      }
    }
  }
}) 