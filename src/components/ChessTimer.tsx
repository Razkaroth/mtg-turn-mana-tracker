import React, { useState, useEffect, useRef } from 'react';
import { PlayerData } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw } from "lucide-react";

interface ChessTimerProps {
  players: PlayerData[];
  activePlayer: number;
  running: boolean;
  onTurnEnd: () => void;
}

function ChessTimer({ players, activePlayer, running, onTurnEnd }: ChessTimerProps) {
  // Default time per player (5 minutes in milliseconds)
  const defaultTime = 5 * 60 * 1000;
  
  const [times, setTimes] = useState<number[]>(players.map(() => defaultTime));
  const timerRef = useRef<number | null>(null);
  const [timerView, setTimerView] = useState<'active' | 'all'>('active');

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
    if (running) {
      timerRef.current = window.setInterval(() => {
        setTimes(prevTimes => {
          const newTimes = [...prevTimes];
          newTimes[activePlayer] = Math.max(0, newTimes[activePlayer] - 100);
          
          // Auto end turn if time runs out
          if (newTimes[activePlayer] === 0) {
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
  }, [running, activePlayer, onTurnEnd]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const resetTimers = (): void => {
    setTimes(players.map(() => defaultTime));
  };

  return (
    <Card className="mb-4 border-border bg-card backdrop-blur-sm">
      <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-primary">Turn Timer</CardTitle>
        <Tabs 
          defaultValue="active" 
          value={timerView} 
          onValueChange={(value) => setTimerView(value as 'active' | 'all')}
          className="w-auto"
        >
          <TabsList className="h-7 p-0.5">
            <TabsTrigger value="active" className="text-xs px-2 py-0.5">Active</TabsTrigger>
            <TabsTrigger value="all" className="text-xs px-2 py-0.5">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        {timerView === 'active' ? (
          <div className="flex justify-center mb-3">
            <div 
              className="p-2 min-w-[150px] rounded-md text-center bg-primary text-primary-foreground font-bold shadow"
            >
              <span className="block text-xs font-medium">{players[activePlayer]?.name || "Player 1"}</span>
              <span className="text-xl font-mono">{formatTime(times[activePlayer] || 0)}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {players.map((player, index) => (
              <div 
                key={player.id} 
                className={`p-2 min-w-[100px] rounded-md text-center transition-all duration-300 ${
                  index === activePlayer 
                    ? 'bg-primary text-primary-foreground font-bold shadow' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <span className="block text-xs font-medium">{player.name}</span>
                <span className="text-xl font-mono">{formatTime(times[index])}</span>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          onClick={resetTimers}
          variant="outline"
          size="sm"
          className="w-full text-sm"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Reset
        </Button>
      </CardContent>
    </Card>
  );
}

export default ChessTimer; 