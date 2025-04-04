// Land represents a land card in the game
export interface Land {
  id: number;
  type: string;
  tapped: boolean;
  produces: string;
}

// ManaPool tracks available mana of each color
export interface ManaPool {
  W: number; // White
  U: number; // Blue
  B: number; // Black
  R: number; // Red
  G: number; // Green
  C: number; // Colorless
}

// PlayerData represents a player in the game
export interface PlayerData {
  id: number;
  name: string;
  life: number;
  lands: Land[];
  manaPool: ManaPool;
  profileId?: string; // Link to profile id
}

// Profile represents a saved player profile
export interface Profile {
  id: string;
  name: string;
  createdAt: number;
  lastUsed?: number;
} 