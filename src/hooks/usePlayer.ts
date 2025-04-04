import { useGameStore } from '../stores/gameStore'
import { Land, ManaType, PlayerData } from '../types'

/**
 * Custom hook to interact with a specific player
 * @param playerId The ID of the player to interact with
 */
export const usePlayer = (playerId: number) => {
  const updatePlayer = useGameStore(state => state.updatePlayer)
  const player = useGameStore(state => 
    state.players.find(p => p.id === playerId)
  ) as PlayerData | undefined
  
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`)
  }
  
  // Updates the player's life total
  const updateLife = (amount: number) => {
    updatePlayer(playerId, { life: player.life + amount })
  }
  
  // Adds a land to the player's lands
  const addLand = (landType: string, produces: ManaType) => {
    const newLand: Land = { 
      id: Date.now(), 
      type: landType, 
      tapped: false, 
      produces: produces
    }
    updatePlayer(playerId, { lands: [...player.lands, newLand] })
  }
  
  // Removes a land by ID
  const removeLand = (landId: number) => {
    updatePlayer(playerId, { 
      lands: player.lands.filter(land => land.id !== landId) 
    })
  }
  
  // Removes a land by type
  const removeLandByType = (landType: string) => {
    // Find the first land of the specified type
    const landToRemove = player.lands.find(land => land.type === landType)
    if (landToRemove) {
      removeLand(landToRemove.id)
      return true
    }
    return false
  }
  
  // Toggles a land's tapped state and updates mana pool accordingly
  const toggleLand = (landId: number) => {
    // Get the land being toggled
    const land = player.lands.find(l => l.id === landId)
    if (!land) return
    
    // If we're tapping the land (currently untapped), add mana to the pool
    if (!land.tapped) {
      const updatedManaPool = { ...player.manaPool }
      updatedManaPool[land.produces]++
      
      // Update mana pool and toggle the land
      updatePlayer(playerId, { 
        manaPool: updatedManaPool,
        lands: player.lands.map(l => {
          if (l.id === landId) {
            return { ...l, tapped: true }
          }
          return l
        })
      })
    } else {
      // Just toggle the land to untapped without affecting mana pool
      updatePlayer(playerId, {
        lands: player.lands.map(l => {
          if (l.id === landId) {
            return { ...l, tapped: false }
          }
          return l
        })
      })
    }
  }
  
  // Decrements mana of a specific type
  const decrementMana = (manaType: string) => {
    if (player.manaPool[manaType as keyof typeof player.manaPool] > 0) {
      const updatedManaPool = { ...player.manaPool }
      updatedManaPool[manaType as keyof typeof updatedManaPool]--
      updatePlayer(playerId, { manaPool: updatedManaPool })
    }
  }
  
  // Increments mana of a specific type
  const incrementMana = (manaType: string) => {
    const updatedManaPool = { ...player.manaPool }
    updatedManaPool[manaType as keyof typeof updatedManaPool]++
    updatePlayer(playerId, { manaPool: updatedManaPool })
  }
  
  // Updates the player's name
  const updateName = (name: string) => {
    updatePlayer(playerId, { name })
  }
  
  // Helper to count total mana
  const totalMana = Object.values(player.manaPool).reduce((sum, count) => sum + count, 0)
  
  // Get counts of each land type
  const landCounts = player.lands.reduce((counts: Record<string, number>, land) => {
    counts[land.type] = (counts[land.type] || 0) + 1
    return counts
  }, {})
  
  return {
    player,
    updateLife,
    addLand,
    removeLand,
    removeLandByType,
    toggleLand,
    decrementMana,
    incrementMana,
    updateName,
    totalMana,
    landCounts
  }
} 