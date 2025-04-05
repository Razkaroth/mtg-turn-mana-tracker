import React, { useState } from 'react';
import { usePlayer } from '../../hooks/usePlayer';
import { Land, ManaType as GameManaType } from '../../types';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, X, Ghost, Edit, Droplet, Trash2, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ManaDisplay {
  symbol: string;
  color: string;
  display: string;
  bgClassName: string; // Tailwind class for background
  iconColor: string; // Text color for the icon
}

interface LandDisplay {
  type: string;
  produces: GameManaType;
  symbol: string;
  bgClassName: string; // Tailwind class for background
  iconColor: string; // Text color for the icon
}

interface PlayerProps {
  playerId: number;
  isActive: boolean;
  onRemove: () => void;
  isMinimal?: boolean; // For minimal display of phantom players
}

const MANA_TYPES: ManaDisplay[] = [
  { symbol: 'W', color: 'white', display: '☀️', bgClassName: 'bg-gradient-to-b from-amber-50 to-amber-100/70', iconColor: 'text-amber-600' },
  { symbol: 'U', color: 'blue', display: '💧', bgClassName: 'bg-gradient-to-b from-blue-50 to-blue-100/70', iconColor: 'text-blue-600' },
  { symbol: 'B', color: 'black', display: '💀', bgClassName: 'bg-gradient-to-b from-neutral-100 to-neutral-200/70', iconColor: 'text-neutral-700' },
  { symbol: 'R', color: 'red', display: '🔥', bgClassName: 'bg-gradient-to-b from-red-50 to-red-100/70', iconColor: 'text-red-600' },
  { symbol: 'G', color: 'green', display: '🌳', bgClassName: 'bg-gradient-to-b from-green-50 to-green-100/70', iconColor: 'text-green-600' },
  { symbol: 'C', color: 'colorless', display: '💠', bgClassName: 'bg-gradient-to-b from-purple-50 to-purple-100/70', iconColor: 'text-purple-600' }
];

const LAND_TYPES: LandDisplay[] = [
  { type: 'Plains', produces: 'W', symbol: '☀️', bgClassName: 'bg-gradient-to-b from-amber-50 to-amber-100/70', iconColor: 'text-amber-600' },
  { type: 'Island', produces: 'U', symbol: '💧', bgClassName: 'bg-gradient-to-b from-blue-50 to-blue-100/70', iconColor: 'text-blue-600' },
  { type: 'Swamp', produces: 'B', symbol: '💀', bgClassName: 'bg-gradient-to-b from-neutral-100 to-neutral-200/70', iconColor: 'text-neutral-700' },
  { type: 'Mountain', produces: 'R', symbol: '🔥', bgClassName: 'bg-gradient-to-b from-red-50 to-red-100/70', iconColor: 'text-red-600' },
  { type: 'Forest', produces: 'G', symbol: '🌳', bgClassName: 'bg-gradient-to-b from-green-50 to-green-100/70', iconColor: 'text-green-600' },
  { type: 'Wastes', produces: 'C', symbol: '💠', bgClassName: 'bg-gradient-to-b from-purple-50 to-purple-100/70', iconColor: 'text-purple-600' }
];

const Player: React.FC<PlayerProps> = ({ 
  playerId, 
  isActive, 
  onRemove,
  isMinimal = false 
}) => {
  // Use our custom hook to get player data and actions
  const {
    player,
    updateLife,
    addLand,
    removeLand,
    toggleLand,
    decrementMana,
    incrementMana,
    updateName,
    totalMana,
    landCounts
  } = usePlayer(playerId);

  const [nameEditing, setNameEditing] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(player.name);
  const [activeTab, setActiveTab] = useState<string>("mana");
  const [tappedLandId, setTappedLandId] = useState<number | null>(null);

  const handleAddLand = (landType: LandDisplay) => {
    addLand(landType.type, landType.produces);
  };

  const handleRemoveLand = (landId: number) => {
    removeLand(landId);
  };

  // Function to remove the first land of a specific type with animation
  const handleRemoveLandByType = (landType: string) => {
    // Find the first land of the specified type
    const landToRemove = player.lands.find((land: Land) => land.type === landType);
    if (landToRemove) {
      // Trigger visual effect
      setTappedLandId(landToRemove.id);
      
      // Remove that land after a short delay for visual feedback
      setTimeout(() => {
        removeLand(landToRemove.id);
        setTappedLandId(null);
      }, 300);
    }
  };

  const handleToggleLand = (landId: number) => {
    // Trigger the animation
    setTappedLandId(landId);
    
    // Toggle the land
    toggleLand(landId);
    
    // Reset the animation trigger after animation completes
    setTimeout(() => setTappedLandId(null), 500);
  };

  const finishNameEdit = () => {
    updateName(newName);
    setNameEditing(false);
  };

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
    <Card className={`mb-6 w-full overflow-hidden border-2 transition-all duration-300 ${
      isActive 
        ? 'border-primary/50 shadow-lg shadow-primary/10 bg-gradient-to-b from-background to-card/90' 
        : 'border-border/50 shadow-md bg-gradient-to-b from-background to-muted/10'
    }`}>
      <CardContent className="pt-5 px-4 pb-4">
        <div className="flex justify-between items-center mb-5 group relative">
          {nameEditing ? (
            <div className="w-full">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={finishNameEdit}
                onKeyDown={(e) => e.key === 'Enter' && finishNameEdit()}
                autoFocus
                className="h-9 border-primary/30 focus-visible:ring-primary/20 text-lg font-medium"
              />
            </div>
          ) : (
            <motion.h2 
              onClick={() => setNameEditing(true)}
              className="text-xl font-bold cursor-pointer hover:text-primary transition-colors duration-200 flex items-center gap-1.5"
              whileHover={{ scale: 1.01, x: 3 }}
              style={{
                paddingLeft: isActive ? '12px' : '0px'
              }}
            >
              {isActive && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  className="absolute -left-2 top-1 text-primary"
                >
                  <Star className="h-4 w-4 fill-primary" />
                </motion.span>
              )}
              {player.name}
              <Edit className="h-3.5 w-3.5 opacity-0 group-hover:opacity-70 transition-opacity" />
            </motion.h2>
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
          className="mb-5 flex justify-center"
        >
          <div className="flex items-center justify-center gap-4 p-1">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive border-2 border-destructive/30 bg-destructive/10 hover:bg-destructive/20 hover:border-destructive/60 rounded-full h-12 w-12 transition-colors shadow-md"
                onClick={() => updateLife(-1)}
              >
                <Minus className="h-5 w-5" />
              </Button>
            </motion.div>
            
            <div className="flex-shrink-0 bg-gradient-to-br from-card via-background to-card px-6 py-2.5 rounded-full border-2 border-border/60 min-w-[100px] text-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-primary/5 pointer-events-none"></div>
              <motion.span 
                key={player.life}
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                className="text-2xl font-bold text-foreground relative z-10"
              >
                {player.life}
              </motion.span>
            </div>
            
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                className="text-primary border-2 border-primary/30 bg-primary/10 hover:bg-primary/20 hover:border-primary/60 rounded-full h-12 w-12 transition-colors shadow-md"
                onClick={() => updateLife(1)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs 
          defaultValue="mana" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-3 bg-muted/80 rounded-xl h-12 p-1">
            <TabsTrigger 
              value="mana" 
              className={`text-base font-medium rounded-lg ${
                totalMana > 0 
                  ? "after:content-[''] after:absolute after:right-2 after:top-2 after:h-3 after:w-3 after:rounded-full after:bg-primary after:animate-pulse" 
                  : ""
              } ${
                activeTab === "mana" 
                  ? "data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary" 
                  : ""
              }`}
            >
              Mana Pool
            </TabsTrigger>
            <TabsTrigger 
              value="lands" 
              className={`text-base font-medium rounded-lg ${
                activeTab === "lands" 
                  ? "data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary" 
                  : ""
              }`}
            >
              Lands
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mana" className="mt-0 rounded-xl bg-card/50 backdrop-blur-sm pt-4 px-4 pb-3 border border-border/30 shadow-sm">
            <AnimatePresence mode="wait">
              {totalMana === 0 ? (
                <motion.div 
                  key="empty-mana"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-sm text-muted-foreground"
                >
                  <Droplet className="h-7 w-7 mx-auto mb-3 opacity-40" />
                  <p className="text-base font-medium">Your mana pool is empty</p>
                  <p className="text-sm mt-2">Tap lands to add mana</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="mana-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap gap-4 justify-center"
                >
                  {MANA_TYPES.map(mana => (
                    <motion.div 
                      key={mana.symbol}
                      initial={{ scale: 0.95, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      className={`flex flex-col items-center border-2 border-border/40 rounded-xl overflow-hidden ${mana.bgClassName} shadow-md min-w-[100px]`}
                    >
                      <div className="w-full text-center py-2 bg-background/10 backdrop-blur-sm border-b border-border/30">
                        <span className="text-2xl">{mana.display}</span>
                      </div>
                      <div className="py-3 flex-1 flex flex-col items-center justify-center w-full px-4">
                        <motion.span 
                          key={player.manaPool[mana.symbol as keyof typeof player.manaPool]}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`font-bold text-3xl ${mana.iconColor}`}
                        >
                          {player.manaPool[mana.symbol as keyof typeof player.manaPool]}
                        </motion.span>
                        <div className="flex gap-2 mt-3 w-full">
                          <motion.div whileTap={{ scale: 0.9 }}>
                            <Button 
                              variant="ghost"
                              size="icon"
                              className={`h-12 w-12 bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/20 hover:border-destructive/40 shadow-sm ${
                                player.manaPool[mana.symbol as keyof typeof player.manaPool] === 0 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : ''
                              }`}
                              onClick={() => decrementMana(mana.symbol)}
                              disabled={player.manaPool[mana.symbol as keyof typeof player.manaPool] === 0}
                              title="Use mana"
                            >
                              <Minus className="h-5 w-5" />
                            </Button>
                          </motion.div>
                          <motion.div whileTap={{ scale: 0.9 }}>
                            <Button 
                              variant="ghost"
                              size="icon"
                              className="h-12 w-12 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 hover:border-primary/40 shadow-sm"
                              onClick={() => incrementMana(mana.symbol)}
                              title="Add mana"
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="mt-4 pt-2 border-t border-border/30 text-center text-xs text-muted-foreground">
              <p>Your mana pool is filled at the beginning of your turn based on your lands.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="lands" className="mt-0 rounded-xl bg-card/50 backdrop-blur-sm pt-4 px-4 pb-3 border border-border/30 shadow-sm">
            {/* Land type buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {LAND_TYPES.map(land => (
                <motion.div
                  key={land.type}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0.9, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Button 
                    variant="ghost"
                    size="icon"
                    className={`h-12 w-12 ${land.bgClassName} border-2 border-border/40 hover:border-primary/40 hover:bg-background hover:shadow-md transition-all duration-200 shadow rounded-xl`}
                    onClick={() => handleAddLand(land)}
                    title={land.type}
                  >
                    <span className={`text-lg ${land.iconColor}`}>{land.symbol}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
            
            {/* Lands display */}
            <div className="bg-card/80 p-3 rounded-xl border border-border/40 shadow-inner">
              <div className="flex flex-wrap gap-2 justify-center">
                {player.lands.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 text-center w-full">
                    <p>No lands yet. Add some above.</p>
                  </div>
                ) : (
                  player.lands.map(land => {
                    const landType = LAND_TYPES.find(l => l.type === land.type);
                    return (
                      <motion.div 
                        key={land.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: land.tapped ? 1.05 : 1.08 }}
                        className={`w-12 h-15 border-2 border-input/40 rounded-xl flex items-center justify-center relative cursor-pointer group ${landType?.bgClassName} ${
                          land.tapped 
                            ? 'transform rotate-90 opacity-70 hover:opacity-90' 
                            : 'hover:border-input hover:shadow-lg'
                        } ${
                          tappedLandId === land.id 
                            ? 'animate-pulse border-primary' 
                            : ''
                        } transition-all duration-300`}
                        style={{ 
                          backgroundImage: land.tapped ? 'linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.08))' : '' 
                        }}
                        onClick={() => handleToggleLand(land.id)}
                      >
                        <span className={`text-xl ${landType?.iconColor || ''}`}>{landType?.symbol}</span>
                        <div className="absolute bottom-1 left-0 right-0 text-center">
                          <span className="text-[10px] font-medium text-muted-foreground/80">
                            {land.type.substring(0, 1)}
                          </span>
                        </div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button 
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 p-0 border border-destructive/30 hover:border-destructive shadow-sm z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveLand(land.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Remove Lands section */}
            {player.lands.length > 0 && (
              <motion.div 
                className="mt-5 pt-4 border-t border-border/30"
                initial={{ opacity: 0.9, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
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
                      <motion.div
                        key={`remove-${land.type}`}
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button
                          variant="outline"
                          size="default"
                          className={`h-11 py-2 px-3 ${land.bgClassName} border-2 border-border/40 hover:bg-destructive/10 hover:border-destructive/40 shadow-md rounded-xl`}
                          onClick={() => handleRemoveLandByType(land.type)}
                        >
                          <span className={`mr-2 text-lg ${land.iconColor}`}>{land.symbol}</span>
                          <span className="font-medium text-sm bg-background/40 rounded-full min-w-[1.5rem] h-6 inline-flex items-center justify-center px-1.5 border border-border/30">
                            {count}
                          </span>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground text-center mt-3 mb-1">
                  Click to remove one land of that type
                </p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Player; 