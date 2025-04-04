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
  const [displayedPlayer, setDisplayedPlayer] = useState<number>(0);
  
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
    if (players.length <= 1) return; // Prevent removing last player
    const indexToRemove = players.findIndex(p => p.id === id);
    setPlayers(players.filter(player => player.id !== id));
    
    // Update activePlayer and displayedPlayer if necessary
    if (indexToRemove <= activePlayer && activePlayer > 0) {
      setActivePlayer(activePlayer - 1);
    }
    if (indexToRemove <= displayedPlayer && displayedPlayer > 0) {
      setDisplayedPlayer(displayedPlayer - 1);
    }
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
    const nextActivePlayer = (activePlayer + 1) % players.length;
    setActivePlayer(nextActivePlayer);
    // Also display the new active player
    setDisplayedPlayer(nextActivePlayer);
  };

  const nextPlayer = () => {
    setDisplayedPlayer((displayedPlayer + 1) % players.length);
  };

  const prevPlayer = () => {
    setDisplayedPlayer((displayedPlayer - 1 + players.length) % players.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-4 font-sans text-gray-100 flex flex-col justify-between">
      <div className="max-w-sm mx-auto w-full">
        <h1 className="text-3xl font-bold text-center mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-500">
          MTG Companion
        </h1>
        
        <div className="flex justify-center gap-2 mb-3">
          <button 
            onClick={addPlayer}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-1 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
          <button 
            onClick={() => setTimerRunning(!timerRunning)}
            className={`font-semibold py-1.5 px-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-1 text-sm
              ${timerRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={timerRunning ? "M10 9v6m4-6v6M9 4h6v16H9V4z" : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"} />
            </svg>
            {timerRunning ? 'Pause' : 'Start'}
          </button>
          <button 
            onClick={nextTurn}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-1 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        
        {/* Display current player */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm text-amber-300 mr-2">Active Player:</span>
            <span className="text-sm font-bold">
              {players[activePlayer]?.name || "Player 1"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-amber-300 mr-2">Viewing Player:</span>
            <span className="text-sm font-bold">
              {players[displayedPlayer]?.name || "Player 1"}
            </span>
          </div>
        </div>
        
        {/* Only show the currently displayed player */}
        {players.length > 0 && (
          <Player
            key={players[displayedPlayer].id}
            player={players[displayedPlayer]}
            isActive={displayedPlayer === activePlayer}
            onUpdate={(updatedData) => updatePlayer(players[displayedPlayer].id, updatedData)}
            onRemove={() => removePlayer(players[displayedPlayer].id)}
            compact={true}
          />
        )}
      </div>
      
      {/* Player navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-gray-900/80 backdrop-blur-sm flex justify-center gap-4">
        <button 
          onClick={prevPlayer}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-2 rounded-lg shadow-lg flex-1 flex items-center justify-center max-w-[120px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>
        
        <div className="flex-1 max-w-[150px] text-center">
          <div className="text-xs text-gray-300">Player</div>
          <div className="text-lg font-bold text-amber-300">{displayedPlayer + 1} / {players.length}</div>
        </div>
        
        <button 
          onClick={nextPlayer}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-2 rounded-lg shadow-lg flex-1 flex items-center justify-center max-w-[120px]"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default App
