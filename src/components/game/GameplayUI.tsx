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
import { motion, AnimatePresence } from 'framer-motion';

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

    // Show a toast notification about mana pool being filled on the next turn
    const nextPlayerIndex = (activePlayerIndex + 1) % players.length;
    const nextPlayer = players[nextPlayerIndex];
    
    if (nextPlayer && nextPlayer.lands.length > 0) {
      toast.success(
        `${nextPlayer.name}'s mana pool filled`,
        {
          description: `${nextPlayer.lands.length} land${nextPlayer.lands.length > 1 ? 's' : ''} auto-tapped for mana.`,
          duration: 3000,
          id: "mana-filled", // Use ID to prevent duplicate toasts
        }
      );
    }
  };

  // Handle phantom turn advancement with auto-resume timer
  const handleAdvancePhantomTurn = () => {
    // Auto-start timer if it was paused
    if (!timerRunning) {
      setTimerRunning(true);
    }
    advancePhantomTurn();

    // Show a toast notification about mana pool being filled for the real player
    const realPlayer = players[actualPlayerIndex];
    
    if (realPlayer && realPlayer.lands.length > 0) {
      toast.success(
        `Your mana pool filled`,
        {
          description: `${realPlayer.lands.length} land${realPlayer.lands.length > 1 ? 's' : ''} auto-tapped for mana.`,
          duration: 3000,
          id: "mana-filled", // Use ID to prevent duplicate toasts
        }
      );
    }
  };

  return (
    <div className="bg-background text-foreground h-full flex flex-col">
      {/* Controls and header area - fixed at top */}
      <motion.div 
        initial={{ y: -10, opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-none p-4 pb-2 border-b border-border/40 bg-background/80 backdrop-blur-sm z-10"
      >
        {/* Game controls */}
        <div className="flex justify-center gap-2 max-w-sm mx-auto">
          <Button 
            onClick={addPlayer}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 px-3 border border-border/40 hover:bg-background hover:border-border"
            disabled={isSinglePlayerMode} // Disable adding players in single player mode
          >
            <PlusCircle className="h-4 w-4 text-primary/70" />
            <span className="text-sm">Add</span>
          </Button>
          
          <Button 
            onClick={() => setTimerRunning(!timerRunning)}
            variant={timerRunning ? "secondary" : "outline"}
            size="sm"
            className={`flex items-center gap-1 px-3 border ${
              timerRunning 
              ? 'border-primary/40 text-primary hover:bg-primary/10' 
              : 'border-border/40 hover:bg-background hover:border-border'
            }`}
          >
            {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="text-sm">{timerRunning ? 'Pause' : 'Start'}</span>
          </Button>
          
          <AnimatePresence mode="wait">
            {isPhantomPhase ? (
              // Show "Begin Your Turn" button during phantom phase
              <motion.div
                key="phantom-button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  onClick={handleAdvancePhantomTurn}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1 px-3 bg-primary/90 hover:bg-primary"
                >
                  <SkipForward className="h-4 w-4" />
                  <span className="text-sm">Begin Your Turn</span>
                </Button>
              </motion.div>
            ) : (
              // Show regular "Next Turn" button during real player turns
              <motion.div
                key="next-turn-button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  onClick={handleNextTurn}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 px-3 border-border/40 hover:bg-background hover:border-border"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-sm">Next Turn</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
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
          <div className="flex justify-between items-center mb-3 text-sm bg-card/50 rounded-lg border border-border/30 py-1.5 px-3">
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">Active:</span>
              {isPhantomPhase ? (
                <span className="font-medium text-muted-foreground italic">
                  Opponents' Phase
                </span>
              ) : (
                <span className={`font-medium ${activePlayer.isPhantom ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                  {activePlayer.name}
                  {activePlayer.isPhantom && " (AI)"}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <span className="text-muted-foreground mr-2">Viewing:</span>
              <span className="font-medium">
                {displayedPlayer.name}
              </span>
            </div>
          </div>
          
          {/* Turn status indicator for single player mode */}
          {isSinglePlayerMode && (
            <AnimatePresence mode="wait">
              <motion.div 
                key={isPhantomPhase ? "phantom" : "player"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className={`text-sm text-center mb-4 p-3 rounded-md border ${
                  isPhantomPhase 
                    ? 'bg-muted/30 border-muted-foreground/20' 
                    : 'bg-primary/10 border-primary/20 text-primary font-medium'
                }`}
              >
                {isPhantomPhase ? (
                  <div className="space-y-1">
                    <p className="font-medium text-foreground/80">Opponents' Phase</p>
                    <p className="text-xs text-muted-foreground">
                      Click "Begin Your Turn" when you're ready to take your turn
                    </p>
                  </div>
                ) : (
                  <div>It's your turn!</div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
          
          {/* Phantom phase banner */}
          {isPhantomPhase && <PhantomTurnBanner onNextTurn={handleAdvancePhantomTurn} />}
          
          {/* Player component - always visible in single player mode */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSinglePlayerMode ? realPlayer.id : displayedPlayer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Fixed footer area for player selector */}
      {!isSinglePlayerMode && (
        <div className="flex-none fixed bottom-0 left-0 right-0 border-t border-border/30 bg-background/80 backdrop-blur-sm z-10">
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