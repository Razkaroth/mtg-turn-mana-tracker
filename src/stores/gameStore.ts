import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
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
  const savedGameJSON = localStorage.getItem(GAME_STATE_KEY)
  return !!savedGameJSON
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

// Create the game store with Immer middleware for easier state updates
export const useGameStore = create<GameState>()(
  immer((set, get) => {
    // Initialize the settings first, as we need them to create default players
    const initialSettings = getStoredSettings()
    
    // Create default players using settings value
    const createDefaultPlayers = (): PlayerData[] => [
      { id: 1, name: 'Player 1', life: initialSettings.startingLife, lands: [], manaPool: { ...defaultManaPool } },
      { id: 2, name: 'Player 2', life: initialSettings.startingLife, lands: [], manaPool: { ...defaultManaPool } },
    ]

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

        set(state => {
          state.players = configuredPlayers
          state.activePlayerIndex = startingPlayerIndex
          state.displayedPlayerIndex = startingPlayerIndex
          state.timerRunning = false
          state.isSinglePlayerMode = singlePlayerMode
          state.actualPlayerIndex = playerPosition
          state.isPhantomPhase = false
          state.gameStarted = true
        })
        
        // After setting the game state, fill the mana pool for the starting player
        setTimeout(() => {
          get().fillManaPool(startingPlayerIndex)
        }, 0)
      },

      resetGame: () => {
        const { settings } = get()
        
        // Clear localStorage
        localStorage.removeItem(GAME_STATE_KEY)
        
        set(state => {
          state.gameStarted = false
          state.activePlayerIndex = 0
          state.displayedPlayerIndex = 0
          state.timerRunning = false
          state.isSinglePlayerMode = false
          state.actualPlayerIndex = 0
          state.isPhantomPhase = false
          state.hasSavedGame = false
          
          // Reset players
          state.players = state.players.map((player: PlayerData, index: number) => ({
            id: index + 1,
            name: `Player ${index + 1}`,
            life: settings.startingLife,
            lands: [],
            manaPool: { ...defaultManaPool }
          }))
        })
      },

      addPlayer: () => {
        const { players, settings } = get()
        
        set(state => {
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
          state.players.push(newPlayer)
        })
      },

      removePlayer: (id) => {
        const { players, activePlayerIndex } = get()
        
        // Find the index of the player to remove
        const playerIndex = players.findIndex((p: PlayerData) => p.id === id)
        if (playerIndex === -1) return // Player not found
        
        set(state => {
          // Remove the player
          state.players.splice(playerIndex, 1)
          
          // Adjust active player index if needed
          if (state.players.length > 0) {
            // If active player was removed or is now out of bounds
            if (activePlayerIndex >= state.players.length) {
              state.activePlayerIndex = 0
              state.displayedPlayerIndex = 0
            }
          }
        })
      },

      updatePlayer: (id, updatedData) => {
        set(state => {
          const playerIndex = state.players.findIndex(p => p.id === id)
          if (playerIndex !== -1) {
            // Update player data
            state.players[playerIndex] = {
              ...state.players[playerIndex],
              ...updatedData
            }
          }
        })
        
        // Save game state after update
        get().saveGameState()
      },

      nextTurn: () => {
        const { players, activePlayerIndex, isSinglePlayerMode, actualPlayerIndex } = get()
        
        if (players.length === 0) return
        
        set(state => {
          // Reset mana pool for current player
          state.players[activePlayerIndex].manaPool = { ...defaultManaPool }
          
          // Untap all lands for the current player
          state.players[activePlayerIndex].lands = state.players[activePlayerIndex].lands.map((land: Land) => ({
            ...land,
            tapped: false
          }))
          
          // Move to next player
          const nextPlayerIndex = (activePlayerIndex + 1) % players.length
          state.activePlayerIndex = nextPlayerIndex
          state.displayedPlayerIndex = nextPlayerIndex
          
          // For single player mode, handle phantom turns differently
          if (isSinglePlayerMode) {
            if (nextPlayerIndex === actualPlayerIndex) {
              // It's the actual player's turn
              state.isPhantomPhase = false
            } else {
              // It's a phantom player's turn
              state.isPhantomPhase = true
            }
          }
        })
        
        // Fill mana pool for next player
        const nextPlayerIndex = (activePlayerIndex + 1) % players.length
        get().fillManaPool(nextPlayerIndex)
        
        // Save game state after turn change
        get().saveGameState()
      },

      advancePhantomTurn: () => {
        const { players, activePlayerIndex } = get()
        
        if (players.length <= 1) return
        
        // Get the next player index
        const nextPlayerIndex = (activePlayerIndex + 1) % players.length
        
        set(state => {
          // Reset mana pool and untap lands for current player
          state.players[activePlayerIndex].manaPool = { ...defaultManaPool }
          state.players[activePlayerIndex].lands = state.players[activePlayerIndex].lands.map((land: Land) => ({
            ...land,
            tapped: false
          }))
          
          // Move to next player
          state.activePlayerIndex = nextPlayerIndex
          state.displayedPlayerIndex = nextPlayerIndex
          
          // If we've completed a full cycle back to the actual player
          if (nextPlayerIndex === state.actualPlayerIndex) {
            state.isPhantomPhase = false
          }
        })
        
        // Fill mana pool for next player
        get().fillManaPool(nextPlayerIndex)
        
        // Save game state
        get().saveGameState()
      },

      setTimerRunning: (isRunning) => {
        set(state => {
          state.timerRunning = isRunning
        })
      },

      setDisplayedPlayerIndex: (index) => {
        set(state => {
          state.displayedPlayerIndex = index
        })
        
        // Save game state
        get().saveGameState()
      },

      endGame: () => {
        // Clear saved game state
        localStorage.removeItem(GAME_STATE_KEY)
        
        set(state => {
          state.gameStarted = false
          state.hasSavedGame = false
        })
      },

      continueSavedGame: () => {
        const savedGame = loadSavedGame()
        if (!savedGame) return
        
        set(state => {
          state.players = savedGame.players
          state.activePlayerIndex = savedGame.activePlayerIndex
          state.displayedPlayerIndex = savedGame.displayedPlayerIndex
          state.isSinglePlayerMode = savedGame.isSinglePlayerMode
          state.actualPlayerIndex = savedGame.actualPlayerIndex
          state.isPhantomPhase = savedGame.isPhantomPhase
          state.gameStarted = true
        })
      },

      updateSettings: (newSettings) => {
        set(state => {
          state.settings = {
            ...state.settings,
            ...newSettings
          }
        })
        
        // Save settings to localStorage
        const { settings } = get()
        localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(settings))
        
        // Update player life totals if game hasn't started
        const { gameStarted, players } = get()
        if (!gameStarted && players.length > 0) {
          const needsUpdate = players.some((player: PlayerData) => player.life !== settings.startingLife)
          
          if (needsUpdate) {
            set(state => {
              state.players = state.players.map((player: PlayerData) => ({
                ...player,
                life: settings.startingLife
              }))
            })
          }
        }
      },

      // Mana-related actions
      resetManaPools: (playerIndices) => {
        set(state => {
          playerIndices.forEach(index => {
            if (index >= 0 && index < state.players.length) {
              state.players[index].manaPool = { ...defaultManaPool }
            }
          })
        })
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
        
        set(state => {
          // Update the player with the filled mana pool and tap all lands
          state.players[playerIndex].manaPool = newManaPool
          state.players[playerIndex].lands = state.players[playerIndex].lands.map((land: Land) => ({
            ...land,
            tapped: true
          }))
        })
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
          
          localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState))
          
          set(state => {
            state.hasSavedGame = true
          })
        }
      }
    }
  })
) 