import React, { useState, useEffect, useRef } from 'react';
import { PlayerData } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Clock, Users } from "lucide-react";
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  // Default time per player (5 minutes in milliseconds)
  const defaultTime = 5 * 60 * 1000;
  
  const [times, setTimes] = useState<number[]>(players.map(() => defaultTime));
  const timerRef = useRef<number | null>(null);
  const [timerView, setTimerView] = useState<'active' | 'all'>('active');
  const { isSinglePlayerMode, isPhantomPhase } = useGame();

  // Update times array when players change
  useEffect(() => {
    setTimes(prevTimes => {
      if (prevTimes.length < players.length) {
        return [...prevTimes, ...new Array(players.length - prevTimes.length).fill(defaultTime)];
      } else if (prevTimes.length > players.length) {
        return prevTimes.slice(0, players.length);
      }
      return prevTimes;
    });
  }, [players.length]);

  // Handle timer logic
  useEffect(() => {
    // Don't run the timer during phantom phase in single player mode
    const shouldRun = running && !(isSinglePlayerMode && isPhantomPhase);
    
    if (shouldRun) {
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
  }, [running, activePlayerIndex, onTurnEnd, isSinglePlayerMode, isPhantomPhase]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const resetTimers = (): void => {
    setTimes(players.map(() => defaultTime));
  };

  // Helper to get time color based on remaining time
  const getTimeColor = (ms: number): string => {
    if (ms <= 60000) return 'text-red-500'; // Last minute
    if (ms <= 2 * 60000) return 'text-amber-500'; // Last 2 minutes
    return '';
  };

  return (
    <Card className="mb-4 border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-primary/70" />
          <span className="text-foreground/90">Turn Timer</span>
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