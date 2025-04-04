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
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 mb-8 shadow-xl border border-gray-700">
      <h3 className="text-center font-bold text-xl mb-5 text-amber-300">Turn Timer</h3>
      
      <div className="flex flex-wrap justify-center gap-3 mb-5">
        {players.map((player, index) => (
          <div 
            key={player.id} 
            className={`p-3 min-w-[130px] rounded-lg text-center transition-all duration-300 transform ${
              index === activePlayer 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 font-bold shadow-lg scale-105' 
                : 'bg-gray-700 text-gray-200'
            }`}
          >
            <span className="block mb-1 text-sm font-medium">{player.name}</span>
            <span className="text-2xl font-mono">{formatTime(times[index])}</span>
          </div>
        ))}
      </div>
      
      <button 
        onClick={resetTimers}
        className="block mx-auto bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg px-4 py-2 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset Timers
      </button>
    </div>
  );
}

export default ChessTimer; 