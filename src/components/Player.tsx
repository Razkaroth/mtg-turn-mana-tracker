import React, { useState } from 'react';
import { PlayerData } from '../App';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, X } from "lucide-react";

interface ManaType {
  symbol: string;
  color: string;
  display: string;
  bgClassName: string; // Tailwind class for background
}

interface LandType {
  type: string;
  produces: string;
  symbol: string;
  bgClassName: string; // Tailwind class for background
}

interface PlayerProps {
  player: PlayerData;
  isActive: boolean;
  onUpdate: (updatedData: Partial<PlayerData>) => void;
  onRemove: () => void;
}

const MANA_TYPES: ManaType[] = [
  { symbol: 'W', color: 'white', display: '☀️', bgClassName: 'bg-muted' },
  { symbol: 'U', color: 'blue', display: '💧', bgClassName: 'bg-muted' },
  { symbol: 'B', color: 'black', display: '💀', bgClassName: 'bg-muted' },
  { symbol: 'R', color: 'red', display: '🔥', bgClassName: 'bg-muted' },
  { symbol: 'G', color: 'green', display: '🌳', bgClassName: 'bg-muted' },
  { symbol: 'C', color: 'colorless', display: '💎', bgClassName: 'bg-muted' }
];

const LAND_TYPES: LandType[] = [
  { type: 'Plains', produces: 'W', symbol: '☀️', bgClassName: 'bg-muted' },
  { type: 'Island', produces: 'U', symbol: '💧', bgClassName: 'bg-muted' },
  { type: 'Swamp', produces: 'B', symbol: '💀', bgClassName: 'bg-muted' },
  { type: 'Mountain', produces: 'R', symbol: '🔥', bgClassName: 'bg-muted' },
  { type: 'Forest', produces: 'G', symbol: '🌳', bgClassName: 'bg-muted' },
  { type: 'Wastes', produces: 'C', symbol: '💎', bgClassName: 'bg-muted' }
];

function Player({ player, isActive, onUpdate, onRemove }: PlayerProps) {
  const [nameEditing, setNameEditing] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(player.name);

  const updateLife = (amount: number) => {
    onUpdate({ life: player.life + amount });
  };

  const addLand = (landType: LandType) => {
    const newLand = { 
      id: Date.now(), 
      type: landType.type, 
      tapped: false, 
      produces: landType.produces 
    };
    onUpdate({ lands: [...player.lands, newLand] });
  };

  const removeLand = (landId: number) => {
    onUpdate({ lands: player.lands.filter(land => land.id !== landId) });
  };

  const toggleLand = (landId: number) => {
    const updatedLands = player.lands.map(land => {
      if (land.id === landId) {
        if (!land.tapped) {
          // When tapping a land, add mana to the pool
          const updatedManaPool = { ...player.manaPool };
          updatedManaPool[land.produces as keyof typeof updatedManaPool]++;
          onUpdate({ manaPool: updatedManaPool });
        }
        return { ...land, tapped: !land.tapped };
      }
      return land;
    });
    onUpdate({ lands: updatedLands });
  };

  const decrementMana = (manaType: string) => {
    if (player.manaPool[manaType as keyof typeof player.manaPool] > 0) {
      const updatedManaPool = { ...player.manaPool };
      updatedManaPool[manaType as keyof typeof updatedManaPool]--;
      onUpdate({ manaPool: updatedManaPool });
    }
  };

  const finishNameEdit = () => {
    onUpdate({ name: newName });
    setNameEditing(false);
  };

  return (
    <Card className={`mb-16 w-full ${
      isActive 
        ? 'border-primary ring-2 ring-primary/20' 
        : 'border-border'
    }`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          {nameEditing ? (
            <div className="w-full">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={finishNameEdit}
                onKeyDown={(e) => e.key === 'Enter' && finishNameEdit()}
                autoFocus
                className="max-w-[85%] h-8"
              />
            </div>
          ) : (
            <h2 
              onClick={() => setNameEditing(true)}
              className="text-lg font-bold cursor-pointer hover:text-primary transition-colors duration-200"
            >
              {player.name}
            </h2>
          )}
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-7 w-7 rounded-full"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="relative flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="text-destructive border-0 rounded-full h-10 w-10 -mr-1 z-10"
              onClick={() => updateLife(-1)}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <div className="flex-shrink-0 bg-muted rounded-full px-5 py-2 border border-border">
              <span className="text-2xl font-bold min-w-[50px] text-center">{player.life}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="text-primary border-0 rounded-full h-10 w-10 -ml-1 z-10"
              onClick={() => updateLife(1)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="lands" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="lands">Lands</TabsTrigger>
            <TabsTrigger value="mana">Mana Pool</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lands" className="mt-0">
            <div className="bg-card p-3 rounded-md border border-border mb-1.5">
              <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                {LAND_TYPES.map(land => (
                  <Button 
                    key={land.type} 
                    variant="outline"
                    size="icon"
                    className={`h-9 w-9 ${land.bgClassName} border-input`}
                    onClick={() => addLand(land)}
                  >
                    {land.symbol}
                  </Button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-1.5 justify-center">
                {player.lands.map(land => {
                  const landType = LAND_TYPES.find(l => l.type === land.type);
                  return (
                    <div 
                      key={land.id} 
                      className={`w-9 h-14 border border-input rounded-md flex items-center justify-center relative text-xl cursor-pointer bg-muted hover:bg-accent ${
                        land.tapped ? 'transform rotate-90 opacity-70' : 'hover:scale-105'
                      } transition-all duration-300`}
                      onClick={() => toggleLand(land.id)}
                    >
                      {landType?.symbol}
                      <Button 
                        variant="destructive"
                        size="icon"
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full opacity-0 hover:opacity-100 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLand(land.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="mana" className="mt-0">
            <div className="bg-card p-3 rounded-md border border-border mb-1.5">
              <div className="flex flex-wrap gap-1.5 justify-center">
                {MANA_TYPES.map(mana => (
                  <div 
                    key={mana.symbol} 
                    className={`flex flex-col items-center border border-input rounded-md p-1.5 min-w-[40px] ${mana.bgClassName}`}
                  >
                    <span className="text-lg">{mana.display}</span>
                    <span className="font-bold text-base my-0.5">{player.manaPool[mana.symbol as keyof typeof player.manaPool]}</span>
                    <Button 
                      variant="secondary"
                      size="sm"
                      className={`h-6 px-2 py-0 text-xs ${
                        player.manaPool[mana.symbol as keyof typeof player.manaPool] === 0 
                          ? 'opacity-50' 
                          : ''
                      }`}
                      onClick={() => decrementMana(mana.symbol)}
                      disabled={player.manaPool[mana.symbol as keyof typeof player.manaPool] === 0}
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default Player; 