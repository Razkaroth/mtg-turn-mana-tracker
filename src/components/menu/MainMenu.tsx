import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import {
  PlusCircle,
  User,
  Trash2,
  Edit,
  Play,
  Info,
  RotateCcw,
  Clock,
  Users,
  Smartphone,
  Check,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGame } from "../../context/GameContext";
import { useProfiles } from "../../context/ProfileContext";
import { PlayerData, Profile } from "../../types";
import ProfileSelector from "../profile/ProfileSelector";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import SettingsPanel from "../game/SettingsPanel";
import { HelpTooltip } from "../ui/help-tooltip";

interface SelectedPlayer {
  tempId: number;
  profile: Profile | null;
  isEditingName: boolean;
  customName: string;
}

export const MainMenu: React.FC = () => {
  const { startGame, continueSavedGame, hasSavedGame, resetGame, settings } =
    useGame();
  const { profiles, lastUsedProfileId } = useProfiles();

  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([
    { tempId: 1, profile: null, isEditingName: false, customName: "Player 1" },
    { tempId: 2, profile: null, isEditingName: false, customName: "Player 2" },
  ]);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(
    null
  );
  const [isConfirmNewGameOpen, setIsConfirmNewGameOpen] = useState(false);

  // Settings panel state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Single player mode state
  const [isSinglePlayerMode, setIsSinglePlayerMode] = useState(false);
  const [playerPosition, setPlayerPosition] = useState(0); // Player's position in turn order (as number)

  // Restore last used profile for player 1 if available
  useEffect(() => {
    if (lastUsedProfileId && profiles.length > 0) {
      const lastProfile = profiles.find((p) => p.id === lastUsedProfileId);
      if (lastProfile) {
        setSelectedPlayers((prev) => {
          const updated = [...prev];
          if (updated[0]) {
            updated[0] = {
              ...updated[0],
              profile: lastProfile,
              customName: lastProfile.name,
            };
          }
          return updated;
        });
      }
    }
  }, [lastUsedProfileId, profiles]);

  // When single player mode is toggled, ensure we have at least 2 players for a meaningful game
  useEffect(() => {
    if (isSinglePlayerMode && selectedPlayers.length < 2) {
      // Add players to reach at least 2 total players
      const currentCount = selectedPlayers.length;
      const additionalNeeded = 2 - currentCount;

      if (additionalNeeded > 0) {
        const highestId = Math.max(...selectedPlayers.map((p) => p.tempId));
        const newPlayers = Array.from({ length: additionalNeeded }, (_, i) => ({
          tempId: highestId + i + 1,
          profile: null,
          isEditingName: false,
          customName: `Remote Player ${i + 1}`,
        }));

        setSelectedPlayers((prev) => [...prev, ...newPlayers]);
      }
    }
  }, [isSinglePlayerMode, selectedPlayers.length]);

  // Adjust player position when player count changes or single player mode changes
  useEffect(() => {
    // Ensure playerPosition is valid
    const maxPosition = selectedPlayers.length - 1;
    if (playerPosition > maxPosition) {
      setPlayerPosition(0);
    }
  }, [selectedPlayers.length, playerPosition, isSinglePlayerMode]);

  // Handle profile selection
  const handleSelectProfile = (profile: Profile) => {
    if (currentEditingIndex !== null) {
      setSelectedPlayers((prev) => {
        const updated = [...prev];
        updated[currentEditingIndex] = {
          ...updated[currentEditingIndex],
          profile: profile,
          customName: profile.name,
        };
        return updated;
      });

      setIsProfileDialogOpen(false);
      setCurrentEditingIndex(null);
    }
  };

  // Add a new player
  const addPlayer = () => {
    const newTempId = Math.max(...selectedPlayers.map((p) => p.tempId)) + 1;
    setSelectedPlayers([
      ...selectedPlayers,
      {
        tempId: newTempId,
        profile: null,
        isEditingName: false,
        customName: isSinglePlayerMode
          ? `Remote Player ${selectedPlayers.length}`
          : `Player ${newTempId}`,
      },
    ]);
  };

  // Remove a player
  const removePlayer = (tempId: number) => {
    if (selectedPlayers.length <= (isSinglePlayerMode ? 2 : 1)) return; // Prevent having less than 2 players in single player mode
    setSelectedPlayers(selectedPlayers.filter((p) => p.tempId !== tempId));
  };

  // Start editing a custom name
  const startEditingName = (index: number) => {
    setSelectedPlayers((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isEditingName: true,
      };
      return updated;
    });
  };

  // Update custom name
  const updateCustomName = (index: number, name: string) => {
    setSelectedPlayers((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        customName: name,
      };
      return updated;
    });
  };

  // Finish editing name
  const finishEditingName = (index: number) => {
    setSelectedPlayers((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isEditingName: false,
        // Ensure name isn't empty
        customName:
          updated[index].customName.trim() || `Player ${updated[index].tempId}`,
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
    // Print settings to verify they're correct
    console.log("Current settings before starting game:", settings);
    console.log("Starting new game with starting life:", settings.startingLife);

    // First reset the game state
    resetGame();

    // Then explicitly create and set the players with current settings
    const newPlayers: PlayerData[] = selectedPlayers.map(
      (selectedPlayer, index) => {
        // Create a new player with explicit settings
        const newPlayer: PlayerData = {
          id: index + 1,
          name: selectedPlayer.customName,
          life: settings.startingLife, // Explicitly use settings.startingLife
          lands: [],
          manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
          profileId: selectedPlayer.profile?.id,
          isPhantom: isSinglePlayerMode && index !== playerPosition,
        };

        console.log(
          `Created player ${newPlayer.name} with life: ${newPlayer.life}`
        );
        return newPlayer;
      }
    );

    setIsConfirmNewGameOpen(false);

    // Start the game with the newly created players
    startGame(newPlayers, isSinglePlayerMode, playerPosition);
  };

  // Check if any profiles are being used by multiple players
  const hasDuplicateProfiles = () => {
    const usedProfileIds = selectedPlayers
      .filter((p) => p.profile !== null)
      .map((p) => p.profile!.id);

    return usedProfileIds.length !== new Set(usedProfileIds).size;
  };

  const duplicateProfileWarning = hasDuplicateProfiles();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">
          Auto-Magic-Ator 5000
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-9 px-0"
            onClick={() => setIsSettingsOpen(true)}
            title="Game Settings"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Game Settings</span>
          </Button>
          <ThemeToggle />
        </div>
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
              <div className="flex items-center gap-1">
                <span>Game Setup</span>
                <HelpTooltip
                  content={
                    <div className="space-y-2">
                      <p>
                        <strong>Game Modes:</strong>
                      </p>
                      <p>
                        <strong>Single Player Mode:</strong> Track a game where
                        you're the only real player using this device. Choose
                        this if each player has their own device.
                      </p>
                      <p>
                        <strong>Multiplayer Mode:</strong> Play with friends,
                        passing the device between players during their
                        respective turns.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        You can add as many players as you want, and select
                        player profiles to track stats across games.
                      </p>
                    </div>
                  }
                />
              </div>
              {duplicateProfileWarning && (
                <div className="text-sm text-yellow-500 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  <span>Duplicate profiles</span>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Select profiles or create new ones for each player
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Game Mode Selector */}
            <div className="flex flex-col space-y-4">
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <Label
                    htmlFor="single-player-mode"
                    className="text-base font-medium flex items-center gap-2"
                  >
                    {isSinglePlayerMode ? (
                      <>
                        <Smartphone className="h-4 w-4 text-primary" />
                        <span>Single Player Mode</span>
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 text-primary" />
                        <span>Multiplayer Mode</span>
                      </>
                    )}
                  </Label>
                  <Switch
                    id="single-player-mode"
                    checked={isSinglePlayerMode}
                    onCheckedChange={setIsSinglePlayerMode}
                  />
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  {isSinglePlayerMode
                    ? "Track your game from your perspective. Only you control this device."
                    : "Play with friends, each taking turns on this device."}
                </p>

                {/* Player position selector (only in single player mode) */}
                <AnimatePresence>
                  {isSinglePlayerMode && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-border/40">
                        <Label className="text-sm font-medium block mb-2">
                          Select your position in turn order:
                        </Label>
                        <div className="grid grid-cols-4 gap-2">
                          {selectedPlayers.map((player, index) => (
                            <div
                              key={index}
                              className={`flex flex-col items-center justify-center rounded-md border cursor-pointer p-2 
                                ${
                                  playerPosition === index
                                    ? "bg-primary/10 border-primary/40"
                                    : "border-border hover:bg-muted/50"
                                }`}
                              onClick={() => setPlayerPosition(index)}
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center 
                                  ${
                                    playerPosition === index
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                              >
                                {playerPosition === index ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <span className="text-sm font-medium">
                                    {index + 1}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs mt-1 text-center truncate w-full">
                                {player.customName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Player list */}
            {selectedPlayers.map((player, index) => (
              <div
                key={player.tempId}
                className={`flex items-center gap-3 rounded-md border p-3 ${
                  isSinglePlayerMode && playerPosition === index
                    ? "border-primary/40 bg-primary/5"
                    : "border-border"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSinglePlayerMode && playerPosition === index
                      ? "bg-primary/20"
                      : "bg-muted"
                  }`}
                >
                  {isSinglePlayerMode && playerPosition === index ? (
                    <Smartphone className="h-5 w-5 text-primary" />
                  ) : player.profile ? (
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
                      onKeyDown={(e) =>
                        e.key === "Enter" && finishEditingName(index)
                      }
                      autoFocus
                      className="h-8"
                    />
                  ) : (
                    <div>
                      <div
                        className="font-medium cursor-pointer hover:text-primary"
                        onClick={() => startEditingName(index)}
                      >
                        {player.customName}
                        {isSinglePlayerMode && playerPosition === index && (
                          <span className="text-xs bg-primary/20 text-primary ml-2 px-1.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                        {isSinglePlayerMode && playerPosition !== index && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (Remote)
                          </span>
                        )}
                      </div>
                      {player.profile && (
                        <div className="text-xs text-muted-foreground">
                          Using profile: {player.profile.name}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {(!isSinglePlayerMode || playerPosition !== index) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted hover:text-destructive"
                      onClick={() => removePlayer(player.tempId)}
                      disabled={
                        selectedPlayers.length <= (isSinglePlayerMode ? 2 : 1)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-muted"
                    onClick={() => openProfileDialog(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add player button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-1.5"
              onClick={addPlayer}
            >
              <PlusCircle className="h-4 w-4" />
              Add {isSinglePlayerMode ? "Opponent" : "Player"}
            </Button>
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleStartGame}
            >
              <Play className="h-5 w-5" />
              Start Game
            </Button>
          </CardFooter>
        </Card>

        {/* Footer information */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Auto-Magic-Ator 5000 by Raz</p>
          <p className="text-xs">
            A Magic: The Gathering turn and mana tracker
          </p>
          <p className="text-xs">
            Because I'm too lazy to keep tapping and untapping my lands
          </p>
        </div>
      </div>

      {/* Profile selection dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ProfileSelector
              onSelectProfile={handleSelectProfile}
              currentProfileId={
                currentEditingIndex !== null &&
                selectedPlayers[currentEditingIndex].profile
                  ? selectedPlayers[currentEditingIndex].profile?.id
                  : undefined
              }
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm new game dialog */}
      <Dialog
        open={isConfirmNewGameOpen}
        onOpenChange={setIsConfirmNewGameOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Game?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              You have a saved game in progress. Starting a new game will
              overwrite your saved game.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="default" onClick={startNewGame} className="gap-1">
              <RotateCcw className="h-4 w-4" />
              New Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Panel */}
      <SettingsPanel open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
};
