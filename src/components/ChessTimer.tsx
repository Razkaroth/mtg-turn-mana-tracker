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
  const [showAllTimers, setShowAllTimers] = useState<boolean>(false);

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
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 mb-4 shadow-xl border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-bold text-amber-300">Turn Timer</h3>
        <button 
          onClick={() => setShowAllTimers(!showAllTimers)}
          className="text-xs text-gray-400 hover:text-gray-300"
        >
          {showAllTimers ? 'Show Less' : 'Show All'}
        </button>
      </div>
      
      {showAllTimers ? (
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {players.map((player, index) => (
            <div 
              key={player.id} 
              className={`p-2 min-w-[100px] rounded-lg text-center transition-all duration-300 ${
                index === activePlayer 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 font-bold shadow' 
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              <span className="block text-xs font-medium">{player.name}</span>
              <span className="text-xl font-mono">{formatTime(times[index])}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center mb-3">
          <div 
            className="p-2 min-w-[150px] rounded-lg text-center bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 font-bold shadow"
          >
            <span className="block text-xs font-medium">{players[activePlayer]?.name || "Player 1"}</span>
            <span className="text-xl font-mono">{formatTime(times[activePlayer] || 0)}</span>
          </div>
        </div>
      )}
      
      <button 
        onClick={resetTimers}
        className="block mx-auto bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg px-3 py-1.5 text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-1 mx-auto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset
      </button>
    </div>
  );
}

export default ChessTimer; 