import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronUp, User, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerData } from '../../types';
import { useGame } from '../../context/GameContext';

interface PlayerSelectorProps {
  players: PlayerData[];
  displayedPlayerIndex: number;
  activePlayerIndex: number;
  onSelectPlayer: (index: number) => void;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  players,
  displayedPlayerIndex,
  activePlayerIndex,
  onSelectPlayer
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSinglePlayerMode, actualPlayerIndex } = useGame();
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  
  const handleSelectPlayer = (index: number) => {
    onSelectPlayer(index);
    setIsOpen(false);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-popover border-t border-border max-h-56 overflow-y-auto"
          >
            <div className="p-3 grid grid-cols-4 gap-2 max-w-sm mx-auto">
              {players.map((player, index) => {
                const isYourPlayer = isSinglePlayerMode && index === actualPlayerIndex;
                const isPhantom = player.isPhantom;
                
                return (
                  <Button
                    key={player.id}
                    variant={displayedPlayerIndex === index ? "default" : "outline"}
                    size="sm"
                    className={`h-auto py-2 flex-col items-center justify-center ${
                      activePlayerIndex === index ? "border-primary/60" : ""
                    } ${isPhantom ? "opacity-70" : ""}`}
                    onClick={() => handleSelectPlayer(index)}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full ${
                        isYourPlayer 
                          ? "bg-primary-foreground border-2 border-primary" 
                          : activePlayerIndex === index 
                            ? "bg-primary" 
                            : "bg-muted"
                      } flex items-center justify-center mb-1`}>
                        {isYourPlayer ? (
                          <Smartphone className="h-4 w-4 text-primary" />
                        ) : (
                          <User className={`h-4 w-4 ${
                            activePlayerIndex === index ? "text-primary-foreground" : "text-muted-foreground"
                          }`} />
                        )}
                      </div>
                      <div className={`text-xs font-medium truncate max-w-full ${
                        isPhantom ? "italic text-muted-foreground" : ""
                      }`}>
                        {player.name}
                        {isPhantom && " (AI)"}
                      </div>
                      {isYourPlayer && (
                        <div className="text-[10px] text-primary">
                          You
                        </div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Button
        onClick={toggleOpen}
        variant="secondary"
        className="w-full rounded-none h-12 shadow flex items-center justify-center gap-1 border-t border-border"
      >
        <ChevronUp className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <span>Players</span>
      </Button>
    </div>
  );
};

export default PlayerSelector; 