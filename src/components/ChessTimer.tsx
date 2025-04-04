import React, { useState, useEffect, useRef } from 'react';
import { PlayerData } from '../App';

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
    <div className="bg-gray-200 rounded-lg p-4 mb-6 shadow-sm">
      <h3 className="text-center font-bold mb-4">Turn Timer</h3>
      
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {players.map((player, index) => (
          <div 
            key={player.id} 
            className={`bg-gray-300 rounded p-3 min-w-[100px] text-center ${index === activePlayer ? 'bg-yellow-400 font-bold' : ''}`}
          >
            <span className="block mb-1 text-sm">{player.name}</span>
            <span className="text-xl font-mono">{formatTime(times[index])}</span>
          </div>
        ))}
      </div>
      
      <button 
        onClick={resetTimers}
        className="block mx-auto bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-2"
      >
        Reset Timers
      </button>
    </div>
  );
}

export default ChessTimer; 