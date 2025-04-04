import React, { useState } from 'react'
import Player from './components/Player'
import ChessTimer from './components/ChessTimer'

// Define our types
interface Land {
  id: number;
  type: string;
  tapped: boolean;
  produces: string;
}

interface ManaPool {
  W: number;
  U: number;
  B: number;
  R: number;
  G: number;
  C: number;
}

export interface PlayerData {
  id: number;
  name: string;
  life: number;
  lands: Land[];
  manaPool: ManaPool;
}

function App() {
  const [players, setPlayers] = useState<PlayerData[]>([
    { id: 1, name: 'Player 1', life: 20, lands: [], manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 } },
    { id: 2, name: 'Player 2', life: 20, lands: [], manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 } },
  ]);
  const [activePlayer, setActivePlayer] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  
  const addPlayer = () => {
    const newId = players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
    setPlayers([...players, { 
      id: newId, 
      name: `Player ${newId}`, 
      life: 20, 
      lands: [], 
      manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 } 
    }]);
  };

  const removePlayer = (id: number) => {
    setPlayers(players.filter(player => player.id !== id));
  };

  const updatePlayer = (id: number, updatedData: Partial<PlayerData>) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, ...updatedData } : player
    ));
  };

  const nextTurn = () => {
    // Reset mana pool for current player
    const updatedPlayers = [...players];
    updatedPlayers[activePlayer] = {
      ...updatedPlayers[activePlayer],
      manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }
    };
    setPlayers(updatedPlayers);
    
    // Move to next player
    setActivePlayer((activePlayer + 1) % players.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-6 font-sans text-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-500">
          MTG Companion
        </h1>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button 
            onClick={addPlayer}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Player
          </button>
          <button 
            onClick={() => setTimerRunning(!timerRunning)}
            className={`font-semibold py-2 px-5 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2
              ${timerRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={timerRunning ? "M10 9v6m4-6v6M9 4h6v16H9V4z" : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"} />
            </svg>
            {timerRunning ? 'Pause Timer' : 'Start Timer'}
          </button>
          <button 
            onClick={nextTurn}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-5 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Next Turn
          </button>
        </div>
        
        <ChessTimer 
          players={players} 
          activePlayer={activePlayer} 
          running={timerRunning}
          onTurnEnd={nextTurn}
        />
        
        <div className="flex flex-wrap gap-6 justify-center">
          {players.map((player, index) => (
            <Player
              key={player.id}
              player={player}
              isActive={index === activePlayer}
              onUpdate={(updatedData) => updatePlayer(player.id, updatedData)}
              onRemove={() => removePlayer(player.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
