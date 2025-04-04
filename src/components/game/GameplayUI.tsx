import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, SkipForward, Ghost } from "lucide-react";
import { useGameStore } from '@/stores/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HelpTooltip } from '../ui/help-tooltip';
import { PlayerData } from '@/types';
import Player from '../player/Player';
import ChessTimer from '../timer/ChessTimer';
import PlayerSelector from '../player/PlayerSelector';
import PhantomTurnBanner from './PhantomTurnBanner';

export const GameplayUI: React.FC = () => {
  // Get all the state and actions from the Zustand store
  const players = useGameStore(state => state.players);
  const phantomPlayers = useGameStore(state => state.phantomPlayers);
  const activePlayerIndex = useGameStore(state => state.activePlayerIndex);
  const displayedPlayerIndex = useGameStore(state => state.displayedPlayerIndex);
  const timerRunning = useGameStore(state => state.timerRunning);
  const isSinglePlayerMode = useGameStore(state => state.isSinglePlayerMode);
  const isPhantomPhase = useGameStore(state => state.isPhantomPhase);
  const actualPlayerIndex = useGameStore(state => state.actualPlayerIndex);
  
  // Get the actions from the Zustand store
  const removePlayer = useGameStore(state => state.removePlayer);
  const nextTurn = useGameStore(state => state.nextTurn);
  const advancePhantomTurn = useGameStore(state => state.advancePhantomTurn);
  const setTimerRunning = useGameStore(state => state.setTimerRunning);
  const setDisplayedPlayerIndex = useGameStore(state => state.setDisplayedPlayerIndex);
  
  // Ensure displayedPlayerIndex is valid when players change
  useEffect(() => {
    if (displayedPlayerIndex >= players.length) {
      setDisplayedPlayerIndex(players.length > 0 ? 0 : 0);
    }
  }, [players.length, displayedPlayerIndex, setDisplayedPlayerIndex]);
  
  // Get the current players for display, ensuring valid indexes
  const safeActivePlayerIndex = activePlayerIndex < players.length ? activePlayerIndex : 0;
  const safeDisplayedPlayerIndex = displayedPlayerIndex < players.length ? displayedPlayerIndex : 0;
  const safeActualPlayerIndex = actualPlayerIndex < players.length ? actualPlayerIndex : 0;
  
  const activePlayer = players[safeActivePlayerIndex] || { name: "No player", id: 0 };
  const displayedPlayer = players[safeDisplayedPlayerIndex] || { name: "No player", id: 0 };
  const realPlayer = isSinglePlayerMode ? players[safeActualPlayerIndex] : players[safeDisplayedPlayerIndex];

  // Show toast notification for phantom phase
  useEffect(() => {
    if (isSinglePlayerMode && isPhantomPhase) {
      toast.info(
        `Opponents' Phase`,
        {
          description: "All other players are taking their turns. You can play instants or end this phase.",
          duration: 2000,
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
    
    if (players.length === 0) return;
    
    // Get the next player before calling nextTurn
    const nextPlayerIndex = (safeActivePlayerIndex + 1) % players.length;
    const nextPlayer = players[nextPlayerIndex];
    
    // Only show notification if they have lands to tap
    if (nextPlayer && nextPlayer.lands.length > 0) {
      setTimeout(() => {
        toast.success(
          `${nextPlayer.name}'s mana pool filled`,
          {
            description: `${nextPlayer.lands.length} land${nextPlayer.lands.length > 1 ? 's' : ''} auto-tapped for mana.`,
            duration: 2000,
            id: "mana-filled", // Use ID to prevent duplicate toasts
          }
        );
      }, 100); // Small delay to ensure it shows after state updates
    }
    
    nextTurn();
  };

  // Handle phantom turn advancement with auto-resume timer
  const handleAdvancePhantomTurn = () => {
    // Auto-start timer if it was paused
    if (!timerRunning) {
      setTimerRunning(true);
    }

    if (players.length === 0) return;
    
    // Get the real player before calling advancePhantomTurn
    const realPlayer = players[safeActualPlayerIndex];
    
    // Only show notification if they have lands to tap
    if (realPlayer && realPlayer.lands.length > 0) {
      setTimeout(() => {
        toast.success(
          `Your mana pool filled`,
          {
            description: `${realPlayer.lands.length} land${realPlayer.lands.length > 1 ? 's' : ''} auto-tapped for mana.`,
            duration: 2000,
            id: "mana-filled", // Use ID to prevent duplicate toasts
          }
        );
      }, 100); // Small delay to ensure it shows after state updates
    }
    
    advancePhantomTurn();
  };

  // Handle player selection - treat single player mode specially
  const handleSelectPlayer = (index: number) => {
    // In single player mode, only allow viewing phantom players (not the main player)
    if (isSinglePlayerMode) {
      // Allow viewing the actual player or phantom players, but don't change any other state
      setDisplayedPlayerIndex(index);
    } else {
      // In normal mode, just update the displayed player index
      setDisplayedPlayerIndex(index);
    }
  };

  // In single player mode, determine what players should be selectable
  const selectablePlayers = isSinglePlayerMode
    ? [players[safeActualPlayerIndex], ...phantomPlayers] // Show real player first, then phantoms
    : players;

  // Which player index is currently selected in the selectable players array
  const currentSelectedIndex = isSinglePlayerMode
    ? (displayedPlayerIndex === actualPlayerIndex ? 0 : phantomPlayers.findIndex(p => p.id === displayedPlayer.id) + 1)
    : displayedPlayerIndex;

  return (
    <div className="bg-background text-foreground h-full flex flex-col">
      {/* Controls and header area - fixed at top */}
      <motion.div 
        initial={{ y: -10, opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-none p-4 pb-2 border-b border-border/40 bg-background/80 backdrop-blur-sm z-10"
      >
        {/* Game controls */}
        <div className="flex justify-center max-w-sm mx-auto">
          <AnimatePresence mode="wait">
            {isPhantomPhase ? (
              // Show "Begin Your Turn" button during phantom phase
              <motion.div
                key="phantom-button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <Button 
                  onClick={handleAdvancePhantomTurn}
                  variant="default"
                  size="lg"
                  className="w-full py-6 text-base flex items-center justify-center gap-2 bg-primary/90 hover:bg-primary"
                >
                  <SkipForward className="h-5 w-5" />
                  <span>Begin Your Turn</span>
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
                className="w-full"
              >
                <Button 
                  onClick={handleNextTurn}
                  variant="outline"
                  size="lg"
                  className="w-full py-6 text-base flex items-center justify-center gap-2 border-border/40 hover:bg-background hover:border-border"
                >
                  <ArrowRight className="h-5 w-5" />
                  <span>Next Turn</span>
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
            activePlayerIndex={safeActivePlayerIndex} 
            running={timerRunning}
            onTurnEnd={handleNextTurn}
            setTimerRunning={setTimerRunning}
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
                  {activePlayer.isPhantom && " (Remote)"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground mr-2">Viewing:</span>
              <span className="font-medium">
                {displayedPlayer.name}
              </span>
              <HelpTooltip 
                content={
                  <div className="space-y-2">
                    <p><strong>Active Player:</strong> Whose turn it is now</p>
                    <p><strong>Viewing:</strong> The player details you're currently seeing below</p>
                    <p>Each player takes turns. When a player's turn begins, their lands automatically untap and their mana pool is filled.</p>
                    {isSinglePlayerMode && (
                      <p className="text-primary-foreground/80 bg-primary/10 p-1.5 rounded text-xs">
                        In single player mode, you're the only one using this device. Opponents' turns are tracked in a combined "Opponents' Phase".
                      </p>
                    )}
                  </div>
                }
              />
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
              key={isSinglePlayerMode ? realPlayer?.id : displayedPlayer?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {isSinglePlayerMode ? (
                <Player 
                  playerId={realPlayer?.id}
                  isActive={!isPhantomPhase}
                  onRemove={() => realPlayer?.id && removePlayer(realPlayer.id)}
                />
              ) : (
                <Player 
                  playerId={displayedPlayer?.id}
                  isActive={safeActivePlayerIndex === safeDisplayedPlayerIndex}
                  onRemove={players.length > 2 && displayedPlayer?.id ? () => removePlayer(displayedPlayer.id) : () => {}}
                />
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Player selector */}
          <PlayerSelector
            players={selectablePlayers}
            selectedIndex={currentSelectedIndex}
            activePlayerIndex={safeActivePlayerIndex}
            onSelectPlayer={handleSelectPlayer}
          />
          
          {/* Phantom players for single player mode */}
          {isSinglePlayerMode && displayedPlayerIndex === actualPlayerIndex && phantomPlayers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <Ghost className="h-3.5 w-3.5" />
                Opponent Players
              </h3>
              <div className="space-y-2">
                {phantomPlayers.map((player: PlayerData) => (
                  <Player
                    key={player.id}
                    playerId={player.id}
                    isActive={isPhantomPhase && safeActivePlayerIndex === players.findIndex(p => p.id === player.id)}
                    isMinimal={true}
                    onRemove={() => player.id && removePlayer(player.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 