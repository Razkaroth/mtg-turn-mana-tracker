import React, { useState } from 'react';
import { PlayerData } from '../../types';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, X, Ghost, Edit, Droplet } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<string>("lands");

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

  const removeLand = (landType: string) => {
    // Find the first land of the specified type
    const landToRemove = player.lands.find(land => land.type === landType);
    if (!landToRemove) return;
    
    // Remove that land
    onUpdate({ lands: player.lands.filter(land => land.id !== landToRemove.id) });
  };

  const toggleLand = (landId: number) => {
    // Only toggle the visual state of the land (tapped/untapped)
    // No longer adds mana to the pool - that happens automatically at turn start
    const updatedLands = player.lands.map(land => {
      if (land.id === landId) {
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

  const incrementMana = (manaType: string) => {
    const updatedManaPool = { ...player.manaPool };
    updatedManaPool[manaType as keyof typeof updatedManaPool]++;
    onUpdate({ manaPool: updatedManaPool });
  };

  const untapAllLands = () => {
    const updatedLands = player.lands.map(land => ({
      ...land,
      tapped: false
    }));
    onUpdate({ lands: updatedLands });
  };

  const finishNameEdit = () => {
    onUpdate({ name: newName });
    setNameEditing(false);
  };

  // Helper to count total mana
  const totalMana = Object.values(player.manaPool).reduce((sum, count) => sum + count, 0);

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

        {/* Life counter */}
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="mb-4 flex justify-center"
        >
          <div className="flex items-center justify-center gap-3 p-1">
            <Button
              variant="outline"
              size="icon"
              className="text-destructive border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 rounded-full h-9 w-9 transition-colors"
              onClick={() => updateLife(-1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="flex-shrink-0 bg-gradient-to-br from-card to-background px-5 py-2 rounded-full border border-border/60 min-w-[90px] text-center">
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
              className="text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-full h-9 w-9 transition-colors"
              onClick={() => updateLife(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs 
          defaultValue="lands" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-2 bg-muted/50">
            <TabsTrigger 
              value="lands" 
              className={activeTab === "lands" ? "data-[state=active]:bg-card" : ""}
            >
              Lands
            </TabsTrigger>
            <TabsTrigger 
              value="mana" 
              className={`${totalMana > 0 ? "after:content-[''] after:absolute after:right-2 after:top-1.5 after:h-2 after:w-2 after:rounded-full after:bg-primary after:animate-pulse" : ""} ${activeTab === "mana" ? "data-[state=active]:bg-card" : ""}`}
            >
              Mana Pool
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="lands" className="mt-0 rounded-md bg-card/30 pt-3 px-3 pb-2">
            {/* Land type buttons */}
            <div className="bg-card/60 p-3 rounded-md border border-border/30 mb-1.5">
              <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                {LAND_TYPES.map(land => (
                  <Button 
                    key={land.type} 
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${land.bgClassName} hover:bg-background hover:scale-110 transition-all duration-200 focus:ring-1 focus:ring-border`}
                    onClick={() => addLand(land)}
                    title={land.type}
                  >
                    <span className={land.iconColor}>{land.symbol}</span>
                  </Button>
                ))}
              </div>
              
              {player.lands.length > 0 && (
                <div className="flex justify-end mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                    onClick={untapAllLands}
                  >
                    Untap All
                  </Button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-1.5 justify-center">
                {player.lands.map(land => {
                  const landType = LAND_TYPES.find(l => l.type === land.type);
                  return (
                    <div 
                      key={land.id} 
                      className={`w-9 h-14 border border-input rounded-md flex items-center justify-center relative text-xl cursor-pointer ${landType?.bgClassName || 'bg-muted'} hover:bg-background ${
                        land.tapped ? 'transform rotate-90 opacity-70' : 'hover:scale-105'
                      } transition-all duration-300`}
                      onClick={() => toggleLand(land.id)}
                      title={land.tapped ? `Tapped ${land.type}` : `Untapped ${land.type}`}
                    >
                      <span className={landType?.iconColor || ''}>{landType?.symbol}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Add Remove Land section - only visible if there are lands */}
              {player.lands.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/30">
                  <div className="text-xs text-muted-foreground mb-2 text-center">Remove Lands</div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {/* Create a count of each land type */}
                    {Array.from(new Set(player.lands.map(land => land.type))).map(landType => {
                      const count = player.lands.filter(land => land.type === landType).length;
                      const landInfo = LAND_TYPES.find(l => l.type === landType);
                      return (
                        <Button 
                          key={landType} 
                          variant="outline"
                          size="sm"
                          className={`h-7 px-2 flex items-center gap-1 ${landInfo?.bgClassName} border-input hover:bg-background`}
                          onClick={() => removeLand(landType)}
                          title={`Remove 1 ${landType}`}
                        >
                          <span className={landInfo?.iconColor}>{landInfo?.symbol}</span>
                          <span className="text-xs font-medium">{count}</span>
                          <Minus className="h-3 w-3 ml-1 text-destructive" />
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {player.lands.length > 0 && (
                <div className="mt-3 pt-2 border-t border-border/30 text-center text-xs text-muted-foreground">
                  <p>Lands are auto-tapped at the beginning of your turn to fill your mana pool.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="mana" className="mt-0 rounded-md bg-card/30 pt-3 px-3 pb-2">
            {totalMana === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <Droplet className="h-5 w-5 mx-auto mb-1 opacity-40" />
                <p>Your mana pool is empty</p>
                <p className="text-xs mt-1">Tap lands to add mana</p>
              </div>
            ) : (
              <div className="bg-card/60 p-3 rounded-md border border-border/30 mb-1.5">
                <div className="flex flex-wrap gap-2 justify-center">
                  {MANA_TYPES.map(mana => (
                    <div 
                      key={mana.symbol} 
                      className={`flex flex-col items-center border border-border/40 rounded-md p-2 min-w-[70px] ${mana.bgClassName}`}
                    >
                      <span className="text-lg">{mana.display}</span>
                      <span className={`font-bold text-xl my-1 ${mana.iconColor}`}>
                        {player.manaPool[mana.symbol as keyof typeof player.manaPool]}
                      </span>
                      <div className="flex gap-1 mt-1">
                        <Button 
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 bg-destructive/10 hover:bg-destructive/20 text-destructive ${
                            player.manaPool[mana.symbol as keyof typeof player.manaPool] === 0 
                              ? 'opacity-50 cursor-not-allowed' 
                              : ''
                          }`}
                          onClick={() => decrementMana(mana.symbol)}
                          disabled={player.manaPool[mana.symbol as keyof typeof player.manaPool] === 0}
                          title="Use mana"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 bg-primary/10 hover:bg-primary/20 text-primary"
                          onClick={() => incrementMana(mana.symbol)}
                          title="Add mana"
                        >
                          <Plus className="h-3 w-3" />
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
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Player; 