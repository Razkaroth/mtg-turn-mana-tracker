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
    <div className="max-w-6xl mx-auto p-4 font-sans">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">MTG Companion</h1>
      
      <div className="flex justify-center gap-4 mb-6">
        <button 
          onClick={addPlayer}
          className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
        >
          Add Player
        </button>
        <button 
          onClick={() => setTimerRunning(!timerRunning)}
          className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
        >
          {timerRunning ? 'Pause Timer' : 'Start Timer'}
        </button>
        <button 
          onClick={nextTurn}
          className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
        >
          Next Turn
        </button>
      </div>
      
      <ChessTimer 
        players={players} 
        activePlayer={activePlayer} 
        running={timerRunning}
        onTurnEnd={nextTurn}
      />
      
      <div className="flex flex-wrap gap-5 justify-center">
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
  )
}

export default App
