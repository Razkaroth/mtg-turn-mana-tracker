// Game Settings
export interface GameSettings {
  startingLife: number;
  chessClockMinutes: number;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  startingLife: 40,
  chessClockMinutes: 25
};

// Player profiles
export interface Profile {
  id: string;
  name: string;
  createdAt: number;
  lastUsed?: number;
}

// Land types
export type ManaType = 'W' | 'U' | 'B' | 'R' | 'G' | 'C';

export interface Land {
  id: number;
  type: string;
  produces: ManaType;
  tapped: boolean;
  name?: string;
}

// Mana pool
export interface ManaPool {
  W: number; // White
  U: number; // Blue
  B: number; // Black
  R: number; // Red
  G: number; // Green
  C: number; // Colorless
}

// Player data
export interface PlayerData {
  id: number;
  name: string;
  life: number;
  lands: Land[];
  manaPool: ManaPool;
  profileId?: string;
  isPhantom?: boolean; // For AI players in single player mode
} 