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
  Users,
  Smartphone,
  Check,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGameStore } from "@/stores/gameStore";
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
  // Get state and actions from the game store
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const continueSavedGame = useGameStore((state) => state.continueSavedGame);
  const hasSavedGame = useGameStore((state) => state.hasSavedGame);
  const settings = useGameStore((state) => state.settings);
  
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
    startGame(newPlayers, isSinglePlayerMode, playerPosition);
  };

  // Check if there are duplicate profiles selected
  const hasDuplicateProfiles = () => {
    const profileIds = selectedPlayers
      .map((p) => p.profile?.id)
      .filter((id) => id); // Remove nulls
    const uniqueIds = new Set(profileIds);
    return profileIds.length !== uniqueIds.size;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-border bg-card/50 backdrop-blur-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
          Auto-Magic-Ator 5000
        </h1>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/40 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Start a New Game</span>
                {hasSavedGame && (
                  <HelpTooltip
                    content={
                      "You have a saved game in progress. You can continue it or start a new one."
                    }
                  />
                )}
              </CardTitle>
              <CardDescription>
                Configure players and options before starting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Game Mode Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="single-player" className="text-sm font-medium">
                  Game Mode
                </Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-md border border-border/50 bg-card">
                    <Users className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <Label
                        htmlFor="multi-player"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Multiplayer Mode
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        All players share this device
                      </p>
                    </div>
                    <Switch
                      id="multi-player"
                      checked={!isSinglePlayerMode}
                      onCheckedChange={(checked) =>
                        setIsSinglePlayerMode(!checked)
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2 px-3 py-2 rounded-md border border-border/50 bg-card">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <Label
                        htmlFor="single-player"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Single Player Mode
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        You're the only one using this device
                      </p>
                    </div>
                    <Switch
                      id="single-player"
                      checked={isSinglePlayerMode}
                      onCheckedChange={(checked) =>
                        setIsSinglePlayerMode(checked)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Players */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Players</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPlayer}
                    className="h-7 text-xs"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    Add Player
                  </Button>
                </div>

                {/* Player position selector for single player mode */}
                {isSinglePlayerMode && selectedPlayers.length > 1 && (
                  <div className="space-y-1.5 mb-2">
                    <Label className="text-xs text-muted-foreground">
                      Your Position
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPlayers.map((_, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant={
                            playerPosition === index ? "default" : "outline"
                          }
                          className={`h-7 w-7 p-0 ${
                            playerPosition === index
                              ? "bg-primary text-primary-foreground"
                              : "border-border/50"
                          }`}
                          onClick={() => setPlayerPosition(index)}
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Player list */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {selectedPlayers.map((player, index) => (
                    <motion.div
                      key={player.tempId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className={`border border-border/40 ${
                          isSinglePlayerMode && index === playerPosition
                            ? "bg-primary/5 border-primary/20"
                            : ""
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {/* Position badge for single player mode */}
                              {isSinglePlayerMode && index === playerPosition && (
                                <div className="bg-primary/20 px-1.5 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                  <span>You</span>
                                  <Check className="h-3 w-3" />
                                </div>
                              )}

                              {/* Player name or input */}
                              {player.isEditingName ? (
                                <Input
                                  className="h-8 text-sm"
                                  value={player.customName}
                                  onChange={(e) =>
                                    updateCustomName(index, e.target.value)
                                  }
                                  onBlur={() => finishEditingName(index)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      finishEditingName(index);
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <div
                                  className="flex items-center gap-1.5 cursor-pointer group"
                                  onClick={() => startEditingName(index)}
                                >
                                  <span className="font-medium">
                                    {player.customName}
                                  </span>
                                  <Edit className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60" />
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Profile button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 px-2 text-xs ${
                                  player.profile
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted hover:bg-muted"
                                }`}
                                onClick={() => openProfileDialog(index)}
                              >
                                <User className="h-3.5 w-3.5 mr-1.5" />
                                {player.profile ? player.profile.name : "Profile"}
                              </Button>

                              {/* Remove button - don't show if it would go below minimum players */}
                              {(selectedPlayers.length >
                                (isSinglePlayerMode ? 2 : 1) ||
                                index > 0) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => removePlayer(player.tempId)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              <AnimatePresence>
                {hasDuplicateProfiles() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-destructive text-xs flex items-center gap-1.5 px-2 py-1 bg-destructive/10 rounded"
                  >
                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                      You have duplicate profiles. Each player should have a
                      unique profile.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <div className="w-full flex gap-2">
                <Button
                  className="flex-1 gap-1.5"
                  onClick={handleStartGame}
                  disabled={selectedPlayers.length === 0}
                >
                  <Play className="h-4 w-4" />
                  Start Game
                </Button>

                {hasSavedGame && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5"
                    onClick={continueSavedGame}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Continue Saved
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Starting life: {settings.startingLife} •{" "}
                {settings.chessClockMode === "standard"
                  ? `${settings.chessClockMinutes}min timer`
                  : `${settings.chessClockMinutes}min (+${settings.timeIncrement}s)`}
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </main>

      {/* Profile selection dialog */}
      <Dialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ProfileSelector onSelectProfile={handleSelectProfile} />
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Game?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              You have a game in progress. Starting a new game will overwrite your
              saved game.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={startNewGame}>Start New Game</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Panel */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Game Settings</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <SettingsPanel open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="default">Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainMenu; 