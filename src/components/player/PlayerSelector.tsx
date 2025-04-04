import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronUp, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerData } from '../../types';

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
              {players.map((player, index) => (
                <Button
                  key={player.id}
                  variant={displayedPlayerIndex === index ? "default" : "outline"}
                  size="sm"
                  className={`h-auto py-2 flex-col items-center justify-center ${
                    activePlayerIndex === index ? "border-primary/60" : ""
                  }`}
                  onClick={() => handleSelectPlayer(index)}
                >
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full ${
                      activePlayerIndex === index ? "bg-primary" : "bg-muted"
                    } flex items-center justify-center mb-1`}>
                      <User className={`h-4 w-4 ${
                        activePlayerIndex === index ? "text-primary-foreground" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="text-xs font-medium truncate max-w-full">
                      {player.name}
                    </div>
                  </div>
                </Button>
              ))}
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