import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Play, Pause, ArrowRight, SkipForward } from "lucide-react";
import { useGame } from '../../context/GameContext';
import Player from '../player/Player';
import ChessTimer from '../timer/ChessTimer';
import PlayerSelector from '../player/PlayerSelector';
import PhantomTurnBanner from './PhantomTurnBanner';
import { PlayerData } from '../../types';
import { toast } from 'sonner';

export const GameplayUI: React.FC = () => {
  const { 
    players, 
    visiblePlayers,
    activePlayerIndex, 
    displayedPlayerIndex, 
    timerRunning, 
    addPlayer, 
    removePlayer, 
    updatePlayer, 
    nextTurn, 
    advancePhantomTurn,
    setTimerRunning, 
    setDisplayedPlayerIndex,
    isSinglePlayerMode,
    isPhantomPhase,
    actualPlayerIndex
  } = useGame();

  const activePlayer = players[activePlayerIndex];
  const displayedPlayer = players[displayedPlayerIndex];
  const realPlayer = isSinglePlayerMode ? players[actualPlayerIndex] : players[displayedPlayerIndex];

  // Show toast notification for phantom phase
  useEffect(() => {
    if (isSinglePlayerMode && isPhantomPhase) {
      toast.info(
        `Opponents' Phase`,
        {
          description: "All other players are taking their turns. You can play instants or end this phase.",
          duration: 3000,
          id: "phantom-phase", // Use ID to prevent duplicate toasts
        }
      );
    }
  }, [isSinglePlayerMode, isPhantomPhase]);

  // Handle next turn with auto-resume timer
  const handleNextTurn = () => {
    // Auto-start timer if it was paused
    if (!timerRunning) {
      setTimerRunning(true);
    }
    nextTurn();
  };

  // Handle phantom turn advancement with auto-resume timer
  const handleAdvancePhantomTurn = () => {
    // Auto-start timer if it was paused
    if (!timerRunning) {
      setTimerRunning(true);
    }
    advancePhantomTurn();
  };

  return (
    <div className="bg-background text-foreground h-full flex flex-col">
      {/* Controls and header area - fixed at top */}
      <div className="flex-none p-4 pb-2 border-b border-border">
        {/* Game controls */}
        <div className="flex justify-center gap-2 max-w-sm mx-auto">
          <Button 
            onClick={addPlayer}
            variant="secondary"
            size="sm"
            className="flex items-center gap-1"
            disabled={isSinglePlayerMode} // Disable adding players in single player mode
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
          
          {isPhantomPhase ? (
            // Show "Begin Your Turn" button during phantom phase
            <Button 
              onClick={handleAdvancePhantomTurn}
              variant="default"
              size="sm"
              className="flex items-center gap-1"
            >
              <SkipForward className="h-4 w-4" />
              Begin Your Turn
            </Button>
          ) : (
            // Show regular "Next Turn" button during real player turns
            <Button 
              onClick={handleNextTurn}
              variant="default"
              size="sm"
              className="flex items-center gap-1"
            >
              <ArrowRight className="h-4 w-4" />
              Next Turn
            </Button>
          )}
        </div>
      </div>
      
      {/* Main scrollable content area */}
      <div className="flex-grow overflow-y-auto p-4 pt-2 pb-20">
        <div className="max-w-sm mx-auto">
          <ChessTimer 
            players={players} 
            activePlayerIndex={activePlayerIndex} 
            running={timerRunning}
            onTurnEnd={handleNextTurn}
          />
          
          {/* Display whose turn it is */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Active:</span>
              {isPhantomPhase ? (
                <span className="text-sm font-bold text-muted-foreground italic">
                  Opponents' Phase
                </span>
              ) : (
                <span className={`text-sm font-bold ${activePlayer.isPhantom ? 'text-muted-foreground italic' : ''}`}>
                  {activePlayer.name}
                  {activePlayer.isPhantom && " (AI)"}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Viewing:</span>
              <span className="text-sm font-bold">
                {displayedPlayer.name}
              </span>
            </div>
          </div>
          
          {/* Turn status indicator for single player mode */}
          {isSinglePlayerMode && (
            <div className={`text-sm text-center mb-3 p-3 rounded-md ${
              isPhantomPhase 
                ? 'bg-muted border border-muted-foreground/20' 
                : 'bg-primary/10 text-primary font-medium'
            }`}>
              {isPhantomPhase ? (
                <div className="space-y-1">
                  <p className="font-medium">Opponents' Phase</p>
                  <p className="text-xs text-muted-foreground">
                    Click "Begin Your Turn" when you're ready to take your turn
                  </p>
                </div>
              ) : (
                <div>It's your turn!</div>
              )}
            </div>
          )}
          
          {/* Phantom phase banner */}
          {isPhantomPhase && (
            <PhantomTurnBanner onNextTurn={handleAdvancePhantomTurn} />
          )}
          
          {/* Player component - always visible in single player mode */}
          {isSinglePlayerMode ? (
            <Player
              key={realPlayer.id}
              player={realPlayer}
              isActive={!isPhantomPhase}
              onUpdate={(updatedData: Partial<PlayerData>) => updatePlayer(realPlayer.id, updatedData)}
              onRemove={() => removePlayer(realPlayer.id)}
            />
          ) : (
            <Player
              key={displayedPlayer.id}
              player={displayedPlayer}
              isActive={displayedPlayerIndex === activePlayerIndex}
              onUpdate={(updatedData: Partial<PlayerData>) => updatePlayer(displayedPlayer.id, updatedData)}
              onRemove={() => removePlayer(displayedPlayer.id)}
            />
          )}
        </div>
      </div>
      
      {/* Fixed footer area for player selector */}
      {!isSinglePlayerMode && (
        <div className="flex-none">
          <PlayerSelector
            players={visiblePlayers}
            displayedPlayerIndex={displayedPlayerIndex}
            activePlayerIndex={activePlayerIndex}
            onSelectPlayer={setDisplayedPlayerIndex}
          />
        </div>
      )}
    </div>
  );
}; 