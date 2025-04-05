import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import { GameScreen } from './GameScreen';
import { MainMenu } from '../menu/MainMenu';

/**
 * Game container that determines whether to show the main menu or game screen
 * based on the gameStarted state from the Zustand store
 */
export const GameContainer: React.FC = () => {
  const gameStarted = useGameStore(state => state.gameStarted);
  
  return gameStarted ? <GameScreen /> : <MainMenu />;
} 