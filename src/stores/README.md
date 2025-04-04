# Zustand Store Implementation

This directory contains the Zustand state management stores for the MTG Turn Mana Tracker application.

## Migration to Zustand

We've migrated from React Context to Zustand for state management due to:

1. Simplicity: Zustand provides a much simpler API with less boilerplate
2. Performance: Better performance without unnecessary re-renders
3. Flexibility: Easier to use outside of React components
4. Maintainability: Simpler to extend and maintain as the app grows

## Store Structure

### Game Store (`gameStore.ts`)

The main state store that manages:
- Game state (active players, turns, etc.)
- Player data (life totals, lands, mana pools)
- Game settings
- Persistence to localStorage

### Player Hooks (`usePlayer.ts`)

Located in the `hooks` directory, this custom hook provides an abstraction for working with player data, exposing only the needed functionality to components.

## Usage Examples

### Accessing store state directly

```tsx
import { useGameStore } from '@/stores/gameStore';

function GameInfo() {
  // Select only the pieces of state you need
  const gameStarted = useGameStore(state => state.gameStarted);
  const activePlayerIndex = useGameStore(state => state.activePlayerIndex);
  
  return (
    <div>
      {gameStarted ? 'Game in progress' : 'No game started'}
      {gameStarted && <p>Active Player: {activePlayerIndex + 1}</p>}
    </div>
  );
}
```

### Using actions to update state

```tsx
import { useGameStore } from '@/stores/gameStore';

function GameControls() {
  const nextTurn = useGameStore(state => state.nextTurn);
  const endGame = useGameStore(state => state.endGame);
  
  return (
    <div>
      <button onClick={nextTurn}>Next Turn</button>
      <button onClick={endGame}>End Game</button>
    </div>
  );
}
```

### Using the usePlayer hook

```tsx
import { usePlayer } from '@/hooks/usePlayer';

function PlayerLifeCounter({ playerId }) {
  const { player, updateLife } = usePlayer(playerId);
  
  return (
    <div>
      <h2>{player.name}'s Life: {player.life}</h2>
      <button onClick={() => updateLife(-1)}>-1</button>
      <button onClick={() => updateLife(1)}>+1</button>
    </div>
  );
}
```

## Implementation Details

- We're using Immer middleware with Zustand for easier state updates
- The store uses localStorage for persistence
- Type safety is maintained throughout with TypeScript
- Computed properties are implemented as getters 