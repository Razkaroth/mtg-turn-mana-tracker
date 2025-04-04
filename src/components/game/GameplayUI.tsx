import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Play, Pause, ArrowRight, ArrowLeft } from "lucide-react";
import { useGame } from '../../context/GameContext';
import Player from '../player/Player';
import ChessTimer from '../timer/ChessTimer';
import PlayerSelector from '../player/PlayerSelector';
import { PlayerData } from '../../types';

export const GameplayUI: React.FC = () => {
  const { 
    players, 
    activePlayerIndex, 
    displayedPlayerIndex, 
    timerRunning, 
    addPlayer, 
    removePlayer, 
    updatePlayer, 
    nextTurn, 
    setTimerRunning, 
    setDisplayedPlayerIndex 
  } = useGame();

  return (
    <div className="bg-background text-foreground p-4 pt-3 pb-0 font-sans flex flex-col justify-between h-full">
      <div className="max-w-sm mx-auto w-full pb-20">
        {/* Game controls */}
        <div className="flex justify-center gap-2 mb-3">
          <Button 
            onClick={addPlayer}
            variant="secondary"
            size="sm"
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Add
          </Button>
          <Button 
            onClick={() => setTimerRunning(!timerRunning)}
            variant={timerRunning ? "destructive" : "default"}
            size="sm"
            className="flex items-center gap-1"
          >
            {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {timerRunning ? 'Pause' : 'Start'}
          </Button>
          <Button 
            onClick={nextTurn}
            variant="default"
            size="sm"
            className="flex items-center gap-1"
          >
            <ArrowRight className="h-4 w-4" />
            Next Turn
          </Button>
        </div>
        
        <ChessTimer 
          players={players} 
          activePlayerIndex={activePlayerIndex} 
          running={timerRunning}
          onTurnEnd={nextTurn}
        />
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">Active:</span>
            <span className="text-sm font-bold">
              {players[activePlayerIndex]?.name || "Player 1"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">Viewing:</span>
            <span className="text-sm font-bold">
              {players[displayedPlayerIndex]?.name || "Player 1"}
            </span>
          </div>
        </div>
        
        {displayedPlayerIndex !== activePlayerIndex && (
          <Button
            onClick={() => setDisplayedPlayerIndex(activePlayerIndex)}
            variant="outline"
            size="sm"
            className="w-full mb-3 border-primary/30 text-primary flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Active Player
          </Button>
        )}
        
        {players.length > 0 && (
          <Player
            key={players[displayedPlayerIndex].id}
            player={players[displayedPlayerIndex]}
            isActive={displayedPlayerIndex === activePlayerIndex}
            onUpdate={(updatedData: Partial<PlayerData>) => updatePlayer(players[displayedPlayerIndex].id, updatedData)}
            onRemove={() => removePlayer(players[displayedPlayerIndex].id)}
          />
        )}
      </div>
      
      <PlayerSelector
        players={players}
        displayedPlayerIndex={displayedPlayerIndex}
        activePlayerIndex={activePlayerIndex}
        onSelectPlayer={setDisplayedPlayerIndex}
      />
    </div>
  );
}; 