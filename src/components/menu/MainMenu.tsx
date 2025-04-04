import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PlusCircle, User, Trash2, Edit, Play, Info, RotateCcw, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGame } from '../../context/GameContext';
import { useProfiles } from '../../context/ProfileContext';
import { PlayerData, Profile } from '../../types';
import ProfileSelector from '../profile/ProfileSelector';

interface SelectedPlayer {
  tempId: number;
  profile: Profile | null;
  isEditingName: boolean;
  customName: string;
}

export const MainMenu: React.FC = () => {
  const { startGame, continueSavedGame, hasSavedGame, resetGame } = useGame();
  const { profiles, lastUsedProfileId } = useProfiles();
  
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([
    { tempId: 1, profile: null, isEditingName: false, customName: 'Player 1' },
    { tempId: 2, profile: null, isEditingName: false, customName: 'Player 2' }
  ]);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  const [isConfirmNewGameOpen, setIsConfirmNewGameOpen] = useState(false);

  // Restore last used profile for player 1 if available
  useEffect(() => {
    if (lastUsedProfileId && profiles.length > 0) {
      const lastProfile = profiles.find(p => p.id === lastUsedProfileId);
      if (lastProfile) {
        setSelectedPlayers(prev => {
          const updated = [...prev];
          if (updated[0]) {
            updated[0] = {
              ...updated[0],
              profile: lastProfile,
              customName: lastProfile.name
            };
          }
          return updated;
        });
      }
    }
  }, [lastUsedProfileId, profiles]);
  
  // Handle profile selection
  const handleSelectProfile = (profile: Profile) => {
    if (currentEditingIndex !== null) {
      setSelectedPlayers(prev => {
        const updated = [...prev];
        updated[currentEditingIndex] = {
          ...updated[currentEditingIndex],
          profile: profile,
          customName: profile.name
        };
        return updated;
      });
      
      setIsProfileDialogOpen(false);
      setCurrentEditingIndex(null);
    }
  };
  
  // Add a new player
  const addPlayer = () => {
    const newTempId = Math.max(...selectedPlayers.map(p => p.tempId)) + 1;
    setSelectedPlayers([...selectedPlayers, { 
      tempId: newTempId, 
      profile: null, 
      isEditingName: false,
      customName: `Player ${newTempId}`
    }]);
  };
  
  // Remove a player
  const removePlayer = (tempId: number) => {
    if (selectedPlayers.length <= 1) return;
    setSelectedPlayers(selectedPlayers.filter(p => p.tempId !== tempId));
  };
  
  // Start editing a custom name
  const startEditingName = (index: number) => {
    setSelectedPlayers(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isEditingName: true
      };
      return updated;
    });
  };
  
  // Update custom name
  const updateCustomName = (index: number, name: string) => {
    setSelectedPlayers(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        customName: name
      };
      return updated;
    });
  };
  
  // Finish editing name
  const finishEditingName = (index: number) => {
    setSelectedPlayers(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isEditingName: false,
        // Ensure name isn't empty
        customName: updated[index].customName.trim() || `Player ${updated[index].tempId}`
      };
      return updated;
    });
  };
  
  // Open profile selection dialog for a specific player
  const openProfileDialog = (index: number) => {
    setCurrentEditingIndex(index);
    setIsProfileDialogOpen(true);
  };
  
  // Start a new game with the selected players
  const handleStartGame = () => {
    // If there's a saved game, confirm before starting a new one
    if (hasSavedGame) {
      setIsConfirmNewGameOpen(true);
    } else {
      startNewGame();
    }
  };

  // Start a new game (after confirmation if needed)
  const startNewGame = () => {
    const players: PlayerData[] = selectedPlayers.map((selectedPlayer, index) => ({
      id: index + 1,
      name: selectedPlayer.customName,
      life: 20,
      lands: [],
      manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
      profileId: selectedPlayer.profile?.id
    }));
    
    setIsConfirmNewGameOpen(false);
    resetGame(); // Clear any existing game first
    startGame(players);
  };
  
  // Check if any profiles are being used by multiple players
  const hasDuplicateProfiles = () => {
    const usedProfileIds = selectedPlayers
      .filter(p => p.profile !== null)
      .map(p => p.profile!.id);
    
    return usedProfileIds.length !== new Set(usedProfileIds).size;
  };
  
  const duplicateProfileWarning = hasDuplicateProfiles();
  
  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">MTG Companion</h1>
        <ThemeToggle />
      </div>
      
      <div className="max-w-md mx-auto w-full">
        {/* Continue Game Button (shown only when a saved game exists) */}
        {hasSavedGame && (
          <Card className="mb-4">
            <CardContent className="pt-6 pb-4">
              <Button 
                className="w-full gap-2 mb-2"
                size="lg"
                variant="default"
                onClick={continueSavedGame}
              >
                <Clock className="h-5 w-5" />
                Continue Saved Game
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Resume your last game in progress
              </p>
            </CardContent>
          </Card>
        )}
      
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Game Setup</span>
              {duplicateProfileWarning && (
                <div className="text-sm text-yellow-500 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  <span>Duplicate profiles</span>
                </div>
              )}
            </CardTitle>
            <CardDescription>Select profiles or create new ones for each player</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPlayers.map((player, index) => (
              <div 
                key={player.tempId}
                className="flex items-center gap-3 rounded-md border border-border p-3"
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {player.profile ? (
                    <User className="h-5 w-5 text-primary" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1">
                  {player.isEditingName ? (
                    <Input
                      value={player.customName}
                      onChange={(e) => updateCustomName(index, e.target.value)}
                      onBlur={() => finishEditingName(index)}
                      onKeyDown={(e) => e.key === 'Enter' && finishEditingName(index)}
                      autoFocus
                      className="h-8"
                    />
                  ) : (
                    <div>
                      <div 
                        className="font-medium cursor-pointer hover:text-primary"
                        onClick={() => startEditingName(index)}
                      >
                        {player.customName || `Player ${player.tempId}`}
                      </div>
                      {player.profile && (
                        <div className="text-xs text-muted-foreground">
                          Profile: {player.profile.name}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openProfileDialog(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  {selectedPlayers.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removePlayer(player.tempId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full mt-2 gap-1"
              onClick={addPlayer}
            >
              <PlusCircle className="h-4 w-4" />
              Add Player
            </Button>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full gap-2"
              size="lg"
              onClick={handleStartGame}
            >
              <Play className="h-4 w-4" />
              {hasSavedGame ? "Start New Game" : "Start Game"} ({selectedPlayers.length} Players)
            </Button>
          </CardFooter>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Long press on a profile to edit or delete it.</p>
        </div>
      </div>
      
      {/* Profile Selection Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-[350px] p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>
              Select Profile for {currentEditingIndex !== null 
                ? selectedPlayers[currentEditingIndex]?.customName 
                : 'Player'}
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 py-2">
            <ProfileSelector 
              onSelectProfile={handleSelectProfile}
              currentProfileId={currentEditingIndex !== null 
                ? selectedPlayers[currentEditingIndex]?.profile?.id 
                : undefined}
            />
          </div>
          <DialogFooter className="p-4 border-t">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm New Game Dialog */}
      <Dialog open={isConfirmNewGameOpen} onOpenChange={setIsConfirmNewGameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Game?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>You have a game in progress. Starting a new game will replace your current game.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Do you want to continue with the new game?
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={startNewGame}
              className="gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              New Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 