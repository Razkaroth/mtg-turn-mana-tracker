import React, { useState } from 'react';
import { PlayerData } from '../App';
import { Button } from "@/components/ui/button";
import { User, Crown, Heart, Zap, Palmtree, ArrowLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface PlayerSelectorProps {
  players: PlayerData[];
  displayedPlayer: number;
  activePlayer: number;
  onSelectPlayer: (index: number) => void;
}

export function PlayerSelector({ 
  players, 
  displayedPlayer, 
  activePlayer, 
  onSelectPlayer 
}: PlayerSelectorProps) {
  const currentPlayer = players[displayedPlayer];
  const [open, setOpen] = useState(false);
  
  const handleSelectPlayer = (index: number) => {
    onSelectPlayer(index);
    setOpen(false);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full rounded-none p-3 h-auto flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              {displayedPlayer === activePlayer ? (
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Crown className="h-5 w-5" />
                </div>
              ) : (
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground">
                  {displayedPlayer === activePlayer ? "Active Player" : "Viewing Player"}
                </span>
                <span className="font-bold text-lg text-primary">
                  {currentPlayer.name}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground mb-1">
                {displayedPlayer + 1} of {players.length}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-destructive" />
                  {currentPlayer.life}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-primary" />
                  {Object.values(currentPlayer.manaPool).reduce((a, b) => a + b, 0)}
                </span>
                <span className="flex items-center gap-1">
                  <Palmtree className="h-3 w-3 text-muted-foreground" />
                  {currentPlayer.lands.length}
                </span>
              </div>
            </div>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="px-0 pt-0 max-h-[70vh]">
          <SheetHeader className="px-4 py-3 border-b border-border sticky top-0 bg-background z-10">
            <SheetTitle>Select Player</SheetTitle>
          </SheetHeader>
          
          {displayedPlayer !== activePlayer && (
            <div className="p-2 pt-3 pb-2 border-b border-border bg-accent/30">
              <Button
                onClick={() => handleSelectPlayer(activePlayer)}
                variant="secondary"
                className="w-full text-primary flex items-center justify-center gap-1 border border-primary/30"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Active Player ({players[activePlayer]?.name})
              </Button>
            </div>
          )}
          
          <div className="p-2 overflow-auto">
            {players.map((player, index) => (
              <Button
                key={player.id}
                variant="ghost"
                className={`w-full justify-start mb-1 p-3 h-auto ${
                  index === displayedPlayer 
                    ? 'bg-accent' 
                    : index === activePlayer 
                      ? 'border border-primary border-dashed' 
                      : ''
                }`}
                onClick={() => handleSelectPlayer(index)}
              >
                <div className="flex items-center w-full">
                  <div className="mr-3">
                    {index === activePlayer ? (
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Crown className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold">{player.name}</span>
                      {index === activePlayer && (
                        <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-destructive" /> {player.life}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-primary" /> 
                        {Object.values(player.manaPool).reduce((a, b) => a + b, 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Palmtree className="h-3 w-3 text-muted-foreground" /> 
                        {player.lands.length}
                      </span>
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 