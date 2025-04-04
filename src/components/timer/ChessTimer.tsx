import React, { useState, useEffect, useRef } from 'react';
import { PlayerData } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Clock, Users } from "lucide-react";
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface ChessTimerProps {
  players: PlayerData[];
  activePlayerIndex: number;
  running: boolean;
  onTurnEnd: () => void;
}

const ChessTimer: React.FC<ChessTimerProps> = ({ 
  players, 
  activePlayerIndex, 
  running, 
  onTurnEnd 
}) => {
  // Get time from settings
  const { settings } = useGame();
  
  // Convert minutes from settings to milliseconds
  const defaultTime = settings.chessClockMinutes * 60 * 1000;
  const incrementMs = settings.timeIncrement * 1000; // Convert increment seconds to ms
  
  const [times, setTimes] = useState<number[]>(players.map(() => defaultTime));
  const timerRef = useRef<number | null>(null);
  const [timerView, setTimerView] = useState<'active' | 'all'>('active');
  const { isSinglePlayerMode, isPhantomPhase } = useGame();
  
  // For Bronstein timing mode, we need to track when a player's turn starts
  const turnStartTimeRef = useRef<number>(0);
  const prevPlayerIndexRef = useRef<number>(-1);
  const [lastIncrementTime, setLastIncrementTime] = useState<{ playerId: number, amount: number } | null>(null);

  // Update times array when players change or settings change
  useEffect(() => {
    setTimes(prevTimes => {
      if (prevTimes.length < players.length) {
        return [...prevTimes, ...new Array(players.length - prevTimes.length).fill(defaultTime)];
      } else if (prevTimes.length > players.length) {
        return prevTimes.slice(0, players.length);
      }
      return prevTimes;
    });
  }, [players.length, defaultTime]);
  
  // Apply increment when player changes (for Fischer timing)
  // Or record the turn start time (for Bronstein timing)
  useEffect(() => {
    // Detect player turn change
    if (prevPlayerIndexRef.current !== activePlayerIndex && prevPlayerIndexRef.current !== -1) {
      // Handle Fischer timing - add increment to previous player
      if (settings.chessClockMode === 'fischer') {
        setTimes(prevTimes => {
          const newTimes = [...prevTimes];
          // Add increment to the player who just finished their turn
          const prevPlayerIndex = prevPlayerIndexRef.current;
          if (prevPlayerIndex >= 0 && prevPlayerIndex < newTimes.length) {
            newTimes[prevPlayerIndex] = Math.min(
              newTimes[prevPlayerIndex] + incrementMs,
              defaultTime * 2 // Cap at 2x the default time to prevent excessive accumulation
            );
            
            // Show the increment animation
            const prevPlayer = players[prevPlayerIndex];
            if (prevPlayer) {
              setLastIncrementTime({
                playerId: prevPlayer.id,
                amount: incrementMs
              });
              
              // Clear the increment indicator after a delay
              setTimeout(() => {
                setLastIncrementTime(null);
              }, 1500);
            }
          }
          return newTimes;
        });
      }
      
      // Handle Bronstein timing - calculate used time and add back up to increment
      if (settings.chessClockMode === 'bronstein' && turnStartTimeRef.current > 0) {
        const turnEndTime = Date.now();
        const timeUsed = turnEndTime - turnStartTimeRef.current;
        const timeToAddBack = Math.min(timeUsed, incrementMs);
        
        // Add the time back to the player who just finished their turn
        setTimes(prevTimes => {
          const newTimes = [...prevTimes];
          const prevPlayerIndex = prevPlayerIndexRef.current;
          if (prevPlayerIndex >= 0 && prevPlayerIndex < newTimes.length) {
            newTimes[prevPlayerIndex] = Math.min(
              newTimes[prevPlayerIndex] + timeToAddBack,
              defaultTime // Cap at default time to prevent excessive accumulation
            );
            
            // Show the increment animation for Bronstein timing
            const prevPlayer = players[prevPlayerIndex];
            if (prevPlayer && timeToAddBack > 0) {
              setLastIncrementTime({
                playerId: prevPlayer.id,
                amount: timeToAddBack
              });
              
              // Clear the increment indicator after a delay
              setTimeout(() => {
                setLastIncrementTime(null);
              }, 1500);
            }
          }
          return newTimes;
        });
      }
    }
    
    // Record turn start time for Bronstein timing
    if (settings.chessClockMode === 'bronstein') {
      turnStartTimeRef.current = Date.now();
    }
    
    // Update the previous player index
    prevPlayerIndexRef.current = activePlayerIndex;
  }, [activePlayerIndex, settings.chessClockMode, incrementMs, defaultTime]);

  // Handle timer logic
  useEffect(() => {
    // Don't run the timer during phantom phase in single player mode
    const shouldRun = running && !(isSinglePlayerMode && isPhantomPhase);
    
    if (shouldRun) {
      // For Bronstein timing, record the turn start time when timer starts
      if (settings.chessClockMode === 'bronstein' && !timerRef.current) {
        turnStartTimeRef.current = Date.now();
      }
      
      timerRef.current = window.setInterval(() => {
        setTimes(prevTimes => {
          const newTimes = [...prevTimes];
          newTimes[activePlayerIndex] = Math.max(0, newTimes[activePlayerIndex] - 100);
          
          // Auto end turn if time runs out
          if (newTimes[activePlayerIndex] === 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            onTurnEnd();
          }
          
          return newTimes;
        });
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [running, activePlayerIndex, onTurnEnd, isSinglePlayerMode, isPhantomPhase, settings.chessClockMode]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const resetTimers = (): void => {
    setTimes(players.map(() => defaultTime));
    prevPlayerIndexRef.current = -1;
    turnStartTimeRef.current = 0;
  };

  // Helper to get time color based on remaining time
  const getTimeColor = (ms: number): string => {
    if (ms <= 60000) return 'text-red-500'; // Last minute
    if (ms <= 2 * 60000) return 'text-amber-500'; // Last 2 minutes
    return '';
  };
  
  // Helper to get clock mode display name and icon
  const getClockModeInfo = () => {
    switch (settings.chessClockMode) {
      case 'fischer':
        return {
          label: 'Fischer',
          tooltip: `+${settings.timeIncrement}s per move`
        };
      case 'bronstein':
        return {
          label: 'Bronstein',
          tooltip: `Up to +${settings.timeIncrement}s per move`
        };
      default:
        return {
          label: 'Standard',
          tooltip: 'Fixed time per player'
        };
    }
  };
  
  const clockModeInfo = getClockModeInfo();

  return (
    <Card className="mb-4 border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-primary/70" />
          <span className="text-foreground/90">
            Turn Timer
            <Badge 
              variant="outline" 
              className="ml-2 text-xs py-0 h-5 px-1.5 font-normal bg-primary/5"
              title={clockModeInfo.tooltip}
            >
              {clockModeInfo.label}
              {settings.chessClockMode !== 'standard' && (
                <span className="ml-1 text-muted-foreground">+{settings.timeIncrement}s</span>
              )}
            </Badge>
          </span>
        </CardTitle>
        <Tabs 
          defaultValue="active" 
          value={timerView} 
          onValueChange={(value) => setTimerView(value as 'active' | 'all')}
          className="w-auto"
        >
          <TabsList className="h-7 p-0.5 bg-muted/50">
            <TabsTrigger value="active" className="text-xs px-2 py-0.5 data-[state=active]:bg-card">Active</TabsTrigger>
            <TabsTrigger value="all" className="text-xs px-2 py-0.5 data-[state=active]:bg-card">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                All
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        {timerView === 'active' ? (
          <div className="flex justify-center mb-3">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ 
                scale: 1,
                borderColor: running && !(isSinglePlayerMode && isPhantomPhase)
                  ? 'rgba(var(--primary), 0.3)'
                  : 'rgba(var(--muted-foreground), 0.2)'
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`relative p-2 px-4 min-w-[180px] rounded-lg border text-center ${
                isSinglePlayerMode && isPhantomPhase
                  ? 'bg-muted/30 text-muted-foreground border-muted-foreground/20'
                  : 'bg-gradient-to-b from-card to-background text-foreground border-primary/30'
              }`}
            >
              <span className="block text-xs font-medium mb-1 truncate max-w-full">
                {isSinglePlayerMode && isPhantomPhase 
                  ? "Opponents' Phase" 
                  : players[activePlayerIndex]?.name || "Player 1"}
              </span>
              <motion.span 
                key={times[activePlayerIndex]}
                initial={{ opacity: 0.7, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`text-2xl font-mono font-semibold ${getTimeColor(times[activePlayerIndex] || 0)}`}
              >
                {formatTime(times[activePlayerIndex] || 0)}
              </motion.span>
              
              {/* Time increment info and indicator */}
              <div className="relative">
                {settings.chessClockMode !== 'standard' && (
                  <div className="text-xs mt-1 text-muted-foreground">
                    {settings.chessClockMode === 'fischer' ? (
                      <span>+{settings.timeIncrement}s per move</span>
                    ) : (
                      <span>up to +{settings.timeIncrement}s per move</span>
                    )}
                  </div>
                )}
                
                {/* Show time increment indicator */}
                {lastIncrementTime && lastIncrementTime.playerId === players[activePlayerIndex]?.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-green-500 font-medium absolute top-0 left-0 right-0 mt-1"
                  >
                    +{(lastIncrementTime.amount / 1000).toFixed(1)}s
                  </motion.div>
                )}
              </div>
              
              {running && !(isSinglePlayerMode && isPhantomPhase) && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-[2px] bg-primary/30"
                  animate={{ width: ['0%', '100%'] }}
                  transition={{ 
                    duration: 1, 
                    ease: "linear", 
                    repeat: Infinity 
                  }}
                />
              )}
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            <AnimatePresence>
              {players.map((player, index) => (
                <motion.div 
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: 0
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={`p-2 min-w-[110px] rounded-md text-center transition-all duration-300 ${
                    index === activePlayerIndex 
                      ? (isSinglePlayerMode && isPhantomPhase) 
                        ? 'bg-muted/30 text-muted-foreground border border-primary/20'
                        : 'bg-card border border-primary/30 text-foreground shadow-sm'
                      : 'bg-muted/30 text-muted-foreground border border-transparent'
                  }`}
                >
                  <span className="block text-xs font-medium mb-0.5 truncate max-w-full">{player.name}</span>
                  <span className={`text-lg font-mono ${getTimeColor(times[index])}`}>
                    {formatTime(times[index])}
                  </span>
                  
                  {/* Show time increment indicator */}
                  {lastIncrementTime && lastIncrementTime.playerId === player.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-green-500 font-medium mt-0.5"
                    >
                      +{(lastIncrementTime.amount / 1000).toFixed(1)}s
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        <Button 
          onClick={resetTimers}
          variant="ghost"
          size="sm"
          className="w-full text-sm border border-border/40 hover:bg-muted/40 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1 opacity-70" />
          Reset Timers
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChessTimer; 