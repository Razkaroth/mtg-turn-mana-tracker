import React from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '@/components/ui/button';
import { GameplayUI } from './GameplayUI';
import { XCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const GameScreen: React.FC = () => {
  const { endGame } = useGame();
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header with End Game button and theme toggle */}
      <div className="flex justify-between items-center p-3 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-primary">Auto-Magic-Ator 5000</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={endGame}
            className="gap-1"
          >
            <XCircle className="h-4 w-4" />
            End Game
          </Button>
        </div>
      </div>

      {/* Game content */}
      <div className="flex-1 overflow-hidden">
        <GameplayUI />
      </div>
    </div>
  );
}; 