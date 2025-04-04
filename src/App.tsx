import React, { useState } from 'react'
import Player from './components/Player'
import ChessTimer from './components/ChessTimer'
import { Button } from "@/components/ui/button"
import { PlusCircle, Play, Pause, ArrowRight, ArrowLeft } from "lucide-react"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { PlayerSelector } from './components/PlayerSelector'
import { MainMenu } from './components/MainMenu'

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
  profileId?: string; // Link to profile id
}

function AppContent() {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<PlayerData[]>([
    { id: 1, name: 'Player 1', life: 20, lands: [], manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 } },
    { id: 2, name: 'Player 2', life: 20, lands: [], manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 } },
  ]);
  const [activePlayer, setActivePlayer] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [displayedPlayer, setDisplayedPlayer] = useState<number>(0);
  
  // Handle starting the game with configured players
  const handleStartGame = (configuredPlayers: PlayerData[]) => {
    setPlayers(configuredPlayers);
    setActivePlayer(0);
    setDisplayedPlayer(0);
    setGameStarted(true);
  };

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

  // If game hasn't started yet, show the main menu
  if (!gameStarted) {
    return <MainMenu onStartGame={handleStartGame} />;
  }

  // Game UI
  return (
    <div className="min-h-screen bg-background text-foreground p-4 pt-3 pb-0 font-sans flex flex-col justify-between">
      <div className="max-w-sm mx-auto w-full pb-20">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            MTG Companion
          </h1>
          <ThemeToggle />
        </div>
        
        <div className="flex justify-center gap-2 mb-3">
          <Button 
            onClick={addPlayer}
            variant="secondary"
            size="sm"
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Add
          </Button>
          <Button 
            onClick={() => setTimerRunning(!timerRunning)}
            variant={timerRunning ? "destructive" : "default"}
            size="sm"
            className="flex items-center gap-1"
          >
            {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {timerRunning ? 'Pause' : 'Start'}
          </Button>
          <Button 
            onClick={nextTurn}
            variant="default"
            size="sm"
            className="flex items-center gap-1"
          >
            <ArrowRight className="h-4 w-4" />
            Next Turn
          </Button>
        </div>
        
        <ChessTimer 
          players={players} 
          activePlayer={activePlayer} 
          running={timerRunning}
          onTurnEnd={nextTurn}
        />
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">Active:</span>
            <span className="text-sm font-bold">
              {players[activePlayer]?.name || "Player 1"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">Viewing:</span>
            <span className="text-sm font-bold">
              {players[displayedPlayer]?.name || "Player 1"}
            </span>
          </div>
        </div>
        
        {displayedPlayer !== activePlayer && (
          <Button
            onClick={() => setDisplayedPlayer(activePlayer)}
            variant="outline"
            size="sm"
            className="w-full mb-3 border-primary/30 text-primary flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Active Player
          </Button>
        )}
        
        {players.length > 0 && (
          <Player
            key={players[displayedPlayer].id}
            player={players[displayedPlayer]}
            isActive={displayedPlayer === activePlayer}
            onUpdate={(updatedData) => updatePlayer(players[displayedPlayer].id, updatedData)}
            onRemove={() => removePlayer(players[displayedPlayer].id)}
          />
        )}
      </div>
      
      <PlayerSelector
        players={players}
        displayedPlayer={displayedPlayer}
        activePlayer={activePlayer}
        onSelectPlayer={setDisplayedPlayer}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mtg-companion-theme">
      <AppContent />
    </ThemeProvider>
  )
}

export default App
