import React, { useState } from 'react';
import { PlayerData } from '../../types';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, X, Ghost, Edit, Droplet, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface ManaType {
  symbol: string;
  color: string;
  display: string;
  bgClassName: string; // Tailwind class for background
  iconColor: string; // Text color for the icon
}

interface LandType {
  type: string;
  produces: string;
  symbol: string;
  bgClassName: string; // Tailwind class for background
  iconColor: string; // Text color for the icon
}

interface PlayerProps {
  player: PlayerData;
  isActive: boolean;
  onUpdate: (updatedData: Partial<PlayerData>) => void;
  onRemove: () => void;
  isMinimal?: boolean; // For minimal display of phantom players
}

const MANA_TYPES: ManaType[] = [
  { symbol: 'W', color: 'white', display: '☀️', bgClassName: 'bg-amber-50', iconColor: 'text-amber-600' },
  { symbol: 'U', color: 'blue', display: '💧', bgClassName: 'bg-blue-50', iconColor: 'text-blue-600' },
  { symbol: 'B', color: 'black', display: '💀', bgClassName: 'bg-neutral-100', iconColor: 'text-neutral-600' },
  { symbol: 'R', color: 'red', display: '🔥', bgClassName: 'bg-red-50', iconColor: 'text-red-600' },
  { symbol: 'G', color: 'green', display: '🌳', bgClassName: 'bg-green-50', iconColor: 'text-green-600' },
  { symbol: 'C', color: 'colorless', display: '💎', bgClassName: 'bg-purple-50', iconColor: 'text-purple-600' }
];

const LAND_TYPES: LandType[] = [
  { type: 'Plains', produces: 'W', symbol: '☀️', bgClassName: 'bg-amber-50', iconColor: 'text-amber-600' },
  { type: 'Island', produces: 'U', symbol: '💧', bgClassName: 'bg-blue-50', iconColor: 'text-blue-600' },
  { type: 'Swamp', produces: 'B', symbol: '💀', bgClassName: 'bg-neutral-100', iconColor: 'text-neutral-600' },
  { type: 'Mountain', produces: 'R', symbol: '🔥', bgClassName: 'bg-red-50', iconColor: 'text-red-600' },
  { type: 'Forest', produces: 'G', symbol: '🌳', bgClassName: 'bg-green-50', iconColor: 'text-green-600' },
  { type: 'Wastes', produces: 'C', symbol: '💎', bgClassName: 'bg-purple-50', iconColor: 'text-purple-600' }
];

const Player: React.FC<PlayerProps> = ({ 
  player, 
  isActive, 
  onUpdate, 
  onRemove,
  isMinimal = false 
}) => {
  const [nameEditing, setNameEditing] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(player.name);
  const [activeTab, setActiveTab] = useState<string>("mana");

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

  // Function to remove the first land of a specific type
  const removeLandByType = (landType: string) => {
    // Find the first land of the specified type
    const landToRemove = player.lands.find(land => land.type === landType);
    if (landToRemove) {
      // Remove that land
      removeLand(landToRemove.id);
    }
  };

  const toggleLand = (landId: number) => {
    // Get the land being toggled
    const land = player.lands.find(l => l.id === landId);
    if (!land) return;

    // If we're tapping the land (currently untapped), add mana to the pool
    if (!land.tapped) {
      const updatedManaPool = { ...player.manaPool };
      updatedManaPool[land.produces as keyof typeof updatedManaPool]++;
      
      // Update mana pool and toggle the land
      onUpdate({ 
        manaPool: updatedManaPool,
        lands: player.lands.map(l => {
          if (l.id === landId) {
            return { ...l, tapped: true };
          }
          return l;
        })
      });
    } else {
      // Just toggle the land to untapped without affecting mana pool
      onUpdate({
        lands: player.lands.map(l => {
          if (l.id === landId) {
            return { ...l, tapped: false };
          }
          return l;
        })
      });
    }
  };

  const decrementMana = (manaType: string) => {
    if (player.manaPool[manaType as keyof typeof player.manaPool] > 0) {
      const updatedManaPool = { ...player.manaPool };
      updatedManaPool[manaType as keyof typeof updatedManaPool]--;
      onUpdate({ manaPool: updatedManaPool });
    }
  };

  const incrementMana = (manaType: string) => {
    const updatedManaPool = { ...player.manaPool };
    updatedManaPool[manaType as keyof typeof updatedManaPool]++;
    onUpdate({ manaPool: updatedManaPool });
  };

  const finishNameEdit = () => {
    onUpdate({ name: newName });
    setNameEditing(false);
  };

  // Helper to count total mana
  const totalMana = Object.values(player.manaPool).reduce((sum, count) => sum + count, 0);

  // Get counts of each land type
  const landCounts = player.lands.reduce((counts: Record<string, number>, land) => {
    counts[land.type] = (counts[land.type] || 0) + 1;
    return counts;
  }, {});

  // If minimal display is requested (for phantom players), show a simplified card
  if (isMinimal) {
    return (
      <Card className={`mb-3 w-full overflow-hidden transition-all duration-200 ${
        isActive 
          ? 'border-primary shadow-md shadow-primary/10' 
          : 'border-transparent bg-card/60'
      }`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ghost className="h-4 w-4 text-muted-foreground/60" />
              <h3 className="text-md font-medium">{player.name}</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground">Life:</span>
                <span className="font-semibold">{player.life}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mb-6 w-full overflow-hidden border transition-all duration-300 ${
      isActive 
        ? 'border-primary/40 shadow-md shadow-primary/10' 
        : 'border-border/40'
    }`}>
      <CardContent className="pt-4 px-4 pb-3">
        <div className="flex justify-between items-center mb-4 group">
          {nameEditing ? (
            <div className="w-full">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={finishNameEdit}
                onKeyDown={(e) => e.key === 'Enter' && finishNameEdit()}
                autoFocus
                className="h-8 border-primary/30 focus-visible:ring-primary/20"
              />
            </div>
          ) : (
            <h2 
              onClick={() => setNameEditing(true)}
              className="text-lg font-bold cursor-pointer hover:text-primary transition-colors duration-200 flex items-center gap-1.5"
            >
              {player.name}
              <Edit className="h-3.5 w-3.5 opacity-0 group-hover:opacity-70 transition-opacity" />
            </h2>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Life counter - ENHANCED */}
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="mb-4 flex justify-center"
        >
          <div className="flex items-center justify-center gap-3 p-1">
            <Button
              variant="outline"
              size="icon"
              className="text-destructive border-2 border-destructive/30 bg-destructive/10 hover:bg-destructive/20 hover:border-destructive/50 rounded-full h-12 w-12 transition-colors shadow-sm"
              onClick={() => updateLife(-1)}
            >
              <Minus className="h-5 w-5" />
            </Button>
            
            <div className="flex-shrink-0 bg-gradient-to-br from-card to-background px-6 py-2.5 rounded-full border-2 border-border/60 min-w-[100px] text-center shadow-sm">
              <motion.span 
                key={player.life}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-bold text-foreground"
              >
                {player.life}
              </motion.span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="text-primary border-2 border-primary/30 bg-primary/10 hover:bg-primary/20 hover:border-primary/50 rounded-full h-12 w-12 transition-colors shadow-sm"
              onClick={() => updateLife(1)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs 
          defaultValue="mana" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-2 bg-muted/50 h-12">
            <TabsTrigger 
              value="mana" 
              className={`text-base py-3 ${totalMana > 0 ? "after:content-[''] after:absolute after:right-2 after:top-1.5 after:h-3 after:w-3 after:rounded-full after:bg-primary after:animate-pulse" : ""} ${activeTab === "mana" ? "data-[state=active]:bg-card" : ""}`}
            >
              Mana Pool
            </TabsTrigger>
            <TabsTrigger 
              value="lands" 
              className={`text-base py-3 ${activeTab === "lands" ? "data-[state=active]:bg-card" : ""}`}
            >
              Lands
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mana" className="mt-0 rounded-md bg-card/30 pt-3 px-3 pb-2">
            {totalMana === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <Droplet className="h-6 w-6 mx-auto mb-2 opacity-40" />
                <p className="text-base">Your mana pool is empty</p>
                <p className="text-sm mt-1.5">Tap lands to add mana</p>
              </div>
            ) : (
              <div className="bg-card/60 p-3 rounded-md border border-border/30 mb-1.5">
                <div className="flex flex-wrap gap-2 justify-center">
                  {MANA_TYPES.map(mana => (
                    <div 
                      key={mana.symbol} 
                      className={`flex flex-col items-center border-2 border-border/40 rounded-md p-2.5 min-w-[80px] ${mana.bgClassName}`}
                    >
                      <span className="text-xl">{mana.display}</span>
                      <span className={`font-bold text-2xl my-1.5 ${mana.iconColor}`}>
                        {player.manaPool[mana.symbol as keyof typeof player.manaPool]}
                      </span>
                      <div className="flex gap-2 mt-1 w-full">
                        <Button 
                          variant="ghost"
                          size="icon"
                          className={`h-10 w-10 bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/20 hover:border-destructive/40 ${
                            player.manaPool[mana.symbol as keyof typeof player.manaPool] === 0 
                              ? 'opacity-50 cursor-not-allowed' 
                              : ''
                          }`}
                          onClick={() => decrementMana(mana.symbol)}
                          disabled={player.manaPool[mana.symbol as keyof typeof player.manaPool] === 0}
                          title="Use mana"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 hover:border-primary/40"
                          onClick={() => incrementMana(mana.symbol)}
                          title="Add mana"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-2 border-t border-border/30 text-center text-xs text-muted-foreground">
                  <p>Your mana pool is filled at the beginning of your turn based on your lands.</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="lands" className="mt-0 rounded-md bg-card/30 pt-3 px-3 pb-2">
            {/* Land type buttons - ENHANCED */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {LAND_TYPES.map(land => (
                <Button 
                  key={land.type} 
                  variant="ghost"
                  size="icon"
                  className={`h-11 w-11 ${land.bgClassName} border-2 border-border/40 hover:border-primary/40 hover:bg-background hover:scale-105 transition-all duration-200 shadow-sm`}
                  onClick={() => addLand(land)}
                  title={land.type}
                >
                  <span className={`text-lg ${land.iconColor}`}>{land.symbol}</span>
                </Button>
              ))}
            </div>
            
            {/* Lands display */}
            <div className="flex flex-wrap gap-2 justify-center">
              {player.lands.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4">
                  No lands yet. Add some above.
                </div>
              ) : (
                player.lands.map(land => {
                  const landType = LAND_TYPES.find(l => l.type === land.type);
                  return (
                    <motion.div 
                      key={land.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: land.tapped ? 1.05 : 1.1 }}
                      className={`w-11 h-14 border-2 border-input/40 rounded-md flex items-center justify-center relative cursor-pointer group ${landType?.bgClassName} ${
                        land.tapped 
                          ? 'transform rotate-90 opacity-70 hover:opacity-90' 
                          : 'hover:border-input hover:shadow-md'
                      } transition-all duration-300`}
                      onClick={() => toggleLand(land.id)}
                    >
                      <span className={`text-lg ${landType?.iconColor || ''}`}>{landType?.symbol}</span>
                      <Button 
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 p-0 border border-destructive/30 hover:border-destructive shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLand(land.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  );
                })
              )}
            </div>
            
            {/* Remove Lands section - ENHANCED */}
            {player.lands.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border/30">
                <h3 className="text-base font-medium text-center mb-3 flex items-center justify-center gap-1.5">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                  Remove Lands
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {LAND_TYPES.map(land => {
                    const count = landCounts[land.type] || 0;
                    // Only show buttons for land types the player has
                    if (count === 0) return null;
                    
                    return (
                      <Button
                        key={`remove-${land.type}`}
                        variant="outline"
                        size="default"
                        className={`h-11 py-2 px-3 ${land.bgClassName} border-2 border-border/40 hover:bg-destructive/10 hover:border-destructive/40 shadow-sm`}
                        onClick={() => removeLandByType(land.type)}
                      >
                        <span className={`mr-2 text-lg ${land.iconColor}`}>{land.symbol}</span>
                        <span className="text-sm font-medium">
                          {count}
                        </span>
                      </Button>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground text-center mt-3 mb-1">
                  Click to remove one land of that type
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Player; 